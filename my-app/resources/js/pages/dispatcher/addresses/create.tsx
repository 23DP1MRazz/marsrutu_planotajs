import type { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ResourceShell } from '@/components/dispatcher/resource-shell';
import { Button } from '@/components/ui/button';
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
        organization_id: canSelectOrganization && organizations[0]?.id
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
            <ResourceShell
                title="Create address"
                description="Add a new delivery address."
                actionHref="/dispatcher/addresses"
                actionLabel="Back to addresses"
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
                            <label htmlFor="city" className="block text-sm">
                                City
                            </label>
                            <input
                                id="city"
                                name="city"
                                type="text"
                                value={form.data.city}
                                onChange={(event) => form.setData('city', event.target.value)}
                                className="w-full border px-3 py-2"
                            />
                            {form.errors.city && (
                                <p className="text-sm text-red-600">{form.errors.city}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="street" className="block text-sm">
                                Street
                            </label>
                            <input
                                id="street"
                                name="street"
                                type="text"
                                value={form.data.street}
                                onChange={(event) => form.setData('street', event.target.value)}
                                className="w-full border px-3 py-2"
                            />
                            {form.errors.street && (
                                <p className="text-sm text-red-600">{form.errors.street}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="lat" className="block text-sm">
                                Latitude
                            </label>
                            <input
                                id="lat"
                                name="lat"
                                type="text"
                                value={form.data.lat}
                                onChange={(event) => form.setData('lat', event.target.value)}
                                className="w-full border px-3 py-2"
                            />
                            {form.errors.lat && (
                                <p className="text-sm text-red-600">{form.errors.lat}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="lng" className="block text-sm">
                                Longitude
                            </label>
                            <input
                                id="lng"
                                name="lng"
                                type="text"
                                value={form.data.lng}
                                onChange={(event) => form.setData('lng', event.target.value)}
                                className="w-full border px-3 py-2"
                            />
                            {form.errors.lng && (
                                <p className="text-sm text-red-600">{form.errors.lng}</p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={form.processing}>
                                Save
                            </Button>
                            <Button asChild type="button" variant="outline">
                                <Link href="/dispatcher/addresses">Cancel</Link>
                            </Button>
                        </div>
                    </form>
                </div>
            </ResourceShell>
        </AppLayout>
    );
}
