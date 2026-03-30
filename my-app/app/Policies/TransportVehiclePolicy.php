<?php

namespace App\Policies;

use App\Models\TransportVehicle;
use App\Models\User;
use App\Policies\Concerns\HandlesOrganizationAuthorization;

class TransportVehiclePolicy
{
    use HandlesOrganizationAuthorization;

    public function viewAny(User $user): bool
    {
        return $this->canViewAnyOrganizationResource($user);
    }

    public function view(User $user, TransportVehicle $transportVehicle): bool
    {
        return $this->canViewOrganizationResource($user, $transportVehicle);
    }

    public function create(User $user): bool
    {
        return $this->canManageOrganizationResourceClass($user);
    }

    public function update(User $user, TransportVehicle $transportVehicle): bool
    {
        return $this->canManageOrganizationResource($user, $transportVehicle);
    }

    public function delete(User $user, TransportVehicle $transportVehicle): bool
    {
        return $this->canManageOrganizationResource($user, $transportVehicle);
    }
}

