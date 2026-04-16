import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, MapPinned, Navigation, Upload, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    LeafletMap,
    type LeafletMapMarker,
} from '@/components/dispatcher/leaflet-map';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatShortDate } from '@/lib/date';
import type { CourierRouteRecord, CourierRouteStopRecord } from '@/types/courier';
import type { BreadcrumbItem } from '@/types';

type CourierRoutePageProps = {
    deliveryRoute: CourierRouteRecord | null;
    stops: CourierRouteStopRecord[];
    dashboardMode?: boolean;
};

export default function CourierRoutePage({
    deliveryRoute,
    stops,
    dashboardMode = false,
}: CourierRoutePageProps) {
    const [failedStopId, setFailedStopId] = useState<number | null>(null);
    const [failReasons, setFailReasons] = useState<Record<number, string>>({});
    const [selectedProofFiles, setSelectedProofFiles] = useState<Record<number, File | null>>({});
    const statusForm = useForm({
        status: '',
        fail_reason: '',
    });
    const proofForm = useForm({
        file: null as File | null,
    });

    const routeMarkers = useMemo<LeafletMapMarker[]>(
        () =>
            stops
                .filter((stop) => stop.lat !== null && stop.lng !== null)
                .map((stop) => ({
                    id: stop.id,
                    lat: stop.lat ?? 0,
                    lng: stop.lng ?? 0,
                    label: `Stop ${stop.seq_no}`,
                    description: [stop.client_name ?? `Order #${stop.order_id}`, stop.address_label]
                        .filter(Boolean)
                        .join(' — '),
                })),
        [stops],
    );

    const updateStopStatus = (
        stopId: number,
        status: 'ARRIVED' | 'COMPLETED' | 'FAILED',
        failReason = '',
    ) => {
        statusForm.transform(() => ({
            status,
            fail_reason: failReason,
        }));

        statusForm.patch(`/courier/stops/${stopId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setFailedStopId(null);
                setFailReasons((currentReasons) => ({
                    ...currentReasons,
                    [stopId]: '',
                }));
                statusForm.reset();
            },
        });
    };

    const uploadProof = (stopId: number) => {
        const selectedFile = selectedProofFiles[stopId];

        if (!selectedFile) {
            return;
        }

        proofForm.transform(() => ({
            file: selectedFile,
        }));

        proofForm.post(`/courier/stops/${stopId}/proof`, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setSelectedProofFiles((currentFiles) => ({
                    ...currentFiles,
                    [stopId]: null,
                }));
                proofForm.reset();
            },
        });
    };

    const breadcrumbs: BreadcrumbItem[] = dashboardMode
        ? [{ title: 'Dashboard', href: '/dashboard' }]
        : [
              { title: 'Dashboard', href: '/dashboard' },
              { title: 'Today route', href: '/courier/today-route' },
          ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={dashboardMode ? 'Dashboard' : 'Today route'} />

            <div className="flex flex-1 flex-col gap-4 p-3 sm:gap-6 sm:p-4">
                <div className="rounded-3xl border border-border/80 bg-card/90 p-4 shadow-sm sm:p-6">
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        {dashboardMode ? 'Courier dashboard' : 'Today route'}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Open directions fast, update delivery progress, and capture proof from
                        your phone.
                    </p>
                </div>

                {deliveryRoute === null ? (
                    <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 p-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            No route is assigned to you for today.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <SummaryCard
                                label="Date"
                                value={formatShortDate(deliveryRoute.date)}
                            />
                            <SummaryCard
                                label="Route status"
                                value={deliveryRoute.status}
                            />
                            <SummaryCard
                                label="Total stops"
                                value={String(stops.length)}
                            />
                        </div>

                        <LeafletMap
                            markers={routeMarkers}
                            heightClassName="h-64 sm:h-80"
                            emptyMessage="No saved coordinates for today’s stops yet."
                        />

                        <div className="space-y-4">
                            {stops.map((stop) => (
                                <section
                                    key={stop.id}
                                    className="rounded-3xl border border-border/80 bg-card/90 p-4 shadow-sm sm:p-5"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                                    Stop {stop.seq_no}
                                                </p>
                                                <p className="mt-1 text-base font-semibold">
                                                    {stop.client_name ?? `Order #${stop.order_id}`}
                                                </p>
                                            </div>
                                            <span className="rounded-full border border-border/80 px-3 py-1 text-xs font-medium">
                                                {stop.status}
                                            </span>
                                        </div>

                                        <p className="text-sm text-muted-foreground">
                                            {stop.address_label || '-'}
                                        </p>

                                        {stop.fail_reason && (
                                            <p className="text-sm text-red-600">
                                                Fail reason: {stop.fail_reason}
                                            </p>
                                        )}

                                        {stop.proof_view_url && (
                                            <p className="text-sm">
                                                Proof uploaded:{' '}
                                                <a
                                                    href={stop.proof_view_url}
                                                    className="underline underline-offset-4"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Open file
                                                </a>
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                        <Button
                                            asChild
                                            type="button"
                                            variant="outline"
                                            className="h-11 justify-start rounded-2xl"
                                        >
                                            <a
                                                href={stop.google_maps_url}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <MapPinned className="size-4" />
                                                Open in Google Maps
                                            </a>
                                        </Button>
                                        <Button
                                            asChild
                                            type="button"
                                            variant="outline"
                                            className="h-11 justify-start rounded-2xl"
                                        >
                                            <a
                                                href={stop.waze_url}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <Navigation className="size-4" />
                                                Open in Waze
                                            </a>
                                        </Button>
                                    </div>

                                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-11 justify-start rounded-2xl"
                                            disabled={statusForm.processing || stop.status === 'ARRIVED'}
                                            onClick={() => updateStopStatus(stop.id, 'ARRIVED')}
                                        >
                                            <Navigation className="size-4" />
                                            Arrived
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-11 justify-start rounded-2xl"
                                            disabled={statusForm.processing || stop.status === 'COMPLETED'}
                                            onClick={() => updateStopStatus(stop.id, 'COMPLETED')}
                                        >
                                            <CheckCircle2 className="size-4" />
                                            Completed
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-11 justify-start rounded-2xl"
                                            disabled={statusForm.processing}
                                            onClick={() =>
                                                setFailedStopId((currentStopId) =>
                                                    currentStopId === stop.id ? null : stop.id,
                                                )
                                            }
                                        >
                                            <XCircle className="size-4" />
                                            Failed
                                        </Button>
                                    </div>

                                    {failedStopId === stop.id && (
                                        <div className="mt-4 space-y-2 rounded-2xl border border-border/80 bg-background/40 p-3">
                                            <label
                                                htmlFor={`fail-reason-${stop.id}`}
                                                className="block text-sm font-medium"
                                            >
                                                Fail reason
                                            </label>
                                            <input
                                                id={`fail-reason-${stop.id}`}
                                                type="text"
                                                value={failReasons[stop.id] ?? ''}
                                                onChange={(event) =>
                                                    setFailReasons((currentReasons) => ({
                                                        ...currentReasons,
                                                        [stop.id]: event.target.value,
                                                    }))
                                                }
                                                className="w-full rounded-2xl border px-3 py-3 text-sm"
                                                disabled={statusForm.processing}
                                            />
                                            {statusForm.errors.fail_reason && (
                                                <p className="text-sm text-red-600">
                                                    {statusForm.errors.fail_reason}
                                                </p>
                                            )}
                                            <div className="grid gap-2 sm:grid-cols-2">
                                                <Button
                                                    type="button"
                                                    className="h-11 rounded-2xl"
                                                    onClick={() =>
                                                        updateStopStatus(
                                                            stop.id,
                                                            'FAILED',
                                                            failReasons[stop.id] ?? '',
                                                        )
                                                    }
                                                    disabled={statusForm.processing}
                                                >
                                                    Save failed status
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="h-11 rounded-2xl"
                                                    onClick={() => setFailedStopId(null)}
                                                    disabled={statusForm.processing}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {!stop.proof_file_url
                                        && ['COMPLETED', 'FAILED'].includes(stop.status) && (
                                            <div className="mt-4 space-y-2 rounded-2xl border border-border/80 bg-background/40 p-3">
                                                <label
                                                    htmlFor={`proof-file-${stop.id}`}
                                                    className="block text-sm font-medium"
                                                >
                                                    Upload proof photo
                                                </label>
                                                <input
                                                    id={`proof-file-${stop.id}`}
                                                    type="file"
                                                    accept="image/*"
                                                    capture="environment"
                                                    onChange={(event) =>
                                                        setSelectedProofFiles((currentFiles) => ({
                                                            ...currentFiles,
                                                            [stop.id]:
                                                                event.target.files?.[0] ?? null,
                                                        }))
                                                    }
                                                    className="block w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
                                                    disabled={proofForm.processing}
                                                />
                                                {proofForm.errors.file && (
                                                    <p className="text-sm text-red-600">
                                                        {proofForm.errors.file}
                                                    </p>
                                                )}
                                                <Button
                                                    type="button"
                                                    className="h-11 rounded-2xl"
                                                    onClick={() => uploadProof(stop.id)}
                                                    disabled={
                                                        proofForm.processing
                                                        || !selectedProofFiles[stop.id]
                                                    }
                                                >
                                                    <Upload className="size-4" />
                                                    Upload proof
                                                </Button>
                                            </div>
                                        )}
                                </section>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

function SummaryCard({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-border/80 bg-card/90 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {label}
            </p>
            <p className="mt-2 text-base font-semibold">{value}</p>
        </div>
    );
}
