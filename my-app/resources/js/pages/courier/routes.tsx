import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { formatShortDate } from '@/lib/date';
import type { CourierRouteListRecord } from '@/types/courier';
import type { BreadcrumbItem } from '@/types';

type CourierRoutesPageProps = {
    title: string;
    description: string;
    emptyMessage: string;
    routes: CourierRouteListRecord[];
};

export default function CourierRoutesPage({
    title,
    description,
    emptyMessage,
    routes,
}: CourierRoutesPageProps) {
    const currentPath = title === 'Done routes'
        ? '/courier/routes/completed'
        : '/courier/routes/upcoming';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title, href: currentPath },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="flex flex-1 flex-col gap-4 p-3 sm:gap-6 sm:p-4">
                <div className="rounded-3xl border border-border/80 bg-card/90 p-4 shadow-sm sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                {title}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {description}
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
                    {routes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                    ) : (
                        <div className="space-y-3">
                            {routes.map((deliveryRoute) => (
                                <div
                                    key={deliveryRoute.id}
                                    className="rounded-2xl border border-border/80 p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium">
                                                {formatShortDate(deliveryRoute.date)}
                                            </p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {deliveryRoute.stops_count} planned stops
                                            </p>
                                        </div>
                                        <span className="rounded-full border border-border/80 px-3 py-1 text-xs font-medium">
                                            {deliveryRoute.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
