<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Client;
use App\Models\Courier;
use App\Models\DeliveryRoute;
use App\Models\Order;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('dashboardSummary', null)
                ->where('organizationInvitation', null));
    }

    public function test_dispatcher_dashboard_includes_join_link_data_and_summary(): void
    {
        $organization = Organization::factory()->create([
            'name' => 'North Hub',
            'join_code' => 'JOIN2026',
        ]);
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        $client = Client::factory()->create([
            'organization_id' => $organization->id,
            'name' => 'Client One',
        ]);
        $address = Address::factory()->create([
            'organization_id' => $organization->id,
            'city' => 'Riga',
            'street' => 'Brivibas 1',
        ]);
        Order::factory()->create([
            'organization_id' => $organization->id,
            'client_id' => $client->id,
            'address_id' => $address->id,
            'status' => 'NEW',
        ]);
        $courier = User::factory()->courier($organization->id)->create([
            'name' => 'Courier One',
        ]);

        Courier::query()->create([
            'user_id' => $courier->id,
            'on_duty' => false,
        ]);

        DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => now()->toDateString(),
            'status' => 'PLANNED',
        ]);

        $this->actingAs($dispatcher)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('dashboardSummary.role', 'dispatcher')
                ->where('dashboardSummary.counts.clients', 1)
                ->where('dashboardSummary.counts.addresses', 1)
                ->where('dashboardSummary.counts.orders', 1)
                ->where('dashboardSummary.counts.pending_orders', 1)
                ->where('dashboardSummary.counts.routes', 1)
                ->where('dashboardSummary.upcoming_routes.0.courier_name', 'Courier One')
                ->where('dashboardSummary.pending_orders.0.client_name', 'Client One')
                ->where('organizationInvitation.organization_id', $organization->id)
                ->where('organizationInvitation.organization_name', 'North Hub')
                ->where('organizationInvitation.join_code', 'JOIN2026')
                ->where('organizationInvitation.registration_url', '/register?join_code=JOIN2026'));
    }

    public function test_dispatcher_dashboard_upcoming_routes_only_shows_nearest_planned_routes(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        $courier = User::factory()->courier($organization->id)->create();
        $otherCourier = User::factory()->courier($organization->id)->create();

        Courier::query()->create([
            'user_id' => $courier->id,
            'on_duty' => false,
        ]);
        Courier::query()->create([
            'user_id' => $otherCourier->id,
            'on_duty' => false,
        ]);

        $laterPlannedRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => now()->addDays(3)->toDateString(),
            'status' => 'PLANNED',
        ]);

        DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $otherCourier->id,
            'date' => now()->addDay()->toDateString(),
            'status' => 'DONE',
        ]);

        DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => now()->subDay()->toDateString(),
            'status' => 'PLANNED',
        ]);

        $nearestPlannedRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => now()->addDay()->toDateString(),
            'status' => 'PLANNED',
        ]);

        $this->actingAs($dispatcher)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->has('dashboardSummary.upcoming_routes', 2)
                ->where('dashboardSummary.upcoming_routes.0.id', $nearestPlannedRoute->id)
                ->where('dashboardSummary.upcoming_routes.0.status', 'PLANNED')
                ->where('dashboardSummary.upcoming_routes.1.id', $laterPlannedRoute->id)
                ->where('dashboardSummary.upcoming_routes.1.status', 'PLANNED'));
    }

    public function test_admin_dashboard_includes_summary_without_dispatcher_join_link_data(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create();
        Organization::factory()->create([
            'name' => 'Newest Org',
            'join_code' => 'ORGCODE1',
        ]);

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('dashboardSummary.role', 'admin')
                ->where('dashboardSummary.counts.users', 2)
                ->where('dashboardSummary.counts.organizations', 1)
                ->where('dashboardSummary.recent_organizations.0.name', 'Newest Org')
                ->where('organizationInvitation', null));
    }

    public function test_courier_sees_route_dashboard_component(): void
    {
        $organization = Organization::factory()->create();
        $courier = User::factory()->courier($organization->id)->create();

        Courier::query()->create([
            'user_id' => $courier->id,
            'on_duty' => false,
        ]);

        $this->actingAs($courier)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('courier/dashboard')
                ->where('dashboardSummary.done_routes', 0));
    }
}
