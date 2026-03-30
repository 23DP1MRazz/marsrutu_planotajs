<?php

namespace App\Policies\Concerns;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

trait HandlesOrganizationAuthorization
{
    protected function canViewOrganizationResource(User $user, Model $model): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->organization_id !== null
            && (int) $user->organization_id === (int) $model->organization_id;
    }

    protected function canViewAnyOrganizationResource(User $user): bool
    {
        return $user->isAdmin() || $user->organization_id !== null;
    }

    protected function canManageOrganizationResource(User $user, Model $model): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isDispatcher()
            && $user->organization_id !== null
            && (int) $user->organization_id === (int) $model->organization_id;
    }

    protected function canManageOrganizationResourceClass(User $user): bool
    {
        return $user->isAdmin() || ($user->isDispatcher() && $user->organization_id !== null);
    }

    protected function canOperateOrganizationResource(User $user, Model $model): bool
    {
        if ($this->canManageOrganizationResource($user, $model)) {
            return true;
        }

        return $user->isCourier()
            && $user->organization_id !== null
            && (int) $user->organization_id === (int) $model->organization_id;
    }

    protected function canOperateOrganizationResourceClass(User $user): bool
    {
        return $this->canManageOrganizationResourceClass($user)
            || ($user->isCourier() && $user->organization_id !== null);
    }
}

