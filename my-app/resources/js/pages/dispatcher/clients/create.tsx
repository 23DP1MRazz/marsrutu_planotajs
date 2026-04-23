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
    { title: 'Clients', href: '/dispatcher/clients' },
    { title: 'Create', href: '/dispatcher/clients/create' },
];

type DispatcherClientsCreateProps = {
    organizations: OrganizationOption[];
    canSelectOrganization: boolean;
};

export default function DispatcherClientsCreate({
    organizations,
    canSelectOrganization,
}: DispatcherClientsCreateProps) {
    const form = useForm({
        organization_id:
            canSelectOrganization && organizations[0]?.id
                ? String(organizations[0].id)
                : '',
        name: '',
        phone: '',
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
        form.post('/dispatcher/clients');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Client" />

            <BackofficePage>
                <BackofficePageHeader
                    title="Create Client"
                    description="Add a new client record."
                    actions={
                        <BackofficeActionLink
                            href="/dispatcher/clients"
                            variant="outline"
                        >
                            Back to clients
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
                                    label="Name"
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
                                    label="Phone"
                                    error={form.errors.phone}
                                >
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="text"
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
                                    Save
                                </button>
                                <BackofficeActionLink
                                    href="/dispatcher/clients"
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
