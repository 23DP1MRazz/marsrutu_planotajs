import type { FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
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
    OrganizationOption,
} from '@/types/dispatcher';
import type { BreadcrumbItem } from '@/types';

type DispatcherOrdersCreateProps = {
    organizations: OrganizationOption[];
    clients: ClientOption[];
    addresses: AddressOption[];
    canSelectOrganization: boolean;
};

export default function DispatcherOrdersCreate({
    organizations,
    clients,
    addresses,
    canSelectOrganization,
}: DispatcherOrdersCreateProps) {
    const { t } = useTranslation();
    const form = useForm({
        organization_id:
            canSelectOrganization && organizations[0]?.id
                ? String(organizations[0].id)
                : '',
        client_id: clients[0]?.id ? String(clients[0].id) : '',
        address_id: addresses[0]?.id ? String(addresses[0].id) : '',
        date: '',
        time_from: '',
        time_to: '',
        notes: '',
    });
    const selectedOrganizationId = Number(form.data.organization_id || 0);
    const visibleClients =
        canSelectOrganization && selectedOrganizationId > 0
            ? clients.filter(
                  (client) => client.organization_id === selectedOrganizationId,
              )
            : clients;
    const visibleAddresses =
        canSelectOrganization && selectedOrganizationId > 0
            ? addresses.filter(
                  (address) =>
                      address.organization_id === selectedOrganizationId,
              )
            : addresses;

    useEffect(() => {
        if (
            !visibleClients.some(
                (client) => String(client.id) === form.data.client_id,
            )
        ) {
            form.setData('client_id', visibleClients[0]?.id?.toString() ?? '');
        }

        if (
            !visibleAddresses.some(
                (address) => String(address.id) === form.data.address_id,
            )
        ) {
            form.setData(
                'address_id',
                visibleAddresses[0]?.id?.toString() ?? '',
            );
        }
    }, [
        form,
        form.data.address_id,
        form.data.client_id,
        visibleAddresses,
        visibleClients,
    ]);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.transform((data) => {
            if (!canSelectOrganization) {
                const { organization_id: _organizationId, ...rest } = data;
                return rest;
            }

            return data;
        });
        form.post('/dispatcher/orders');
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('dashboard.title'), href: '/dashboard' },
        { title: t('app.navigation.orders'), href: '/dispatcher/orders' },
        {
            title: t('dispatcher.orders.create_title'),
            href: '/dispatcher/orders/create',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('dispatcher.orders.create_title')} />

            <BackofficePage>
                <BackofficePageHeader
                    title={t('dispatcher.orders.create_title')}
                    description={t('dispatcher.orders.create_description')}
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
                                        {visibleClients.map((client) => (
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
                                        {visibleAddresses.map((address) => (
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
