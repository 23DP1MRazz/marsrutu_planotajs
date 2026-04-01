import type { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ResourceShell } from '@/components/dispatcher/resource-shell';
import { Button } from '@/components/ui/button';
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
        organization_id: canSelectOrganization && organizations[0]?.id
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
            <ResourceShell
                title="Create client"
                description="Add a new client record."
                actionHref="/dispatcher/clients"
                actionLabel="Back to clients"
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
                            <label htmlFor="name" className="block text-sm">
                                Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                className="w-full border px-3 py-2"
                            />
                            {form.errors.name && (
                                <p className="text-sm text-red-600">{form.errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="phone" className="block text-sm">
                                Phone
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="text"
                                value={form.data.phone}
                                onChange={(event) => form.setData('phone', event.target.value)}
                                className="w-full border px-3 py-2"
                            />
                            {form.errors.phone && (
                                <p className="text-sm text-red-600">{form.errors.phone}</p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={form.processing}>
                                Save
                            </Button>
                            <Button asChild type="button" variant="outline">
                                <Link href="/dispatcher/clients">Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </ResourceShell>
        </AppLayout>
    );
}
