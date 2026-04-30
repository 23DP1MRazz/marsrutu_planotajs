<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;
use App\Policies\Concerns\HandlesOrganizationAuthorization;

class OrderPolicy
{
    use HandlesOrganizationAuthorization;

    public function viewAny(User $user): bool
    {
        return $this->canViewAnyOrganizationResource($user);
    }

    public function view(User $user, Order $order): bool
    {
        return $this->canViewOrganizationResource($user, $order);
    }

    public function create(User $user): bool
    {
        return $this->canManageOrganizationResourceClass($user);
    }

    public function update(User $user, Order $order): bool
    {
        return $this->canManageOrganizationResource($user, $order);
    }

    public function delete(User $user, Order $order): bool
    {
        return $this->canManageOrganizationResource($user, $order);
    }
}

