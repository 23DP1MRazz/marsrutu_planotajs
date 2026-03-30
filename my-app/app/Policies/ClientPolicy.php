<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\User;
use App\Policies\Concerns\HandlesOrganizationAuthorization;

class ClientPolicy
{
    use HandlesOrganizationAuthorization;

    public function viewAny(User $user): bool
    {
        return $this->canViewAnyOrganizationResource($user);
    }

    public function view(User $user, Client $client): bool
    {
        return $this->canViewOrganizationResource($user, $client);
    }

    public function create(User $user): bool
    {
        return $this->canManageOrganizationResourceClass($user);
    }

    public function update(User $user, Client $client): bool
    {
        return $this->canManageOrganizationResource($user, $client);
    }

    public function delete(User $user, Client $client): bool
    {
        return $this->canManageOrganizationResource($user, $client);
    }
}

