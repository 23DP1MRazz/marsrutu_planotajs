import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Camera,
    Check,
    CheckCircle2,
    ChevronDown,
    CircleAlert,
    Clock3,
    MapPin,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
    CourierEmptyState,
    CourierMobileBody,
    CourierMobileHeader,
    CourierSectionLabel,
} from '@/components/courier/mobile-ui';
import {
    BackofficeCard,
    BackofficePage,
    BackofficePageHeader,
    BackofficeStatCard,
    BackofficeStatusBadge,
    backofficeButtonClassName,
} from '@/components/backoffice/ui';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { formatShortDate } from '@/lib/date';
import { cn } from '@/lib/utils';
import type {
    CourierRouteRecord,
    CourierRouteStopRecord,
} from '@/types/courier';
import type { SharedData } from '@/types';

type CourierRoutePageProps = {
    deliveryRoute: CourierRouteRecord | null;
    stops: CourierRouteStopRecord[];
    readOnly?: boolean;
    pageTitle?: string;
    pageDescription?: string;
    backHref?: string;
};

function stopVisualState(
    stop: CourierRouteStopRecord,
    activeStopId: number | null,
): 'done' | 'failed' | 'active' | 'arrived' | 'pending' {
    if (stop.status === 'COMPLETED') {
        return 'done';
    }

    if (stop.status === 'FAILED') {
        return 'failed';
    }

    if (stop.id === activeStopId) {
        return 'active';
    }

    if (stop.status === 'ARRIVED') {
        return 'arrived';
    }

    return 'pending';
}

function stopBadgeClassName(visualState: ReturnType<typeof stopVisualState>) {
    switch (visualState) {
        case 'done':
            return 'bg-[#f0fdf4] text-[#16a34a]';
        case 'failed':
            return 'bg-[#fef2f2] text-[#dc2626]';
        case 'active':
            return 'bg-[#eff6ff] text-[#1e40af]';
        case 'arrived':
            return 'bg-[#fffbeb] text-[#d97706]';
        default:
            return 'bg-[#f9fafb] text-[#6b7280]';
    }
}

function stopCardClassName(visualState: ReturnType<typeof stopVisualState>) {
    switch (visualState) {
        case 'done':
            return 'border-[#bbf7d0]';
        case 'failed':
            return 'border-[#fecaca]';
        case 'active':
            return 'border-[#2563eb] shadow-[0_0_0_3px_rgba(37,99,235,0.10)]';
        default:
            return 'border-[#e5e7eb]';
    }
}

function stopNumberClassName(visualState: ReturnType<typeof stopVisualState>) {
    switch (visualState) {
        case 'done':
            return 'bg-[#f0fdf4] text-[#16a34a]';
        case 'failed':
            return 'bg-[#fef2f2] text-[#dc2626]';
        case 'active':
            return 'bg-[#2563eb] text-white';
        default:
            return 'bg-[#f9fafb] text-[#6b7280]';
    }
}

function statusLabel(
    stop: CourierRouteStopRecord,
    t: (key: string, params?: Record<string, string | number>) => string,
) {
    return t(`common.statuses.${stop.status.toLowerCase()}`);
}

function formatTimeRange(stop: CourierRouteStopRecord) {
    if (stop.time_from && stop.time_to) {
        return `${stop.time_from.slice(0, 5)}-${stop.time_to.slice(0, 5)}`;
    }

    if (stop.planned_eta) {
        return stop.planned_eta.slice(11, 16);
    }

    return '-';
}

