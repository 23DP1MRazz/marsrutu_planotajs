<?php

namespace App\Http\Requests\Concerns;

trait LocalizesValidationAttributes
{
    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        /** @var array<string, string> $attributes */
        $attributes = __('validation.attributes');

        return is_array($attributes) ? $attributes : [];
    }
}
