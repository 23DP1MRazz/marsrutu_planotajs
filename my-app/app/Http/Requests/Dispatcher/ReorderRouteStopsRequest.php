<?php

namespace App\Http\Requests\Dispatcher;

use App\Models\DeliveryRoute;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ReorderRouteStopsRequest extends FormRequest
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
            'stop_ids' => ['required', 'array', 'min:1'],
            'stop_ids.*' => [
                'integer',
                'distinct',
                Rule::exists('route_stops', 'id')
                    ->where('route_id', $deliveryRoute->id)
                    ->where('organization_id', $deliveryRoute->organization_id),
            ],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            /** @var DeliveryRoute $deliveryRoute */
            $deliveryRoute = $this->route('deliveryRoute');

            $providedStopIds = collect($this->input('stop_ids', []))
                ->map(fn (mixed $stopId) => (int) $stopId)
                ->sort()
                ->values();

            $routeStopIds = $deliveryRoute->routeStops()
                ->orderBy('id')
                ->pluck('id')
                ->map(fn (int $stopId) => (int) $stopId)
                ->values();

            if (
                $providedStopIds->count() !== $routeStopIds->count()
                || $providedStopIds->all() !== $routeStopIds->all()
            ) {
                $validator->errors()->add(
                    'stop_ids',
                    'The stop order must include every stop from this route exactly once.',
                );
            }
        });
    }
}
