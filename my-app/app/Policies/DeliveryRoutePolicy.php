<?php

namespace App\Policies;

use App\Models\DeliveryRoute;
use App\Models\User;
use App\Policies\Concerns\HandlesOrganizationAuthorization;

class DeliveryRoutePolicy
{
    use HandlesOrganizationAuthorization;

    public function viewAny(User $user): bool
    {
        return $this->canViewAnyOrganizationResource($user);
    }

    public function view(User $user, DeliveryRoute $deliveryRoute): bool
    {
        if ($this->canViewOrganizationResource($user, $deliveryRoute) && ! $user->isCourier()) {
            return true;
        }

        return $user->isCourier()
            && $user->organization_id !== null
            && (int) $user->organization_id === (int) $deliveryRoute->organization_id
            && (int) $deliveryRoute->courier_user_id === (int) $user->id;
    }

    public function create(User $user): bool
    {
        return $this->canManageOrganizationResourceClass($user);
    }

    public function update(User $user, DeliveryRoute $deliveryRoute): bool
    {
        return $this->canManageOrganizationResource($user, $deliveryRoute);
    }

    public function delete(User $user, DeliveryRoute $deliveryRoute): bool
    {
        return $this->canManageOrganizationResource($user, $deliveryRoute);
    }
}
