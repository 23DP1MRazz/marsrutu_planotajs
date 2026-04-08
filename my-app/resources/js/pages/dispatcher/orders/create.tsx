import { Head } from '@inertiajs/react';
import { ResourceShell } from '@/components/dispatcher/resource-shell';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Orders', href: '/dispatcher/orders' },
    { title: 'Create', href: '/dispatcher/orders/create' },
];

export default function DispatcherOrdersCreate() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Order" />
            <ResourceShell
                title="Create order"
                description="Order create form will be connected in the next commit."
                actionHref="/dispatcher/orders"
                actionLabel="Back to orders"
            />
        </AppLayout>
    );
}
