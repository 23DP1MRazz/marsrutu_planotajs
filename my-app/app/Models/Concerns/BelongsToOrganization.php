<?php

namespace App\Models\Concerns;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

trait BelongsToOrganization
{
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if ($user->isAdmin()) {
            return $query;
        }

        return $query->where(
            $query->getModel()->qualifyColumn('organization_id'),
            $user->organization_id,
        );
    }

    public function belongsToSameOrganization(User $user): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->organization_id !== null
            && (int) $user->organization_id === (int) $this->organization_id;
    }
}

