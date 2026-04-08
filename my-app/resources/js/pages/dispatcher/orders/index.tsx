import { Head } from '@inertiajs/react';
import { ResourceShell } from '@/components/dispatcher/resource-shell';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Orders', href: '/dispatcher/orders' },
];

export default function DispatcherOrdersIndex() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />
            <ResourceShell
                title="Orders"
                description="Order backend is ready. UI wiring comes next."
                actionHref="/dispatcher/orders/create"
                actionLabel="Create order"
            />
        </AppLayout>
    );
}
