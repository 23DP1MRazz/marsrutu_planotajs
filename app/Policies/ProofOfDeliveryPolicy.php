<?php

namespace App\Policies;

use App\Models\ProofOfDelivery;
use App\Models\User;
use App\Policies\Concerns\HandlesOrganizationAuthorization;

class ProofOfDeliveryPolicy
{
    use HandlesOrganizationAuthorization;

    public function viewAny(User $user): bool
    {
        return $this->canViewAnyOrganizationResource($user);
    }

    public function view(User $user, ProofOfDelivery $proofOfDelivery): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isDispatcher()) {
            return $this->canViewOrganizationResource($user, $proofOfDelivery);
        }

        if (! $user->isCourier()) {
            return false;
        }

        $proofOfDelivery->loadMissing('routeStop.route');

        return $this->canViewOrganizationResource($user, $proofOfDelivery)
            && $proofOfDelivery->routeStop?->route !== null
            && (int) $proofOfDelivery->routeStop->route->courier_user_id === (int) $user->id;
    }

    public function create(User $user): bool
    {
        return $this->canOperateOrganizationResourceClass($user);
    }

    public function update(User $user, ProofOfDelivery $proofOfDelivery): bool
    {
        return $this->canOperateOrganizationResource($user, $proofOfDelivery);
    }

    public function delete(User $user, ProofOfDelivery $proofOfDelivery): bool
    {
        return $this->canManageOrganizationResource($user, $proofOfDelivery);
    }
}
