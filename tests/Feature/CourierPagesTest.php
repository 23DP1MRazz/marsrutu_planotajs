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
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CourierPagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_courier_page(): void
    {
        $this->get('/courier/today-route')->assertRedirect(route('login'));
    }

    public function test_courier_dashboard_shows_today_route_page(): void
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
                ->has('stops', 0)
                ->where('dashboardSummary.done_routes', 0)
                ->where('dashboardSummary.completed_orders', 0)
                ->where('dashboardSummary.upcoming_routes_count', 0)
                ->where('deliveryRoute', null));
    }

    public function test_courier_today_route_page_is_accessible(): void
    {
        $organization = Organization::factory()->create();
        $courier = User::factory()->courier($organization->id)->create();

        Courier::query()->create([
            'user_id' => $courier->id,
            'on_duty' => false,
        ]);

        $this->actingAs($courier)
            ->get('/courier/today-route')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('courier/route')
                ->where('deliveryRoute', null));
    }

    public function test_courier_dashboard_includes_summary_counts_and_upcoming_routes(): void
    {
        $organization = Organization::factory()->create();
        $courier = User::factory()->courier($organization->id)->create();

        Courier::query()->create([
            'user_id' => $courier->id,
            'on_duty' => false,
        ]);

        $client = Client::factory()->create([
            'organization_id' => $organization->id,
        ]);
        $address = Address::factory()->create([
            'organization_id' => $organization->id,
        ]);
        $order = Order::factory()->create([
            'organization_id' => $organization->id,
            'client_id' => $client->id,
            'address_id' => $address->id,
            'status' => 'COMPLETED',
        ]);

        $doneRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-19',
            'status' => 'DONE',
        ]);

        RouteStop::factory()->create([
            'organization_id' => $organization->id,
            'route_id' => $doneRoute->id,
            'order_id' => $order->id,
            'status' => 'COMPLETED',
        ]);

        $upcomingRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => Carbon::tomorrow()->toDateString(),
            'status' => 'PLANNED',
        ]);

        $futureOrder = Order::factory()->create([
            'organization_id' => $organization->id,
            'client_id' => $client->id,
            'address_id' => $address->id,
        ]);

        RouteStop::factory()->create([
            'organization_id' => $organization->id,
            'route_id' => $upcomingRoute->id,
            'order_id' => $futureOrder->id,
            'status' => 'PENDING',
        ]);

        $this->actingAs($courier)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('courier/dashboard')
                ->where('dashboardSummary.done_routes', 1)
                ->where('dashboardSummary.completed_orders', 1)
                ->where('dashboardSummary.upcoming_routes_count', 1)
                ->where('dashboardSummary.upcoming_routes.0.id', $upcomingRoute->id)
                ->where('dashboardSummary.upcoming_routes.0.stops_count', 1));
    }

    public function test_dispatcher_cannot_open_courier_page(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();

        $this->actingAs($dispatcher)
            ->get('/courier/today-route')
            ->assertForbidden();
    }

    public function test_courier_can_open_completed_and_upcoming_detail_pages(): void
    {
        $organization = Organization::factory()->create();
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

        $client = Client::factory()->create([
            'organization_id' => $organization->id,
        ]);
        $address = Address::factory()->create([
            'organization_id' => $organization->id,
        ]);

        $completedOrder = Order::factory()->create([
            'organization_id' => $organization->id,
            'client_id' => $client->id,
            'address_id' => $address->id,
            'status' => 'COMPLETED',
        ]);

        $completedRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-18',
            'status' => 'DONE',
        ]);

        RouteStop::factory()->create([
            'organization_id' => $organization->id,
            'route_id' => $completedRoute->id,
            'order_id' => $completedOrder->id,
            'status' => 'COMPLETED',
            'completed_at' => '2026-04-18 10:30:00',
        ]);

        $upcomingRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => Carbon::tomorrow()->toDateString(),
            'status' => 'PLANNED',
        ]);

        $upcomingOrder = Order::factory()->create([
            'organization_id' => $organization->id,
            'client_id' => $client->id,
            'address_id' => $address->id,
        ]);

        RouteStop::factory()->create([
            'organization_id' => $organization->id,
            'route_id' => $upcomingRoute->id,
            'order_id' => $upcomingOrder->id,
            'status' => 'PENDING',
        ]);

        DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $otherCourier->id,
            'date' => Carbon::tomorrow()->addDay()->toDateString(),
            'status' => 'PLANNED',
        ]);

        $this->actingAs($courier)
            ->get(route('courier.routes.completed'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('courier/routes')
                ->where('title', 'Done routes')
                ->where('filters.sort', 'date_desc')
                ->where('routes.0.id', $completedRoute->id)
                ->has('routes', 1));

        $this->actingAs($courier)
            ->get(route('courier.routes.upcoming'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('courier/routes')
                ->where('title', 'Upcoming routes')
                ->where('filters.sort', 'date_asc')
                ->where('routes.0.id', $upcomingRoute->id)
                ->has('routes', 1));

        $this->actingAs($courier)
            ->get(route('courier.orders.completed'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('courier/completed-orders')
                ->where('filters.sort', 'completed_desc')
                ->where('orders.0.order_id', $completedOrder->id)
                ->where('orders.0.route_id', $completedRoute->id)
                ->has('orders', 1));

        $this->actingAs($courier)
            ->get(route('courier.routes.show', $completedRoute))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('courier/route')
                ->where('readOnly', true)
                ->where('deliveryRoute.id', $completedRoute->id)
                ->where('stops.0.order_id', $completedOrder->id)
                ->has('stops', 1));

        $this->actingAs($courier)
            ->get(route('courier.routes.show', $upcomingRoute))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('courier/route')
                ->where('readOnly', true)
                ->where('deliveryRoute.id', $upcomingRoute->id)
                ->where('stops.0.order_id', $upcomingOrder->id)
                ->has('stops', 1));
    }

    public function test_courier_detail_pages_support_filtering_and_sorting(): void
    {
        $organization = Organization::factory()->create();
        $courier = User::factory()->courier($organization->id)->create();

        Courier::query()->create([
            'user_id' => $courier->id,
            'on_duty' => false,
        ]);

        $clientA = Client::factory()->create([
            'organization_id' => $organization->id,
            'name' => 'Alpha Store',
        ]);
        $clientB = Client::factory()->create([
            'organization_id' => $organization->id,
            'name' => 'Beta Shop',
        ]);
        $address = Address::factory()->create([
            'organization_id' => $organization->id,
        ]);

        $olderDoneRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-17',
            'status' => 'DONE',
        ]);
        $newerDoneRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-18',
            'status' => 'DONE',
        ]);

        $completedOrderA = Order::factory()->create([
            'organization_id' => $organization->id,
            'client_id' => $clientA->id,
            'address_id' => $address->id,
            'status' => 'COMPLETED',
        ]);
        $completedOrderB = Order::factory()->create([
            'organization_id' => $organization->id,
            'client_id' => $clientB->id,
            'address_id' => $address->id,
            'status' => 'COMPLETED',
        ]);

        RouteStop::factory()->create([
            'organization_id' => $organization->id,
            'route_id' => $olderDoneRoute->id,
            'order_id' => $completedOrderA->id,
            'status' => 'COMPLETED',
            'completed_at' => '2026-04-17 09:00:00',
        ]);
        RouteStop::factory()->create([
            'organization_id' => $organization->id,
            'route_id' => $newerDoneRoute->id,
            'order_id' => $completedOrderB->id,
            'status' => 'COMPLETED',
            'completed_at' => '2026-04-18 11:00:00',
        ]);

        $this->actingAs($courier)
            ->get(route('courier.routes.completed', [
                'search' => '2026-04-17',
                'sort' => 'date_asc',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('courier/routes')
                ->where('filters.search', '2026-04-17')
                ->where('filters.sort', 'date_asc')
                ->has('routes', 1)
                ->where('routes.0.id', $olderDoneRoute->id));

        $this->actingAs($courier)
            ->get(route('courier.orders.completed', [
                'search' => 'Beta',
                'sort' => 'completed_desc',
            ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('courier/completed-orders')
                ->where('filters.search', 'Beta')
                ->where('filters.sort', 'completed_desc')
                ->has('orders', 1)
                ->where('orders.0.order_id', $completedOrderB->id));
    }

    public function test_dispatcher_cannot_open_courier_detail_pages(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();

        $this->actingAs($dispatcher)
            ->get(route('courier.routes.completed'))
            ->assertForbidden();

        $this->actingAs($dispatcher)
            ->get(route('courier.routes.upcoming'))
            ->assertForbidden();

        $this->actingAs($dispatcher)
            ->get(route('courier.orders.completed'))
            ->assertForbidden();
    }
}
