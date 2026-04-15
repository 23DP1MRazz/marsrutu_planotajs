<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Client;
use App\Models\Courier;
use App\Models\DeliveryRoute;
use App\Models\Order;
use App\Models\Organization;
use App\Models\ProofOfDelivery;
use App\Models\RouteStop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RoutePlanningTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-04-15 09:00:00');
    }

    public function test_dispatcher_can_create_route_and_assign_orders(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        $courier = $this->createCourier($organization);
        $orderA = $this->createOrder($organization, [
            'date' => '2026-04-15',
            'time_from' => '09:00:00',
        ]);
        $orderB = $this->createOrder($organization, [
            'date' => '2026-04-15',
            'time_from' => '11:00:00',
        ]);

        $this->actingAs($dispatcher)
            ->post(route('dispatcher.routes.store'), [
                'courier_user_id' => $courier->id,
                'date' => '2026-04-15',
                'order_ids' => [$orderB->id, $orderA->id],
            ])
            ->assertRedirect();

        $deliveryRoute = DeliveryRoute::query()->firstOrFail();

        $this->assertDatabaseHas('routes', [
            'id' => $deliveryRoute->id,
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-15',
            'status' => 'PLANNED',
        ]);

        $this->assertDatabaseHas('route_stops', [
            'route_id' => $deliveryRoute->id,
            'order_id' => $orderA->id,
            'seq_no' => 1,
            'status' => 'PENDING',
        ]);

        $this->assertDatabaseHas('route_stops', [
            'route_id' => $deliveryRoute->id,
            'order_id' => $orderB->id,
            'seq_no' => 2,
            'status' => 'PENDING',
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $orderA->id,
            'status' => 'ASSIGNED',
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $orderB->id,
            'status' => 'ASSIGNED',
        ]);
    }

    public function test_dispatcher_can_assign_more_orders_to_existing_route(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        $courier = $this->createCourier($organization);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-15',
        ]);
        $existingOrder = $this->createOrder($organization);
        $newOrder = $this->createOrder($organization);

        RouteStop::factory()->create([
            'organization_id' => $organization->id,
            'route_id' => $deliveryRoute->id,
            'order_id' => $existingOrder->id,
            'seq_no' => 1,
        ]);

        $this->actingAs($dispatcher)
            ->post(route('dispatcher.routes.orders.store', $deliveryRoute), [
                'order_ids' => [$newOrder->id],
            ])
            ->assertRedirect(route('dispatcher.routes.show', $deliveryRoute));

        $this->assertDatabaseHas('route_stops', [
            'route_id' => $deliveryRoute->id,
            'order_id' => $newOrder->id,
            'seq_no' => 2,
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $newOrder->id,
            'status' => 'ASSIGNED',
        ]);
    }

    public function test_dispatcher_cannot_create_duplicate_route_for_same_courier_and_date(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        $courier = $this->createCourier($organization);

        DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-15',
        ]);

        $this->actingAs($dispatcher)
            ->from(route('dispatcher.routes.create'))
            ->post(route('dispatcher.routes.store'), [
                'courier_user_id' => $courier->id,
                'date' => '2026-04-15',
            ])
            ->assertRedirect(route('dispatcher.routes.create'))
            ->assertSessionHasErrors(['courier_user_id']);
    }

    public function test_dispatcher_cannot_use_foreign_courier_or_foreign_order(): void
    {
        $organizationA = Organization::factory()->create();
        $organizationB = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organizationA->id)->create();
        $foreignCourier = $this->createCourier($organizationB);
        $foreignOrder = $this->createOrder($organizationB);

        $this->actingAs($dispatcher)
            ->from(route('dispatcher.routes.create'))
            ->post(route('dispatcher.routes.store'), [
                'courier_user_id' => $foreignCourier->id,
                'date' => '2026-04-15',
                'order_ids' => [$foreignOrder->id],
            ])
            ->assertRedirect(route('dispatcher.routes.create'))
            ->assertSessionHasErrors(['courier_user_id', 'order_ids.0']);
    }

    public function test_assigned_order_cannot_be_assigned_again(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        $courierA = $this->createCourier($organization);
        $courierB = $this->createCourier($organization);
        $order = $this->createOrder($organization, ['status' => 'ASSIGNED']);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courierA->id,
            'date' => '2026-04-15',
        ]);

        RouteStop::factory()->create([
            'organization_id' => $organization->id,
            'route_id' => $deliveryRoute->id,
            'order_id' => $order->id,
            'seq_no' => 1,
        ]);

        $this->actingAs($dispatcher)
            ->from(route('dispatcher.routes.create'))
            ->post(route('dispatcher.routes.store'), [
                'courier_user_id' => $courierB->id,
                'date' => '2026-04-16',
                'order_ids' => [$order->id],
            ])
            ->assertRedirect(route('dispatcher.routes.create'))
            ->assertSessionHasErrors(['order_ids.0']);
    }

    public function test_route_pages_are_scoped_to_dispatcher_organization(): void
    {
        $organizationA = Organization::factory()->create();
        $organizationB = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organizationA->id)->create();
        $courierA = $this->createCourier($organizationA);
        $courierB = $this->createCourier($organizationB);
        $routeA = DeliveryRoute::factory()->create([
            'organization_id' => $organizationA->id,
            'courier_user_id' => $courierA->id,
            'date' => '2026-04-15',
        ]);
        $routeB = DeliveryRoute::factory()->create([
            'organization_id' => $organizationB->id,
            'courier_user_id' => $courierB->id,
            'date' => '2026-04-15',
        ]);

        $this->actingAs($dispatcher)
            ->get(route('dispatcher.routes.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dispatcher/routes/index')
                ->has('deliveryRoutes', 1)
                ->where('deliveryRoutes.0.id', $routeA->id));

        $this->actingAs($dispatcher)
            ->get(route('dispatcher.routes.show', $routeB))
            ->assertForbidden();
    }

    public function test_route_create_page_defaults_date_to_today(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();

        $this->actingAs($dispatcher)
            ->get(route('dispatcher.routes.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dispatcher/routes/create')
                ->where('todayDate', '2026-04-15'));
    }

    public function test_dispatcher_can_reorder_stops_for_own_route(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        $courier = $this->createCourier($organization);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-15',
        ]);
        $firstOrder = $this->createOrder($organization, [
            'date' => '2026-04-15',
            'time_from' => '09:00:00',
        ]);
        $secondOrder = $this->createOrder($organization, [
            'date' => '2026-04-15',
            'time_from' => '11:30:00',
        ]);

        $firstStop = RouteStop::factory()->create([
            'organization_id' => $organization->id,
            'route_id' => $deliveryRoute->id,
            'order_id' => $firstOrder->id,
            'seq_no' => 1,
            'planned_eta' => '2026-04-15 09:00:00',
        ]);

        $secondStop = RouteStop::factory()->create([
            'organization_id' => $organization->id,
            'route_id' => $deliveryRoute->id,
            'order_id' => $secondOrder->id,
            'seq_no' => 2,
            'planned_eta' => '2026-04-15 11:30:00',
        ]);

        $this->actingAs($dispatcher)
            ->patch(route('dispatcher.routes.stops.reorder', $deliveryRoute), [
                'stop_ids' => [$secondStop->id, $firstStop->id],
            ])
            ->assertRedirect(route('dispatcher.routes.show', $deliveryRoute));

        $this->assertDatabaseHas('route_stops', [
            'id' => $secondStop->id,
            'seq_no' => 1,
            'planned_eta' => '2026-04-15 11:30:00',
        ]);

        $this->assertDatabaseHas('route_stops', [
            'id' => $firstStop->id,
            'seq_no' => 2,
            'planned_eta' => '2026-04-15 09:00:00',
        ]);
    }

    public function test_dispatcher_can_see_proof_of_delivery_link_on_route_details(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        $courier = $this->createCourier($organization);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-15',
        ]);
        $order = $this->createOrder($organization);
        $routeStop = RouteStop::factory()->create([
            'organization_id' => $organization->id,
            'route_id' => $deliveryRoute->id,
            'order_id' => $order->id,
            'seq_no' => 1,
        ]);

        $proof = ProofOfDelivery::query()->create([
            'organization_id' => $organization->id,
            'route_stop_id' => $routeStop->id,
            'type' => 'PHOTO',
            'file_url' => '/storage/proof-of-delivery/proof.jpg',
            'taken_at' => '2026-04-15 10:00:00',
        ]);

        $this->actingAs($dispatcher)
            ->get(route('dispatcher.routes.show', $deliveryRoute))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dispatcher/routes/show')
                ->where('stops.0.proof_view_url', route('proof-of-delivery.show', $proof)));
    }

    public function test_dispatcher_cannot_reorder_route_with_missing_or_foreign_stops(): void
    {
        $organizationA = Organization::factory()->create();
        $organizationB = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organizationA->id)->create();
        $courierA = $this->createCourier($organizationA);
        $courierB = $this->createCourier($organizationB);
        $routeA = DeliveryRoute::factory()->create([
            'organization_id' => $organizationA->id,
            'courier_user_id' => $courierA->id,
        ]);
        $routeB = DeliveryRoute::factory()->create([
            'organization_id' => $organizationB->id,
            'courier_user_id' => $courierB->id,
        ]);
        $orderA = $this->createOrder($organizationA);
        $orderB = $this->createOrder($organizationB);

        $stopA = RouteStop::factory()->create([
            'organization_id' => $organizationA->id,
            'route_id' => $routeA->id,
            'order_id' => $orderA->id,
            'seq_no' => 1,
        ]);

        $foreignStop = RouteStop::factory()->create([
            'organization_id' => $organizationB->id,
            'route_id' => $routeB->id,
            'order_id' => $orderB->id,
            'seq_no' => 1,
        ]);

        $this->actingAs($dispatcher)
            ->from(route('dispatcher.routes.show', $routeA))
            ->patch(route('dispatcher.routes.stops.reorder', $routeA), [
                'stop_ids' => [$stopA->id, $foreignStop->id],
            ])
            ->assertRedirect(route('dispatcher.routes.show', $routeA))
            ->assertSessionHasErrors(['stop_ids.1', 'stop_ids']);
    }

    public function test_dispatcher_cannot_reorder_route_with_partial_stop_list(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        $courier = $this->createCourier($organization);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
        ]);
        $firstOrder = $this->createOrder($organization);
        $secondOrder = $this->createOrder($organization);

        $firstStop = RouteStop::factory()->create([
            'organization_id' => $organization->id,
            'route_id' => $deliveryRoute->id,
            'order_id' => $firstOrder->id,
            'seq_no' => 1,
        ]);

        $secondStop = RouteStop::factory()->create([
            'organization_id' => $organization->id,
            'route_id' => $deliveryRoute->id,
            'order_id' => $secondOrder->id,
            'seq_no' => 2,
        ]);

        $this->actingAs($dispatcher)
            ->from(route('dispatcher.routes.show', $deliveryRoute))
            ->patch(route('dispatcher.routes.stops.reorder', $deliveryRoute), [
                'stop_ids' => [$firstStop->id],
            ])
            ->assertRedirect(route('dispatcher.routes.show', $deliveryRoute))
            ->assertSessionHasErrors(['stop_ids']);

        $this->assertDatabaseHas('route_stops', [
            'id' => $firstStop->id,
            'seq_no' => 1,
        ]);

        $this->assertDatabaseHas('route_stops', [
            'id' => $secondStop->id,
            'seq_no' => 2,
        ]);
    }

    public function test_dispatcher_cannot_reorder_route_with_duplicate_stop_ids(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        $courier = $this->createCourier($organization);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
        ]);
        $firstOrder = $this->createOrder($organization);
        $secondOrder = $this->createOrder($organization);

        $firstStop = RouteStop::factory()->create([
            'organization_id' => $organization->id,
            'route_id' => $deliveryRoute->id,
            'order_id' => $firstOrder->id,
            'seq_no' => 1,
        ]);

        $secondStop = RouteStop::factory()->create([
            'organization_id' => $organization->id,
            'route_id' => $deliveryRoute->id,
            'order_id' => $secondOrder->id,
            'seq_no' => 2,
        ]);

        $this->actingAs($dispatcher)
            ->from(route('dispatcher.routes.show', $deliveryRoute))
            ->patch(route('dispatcher.routes.stops.reorder', $deliveryRoute), [
                'stop_ids' => [$firstStop->id, $firstStop->id],
            ])
            ->assertRedirect(route('dispatcher.routes.show', $deliveryRoute))
            ->assertSessionHasErrors(['stop_ids.1', 'stop_ids']);

        $this->assertDatabaseHas('route_stops', [
            'id' => $firstStop->id,
            'seq_no' => 1,
        ]);

        $this->assertDatabaseHas('route_stops', [
            'id' => $secondStop->id,
            'seq_no' => 2,
        ]);
    }

    private function createCourier(Organization $organization): User
    {
        $courier = User::factory()->courier($organization->id)->create();

        Courier::query()->create([
            'user_id' => $courier->id,
            'on_duty' => false,
        ]);

        return $courier;
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function createOrder(Organization $organization, array $attributes = []): Order
    {
        $client = Client::factory()->create([
            'organization_id' => $organization->id,
        ]);

        $address = Address::factory()->create([
            'organization_id' => $organization->id,
        ]);

        return Order::factory()->create(array_merge([
            'organization_id' => $organization->id,
            'client_id' => $client->id,
            'address_id' => $address->id,
            'status' => 'NEW',
        ], $attributes));
    }
}
