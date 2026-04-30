<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\Courier;
use App\Models\Dispatcher;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeAdminAccess($request);

        return Inertia::render('admin/users/index', [
            'users' => User::query()
                ->with('organization:id,name')
                ->orderBy('name')
                ->get()
                ->map(fn (User $user) => $this->userPayload($user)),
        ]);
    }

    public function edit(Request $request, User $user): Response
    {
        $this->authorizeAdminAccess($request);

        return Inertia::render('admin/users/edit', [
            'user' => $this->userPayload($user->load('organization:id,name')),
            'roles' => ['admin', 'dispatcher', 'courier'],
            'organizations' => Organization::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Organization $organization) => $organization->only('id', 'name')),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $this->authorizeAdminAccess($request);

        $data = $request->validated();
        $role = $data['role'];
        $organizationId = $role === 'admin'
            ? null
            : (int) $data['organization_id'];

        DB::transaction(function () use ($data, $organizationId, $role, $user): void {
            $user->update([
                'name' => $data['name'],
                'email' => $data['email'],
                'role' => $role,
                'organization_id' => $organizationId,
            ]);

            $this->syncRoleProfiles($user);
        });

        return to_route('admin.users.index');
    }

    private function authorizeAdminAccess(Request $request): void
    {
        abort_unless($request->user()?->isAdmin(), 403);
    }

    /**
     * @return array{
     *     id: int,
     *     name: string,
     *     email: string,
     *     role: string,
     *     organization_id: int|null,
     *     organization_name: string|null
     * }
     */
    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'organization_id' => $user->organization_id,
            'organization_name' => $user->organization?->name,
        ];
    }

    private function syncRoleProfiles(User $user): void
    {
        if ($user->isAdmin()) {
            Dispatcher::query()->whereKey($user->id)->delete();
            Courier::query()->whereKey($user->id)->delete();

            return;
        }

        if ($user->isDispatcher()) {
            Dispatcher::query()->firstOrCreate([
                'user_id' => $user->id,
            ]);

            Courier::query()->whereKey($user->id)->delete();

            return;
        }

        Courier::query()->firstOrCreate(
            ['user_id' => $user->id],
            ['on_duty' => false],
        );

        Dispatcher::query()->whereKey($user->id)->delete();
    }
}
