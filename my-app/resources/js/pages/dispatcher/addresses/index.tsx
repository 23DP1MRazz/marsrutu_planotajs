import { Head } from '@inertiajs/react';
import { ResourceShell } from '@/components/dispatcher/resource-shell';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Addresses', href: '/dispatcher/addresses' },
];

export default function DispatcherAddressesIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Addresses" />
            <ResourceShell
                title="Addresses"
                description="Placeholder page for address management."
                actionHref="/dispatcher/addresses/create"
                actionLabel="Create address"
            />
        </AppLayout>
    );
}
