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
import type { AddressRecord, OrganizationOption } from '@/types/dispatcher';

type DispatcherAddressesEditProps = {
    addressId: string;
    address: Omit<AddressRecord, 'updated_at'>;
    organizations: OrganizationOption[];
    canSelectOrganization: boolean;
};

export default function DispatcherAddressesEdit({
    addressId,
    address,
    organizations,
    canSelectOrganization,
}: DispatcherAddressesEditProps) {
    const { t } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('dashboard.title'), href: '/dashboard' },
        { title: t('app.navigation.addresses'), href: '/dispatcher/addresses' },
        {
            title: t('dispatcher.addresses.edit_title'),
            href: `/dispatcher/addresses/${addressId}/edit`,
        },
    ];

    const form = useForm({
        organization_id: canSelectOrganization
            ? String(address.organization_id)
            : '',
        city: address.city,
        street: address.street,
        lat: address.lat !== null ? String(address.lat) : '',
        lng: address.lng !== null ? String(address.lng) : '',
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
        form.patch(`/dispatcher/addresses/${address.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('dispatcher.addresses.edit_title')} />

            <BackofficePage>
                <BackofficePageHeader
                    title={`${t('dispatcher.addresses.edit_title')} ${addressId}`}
                    description={t('dispatcher.addresses.edit_description')}
                    actions={
                        <BackofficeActionLink
                            href="/dispatcher/addresses"
                            variant="outline"
                        >
                            {t('dispatcher.addresses.back')}
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
                                    label={t('common.fields.city')}
                                    error={form.errors.city}
                                >
                                    <input
                                        id="city"
                                        name="city"
                                        type="text"
                                        value={form.data.city}
                                        onChange={(event) =>
                                            form.setData(
                                                'city',
                                                event.target.value,
                                            )
                                        }
                                        className={backofficeInputClassName}
                                    />
                                </BackofficeField>

                                <BackofficeField
                                    label={t('common.fields.street')}
                                    error={form.errors.street}
                                >
                                    <input
                                        id="street"
                                        name="street"
                                        type="text"
                                        value={form.data.street}
                                        onChange={(event) =>
                                            form.setData(
                                                'street',
                                                event.target.value,
                                            )
                                        }
                                        className={backofficeInputClassName}
                                    />
                                </BackofficeField>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <BackofficeField
                                    label={t('common.fields.latitude')}
                                    error={form.errors.lat}
                                >
                                    <input
                                        id="lat"
                                        name="lat"
                                        type="text"
                                        value={form.data.lat}
                                        onChange={(event) =>
                                            form.setData(
                                                'lat',
                                                event.target.value,
                                            )
                                        }
                                        className={backofficeInputClassName}
                                    />
                                </BackofficeField>

                                <BackofficeField
                                    label={t('common.fields.longitude')}
                                    error={form.errors.lng}
                                >
                                    <input
                                        id="lng"
                                        name="lng"
                                        type="text"
                                        value={form.data.lng}
                                        onChange={(event) =>
                                            form.setData(
                                                'lng',
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
                                    href="/dispatcher/addresses"
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
