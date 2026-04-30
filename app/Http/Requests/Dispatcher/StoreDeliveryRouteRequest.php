<?php

namespace App\Http\Requests\Dispatcher;

use App\Http\Requests\Concerns\LocalizesValidationAttributes;
use App\Http\Requests\Dispatcher\Concerns\ValidatesRouteOrderDates;
use App\Models\DeliveryRoute;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreDeliveryRouteRequest extends FormRequest
{
    use LocalizesValidationAttributes;
    use ValidatesRouteOrderDates;

    /**
     * @var list<string>
     */
    private const ASSIGNABLE_ORDER_STATUSES = ['NEW', 'PENDING'];

    public function authorize(): bool
    {
        return $this->user()?->can('create', DeliveryRoute::class) ?? false;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $organizationId = $this->resolvedOrganizationId();

        return [
            'organization_id' => $this->user()?->isAdmin()
                ? ['required', 'integer', Rule::exists('organizations', 'id')]
                : ['prohibited'],
            'courier_user_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')
                    ->where('organization_id', $organizationId)
                    ->where('role', 'courier'),
                Rule::exists('couriers', 'user_id'),
                Rule::unique('routes', 'courier_user_id')
                    ->where('organization_id', $organizationId)
                    ->where('date', $this->input('date')),
            ],
            'date' => ['required', 'date'],
            'order_ids' => ['nullable', 'array'],
            'order_ids.*' => [
                'integer',
                'distinct',
                Rule::exists('orders', 'id')
                    ->where('organization_id', $organizationId)
                    ->where(fn ($query) => $query->whereIn('status', self::ASSIGNABLE_ORDER_STATUSES)),
                Rule::unique('route_stops', 'order_id'),
            ],
        ];
    }

    /**
     * @return array<int, \Closure(\Illuminate\Validation\Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $this->validateOrderDatesMatchRouteDate(
                    $validator,
                    array_map('intval', $this->input('order_ids', [])),
                    $this->resolvedOrganizationId(),
                    $this->input('date'),
                );
            },
        ];
    }

    private function resolvedOrganizationId(): int
    {
        return $this->user()?->isAdmin()
            ? (int) $this->input('organization_id')
            : (int) $this->user()->organization_id;
    }
}
