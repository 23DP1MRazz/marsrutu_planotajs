<?php

namespace App\Policies;

use App\Models\Address;
use App\Models\User;
use App\Policies\Concerns\HandlesOrganizationAuthorization;

class AddressPolicy
{
    use HandlesOrganizationAuthorization;

    public function viewAny(User $user): bool
    {
        return $this->canViewAnyOrganizationResource($user);
    }

    public function view(User $user, Address $address): bool
    {
        return $this->canViewOrganizationResource($user, $address);
    }

    public function create(User $user): bool
    {
        return $this->canManageOrganizationResourceClass($user);
    }

    public function update(User $user, Address $address): bool
    {
        return $this->canManageOrganizationResource($user, $address);
    }

    public function delete(User $user, Address $address): bool
    {
        return $this->canManageOrganizationResource($user, $address);
    }
}

