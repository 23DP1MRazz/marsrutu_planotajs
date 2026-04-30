<?php

namespace App\Http\Requests\Dispatcher\Concerns;

use App\Models\Order;
use Illuminate\Validation\Validator;

trait ValidatesRouteOrderDates
{
    /**
     * @param  array<int, int>  $orderIds
     */
    protected function validateOrderDatesMatchRouteDate(
        Validator $validator,
        array $orderIds,
        int $organizationId,
        ?string $routeDate,
    ): void {
        if ($routeDate === null || $orderIds === []) {
            return;
        }

        $hasMismatchedOrder = Order::query()
            ->whereIn('id', $orderIds)
            ->where('organization_id', $organizationId)
            ->whereDate('date', '!=', $routeDate)
            ->exists();

        if ($hasMismatchedOrder) {
            $validator->errors()->add(
                'order_ids',
                __('validation.custom.order_ids.route_date_match'),
            );
        }
    }
}
