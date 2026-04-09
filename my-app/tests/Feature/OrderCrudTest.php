<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Client;
use App\Models\Order;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OrderCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_dispatcher_can_list_only_own_organization_orders(): void
    {
        $organizationA = Organization::factory()->create();
        $organizationB = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organizationA->id)->create();

        [$clientA, $addressA] = $this->createClientAndAddress($organizationA);
        [$clientB, $addressB] = $this->createClientAndAddress($organizationB);

        $orderA = Order::factory()->create([
            'organization_id' => $organizationA->id,
            'client_id' => $clientA->id,
            'address_id' => $addressA->id,
        ]);

        Order::factory()->create([
            'organization_id' => $organizationB->id,
            'client_id' => $clientB->id,
            'address_id' => $addressB->id,
        ]);

        $this->actingAs($dispatcher)
            ->get(route('dispatcher.orders.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dispatcher/orders/index')
                ->has('orders', 1)
                ->where('orders.0.id', $orderA->id)
                ->where('orders.0.organization_id', $organizationA->id)
                ->where('orders.0.client_name', $clientA->name));
    }

    public function test_dispatcher_can_filter_orders_by_date_status_and_client_name(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        [$clientA, $addressA] = $this->createClientAndAddress($organization);
        [$clientB, $addressB] = $this->createClientAndAddress($organization);

        $matchingOrder = Order::factory()->create([
            'organization_id' => $organization->id,
            'client_id' => $clientA->id,
            'address_id' => $addressA->id,
            'date' => '2026-04-10',
            'status' => 'ASSIGNED',
        ]);

        Order::factory()->create([
            'organization_id' => $organization->id,
            'client_id' => $clientB->id,
            'address_id' => $addressB->id,
            'date' => '2026-04-10',
            'status' => 'NEW',
        ]);

        Order::factory()->create([
            'organization_id' => $organization->id,
            'client_id' => $clientA->id,
            'address_id' => $addressA->id,
            'date' => '2026-04-11',
            'status' => 'ASSIGNED',
        ]);

        $this->actingAs($dispatcher)
            ->get(route('dispatcher.orders.index', [
                'date' => '2026-04-10',
                'status' => 'ASSIGNED',
                'client' => $clientA->name,
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dispatcher/orders/index')
                ->has('orders', 1)
                ->where('orders.0.id', $matchingOrder->id)
                ->where('filters.date', '2026-04-10')
                ->where('filters.status', 'ASSIGNED')
                ->where('filters.client', $clientA->name));
    }

    public function test_dispatcher_can_create_update_and_delete_own_organization_order(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        [$client, $address] = $this->createClientAndAddress($organization);

        $this->actingAs($dispatcher)
            ->post(route('dispatcher.orders.store'), [
                'client_id' => $client->id,
                'address_id' => $address->id,
                'date' => '2026-04-01',
                'time_from' => '09:00',
                'time_to' => '11:00',
                'status' => 'NEW',
                'notes' => 'Morning delivery',
            ])
            ->assertRedirect(route('dispatcher.orders.index'));

        $order = Order::query()->where('notes', 'Morning delivery')->firstOrFail();

        $this->assertSame($organization->id, $order->organization_id);

        $this->actingAs($dispatcher)
            ->patch(route('dispatcher.orders.update', $order), [
                'client_id' => $client->id,
                'address_id' => $address->id,
                'date' => '2026-04-02',
                'time_from' => '10:00',
                'time_to' => '12:00',
                'status' => 'ASSIGNED',
                'notes' => 'Updated order',
            ])
            ->assertRedirect(route('dispatcher.orders.index'));

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'organization_id' => $organization->id,
            'status' => 'ASSIGNED',
            'notes' => 'Updated order',
        ]);

        $this->actingAs($dispatcher)
            ->delete(route('dispatcher.orders.destroy', $order))
            ->assertRedirect(route('dispatcher.orders.index'));

        $this->assertDatabaseMissing('orders', [
            'id' => $order->id,
        ]);
    }

    public function test_dispatcher_cannot_manage_other_organization_order(): void
    {
        $organizationA = Organization::factory()->create();
        $organizationB = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organizationA->id)->create();
        [$clientB, $addressB] = $this->createClientAndAddress($organizationB);
        $order = Order::factory()->create([
            'organization_id' => $organizationB->id,
            'client_id' => $clientB->id,
            'address_id' => $addressB->id,
        ]);

        $this->actingAs($dispatcher)
            ->get(route('dispatcher.orders.edit', $order))
            ->assertForbidden();

        $this->actingAs($dispatcher)
            ->patch(route('dispatcher.orders.update', $order), [
                'client_id' => $clientB->id,
                'address_id' => $addressB->id,
                'date' => '2026-04-02',
                'time_from' => '10:00',
                'time_to' => '12:00',
                'status' => 'ASSIGNED',
            ])
            ->assertForbidden();

        $this->actingAs($dispatcher)
            ->delete(route('dispatcher.orders.destroy', $order))
            ->assertForbidden();
    }

    public function test_dispatcher_cannot_create_order_with_foreign_client_or_address(): void
    {
        $organizationA = Organization::factory()->create();
        $organizationB = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organizationA->id)->create();
        [$clientB, $addressB] = $this->createClientAndAddress($organizationB);

        $this->actingAs($dispatcher)
            ->from(route('dispatcher.orders.create'))
            ->post(route('dispatcher.orders.store'), [
                'client_id' => $clientB->id,
                'address_id' => $addressB->id,
                'date' => '2026-04-01',
                'time_from' => '09:00',
                'time_to' => '11:00',
                'status' => 'NEW',
            ])
            ->assertRedirect(route('dispatcher.orders.create'))
            ->assertSessionHasErrors(['client_id', 'address_id']);
    }

    public function test_admin_can_manage_orders_for_any_organization(): void
    {
        $organizationA = Organization::factory()->create();
        $organizationB = Organization::factory()->create();
        $admin = User::factory()->admin()->create();
        [$clientA, $addressA] = $this->createClientAndAddress($organizationA);
        [$clientB, $addressB] = $this->createClientAndAddress($organizationB);

        $this->actingAs($admin)
            ->post(route('dispatcher.orders.store'), [
                'organization_id' => $organizationA->id,
                'client_id' => $clientA->id,
                'address_id' => $addressA->id,
                'date' => '2026-04-01',
                'time_from' => '08:00',
                'time_to' => '10:00',
                'status' => 'NEW',
                'notes' => 'Admin order',
            ])
            ->assertRedirect(route('dispatcher.orders.index'));

        $order = Order::query()->where('notes', 'Admin order')->firstOrFail();

        $this->actingAs($admin)
            ->patch(route('dispatcher.orders.update', $order), [
                'organization_id' => $organizationB->id,
                'client_id' => $clientB->id,
                'address_id' => $addressB->id,
                'date' => '2026-04-03',
                'time_from' => '13:00',
                'time_to' => '15:00',
                'status' => 'IN_PROGRESS',
                'notes' => 'Moved order',
            ])
            ->assertRedirect(route('dispatcher.orders.index'));

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'organization_id' => $organizationB->id,
            'client_id' => $clientB->id,
            'address_id' => $addressB->id,
            'status' => 'IN_PROGRESS',
        ]);
    }

    public function test_courier_is_forbidden_from_dispatcher_order_routes(): void
    {
        $organization = Organization::factory()->create();
        $courier = User::factory()->courier($organization->id)->create();
        [$client, $address] = $this->createClientAndAddress($organization);
        $order = Order::factory()->create([
            'organization_id' => $organization->id,
            'client_id' => $client->id,
            'address_id' => $address->id,
        ]);

        $this->actingAs($courier)
            ->get(route('dispatcher.orders.index'))
            ->assertForbidden();

        $this->actingAs($courier)
            ->get(route('dispatcher.orders.create'))
            ->assertForbidden();

        $this->actingAs($courier)
            ->get(route('dispatcher.orders.edit', $order))
            ->assertForbidden();

        $this->actingAs($courier)
            ->post(route('dispatcher.orders.store'), [
                'client_id' => $client->id,
                'address_id' => $address->id,
                'date' => '2026-04-01',
                'time_from' => '09:00',
                'time_to' => '11:00',
                'status' => 'NEW',
            ])
            ->assertForbidden();
    }

    public function test_order_store_validation_requires_valid_time_window(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        [$client, $address] = $this->createClientAndAddress($organization);

        $this->actingAs($dispatcher)
            ->from(route('dispatcher.orders.create'))
            ->post(route('dispatcher.orders.store'), [
                'client_id' => $client->id,
                'address_id' => $address->id,
                'date' => '2026-04-01',
                'time_from' => '12:00',
                'time_to' => '11:00',
                'status' => 'NOT_VALID',
            ])
            ->assertRedirect(route('dispatcher.orders.create'))
            ->assertSessionHasErrors(['time_to', 'status']);
    }

    /**
     * @return array{0: Client, 1: Address}
     */
    private function createClientAndAddress(Organization $organization): array
    {
        $client = Client::factory()->create([
            'organization_id' => $organization->id,
        ]);

        $address = Address::factory()->create([
            'organization_id' => $organization->id,
        ]);

        return [$client, $address];
    }
}
