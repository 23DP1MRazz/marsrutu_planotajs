<?php

namespace Tests\Feature\Auth;

use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('register'));

        $response->assertOk();
    }

    public function test_new_users_can_register()
    {
        $response = $this->post(route('register.store'), [
            'role' => 'dispatcher',
            'org_action' => 'create',
            'organization_name' => 'Test Organization',
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'role' => 'dispatcher',
        ]);
        $this->assertDatabaseHas('organizations', [
            'name' => 'Test Organization',
        ]);
        $this->assertDatabaseHas('dispatchers', [
            'user_id' => auth()->id(),
        ]);
    }

    public function test_new_users_can_register_joining_existing_organization()
    {
        // Existing organization that user joins with code.
        $organization = Organization::create([
            'name' => 'Existing Organization',
            'join_code' => 'ABCDEFGH',
        ]);

        $response = $this->post(route('register.store'), [
            'role' => 'courier',
            'org_action' => 'join',
            'organization_join_code' => 'ABCDEFGH',
            'name' => 'Courier User',
            'email' => 'courier@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertDatabaseHas('users', [
            'email' => 'courier@example.com',
            'role' => 'courier',
            'organization_id' => $organization->id,
        ]);
        $this->assertDatabaseHas('couriers', [
            'user_id' => auth()->id(),
            'on_duty' => false,
        ]);
    }

    public function test_users_cannot_join_organization_with_invalid_join_code()
    {
        $response = $this->from(route('register'))->post(route('register.store'), [
            'role' => 'courier',
            'org_action' => 'join',
            'organization_join_code' => 'INVALID01',
            'name' => 'Courier User',
            'email' => 'courier2@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('register', absolute: false));
        $response->assertSessionHasErrors('organization_join_code');
        $this->assertGuest();
    }
}
