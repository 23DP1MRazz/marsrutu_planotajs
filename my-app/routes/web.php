<?php

use App\Http\Controllers\Admin\OrganizationController as AdminOrganizationController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Courier\CourierRouteController;
use App\Http\Controllers\Dispatcher\AddressController;
use App\Http\Controllers\Dispatcher\ClientController;
use App\Http\Controllers\Dispatcher\DeliveryRouteController;
use App\Http\Controllers\Dispatcher\OrderController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\ProofOfDeliveryController;
use App\Models\Address;
use App\Models\Client;
use App\Models\DeliveryRoute;
use App\Models\Order;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::patch('locale', [LocaleController::class, 'update'])->name('locale.update');

Route::get('dashboard', function (Request $request) {
    if ($request->user()?->isCourier()) {
        return app(CourierRouteController::class)->showDashboard($request);
    }

    $dashboardSummary = null;
    $dispatcherOrganization = $request->user()?->isDispatcher()
        ? Organization::query()
            ->whereKey($request->user()->organization_id)
            ->first(['id', 'name', 'join_code'])
        : null;

    if ($request->user()?->isAdmin()) {
        $dashboardSummary = [
            'role' => 'admin',
            'counts' => [
                'users' => User::query()->count(),
                'organizations' => Organization::query()->count(),
            ],
            'recent_users' => User::query()
                ->latest('created_at')
                ->limit(5)
                ->get(['id', 'name', 'email', 'role', 'created_at'])
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'created_at' => $user->created_at?->toISOString(),
                ])
                ->values(),
            'recent_organizations' => Organization::query()
                ->latest('created_at')
                ->limit(5)
                ->get(['id', 'name', 'join_code', 'created_at'])
                ->map(fn (Organization $organization) => [
                    'id' => $organization->id,
                    'name' => $organization->name,
                    'join_code' => $organization->join_code,
                    'created_at' => $organization->created_at?->toISOString(),
                ])
                ->values(),
        ];
    }

    if ($request->user()?->isDispatcher() && $request->user()->organization_id !== null) {
        $organizationId = $request->user()->organization_id;

        $dashboardSummary = [
            'role' => 'dispatcher',
            'counts' => [
                'clients' => Client::query()->where('organization_id', $organizationId)->count(),
                'addresses' => Address::query()->where('organization_id', $organizationId)->count(),
                'orders' => Order::query()->where('organization_id', $organizationId)->count(),
                'pending_orders' => Order::query()
                    ->where('organization_id', $organizationId)
                    ->whereIn('status', ['NEW', 'PENDING'])
                    ->count(),
                'routes' => DeliveryRoute::query()->where('organization_id', $organizationId)->count(),
            ],
            'upcoming_routes' => DeliveryRoute::query()
                ->where('organization_id', $organizationId)
                ->with('courier.user:id,name')
                ->withCount('routeStops')
                ->orderBy('date')
                ->limit(5)
                ->get()
                ->map(fn (DeliveryRoute $deliveryRoute) => [
                    'id' => $deliveryRoute->id,
                    'date' => $deliveryRoute->date,
                    'status' => $deliveryRoute->status,
                    'stops_count' => $deliveryRoute->route_stops_count,
                    'courier_name' => $deliveryRoute->courier?->user?->name,
                ])
                ->values(),
            'pending_orders' => Order::query()
                ->where('organization_id', $organizationId)
                ->with(['client:id,name', 'address:id,city,street'])
                ->whereIn('status', ['NEW', 'PENDING'])
                ->orderBy('date')
                ->limit(5)
                ->get()
                ->map(fn (Order $order) => [
                    'id' => $order->id,
                    'date' => $order->date,
                    'status' => $order->status,
                    'client_name' => $order->client?->name,
                    'address_label' => trim(collect([$order->address?->city, $order->address?->street])
                        ->filter()
                        ->implode(', ')),
                ])
                ->values(),
        ];
    }

    return Inertia::render('dashboard', [
        'dashboardSummary' => $dashboardSummary,
        'organizationInvitation' => $dispatcherOrganization === null
            ? null
            : [
                'organization_id' => $dispatcherOrganization->id,
                'organization_name' => $dispatcherOrganization->name,
                'join_code' => $dispatcherOrganization->join_code,
                'registration_url' => route('register', [
                    'join_code' => $dispatcherOrganization->join_code,
                ], false),
            ],
    ]);
})->middleware(['auth'])->name('dashboard');

Route::get('proof-of-delivery/{proofOfDelivery}', [ProofOfDeliveryController::class, 'show'])
    ->middleware(['auth'])
    ->name('proof-of-delivery.show');

