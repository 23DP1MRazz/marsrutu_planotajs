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
        return $this->canViewOrganizationResource($user, $proofOfDelivery);
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

