<?php

namespace App\Http\Controllers\Dispatcher;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Dispatcher\Concerns\ParsesSearchFilters;
use App\Http\Requests\Dispatcher\StoreOrderRequest;
use App\Http\Requests\Dispatcher\UpdateOrderRequest;
use App\Models\Address;
use App\Models\Client;
use App\Models\DeliveryRoute;
use App\Models\Order;
use App\Models\Organization;
use App\Models\RouteStop;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderController extends Controller
{
    use ParsesSearchFilters;

    /**
     * @var list<string>
     */
    private const STATUSES = [
        'NEW',
        'PENDING',
        'ASSIGNED',
        'IN_PROGRESS',
        'COMPLETED',
        'FAILED',
        'CANCELLED',
    ];

    public function index(Request $request): Response
    {
        $this->authorizeDispatcherAccess($request);
        $this->authorize('viewAny', Order::class);

        $filters = [
            'search' => $request->string('search')->toString(),
            'date' => $request->string('date')->toString(),
            'status' => $request->string('status')->toString(),
            'organization_id' => $request->user()->isAdmin()
                ? $request->string('organization_id')->toString()
                : '',
            'sort' => $this->normalizeSort($request->string('sort')->toString()),
        ];

        $orders = $this->filteredOrdersQuery($request, $filters)
            ->with(['routeStops.route:id,date,status'])
            ->withCount([
                'routeStops',
                'routeStops as non_pending_route_stops_count' => fn (Builder $query) => $query
                    ->where('status', '!=', 'PENDING'),
            ])
            ->get([
                'id',
                'organization_id',
                'client_id',
                'address_id',
                'date',
                'time_from',
                'time_to',
                'status',
                'notes',
                'updated_at',
            ]);

        return Inertia::render('dispatcher/orders/index', [
            'orders' => $orders
                ->map(fn (Order $order) => [
                    'id' => $order->id,
                    'organization_id' => $order->organization_id,
                    'client_id' => $order->client_id,
                    'address_id' => $order->address_id,
                    'date' => $order->date,
                    'time_from' => $order->time_from,
                    'time_to' => $order->time_to,
                    'status' => $order->status,
                    'notes' => $order->notes,
                    'updated_at' => $order->updated_at,
                    'client_name' => $order->client?->name,
                    'address_label' => collect([$order->address?->city, $order->address?->street])
                        ->filter()
                        ->join(', '),
                    'route_id' => $order->routeStops->first()?->route?->id,
                    'can_cancel' => $this->canCancelOrder($order),
                    'can_delete' => (int) ($order->route_stops_count ?? 0) === 0,
                ]),
            'filters' => $filters,
            'statuses' => self::STATUSES,
            'organizations' => $request->user()->isAdmin() ? $this->organizationsForUser($request) : [],
            'canFilterByOrganization' => $request->user()->isAdmin(),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $this->authorizeDispatcherAccess($request);
        $this->authorize('viewAny', Order::class);

        $filters = [
            'search' => $request->string('search')->toString(),
            'date' => $request->string('date')->toString(),
            'status' => $request->string('status')->toString(),
            'organization_id' => $request->user()->isAdmin()
                ? $request->string('organization_id')->toString()
                : '',
            'sort' => $this->normalizeSort($request->string('sort')->toString()),
        ];

        $orders = $this->filteredOrdersQuery($request, $filters)
            ->with(['organization:id,name'])
            ->get();

        return response()->streamDownload(function () use ($orders): void {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                __('reports.orders.headers.order_id'),
                __('reports.orders.headers.organization'),
                __('reports.orders.headers.client'),
                __('reports.orders.headers.address'),
                __('reports.orders.headers.date'),
                __('reports.orders.headers.time_from'),
                __('reports.orders.headers.time_to'),
                __('reports.orders.headers.status'),
                __('reports.orders.headers.notes'),
            ]);

            foreach ($orders as $order) {
                fputcsv($handle, [
                    $order->id,
                    $order->organization?->name,
                    $order->client?->name,
                    collect([$order->address?->city, $order->address?->street])->filter()->join(', '),
                    $order->date,
                    $order->time_from,
                    $order->time_to,
                    __('statuses.'.strtolower($order->status)),
                    $order->notes,
                ]);
            }

            fclose($handle);
        }, __('reports.orders.filename'), [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorizeDispatcherAccess($request);
        $this->authorize('create', Order::class);

        return Inertia::render('dispatcher/orders/create', [
            'organizations' => $this->organizationsForUser($request),
            'clients' => $this->clientsForUser($request),
            'addresses' => $this->addressesForUser($request),
            'canSelectOrganization' => $request->user()->isAdmin(),
        ]);
    }

    public function store(StoreOrderRequest $request): RedirectResponse
    {
        $this->authorizeDispatcherAccess($request);
        $data = $request->validated();

        Order::query()->create([
            'organization_id' => $request->user()->isAdmin()
                ? $data['organization_id']
                : $request->user()->organization_id,
            'client_id' => $data['client_id'],
            'address_id' => $data['address_id'],
            'date' => $data['date'],
            'time_from' => $data['time_from'],
            'time_to' => $data['time_to'],
            'status' => 'NEW',
            'notes' => $data['notes'] ?? null,
        ]);

        return to_route('dispatcher.orders.index');
    }

    public function edit(Request $request, Order $order): Response
    {
        $this->authorizeDispatcherAccess($request);
        $this->authorize('view', $order);
        $order->load('routeStops.route:id,date,status');
        $assignedRoute = $order->routeStops->first()?->route;

        return Inertia::render('dispatcher/orders/edit', [
            'orderId' => (string) $order->id,
            'order' => $order->only(
                'id',
                'organization_id',
                'client_id',
                'address_id',
                'date',
                'time_from',
                'time_to',
                'status',
                'notes',
            ),
            'assignedRoute' => $assignedRoute === null
                ? null
                : [
                    'id' => $assignedRoute->id,
                    'date' => $assignedRoute->date,
                    'status' => $assignedRoute->status,
                ],
            'organizations' => $this->organizationsForUser($request),
            'clients' => $this->clientsForUser($request),
            'addresses' => $this->addressesForUser($request),
            'canSelectOrganization' => $request->user()->isAdmin(),
        ]);
    }

    public function update(UpdateOrderRequest $request, Order $order): RedirectResponse
    {
        $this->authorizeDispatcherAccess($request);
        $data = $request->validated();

        $order->update([
            'organization_id' => $request->user()->isAdmin()
                ? $data['organization_id']
                : $order->organization_id,
            'client_id' => $data['client_id'],
            'address_id' => $data['address_id'],
            'date' => $data['date'],
            'time_from' => $data['time_from'],
            'time_to' => $data['time_to'],
            'notes' => $data['notes'] ?? null,
        ]);

        $order->load('routeStops');

        foreach ($order->routeStops as $routeStop) {
            $routeStop->update([
                'planned_eta' => $order->date && $order->time_from
                    ? Carbon::parse($order->date.' '.$order->time_from)
                    : null,
            ]);
        }

        return to_route('dispatcher.orders.index');
    }

    public function cancel(Request $request, Order $order): RedirectResponse
    {
        $this->authorizeDispatcherAccess($request);
        $this->authorize('update', $order);

        $order->load([
            'routeStops.route',
        ]);

        if (! $this->canCancelOrder($order)) {
            throw ValidationException::withMessages([
                'order' => __('validation.custom.order.cancel_blocked'),
            ]);
        }

        DB::transaction(function () use ($order): void {
            /** @var Collection<int, DeliveryRoute> $routes */
            $routes = $order->routeStops
                ->pluck('route')
                ->filter()
                ->unique('id')
                ->values();

            $order->routeStops()->delete();

            $order->update([
                'status' => 'CANCELLED',
            ]);

            foreach ($routes as $route) {
                $this->resequenceRouteStops($route);
                $this->refreshRouteStatus($route);
            }
        });

        return to_route('dispatcher.orders.index');
    }

    public function destroy(Request $request, Order $order): RedirectResponse
    {
        $this->authorizeDispatcherAccess($request);
        $this->authorize('delete', $order);

        if ($order->routeStops()->exists()) {
            throw ValidationException::withMessages([
                'order' => __('validation.custom.order.delete_blocked'),
            ]);
        }

        try {
            $order->delete();
        } catch (QueryException) {
            throw ValidationException::withMessages([
                'order' => __('validation.custom.order.delete_blocked'),
            ]);
        }

        return to_route('dispatcher.orders.index');
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
     * @return \Illuminate\Support\Collection<int, array{id: int, name: string, organization_id: int}>
     */
    private function clientsForUser(Request $request)
    {
        return Client::query()
            ->visibleTo($request->user())
            ->orderBy('name')
            ->get(['id', 'organization_id', 'name'])
            ->map(fn (Client $client) => $client->only('id', 'organization_id', 'name'));
    }

    /**
     * @return \Illuminate\Support\Collection<int, array{id: int, organization_id: int, city: string, street: string}>
     */
    private function addressesForUser(Request $request)
    {
        return Address::query()
            ->visibleTo($request->user())
            ->orderBy('city')
            ->orderBy('street')
            ->get(['id', 'organization_id', 'city', 'street'])
            ->map(fn (Address $address) => $address->only('id', 'organization_id', 'city', 'street'));
    }

    private function authorizeDispatcherAccess(Request $request): void
    {
        abort_unless(
            $request->user()?->isAdmin() || $request->user()?->isDispatcher(),
            403,
        );
    }

    /**
     * @param  array{search: string, date: string, status: string, organization_id: string, sort: string}  $filters
     */
    private function filteredOrdersQuery(Request $request, array $filters): Builder
    {
        $query = Order::query()
            ->with(['client:id,name', 'address:id,city,street'])
            ->visibleTo($request->user())
            ->when($filters['date'] !== '', fn (Builder $builder) => $builder->whereDate('date', $filters['date']))
            ->when($filters['status'] !== '', fn (Builder $builder) => $builder->where('status', $filters['status']))
            ->when(
                $request->user()->isAdmin() && $filters['organization_id'] !== '',
                fn (Builder $builder) => $builder->where('organization_id', (int) $filters['organization_id']),
            );

        foreach ($this->searchTerms($filters['search']) as $searchTerm) {
            $searchStatus = strtoupper(str_replace(' ', '_', $searchTerm));
            $searchMonth = $this->monthNumberForSearchTerm($searchTerm);

            $query->where(function (Builder $searchQuery) use ($searchTerm, $searchStatus, $searchMonth): void {
                $searchQuery
                    ->where('id', 'like', '%'.$searchTerm.'%')
                    ->orWhere('date', 'like', '%'.$searchTerm.'%')
                    ->orWhere('time_from', 'like', '%'.$searchTerm.'%')
                    ->orWhere('time_to', 'like', '%'.$searchTerm.'%')
                    ->orWhere('status', 'like', '%'.$searchTerm.'%')
                    ->orWhere('status', 'like', '%'.$searchStatus.'%')
                    ->orWhere('notes', 'like', '%'.$searchTerm.'%')
                    ->orWhereHas(
                        'client',
                        fn (Builder $clientQuery) => $clientQuery->where('name', 'like', '%'.$searchTerm.'%'),
                    )
                    ->orWhereHas(
                        'address',
                        fn (Builder $addressQuery) => $addressQuery
                            ->where('city', 'like', '%'.$searchTerm.'%')
                            ->orWhere('street', 'like', '%'.$searchTerm.'%'),
                    );

                if ($searchMonth !== null) {
                    $searchQuery->orWhereMonth('date', $searchMonth);
                }
            });
        }

        return $this->applySort($query, $filters['sort']);
    }

    private function normalizeSort(string $sort): string
    {
        return in_array(
            $sort,
            ['date_desc', 'date_asc', 'time_asc', 'time_desc', 'status_asc', 'status_desc', 'updated_desc', 'updated_asc'],
            true,
        ) ? $sort : 'date_desc';
    }

    private function applySort(Builder $query, string $sort): Builder
    {
        return match ($sort) {
            'date_asc' => $query->orderBy('date')->orderBy('time_from'),
            'time_asc' => $query->orderBy('time_from')->orderBy('date'),
            'time_desc' => $query->orderByDesc('time_from')->orderByDesc('date'),
            'status_asc' => $query->orderBy('status')->orderByDesc('date'),
            'status_desc' => $query->orderByDesc('status')->orderByDesc('date'),
            'updated_desc' => $query->orderByDesc('updated_at'),
            'updated_asc' => $query->orderBy('updated_at'),
            default => $query->orderByDesc('date')->orderBy('time_from'),
        };
    }

    private function canCancelOrder(Order $order): bool
    {
        if (! in_array($order->status, ['NEW', 'PENDING', 'ASSIGNED'], true)) {
            return false;
        }

        $routeStopsCount = (int) ($order->route_stops_count ?? $order->routeStops->count());
        $nonPendingRouteStopsCount = (int) ($order->non_pending_route_stops_count
            ?? $order->routeStops->where('status', '!=', 'PENDING')->count());

        return $routeStopsCount === 0 || $nonPendingRouteStopsCount === 0;
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
}
