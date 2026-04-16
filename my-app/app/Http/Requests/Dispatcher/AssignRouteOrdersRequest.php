<?php

namespace App\Http\Requests\Dispatcher;

use App\Models\DeliveryRoute;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignRouteOrdersRequest extends FormRequest
{
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
}
