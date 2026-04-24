<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;

class LocaleController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', 'in:en,lv'],
        ]);

        $request->session()->put('locale', $validated['locale']);

        return back()->withCookie(
            Cookie::make('locale', $validated['locale'], 60 * 24 * 365),
        );
    }
}
