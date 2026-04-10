import type { FormEvent } from 'react';
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
                    <h2 className="mb-4 font-medium">Stops</h2>
                    {stops.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No stops assigned yet.
                        </p>
                    ) : (
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="p-2">Seq.</th>
                                    <th className="p-2">Order</th>
                                    <th className="p-2">Client</th>
                                    <th className="p-2">Address</th>
                                    <th className="p-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stops.map((stop) => (
                                    <tr key={stop.id} className="border-b">
                                        <td className="p-2">{stop.seq_no}</td>
                                        <td className="p-2">#{stop.order_id}</td>
                                        <td className="p-2">{stop.client_name ?? '-'}</td>
                                        <td className="p-2">{stop.address_label || '-'}</td>
                                        <td className="p-2">{stop.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
