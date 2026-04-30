<?php

namespace Database\Factories;

use App\Models\Courier;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DeliveryRoute>
 */
class DeliveryRouteFactory extends Factory
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
            'courier_user_id' => User::factory()
                ->courier()
                ->afterCreating(function (User $user): void {
                    Courier::query()->firstOrCreate([
                        'user_id' => $user->id,
                    ], [
                        'on_duty' => false,
                    ]);
                }),
            'date' => fake()->date(),
            'status' => 'PLANNED',
        ];
    }
}
