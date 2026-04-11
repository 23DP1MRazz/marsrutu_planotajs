import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { ResourceShell } from '@/components/dispatcher/resource-shell';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatShortDate } from '@/lib/date';
import type {
    AssignableOrder,
    DeliveryRouteRecord,
    RouteStopRecord,
} from '@/types/dispatcher';
import type { BreadcrumbItem } from '@/types';

type DispatcherRoutesShowProps = {
    deliveryRoute: DeliveryRouteRecord;
    stops: RouteStopRecord[];
    availableOrders: AssignableOrder[];
};

export default function DispatcherRoutesShow({
    deliveryRoute,
    stops,
    availableOrders,
}: DispatcherRoutesShowProps) {
    const [orderedStops, setOrderedStops] = useState(stops);

    useEffect(() => {
        setOrderedStops(stops);
    }, [stops]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Routes', href: '/dispatcher/routes' },
        { title: `Route ${deliveryRoute.id}`, href: `/dispatcher/routes/${deliveryRoute.id}` },
    ];

    const form = useForm({
        order_ids: [] as number[],
    });

    const toggleOrder = (orderId: number) => {
        form.setData(
            'order_ids',
            form.data.order_ids.includes(orderId)
                ? form.data.order_ids.filter((selectedOrderId) => selectedOrderId !== orderId)
                : [...form.data.order_ids, orderId],
        );
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(`/dispatcher/routes/${deliveryRoute.id}/orders`);
    };

    const hasLocalReorderChanges = useMemo(
        () => orderedStops.some((stop, index) => stop.id !== stops[index]?.id),
        [orderedStops, stops],
    );

    const moveStop = (index: number, direction: -1 | 1) => {
        const targetIndex = index + direction;

        if (targetIndex < 0 || targetIndex >= orderedStops.length) {
            return;
        }

        const nextStops = [...orderedStops];
        const [movedStop] = nextStops.splice(index, 1);

        nextStops.splice(targetIndex, 0, movedStop);

        setOrderedStops(nextStops);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Route ${deliveryRoute.id}`} />
            <ResourceShell
                title={`Route ${deliveryRoute.id}`}
                description={`${deliveryRoute.courier_name ?? '-'} — ${formatShortDate(deliveryRoute.date)} — ${deliveryRoute.status}`}
                actionHref="/dispatcher/routes"
                actionLabel="Back to routes"
            >
                <div className="border p-4">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <h2 className="font-medium">Stops</h2>

                        {hasLocalReorderChanges && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOrderedStops(stops)}
                            >
                                Reset preview
                            </Button>
                        )}
                    </div>

                    {orderedStops.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No stops assigned yet.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {orderedStops.map((stop, index) => (
                                <div
                                    key={stop.id}
                                    className="flex items-center justify-between gap-4 border p-3 text-sm"
                                >
                                    <div className="space-y-1">
                                        <p>
                                            <span className="font-medium">
                                                Stop {index + 1}
                                            </span>{' '}
                                            — Order #{stop.order_id}
                                        </p>
                                        <p>{stop.client_name ?? '-'}</p>
                                        <p>{stop.address_label || '-'}</p>
                                        <p className="text-muted-foreground">
                                            Status: {stop.status}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => moveStop(index, -1)}
                                            disabled={index === 0}
                                        >
                                            Up
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => moveStop(index, 1)}
                                            disabled={index === orderedStops.length - 1}
                                        >
                                            Down
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {hasLocalReorderChanges && (
                        <p className="mt-4 text-sm text-muted-foreground">
                            Reorder preview is local for now. Saving this order comes in the
                            next step.
                        </p>
                    )}
                </div>

                <div className="border p-4">
                    <form className="space-y-4" onSubmit={submit}>
                        <h2 className="font-medium">Assign more orders</h2>
                        {availableOrders.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No unassigned orders available.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {availableOrders.map((order) => (
                                    <label
                                        key={order.id}
                                        className="flex gap-2 border p-2 text-sm"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={form.data.order_ids.includes(order.id)}
                                            onChange={() => toggleOrder(order.id)}
                                        />
                                        <span>
                                            #{order.id} — {order.client_name ?? '-'} —{' '}
                                            {order.address_label || '-'} —{' '}
                                            {formatShortDate(order.date)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                        {form.errors.order_ids && (
                            <p className="text-sm text-red-600">{form.errors.order_ids}</p>
                        )}

                        <Button
                            type="submit"
                            disabled={form.processing || availableOrders.length === 0}
                        >
                            Assign selected
                        </Button>
                    </form>
                </div>
            </ResourceShell>
        </AppLayout>
    );
}
