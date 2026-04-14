import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatShortDate } from '@/lib/date';
import type { CourierRouteRecord, CourierRouteStopRecord } from '@/types/courier';
import type { BreadcrumbItem } from '@/types';

type CourierRoutePageProps = {
    deliveryRoute: CourierRouteRecord | null;
    stops: CourierRouteStopRecord[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Today route', href: '/courier/today-route' },
];

export default function CourierRoutePage({
    deliveryRoute,
    stops,
}: CourierRoutePageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Today route" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex items-start justify-between border p-4">
                    <div>
                        <h1 className="text-lg font-semibold">Today route</h1>
                        <p className="text-sm text-muted-foreground">
                            View your assigned stops and update delivery progress.
                        </p>
                    </div>
                </div>

                {deliveryRoute === null ? (
                    <div className="border p-4">
                        <p className="text-sm text-muted-foreground">
                            No route is assigned to you for today.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="border p-4 text-sm">
                            <p>
                                <span className="font-medium">Date:</span>{' '}
                                {formatShortDate(deliveryRoute.date)}
                            </p>
                            <p>
                                <span className="font-medium">Status:</span>{' '}
                                {deliveryRoute.status}
                            </p>
                            <p>
                                <span className="font-medium">Stops:</span> {stops.length}
                            </p>
                        </div>

                        <div className="space-y-3">
                            {stops.map((stop) => (
                                <div key={stop.id} className="border p-4">
                                    <div className="space-y-1 text-sm">
                                        <p className="font-medium">
                                            Stop {stop.seq_no} — Order #{stop.order_id}
                                        </p>
                                        <p>{stop.client_name ?? '-'}</p>
                                        <p>{stop.address_label || '-'}</p>
                                        <p>Status: {stop.status}</p>
                                        {stop.fail_reason && (
                                            <p>Fail reason: {stop.fail_reason}</p>
                                        )}
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Button type="button" variant="outline" disabled>
                                            Arrived
                                        </Button>
                                        <Button type="button" variant="outline" disabled>
                                            Completed
                                        </Button>
                                        <Button type="button" variant="outline" disabled>
                                            Failed
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
