<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AddressCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_dispatcher_can_list_only_own_organization_addresses(): void
    {
        $organizationA = Organization::factory()->create();
        $organizationB = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organizationA->id)->create();
        $addressA = Address::factory()->create(['organization_id' => $organizationA->id]);
        Address::factory()->create(['organization_id' => $organizationB->id]);

        $this->actingAs($dispatcher)
            ->get(route('dispatcher.addresses.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dispatcher/addresses/index')
                ->has('addresses', 1)
                ->where('addresses.0.id', $addressA->id)
                ->where('addresses.0.organization_id', $organizationA->id));
    }

    public function test_dispatcher_can_create_update_and_delete_own_organization_address(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();

        $this->actingAs($dispatcher)
            ->post(route('dispatcher.addresses.store'), [
                'city' => 'Riga',
                'street' => 'Brivibas iela 1',
                'lat' => 56.95,
                'lng' => 24.10,
            ])
            ->assertRedirect(route('dispatcher.addresses.index'));

        $address = Address::query()->where('street', 'Brivibas iela 1')->firstOrFail();

        $this->assertSame($organization->id, $address->organization_id);

        $this->actingAs($dispatcher)
            ->patch(route('dispatcher.addresses.update', $address), [
                'city' => 'Riga',
                'street' => 'Brivibas iela 2',
                'lat' => 56.96,
                'lng' => 24.11,
            ])
            ->assertRedirect(route('dispatcher.addresses.index'));

        $this->assertDatabaseHas('addresses', [
            'id' => $address->id,
            'organization_id' => $organization->id,
            'city' => 'Riga',
            'street' => 'Brivibas iela 2',
        ]);

        $this->actingAs($dispatcher)
            ->delete(route('dispatcher.addresses.destroy', $address))
            ->assertRedirect(route('dispatcher.addresses.index'));

        $this->assertDatabaseMissing('addresses', [
            'id' => $address->id,
        ]);
    }

    public function test_address_store_geocodes_coordinates_when_dispatcher_does_not_provide_them(): void
    {
        Http::fake([
            '*' => Http::response([
                [
                    'lat' => '56.9496',
                    'lon' => '24.1052',
                ],
            ]),
        ]);

        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();

        $this->actingAs($dispatcher)
            ->post(route('dispatcher.addresses.store'), [
                'city' => 'Riga',
                'street' => 'Brivibas iela 1',
            ])
            ->assertRedirect(route('dispatcher.addresses.index'));

        $this->assertDatabaseHas('addresses', [
            'organization_id' => $organization->id,
            'city' => 'Riga',
            'street' => 'Brivibas iela 1',
            'lat' => 56.9496,
            'lng' => 24.1052,
        ]);
    }

    public function test_address_update_geocodes_new_coordinates_when_address_changes_without_manual_values(): void
    {
        Http::fake([
            '*' => Http::response([
                [
                    'lat' => '56.6510',
                    'lon' => '23.7210',
                ],
            ]),
        ]);

        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        $address = Address::factory()->create([
            'organization_id' => $organization->id,
            'city' => 'Riga',
            'street' => 'Brivibas iela 1',
            'lat' => 56.95,
            'lng' => 24.10,
        ]);

        $this->actingAs($dispatcher)
            ->patch(route('dispatcher.addresses.update', $address), [
                'city' => 'Jelgava',
                'street' => 'Liela iela 5',
            ])
            ->assertRedirect(route('dispatcher.addresses.index'));

        $this->assertDatabaseHas('addresses', [
            'id' => $address->id,
            'city' => 'Jelgava',
            'street' => 'Liela iela 5',
            'lat' => 56.6510,
            'lng' => 23.7210,
        ]);
    }

    public function test_dispatcher_cannot_manage_other_organization_address(): void
    {
        $organizationA = Organization::factory()->create();
        $organizationB = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organizationA->id)->create();
        $address = Address::factory()->create(['organization_id' => $organizationB->id]);

        $this->actingAs($dispatcher)
            ->get(route('dispatcher.addresses.edit', $address))
            ->assertForbidden();

        $this->actingAs($dispatcher)
            ->patch(route('dispatcher.addresses.update', $address), [
                'city' => 'Denied',
                'street' => 'No access',
            ])
            ->assertForbidden();

        $this->actingAs($dispatcher)
            ->delete(route('dispatcher.addresses.destroy', $address))
            ->assertForbidden();
    }

    public function test_admin_can_manage_addresses_for_any_organization(): void
    {
        $organizationA = Organization::factory()->create();
        $organizationB = Organization::factory()->create();
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('dispatcher.addresses.store'), [
                'organization_id' => $organizationA->id,
                'city' => 'Riga',
                'street' => 'Admin street',
                'lat' => 56.95,
                'lng' => 24.10,
            ])
            ->assertRedirect(route('dispatcher.addresses.index'));

        $address = Address::query()->where('street', 'Admin street')->firstOrFail();

        $this->actingAs($admin)
            ->patch(route('dispatcher.addresses.update', $address), [
                'organization_id' => $organizationB->id,
                'city' => 'Jelgava',
                'street' => 'Admin street 2',
                'lat' => 56.65,
                'lng' => 23.72,
            ])
            ->assertRedirect(route('dispatcher.addresses.index'));

        $this->assertDatabaseHas('addresses', [
            'id' => $address->id,
            'organization_id' => $organizationB->id,
            'city' => 'Jelgava',
            'street' => 'Admin street 2',
        ]);
    }

    public function test_courier_is_forbidden_from_dispatcher_address_routes(): void
    {
        $organization = Organization::factory()->create();
        $courier = User::factory()->courier($organization->id)->create();
        $address = Address::factory()->create(['organization_id' => $organization->id]);

        $this->actingAs($courier)
            ->get(route('dispatcher.addresses.index'))
            ->assertForbidden();

        $this->actingAs($courier)
            ->get(route('dispatcher.addresses.create'))
            ->assertForbidden();

        $this->actingAs($courier)
            ->get(route('dispatcher.addresses.edit', $address))
            ->assertForbidden();

        $this->actingAs($courier)
            ->post(route('dispatcher.addresses.store'), [
                'city' => 'Blocked',
                'street' => 'Blocked',
            ])
            ->assertForbidden();
    }

    public function test_address_store_validation_requires_city_and_street_and_valid_coordinates(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();

        $this->actingAs($dispatcher)
            ->from(route('dispatcher.addresses.create'))
            ->post(route('dispatcher.addresses.store'), [
                'city' => '',
                'street' => '',
                'lat' => 120,
                'lng' => 220,
            ])
            ->assertRedirect(route('dispatcher.addresses.create'))
            ->assertSessionHasErrors(['city', 'street', 'lat', 'lng']);
    }

    public function test_address_validation_requires_manual_coordinates_in_pairs(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();

        $this->actingAs($dispatcher)
            ->from(route('dispatcher.addresses.create'))
            ->post(route('dispatcher.addresses.store'), [
                'city' => 'Riga',
                'street' => 'Brivibas iela 1',
                'lat' => 56.95,
            ])
            ->assertRedirect(route('dispatcher.addresses.create'))
            ->assertSessionHasErrors(['lng']);
    }
}
