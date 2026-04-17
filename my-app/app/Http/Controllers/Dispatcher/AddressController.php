<?php

namespace App\Http\Controllers\Dispatcher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Dispatcher\StoreAddressRequest;
use App\Http\Requests\Dispatcher\UpdateAddressRequest;
use App\Models\Address;
use App\Models\Organization;
use App\Services\Geocoding\NominatimGeocoder;
use Illuminate\Database\Eloquent\Builder;
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

        $filters = [
            'search' => $request->string('search')->toString(),
            'sort' => $this->normalizeSort($request->string('sort')->toString()),
        ];

        return Inertia::render('dispatcher/addresses/index', [
            'addresses' => $this->filteredAddressesQuery($request, $filters)
                ->get(['id', 'organization_id', 'city', 'street', 'lat', 'lng', 'updated_at']),
            'filters' => $filters,
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

    /**
     * @param  array{search: string, sort: string}  $filters
     */
    private function filteredAddressesQuery(Request $request, array $filters): Builder
    {
        $query = Address::query()
            ->visibleTo($request->user())
            ->when(
                $filters['search'] !== '',
                fn (Builder $builder) => $builder->where(function (Builder $searchQuery) use ($filters): void {
                    $searchQuery
                        ->where('city', 'like', '%'.$filters['search'].'%')
                        ->orWhere('street', 'like', '%'.$filters['search'].'%');
                }),
            );

        return $this->applySort($query, $filters['sort']);
    }

    private function normalizeSort(string $sort): string
    {
        return in_array(
            $sort,
            ['city_asc', 'city_desc', 'street_asc', 'street_desc', 'updated_desc', 'updated_asc'],
            true,
        ) ? $sort : 'city_asc';
    }

    private function applySort(Builder $query, string $sort): Builder
    {
        return match ($sort) {
            'city_desc' => $query->orderByDesc('city')->orderBy('street'),
            'street_asc' => $query->orderBy('street')->orderBy('city'),
            'street_desc' => $query->orderByDesc('street')->orderBy('city'),
            'updated_desc' => $query->orderByDesc('updated_at'),
            'updated_asc' => $query->orderBy('updated_at'),
            default => $query->orderBy('city')->orderBy('street'),
        };
    }
}
