import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { formatShortDate } from '@/lib/date';
import type { CourierCompletedOrderRecord } from '@/types/courier';
import type { BreadcrumbItem } from '@/types';

type CourierCompletedOrdersPageProps = {
    orders: CourierCompletedOrderRecord[];
};

export default function CourierCompletedOrdersPage({
    orders,
}: CourierCompletedOrdersPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Completed orders', href: '/courier/orders/completed' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Completed orders" />

            <div className="flex flex-1 flex-col gap-4 p-3 sm:gap-6 sm:p-4">
                <div className="rounded-3xl border border-border/80 bg-card/90 p-4 shadow-sm sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                Completed orders
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Review delivered orders and open proof files when needed.
                            </p>
                        </div>
                        <Link
                            href="/dashboard"
                            className="rounded-2xl border border-border/80 px-4 py-2 text-sm"
                        >
                            Back to dashboard
                        </Link>
                    </div>
                </div>

                <div className="rounded-3xl border border-border/80 bg-card/90 p-4 shadow-sm sm:p-5">
                    {orders.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            You have no completed orders yet.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {orders.map((order) => (
                                <div
                                    key={order.route_stop_id}
                                    className="rounded-2xl border border-border/80 p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium">
                                                {order.client_name ?? `Order #${order.order_id}`}
                                            </p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {order.address_label || '-'}
                                            </p>
                                        </div>
                                        <span className="rounded-full border border-border/80 px-3 py-1 text-xs font-medium">
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                                        <p>Route date: {order.route_date ? formatShortDate(order.route_date) : '-'}</p>
                                        <p>
                                            Completed:{' '}
                                            {order.completed_at ? formatShortDate(order.completed_at) : '-'}
                                        </p>
                                    </div>

                                    {order.proof_view_url && (
                                        <div className="mt-3">
                                            <a
                                                href={order.proof_view_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-sm underline underline-offset-4"
                                            >
                                                Open proof file
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
