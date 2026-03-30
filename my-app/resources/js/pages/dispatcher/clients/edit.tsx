import { Head } from '@inertiajs/react';
import { ResourceShell } from '@/components/dispatcher/resource-shell';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type DispatcherClientsEditProps = {
    clientId: string;
};

export default function DispatcherClientsEdit({
    clientId,
}: DispatcherClientsEditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Clients', href: '/dispatcher/clients' },
        { title: `Edit ${clientId}`, href: `/dispatcher/clients/${clientId}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Client" />
            <ResourceShell
                title={`Edit client ${clientId}`}
                description="Edit fields are visible but not connected to CRUD yet."
                actionHref="/dispatcher/clients"
                actionLabel="Back to clients"
            />
        </AppLayout>
    );
}
