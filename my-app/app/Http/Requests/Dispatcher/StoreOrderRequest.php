<?php

namespace App\Http\Requests\Dispatcher;

use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    /**
     * @var list<string>
     */
    private const STATUSES = [
        'NEW',
        'PENDING',
        'ASSIGNED',
        'IN_PROGRESS',
        'COMPLETED',
        'FAILED',
        'CANCELLED',
    ];

    public function authorize(): bool
    {
        return $this->user()?->can('create', Order::class) ?? false;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $organizationId = $this->resolvedOrganizationId();

        $organizationRules = $this->user()?->isAdmin()
            ? ['required', 'integer', Rule::exists('organizations', 'id')]
            : ['prohibited'];

        return [
            'organization_id' => $organizationRules,
            'client_id' => [
                'required',
                'integer',
                Rule::exists('clients', 'id')->where('organization_id', $organizationId),
            ],
            'address_id' => [
                'required',
                'integer',
                Rule::exists('addresses', 'id')->where('organization_id', $organizationId),
            ],
            'date' => ['required', 'date'],
            'time_from' => ['required', 'date_format:H:i'],
            'time_to' => ['required', 'date_format:H:i', 'after:time_from'],
            'status' => ['required', 'string', Rule::in(self::STATUSES)],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    private function resolvedOrganizationId(): int
    {
        return $this->user()?->isAdmin()
            ? (int) $this->input('organization_id')
            : (int) $this->user()->organization_id;
    }
}
