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
} from '@/components/backoffice/ui';
import AppLayout from '@/layouts/app-layout';
import type { OrganizationOption } from '@/types/dispatcher';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Addresses', href: '/dispatcher/addresses' },
    { title: 'Create', href: '/dispatcher/addresses/create' },
];

type DispatcherAddressesCreateProps = {
    organizations: OrganizationOption[];
    canSelectOrganization: boolean;
};

export default function DispatcherAddressesCreate({
    organizations,
    canSelectOrganization,
}: DispatcherAddressesCreateProps) {
    const form = useForm({
        organization_id:
            canSelectOrganization && organizations[0]?.id
                ? String(organizations[0].id)
                : '',
        city: '',
        street: '',
        lat: '',
        lng: '',
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
        form.post('/dispatcher/addresses');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Address" />

            <BackofficePage>
                <BackofficePageHeader
                    title="Create Address"
                    description="Add a new delivery address."
                    actions={
                        <BackofficeActionLink
                            href="/dispatcher/addresses"
                            variant="outline"
                        >
                            Back to addresses
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
                                    label="City"
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
                                    label="Street"
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
                                    label="Latitude"
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
                                    label="Longitude"
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
                                    Save
                                </button>
                                <BackofficeActionLink
                                    href="/dispatcher/addresses"
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
