<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

abstract class Controller
{
    protected function scopeVisibleToCurrentOrganization(Builder $query, User $user): Builder
    {
        if ($user->isAdmin()) {
            return $query;
        }

        return $query->where(
            $query->getModel()->qualifyColumn('organization_id'),
            $user->organization_id,
        );
    }
}
