<?php

namespace App\Http\Controllers\Dispatcher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dispatcher\AssignRouteOrdersRequest;
use App\Http\Requests\Dispatcher\ReorderRouteStopsRequest;
use App\Http\Requests\Dispatcher\StoreDeliveryRouteRequest;
use App\Models\DeliveryRoute;
use App\Models\Order;
use App\Models\Organization;
use App\Models\RouteStop;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DeliveryRouteController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeDispatcherAccess($request);
        $this->authorize('viewAny', DeliveryRoute::class);

        return Inertia::render('dispatcher/routes/index', [
            'deliveryRoutes' => DeliveryRoute::query()
                ->with(['courier.user:id,name', 'routeStops:id,route_id'])
                ->visibleTo($request->user())
                ->orderByDesc('date')
                ->orderBy('id')
                ->get(['id', 'organization_id', 'courier_user_id', 'date', 'status', 'updated_at'])
                ->map(fn (DeliveryRoute $deliveryRoute) => $this->formatRoute($deliveryRoute)),
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
            'routeStops.order.client:id,name',
            'routeStops.order.address:id,city,street',
        ]);

        return Inertia::render('dispatcher/routes/show', [
            'deliveryRoute' => $this->formatRoute($deliveryRoute),
            'stops' => $deliveryRoute->routeStops->map(fn (RouteStop $routeStop) => [
                'id' => $routeStop->id,
                'seq_no' => $routeStop->seq_no,
                'order_id' => $routeStop->order_id,
                'planned_eta' => $routeStop->planned_eta,
                'status' => $routeStop->status,
                'client_name' => $routeStop->order?->client?->name,
                'address_label' => collect([
                    $routeStop->order?->address?->city,
                    $routeStop->order?->address?->street,
                ])->filter()->join(', '),
            ]),
            'availableOrders' => $this->unassignedOrdersForOrganization($deliveryRoute->organization_id),
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

    private function plannedEtaForStop(RouteStop $routeStop): ?Carbon
    {
        if (! $routeStop->order?->date || ! $routeStop->order?->time_from) {
            return null;
        }

        return Carbon::parse($routeStop->order->date.' '.$routeStop->order->time_from);
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
            'stops_count' => $deliveryRoute->routeStops->count(),
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
            ->where('status', 'NEW')
            ->whereDoesntHave('routeStops')
            ->orderBy('date')
            ->orderBy('time_from')
            ->get(['id', 'organization_id', 'client_id', 'address_id', 'date', 'time_from', 'time_to'])
            ->map(fn (Order $order) => $this->formatAssignableOrder($order));
    }

    /**
     * @return \Illuminate\Support\Collection<int, array{id: int, organization_id: int, client_name: string|null, address_label: string, date: string, time_from: string, time_to: string}>
     */
    private function unassignedOrdersForOrganization(int $organizationId)
    {
        return Order::query()
            ->with(['client:id,name', 'address:id,city,street'])
            ->where('organization_id', $organizationId)
            ->where('status', 'NEW')
            ->whereDoesntHave('routeStops')
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

    private function authorizeDispatcherAccess(Request $request): void
    {
        abort_unless(
            $request->user()?->isAdmin() || $request->user()?->isDispatcher(),
            403,
        );
    }
}
