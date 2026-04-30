<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\RouteStop;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProofOfDelivery>
 */
class ProofOfDeliveryFactory extends Factory
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
            'route_stop_id' => RouteStop::factory(),
            'type' => 'PHOTO',
            'file_url' => fake()->imageUrl(),
            'taken_at' => now(),
        ];
    }
}
