<?php

namespace App\Http\Requests\Dispatcher;

use App\Http\Requests\Concerns\LocalizesValidationAttributes;
use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateOrderRequest extends FormRequest
{
    use LocalizesValidationAttributes;

    public function authorize(): bool
    {
        $order = $this->route('order');

        return $order instanceof Order
            && ($this->user()?->can('update', $order) ?? false);
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
            'status' => ['prohibited'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<int, \Closure(\Illuminate\Validation\Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                /** @var Order $order */
                $order = $this->route('order');
                $order->loadMissing('routeStops.route:id,date');

                if (
                    $this->user()?->isAdmin()
                    && $order->routeStops->isNotEmpty()
                    && (int) $this->input('organization_id') !== (int) $order->organization_id
                ) {
                    $validator->errors()->add(
                        'organization_id',
                        __('validation.custom.order.organization_locked'),
                    );
                }

                $routeDate = $order->routeStops->first()?->route?->date;

                if ($routeDate !== null && $this->input('date') !== $routeDate) {
                    $validator->errors()->add(
                        'date',
                        __('validation.custom.order.date_must_match_route'),
                    );
                }
            },
        ];
    }

    private function resolvedOrganizationId(): int
    {
        if ($this->user()?->isAdmin()) {
            return (int) $this->input('organization_id');
        }

        /** @var Order $order */
        $order = $this->route('order');

        return (int) $order->organization_id;
    }
}
