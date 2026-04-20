import { Head, Link, router, useForm } from '@inertiajs/react';
import { ResourceShell } from '@/components/dispatcher/resource-shell';
import { useLiveFiltering } from '@/hooks/use-live-filtering';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatShortDate } from '@/lib/date';
import type { OrderFilters, OrderRecord, OrganizationOption } from '@/types/dispatcher';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Orders', href: '/dispatcher/orders' },
];

type DispatcherOrdersIndexProps = {
    orders: OrderRecord[];
    filters: OrderFilters;
    statuses: string[];
    organizations: OrganizationOption[];
    canFilterByOrganization: boolean;
};

export default function DispatcherOrdersIndex({
    orders,
    filters,
    statuses,
    organizations,
    canFilterByOrganization,
}: DispatcherOrdersIndexProps) {
    const filterForm = useForm({
        date: filters.date ?? '',
        status: filters.status ?? '',
        client: filters.client ?? '',
        address: filters.address ?? '',
        organization_id: filters.organization_id ?? '',
        sort: filters.sort ?? 'date_desc',
    });

    useLiveFiltering({
        data: filterForm.data,
        url: '/dispatcher/orders',
    });

    const deleteOrder = (orderId: number) => {
        router.delete(`/dispatcher/orders/${orderId}`);
    };

    const clearFilters = () => {
        filterForm.setData({
            date: '',
            status: '',
            client: '',
            address: '',
            organization_id: '',
            sort: 'date_desc',
        });
    };

    const exportQuery = new URLSearchParams(
        Object.entries(filterForm.data).filter(([, value]) => value !== ''),
    ).toString();

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
                    <div className="space-y-4">
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
                                <label htmlFor="address" className="block text-sm">
                                    Address
                                </label>
                                <input
                                    id="address"
                                    name="address"
                                    type="text"
                                    value={filterForm.data.address}
                                    onChange={(event) =>
                                        filterForm.setData('address', event.target.value)
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

                        <div className="grid gap-4 md:grid-cols-2">
                            {canFilterByOrganization && (
                                <div className="space-y-1">
                                    <label htmlFor="organization_id" className="block text-sm">
                                        Organization
                                    </label>
                                    <select
                                        id="organization_id"
                                        name="organization_id"
                                        value={filterForm.data.organization_id}
                                        onChange={(event) =>
                                            filterForm.setData('organization_id', event.target.value)
                                        }
                                        className="w-full border px-3 py-2"
                                    >
                                        <option value="">All organizations</option>
                                        {organizations.map((organization) => (
                                            <option key={organization.id} value={String(organization.id)}>
                                                {organization.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label htmlFor="sort" className="block text-sm">
                                    Sort by
                                </label>
                                <select
                                    id="sort"
                                    name="sort"
                                    value={filterForm.data.sort}
                                    onChange={(event) =>
                                        filterForm.setData('sort', event.target.value)
                                    }
                                    className="w-full border px-3 py-2"
                                >
                                    <option value="date_desc">Date (newest)</option>
                                    <option value="date_asc">Date (oldest)</option>
                                    <option value="time_asc">Time (earliest)</option>
                                    <option value="time_desc">Time (latest)</option>
                                    <option value="status_asc">Status (A-Z)</option>
                                    <option value="status_desc">Status (Z-A)</option>
                                    <option value="updated_desc">Updated (newest)</option>
                                    <option value="updated_asc">Updated (oldest)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={clearFilters}
                            >
                                Clear
                            </Button>
                            <Button asChild type="button" variant="outline">
                                <a href={`/dispatcher/orders/export${exportQuery ? `?${exportQuery}` : ''}`}>
                                    Export CSV
                                </a>
                            </Button>
                        </div>
                    </div>
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
                                        <td className="p-2">
                                            <Link
                                                href={`/dispatcher/orders/${order.id}/edit`}
                                                className="block underline-offset-4 hover:underline"
                                            >
                                                {order.client_name ?? `Order #${order.id}`}
                                            </Link>
                                        </td>
                                        <td className="p-2">{order.address_label || '-'}</td>
                                        <td className="p-2">{formatShortDate(order.date)}</td>
                                        <td className="p-2">
                                            {order.time_from} - {order.time_to}
                                        </td>
                                        <td className="p-2">{order.status}</td>
                                        <td className="p-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => deleteOrder(order.id)}
                                            >
                                                Delete
                                            </Button>
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
