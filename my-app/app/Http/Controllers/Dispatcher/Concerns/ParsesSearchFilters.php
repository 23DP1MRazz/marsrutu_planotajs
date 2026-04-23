<?php

namespace App\Http\Controllers\Dispatcher\Concerns;

trait ParsesSearchFilters
{
    /**
     * @return list<string>
     */
    protected function searchTerms(string $search): array
    {
        return array_values(array_filter(
            array_map('trim', explode('||', $search)),
            fn (string $term): bool => $term !== '',
        ));
    }

    protected function monthNumberForSearchTerm(string $searchTerm): ?int
    {
        $month = strtolower(trim($searchTerm, " \t\n\r\0\x0B."));

        if ($month === '' || preg_match('/\d/', $month)) {
            return null;
        }

        $matches = [];

        foreach (range(1, 12) as $monthNumber) {
            $date = \DateTimeImmutable::createFromFormat('!n', (string) $monthNumber);

            if (! $date instanceof \DateTimeImmutable) {
                continue;
            }

            foreach ([strtolower($date->format('F')), strtolower($date->format('M'))] as $monthName) {
                if (str_starts_with(rtrim($monthName, '.'), $month)) {
                    $matches[] = $monthNumber;
                }
            }
        }

        $matches = array_values(array_unique($matches));

        return count($matches) === 1 ? $matches[0] : null;
    }
}
