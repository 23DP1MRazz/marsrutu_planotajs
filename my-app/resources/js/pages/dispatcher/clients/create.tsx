import { Head } from '@inertiajs/react';
import { ResourceShell } from '@/components/dispatcher/resource-shell';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Clients', href: '/dispatcher/clients' },
    { title: 'Create', href: '/dispatcher/clients/create' },
];

export default function DispatcherClientsCreate() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Client" />
            <ResourceShell
                title="Create client"
                description="Input fields are visible but not connected to CRUD yet."
                actionHref="/dispatcher/clients"
                actionLabel="Back to clients"
                fields={[
                    { label: 'Name', name: 'name', placeholder: 'Client name' },
                    { label: 'Phone', name: 'phone', placeholder: 'Phone number' },
                ]}
            />
        </AppLayout>
    );
}
