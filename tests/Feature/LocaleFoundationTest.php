<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LocaleFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_page_shares_default_locale_data(): void
    {
        $this->get(route('register'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('locale', 'en')
                ->where('availableLocales', ['en', 'lv']));
    }

    public function test_locale_is_loaded_from_session_when_present(): void
    {
        $this->withSession(['locale' => 'lv'])
            ->get(route('register'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('locale', 'lv')
                ->where('availableLocales', ['en', 'lv']));
    }

    public function test_unsupported_session_locale_falls_back_to_default(): void
    {
        $this->withSession(['locale' => 'de'])
            ->get(route('register'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('locale', 'en')
                ->where('availableLocales', ['en', 'lv']));
    }

    public function test_locale_can_be_updated_and_persisted(): void
    {
        $this->from(route('register'))
            ->patch(route('locale.update'), ['locale' => 'lv'])
            ->assertRedirect(route('register', absolute: false))
            ->assertPlainCookie('locale', 'lv');

        $this->assertSame('lv', session('locale'));
    }

    public function test_invalid_locale_is_rejected(): void
    {
        $this->from(route('register'))
            ->patch(route('locale.update'), ['locale' => 'de'])
            ->assertRedirect(route('register', absolute: false))
            ->assertSessionHasErrors('locale');
    }

    public function test_latvian_validation_messages_are_used_for_form_requests(): void
    {
        $organization = Organization::factory()->create();
        $dispatcher = User::factory()->dispatcher($organization->id)->create();

        $this->withSession(['locale' => 'lv'])
            ->actingAs($dispatcher)
            ->from(route('dispatcher.clients.create'))
            ->post(route('dispatcher.clients.store'), [
                'name' => '',
                'phone' => '',
            ])
            ->assertRedirect(route('dispatcher.clients.create', absolute: false))
            ->assertSessionHasErrors([
                'name' => 'nosaukums ir obligāts lauks.',
                'phone' => 'tālrunis ir obligāts lauks.',
            ]);
    }
}
