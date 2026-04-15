<?php

namespace App\Http\Controllers\Dispatcher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dispatcher\StoreAddressRequest;
use App\Http\Requests\Dispatcher\UpdateAddressRequest;
use App\Models\Address;
use App\Models\Organization;
use App\Services\Geocoding\NominatimGeocoder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AddressController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeDispatcherAccess($request);
        $this->authorize('viewAny', Address::class);

        return Inertia::render('dispatcher/addresses/index', [
            'addresses' => Address::query()
                ->visibleTo($request->user())
                ->orderBy('city')
                ->orderBy('street')
                ->get(['id', 'organization_id', 'city', 'street', 'lat', 'lng', 'updated_at']),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorizeDispatcherAccess($request);
        $this->authorize('create', Address::class);

        return Inertia::render('dispatcher/addresses/create', [
            'organizations' => $this->organizationsForUser($request),
            'canSelectOrganization' => $request->user()->isAdmin(),
        ]);
    }

    public function store(StoreAddressRequest $request, NominatimGeocoder $geocoder): RedirectResponse
    {
        $this->authorizeDispatcherAccess($request);
        $data = $request->validated();
        $coordinates = $this->resolveCoordinates($data, $geocoder);

        Address::query()->create([
            'organization_id' => $request->user()->isAdmin()
                ? $data['organization_id']
                : $request->user()->organization_id,
            'city' => $data['city'],
            'street' => $data['street'],
            'lat' => $coordinates['lat'],
            'lng' => $coordinates['lng'],
        ]);

        return to_route('dispatcher.addresses.index');
    }

    public function edit(Request $request, Address $address): Response
    {
        $this->authorizeDispatcherAccess($request);
        $this->authorize('view', $address);

        return Inertia::render('dispatcher/addresses/edit', [
            'addressId' => (string) $address->id,
            'address' => $address->only('id', 'organization_id', 'city', 'street', 'lat', 'lng'),
            'organizations' => $this->organizationsForUser($request),
            'canSelectOrganization' => $request->user()->isAdmin(),
        ]);
    }

    public function update(
        UpdateAddressRequest $request,
        Address $address,
        NominatimGeocoder $geocoder,
    ): RedirectResponse {
        $this->authorizeDispatcherAccess($request);
        $data = $request->validated();
        $coordinates = $this->resolveCoordinates($data, $geocoder, $address);

        $address->update([
            'organization_id' => $request->user()->isAdmin()
                ? $data['organization_id']
                : $address->organization_id,
            'city' => $data['city'],
            'street' => $data['street'],
            'lat' => $coordinates['lat'],
            'lng' => $coordinates['lng'],
        ]);

        return to_route('dispatcher.addresses.index');
    }

    public function destroy(Request $request, Address $address): RedirectResponse
    {
        $this->authorizeDispatcherAccess($request);
        $this->authorize('delete', $address);

        $address->delete();

        return to_route('dispatcher.addresses.index');
    }

    /**
     * @return \Illuminate\Support\Collection<int, array{id: int, name: string}>
     */
    private function organizationsForUser(Request $request)
    {
        if ($request->user()->isAdmin()) {
            return Organization::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Organization $organization) => $organization->only('id', 'name'));
        }

        return Organization::query()
            ->whereKey($request->user()->organization_id)
            ->get(['id', 'name'])
            ->map(fn (Organization $organization) => $organization->only('id', 'name'));
    }

    private function authorizeDispatcherAccess(Request $request): void
    {
        abort_unless(
            $request->user()?->isAdmin() || $request->user()?->isDispatcher(),
            403,
        );
    }

    /**
     * @param  array{city: string, street: string, lat?: mixed, lng?: mixed}  $data
     * @return array{lat: float|int|string|null, lng: float|int|string|null}
     */
    private function resolveCoordinates(
        array $data,
        NominatimGeocoder $geocoder,
        ?Address $address = null,
    ): array {
        if (($data['lat'] ?? null) !== null && ($data['lng'] ?? null) !== null) {
            return [
                'lat' => $data['lat'],
                'lng' => $data['lng'],
            ];
        }

        $addressChanged = $address === null
            || $address->city !== $data['city']
            || $address->street !== $data['street'];

        if (! $addressChanged && $address !== null) {
            return [
                'lat' => $address->lat,
                'lng' => $address->lng,
            ];
        }

        $coordinates = $geocoder->geocode($data['city'], $data['street']);

        return [
            'lat' => $coordinates['lat'] ?? null,
            'lng' => $coordinates['lng'] ?? null,
        ];
    }
}
