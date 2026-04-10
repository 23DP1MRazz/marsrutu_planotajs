<?php

namespace App\Http\Requests\Dispatcher;

use App\Models\DeliveryRoute;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssignRouteOrdersRequest extends FormRequest
{
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
                    ->where('status', 'NEW'),
                Rule::unique('route_stops', 'order_id'),
            ],
        ];
    }
}
