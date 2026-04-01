<?php

use App\Http\Controllers\Dispatcher\AddressController;
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

        Route::get('addresses', [AddressController::class, 'index'])->name('addresses.index');
        Route::get('addresses/create', [AddressController::class, 'create'])->name('addresses.create');
        Route::post('addresses', [AddressController::class, 'store'])->name('addresses.store');
        Route::get('addresses/{address}/edit', [AddressController::class, 'edit'])->name('addresses.edit');
        Route::patch('addresses/{address}', [AddressController::class, 'update'])->name('addresses.update');
        Route::delete('addresses/{address}', [AddressController::class, 'destroy'])->name('addresses.destroy');
    });

require __DIR__.'/settings.php';
