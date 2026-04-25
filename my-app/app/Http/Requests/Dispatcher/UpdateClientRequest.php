<?php

namespace App\Http\Requests\Dispatcher;

use App\Http\Requests\Concerns\LocalizesValidationAttributes;
use App\Models\Client;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClientRequest extends FormRequest
{
    use LocalizesValidationAttributes;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $client = $this->route('client');

        return $client instanceof Client
            && ($this->user()?->can('update', $client) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $organizationRules = $this->user()?->isAdmin()
            ? ['required', 'integer', Rule::exists('organizations', 'id')]
            : ['prohibited'];

        return [
            'organization_id' => $organizationRules,
            'name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:32'],
        ];
    }
}
