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
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class OrganizationAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_dispatcher_can_manage_same_org_records_but_not_other_org_records(): void
    {
        [$dispatcher, $clientA, $clientB] = $this->seedClientAccessData();

        $this->assertTrue(Gate::forUser($dispatcher)->allows('viewAny', Client::class));
        $this->assertTrue(Gate::forUser($dispatcher)->allows('create', Client::class));
        $this->assertTrue(Gate::forUser($dispatcher)->allows('view', $clientA));
        $this->assertTrue(Gate::forUser($dispatcher)->allows('update', $clientA));
        $this->assertTrue(Gate::forUser($dispatcher)->allows('delete', $clientA));

        $this->assertFalse(Gate::forUser($dispatcher)->allows('view', $clientB));
        $this->assertFalse(Gate::forUser($dispatcher)->allows('update', $clientB));
        $this->assertFalse(Gate::forUser($dispatcher)->allows('delete', $clientB));
    }

    public function test_courier_cannot_manage_dispatcher_resources_and_cannot_read_other_org_records(): void
    {
        [$courier, $clientA, $clientB] = $this->seedClientAccessData('courier');

        $this->assertTrue(Gate::forUser($courier)->allows('viewAny', Client::class));
        $this->assertTrue(Gate::forUser($courier)->allows('view', $clientA));
        $this->assertFalse(Gate::forUser($courier)->allows('create', Client::class));
        $this->assertFalse(Gate::forUser($courier)->allows('update', $clientA));
        $this->assertFalse(Gate::forUser($courier)->allows('delete', $clientA));

        $this->assertFalse(Gate::forUser($courier)->allows('view', $clientB));
        $this->assertFalse(Gate::forUser($courier)->allows('update', $clientB));
    }

    public function test_courier_can_operate_route_stops_and_proof_of_delivery_only_inside_own_organization(): void
    {
        [$courier, $routeStopA, $routeStopB, $proofA, $proofB] = $this->seedOperationalAccessData();

        $this->assertTrue(Gate::forUser($courier)->allows('view', $routeStopA));
        $this->assertTrue(Gate::forUser($courier)->allows('update', $routeStopA));
        $this->assertFalse(Gate::forUser($courier)->allows('delete', $routeStopA));
        $this->assertFalse(Gate::forUser($courier)->allows('view', $routeStopB));
        $this->assertFalse(Gate::forUser($courier)->allows('update', $routeStopB));

        $this->assertTrue(Gate::forUser($courier)->allows('create', ProofOfDelivery::class));
        $this->assertTrue(Gate::forUser($courier)->allows('view', $proofA));
        $this->assertTrue(Gate::forUser($courier)->allows('update', $proofA));
        $this->assertFalse(Gate::forUser($courier)->allows('delete', $proofA));
        $this->assertFalse(Gate::forUser($courier)->allows('view', $proofB));
        $this->assertFalse(Gate::forUser($courier)->allows('update', $proofB));
    }

    public function test_admin_can_access_records_across_organizations(): void
    {
        [, $clientA, $clientB] = $this->seedClientAccessData();
        $admin = User::factory()->admin()->create();

        $this->assertTrue(Gate::forUser($admin)->allows('view', $clientA));
        $this->assertTrue(Gate::forUser($admin)->allows('update', $clientA));
        $this->assertTrue(Gate::forUser($admin)->allows('view', $clientB));
        $this->assertTrue(Gate::forUser($admin)->allows('update', $clientB));
    }

    public function test_visible_to_scope_filters_non_admin_queries_by_organization(): void
    {
        [$dispatcher, $clientA, $clientB] = $this->seedClientAccessData();
        $admin = User::factory()->admin()->create();

        $this->assertSame(
            [$clientA->id],
            Client::query()->visibleTo($dispatcher)->pluck('id')->all(),
        );

        $this->assertEqualsCanonicalizing(
            [$clientA->id, $clientB->id],
            Client::query()->visibleTo($admin)->pluck('id')->all(),
        );
    }

    /**
     * @return array{0: \App\Models\User, 1: \App\Models\Client, 2: \App\Models\Client}
     */
    private function seedClientAccessData(string $role = 'dispatcher'): array
    {
        $organizationA = Organization::factory()->create();
        $organizationB = Organization::factory()->create();

        $user = $role === 'courier'
            ? User::factory()->courier($organizationA->id)->create()
            : User::factory()->dispatcher($organizationA->id)->create();

        $clientA = Client::factory()->create([
            'organization_id' => $organizationA->id,
        ]);

        $clientB = Client::factory()->create([
            'organization_id' => $organizationB->id,
        ]);

        return [$user, $clientA, $clientB];
    }

    /**
     * @return array{0: \App\Models\User, 1: \App\Models\RouteStop, 2: \App\Models\RouteStop, 3: \App\Models\ProofOfDelivery, 4: \App\Models\ProofOfDelivery}
     */
    private function seedOperationalAccessData(): array
    {
        $organizationA = Organization::factory()->create();
        $organizationB = Organization::factory()->create();

        $courierA = User::factory()->courier($organizationA->id)->create();
        $courierB = User::factory()->courier($organizationB->id)->create();

        Courier::query()->create([
            'user_id' => $courierA->id,
            'on_duty' => false,
        ]);

        Courier::query()->create([
            'user_id' => $courierB->id,
            'on_duty' => false,
        ]);

        $routeStopA = $this->createRouteStopForOrganization($organizationA, $courierA);
        $routeStopB = $this->createRouteStopForOrganization($organizationB, $courierB);

        $proofA = ProofOfDelivery::query()->create([
            'organization_id' => $organizationA->id,
            'route_stop_id' => $routeStopA->id,
            'type' => 'PHOTO',
            'file_url' => 'proofs/a.jpg',
            'taken_at' => '2026-03-19 10:00:00',
        ]);

        $proofB = ProofOfDelivery::query()->create([
            'organization_id' => $organizationB->id,
            'route_stop_id' => $routeStopB->id,
            'type' => 'PHOTO',
            'file_url' => 'proofs/b.jpg',
            'taken_at' => '2026-03-19 11:00:00',
        ]);

        return [$courierA, $routeStopA, $routeStopB, $proofA, $proofB];
    }

    private function createRouteStopForOrganization(Organization $organization, User $courier): RouteStop
    {
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
            'courier_user_id' => $courier->id,
            'date' => '2026-03-19',
            'status' => 'PLANNED',
        ]);

        return RouteStop::query()->create([
            'organization_id' => $organization->id,
            'route_id' => $route->id,
            'seq_no' => 1,
            'order_id' => $order->id,
            'planned_eta' => '2026-03-19 09:30:00',
            'status' => 'PENDING',
        ]);
    }
}
