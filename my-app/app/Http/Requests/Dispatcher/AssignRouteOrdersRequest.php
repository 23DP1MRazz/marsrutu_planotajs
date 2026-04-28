<?php

namespace App\Http\Requests\Dispatcher;

use App\Http\Requests\Concerns\LocalizesValidationAttributes;
use App\Http\Requests\Dispatcher\Concerns\ValidatesRouteOrderDates;
use App\Models\DeliveryRoute;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class AssignRouteOrdersRequest extends FormRequest
{
    use LocalizesValidationAttributes;
    use ValidatesRouteOrderDates;

    /**
     * @var list<string>
     */
    private const ASSIGNABLE_ORDER_STATUSES = ['NEW', 'PENDING'];

    public function authorize(): bool
    {
        $deliveryRoute = $this->route('deliveryRoute');

        return $deliveryRoute instanceof DeliveryRoute
            && ($this->user()?->can('update', $deliveryRoute) ?? false);
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var DeliveryRoute $deliveryRoute */
        $deliveryRoute = $this->route('deliveryRoute');

        return [
            'order_ids' => ['required', 'array', 'min:1'],
            'order_ids.*' => [
                'integer',
                'distinct',
                Rule::exists('orders', 'id')
                    ->where('organization_id', $deliveryRoute->organization_id)
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
                /** @var DeliveryRoute $deliveryRoute */
                $deliveryRoute = $this->route('deliveryRoute');

                $this->validateOrderDatesMatchRouteDate(
                    $validator,
                    array_map('intval', $this->input('order_ids', [])),
                    (int) $deliveryRoute->organization_id,
                    $deliveryRoute->date,
                );
            },
        ];
    }
}
