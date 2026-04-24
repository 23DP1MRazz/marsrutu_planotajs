<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $supportedLocales = config('app.supported_locales', ['en']);
        $requestedLocale = $request->session()->get('locale', $request->cookie('locale'));

        if (! is_string($requestedLocale) || ! in_array($requestedLocale, $supportedLocales, true)) {
            $requestedLocale = config('app.locale');
        }

        App::setLocale($requestedLocale);

        return $next($request);
    }
}
