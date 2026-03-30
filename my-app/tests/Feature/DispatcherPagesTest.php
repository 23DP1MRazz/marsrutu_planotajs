<?php

namespace Tests\Feature;

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
    }

    public function test_dispatcher_can_open_dispatcher_pages(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();

        $this->actingAs($dispatcher);

        $this->get('/dispatcher/clients')->assertOk();
        $this->get('/dispatcher/clients/create')->assertOk();
        $this->get('/dispatcher/clients/42/edit')->assertOk();
        $this->get('/dispatcher/addresses')->assertOk();
        $this->get('/dispatcher/addresses/create')->assertOk();
        $this->get('/dispatcher/addresses/42/edit')->assertOk();
    }

    public function test_admin_can_open_dispatcher_pages(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin);

        $this->get('/dispatcher/clients')->assertOk();
        $this->get('/dispatcher/addresses')->assertOk();
    }

    public function test_courier_is_forbidden_from_dispatcher_pages(): void
    {
        $organization = Organization::factory()->create();
        $courier = User::factory()->courier($organization->id)->create();

        $this->actingAs($courier);

        $this->get('/dispatcher/clients')->assertForbidden();
        $this->get('/dispatcher/addresses')->assertForbidden();
    }
}

