import { Head, Link } from '@inertiajs/react';
import { ResourceShell } from '@/components/dispatcher/resource-shell';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatShortDate } from '@/lib/date';
import type { DeliveryRouteRecord } from '@/types/dispatcher';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Routes', href: '/dispatcher/routes' },
];

type DispatcherRoutesIndexProps = {
    deliveryRoutes: DeliveryRouteRecord[];
};

export default function DispatcherRoutesIndex({
    deliveryRoutes,
}: DispatcherRoutesIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Routes" />
            <ResourceShell
                title="Routes"
                description="Manage daily courier routes."
                actionHref="/dispatcher/routes/create"
                actionLabel="Create route"
            >
                <div className="border p-4">
                    {deliveryRoutes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No routes created yet.
                        </p>
                    ) : (
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="p-2">Courier</th>
                                    <th className="p-2">Date</th>
                                    <th className="p-2">Status</th>
                                    <th className="p-2">Stops</th>
                                    <th className="p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliveryRoutes.map((deliveryRoute) => (
                                    <tr key={deliveryRoute.id} className="border-b">
                                        <td className="p-2">
                                            {deliveryRoute.courier_name ?? '-'}
                                        </td>
                                        <td className="p-2">
                                            {formatShortDate(deliveryRoute.date)}
                                        </td>
                                        <td className="p-2">{deliveryRoute.status}</td>
                                        <td className="p-2">{deliveryRoute.stops_count}</td>
                                        <td className="p-2">
                                            <Button asChild type="button" variant="outline">
                                                <Link href={`/dispatcher/routes/${deliveryRoute.id}`}>
                                                    Open
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </ResourceShell>
        </AppLayout>
    );
}
