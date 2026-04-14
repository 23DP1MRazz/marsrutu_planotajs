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
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CourierRouteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-04-15 09:00:00');
    }

    public function test_courier_can_fetch_only_todays_own_route(): void
    {
        $organization = Organization::factory()->create();
        $courier = $this->createCourier($organization);
        $todayRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-15',
        ]);
        DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-16',
        ]);
        $stop = $this->createRouteStop($organization, $todayRoute, [
            'seq_no' => 1,
            'status' => 'PENDING',
        ]);

        $this->actingAs($courier)
            ->get(route('courier.route.show'))
            ->assertOk()
            ->assertJsonPath('deliveryRoute.id', $todayRoute->id)
            ->assertJsonPath('stops.0.id', $stop->id)
            ->assertJsonPath('stops.0.status', 'PENDING');
    }

    public function test_courier_gets_empty_payload_when_no_route_exists_for_today(): void
    {
        $organization = Organization::factory()->create();
        $courier = $this->createCourier($organization);

        $this->actingAs($courier)
            ->get(route('courier.route.show'))
            ->assertOk()
            ->assertExactJson([
                'deliveryRoute' => null,
                'stops' => [],
            ]);
    }

    public function test_courier_can_update_own_todays_stop_statuses_and_complete_route(): void
    {
        $organization = Organization::factory()->create();
        $courier = $this->createCourier($organization);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-15',
            'status' => 'PLANNED',
        ]);
        $firstStop = $this->createRouteStop($organization, $deliveryRoute, [
            'seq_no' => 1,
            'status' => 'PENDING',
        ]);
        $secondStop = $this->createRouteStop($organization, $deliveryRoute, [
            'seq_no' => 2,
            'status' => 'PENDING',
        ]);

        $this->actingAs($courier)
            ->patch(route('courier.stops.update', $firstStop), [
                'status' => 'ARRIVED',
            ])
            ->assertRedirect(route('courier.route.page'));

        $this->assertDatabaseHas('route_stops', [
            'id' => $firstStop->id,
            'status' => 'ARRIVED',
        ]);

        $this->assertDatabaseHas('routes', [
            'id' => $deliveryRoute->id,
            'status' => 'IN_PROGRESS',
        ]);

        $this->actingAs($courier)
            ->patch(route('courier.stops.update', $firstStop), [
                'status' => 'COMPLETED',
            ])
            ->assertRedirect(route('courier.route.page'));

        $this->actingAs($courier)
            ->patch(route('courier.stops.update', $secondStop), [
                'status' => 'COMPLETED',
            ])
            ->assertRedirect(route('courier.route.page'));

        $this->assertDatabaseHas('route_stops', [
            'id' => $firstStop->id,
            'status' => 'COMPLETED',
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $firstStop->order_id,
            'status' => 'COMPLETED',
        ]);

        $this->assertDatabaseHas('routes', [
            'id' => $deliveryRoute->id,
            'status' => 'DONE',
        ]);
    }

    public function test_failed_stop_requires_reason(): void
    {
        $organization = Organization::factory()->create();
        $courier = $this->createCourier($organization);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-15',
        ]);
        $stop = $this->createRouteStop($organization, $deliveryRoute);

        $this->actingAs($courier)
            ->from(route('courier.route.show'))
            ->patch(route('courier.stops.update', $stop), [
                'status' => 'FAILED',
            ])
            ->assertRedirect(route('courier.route.show'))
            ->assertSessionHasErrors(['fail_reason']);
    }

    public function test_courier_can_fail_stop_with_reason_and_route_stays_in_progress(): void
    {
        $organization = Organization::factory()->create();
        $courier = $this->createCourier($organization);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-15',
            'status' => 'PLANNED',
        ]);
        $stop = $this->createRouteStop($organization, $deliveryRoute);

        $this->actingAs($courier)
            ->patch(route('courier.stops.update', $stop), [
                'status' => 'FAILED',
                'fail_reason' => 'Customer not at address',
            ])
            ->assertRedirect(route('courier.route.page'));

        $this->assertDatabaseHas('route_stops', [
            'id' => $stop->id,
            'status' => 'FAILED',
            'fail_reason' => 'Customer not at address',
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $stop->order_id,
            'status' => 'FAILED',
        ]);

        $this->assertDatabaseHas('routes', [
            'id' => $deliveryRoute->id,
            'status' => 'IN_PROGRESS',
        ]);
    }

    public function test_fail_reason_is_not_allowed_for_non_failed_status(): void
    {
        $organization = Organization::factory()->create();
        $courier = $this->createCourier($organization);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-15',
        ]);
        $stop = $this->createRouteStop($organization, $deliveryRoute);

        $this->actingAs($courier)
            ->from(route('courier.route.show'))
            ->patch(route('courier.stops.update', $stop), [
                'status' => 'ARRIVED',
                'fail_reason' => 'Should not be here',
            ])
            ->assertRedirect(route('courier.route.show'))
            ->assertSessionHasErrors(['fail_reason']);
    }

    public function test_courier_cannot_update_another_couriers_stop(): void
    {
        $organization = Organization::factory()->create();
        $courierA = $this->createCourier($organization);
        $courierB = $this->createCourier($organization);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courierB->id,
            'date' => '2026-04-15',
        ]);
        $stop = $this->createRouteStop($organization, $deliveryRoute);

        $this->actingAs($courierA)
            ->patch(route('courier.stops.update', $stop), [
                'status' => 'ARRIVED',
            ])
            ->assertForbidden();
    }

    public function test_courier_cannot_update_own_stop_for_non_today_route(): void
    {
        $organization = Organization::factory()->create();
        $courier = $this->createCourier($organization);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-14',
        ]);
        $stop = $this->createRouteStop($organization, $deliveryRoute);

        $this->actingAs($courier)
            ->patch(route('courier.stops.update', $stop), [
                'status' => 'ARRIVED',
            ])
            ->assertForbidden();
    }

    public function test_courier_does_not_receive_another_couriers_todays_route(): void
    {
        $organization = Organization::factory()->create();
        $courierA = $this->createCourier($organization);
        $courierB = $this->createCourier($organization);

        DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courierB->id,
            'date' => '2026-04-15',
        ]);

        $this->actingAs($courierA)
            ->get(route('courier.route.show'))
            ->assertOk()
            ->assertExactJson([
                'deliveryRoute' => null,
                'stops' => [],
            ]);
    }

    public function test_courier_can_upload_proof_for_own_completed_stop(): void
    {
        Storage::fake('public');

        $organization = Organization::factory()->create();
        $courier = $this->createCourier($organization);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-15',
        ]);
        $stop = $this->createRouteStop($organization, $deliveryRoute, [
            'status' => 'COMPLETED',
            'completed_at' => '2026-04-15 09:45:00',
        ]);

        $this->actingAs($courier)
            ->post(route('courier.stops.proof.store', $stop), [
                'file' => UploadedFile::fake()->image('proof.jpg'),
            ])
            ->assertRedirect(route('courier.route.page'));

        $proof = ProofOfDelivery::query()->where('route_stop_id', $stop->id)->first();

        $this->assertNotNull($proof);
        $this->assertStringStartsWith('/storage/proof-of-delivery/', $proof->file_url);

        Storage::disk('public')->assertExists(
            str_replace('/storage/', '', $proof->file_url),
        );
    }

    public function test_courier_cannot_upload_proof_for_another_couriers_stop(): void
    {
        Storage::fake('public');

        $organization = Organization::factory()->create();
        $courierA = $this->createCourier($organization);
        $courierB = $this->createCourier($organization);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courierB->id,
            'date' => '2026-04-15',
        ]);
        $stop = $this->createRouteStop($organization, $deliveryRoute, [
            'status' => 'COMPLETED',
        ]);

        $this->actingAs($courierA)
            ->post(route('courier.stops.proof.store', $stop), [
                'file' => UploadedFile::fake()->image('proof.jpg'),
            ])
            ->assertForbidden();
    }

    public function test_courier_cannot_upload_duplicate_proof_for_same_stop(): void
    {
        Storage::fake('public');

        $organization = Organization::factory()->create();
        $courier = $this->createCourier($organization);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-15',
        ]);
        $stop = $this->createRouteStop($organization, $deliveryRoute, [
            'status' => 'COMPLETED',
        ]);

        ProofOfDelivery::query()->create([
            'organization_id' => $organization->id,
            'route_stop_id' => $stop->id,
            'type' => 'PHOTO',
            'file_url' => '/storage/proof-of-delivery/existing.jpg',
            'taken_at' => '2026-04-15 10:00:00',
        ]);

        $this->actingAs($courier)
            ->from(route('courier.route.page'))
            ->post(route('courier.stops.proof.store', $stop), [
                'file' => UploadedFile::fake()->image('proof.jpg'),
            ])
            ->assertRedirect(route('courier.route.page'))
            ->assertSessionHasErrors(['file']);
    }

    public function test_invalid_proof_file_is_rejected(): void
    {
        Storage::fake('public');

        $organization = Organization::factory()->create();
        $courier = $this->createCourier($organization);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-15',
        ]);
        $stop = $this->createRouteStop($organization, $deliveryRoute, [
            'status' => 'COMPLETED',
        ]);

        $this->actingAs($courier)
            ->from(route('courier.route.page'))
            ->post(route('courier.stops.proof.store', $stop), [
                'file' => UploadedFile::fake()->create('proof.pdf', 100, 'application/pdf'),
            ])
            ->assertRedirect(route('courier.route.page'))
            ->assertSessionHasErrors(['file']);
    }

    public function test_proof_upload_requires_completed_or_failed_stop(): void
    {
        Storage::fake('public');

        $organization = Organization::factory()->create();
        $courier = $this->createCourier($organization);
        $deliveryRoute = DeliveryRoute::factory()->create([
            'organization_id' => $organization->id,
            'courier_user_id' => $courier->id,
            'date' => '2026-04-15',
        ]);
        $stop = $this->createRouteStop($organization, $deliveryRoute, [
            'status' => 'ARRIVED',
        ]);

        $this->actingAs($courier)
            ->from(route('courier.route.page'))
            ->post(route('courier.stops.proof.store', $stop), [
                'file' => UploadedFile::fake()->image('proof.jpg'),
            ])
            ->assertRedirect(route('courier.route.page'))
            ->assertSessionHasErrors(['file']);
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
    private function createRouteStop(
        Organization $organization,
        DeliveryRoute $deliveryRoute,
        array $attributes = [],
    ): RouteStop {
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
            'status' => 'ASSIGNED',
        ]);

        return RouteStop::factory()->create(array_merge([
            'organization_id' => $organization->id,
            'route_id' => $deliveryRoute->id,
            'order_id' => $order->id,
            'seq_no' => 1,
            'planned_eta' => '2026-04-15 09:30:00',
            'status' => 'PENDING',
        ], $attributes));
    }
}
