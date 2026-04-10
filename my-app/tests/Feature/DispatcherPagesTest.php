<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Client;
use App\Models\Courier;
use App\Models\DeliveryRoute;
use App\Models\Order;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DispatcherPagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_from_dispatcher_pages(): void
    {
        $this->get('/dispatcher/clients')->assertRedirect(route('login'));
        $this->get('/dispatcher/addresses')->assertRedirect(route('login'));
        $this->get('/dispatcher/orders')->assertRedirect(route('login'));
        $this->get('/dispatcher/routes')->assertRedirect(route('login'));
    }

    public function test_dispatcher_can_open_dispatcher_pages(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();
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
        ]);
        $courier = User::factory()->courier($organization->id)->create();

        Courier::query()->create([
            'user_id' => $courier->id,
            'on_duty' => false,
        ]);

        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
        ]);

        $this->actingAs($dispatcher);

        $this->get('/dispatcher/clients')->assertOk();
        $this->get('/dispatcher/clients/create')->assertOk();
        $this->get("/dispatcher/clients/{$client->id}/edit")->assertOk();
        $this->get('/dispatcher/addresses')->assertOk();
        $this->get('/dispatcher/addresses/create')->assertOk();
        $this->get("/dispatcher/addresses/{$address->id}/edit")->assertOk();
        $this->get('/dispatcher/orders')->assertOk();
        $this->get('/dispatcher/orders/create')->assertOk();
        $this->get("/dispatcher/orders/{$order->id}/edit")->assertOk();
        $this->get('/dispatcher/routes')->assertOk();
        $this->get('/dispatcher/routes/create')->assertOk();
        $this->get("/dispatcher/routes/{$deliveryRoute->id}")->assertOk();
    }

    public function test_admin_can_open_dispatcher_pages(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin);

        $this->get('/dispatcher/clients')->assertOk();
        $this->get('/dispatcher/addresses')->assertOk();
        $this->get('/dispatcher/orders')->assertOk();
        $this->get('/dispatcher/routes')->assertOk();
    }

    public function test_courier_is_forbidden_from_dispatcher_pages(): void
    {
        $organization = Organization::factory()->create();
        $courier = User::factory()->courier($organization->id)->create();

        $this->actingAs($courier);

        $this->get('/dispatcher/clients')->assertForbidden();
        $this->get('/dispatcher/addresses')->assertForbidden();
        $this->get('/dispatcher/orders')->assertForbidden();
        $this->get('/dispatcher/routes')->assertForbidden();
    }
}
