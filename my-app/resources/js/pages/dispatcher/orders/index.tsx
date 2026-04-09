import type { FormEvent } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ResourceShell } from '@/components/dispatcher/resource-shell';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { OrderFilters, OrderRecord } from '@/types/dispatcher';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Orders', href: '/dispatcher/orders' },
];

const orderDateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
});

type DispatcherOrdersIndexProps = {
    orders: OrderRecord[];
    filters: OrderFilters;
    statuses: string[];
};

export default function DispatcherOrdersIndex({
    orders,
    filters,
    statuses,
}: DispatcherOrdersIndexProps) {
    const filterForm = useForm({
        date: filters.date,
        status: filters.status,
        client: filters.client,
    });

    const deleteOrder = (orderId: number) => {
        router.delete(`/dispatcher/orders/${orderId}`);
    };

    const formatOrderDate = (date: string) =>
        orderDateFormatter.format(new Date(`${date}T00:00:00`));

    const submitFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get('/dispatcher/orders', filterForm.data, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        filterForm.setData({
            date: '',
            status: '',
            client: '',
        });

        router.get(
            '/dispatcher/orders',
            {
                date: '',
                status: '',
                client: '',
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />
            <ResourceShell
                title="Orders"
                description="Manage delivery orders for your organization."
                actionHref="/dispatcher/orders/create"
                actionLabel="Create order"
            >
                <div className="border p-4">
                    <form className="space-y-4" onSubmit={submitFilters}>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-1">
                                <label htmlFor="client" className="block text-sm">
                                    Client
                                </label>
                                <input
                                    id="client"
                                    name="client"
                                    type="text"
                                    value={filterForm.data.client}
                                    onChange={(event) =>
                                        filterForm.setData('client', event.target.value)
                                    }
                                    className="w-full border px-3 py-2"
                                />
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="date" className="block text-sm">
                                    Date
                                </label>
                                <input
                                    id="date"
                                    name="date"
                                    type="date"
                                    value={filterForm.data.date}
                                    onChange={(event) =>
                                        filterForm.setData('date', event.target.value)
                                    }
                                    className="w-full border px-3 py-2"
                                />
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="status" className="block text-sm">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={filterForm.data.status}
                                    onChange={(event) =>
                                        filterForm.setData('status', event.target.value)
                                    }
                                    className="w-full border px-3 py-2"
                                >
                                    <option value="">All statuses</option>
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit">Apply filters</Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={clearFilters}
                            >
                                Clear
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="border p-4">
                    {orders.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No orders created yet.
                        </p>
                    ) : (
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="p-2">Client</th>
                                    <th className="p-2">Address</th>
                                    <th className="p-2">Date</th>
                                    <th className="p-2">Time window</th>
                                    <th className="p-2">Status</th>
                                    <th className="p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} className="border-b">
                                        <td className="p-2">{order.client_name ?? '-'}</td>
                                        <td className="p-2">{order.address_label || '-'}</td>
                                        <td className="p-2">{formatOrderDate(order.date)}</td>
                                        <td className="p-2">
                                            {order.time_from} - {order.time_to}
                                        </td>
                                        <td className="p-2">{order.status}</td>
                                        <td className="p-2">
                                            <div className="flex gap-2">
                                                <Button asChild type="button" variant="outline">
                                                    <Link href={`/dispatcher/orders/${order.id}/edit`}>
                                                        Edit
                                                    </Link>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => deleteOrder(order.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </ResourceShell>
        </AppLayout>
    );
}
