<?php

namespace Tests\Feature;

use App\Models\Courier;
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
                ->where('organizationInvitation', null));
    }

    public function test_dispatcher_dashboard_includes_join_link_data(): void
    {
        $organization = Organization::factory()->create([
            'name' => 'North Hub',
            'join_code' => 'JOIN2026',
        ]);
        $dispatcher = User::factory()->dispatcher($organization->id)->create();

        $this->actingAs($dispatcher)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('organizationInvitation.organization_id', $organization->id)
                ->where('organizationInvitation.organization_name', 'North Hub')
                ->where('organizationInvitation.join_code', 'JOIN2026')
                ->where('organizationInvitation.registration_url', '/register?join_code=JOIN2026'));
    }

    public function test_admin_dashboard_does_not_include_dispatcher_join_link_data(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
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
                ->component('courier/route')
                ->where('dashboardMode', true));
    }
}
