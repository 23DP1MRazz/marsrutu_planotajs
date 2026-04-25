import { Head, Link, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    MapPinned,
    Navigation,
    Upload,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    LeafletMap,
    type LeafletMapMarker,
} from '@/components/dispatcher/leaflet-map';
import { BackofficeStatusBadge } from '@/components/backoffice/ui';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { formatShortDate } from '@/lib/date';
import type {
    CourierDashboardSummary,
    CourierRouteRecord,
    CourierRouteStopRecord,
} from '@/types/courier';
import type { BreadcrumbItem } from '@/types';

type CourierRoutePageProps = {
    deliveryRoute: CourierRouteRecord | null;
    stops: CourierRouteStopRecord[];
    dashboardMode?: boolean;
    dashboardSummary?: CourierDashboardSummary | null;
};

export default function CourierRoutePage({
    deliveryRoute,
    stops,
    dashboardMode = false,
    dashboardSummary = null,
}: CourierRoutePageProps) {
    const { t } = useTranslation();
    const [failedStopId, setFailedStopId] = useState<number | null>(null);
    const [failReasons, setFailReasons] = useState<Record<number, string>>({});
    const [selectedProofFiles, setSelectedProofFiles] = useState<
        Record<number, File | null>
    >({});
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
                    label: t('courier.stop.stop_number', {
                        number: stop.seq_no,
                    }),
                    description: [
                        stop.client_name ??
                            t('courier.stop.order_number', {
                                id: stop.order_id,
                            }),
                        stop.address_label,
                    ]
                        .filter(Boolean)
                        .join(' — '),
                })),
        [stops, t],
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
        ? [{ title: t('dashboard.title'), href: '/dashboard' }]
        : [
              { title: t('dashboard.title'), href: '/dashboard' },
              { title: t('courier.today_route'), href: '/courier/today-route' },
          ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={
                    dashboardMode
                        ? t('dashboard.title')
                        : t('courier.today_route')
                }
            />

            <div className="flex flex-1 flex-col gap-4 p-3 sm:gap-6 sm:p-4">
                <div className="rounded-3xl border border-border/80 bg-card/90 p-4 shadow-sm sm:p-6">
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                        {dashboardMode
                            ? t('courier.dashboard.title')
                            : t('courier.today_route')}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t('courier.dashboard.description')}
                    </p>
                </div>

                {dashboardMode && dashboardSummary && (
                    <>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <SummaryCard
                                label={t('courier.dashboard.done_routes')}
                                value={String(dashboardSummary.done_routes)}
                                href="/courier/routes/completed"
                            />
                            <SummaryCard
                                label={t('courier.dashboard.completed_orders')}
                                value={String(
                                    dashboardSummary.completed_orders,
                                )}
                                href="/courier/orders/completed"
                            />
                            <SummaryCard
                                label={t('courier.dashboard.upcoming_routes')}
                                value={String(
                                    dashboardSummary.upcoming_routes_count,
                                )}
                                href="/courier/routes/upcoming"
                            />
                        </div>

                        <div className="rounded-3xl border border-border/80 bg-card/90 p-4 shadow-sm sm:p-5">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-base font-semibold sm:text-lg">
                                        {t('courier.dashboard.upcoming_routes')}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {t(
                                            'courier.routes.upcoming_description',
                                        )}
                                    </p>
                                </div>
                                <Link
                                    href="/courier/routes/upcoming"
                                    className="text-sm underline underline-offset-4"
                                >
                                    {t('courier.dashboard.open_all')}
                                </Link>
                            </div>

                            <div className="mt-4 space-y-3">
                                {dashboardSummary.upcoming_routes.length ===
                                0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        {t('courier.routes.upcoming_empty')}
                                    </p>
                                ) : (
                                    dashboardSummary.upcoming_routes.map(
                                        (route) => (
                                            <div
                                                key={route.id}
                                                className="rounded-2xl border border-border/80 p-3"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-medium">
                                                            {formatShortDate(
                                                                route.date,
                                                            )}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {t(
                                                                'courier.routes.planned_stops',
                                                                {
                                                                    count: route.stops_count,
                                                                },
                                                            )}
                                                        </p>
                                                    </div>
                                                    <BackofficeStatusBadge
                                                        status={route.status}
                                                    />
                                                </div>
                                            </div>
                                        ),
                                    )
                                )}
                            </div>
                        </div>
                    </>
                )}

                {deliveryRoute === null ? (
                    <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 p-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            {t('courier.dashboard.no_today_route')}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-3 sm:grid-cols-3">
                            <SummaryCard
                                label={t('common.fields.date')}
                                value={formatShortDate(deliveryRoute.date)}
                            />
                            <SummaryCard
                                label={t('courier.dashboard.route_status')}
                                value={t(
                                    `common.statuses.${deliveryRoute.status.toLowerCase()}`,
                                )}
                            />
                            <SummaryCard
                                label={t('courier.dashboard.total_stops')}
                                value={String(stops.length)}
                            />
                        </div>

                        <LeafletMap
                            markers={routeMarkers}
                            heightClassName="h-64 sm:h-80"
                            emptyMessage={t('courier.dashboard.no_coordinates')}
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
                                                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                                                    {t(
                                                        'courier.stop.stop_number',
                                                        {
                                                            number: stop.seq_no,
                                                        },
                                                    )}
                                                </p>
                                                <p className="mt-1 text-base font-semibold">
                                                    {stop.client_name ??
                                                        t(
                                                            'courier.stop.order_number',
                                                            {
                                                                id: stop.order_id,
                                                            },
                                                        )}
                                                </p>
                                            </div>
                                            <BackofficeStatusBadge
                                                status={stop.status}
                                            />
                                        </div>

                                        <p className="text-sm text-muted-foreground">
                                            {stop.address_label || '-'}
                                        </p>

                                        {stop.fail_reason && (
                                            <p className="text-sm text-red-600">
                                                {t(
                                                    'courier.stop.fail_reason_value',
                                                    {
                                                        reason: stop.fail_reason,
                                                    },
                                                )}
                                            </p>
                                        )}

                                        {stop.proof_view_url && (
                                            <p className="text-sm">
                                                {t(
                                                    'courier.stop.proof_uploaded',
                                                )}{' '}
                                                <a
                                                    href={stop.proof_view_url}
                                                    className="underline underline-offset-4"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {t(
                                                        'courier.stop.open_file',
                                                    )}
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
                                                {t('courier.stop.google_maps')}
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
                                                {t('courier.stop.waze')}
                                            </a>
                                        </Button>
                                    </div>

                                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-11 justify-start rounded-2xl"
                                            disabled={
                                                statusForm.processing ||
                                                stop.status === 'ARRIVED'
                                            }
                                            onClick={() =>
                                                updateStopStatus(
                                                    stop.id,
                                                    'ARRIVED',
                                                )
                                            }
                                        >
                                            <Navigation className="size-4" />
                                            {t('courier.stop.arrived')}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-11 justify-start rounded-2xl"
                                            disabled={
                                                statusForm.processing ||
                                                stop.status === 'COMPLETED'
                                            }
                                            onClick={() =>
                                                updateStopStatus(
                                                    stop.id,
                                                    'COMPLETED',
                                                )
                                            }
                                        >
                                            <CheckCircle2 className="size-4" />
                                            {t('courier.stop.completed')}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-11 justify-start rounded-2xl"
                                            disabled={statusForm.processing}
                                            onClick={() =>
                                                setFailedStopId(
                                                    (currentStopId) =>
                                                        currentStopId ===
                                                        stop.id
                                                            ? null
                                                            : stop.id,
                                                )
                                            }
                                        >
                                            <XCircle className="size-4" />
                                            {t('courier.stop.failed')}
                                        </Button>
                                    </div>

                                    {failedStopId === stop.id && (
                                        <div className="mt-4 space-y-2 rounded-2xl border border-border/80 bg-background/40 p-3">
                                            <label
                                                htmlFor={`fail-reason-${stop.id}`}
                                                className="block text-sm font-medium"
                                            >
                                                {t('courier.stop.fail_reason')}
                                            </label>
                                            <input
                                                id={`fail-reason-${stop.id}`}
                                                type="text"
                                                value={
                                                    failReasons[stop.id] ?? ''
                                                }
                                                onChange={(event) =>
                                                    setFailReasons(
                                                        (currentReasons) => ({
                                                            ...currentReasons,
                                                            [stop.id]:
                                                                event.target
                                                                    .value,
                                                        }),
                                                    )
                                                }
                                                className="w-full rounded-2xl border px-3 py-3 text-sm"
                                                disabled={statusForm.processing}
                                            />
                                            {statusForm.errors.fail_reason && (
                                                <p className="text-sm text-red-600">
                                                    {
                                                        statusForm.errors
                                                            .fail_reason
                                                    }
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
                                                            failReasons[
                                                                stop.id
                                                            ] ?? '',
                                                        )
                                                    }
                                                    disabled={
                                                        statusForm.processing
                                                    }
                                                >
                                                    {t(
                                                        'courier.stop.save_failed',
                                                    )}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="h-11 rounded-2xl"
                                                    onClick={() =>
                                                        setFailedStopId(null)
                                                    }
                                                    disabled={
                                                        statusForm.processing
                                                    }
                                                >
                                                    {t('common.actions.cancel')}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {!stop.proof_file_url &&
                                        ['COMPLETED', 'FAILED'].includes(
                                            stop.status,
                                        ) && (
                                            <div className="mt-4 space-y-2 rounded-2xl border border-border/80 bg-background/40 p-3">
                                                <label
                                                    htmlFor={`proof-file-${stop.id}`}
                                                    className="block text-sm font-medium"
                                                >
                                                    {t(
                                                        'courier.stop.upload_proof_photo',
                                                    )}
                                                </label>
                                                <input
                                                    id={`proof-file-${stop.id}`}
                                                    type="file"
                                                    accept="image/*"
                                                    capture="environment"
                                                    onChange={(event) =>
                                                        setSelectedProofFiles(
                                                            (currentFiles) => ({
                                                                ...currentFiles,
                                                                [stop.id]:
                                                                    event.target
                                                                        .files?.[0] ??
                                                                    null,
                                                            }),
                                                        )
                                                    }
                                                    className="block w-full text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground"
                                                    disabled={
                                                        proofForm.processing
                                                    }
                                                />
                                                {proofForm.errors.file && (
                                                    <p className="text-sm text-red-600">
                                                        {proofForm.errors.file}
                                                    </p>
                                                )}
                                                <Button
                                                    type="button"
                                                    className="h-11 rounded-2xl"
                                                    onClick={() =>
                                                        uploadProof(stop.id)
                                                    }
                                                    disabled={
                                                        proofForm.processing ||
                                                        !selectedProofFiles[
                                                            stop.id
                                                        ]
                                                    }
                                                >
                                                    <Upload className="size-4" />
                                                    {t(
                                                        'courier.stop.upload_proof',
                                                    )}
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
    href,
}: {
    label: string;
    value: string;
    href?: string;
}) {
    const content = (
        <div className="rounded-2xl border border-border/80 bg-card/90 p-4 transition-colors hover:border-primary/50">
            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                {label}
            </p>
            <p className="mt-2 text-base font-semibold">{value}</p>
        </div>
    );

    if (href) {
        return <Link href={href}>{content}</Link>;
    }

    return content;
}
