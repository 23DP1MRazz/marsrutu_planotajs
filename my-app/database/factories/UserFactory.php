<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'role' => 'dispatcher',
            'organization_id' => null,
            'remember_token' => Str::random(10),
        ];
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
            'organization_id' => null,
        ]);
    }

    public function dispatcher(?int $organizationId = null): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'dispatcher',
            'organization_id' => $organizationId,
        ]);
    }

    public function courier(?int $organizationId = null): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'courier',
            'organization_id' => $organizationId,
        ]);
    }
}
