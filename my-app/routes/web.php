<?php

use App\Http\Controllers\Dispatcher\ClientController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

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

        Route::get('addresses', function (Request $request) use ($ensureDispatcherAccess) {
            $ensureDispatcherAccess($request);

            return Inertia::render('dispatcher/addresses/index');
        })->name('addresses.index');

        Route::get('addresses/create', function (Request $request) use ($ensureDispatcherAccess) {
            $ensureDispatcherAccess($request);

            return Inertia::render('dispatcher/addresses/create');
        })->name('addresses.create');

        Route::get('addresses/{address}/edit', function (Request $request, string $address) use ($ensureDispatcherAccess) {
            $ensureDispatcherAccess($request);

            return Inertia::render('dispatcher/addresses/edit', [
                'addressId' => $address,
            ]);
        })->name('addresses.edit');
    });

require __DIR__.'/settings.php';
