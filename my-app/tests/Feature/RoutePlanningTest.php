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

    public function test_dispatcher_can_assign_pending_order_to_existing_route(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        $courier = $this->createCourier($organization);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-15',
        ]);
        $pendingOrder = $this->createOrder($organization, ['status' => 'PENDING']);

        $this->actingAs($dispatcher)
            ->post(route('dispatcher.routes.orders.store', $deliveryRoute), [
                'order_ids' => [$pendingOrder->id],
            ])
            ->assertRedirect(route('dispatcher.routes.show', $deliveryRoute));

        $this->assertDatabaseHas('route_stops', [
            'route_id' => $deliveryRoute->id,
            'order_id' => $pendingOrder->id,
            'seq_no' => 1,
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $pendingOrder->id,
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

    public function test_dispatcher_can_create_route_with_pending_order(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        $courier = $this->createCourier($organization);
        $pendingOrder = $this->createOrder($organization, ['status' => 'PENDING']);

        $this->actingAs($dispatcher)
            ->post(route('dispatcher.routes.store'), [
                'courier_user_id' => $courier->id,
                'date' => '2026-04-15',
                'order_ids' => [$pendingOrder->id],
            ])
            ->assertRedirect();

        $deliveryRoute = DeliveryRoute::query()->firstOrFail();

        $this->assertDatabaseHas('route_stops', [
            'route_id' => $deliveryRoute->id,
            'order_id' => $pendingOrder->id,
            'seq_no' => 1,
            'status' => 'PENDING',
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $pendingOrder->id,
            'status' => 'ASSIGNED',
        ]);
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

    public function test_dispatcher_can_filter_and_sort_routes(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        $annaCourier = $this->createCourier($organization);
        $annaCourier->update(['name' => 'Anna Courier']);
        $borisCourier = $this->createCourier($organization);
        $borisCourier->update(['name' => 'Boris Courier']);

        $annaRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $annaCourier->id,
            'date' => '2026-04-15',
            'status' => 'PLANNED',
        ]);

        $borisRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $borisCourier->id,
            'date' => '2026-04-15',
            'status' => 'PLANNED',
        ]);

        $this->actingAs($dispatcher)
            ->get(route('dispatcher.routes.index', [
                'date' => '2026-04-15',
                'status' => 'PLANNED',
                'search' => 'Courier',
                'sort' => 'courier_desc',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dispatcher/routes/index')
                ->has('deliveryRoutes', 2)
                ->where('deliveryRoutes.0.id', $borisRoute->id)
                ->where('deliveryRoutes.1.id', $annaRoute->id)
                ->where('filters.sort', 'courier_desc')
                ->where('filters.status', 'PLANNED'));

        $this->actingAs($dispatcher)
            ->get(route('dispatcher.routes.index', [
                'search' => 'apri',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dispatcher/routes/index')
                ->has('deliveryRoutes', 2)
                ->where('filters.search', 'apri'));
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

    public function test_dispatcher_can_export_filtered_routes_to_csv(): void
    {
        $organizationA = Organization::factory()->create(['name' => 'Alpha Org']);
        $organizationB = Organization::factory()->create(['name' => 'Beta Org']);
        $dispatcher = User::factory()->dispatcher($organizationA->id)->create();
        $courierA = $this->createCourier($organizationA);
        $courierA->update(['name' => 'Alpha Courier']);
        $courierB = $this->createCourier($organizationB);
        $courierB->update(['name' => 'Beta Courier']);

        $routeA = DeliveryRoute::factory()->create([
            'organization_id' => $organizationA->id,
            'courier_user_id' => $courierA->id,
            'date' => '2026-04-15',
            'status' => 'PLANNED',
        ]);

        $routeB = DeliveryRoute::factory()->create([
            'organization_id' => $organizationB->id,
            'courier_user_id' => $courierB->id,
            'date' => '2026-04-15',
            'status' => 'PLANNED',
        ]);

        $orderA = $this->createOrder($organizationA);
        $orderB = $this->createOrder($organizationB);

        RouteStop::factory()->create([
            'organization_id' => $organizationA->id,
            'route_id' => $routeA->id,
            'order_id' => $orderA->id,
            'seq_no' => 1,
            'status' => 'PENDING',
        ]);

        RouteStop::factory()->create([
            'organization_id' => $organizationB->id,
            'route_id' => $routeB->id,
            'order_id' => $orderB->id,
            'seq_no' => 1,
            'status' => 'PENDING',
        ]);

        $response = $this->actingAs($dispatcher)
            ->get(route('dispatcher.routes.export', [
                'status' => 'PLANNED',
                'date' => '2026-04-15',
            ]));

        $response
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');

        $content = $response->streamedContent();

        $this->assertStringContainsString('Alpha Courier', $content);
        $this->assertStringContainsString('Alpha Org', $content);
        $this->assertStringNotContainsString('Beta Courier', $content);
        $this->assertStringNotContainsString('Beta Org', $content);
    }

    public function test_dispatcher_can_open_printable_route_sheet(): void
    {
        $organization = Organization::factory()->create(['name' => 'Route Org']);
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        $courier = $this->createCourier($organization);
        $courier->update(['name' => 'Print Courier']);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-15',
            'status' => 'PLANNED',
        ]);
        $order = $this->createOrder($organization);

        RouteStop::factory()->create([
            'organization_id' => $organization->id,
            'route_id' => $deliveryRoute->id,
            'order_id' => $order->id,
            'seq_no' => 1,
            'status' => 'PENDING',
        ]);

        $this->actingAs($dispatcher)
            ->get(route('dispatcher.routes.print', $deliveryRoute))
            ->assertOk()
            ->assertSee('Route sheet #'.$deliveryRoute->id)
            ->assertSee('Route Org')
            ->assertSee('Print Courier');
    }

    public function test_dispatcher_can_remove_pending_stop_and_recompute_route(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        $courier = $this->createCourier($organization);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-15',
            'status' => 'IN_PROGRESS',
        ]);
        $completedOrder = $this->createOrder($organization, ['status' => 'COMPLETED']);
        $pendingOrder = $this->createOrder($organization, ['status' => 'ASSIGNED']);

        $completedStop = RouteStop::factory()->create([
            'organization_id' => $organization->id,
            'route_id' => $deliveryRoute->id,
            'order_id' => $completedOrder->id,
            'seq_no' => 1,
            'status' => 'COMPLETED',
            'planned_eta' => '2026-04-15 09:00:00',
            'completed_at' => '2026-04-15 09:30:00',
        ]);

        $pendingStop = RouteStop::factory()->create([
            'organization_id' => $organization->id,
            'route_id' => $deliveryRoute->id,
            'order_id' => $pendingOrder->id,
            'seq_no' => 2,
            'status' => 'PENDING',
            'planned_eta' => '2026-04-15 10:00:00',
        ]);

        $this->actingAs($dispatcher)
            ->delete(route('dispatcher.routes.stops.destroy', [$deliveryRoute, $pendingStop]))
            ->assertRedirect(route('dispatcher.routes.show', $deliveryRoute));

        $this->assertDatabaseMissing('route_stops', [
            'id' => $pendingStop->id,
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $pendingOrder->id,
            'status' => 'PENDING',
        ]);

        $this->assertDatabaseHas('route_stops', [
            'id' => $completedStop->id,
            'seq_no' => 1,
            'status' => 'COMPLETED',
        ]);

        $this->assertDatabaseHas('routes', [
            'id' => $deliveryRoute->id,
            'status' => 'DONE',
        ]);
    }

    public function test_dispatcher_route_details_include_stop_coordinates_for_map(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        $courier = $this->createCourier($organization);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-15',
        ]);
        $address = Address::factory()->create([
            'organization_id' => $organization->id,
            'city' => 'Riga',
            'street' => 'Brivibas iela 1',
            'lat' => 56.9496,
            'lng' => 24.1052,
        ]);
        $client = Client::factory()->create([
            'organization_id' => $organization->id,
        ]);
        $order = Order::factory()->create([
            'organization_id' => $organization->id,
            'client_id' => $client->id,
            'address_id' => $address->id,
        ]);
        RouteStop::factory()->create([
            'organization_id' => $organization->id,
            'route_id' => $deliveryRoute->id,
            'order_id' => $order->id,
            'seq_no' => 1,
        ]);

        $this->actingAs($dispatcher)
            ->get(route('dispatcher.routes.show', $deliveryRoute))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('dispatcher/routes/show')
                ->where('stops.0.lat', 56.9496)
                ->where('stops.0.lng', 24.1052)
                ->where('stops.0.address_label', 'Riga, Brivibas iela 1'));
    }

    public function test_dispatcher_cannot_remove_progressed_stop_from_route(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
        $courier = $this->createCourier($organization);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-15',
            'status' => 'IN_PROGRESS',
        ]);
        $order = $this->createOrder($organization, ['status' => 'ASSIGNED']);

        $routeStop = RouteStop::factory()->create([
            'organization_id' => $organization->id,
            'route_id' => $deliveryRoute->id,
            'order_id' => $order->id,
            'seq_no' => 1,
            'status' => 'ARRIVED',
        ]);

        $this->actingAs($dispatcher)
            ->from(route('dispatcher.routes.show', $deliveryRoute))
            ->delete(route('dispatcher.routes.stops.destroy', [$deliveryRoute, $routeStop]))
            ->assertRedirect(route('dispatcher.routes.show', $deliveryRoute))
            ->assertSessionHasErrors(['route_stop']);

        $this->assertDatabaseHas('route_stops', [
            'id' => $routeStop->id,
            'status' => 'ARRIVED',
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'ASSIGNED',
        ]);
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
