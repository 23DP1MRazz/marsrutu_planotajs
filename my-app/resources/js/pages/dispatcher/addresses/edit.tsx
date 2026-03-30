import { Head } from '@inertiajs/react';
import { ResourceShell } from '@/components/dispatcher/resource-shell';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type DispatcherAddressesEditProps = {
    addressId: string;
};

export default function DispatcherAddressesEdit({
    addressId,
}: DispatcherAddressesEditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Addresses', href: '/dispatcher/addresses' },
        { title: `Edit ${addressId}`, href: `/dispatcher/addresses/${addressId}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Address" />
            <ResourceShell
                title={`Edit address ${addressId}`}
                description="Edit fields are visible but not connected to CRUD yet."
                actionHref="/dispatcher/addresses"
                actionLabel="Back to addresses"
            />
        </AppLayout>
    );
}
