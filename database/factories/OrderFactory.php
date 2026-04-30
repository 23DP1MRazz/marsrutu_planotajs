<?php

namespace Database\Factories;

use App\Models\Address;
use App\Models\Client;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
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
            'client_id' => Client::factory(),
            'address_id' => Address::factory(),
            'date' => fake()->date(),
            'time_from' => '09:00:00',
            'time_to' => '12:00:00',
            'status' => 'NEW',
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
