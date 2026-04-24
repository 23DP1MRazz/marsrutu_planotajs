<?php

namespace Tests\Feature;

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
}
