import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
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
} from '@/components/backoffice/ui';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { ClientRecord, OrganizationOption } from '@/types/dispatcher';

type DispatcherClientsEditProps = {
    clientId: string;
    client: Omit<ClientRecord, 'updated_at'>;
    organizations: OrganizationOption[];
    canSelectOrganization: boolean;
};

export default function DispatcherClientsEdit({
    clientId,
    client,
    organizations,
    canSelectOrganization,
}: DispatcherClientsEditProps) {
    const { t } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('dashboard.title'), href: '/dashboard' },
        { title: t('app.navigation.clients'), href: '/dispatcher/clients' },
        {
            title: t('dispatcher.clients.edit_title'),
            href: `/dispatcher/clients/${clientId}/edit`,
        },
    ];

    const form = useForm({
        organization_id: canSelectOrganization
            ? String(client.organization_id)
            : '',
        name: client.name,
        phone: client.phone,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.transform((data) => {
            if (!canSelectOrganization) {
                return Object.fromEntries(
                    Object.entries(data).filter(
                        ([key]) => key !== 'organization_id',
                    ),
                );
            }

            return data;
        });
        form.patch(`/dispatcher/clients/${client.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('dispatcher.clients.edit_title')} />

            <BackofficePage>
                <BackofficePageHeader
                    title={`${t('dispatcher.clients.edit_title')} ${clientId}`}
                    description={t('dispatcher.clients.edit_description')}
                    actions={
                        <BackofficeActionLink
                            href="/dispatcher/clients"
                            variant="outline"
                        >
                            {t('dispatcher.clients.back')}
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
                                    label={t('common.fields.name')}
                                    error={form.errors.name}
                                >
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={form.data.name}
                                        onChange={(event) =>
                                            form.setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        className={backofficeInputClassName}
                                    />
                                </BackofficeField>

                                <BackofficeField
                                    label={t('common.fields.phone')}
                                    error={form.errors.phone}
                                >
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={8}
                                        pattern="2[0-9]{7}"
                                        value={form.data.phone}
                                        onChange={(event) =>
                                            form.setData(
                                                'phone',
                                                event.target.value,
                                            )
                                        }
                                        className={backofficeInputClassName}
                                    />
                                </BackofficeField>
                            </div>

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
                                    href="/dispatcher/clients"
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
