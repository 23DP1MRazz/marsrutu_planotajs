<?php

namespace App\Providers;

use App\Models\Address;
use App\Models\Client;
use App\Models\DeliveryRoute;
use App\Models\Order;
use App\Models\ProofOfDelivery;
use App\Models\RouteStop;
use App\Policies\AddressPolicy;
use App\Policies\ClientPolicy;
use App\Policies\DeliveryRoutePolicy;
use App\Policies\OrderPolicy;
use App\Policies\ProofOfDeliveryPolicy;
use App\Policies\RouteStopPolicy;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configurePolicies();
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null
        );
    }

    protected function configurePolicies(): void
    {
        Gate::policy(Client::class, ClientPolicy::class);
        Gate::policy(Address::class, AddressPolicy::class);
        Gate::policy(Order::class, OrderPolicy::class);
        Gate::policy(DeliveryRoute::class, DeliveryRoutePolicy::class);
        Gate::policy(RouteStop::class, RouteStopPolicy::class);
        Gate::policy(ProofOfDelivery::class, ProofOfDeliveryPolicy::class);
    }
}
