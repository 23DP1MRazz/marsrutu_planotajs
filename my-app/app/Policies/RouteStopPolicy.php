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
        return $this->canViewOrganizationResource($user, $routeStop);
    }

    public function create(User $user): bool
    {
        return $this->canManageOrganizationResourceClass($user);
    }

    public function update(User $user, RouteStop $routeStop): bool
    {
        return $this->canOperateOrganizationResource($user, $routeStop);
    }

    public function delete(User $user, RouteStop $routeStop): bool
    {
        return $this->canManageOrganizationResource($user, $routeStop);
    }
}

