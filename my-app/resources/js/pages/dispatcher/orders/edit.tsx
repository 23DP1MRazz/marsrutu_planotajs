import { Head } from '@inertiajs/react';
import { ResourceShell } from '@/components/dispatcher/resource-shell';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type DispatcherOrdersEditProps = {
    orderId: string;
};

export default function DispatcherOrdersEdit({
    orderId,
}: DispatcherOrdersEditProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Orders', href: '/dispatcher/orders' },
        { title: `Edit ${orderId}`, href: `/dispatcher/orders/${orderId}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Order" />
            <ResourceShell
                title={`Edit order ${orderId}`}
                description="Order edit form will be connected in the next commit."
                actionHref="/dispatcher/orders"
                actionLabel="Back to orders"
            />
        </AppLayout>
    );
}
