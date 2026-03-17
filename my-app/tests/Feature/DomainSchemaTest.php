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
use App\Models\TransportVehicle;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DomainSchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_domain_records_can_be_created_for_one_organization(): void
    {
        $organization = Organization::factory()->create();
        $courierUser = User::factory()->courier($organization->id)->create();
        Courier::query()->create([
            'user_id' => $courierUser->id,
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
        ]);

        $route = DeliveryRoute::query()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courierUser->id,
            'date' => '2026-03-17',
            'status' => 'PLANNED',
        ]);

        $routeStop = RouteStop::query()->create([
            'organization_id' => $organization->id,
            'route_id' => $route->id,
            'seq_no' => 1,
            'order_id' => $order->id,
            'planned_eta' => '2026-03-17 10:00:00',
            'status' => 'PENDING',
        ]);

        $proofOfDelivery = ProofOfDelivery::query()->create([
            'organization_id' => $organization->id,
            'route_stop_id' => $routeStop->id,
            'type' => 'PHOTO',
            'file_url' => 'proofs/test-photo.jpg',
            'taken_at' => '2026-03-17 10:05:00',
        ]);

        $vehicle = TransportVehicle::query()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courierUser->id,
            'type' => 'AUTO',
            'cap_weight_kg' => 120,
            'cap_volume_l' => 350,
        ]);

        $this->assertTrue($route->organization->is($organization));
        $this->assertTrue($routeStop->route->is($route));
        $this->assertTrue($proofOfDelivery->routeStop->is($routeStop));
        $this->assertTrue($vehicle->courier->is($courierUser->courierProfile));
    }

    public function test_routes_are_unique_per_organization_courier_and_date(): void
    {
        $organization = Organization::factory()->create();
        $courierUser = User::factory()->courier($organization->id)->create();
        Courier::query()->create([
            'user_id' => $courierUser->id,
            'on_duty' => false,
        ]);

        DeliveryRoute::query()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courierUser->id,
            'date' => '2026-03-17',
            'status' => 'PLANNED',
        ]);

        $this->expectException(QueryException::class);

        DeliveryRoute::query()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courierUser->id,
            'date' => '2026-03-17',
            'status' => 'PLANNED',
        ]);
    }

    public function test_transport_vehicle_and_proof_of_delivery_are_one_to_one(): void
    {
        $organization = Organization::factory()->create();
        $courierUser = User::factory()->courier($organization->id)->create();
        Courier::query()->create([
            'user_id' => $courierUser->id,
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
        ]);

        $route = DeliveryRoute::query()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courierUser->id,
            'date' => '2026-03-18',
            'status' => 'PLANNED',
        ]);

        $routeStop = RouteStop::query()->create([
            'organization_id' => $organization->id,
            'route_id' => $route->id,
            'seq_no' => 1,
            'order_id' => $order->id,
            'planned_eta' => '2026-03-18 10:00:00',
            'status' => 'PENDING',
        ]);

        TransportVehicle::query()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courierUser->id,
            'type' => 'VELO',
            'cap_weight_kg' => 30,
            'cap_volume_l' => 80,
        ]);

        ProofOfDelivery::query()->create([
            'organization_id' => $organization->id,
            'route_stop_id' => $routeStop->id,
            'type' => 'PHOTO',
            'file_url' => 'proofs/one.jpg',
            'taken_at' => '2026-03-18 10:05:00',
        ]);

        try {
            TransportVehicle::query()->create([
                'organization_id' => $organization->id,
                'courier_user_id' => $courierUser->id,
                'type' => 'AUTO',
                'cap_weight_kg' => 120,
                'cap_volume_l' => 300,
            ]);
            $this->fail('Expected transport_vehicles unique constraint to fail.');
        } catch (QueryException $exception) {
            $this->assertTrue(true);
        }

        $this->expectException(QueryException::class);

        ProofOfDelivery::query()->create([
            'organization_id' => $organization->id,
            'route_stop_id' => $routeStop->id,
            'type' => 'SIGNATURE',
            'file_url' => 'proofs/two.jpg',
            'taken_at' => '2026-03-18 10:06:00',
        ]);
    }
}

