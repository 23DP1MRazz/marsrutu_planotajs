import { Head, Link, router, useForm } from '@inertiajs/react';
import { ResourceShell } from '@/components/dispatcher/resource-shell';
import { useLiveFiltering } from '@/hooks/use-live-filtering';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { AddressFilters, AddressRecord } from '@/types/dispatcher';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Addresses', href: '/dispatcher/addresses' },
];

type DispatcherAddressesIndexProps = {
    addresses: AddressRecord[];
    filters: AddressFilters;
};

export default function DispatcherAddressesIndex({
    addresses,
    filters,
}: DispatcherAddressesIndexProps) {
    const filterForm = useForm({
        search: filters.search ?? '',
        sort: filters.sort ?? 'city_asc',
    });

    useLiveFiltering({
        data: filterForm.data,
        url: '/dispatcher/addresses',
    });

    const deleteAddress = (addressId: number) => {
        router.delete(`/dispatcher/addresses/${addressId}`);
    };

    const clearFilters = () => {
        filterForm.setData({
            search: '',
            sort: 'city_asc',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Addresses" />
            <ResourceShell
                title="Addresses"
                description="Manage delivery addresses for your organization."
                actionHref="/dispatcher/addresses/create"
                actionLabel="Create address"
            >
                <div className="border p-4">
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <label htmlFor="search" className="block text-sm">
                                    Search by city or street
                                </label>
                                <input
                                    id="search"
                                    name="search"
                                    type="text"
                                    value={filterForm.data.search}
                                    onChange={(event) => filterForm.setData('search', event.target.value)}
                                    className="w-full border px-3 py-2"
                                />
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="sort" className="block text-sm">
                                    Sort by
                                </label>
                                <select
                                    id="sort"
                                    name="sort"
                                    value={filterForm.data.sort}
                                    onChange={(event) => filterForm.setData('sort', event.target.value)}
                                    className="w-full border px-3 py-2"
                                >
                                    <option value="city_asc">City (A-Z)</option>
                                    <option value="city_desc">City (Z-A)</option>
                                    <option value="street_asc">Street (A-Z)</option>
                                    <option value="street_desc">Street (Z-A)</option>
                                    <option value="updated_desc">Updated (newest)</option>
                                    <option value="updated_asc">Updated (oldest)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={clearFilters}>
                                Clear
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="border p-4">
                    {addresses.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No addresses created yet.
                        </p>
                    ) : (
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="p-2">City</th>
                                    <th className="p-2">Street</th>
                                    <th className="p-2">Coordinates</th>
                                    <th className="p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {addresses.map((address) => (
                                    <tr key={address.id} className="border-b">
                                        <td className="p-2">
                                            <Link
                                                href={`/dispatcher/addresses/${address.id}/edit`}
                                                className="block underline-offset-4 hover:underline"
                                            >
                                                {address.city}
                                            </Link>
                                        </td>
                                        <td className="p-2">{address.street}</td>
                                        <td className="p-2">
                                            {address.lat ?? '-'}, {address.lng ?? '-'}
                                        </td>
                                        <td className="p-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => deleteAddress(address.id)}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </ResourceShell>
        </AppLayout>
    );
}
