import type { FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    BackofficeActionLink,
    BackofficeCard,
    BackofficeCardBody,
    BackofficeField,
    BackofficePage,
    BackofficePageHeader,
    backofficeButtonClassName,
    backofficeInputClassName,
    backofficeSelectClassName,
    backofficeTextareaClassName,
} from '@/components/backoffice/ui';
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
        {
            title: `Edit ${orderId}`,
            href: `/dispatcher/orders/${orderId}/edit`,
        },
    ];

    const form = useForm({
        organization_id: canSelectOrganization
            ? String(order.organization_id)
            : '',
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

            <BackofficePage>
                <BackofficePageHeader
                    title={`Edit Order ${orderId}`}
                    description="Update the selected order."
                    actions={
                        <BackofficeActionLink
                            href="/dispatcher/orders"
                            variant="outline"
                        >
                            Back to orders
                        </BackofficeActionLink>
                    }
                />

                <BackofficeCard>
                    <BackofficeCardBody>
                        <form className="space-y-5" onSubmit={submit}>
                            {canSelectOrganization &&
                            organizations.length > 0 ? (
                                <BackofficeField
                                    label="Organization"
                                    error={form.errors.organization_id}
                                >
                                    <select
                                        id="organization_id"
                                        name="organization_id"
                                        value={form.data.organization_id}
                                        onChange={(event) =>
                                            form.setData(
                                                'organization_id',
                                                event.target.value,
                                            )
                                        }
                                        className={backofficeSelectClassName}
                                    >
                                        {organizations.map((organization) => (
                                            <option
                                                key={organization.id}
                                                value={organization.id}
                                            >
                                                {organization.name}
                                            </option>
                                        ))}
                                    </select>
                                </BackofficeField>
                            ) : null}

                            <div className="grid gap-4 md:grid-cols-2">
                                <BackofficeField
                                    label="Client"
                                    error={form.errors.client_id}
                                >
                                    <select
                                        id="client_id"
                                        name="client_id"
                                        value={form.data.client_id}
                                        onChange={(event) =>
                                            form.setData(
                                                'client_id',
                                                event.target.value,
                                            )
                                        }
                                        className={backofficeSelectClassName}
                                    >
                                        <option value="">Select client</option>
                                        {clients.map((client) => (
                                            <option
                                                key={client.id}
                                                value={client.id}
                                            >
                                                {client.name}
                                            </option>
                                        ))}
                                    </select>
                                </BackofficeField>

                                <BackofficeField
                                    label="Address"
                                    error={form.errors.address_id}
                                >
                                    <select
                                        id="address_id"
                                        name="address_id"
                                        value={form.data.address_id}
                                        onChange={(event) =>
                                            form.setData(
                                                'address_id',
                                                event.target.value,
                                            )
                                        }
                                        className={backofficeSelectClassName}
                                    >
                                        <option value="">Select address</option>
                                        {addresses.map((address) => (
                                            <option
                                                key={address.id}
                                                value={address.id}
                                            >
                                                {address.city}, {address.street}
                                            </option>
                                        ))}
                                    </select>
                                </BackofficeField>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <BackofficeField
                                    label="Date"
                                    error={form.errors.date}
                                >
                                    <input
                                        id="date"
                                        name="date"
                                        type="date"
                                        value={form.data.date}
                                        onChange={(event) =>
                                            form.setData(
                                                'date',
                                                event.target.value,
                                            )
                                        }
                                        className={backofficeInputClassName}
                                    />
                                </BackofficeField>

                                <BackofficeField
                                    label="Time from"
                                    error={form.errors.time_from}
                                >
                                    <input
                                        id="time_from"
                                        name="time_from"
                                        type="time"
                                        value={form.data.time_from}
                                        onChange={(event) =>
                                            form.setData(
                                                'time_from',
                                                event.target.value,
                                            )
                                        }
                                        className={backofficeInputClassName}
                                    />
                                </BackofficeField>

                                <BackofficeField
                                    label="Time to"
                                    error={form.errors.time_to}
                                >
                                    <input
                                        id="time_to"
                                        name="time_to"
                                        type="time"
                                        value={form.data.time_to}
                                        onChange={(event) =>
                                            form.setData(
                                                'time_to',
                                                event.target.value,
                                            )
                                        }
                                        className={backofficeInputClassName}
                                    />
                                </BackofficeField>

                                <BackofficeField
                                    label="Status"
                                    error={form.errors.status}
                                >
                                    <select
                                        id="status"
                                        name="status"
                                        value={form.data.status}
                                        onChange={(event) =>
                                            form.setData(
                                                'status',
                                                event.target.value,
                                            )
                                        }
                                        className={backofficeSelectClassName}
                                    >
                                        {statuses.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </BackofficeField>
                            </div>

                            <BackofficeField
                                label="Notes"
                                error={form.errors.notes}
                            >
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={form.data.notes}
                                    onChange={(event) =>
                                        form.setData(
                                            'notes',
                                            event.target.value,
                                        )
                                    }
                                    className={backofficeTextareaClassName}
                                    rows={4}
                                />
                            </BackofficeField>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className={backofficeButtonClassName(
                                        'primary',
                                    )}
                                >
                                    Save
                                </button>
                                <BackofficeActionLink
                                    href="/dispatcher/orders"
                                    variant="outline"
                                >
                                    Cancel
                                </BackofficeActionLink>
                            </div>
                        </form>
                    </BackofficeCardBody>
                </BackofficeCard>
            </BackofficePage>
        </AppLayout>
    );
}
