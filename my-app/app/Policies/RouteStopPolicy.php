<?php

namespace App\Policies;

use App\Models\RouteStop;
use App\Models\User;
use App\Policies\Concerns\HandlesOrganizationAuthorization;

class RouteStopPolicy
{
    use HandlesOrganizationAuthorization;

    public function viewAny(User $user): bool
    {
        return $this->canViewAnyOrganizationResource($user);
    }

    public function view(User $user, RouteStop $routeStop): bool
    {
        if ($this->canViewOrganizationResource($user, $routeStop) && ! $user->isCourier()) {
            return true;
        }

        return $user->isCourier()
            && $user->organization_id !== null
            && (int) $user->organization_id === (int) $routeStop->organization_id
            && (int) $routeStop->route?->courier_user_id === (int) $user->id;
    }

    public function create(User $user): bool
    {
        return $this->canManageOrganizationResourceClass($user);
    }

    public function update(User $user, RouteStop $routeStop): bool
    {
        if ($this->canManageOrganizationResource($user, $routeStop)) {
            return true;
        }

        return $user->isCourier()
            && $user->organization_id !== null
            && (int) $user->organization_id === (int) $routeStop->organization_id
            && (int) $routeStop->route?->courier_user_id === (int) $user->id;
    }

    public function delete(User $user, RouteStop $routeStop): bool
    {
        return $this->canManageOrganizationResource($user, $routeStop);
    }
}
