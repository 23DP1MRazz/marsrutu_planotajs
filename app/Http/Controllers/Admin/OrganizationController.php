<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrganizationRequest;
use App\Models\Organization;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAdminAccess($request);

        return Inertia::render('admin/organizations/index', [
            'organizations' => Organization::query()
                ->withCount('users')
                ->orderBy('name')
                ->get()
                ->map(fn (Organization $organization) => $this->organizationPayload($organization)),
        ]);
    }

    public function edit(Request $request, Organization $organization): Response
    {
        $this->authorizeAdminAccess($request);

        return Inertia::render('admin/organizations/edit', [
            'organization' => $this->organizationPayload(
                $organization->loadCount('users'),
            ),
        ]);
    }

    public function update(UpdateOrganizationRequest $request, Organization $organization): RedirectResponse
    {
        $this->authorizeAdminAccess($request);

        $organization->update($request->validated());

        return to_route('admin.organizations.index');
    }

    public function regenerateJoinCode(Request $request, Organization $organization): RedirectResponse
    {
        $this->authorizeAdminAccess($request);

        $organization->update([
            'join_code' => $this->generateJoinCode(),
        ]);

        return to_route('admin.organizations.edit', $organization);
    }

    private function authorizeAdminAccess(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403);
    }

    /**
     * @return array{id: int, name: string, join_code: string, users_count: int}
     */
    private function organizationPayload(Organization $organization): array
    {
        return [
            'id' => $organization->id,
            'name' => $organization->name,
            'join_code' => $organization->join_code,
            'users_count' => $organization->users_count ?? $organization->users()->count(),
        ];
    }

    private function generateJoinCode(): string
    {
        do {
            $joinCode = Str::upper(Str::random(8));
        } while (Organization::query()->where('join_code', $joinCode)->exists());

        return $joinCode;
    }
}
