<?php

namespace App\Http\Requests\Dispatcher\Concerns;

trait HasPhoneValidation
{
    /**
     * @return list<string>
     */
    protected function phoneRules(): array
    {
        return ['required', 'regex:/^2\d{7}$/'];
    }

    /**
     * @return array<string, string>
     */
    protected function phoneMessages(): array
    {
        return [
            'phone.regex' => __('validation.custom.phone.incorrect'),
        ];
    }
}
