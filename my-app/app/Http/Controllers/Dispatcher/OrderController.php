<?php

namespace App\Http\Controllers\Dispatcher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dispatcher\StoreOrderRequest;
use App\Http\Requests\Dispatcher\UpdateOrderRequest;
use App\Models\Address;
use App\Models\Client;
use App\Models\Order;
use App\Models\Organization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
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
            'date' => $request->string('date')->toString(),
            'status' => $request->string('status')->toString(),
            'client' => $request->string('client')->toString(),
        ];

        $orders = Order::query()
            ->with(['client:id,name', 'address:id,city,street'])
            ->visibleTo($request->user())
            ->when($filters['date'] !== '', fn ($query) => $query->whereDate('date', $filters['date']))
            ->when($filters['status'] !== '', fn ($query) => $query->where('status', $filters['status']))
            ->when(
                $filters['client'] !== '',
                fn ($query) => $query->whereHas(
                    'client',
                    fn ($clientQuery) => $clientQuery->where('name', 'like', '%'.$filters['client'].'%'),
                ),
            )
            ->orderByDesc('date')
            ->orderBy('time_from')
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
                ]),
            'filters' => $filters,
            'statuses' => self::STATUSES,
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
            'statuses' => self::STATUSES,
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
            'status' => $data['status'],
            'notes' => $data['notes'] ?? null,
        ]);

        return to_route('dispatcher.orders.index');
    }

    public function edit(Request $request, Order $order): Response
    {
        $this->authorizeDispatcherAccess($request);
        $this->authorize('view', $order);

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
            'organizations' => $this->organizationsForUser($request),
            'clients' => $this->clientsForUser($request),
            'addresses' => $this->addressesForUser($request),
            'statuses' => self::STATUSES,
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
            'status' => $data['status'],
            'notes' => $data['notes'] ?? null,
        ]);

        return to_route('dispatcher.orders.index');
    }

    public function destroy(Request $request, Order $order): RedirectResponse
    {
        $this->authorizeDispatcherAccess($request);
        $this->authorize('delete', $order);

        $order->delete();

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
}
