import { Head } from '@inertiajs/react';
import { ResourceShell } from '@/components/dispatcher/resource-shell';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Addresses', href: '/dispatcher/addresses' },
    { title: 'Create', href: '/dispatcher/addresses/create' },
];

export default function DispatcherAddressesCreate() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Address" />
            <ResourceShell
                title="Create address"
                description="Input fields are visible but not connected to CRUD yet."
                actionHref="/dispatcher/addresses"
                actionLabel="Back to addresses"
                fields={[
                    { label: 'City', name: 'city', placeholder: 'City' },
                    { label: 'Street', name: 'street', placeholder: 'Street' },
                    { label: 'Latitude', name: 'lat', placeholder: 'Latitude' },
                    { label: 'Longitude', name: 'lng', placeholder: 'Longitude' },
                ]}
            />
        </AppLayout>
    );
}
