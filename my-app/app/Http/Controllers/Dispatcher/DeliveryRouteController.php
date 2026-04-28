<?php

namespace App\Http\Controllers\Dispatcher;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Dispatcher\Concerns\ParsesSearchFilters;
use App\Http\Requests\Dispatcher\AssignRouteOrdersRequest;
use App\Http\Requests\Dispatcher\ReorderRouteStopsRequest;
use App\Http\Requests\Dispatcher\StoreDeliveryRouteRequest;
use App\Models\DeliveryRoute;
use App\Models\Order;
use App\Models\Organization;
use App\Models\RouteStop;
use App\Models\User;
use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DeliveryRouteController extends Controller
{
    use ParsesSearchFilters;

    /**
     * @var list<string>
     */
    private const ASSIGNABLE_ORDER_STATUSES = ['NEW', 'PENDING'];

    /**
     * @var list<string>
     */
    private const ROUTE_STATUSES = ['PLANNED', 'IN_PROGRESS', 'DONE'];

    public function index(Request $request): Response
    {
        $this->authorizeDispatcherAccess($request);
        $this->authorize('viewAny', DeliveryRoute::class);

        $filters = [
            'search' => $request->string('search')->toString(),
            'date' => $request->string('date')->toString(),
            'status' => $request->string('status')->toString(),
            'organization_id' => $request->user()->isAdmin()
                ? $request->string('organization_id')->toString()
                : '',
            'sort' => $this->normalizeRouteSort($request->string('sort')->toString()),
        ];

        return Inertia::render('dispatcher/routes/index', [
            'deliveryRoutes' => $this->filteredRoutesQuery($request, $filters)
                ->get([
                    'routes.id',
                    'routes.organization_id',
                    'routes.courier_user_id',
                    'routes.date',
                    'routes.status',
                    'routes.updated_at',
                ])
                ->map(fn (DeliveryRoute $deliveryRoute) => $this->formatRoute($deliveryRoute)),
            'filters' => $filters,
            'statuses' => self::ROUTE_STATUSES,
            'organizations' => $request->user()->isAdmin() ? $this->organizationsForUser($request) : [],
            'canFilterByOrganization' => $request->user()->isAdmin(),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorizeDispatcherAccess($request);
        $this->authorize('create', DeliveryRoute::class);

        return Inertia::render('dispatcher/routes/create', [
            'organizations' => $this->organizationsForUser($request),
            'couriers' => $this->couriersForUser($request),
            'orders' => $this->unassignedOrdersForUser($request),
            'canSelectOrganization' => $request->user()->isAdmin(),
            'todayDate' => Carbon::today()->toDateString(),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $this->authorizeDispatcherAccess($request);
        $this->authorize('viewAny', DeliveryRoute::class);

        $filters = [
            'search' => $request->string('search')->toString(),
            'date' => $request->string('date')->toString(),
            'status' => $request->string('status')->toString(),
            'organization_id' => $request->user()->isAdmin()
                ? $request->string('organization_id')->toString()
                : '',
            'sort' => $this->normalizeRouteSort($request->string('sort')->toString()),
        ];

        $deliveryRoutes = $this->filteredRoutesQuery($request, $filters)
            ->with([
                'organization:id,name',
                'routeStops' => fn ($query) => $query->orderBy('seq_no'),
                'routeStops.order.client:id,name',
                'routeStops.order.address:id,city,street',
            ])
            ->get();

        return response()->streamDownload(function () use ($deliveryRoutes): void {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                __('reports.routes.headers.route_id'),
                __('reports.routes.headers.organization'),
                __('reports.routes.headers.courier'),
                __('reports.routes.headers.date'),
                __('reports.routes.headers.route_status'),
                __('reports.routes.headers.stop_seq'),
                __('reports.routes.headers.order_id'),
                __('reports.routes.headers.client'),
                __('reports.routes.headers.address'),
                __('reports.routes.headers.stop_status'),
                __('reports.routes.headers.planned_eta'),
            ]);

            foreach ($deliveryRoutes as $deliveryRoute) {
                if ($deliveryRoute->routeStops->isEmpty()) {
                    fputcsv($handle, [
                        $deliveryRoute->id,
                        $deliveryRoute->organization?->name,
                        $deliveryRoute->courier?->user?->name,
                        $deliveryRoute->date,
                        __('statuses.'.strtolower($deliveryRoute->status)),
                        '',
                        '',
                        '',
                        '',
                        '',
                        '',
                    ]);

                    continue;
                }

                foreach ($deliveryRoute->routeStops as $routeStop) {
                    fputcsv($handle, [
                        $deliveryRoute->id,
                        $deliveryRoute->organization?->name,
                        $deliveryRoute->courier?->user?->name,
                        $deliveryRoute->date,
                        __('statuses.'.strtolower($deliveryRoute->status)),
                        $routeStop->seq_no,
                        $routeStop->order_id,
                        $routeStop->order?->client?->name,
                        collect([$routeStop->order?->address?->city, $routeStop->order?->address?->street])->filter()->join(', '),
                        __('statuses.'.strtolower($routeStop->status)),
                        $routeStop->planned_eta,
                    ]);
                }
            }

            fclose($handle);
        }, __('reports.routes.filename'), [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function store(StoreDeliveryRouteRequest $request): RedirectResponse
    {
        $this->authorizeDispatcherAccess($request);
        $data = $request->validated();
        $organizationId = $request->user()->isAdmin()
            ? (int) $data['organization_id']
            : (int) $request->user()->organization_id;

        $deliveryRoute = DB::transaction(function () use ($data, $organizationId): DeliveryRoute {
            $deliveryRoute = DeliveryRoute::query()->create([
                'organization_id' => $organizationId,
                'courier_user_id' => $data['courier_user_id'],
                'date' => $data['date'],
                'status' => 'PLANNED',
            ]);

            $this->assignOrdersToRoute($deliveryRoute, $data['order_ids'] ?? []);

            return $deliveryRoute;
        });

        return to_route('dispatcher.routes.show', $deliveryRoute);
    }

    public function show(Request $request, DeliveryRoute $deliveryRoute): Response
    {
        $this->authorizeDispatcherAccess($request);
        $this->authorize('view', $deliveryRoute);

        $deliveryRoute->load([
            'courier.user:id,name',
            'routeStops' => fn ($query) => $query->orderBy('seq_no'),
            'routeStops.proofOfDelivery',
            'routeStops.order.client:id,name',
            'routeStops.order.address:id,city,street,lat,lng',
        ]);

        return Inertia::render('dispatcher/routes/show', [
            'deliveryRoute' => $this->formatRoute($deliveryRoute),
            'stops' => $deliveryRoute->routeStops->map(fn (RouteStop $routeStop) => [
                'id' => $routeStop->id,
                'seq_no' => $routeStop->seq_no,
                'order_id' => $routeStop->order_id,
                'planned_eta' => $routeStop->planned_eta,
                'status' => $routeStop->status,
                'can_remove' => $routeStop->status === 'PENDING',
                'proof_view_url' => $routeStop->proofOfDelivery
                    ? route('proof-of-delivery.show', $routeStop->proofOfDelivery)
                    : null,
                'client_name' => $routeStop->order?->client?->name,
                'address_label' => collect([
                    $routeStop->order?->address?->city,
                    $routeStop->order?->address?->street,
                ])->filter()->join(', '),
                'lat' => $routeStop->order?->address?->lat,
                'lng' => $routeStop->order?->address?->lng,
            ]),
            'availableOrders' => $this->unassignedOrdersForOrganization(
                $deliveryRoute->organization_id,
                $deliveryRoute->date,
            ),
        ]);
    }

    public function print(Request $request, DeliveryRoute $deliveryRoute): View
    {
        $this->authorizeDispatcherAccess($request);
        $this->authorize('view', $deliveryRoute);

        $deliveryRoute->load([
            'organization:id,name',
            'courier.user:id,name',
            'routeStops' => fn ($query) => $query->orderBy('seq_no'),
            'routeStops.order.client:id,name',
            'routeStops.order.address:id,city,street',
        ]);

        return view('dispatcher.routes.print', [
            'deliveryRoute' => $deliveryRoute,
        ]);
    }

    public function assignOrders(AssignRouteOrdersRequest $request, DeliveryRoute $deliveryRoute): RedirectResponse
    {
        $this->authorizeDispatcherAccess($request);
        $data = $request->validated();

        DB::transaction(function () use ($deliveryRoute, $data): void {
            $this->assignOrdersToRoute($deliveryRoute, $data['order_ids']);
        });

        return to_route('dispatcher.routes.show', $deliveryRoute);
    }

    public function reorderStops(
        ReorderRouteStopsRequest $request,
        DeliveryRoute $deliveryRoute,
    ): RedirectResponse {
        $this->authorizeDispatcherAccess($request);
        $data = $request->validated();

        DB::transaction(function () use ($deliveryRoute, $data): void {
            $this->reorderRouteStops($deliveryRoute, $data['stop_ids']);
        });

        return to_route('dispatcher.routes.show', $deliveryRoute);
    }

    public function destroyStop(
        Request $request,
        DeliveryRoute $deliveryRoute,
        RouteStop $routeStop,
    ): RedirectResponse {
        $this->authorizeDispatcherAccess($request);
        $this->authorize('view', $deliveryRoute);
        $this->authorize('delete', $routeStop);

        abort_unless((int) $routeStop->route_id === (int) $deliveryRoute->id, 404);

        if ($routeStop->status !== 'PENDING') {
            throw ValidationException::withMessages([
                'route_stop' => __('validation.custom.route_stop.pending_only'),
            ]);
        }

        DB::transaction(function () use ($deliveryRoute, $routeStop): void {
            $routeStop->loadMissing('order');

            $routeStop->order?->update([
                'status' => 'PENDING',
            ]);

            $routeStop->delete();

            $this->resequenceRouteStops($deliveryRoute);
            $this->refreshRouteStatus($deliveryRoute);
        });

        return to_route('dispatcher.routes.show', $deliveryRoute);
    }

    /**
     * @param  array<int, int>  $orderIds
     */
    private function assignOrdersToRoute(DeliveryRoute $deliveryRoute, array $orderIds): void
    {
        if ($orderIds === []) {
            return;
        }

        $nextSequence = ((int) RouteStop::query()
            ->where('route_id', $deliveryRoute->id)
            ->max('seq_no')) + 1;

        $orders = Order::query()
            ->whereIn('id', $orderIds)
            ->where('organization_id', $deliveryRoute->organization_id)
            ->orderBy('date')
            ->orderBy('time_from')
            ->get(['id', 'organization_id', 'date', 'time_from']);

        foreach ($orders as $order) {
            RouteStop::query()->create([
                'organization_id' => $deliveryRoute->organization_id,
                'route_id' => $deliveryRoute->id,
                'seq_no' => $nextSequence,
                'order_id' => $order->id,
                'planned_eta' => Carbon::parse($order->date.' '.$order->time_from),
                'status' => 'PENDING',
            ]);

            $order->update([
                'status' => 'ASSIGNED',
            ]);

            $nextSequence++;
        }
    }

    /**
     * @param  array<int, int>  $stopIds
     */
    private function reorderRouteStops(DeliveryRoute $deliveryRoute, array $stopIds): void
    {
        $routeStops = RouteStop::query()
            ->with('order:id,date,time_from')
            ->where('route_id', $deliveryRoute->id)
            ->whereIn('id', $stopIds)
            ->get()
            ->keyBy('id');

        foreach (array_values($stopIds) as $index => $stopId) {
            $routeStops[$stopId]->update([
                'seq_no' => 1000 + $index + 1,
            ]);
        }

        foreach (array_values($stopIds) as $index => $stopId) {
            $routeStops[$stopId]->update([
                'seq_no' => $index + 1,
                'planned_eta' => $this->plannedEtaForStop($routeStops[$stopId]),
            ]);
        }
    }

    private function resequenceRouteStops(DeliveryRoute $deliveryRoute): void
    {
        $routeStops = RouteStop::query()
            ->with('order:id,date,time_from')
            ->where('route_id', $deliveryRoute->id)
            ->orderBy('seq_no')
            ->get();

        foreach ($routeStops as $index => $routeStop) {
            $routeStop->update([
                'seq_no' => $index + 1,
                'planned_eta' => $this->plannedEtaForStop($routeStop),
            ]);
        }
    }

    private function plannedEtaForStop(RouteStop $routeStop): ?Carbon
    {
        if (! $routeStop->order?->date || ! $routeStop->order?->time_from) {
            return null;
        }

        return Carbon::parse($routeStop->order->date.' '.$routeStop->order->time_from);
    }

    private function refreshRouteStatus(DeliveryRoute $deliveryRoute): void
    {
        $deliveryRoute->load('routeStops');

        $statuses = $deliveryRoute->routeStops->pluck('status');

        if ($statuses->isNotEmpty() && $statuses->every(fn (string $status) => $status === 'COMPLETED')) {
            $deliveryRoute->update([
                'status' => 'DONE',
            ]);

            return;
        }

        if ($statuses->contains(fn (string $status) => $status !== 'PENDING')) {
            $deliveryRoute->update([
                'status' => 'IN_PROGRESS',
            ]);

            return;
        }

        $deliveryRoute->update([
            'status' => 'PLANNED',
        ]);
    }

    /**
     * @return array{id: int, organization_id: int, courier_user_id: int, courier_name: string|null, date: string, status: string, stops_count: int, updated_at: mixed}
     */
    private function formatRoute(DeliveryRoute $deliveryRoute): array
    {
        return [
            'id' => $deliveryRoute->id,
            'organization_id' => $deliveryRoute->organization_id,
            'courier_user_id' => $deliveryRoute->courier_user_id,
            'courier_name' => $deliveryRoute->courier?->user?->name,
            'date' => $deliveryRoute->date,
            'status' => $deliveryRoute->status,
            'stops_count' => (int) ($deliveryRoute->route_stops_count ?? $deliveryRoute->routeStops->count()),
            'updated_at' => $deliveryRoute->updated_at,
        ];
    }

    /**
     * @return \Illuminate\Support\Collection<int, array{id: int, name: string}>
     */
    private function organizationsForUser(Request $request)
    {
        if ($request->user()->isAdmin()) {
            return Organization::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Organization $organization) => $organization->only('id', 'name'));
        }

        return Organization::query()
            ->whereKey($request->user()->organization_id)
            ->get(['id', 'name'])
            ->map(fn (Organization $organization) => $organization->only('id', 'name'));
    }

    /**
     * @return \Illuminate\Support\Collection<int, array{id: int, organization_id: int|null, name: string}>
     */
    private function couriersForUser(Request $request)
    {
        return User::query()
            ->where('role', 'courier')
            ->whereHas('courierProfile')
            ->when(
                ! $request->user()->isAdmin(),
                fn ($query) => $query->where('organization_id', $request->user()->organization_id),
            )
            ->orderBy('name')
            ->get(['id', 'organization_id', 'name'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'organization_id' => $user->organization_id,
                'name' => $user->name,
            ]);
    }

    /**
     * @return \Illuminate\Support\Collection<int, array{id: int, organization_id: int, client_name: string|null, address_label: string, date: string, time_from: string, time_to: string}>
     */
    private function unassignedOrdersForUser(Request $request)
    {
        return Order::query()
            ->with(['client:id,name', 'address:id,city,street'])
            ->visibleTo($request->user())
            ->whereIn('status', self::ASSIGNABLE_ORDER_STATUSES)
            ->whereDoesntHave('routeStops')
            ->orderBy('date')
            ->orderBy('time_from')
            ->get(['id', 'organization_id', 'client_id', 'address_id', 'date', 'time_from', 'time_to'])
            ->map(fn (Order $order) => $this->formatAssignableOrder($order));
    }

    /**
     * @return \Illuminate\Support\Collection<int, array{id: int, organization_id: int, client_name: string|null, address_label: string, date: string, time_from: string, time_to: string}>
     */
    private function unassignedOrdersForOrganization(int $organizationId, ?string $routeDate = null)
    {
        return Order::query()
            ->with(['client:id,name', 'address:id,city,street'])
            ->where('organization_id', $organizationId)
            ->whereIn('status', self::ASSIGNABLE_ORDER_STATUSES)
            ->whereDoesntHave('routeStops')
            ->when(
                $routeDate !== null,
                fn (Builder $query) => $query->whereDate('date', $routeDate),
            )
            ->orderBy('date')
            ->orderBy('time_from')
            ->get(['id', 'organization_id', 'client_id', 'address_id', 'date', 'time_from', 'time_to'])
            ->map(fn (Order $order) => $this->formatAssignableOrder($order));
    }

    /**
     * @return array{id: int, organization_id: int, client_name: string|null, address_label: string, date: string, time_from: string, time_to: string}
     */
    private function formatAssignableOrder(Order $order): array
    {
        return [
            'id' => $order->id,
            'organization_id' => $order->organization_id,
            'client_name' => $order->client?->name,
            'address_label' => collect([$order->address?->city, $order->address?->street])
                ->filter()
                ->join(', '),
            'date' => $order->date,
            'time_from' => $order->time_from,
            'time_to' => $order->time_to,
        ];
    }

    /**
     * @param  array{search: string, date: string, status: string, organization_id: string, sort: string}  $filters
     */
    private function filteredRoutesQuery(Request $request, array $filters): Builder
    {
        $query = DeliveryRoute::query()
            ->with(['courier.user:id,name'])
            ->withCount('routeStops')
            ->visibleTo($request->user())
            ->leftJoin('users as courier_users', 'courier_users.id', '=', 'routes.courier_user_id')
            ->select('routes.*')
            ->when($filters['date'] !== '', fn (Builder $builder) => $builder->whereDate('routes.date', $filters['date']))
            ->when($filters['status'] !== '', fn (Builder $builder) => $builder->where('routes.status', $filters['status']))
            ->when(
                $request->user()->isAdmin() && $filters['organization_id'] !== '',
                fn (Builder $builder) => $builder->where('routes.organization_id', (int) $filters['organization_id']),
            );

        foreach ($this->searchTerms($filters['search']) as $searchTerm) {
            $searchStatus = strtoupper(str_replace(' ', '_', $searchTerm));
            $searchMonth = $this->monthNumberForSearchTerm($searchTerm);

            $query->where(function (Builder $searchQuery) use ($searchTerm, $searchStatus, $searchMonth): void {
                $searchQuery
                    ->where('routes.id', 'like', '%'.$searchTerm.'%')
                    ->orWhere('routes.date', 'like', '%'.$searchTerm.'%')
                    ->orWhere('routes.status', 'like', '%'.$searchTerm.'%')
                    ->orWhere('routes.status', 'like', '%'.$searchStatus.'%')
                    ->orWhere('courier_users.name', 'like', '%'.$searchTerm.'%')
                    ->orWhereHas(
                        'routeStops.order.client',
                        fn (Builder $clientQuery) => $clientQuery->where('name', 'like', '%'.$searchTerm.'%'),
                    )
                    ->orWhereHas(
                        'routeStops.order.address',
                        fn (Builder $addressQuery) => $addressQuery
                            ->where('city', 'like', '%'.$searchTerm.'%')
                            ->orWhere('street', 'like', '%'.$searchTerm.'%'),
                    );

                if ($searchMonth !== null) {
                    $searchQuery->orWhereMonth('routes.date', $searchMonth);
                }
            });
        }

        return $this->applyRouteSort($query, $filters['sort']);
    }

    private function normalizeRouteSort(string $sort): string
    {
        return in_array(
            $sort,
            ['date_desc', 'date_asc', 'courier_asc', 'courier_desc', 'status_asc', 'status_desc', 'updated_desc', 'updated_asc'],
            true,
        ) ? $sort : 'date_desc';
    }

    private function applyRouteSort(Builder $query, string $sort): Builder
    {
        return match ($sort) {
            'date_asc' => $query->orderBy('routes.date')->orderBy('routes.id'),
            'courier_asc' => $query->orderBy('courier_users.name')->orderBy('routes.date'),
            'courier_desc' => $query->orderByDesc('courier_users.name')->orderByDesc('routes.date'),
            'status_asc' => $query->orderBy('routes.status')->orderByDesc('routes.date'),
            'status_desc' => $query->orderByDesc('routes.status')->orderByDesc('routes.date'),
            'updated_desc' => $query->orderByDesc('routes.updated_at'),
            'updated_asc' => $query->orderBy('routes.updated_at'),
            default => $query->orderByDesc('routes.date')->orderBy('routes.id'),
        };
    }

    private function authorizeDispatcherAccess(Request $request): void
    {
        abort_unless(
            $request->user()?->isAdmin() || $request->user()?->isDispatcher(),
            403,
        );
    }
}
