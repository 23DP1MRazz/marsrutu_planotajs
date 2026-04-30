<?php

namespace App\Services\Geocoding;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class NominatimGeocoder
{
    /**
     * @return array{lat: float, lng: float}|null
     */
    public function geocode(string $city, string $street): ?array
    {
        $cacheKey = 'geocoding:nominatim:'.md5(mb_strtolower(trim($street.'|'.$city)));

        return Cache::remember($cacheKey, now()->addDays(30), function () use ($city, $street): ?array {
            $response = Http::acceptJson()
                ->timeout(5)
                ->withUserAgent(config('app.name', 'Laravel').'/1.0')
                ->get(config('services.nominatim.url'), [
                    'format' => 'jsonv2',
                    'limit' => 1,
                    'countrycodes' => config('services.nominatim.countrycodes', 'lv'),
                    'q' => trim($street.', '.$city.', Latvia'),
                ]);

            if (! $response->successful()) {
                return null;
            }

            $location = $response->json('0');

            if (! is_array($location) || ! isset($location['lat'], $location['lon'])) {
                return null;
            }

            return [
                'lat' => (float) $location['lat'],
                'lng' => (float) $location['lon'],
            ];
        });
    }
}
