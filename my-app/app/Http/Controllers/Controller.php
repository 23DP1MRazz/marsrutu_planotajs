<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

abstract class Controller
{
    use AuthorizesRequests;

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

    /**
     * @param  resource  $handle
     * @param  array<int, mixed>  $row
     */
    protected function writeAsciiCsvRow($handle, array $row): void
    {
        fputcsv($handle, array_map(
            fn (mixed $value): string => $this->toAsciiCsvText($value),
            $row,
        ));
    }

    protected function toAsciiCsvText(mixed $value): string
    {
        if ($value === null) {
            return '';
        }

        $text = (string) $value;
        $text = strtr($text, [
            'Ā' => 'A',
            'ā' => 'a',
            'Č' => 'C',
            'č' => 'c',
            'Ē' => 'E',
            'ē' => 'e',
            'Ģ' => 'G',
            'ģ' => 'g',
            'Ī' => 'I',
            'ī' => 'i',
            'Ķ' => 'K',
            'ķ' => 'k',
            'Ļ' => 'L',
            'ļ' => 'l',
            'Ņ' => 'N',
            'ņ' => 'n',
            'Š' => 'S',
            'š' => 's',
            'Ū' => 'U',
            'ū' => 'u',
            'Ž' => 'Z',
            'ž' => 'z',
        ]);

        return preg_replace('/[^\x20-\x7E]/', '', $text) ?? '';
    }
}
