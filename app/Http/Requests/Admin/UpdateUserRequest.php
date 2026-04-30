<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Concerns\LocalizesValidationAttributes;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateUserRequest extends FormRequest
{
    use LocalizesValidationAttributes;

    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var User $managedUser */
        $managedUser = $this->route('user');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($managedUser->id),
            ],
            'role' => ['required', Rule::in(['admin', 'dispatcher', 'courier'])],
            'organization_id' => ['nullable', 'integer', Rule::exists('organizations', 'id')],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            /** @var User $managedUser */
            $managedUser = $this->route('user');
            $role = $this->input('role');
            $organizationId = $this->filled('organization_id')
                ? (int) $this->input('organization_id')
                : null;

            if (in_array($role, ['dispatcher', 'courier'], true) && $organizationId === null) {
                $validator->errors()->add('organization_id', __('validation.custom.organization_id.required_for_role'));
            }

            if (
                $managedUser->isAdmin()
                && $role !== 'admin'
                && User::query()->where('role', 'admin')->count() === 1
            ) {
                $validator->errors()->add('role', __('validation.custom.role.last_admin'));
            }

            $isCourierTransition = $managedUser->isCourier()
                && (
                    $role !== 'courier'
                    || $organizationId !== $managedUser->organization_id
                );

            if (! $isCourierTransition) {
                return;
            }

            if ($managedUser->courierProfile?->routes()->exists()) {
                $validator->errors()->add(
                    'role',
                    __('validation.custom.role.courier_routes_exist'),
                );
            }
        });
    }
}
