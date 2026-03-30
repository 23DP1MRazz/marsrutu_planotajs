import { Head } from '@inertiajs/react';
import { ResourceShell } from '@/components/dispatcher/resource-shell';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Clients', href: '/dispatcher/clients' },
];

export default function DispatcherClientsIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clients" />
            <ResourceShell
                title="Clients"
                description="Placeholder page for client management."
                actionHref="/dispatcher/clients/create"
                actionLabel="Create client"
            />
        </AppLayout>
    );
}
