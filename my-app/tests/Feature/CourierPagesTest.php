<?php

namespace Tests\Feature;

use App\Models\Courier;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CourierPagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_courier_page(): void
    {
        $this->get('/courier/today-route')->assertRedirect(route('login'));
    }

    public function test_courier_can_open_today_route_page(): void
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
                ->has('stops'));
    }

    public function test_dispatcher_cannot_open_courier_page(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();

        $this->actingAs($dispatcher)
            ->get('/courier/today-route')
            ->assertForbidden();
    }
}
