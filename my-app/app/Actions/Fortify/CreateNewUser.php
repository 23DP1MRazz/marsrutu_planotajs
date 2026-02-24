<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Courier;
use App\Models\Dispatcher;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, mixed>  $input
     */
    public function create(array $input): User
    {
        // Validate role and organization choice.
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'role' => ['required', 'string', Rule::in(['dispatcher', 'courier'])],
            'org_action' => ['required', 'string', Rule::in(['create', 'join'])],
            'organization_name' => ['required_if:org_action,create', 'string', 'max:255'],
            'organization_join_code' => ['required_if:org_action,join', 'string', 'max:32'],
        ])->validate();

        return DB::transaction(function () use ($input): User {
            // Create or find organization first.
            $organization = $this->resolveOrganization($input);

            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
                'role' => $input['role'],
                'organization_id' => $organization->id,
            ]);

            if ($user->isDispatcher()) {
                Dispatcher::create([
                    'user_id' => $user->id,
                ]);
            }

            if ($user->isCourier()) {
                Courier::create([
                    'user_id' => $user->id,
                    'on_duty' => false,
                ]);
            }

            return $user;
        });
    }

    /**
     * @param  array<string, mixed>  $input
     */
    private function resolveOrganization(array $input): Organization
    {
        if ($input['org_action'] === 'create') {
            return Organization::create([
                'name' => trim((string) $input['organization_name']),
                'join_code' => $this->generateJoinCode(),
            ]);
        }

        $joinCode = Str::upper(trim((string) $input['organization_join_code']));

        $organization = Organization::query()
            ->where('join_code', $joinCode)
            ->first();

        if ($organization === null) {
            throw ValidationException::withMessages([
                'organization_join_code' => __('Invalid organization join code.'),
            ]);
        }

        return $organization;
    }

    private function generateJoinCode(): string
    {
        do {
            // Retry until the code is unique.
            $joinCode = Str::upper(Str::random(8));
        } while (Organization::query()->where('join_code', $joinCode)->exists());

        return $joinCode;
    }
}
