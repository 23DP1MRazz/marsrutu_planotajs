import { Head, Link, router } from '@inertiajs/react';
import { ResourceShell } from '@/components/dispatcher/resource-shell';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { AddressRecord } from '@/types/dispatcher';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Addresses', href: '/dispatcher/addresses' },
];

type DispatcherAddressesIndexProps = {
    addresses: AddressRecord[];
};

export default function DispatcherAddressesIndex({
    addresses,
}: DispatcherAddressesIndexProps) {
    const deleteAddress = (addressId: number) => {
        router.delete(`/dispatcher/addresses/${addressId}`);
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
                                        <td className="p-2">{address.city}</td>
                                        <td className="p-2">{address.street}</td>
                                        <td className="p-2">
                                            {address.lat ?? '-'}, {address.lng ?? '-'}
                                        </td>
                                        <td className="p-2">
                                            <div className="flex gap-2">
                                                <Button asChild type="button" variant="outline">
                                                    <Link href={`/dispatcher/addresses/${address.id}/edit`}>
                                                        Edit
                                                    </Link>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => deleteAddress(address.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
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