function formatClockTime(value: string | null) {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    return new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

export default function CourierRoutePage({
    deliveryRoute,
    stops,
    readOnly = false,
    pageTitle,
    pageDescription,
    backHref = '/dashboard',
}: CourierRoutePageProps) {
    const { t } = useTranslation();
    const isMobile = useIsMobile();
    const page = usePage<SharedData>();
    const resolvedTitle = pageTitle ?? t('courier.today_route');
    const resolvedDescription =
        pageDescription ?? t('courier.dashboard.description');
    const [failedStopId, setFailedStopId] = useState<number | null>(null);
    const [failReasons, setFailReasons] = useState<Record<number, string>>({});
    const [selectedProofFiles, setSelectedProofFiles] = useState<
        Record<number, File | null>
    >({});
    const activeStopId = useMemo(
        () =>
            stops.find((stop) => stop.status === 'ARRIVED')?.id ??
            stops.find((stop) => stop.status === 'PENDING')?.id ??
            null,
        [stops],
    );
    const [expandedStopIds, setExpandedStopIds] = useState<
        Record<number, boolean>
    >(() =>
        activeStopId === null
            ? {}
            : {
                  [activeStopId]: true,
              },
    );
    const completedStopsCount = stops.filter(
        (stop) => stop.status === 'COMPLETED',
    ).length;
    const progressWidth =
        stops.length === 0 ? 0 : (completedStopsCount / stops.length) * 100;
    const statusForm = useForm({
        status: '',
        fail_reason: '',
    });
    const proofForm = useForm({
        file: null as File | null,
    });

    useEffect(() => {
        setExpandedStopIds((current) => {
            if (activeStopId === null || current[activeStopId]) {
                return current;
            }

            return {
                ...current,
                [activeStopId]: true,
            };
        });
    }, [activeStopId]);

    useEffect(() => {
        if (activeStopId === null) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            document
                .getElementById(`courier-stop-${activeStopId}`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);

        return () => window.clearTimeout(timeoutId);
    }, [activeStopId]);

    const toggleStop = (stopId: number) => {
        setExpandedStopIds((current) => ({
            ...current,
            [stopId]: !current[stopId],
        }));
    };

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

    if (!isMobile) {
        return (
            <AppLayout breadcrumbs={[]}>
                <Head title={resolvedTitle} />

                <BackofficePage>
                    <BackofficePageHeader
                        title={resolvedTitle}
                        description={resolvedDescription}
                        actions={
                            <Link
                                href={backHref}
                                className={backofficeButtonClassName('outline')}
                            >
                                {t('common.actions.back_to_dashboard')}
                            </Link>
                        }
                    />

                    {deliveryRoute === null ? (
                        <CourierEmptyState
                            title={t('courier.dashboard.no_today_route')}
                            description={resolvedDescription}
                            action={
                                <Link
                                    href={backHref}
                                    className={backofficeButtonClassName(
                                        'outline',
                                    )}
                                >
                                    {t('common.actions.back_to_dashboard')}
                                </Link>
                            }
                        />
                    ) : (
                        <>
                            <div className="grid gap-3 md:grid-cols-3">
                                <BackofficeStatCard
                                    label={t('common.fields.date')}
                                    value={formatShortDate(deliveryRoute.date)}
                                    meta="Scheduled route date"
                                />
                                <BackofficeStatCard
                                    label={t('courier.dashboard.route_status')}
                                    value={t(
                                        `common.statuses.${deliveryRoute.status.toLowerCase()}`,
                                    )}
                                    meta={`Route #${deliveryRoute.id}`}
                                />
                                <BackofficeStatCard
                                    label={t('courier.dashboard.total_stops')}
                                    value={stops.length}
                                    meta={`${completedStopsCount} completed`}
                                />
                            </div>

                            <BackofficeCard className="p-5">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[11px] font-semibold tracking-[0.07em] text-[#6b7280] uppercase">
                                            Progress
                                        </div>
                                        <div className="mt-2 text-sm text-[#6b7280]">
                                            {completedStopsCount} /{' '}
                                            {stops.length} done
                                        </div>
                                    </div>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-[#e5e7eb]">
                                    <div
                                        className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb_0%,#3b82f6_100%)]"
                                        style={{
                                            width: `${progressWidth}%`,
                                        }}
                                    />
                                </div>
                            </BackofficeCard>

                            <div className="space-y-4">
                                {stops.map((stop) => (
                                    <BackofficeCard
                                        key={stop.id}
                                        className="p-5"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="text-xs font-semibold tracking-[0.07em] text-[#6b7280] uppercase">
                                                    Stop {stop.seq_no}
                                                </div>
                                                <div className="mt-2 text-lg font-semibold text-[#111827]">
                                                    {stop.client_name ??
                                                        t(
                                                            'courier.stop.order_number',
                                                            {
                                                                id: stop.order_id,
                                                            },
                                                        )}
                                                </div>
                                                <div className="mt-1 text-sm text-[#6b7280]">
                                                    {stop.address_label}
                                                </div>
                                                <div className="mt-2 text-sm text-[#6b7280]">
                                                    {formatTimeRange(stop)}
                                                </div>
                                            </div>
                                            <BackofficeStatusBadge
                                                status={stop.status}
                                            />
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <a
                                                href={stop.google_maps_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={backofficeButtonClassName(
                                                    'outline',
                                                    'sm',
                                                )}
                                            >
                                                Google Maps
                                            </a>
                                            <a
                                                href={stop.waze_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={backofficeButtonClassName(
                                                    'outline',
                                                    'sm',
                                                )}
                                            >
                                                Waze
                                            </a>
                                            {!readOnly &&
                                                (stop.status === 'PENDING' ||
                                                    stop.status ===
                                                        'ARRIVED') && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateStopStatus(
                                                                    stop.id,
                                                                    'ARRIVED',
                                                                )
                                                            }
                                                            className={backofficeButtonClassName(
                                                                'outline',
                                                                'sm',
                                                            )}
                                                        >
                                                            {t(
                                                                'courier.stop.arrived',
                                                            )}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateStopStatus(
                                                                    stop.id,
                                                                    'COMPLETED',
                                                                )
                                                            }
                                                            className={backofficeButtonClassName(
                                                                'primary',
                                                                'sm',
                                                            )}
                                                        >
                                                            Mark as Delivered
                                                        </button>
                                                    </>
                                                )}
                                        </div>
                                    </BackofficeCard>
                                ))}
                            </div>
                        </>
                    )}
                </BackofficePage>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title={resolvedTitle} />

            <CourierMobileHeader
                title={resolvedTitle}
                subtitle={
                    deliveryRoute
                        ? formatShortDate(deliveryRoute.date)
                        : formatShortDate(new Date().toISOString())
                }
                backHref={backHref}
                rightSlot={
                    <Link
                        href="/settings/profile"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#3b82f6] text-[10px] font-bold tracking-[0.03em] text-white"
                    >
                        {page.props.auth.user.name
                            .split(' ')
                            .slice(0, 2)
                            .map((part) => part[0]?.toUpperCase() ?? '')
                            .join('')}
                    </Link>
                }
            />

            <CourierMobileBody className="pb-6">
                {deliveryRoute === null ? (
                    <CourierEmptyState
                        title={t('courier.dashboard.no_today_route')}
                        description={resolvedDescription}
                        action={
                            <Link
                                href={backHref}
                                className={backofficeButtonClassName('outline')}
                            >
                                {t('common.actions.back_to_dashboard')}
                            </Link>
                        }
                    />
                ) : (
                    <>
                        <section className="flex items-center gap-4 rounded-2xl bg-[linear-gradient(135deg,#1e40af_0%,#2563eb_60%,#3b82f6_100%)] px-5 py-[18px] text-white">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
                                <svg
                                    width="24"
                                    height="24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <rect
                                        x="3"
                                        y="3"
                                        width="18"
                                        height="18"
                                        rx="2"
                                    />
                                    <path d="M3 9h18M9 21V9" />
                                </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-white/75">
                                    {page.props.auth.user.name}
                                </div>
                                <div className="text-[17px] font-bold tracking-[-0.02em]">
                                    Route #{deliveryRoute.id}
                                </div>
                                <div className="mt-1 text-[11px] text-white/80">
                                    {t(
                                        `common.statuses.${deliveryRoute.status.toLowerCase()}`,
                                    )}
                                </div>
                            </div>
                            <div className="shrink-0 text-right">
                                <div className="text-[32px] leading-none font-extrabold tracking-[-0.04em]">
                                    {stops.length}
                                </div>
                                <div className="mt-0.5 text-[11px] text-white/70">
                                    {t('courier.dashboard.total_stops')}
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs font-semibold tracking-[0.06em] text-[#6b7280] uppercase">
                                    Progress
                                </span>
                                <span className="text-[13px] font-bold text-[#2563eb]">
                                    {completedStopsCount} / {stops.length} done
                                </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-[#e5e7eb]">
                                <div
                                    className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb_0%,#3b82f6_100%)] transition-[width] duration-500"
                                    style={{
                                        width: `${progressWidth}%`,
                                    }}
                                />
                            </div>
                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                                {stops.map((stop) => {
                                    const visualState = stopVisualState(
                                        stop,
                                        activeStopId,
                                    );

                                    return (
                                        <span
                                            key={stop.id}
                                            className={cn(
                                                'h-2.5 w-2.5 rounded-full bg-[#e5e7eb]',
                                                visualState === 'done' &&
                                                    'bg-[#16a34a]',
                                                visualState === 'failed' &&
                                                    'bg-[#dc2626]',
                                                visualState === 'active' &&
                                                    'bg-[#2563eb] shadow-[0_0_0_3px_rgba(37,99,235,0.25)]',
                                            )}
                                        />
                                    );
                                })}
                            </div>
                        </section>
                    </>
                )}
            </CourierMobileBody>

            {deliveryRoute !== null ? (
                <>
                    <CourierSectionLabel>
                        {t('common.fields.stops')}
                    </CourierSectionLabel>

                    <div className="flex flex-col gap-2.5 px-3.5 pb-5">
                        {stops.map((stop) => {
                            const visualState = stopVisualState(
                                stop,
                                activeStopId,
                            );
                            const isExpanded =
                                expandedStopIds[stop.id] ?? false;
                            const canChangeStatus =
                                !readOnly &&
                                (stop.status === 'PENDING' ||
                                    stop.status === 'ARRIVED');
                            const canUploadProof =
                                !readOnly &&
                                (stop.status === 'COMPLETED' ||
                                    stop.status === 'FAILED') &&
                                stop.proof_view_url === null;

                            return (
                                <section
                                    key={stop.id}
                                    id={`courier-stop-${stop.id}`}
                                    className={cn(
                                        'overflow-hidden rounded-2xl border-[1.5px] bg-white',
                                        stopCardClassName(visualState),
                                    )}
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleStop(stop.id)}
                                        className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
                                    >
                                        <div
                                            className={cn(
                                                'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold',
                                                stopNumberClassName(
                                                    visualState,
                                                ),
                                            )}
                                        >
                                            {visualState === 'done' ? (
                                                <Check className="h-3.5 w-3.5" />
                                            ) : visualState === 'failed' ? (
                                                <X className="h-3.5 w-3.5" />
                                            ) : (
                                                stop.seq_no
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-[15px] font-bold tracking-[-0.015em] text-[#111827]">
                                                {stop.client_name ??
                                                    t(
                                                        'courier.stop.order_number',
                                                        { id: stop.order_id },
                                                    )}
                                            </div>
                                            <div className="mt-0.5 truncate text-[13px] text-[#6b7280]">
                                                {stop.address_label}
                                            </div>
                                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6b7280]">
                                                    <Clock3 className="h-3 w-3" />
                                                    {formatTimeRange(stop)}
                                                </span>
                                                <span
                                                    className={cn(
                                                        'rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.04em] uppercase',
                                                        stopBadgeClassName(
                                                            visualState,
                                                        ),
                                                    )}
                                                >
                                                    {statusLabel(stop, t)}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronDown
                                            className={cn(
                                                'mt-0.5 h-4 w-4 shrink-0 text-[#6b7280] transition-transform duration-200',
                                                isExpanded && 'rotate-180',
                                            )}
                                        />
                                    </button>

                                    {isExpanded ? (
                                        <div>
                                            {stop.status === 'COMPLETED' ? (
                                                <>
                                                    <div className="mx-4 h-px bg-[#e5e7eb]" />
                                                    <div className="flex items-center gap-3 px-4 py-3.5">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[#bbf7d0] bg-[#f0fdf4] text-[#16a34a]">
                                                            <Check className="h-3.5 w-3.5" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-xs text-[#6b7280]">
                                                                Delivered at
                                                            </div>
                                                            <div className="text-sm font-semibold text-[#111827]">
                                                                {formatClockTime(
                                                                    stop.completed_at,
                                                                )}
                                                            </div>
                                                        </div>
                                                        {stop.proof_view_url ? (
                                                            <a
                                                                href={
                                                                    stop.proof_view_url
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-xs font-semibold text-[#2563eb]"
                                                            >
                                                                View proof →
                                                            </a>
                                                        ) : null}
                                                    </div>
                                                </>
                                            ) : stop.status === 'FAILED' ? (
                                                <div className="bg-[#fef2f2] px-4 py-3.5">
                                                    <div className="flex items-start gap-2 text-[13px] font-medium text-[#dc2626]">
                                                        <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                                        <span>
                                                            {stop.fail_reason ??
                                                                t(
                                                                    'courier.stop.fail_reason',
                                                                )}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="grid grid-cols-2 gap-2 px-4 py-3">
                                                        <a
                                                            href={
                                                                stop.google_maps_url
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex h-10 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-[#4285f4] bg-[#f0f6ff] text-[13px] font-semibold text-[#1a73e8]"
                                                        >
                                                            <MapPin className="h-3.5 w-3.5" />
                                                            Google Maps
                                                        </a>
                                                        <a
                                                            href={stop.waze_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex h-10 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-[#6cd5f5] bg-[#edfaff] text-[13px] font-semibold text-[#0a6eb4]"
                                                        >
                                                            <MapPin className="h-3.5 w-3.5" />
                                                            Waze
                                                        </a>
                                                    </div>
                                                    <div className="mx-4 h-px bg-[#e5e7eb]" />
                                                    <div className="flex flex-col gap-2 px-4 py-3.5">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    !canChangeStatus ||
                                                                    statusForm.processing
                                                                }
                                                                onClick={() =>
                                                                    updateStopStatus(
                                                                        stop.id,
                                                                        'ARRIVED',
                                                                    )
                                                                }
                                                                className="flex h-11 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-[#fde68a] bg-[#fffbeb] text-sm font-semibold text-[#d97706] disabled:opacity-50"
                                                            >
                                                                <MapPin className="h-3.5 w-3.5" />
                                                                {t(
                                                                    'courier.stop.arrived',
                                                                )}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    !canChangeStatus ||
                                                                    statusForm.processing
                                                                }
                                                                onClick={() =>
                                                                    setFailedStopId(
                                                                        failedStopId ===
                                                                            stop.id
                                                                            ? null
                                                                            : stop.id,
                                                                    )
                                                                }
                                                                className="flex h-11 items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-[#fecaca] bg-[#fef2f2] text-sm font-semibold text-[#dc2626] disabled:opacity-50"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                                {t(
                                                                    'courier.stop.failed',
                                                                )}
                                                            </button>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                !canChangeStatus ||
                                                                statusForm.processing
                                                            }
                                                            onClick={() =>
                                                                updateStopStatus(
                                                                    stop.id,
                                                                    'COMPLETED',
                                                                )
                                                            }
                                                            className="flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#16a34a] text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(22,163,74,0.30)] disabled:opacity-50"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            Mark as Delivered
                                                        </button>

                                                        {failedStopId ===
                                                        stop.id ? (
                                                            <div className="flex flex-col gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        failReasons[
                                                                            stop
                                                                                .id
                                                                        ] ?? ''
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        setFailReasons(
                                                                            (
                                                                                current,
                                                                            ) => ({
                                                                                ...current,
                                                                                [stop.id]:
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                            }),
                                                                        )
                                                                    }
                                                                    placeholder="Describe reason for failure..."
                                                                    className="h-[42px] rounded-[10px] border-[1.5px] border-[#fecaca] bg-[#fef2f2] px-3.5 text-sm text-[#111827] outline-none placeholder:text-[#f87171] focus:border-[#dc2626]"
                                                                />
                                                                {statusForm
                                                                    .errors
                                                                    .fail_reason ? (
                                                                    <p className="text-sm text-[#dc2626]">
                                                                        {
                                                                            statusForm
                                                                                .errors
                                                                                .fail_reason
                                                                        }
                                                                    </p>
                                                                ) : null}
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <button
                                                                        type="button"
                                                                        disabled={
                                                                            statusForm.processing
                                                                        }
                                                                        onClick={() =>
                                                                            updateStopStatus(
                                                                                stop.id,
                                                                                'FAILED',
                                                                                failReasons[
                                                                                    stop
                                                                                        .id
                                                                                ] ??
                                                                                    '',
                                                                            )
                                                                        }
                                                                        className="h-11 rounded-[10px] bg-[#dc2626] text-sm font-semibold text-white shadow-[0_4px_12px_rgba(220,38,38,0.30)] disabled:opacity-50"
                                                                    >
                                                                        Confirm
                                                                        Failed
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setFailedStopId(
                                                                                null,
                                                                            )
                                                                        }
                                                                        className="h-11 rounded-[10px] border-[1.5px] border-[#e5e7eb] bg-white text-sm font-semibold text-[#6b7280]"
                                                                    >
                                                                        {t(
                                                                            'common.actions.cancel',
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : null}

                                                        <div
                                                            className={cn(
                                                                'rounded-[10px] border-[1.5px] border-dashed px-4 py-3',
                                                                canUploadProof
                                                                    ? 'border-[#d1d5db] bg-[#f9fafb]'
                                                                    : 'border-[#e5e7eb] bg-[#f9fafb] opacity-70',
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb]">
                                                                    <Camera className="h-4 w-4" />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="text-sm font-semibold text-[#111827]">
                                                                        {t(
                                                                            'courier.stop.upload_proof_photo',
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs text-[#6b7280]">
                                                                        {canUploadProof
                                                                            ? 'Take or choose a photo'
                                                                            : 'Available after the stop is completed or failed'}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {canUploadProof ? (
                                                                <div className="mt-3 flex flex-col gap-2">
                                                                    <input
                                                                        type="file"
                                                                        accept="image/png,image/jpeg,image/webp"
                                                                        onChange={(
                                                                            event,
                                                                        ) =>
                                                                            setSelectedProofFiles(
                                                                                (
                                                                                    currentFiles,
                                                                                ) => ({
                                                                                    ...currentFiles,
                                                                                    [stop.id]:
                                                                                        event
                                                                                            .target
                                                                                            .files?.[0] ??
                                                                                        null,
                                                                                }),
                                                                            )
                                                                        }
                                                                        className="block w-full text-xs text-[#6b7280] file:mr-3 file:rounded-lg file:border-0 file:bg-[#2563eb] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
                                                                    />
                                                                    {proofForm
                                                                        .errors
                                                                        .file ? (
                                                                        <p className="text-sm text-[#dc2626]">
                                                                            {
                                                                                proofForm
                                                                                    .errors
                                                                                    .file
                                                                            }
                                                                        </p>
                                                                    ) : null}
                                                                    {selectedProofFiles[
                                                                        stop.id
                                                                    ] ? (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                uploadProof(
                                                                                    stop.id,
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                proofForm.processing
                                                                            }
                                                                            className={backofficeButtonClassName(
                                                                                'primary',
                                                                                'sm',
                                                                            )}
                                                                        >
                                                                            {t(
                                                                                'courier.stop.upload_proof',
                                                                            )}
                                                                        </button>
                                                                    ) : null}
                                                                </div>
                                                            ) : stop.proof_view_url ? (
                                                                <div className="mt-3">
                                                                    <a
                                                                        href={
                                                                            stop.proof_view_url
                                                                        }
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="text-xs font-semibold text-[#2563eb]"
                                                                    >
                                                                        View
                                                                        proof →
                                                                    </a>
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : null}
                                </section>
                            );
                        })}
                    </div>
                </>
            ) : null}
        </AppLayout>
    );
}
