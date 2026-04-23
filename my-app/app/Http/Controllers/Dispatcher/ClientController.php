<?php

namespace App\Http\Controllers\Dispatcher;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Dispatcher\Concerns\ParsesSearchFilters;
use App\Http\Requests\Dispatcher\StoreClientRequest;
use App\Http\Requests\Dispatcher\UpdateClientRequest;
use App\Models\Client;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    use ParsesSearchFilters;

    public function index(Request $request): Response
    {
        $this->authorizeDispatcherAccess($request);
        $this->authorize('viewAny', Client::class);

        $filters = [
            'search' => $request->string('search')->toString(),
            'sort' => $this->normalizeSort($request->string('sort')->toString()),
        ];

        return Inertia::render('dispatcher/clients/index', [
            'clients' => $this->filteredClientsQuery($request, $filters)
                ->get(['id', 'organization_id', 'name', 'phone', 'updated_at']),
            'filters' => $filters,
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorizeDispatcherAccess($request);
        $this->authorize('create', Client::class);

        return Inertia::render('dispatcher/clients/create', [
            'organizations' => $this->organizationsForUser($request),
            'canSelectOrganization' => $request->user()->isAdmin(),
        ]);
    }

    public function store(StoreClientRequest $request): RedirectResponse
    {
        $this->authorizeDispatcherAccess($request);
        $data = $request->validated();

        Client::query()->create([
            'organization_id' => $request->user()->isAdmin()
                ? $data['organization_id']
                : $request->user()->organization_id,
            'name' => $data['name'],
            'phone' => $data['phone'],
        ]);

        return to_route('dispatcher.clients.index');
    }

    public function edit(Request $request, Client $client): Response
    {
        $this->authorizeDispatcherAccess($request);
        $this->authorize('view', $client);

        return Inertia::render('dispatcher/clients/edit', [
            'clientId' => (string) $client->id,
            'client' => $client->only('id', 'organization_id', 'name', 'phone'),
            'organizations' => $this->organizationsForUser($request),
            'canSelectOrganization' => $request->user()->isAdmin(),
        ]);
    }

    public function update(UpdateClientRequest $request, Client $client): RedirectResponse
    {
        $this->authorizeDispatcherAccess($request);
        $data = $request->validated();

        $client->update([
            'organization_id' => $request->user()->isAdmin()
                ? $data['organization_id']
                : $client->organization_id,
            'name' => $data['name'],
            'phone' => $data['phone'],
        ]);

        return to_route('dispatcher.clients.index');
    }

    public function destroy(Request $request, Client $client): RedirectResponse
    {
        $this->authorizeDispatcherAccess($request);
        $this->authorize('delete', $client);

        $client->delete();

        return to_route('dispatcher.clients.index');
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
     * @param  array{search: string, sort: string}  $filters
     */
    private function filteredClientsQuery(Request $request, array $filters): Builder
    {
        $query = Client::query()
            ->visibleTo($request->user());

        foreach ($this->searchTerms($filters['search']) as $searchTerm) {
            $query->where(function (Builder $searchQuery) use ($searchTerm): void {
                $searchQuery
                    ->where('id', 'like', '%'.$searchTerm.'%')
                    ->orWhere('name', 'like', '%'.$searchTerm.'%')
                    ->orWhere('phone', 'like', '%'.$searchTerm.'%');
            });
        }

        return $this->applySort($query, $filters['sort']);
    }

    private function normalizeSort(string $sort): string
    {
        return in_array($sort, ['name_asc', 'name_desc', 'updated_desc', 'updated_asc'], true)
            ? $sort
            : 'name_asc';
    }

    private function applySort(Builder $query, string $sort): Builder
    {
        return match ($sort) {
            'name_desc' => $query->orderByDesc('name'),
            'updated_desc' => $query->orderByDesc('updated_at'),
            'updated_asc' => $query->orderBy('updated_at'),
            default => $query->orderBy('name'),
        };
    }
}
