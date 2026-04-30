<?php

namespace Tests\Feature;

use App\Models\Courier;
use App\Models\DeliveryRoute;
use App\Models\Dispatcher;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_open_user_management_pages(): void
    {
        $organization = Organization::factory()->create([
            'name' => 'North Org',
        ]);
        $admin = User::factory()->admin()->create([
            'name' => 'Admin User',
        ]);
        $dispatcher = User::factory()->dispatcher($organization->id)->create([
            'name' => 'Dispatcher User',
        ]);

        Dispatcher::query()->create([
            'user_id' => $dispatcher->id,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.users.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/users/index')
                ->has('users', 2)
                ->where('users.0.name', 'Admin User')
                ->where('users.1.organization_name', 'North Org'));

        $this->actingAs($admin)
            ->get(route('admin.users.edit', $dispatcher))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/users/edit')
                ->where('user.id', $dispatcher->id)
                ->where('user.organization_id', $organization->id)
                ->has('roles', 3)
                ->has('organizations', 1));
    }

    public function test_admin_can_update_user_info_and_role_profiles(): void
    {
        $organizationA = Organization::factory()->create();
        $organizationB = Organization::factory()->create();
        $admin = User::factory()->admin()->create();
        $dispatcher = User::factory()->dispatcher($organizationA->id)->create([
            'name' => 'Original Name',
            'email' => 'dispatcher@example.com',
        ]);

        Dispatcher::query()->create([
            'user_id' => $dispatcher->id,
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.users.update', $dispatcher), [
                'name' => 'Courier Name',
                'email' => 'courier@example.com',
                'role' => 'courier',
                'organization_id' => $organizationB->id,
            ])
            ->assertRedirect(route('admin.users.index'));

        $this->assertDatabaseHas('users', [
            'id' => $dispatcher->id,
            'name' => 'Courier Name',
            'email' => 'courier@example.com',
            'role' => 'courier',
            'organization_id' => $organizationB->id,
        ]);

        $this->assertDatabaseMissing('dispatchers', [
            'user_id' => $dispatcher->id,
        ]);

        $this->assertDatabaseHas('couriers', [
            'user_id' => $dispatcher->id,
            'on_duty' => false,
        ]);
    }

    public function test_admin_can_turn_user_into_global_admin(): void
    {
        $organization = Organization::factory()->create();
        $superAdmin = User::factory()->admin()->create();
        $courier = User::factory()->courier($organization->id)->create();

        Courier::query()->create([
            'user_id' => $courier->id,
            'on_duty' => false,
        ]);

        $this->actingAs($superAdmin)
            ->patch(route('admin.users.update', $courier), [
                'name' => $courier->name,
                'email' => $courier->email,
                'role' => 'admin',
                'organization_id' => $organization->id,
            ])
            ->assertRedirect(route('admin.users.index'));

        $this->assertDatabaseHas('users', [
            'id' => $courier->id,
            'role' => 'admin',
            'organization_id' => null,
        ]);

        $this->assertDatabaseMissing('couriers', [
            'user_id' => $courier->id,
        ]);
    }

    public function test_non_admin_cannot_access_admin_user_routes(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        $managedUser = User::factory()->dispatcher($organization->id)->create();

        $this->actingAs($dispatcher)
            ->get(route('admin.users.index'))
            ->assertForbidden();

        $this->actingAs($dispatcher)
            ->get(route('admin.users.edit', $managedUser))
            ->assertForbidden();

        $this->actingAs($dispatcher)
            ->patch(route('admin.users.update', $managedUser), [
                'name' => 'Blocked',
                'email' => 'blocked@example.com',
                'role' => 'dispatcher',
                'organization_id' => $organization->id,
            ])
            ->assertForbidden();
    }

    public function test_last_admin_cannot_be_demoted(): void
    {
        $organization = Organization::factory()->create();
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->from(route('admin.users.edit', $admin))
            ->patch(route('admin.users.update', $admin), [
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => 'dispatcher',
                'organization_id' => $organization->id,
            ])
            ->assertRedirect(route('admin.users.edit', $admin))
            ->assertSessionHasErrors('role');
    }

    public function test_courier_with_route_cannot_change_role_or_organization(): void
    {
        $organizationA = Organization::factory()->create();
        $organizationB = Organization::factory()->create();
        $admin = User::factory()->admin()->create();
        $courierUser = User::factory()->courier($organizationA->id)->create();

        Courier::query()->create([
            'user_id' => $courierUser->id,
            'on_duty' => false,
        ]);

        DeliveryRoute::factory()->create([
            'organization_id' => $organizationA->id,
            'courier_user_id' => $courierUser->id,
        ]);

        $this->actingAs($admin)
            ->from(route('admin.users.edit', $courierUser))
            ->patch(route('admin.users.update', $courierUser), [
                'name' => $courierUser->name,
                'email' => $courierUser->email,
                'role' => 'dispatcher',
                'organization_id' => $organizationB->id,
            ])
            ->assertRedirect(route('admin.users.edit', $courierUser))
            ->assertSessionHasErrors('role');
    }
}
