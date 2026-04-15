<?php

namespace Tests\Unit;

use App\Services\Geocoding\NominatimGeocoder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class NominatimGeocoderTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();
    }

    public function test_it_caches_successful_geocoding_results(): void
    {
        Http::fake([
            '*' => Http::response([
                [
                    'lat' => '56.9496',
                    'lon' => '24.1052',
                ],
            ]),
        ]);

        $geocoder = new NominatimGeocoder;

        $firstResult = $geocoder->geocode('Riga', 'Brivibas iela 1');
        $secondResult = $geocoder->geocode('Riga', 'Brivibas iela 1');

        $this->assertSame([
            'lat' => 56.9496,
            'lng' => 24.1052,
        ], $firstResult);

        $this->assertSame($firstResult, $secondResult);
        Http::assertSentCount(1);
    }

    public function test_it_returns_null_when_geocoding_service_fails(): void
    {
        Http::fake([
            '*' => Http::response([], 500),
        ]);

        $geocoder = new NominatimGeocoder;

        $this->assertNull($geocoder->geocode('Riga', 'Brivibas iela 1'));
        Http::assertSentCount(1);
    }

    public function test_it_returns_null_when_geocoding_payload_has_no_coordinates(): void
    {
        Http::fake([
            '*' => Http::response([
                [
                    'display_name' => 'Brivibas iela 1, Riga',
                ],
            ]),
        ]);

        $geocoder = new NominatimGeocoder;

        $this->assertNull($geocoder->geocode('Riga', 'Brivibas iela 1'));
        Http::assertSentCount(1);
    }
}
