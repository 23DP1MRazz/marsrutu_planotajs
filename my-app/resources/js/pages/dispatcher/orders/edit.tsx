import type { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ResourceShell } from '@/components/dispatcher/resource-shell';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type {
    AddressOption,
    ClientOption,
    OrderRecord,
    OrganizationOption,
} from '@/types/dispatcher';
import type { BreadcrumbItem } from '@/types';

type EditableOrder = Omit<
    OrderRecord,
    'updated_at' | 'client_name' | 'address_label'
>;

type DispatcherOrdersEditProps = {
    orderId: string;
    order: EditableOrder;
    organizations: OrganizationOption[];
    clients: ClientOption[];
    addresses: AddressOption[];
    statuses: string[];
    canSelectOrganization: boolean;
};

export default function DispatcherOrdersEdit({
    orderId,
    order,
    organizations,
    clients,
    addresses,
    statuses,
    canSelectOrganization,
}: DispatcherOrdersEditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Orders', href: '/dispatcher/orders' },
        { title: `Edit ${orderId}`, href: `/dispatcher/orders/${orderId}/edit` },
    ];

    const form = useForm({
        organization_id: canSelectOrganization ? String(order.organization_id) : '',
        client_id: String(order.client_id),
        address_id: String(order.address_id),
        date: order.date,
        time_from: order.time_from.slice(0, 5),
        time_to: order.time_to.slice(0, 5),
        status: order.status,
        notes: order.notes ?? '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.transform((data) => {
            if (!canSelectOrganization) {
                const { organization_id: _organizationId, ...rest } = data;
                return rest;
            }

            return data;
        });
        form.patch(`/dispatcher/orders/${order.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Order" />
            <ResourceShell
                title={`Edit order ${orderId}`}
                description="Update the selected order."
                actionHref="/dispatcher/orders"
                actionLabel="Back to orders"
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
                                    name="organization_id"
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
                            <label htmlFor="client_id" className="block text-sm">
                                Client
                            </label>
                            <select
                                id="client_id"
                                name="client_id"
                                value={form.data.client_id}
                                onChange={(event) => form.setData('client_id', event.target.value)}
                                className="w-full border px-3 py-2"
                            >
                                <option value="">Select client</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.name}
                                    </option>
                                ))}
                            </select>
                            {form.errors.client_id && (
                                <p className="text-sm text-red-600">{form.errors.client_id}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="address_id" className="block text-sm">
                                Address
                            </label>
                            <select
                                id="address_id"
                                name="address_id"
                                value={form.data.address_id}
                                onChange={(event) => form.setData('address_id', event.target.value)}
                                className="w-full border px-3 py-2"
                            >
                                <option value="">Select address</option>
                                {addresses.map((address) => (
                                    <option key={address.id} value={address.id}>
                                        {address.city}, {address.street}
                                    </option>
                                ))}
                            </select>
                            {form.errors.address_id && (
                                <p className="text-sm text-red-600">{form.errors.address_id}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="date" className="block text-sm">
                                Date
                            </label>
                            <input
                                id="date"
                                name="date"
                                type="date"
                                value={form.data.date}
                                onChange={(event) => form.setData('date', event.target.value)}
                                className="w-full border px-3 py-2"
                            />
                            {form.errors.date && (
                                <p className="text-sm text-red-600">{form.errors.date}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="time_from" className="block text-sm">
                                Time from
                            </label>
                            <input
                                id="time_from"
                                name="time_from"
                                type="time"
                                value={form.data.time_from}
                                onChange={(event) => form.setData('time_from', event.target.value)}
                                className="w-full border px-3 py-2"
                            />
                            {form.errors.time_from && (
                                <p className="text-sm text-red-600">{form.errors.time_from}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="time_to" className="block text-sm">
                                Time to
                            </label>
                            <input
                                id="time_to"
                                name="time_to"
                                type="time"
                                value={form.data.time_to}
                                onChange={(event) => form.setData('time_to', event.target.value)}
                                className="w-full border px-3 py-2"
                            />
                            {form.errors.time_to && (
                                <p className="text-sm text-red-600">{form.errors.time_to}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="status" className="block text-sm">
                                Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={form.data.status}
                                onChange={(event) => form.setData('status', event.target.value)}
                                className="w-full border px-3 py-2"
                            >
                                {statuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                            {form.errors.status && (
                                <p className="text-sm text-red-600">{form.errors.status}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="notes" className="block text-sm">
                                Notes
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={form.data.notes}
                                onChange={(event) => form.setData('notes', event.target.value)}
                                className="w-full border px-3 py-2"
                                rows={4}
                            />
                            {form.errors.notes && (
                                <p className="text-sm text-red-600">{form.errors.notes}</p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={form.processing}>
                                Save
                            </Button>
                            <Button asChild type="button" variant="outline">
                                <Link href="/dispatcher/orders">Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </ResourceShell>
        </AppLayout>
    );
}
