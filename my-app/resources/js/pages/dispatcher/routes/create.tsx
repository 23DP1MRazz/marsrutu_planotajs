import type { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ResourceShell } from '@/components/dispatcher/resource-shell';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatShortDate } from '@/lib/date';
import type {
    AssignableOrder,
    CourierOption,
    OrganizationOption,
} from '@/types/dispatcher';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Routes', href: '/dispatcher/routes' },
    { title: 'Create', href: '/dispatcher/routes/create' },
];

type DispatcherRoutesCreateProps = {
    organizations: OrganizationOption[];
    couriers: CourierOption[];
    orders: AssignableOrder[];
    canSelectOrganization: boolean;
    todayDate: string;
};

export default function DispatcherRoutesCreate({
    organizations,
    couriers,
    orders,
    canSelectOrganization,
    todayDate,
}: DispatcherRoutesCreateProps) {
    const form = useForm({
        organization_id: canSelectOrganization && organizations[0]?.id
            ? String(organizations[0].id)
            : '',
        courier_user_id: couriers[0]?.id ? String(couriers[0].id) : '',
        date: todayDate,
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
        form.transform((data) => {
            if (!canSelectOrganization) {
                const { organization_id: _organizationId, ...rest } = data;
                return rest;
            }

            return data;
        });
        form.post('/dispatcher/routes');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Route" />
            <ResourceShell
                title="Create route"
                description="Create a daily route and assign available orders."
                actionHref="/dispatcher/routes"
                actionLabel="Back to routes"
            >
                <div className="border p-4">
                    <form className="space-y-4" onSubmit={submit}>
                        {canSelectOrganization && organizations.length > 0 && (
                            <div className="space-y-1">
                                <label htmlFor="organization_id" className="block text-sm">
                                    Organization
                                </label>
                                <select
                                    id="organization_id"
                                    value={form.data.organization_id}
                                    onChange={(event) =>
                                        form.setData('organization_id', event.target.value)
                                    }
                                    className="w-full border px-3 py-2"
                                >
                                    {organizations.map((organization) => (
                                        <option key={organization.id} value={organization.id}>
                                            {organization.name}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.organization_id && (
                                    <p className="text-sm text-red-600">
                                        {form.errors.organization_id}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label htmlFor="courier_user_id" className="block text-sm">
                                Courier
                            </label>
                            <select
                                id="courier_user_id"
                                value={form.data.courier_user_id}
                                onChange={(event) =>
                                    form.setData('courier_user_id', event.target.value)
                                }
                                className="w-full border px-3 py-2"
                            >
                                <option value="">Select courier</option>
                                {couriers.map((courier) => (
                                    <option key={courier.id} value={courier.id}>
                                        {courier.name}
                                    </option>
                                ))}
                            </select>
                            {form.errors.courier_user_id && (
                                <p className="text-sm text-red-600">
                                    {form.errors.courier_user_id}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="date" className="block text-sm">
                                Date
                            </label>
                            <input
                                id="date"
                                type="date"
                                value={form.data.date}
                                onChange={(event) => form.setData('date', event.target.value)}
                                className="w-full border px-3 py-2"
                            />
                            {form.errors.date && (
                                <p className="text-sm text-red-600">{form.errors.date}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <h2 className="font-medium">Assign orders</h2>
                            {orders.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No unassigned orders available.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {orders.map((order) => (
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
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={form.processing}>
                                Save
                            </Button>
                            <Button asChild type="button" variant="outline">
                                <Link href="/dispatcher/routes">Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </ResourceShell>
        </AppLayout>
    );
}
