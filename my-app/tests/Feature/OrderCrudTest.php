<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Client;
use App\Models\Courier;
use App\Models\DeliveryRoute;
use App\Models\Order;
use App\Models\Organization;
use App\Models\RouteStop;
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

        Order::factory()->create([
            'organization_id' => $organization->id,
            'client_id' => $clientA->id,
            'address_id' => $addressA->id,
            'date' => '2026-05-11',
            'status' => 'ASSIGNED',
        ]);

        $this->actingAs($dispatcher)
            ->get(route('dispatcher.orders.index', [
                'date' => '2026-04-10',
                'status' => 'ASSIGNED',
                'search' => $clientA->name,
                'sort' => 'updated_desc',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dispatcher/orders/index')
                ->has('orders', 1)
                ->where('orders.0.id', $matchingOrder->id)
                ->where('filters.date', '2026-04-10')
                ->where('filters.status', 'ASSIGNED')
                ->where('filters.search', $clientA->name)
                ->where('filters.sort', 'updated_desc'));

        $this->actingAs($dispatcher)
            ->get(route('dispatcher.orders.index', [
                'search' => 'apri',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dispatcher/orders/index')
                ->has('orders', 3)
                ->where('filters.search', 'apri'));
    }

    public function test_dispatcher_can_export_filtered_orders_to_csv(): void
    {
        $organizationA = Organization::factory()->create();
        $organizationB = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organizationA->id)->create();
        [$clientA, $addressA] = $this->createClientAndAddress($organizationA);
        [$clientB, $addressB] = $this->createClientAndAddress($organizationB);

        $matchingOrder = Order::factory()->create([
            'organization_id' => $organizationA->id,
            'client_id' => $clientA->id,
            'address_id' => $addressA->id,
            'status' => 'PENDING',
            'notes' => 'Export me',
        ]);

        Order::factory()->create([
            'organization_id' => $organizationB->id,
            'client_id' => $clientB->id,
            'address_id' => $addressB->id,
            'status' => 'PENDING',
            'notes' => 'Do not export me',
        ]);

        $response = $this->actingAs($dispatcher)
            ->get(route('dispatcher.orders.export', [
                'status' => 'PENDING',
                'search' => $clientA->name,
            ]));

        $response
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');

        $content = $response->streamedContent();

        $this->assertStringContainsString((string) $matchingOrder->id, $content);
        $this->assertStringContainsString('Export me', $content);
        $this->assertStringNotContainsString('Do not export me', $content);
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
                'notes' => 'Morning delivery',
            ])
            ->assertRedirect(route('dispatcher.orders.index'));

        $order = Order::query()->where('notes', 'Morning delivery')->firstOrFail();

        $this->assertSame($organization->id, $order->organization_id);
        $this->assertSame('NEW', $order->status);

        $this->actingAs($dispatcher)
            ->patch(route('dispatcher.orders.update', $order), [
                'client_id' => $client->id,
                'address_id' => $address->id,
                'date' => '2026-04-02',
                'time_from' => '10:00',
                'time_to' => '12:00',
                'notes' => 'Updated order',
            ])
            ->assertRedirect(route('dispatcher.orders.index'));

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'organization_id' => $organization->id,
            'status' => 'NEW',
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
            ])
            ->assertRedirect(route('dispatcher.orders.create'))
            ->assertSessionHasErrors(['client_id', 'address_id']);
    }

    public function test_admin_cannot_create_order_with_client_or_address_from_different_selected_organization(): void
    {
        $organizationA = Organization::factory()->create();
        $organizationB = Organization::factory()->create();
        $admin = User::factory()->admin()->create();
        [$clientB, $addressB] = $this->createClientAndAddress($organizationB);

        $this->actingAs($admin)
            ->from(route('dispatcher.orders.create'))
            ->post(route('dispatcher.orders.store'), [
                'organization_id' => $organizationA->id,
                'client_id' => $clientB->id,
                'address_id' => $addressB->id,
                'date' => '2026-04-01',
                'time_from' => '09:00',
                'time_to' => '11:00',
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
                'notes' => 'Moved order',
            ])
            ->assertRedirect(route('dispatcher.orders.index'));

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'organization_id' => $organizationB->id,
            'client_id' => $clientB->id,
            'address_id' => $addressB->id,
            'status' => 'NEW',
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
            ])
            ->assertRedirect(route('dispatcher.orders.create'))
            ->assertSessionHasErrors(['time_to']);
    }

    public function test_order_status_is_not_manually_set_from_create_or_edit_forms(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        [$client, $address] = $this->createClientAndAddress($organization);
        $order = Order::factory()->create([
            'organization_id' => $organization->id,
            'client_id' => $client->id,
            'address_id' => $address->id,
            'status' => 'ASSIGNED',
        ]);

        $this->actingAs($dispatcher)
            ->from(route('dispatcher.orders.create'))
            ->post(route('dispatcher.orders.store'), [
                'client_id' => $client->id,
                'address_id' => $address->id,
                'date' => '2026-04-01',
                'time_from' => '09:00',
                'time_to' => '11:00',
                'status' => 'FAILED',
            ])
            ->assertRedirect(route('dispatcher.orders.create'))
            ->assertSessionHasErrors(['status']);

        $this->actingAs($dispatcher)
            ->from(route('dispatcher.orders.edit', $order))
            ->patch(route('dispatcher.orders.update', $order), [
                'client_id' => $client->id,
                'address_id' => $address->id,
                'date' => '2026-04-02',
                'time_from' => '10:00',
                'time_to' => '12:00',
                'status' => 'COMPLETED',
            ])
            ->assertRedirect(route('dispatcher.orders.edit', $order))
            ->assertSessionHasErrors(['status']);
    }

    public function test_dispatcher_can_cancel_unstarted_order_and_remove_pending_route_stop(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        $courierUser = User::factory()->courier($organization->id)->create();
        Courier::query()->create([
            'user_id' => $courierUser->id,
            'on_duty' => true,
        ]);
        [$client, $address] = $this->createClientAndAddress($organization);
        $order = Order::factory()->create([
            'organization_id' => $organization->id,
            'client_id' => $client->id,
            'address_id' => $address->id,
            'status' => 'ASSIGNED',
            'date' => '2026-04-10',
            'time_from' => '09:00:00',
        ]);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courierUser->id,
            'date' => '2026-04-10',
            'status' => 'PLANNED',
        ]);
        $routeStop = RouteStop::factory()->create([
            'organization_id' => $organization->id,
            'route_id' => $deliveryRoute->id,
            'order_id' => $order->id,
            'seq_no' => 1,
            'status' => 'PENDING',
        ]);

        $this->actingAs($dispatcher)
            ->patch(route('dispatcher.orders.cancel', $order))
            ->assertRedirect(route('dispatcher.orders.index'));

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'CANCELLED',
        ]);
        $this->assertDatabaseMissing('route_stops', [
            'id' => $routeStop->id,
        ]);
        $this->assertDatabaseHas('routes', [
            'id' => $deliveryRoute->id,
            'status' => 'PLANNED',
        ]);
    }

    public function test_order_cancel_and_delete_are_blocked_after_delivery_starts(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        $courierUser = User::factory()->courier($organization->id)->create();
        Courier::query()->create([
            'user_id' => $courierUser->id,
            'on_duty' => true,
        ]);
        [$client, $address] = $this->createClientAndAddress($organization);
        $order = Order::factory()->create([
            'organization_id' => $organization->id,
            'client_id' => $client->id,
            'address_id' => $address->id,
            'status' => 'IN_PROGRESS',
        ]);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courierUser->id,
            'status' => 'IN_PROGRESS',
        ]);
        RouteStop::factory()->create([
            'organization_id' => $organization->id,
            'route_id' => $deliveryRoute->id,
            'order_id' => $order->id,
            'seq_no' => 1,
            'status' => 'COMPLETED',
        ]);

        $this->actingAs($dispatcher)
            ->from(route('dispatcher.orders.index'))
            ->patch(route('dispatcher.orders.cancel', $order))
            ->assertRedirect(route('dispatcher.orders.index'))
            ->assertSessionHasErrors(['order']);

        $this->actingAs($dispatcher)
            ->from(route('dispatcher.orders.index'))
            ->delete(route('dispatcher.orders.destroy', $order))
            ->assertRedirect(route('dispatcher.orders.index'))
            ->assertSessionHasErrors(['order']);
    }

    public function test_assigned_order_date_must_match_route_date_when_updating(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        $courierUser = User::factory()->courier($organization->id)->create();
        Courier::query()->create([
            'user_id' => $courierUser->id,
            'on_duty' => true,
        ]);
        [$client, $address] = $this->createClientAndAddress($organization);
        $order = Order::factory()->create([
            'organization_id' => $organization->id,
            'client_id' => $client->id,
            'address_id' => $address->id,
            'status' => 'ASSIGNED',
            'date' => '2026-04-10',
            'time_from' => '09:00:00',
            'time_to' => '11:00:00',
        ]);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courierUser->id,
            'date' => '2026-04-10',
            'status' => 'PLANNED',
        ]);
        RouteStop::factory()->create([
            'organization_id' => $organization->id,
            'route_id' => $deliveryRoute->id,
            'order_id' => $order->id,
            'seq_no' => 1,
            'status' => 'PENDING',
        ]);

        $this->actingAs($dispatcher)
            ->from(route('dispatcher.orders.edit', $order))
            ->patch(route('dispatcher.orders.update', $order), [
                'client_id' => $client->id,
                'address_id' => $address->id,
                'date' => '2026-04-11',
                'time_from' => '10:00',
                'time_to' => '12:00',
            ])
            ->assertRedirect(route('dispatcher.orders.edit', $order))
            ->assertSessionHasErrors(['date']);
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