Route::middleware(['auth'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('users', [AdminUserController::class, 'index'])->name('users.index');
        Route::get('users/{user}/edit', [AdminUserController::class, 'edit'])->name('users.edit');
        Route::patch('users/{user}', [AdminUserController::class, 'update'])->name('users.update');

        Route::get('organizations', [AdminOrganizationController::class, 'index'])->name('organizations.index');
        Route::get('organizations/{organization}/edit', [AdminOrganizationController::class, 'edit'])->name('organizations.edit');
        Route::patch('organizations/{organization}', [AdminOrganizationController::class, 'update'])->name('organizations.update');
        Route::post('organizations/{organization}/regenerate-join-code', [AdminOrganizationController::class, 'regenerateJoinCode'])->name('organizations.regenerate-join-code');
    });

Route::middleware(['auth'])
    ->prefix('dispatcher')
    ->name('dispatcher.')
    ->group(function () {
        $ensureDispatcherAccess = function (Request $request): void {
            abort_unless(
                $request->user()?->isAdmin() || $request->user()?->isDispatcher(),
                403,
            );
        };

        Route::get('clients', [ClientController::class, 'index'])->name('clients.index');
        Route::get('clients/create', [ClientController::class, 'create'])->name('clients.create');
        Route::post('clients', [ClientController::class, 'store'])->name('clients.store');
        Route::get('clients/{client}/edit', [ClientController::class, 'edit'])->name('clients.edit');
        Route::patch('clients/{client}', [ClientController::class, 'update'])->name('clients.update');
        Route::delete('clients/{client}', [ClientController::class, 'destroy'])->name('clients.destroy');

        Route::get('addresses', [AddressController::class, 'index'])->name('addresses.index');
        Route::get('addresses/create', [AddressController::class, 'create'])->name('addresses.create');
        Route::post('addresses', [AddressController::class, 'store'])->name('addresses.store');
        Route::get('addresses/{address}/edit', [AddressController::class, 'edit'])->name('addresses.edit');
        Route::patch('addresses/{address}', [AddressController::class, 'update'])->name('addresses.update');
        Route::delete('addresses/{address}', [AddressController::class, 'destroy'])->name('addresses.destroy');

        Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('orders/export', [OrderController::class, 'export'])->name('orders.export');
        Route::get('orders/create', [OrderController::class, 'create'])->name('orders.create');
        Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
        Route::get('orders/{order}/edit', [OrderController::class, 'edit'])->name('orders.edit');
        Route::patch('orders/{order}', [OrderController::class, 'update'])->name('orders.update');
        Route::delete('orders/{order}', [OrderController::class, 'destroy'])->name('orders.destroy');

        Route::get('routes', [DeliveryRouteController::class, 'index'])->name('routes.index');
        Route::get('routes/export', [DeliveryRouteController::class, 'export'])->name('routes.export');
        Route::get('routes/create', [DeliveryRouteController::class, 'create'])->name('routes.create');
        Route::post('routes', [DeliveryRouteController::class, 'store'])->name('routes.store');
        Route::get('routes/{deliveryRoute}/print', [DeliveryRouteController::class, 'print'])->name('routes.print');
        Route::get('routes/{deliveryRoute}', [DeliveryRouteController::class, 'show'])->name('routes.show');
        Route::post('routes/{deliveryRoute}/orders', [DeliveryRouteController::class, 'assignOrders'])->name('routes.orders.store');
        Route::patch('routes/{deliveryRoute}/stops/reorder', [DeliveryRouteController::class, 'reorderStops'])->name('routes.stops.reorder');
        Route::delete('routes/{deliveryRoute}/stops/{routeStop}', [DeliveryRouteController::class, 'destroyStop'])->name('routes.stops.destroy');
    });

Route::middleware(['auth'])
    ->prefix('courier')
    ->name('courier.')
    ->group(function () {
        Route::get('today-route', function (Request $request) {
            abort_unless($request->user()?->isCourier(), 403);

            return to_route('dashboard');
        })->name('route.page');
        Route::get('routes/completed', [CourierRouteController::class, 'showCompletedRoutesPage'])->name('routes.completed');
        Route::get('routes/upcoming', [CourierRouteController::class, 'showUpcomingRoutesPage'])->name('routes.upcoming');
        Route::get('orders/completed', [CourierRouteController::class, 'showCompletedOrdersPage'])->name('orders.completed');
        Route::get('route', [CourierRouteController::class, 'showToday'])->name('route.show');
        Route::patch('stops/{routeStop}', [CourierRouteController::class, 'updateStopStatus'])->name('stops.update');
        Route::post('stops/{routeStop}/proof', [CourierRouteController::class, 'uploadProof'])->name('stops.proof.store');
    });

require __DIR__.'/settings.php';
