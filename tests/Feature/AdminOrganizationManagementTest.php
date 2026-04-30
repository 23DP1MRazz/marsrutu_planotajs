<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminOrganizationManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_open_organization_management_pages(): void
    {
        $admin = User::factory()->admin()->create();
        $organization = Organization::factory()->create([
            'name' => 'Alpha Org',
            'join_code' => 'JOIN1234',
        ]);
        User::factory()->dispatcher($organization->id)->create();

        $this->actingAs($admin)
            ->get(route('admin.organizations.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/organizations/index')
                ->has('organizations', 1)
                ->where('organizations.0.name', 'Alpha Org')
                ->where('organizations.0.join_code', 'JOIN1234')
                ->where('organizations.0.users_count', 1));

        $this->actingAs($admin)
            ->get(route('admin.organizations.edit', $organization))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/organizations/edit')
                ->where('organization.id', $organization->id)
                ->where('organization.join_code', 'JOIN1234'));
    }

    public function test_admin_can_update_organization_name(): void
    {
        $admin = User::factory()->admin()->create();
        $organization = Organization::factory()->create([
            'name' => 'Old Name',
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.organizations.update', $organization), [
                'name' => 'New Name',
            ])
            ->assertRedirect(route('admin.organizations.index'));

        $this->assertDatabaseHas('organizations', [
            'id' => $organization->id,
            'name' => 'New Name',
        ]);
    }

    public function test_admin_can_regenerate_join_code(): void
    {
        $admin = User::factory()->admin()->create();
        $organization = Organization::factory()->create([
            'join_code' => 'OLDCODE1',
        ]);

        $this->actingAs($admin)
            ->post(route('admin.organizations.regenerate-join-code', $organization))
            ->assertRedirect(route('admin.organizations.edit', $organization));

        $organization->refresh();

        $this->assertNotSame('OLDCODE1', $organization->join_code);
        $this->assertSame(8, strlen($organization->join_code));
    }

    public function test_non_admin_cannot_access_admin_organization_routes(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();

        $this->actingAs($dispatcher)
            ->get(route('admin.organizations.index'))
            ->assertForbidden();

        $this->actingAs($dispatcher)
            ->get(route('admin.organizations.edit', $organization))
            ->assertForbidden();

        $this->actingAs($dispatcher)
            ->patch(route('admin.organizations.update', $organization), [
                'name' => 'Blocked',
            ])
            ->assertForbidden();

        $this->actingAs($dispatcher)
            ->post(route('admin.organizations.regenerate-join-code', $organization))
            ->assertForbidden();
    }
}
