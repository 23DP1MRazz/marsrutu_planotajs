<?php

use App\Http\Controllers\Courier\CourierRouteController;
use App\Http\Controllers\Dispatcher\AddressController;
use App\Http\Controllers\Dispatcher\ClientController;
use App\Http\Controllers\Dispatcher\DeliveryRouteController;
use App\Http\Controllers\Dispatcher\OrderController;
use App\Http\Controllers\ProofOfDeliveryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function (Request $request) {
    if ($request->user()?->isCourier()) {
        return app(CourierRouteController::class)->showDashboard($request);
    }

    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('proof-of-delivery/{proofOfDelivery}', [ProofOfDeliveryController::class, 'show'])
    ->middleware(['auth', 'verified'])
    ->name('proof-of-delivery.show');

Route::middleware(['auth', 'verified'])
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

Route::middleware(['auth', 'verified'])
    ->prefix('courier')
    ->name('courier.')
    ->group(function () {
        Route::get('today-route', function (Request $request) {
            abort_unless($request->user()?->isCourier(), 403);

            return to_route('dashboard');
        })->name('route.page');
        Route::get('route', [CourierRouteController::class, 'showToday'])->name('route.show');
        Route::patch('stops/{routeStop}', [CourierRouteController::class, 'updateStopStatus'])->name('stops.update');
        Route::post('stops/{routeStop}/proof', [CourierRouteController::class, 'uploadProof'])->name('stops.proof.store');
    });

require __DIR__.'/settings.php';
