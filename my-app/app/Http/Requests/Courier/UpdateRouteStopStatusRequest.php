<?php

namespace App\Http\Requests\Courier;

use App\Models\RouteStop;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRouteStopStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $routeStop = $this->route('routeStop');

        return $routeStop instanceof RouteStop
            && ($this->user()?->can('update', $routeStop) ?? false);
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['ARRIVED', 'COMPLETED', 'FAILED'])],
            'fail_reason' => [
                'nullable',
                'string',
                'max:500',
                Rule::requiredIf($this->input('status') === 'FAILED'),
                Rule::prohibitedIf($this->input('status') !== 'FAILED'),
            ],
        ];
    }
}
