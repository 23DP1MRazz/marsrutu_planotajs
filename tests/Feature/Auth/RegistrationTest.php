<?php

namespace Tests\Feature\Auth;

use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('register'));

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('registerPrefill.join_code', null));
    }

    public function test_registration_screen_prefills_join_code_from_query(): void
    {
        $this->get(route('register', ['join_code' => 'JOIN2026']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('registerPrefill.join_code', 'JOIN2026'));
    }

    public function test_user_can_register_from_prefilled_invite_link(): void
    {
        $organization = Organization::create([
            'name' => 'Invite Organization',
            'join_code' => 'INVITE20',
        ]);

        $this->get(route('register', ['join_code' => 'INVITE20']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('registerPrefill.join_code', 'INVITE20'));

        $response = $this->post(route('register.store'), [
            'role' => 'courier',
            'org_action' => 'join',
            'organization_join_code' => 'INVITE20',
            'name' => 'Invite Courier',
            'email' => 'invite-courier@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertDatabaseHas('users', [
            'email' => 'invite-courier@example.com',
            'role' => 'courier',
            'organization_id' => $organization->id,
        ]);
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

    public function test_invalid_prefilled_invite_link_still_fails_validation(): void
    {
        $this->get(route('register', ['join_code' => 'BADCODE1']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('registerPrefill.join_code', 'BADCODE1'));

        $response = $this->from(route('register', ['join_code' => 'BADCODE1']))->post(route('register.store'), [
            'role' => 'courier',
            'org_action' => 'join',
            'organization_join_code' => 'BADCODE1',
            'name' => 'Blocked Courier',
            'email' => 'blocked-courier@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('register', ['join_code' => 'BADCODE1'], absolute: false));
        $response->assertSessionHasErrors('organization_join_code');
        $this->assertGuest();
    }
}
