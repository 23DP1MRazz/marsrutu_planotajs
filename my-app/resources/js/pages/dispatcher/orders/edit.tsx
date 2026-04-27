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
import { useTranslation } from '@/hooks/use-translation';
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
    'updated_at' | 'client_name' | 'address_label' | 'can_cancel' | 'can_delete'
>;

type DispatcherOrdersEditProps = {
    orderId: string;
    order: EditableOrder;
    organizations: OrganizationOption[];
    clients: ClientOption[];
    addresses: AddressOption[];
    canSelectOrganization: boolean;
};

export default function DispatcherOrdersEdit({
    orderId,
    order,
    organizations,
    clients,
    addresses,
    canSelectOrganization,
}: DispatcherOrdersEditProps) {
    const { t } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('dashboard.title'), href: '/dashboard' },
        { title: t('app.navigation.orders'), href: '/dispatcher/orders' },
        {
            title: t('dispatcher.orders.edit_title'),
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
            <Head title={t('dispatcher.orders.edit_title')} />

            <BackofficePage>
                <BackofficePageHeader
                    title={`${t('dispatcher.orders.edit_title')} ${orderId}`}
                    description={t('dispatcher.orders.edit_description')}
                    actions={
                        <BackofficeActionLink
                            href="/dispatcher/orders"
                            variant="outline"
                        >
                            {t('dispatcher.orders.back')}
                        </BackofficeActionLink>
                    }
                />

                <BackofficeCard>
                    <BackofficeCardBody>
                        <form className="space-y-5" onSubmit={submit}>
                            {canSelectOrganization &&
                            organizations.length > 0 ? (
                                <BackofficeField
                                    label={t('common.fields.organization')}
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
                                    label={t('common.fields.client')}
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
                                        <option value="">
                                            {t(
                                                'dispatcher.orders.select_client',
                                            )}
                                        </option>
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
                                    label={t('common.fields.address')}
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
                                        <option value="">
                                            {t(
                                                'dispatcher.orders.select_address',
                                            )}
                                        </option>
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

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <BackofficeField
                                    label={t('common.fields.date')}
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
                                    label={t('common.fields.time_from')}
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
                                    label={t('common.fields.time_to')}
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
                            </div>

                            <BackofficeField
                                label={t('common.fields.notes')}
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
                                    {t('common.actions.save')}
                                </button>
                                <BackofficeActionLink
                                    href="/dispatcher/orders"
                                    variant="outline"
                                >
                                    {t('common.actions.cancel')}
                                </BackofficeActionLink>
                            </div>
                        </form>
                    </BackofficeCardBody>
                </BackofficeCard>
            </BackofficePage>
        </AppLayout>
    );
}
