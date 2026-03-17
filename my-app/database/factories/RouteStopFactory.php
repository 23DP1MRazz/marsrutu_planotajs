<?php

namespace Database\Factories;

use App\Models\DeliveryRoute;
use App\Models\Organization;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RouteStop>
 */
class RouteStopFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'route_id' => DeliveryRoute::factory(),
            'seq_no' => 1,
            'order_id' => Order::factory(),
            'planned_eta' => now()->addHour(),
            'arrived_at' => null,
            'completed_at' => null,
            'status' => 'PENDING',
            'fail_reason' => null,
        ];
    }
}
