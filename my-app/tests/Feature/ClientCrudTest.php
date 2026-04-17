<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ClientCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_dispatcher_can_list_only_own_organization_clients(): void
    {
        $organizationA = Organization::factory()->create();
        $organizationB = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organizationA->id)->create();
        $clientA = Client::factory()->create(['organization_id' => $organizationA->id]);
        Client::factory()->create(['organization_id' => $organizationB->id]);

        $this->actingAs($dispatcher)
            ->get(route('dispatcher.clients.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dispatcher/clients/index')
                ->has('clients', 1)
                ->where('clients.0.id', $clientA->id)
                ->where('clients.0.organization_id', $organizationA->id));
    }

    public function test_dispatcher_can_filter_and_sort_clients(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();

        $olderClient = Client::factory()->create([
            'organization_id' => $organization->id,
            'name' => 'Alpha Client',
            'phone' => '20000001',
            'updated_at' => now()->subDay(),
        ]);

        $newerClient = Client::factory()->create([
            'organization_id' => $organization->id,
            'name' => 'Beta Client',
            'phone' => '29990000',
            'updated_at' => now(),
        ]);

        $this->actingAs($dispatcher)
            ->get(route('dispatcher.clients.index', [
                'search' => '2999',
                'sort' => 'updated_desc',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dispatcher/clients/index')
                ->has('clients', 1)
                ->where('clients.0.id', $newerClient->id)
                ->where('filters.search', '2999')
                ->where('filters.sort', 'updated_desc'));

        $this->assertNotSame($olderClient->id, $newerClient->id);
    }

    public function test_dispatcher_can_create_update_and_delete_own_organization_client(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();

        $this->actingAs($dispatcher)
            ->post(route('dispatcher.clients.store'), [
                'name' => 'Client A',
                'phone' => '20000001',
            ])
            ->assertRedirect(route('dispatcher.clients.index'));

        $client = Client::query()->where('name', 'Client A')->firstOrFail();

        $this->assertSame($organization->id, $client->organization_id);

        $this->actingAs($dispatcher)
            ->patch(route('dispatcher.clients.update', $client), [
                'name' => 'Client B',
                'phone' => '20000002',
            ])
            ->assertRedirect(route('dispatcher.clients.index'));

        $this->assertDatabaseHas('clients', [
            'id' => $client->id,
            'organization_id' => $organization->id,
            'name' => 'Client B',
            'phone' => '20000002',
        ]);

        $this->actingAs($dispatcher)
            ->delete(route('dispatcher.clients.destroy', $client))
            ->assertRedirect(route('dispatcher.clients.index'));

        $this->assertDatabaseMissing('clients', [
            'id' => $client->id,
        ]);
    }

    public function test_dispatcher_cannot_manage_other_organization_client(): void
    {
        $organizationA = Organization::factory()->create();
        $organizationB = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organizationA->id)->create();
        $client = Client::factory()->create(['organization_id' => $organizationB->id]);

        $this->actingAs($dispatcher)
            ->get(route('dispatcher.clients.edit', $client))
            ->assertForbidden();

        $this->actingAs($dispatcher)
            ->patch(route('dispatcher.clients.update', $client), [
                'name' => 'Blocked',
                'phone' => '29999999',
            ])
            ->assertForbidden();

        $this->actingAs($dispatcher)
            ->delete(route('dispatcher.clients.destroy', $client))
            ->assertForbidden();
    }

    public function test_admin_can_manage_clients_for_any_organization(): void
    {
        $organizationA = Organization::factory()->create();
        $organizationB = Organization::factory()->create();
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('dispatcher.clients.store'), [
                'organization_id' => $organizationA->id,
                'name' => 'Admin Client',
                'phone' => '21111111',
            ])
            ->assertRedirect(route('dispatcher.clients.index'));

        $client = Client::query()->where('name', 'Admin Client')->firstOrFail();

        $this->actingAs($admin)
            ->patch(route('dispatcher.clients.update', $client), [
                'organization_id' => $organizationB->id,
                'name' => 'Admin Client Updated',
                'phone' => '22222222',
            ])
            ->assertRedirect(route('dispatcher.clients.index'));

        $this->assertDatabaseHas('clients', [
            'id' => $client->id,
            'organization_id' => $organizationB->id,
            'name' => 'Admin Client Updated',
            'phone' => '22222222',
        ]);
    }

    public function test_courier_is_forbidden_from_dispatcher_client_routes(): void
    {
        $organization = Organization::factory()->create();
        $courier = User::factory()->courier($organization->id)->create();
        $client = Client::factory()->create(['organization_id' => $organization->id]);

        $this->actingAs($courier)
            ->get(route('dispatcher.clients.index'))
            ->assertForbidden();

        $this->actingAs($courier)
            ->get(route('dispatcher.clients.create'))
            ->assertForbidden();

        $this->actingAs($courier)
            ->get(route('dispatcher.clients.edit', $client))
            ->assertForbidden();

        $this->actingAs($courier)
            ->post(route('dispatcher.clients.store'), [
                'name' => 'Blocked',
                'phone' => '23333333',
            ])
            ->assertForbidden();
    }

    public function test_client_store_validation_requires_name_and_phone(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();

        $this->actingAs($dispatcher)
            ->from(route('dispatcher.clients.create'))
            ->post(route('dispatcher.clients.store'), [
                'name' => '',
                'phone' => '',
            ])
            ->assertRedirect(route('dispatcher.clients.create'))
            ->assertSessionHasErrors(['name', 'phone']);
    }
}
