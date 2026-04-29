import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState, type FormEvent } from 'react';
import {
    BackofficeActionLink,
    BackofficeCard,
    BackofficeCardBody,
    BackofficeInfoNote,
    BackofficePage,
    BackofficePageHeader,
    BackofficeStatusBadge,
    backofficeButtonClassName,
} from '@/components/backoffice/ui';
import ConfirmActionDialog from '@/components/confirm-action-dialog';
import {
    LeafletMap,
    type LeafletMapMarker,
} from '@/components/dispatcher/leaflet-map';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { formatShortDate } from '@/lib/date';
import type { BreadcrumbItem } from '@/types';
import type {
    AssignableOrder,
    DeliveryRouteRecord,
    RouteStopRecord,
} from '@/types/dispatcher';

type DispatcherRoutesShowProps = {
    deliveryRoute: DeliveryRouteRecord;
    stops: RouteStopRecord[];
    availableOrders: AssignableOrder[];
};

export default function DispatcherRoutesShow({
    deliveryRoute,
    stops,
    availableOrders,
}: DispatcherRoutesShowProps) {
    const { t } = useTranslation();
    const defaultStopIds = useMemo(() => stops.map((stop) => stop.id), [stops]);
    const [orderedStopIds, setOrderedStopIds] = useState(defaultStopIds);
    const reorderForm = useForm({ stop_ids: [] as number[] });
    const removeStopForm = useForm({
        route_stop: '',
    });
    const [pendingRemoveStop, setPendingRemoveStop] =
        useState<RouteStopRecord | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('dashboard.title'), href: '/dashboard' },
        { title: t('app.navigation.routes'), href: '/dispatcher/routes' },
        {
            title: t('dispatcher.routes.detail_title', {
                id: deliveryRoute.id,
            }),
            href: `/dispatcher/routes/${deliveryRoute.id}`,
        },
    ];

    const form = useForm({
        order_ids: [] as number[],
    });

    const toggleOrder = (orderId: number) => {
        form.setData(
            'order_ids',
            form.data.order_ids.includes(orderId)
                ? form.data.order_ids.filter(
                      (selectedOrderId) => selectedOrderId !== orderId,
                  )
                : [...form.data.order_ids, orderId],
        );
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(`/dispatcher/routes/${deliveryRoute.id}/orders`);
    };

    const stopIdsMatchCurrentStops = useMemo(
        () =>
            orderedStopIds.length === defaultStopIds.length &&
            defaultStopIds.every((stopId) => orderedStopIds.includes(stopId)),
        [defaultStopIds, orderedStopIds],
    );
    const effectiveStopIds = stopIdsMatchCurrentStops
        ? orderedStopIds
        : defaultStopIds;
    const stopsById = useMemo(
        () => new Map(stops.map((stop) => [stop.id, stop])),
        [stops],
    );
    const orderedStops = useMemo(
        () =>
            effectiveStopIds
                .map((stopId) => stopsById.get(stopId))
                .filter((stop): stop is RouteStopRecord => stop !== undefined),
        [effectiveStopIds, stopsById],
    );
    const hasLocalReorderChanges = useMemo(
        () => orderedStops.some((stop, index) => stop.id !== stops[index]?.id),
        [orderedStops, stops],
    );

    const mapMarkers = useMemo<LeafletMapMarker[]>(
        () =>
            orderedStops
                .map((stop, index) => ({
                    id: stop.id,
                    lat: Number(stop.lat),
                    lng: Number(stop.lng),
                    label: t('courier.stop.stop_number', {
                        number: index + 1,
                    }),
                    description: [
                        stop.client_name ??
                            t('dispatcher.orders.order_number', {
                                id: stop.order_id,
                            }),
                        stop.address_label,
                    ]
                        .filter(Boolean)
                        .join(' - '),
                }))
                .filter(
                    (marker) =>
                        Number.isFinite(marker.lat) &&
                        Number.isFinite(marker.lng),
                ),
        [orderedStops, t],
    );

    const moveStop = (index: number, direction: -1 | 1) => {
        const targetIndex = index + direction;

        if (targetIndex < 0 || targetIndex >= orderedStops.length) {
            return;
        }

        const nextStopIds = orderedStops.map((stop) => stop.id);
        const [movedStopId] = nextStopIds.splice(index, 1);

        nextStopIds.splice(targetIndex, 0, movedStopId);
        setOrderedStopIds(nextStopIds);
    };

    const saveStopOrder = () => {
        reorderForm.transform(() => ({
            stop_ids: orderedStops.map((stop) => stop.id),
        }));
        reorderForm.patch(
            `/dispatcher/routes/${deliveryRoute.id}/stops/reorder`,
            {
                preserveScroll: true,
            },
        );
    };

    const removeStop = (stop: RouteStopRecord) => {
        if (!stop.can_remove) {
            return;
        }
        setPendingRemoveStop(stop);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={t('dispatcher.routes.detail_title', {
                    id: deliveryRoute.id,
                })}
            />

            <BackofficePage>
                <BackofficePageHeader
                    title={t('dispatcher.routes.detail_title', {
                        id: deliveryRoute.id,
                    })}
                    description={`${deliveryRoute.courier_name ?? '-'} · ${formatShortDate(deliveryRoute.date)} · ${t(`common.statuses.${deliveryRoute.status.toLowerCase()}`)}`}
                    actions={
                        <>
                            <a
                                href={`/dispatcher/routes/${deliveryRoute.id}/print`}
                                target="_blank"
                                rel="noreferrer"
                                className={backofficeButtonClassName('outline')}
                            >
                                {t('dispatcher.routes.print_sheet')}
                            </a>
                            <BackofficeActionLink
                                href="/dispatcher/routes"
                                variant="outline"
                            >
                                {t('dispatcher.routes.back')}
                            </BackofficeActionLink>
                        </>
                    }
                />

                <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
                    <LeafletMap
                        markers={mapMarkers}
                        emptyMessage={t('dispatcher.routes.map_empty')}
                    />
                </div>

                <BackofficeCard>
                    <div className="flex flex-col gap-3 border-b border-[#e5e7eb] px-5 py-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-[#111827]">
                                {t('dispatcher.routes.stops')}
                            </h2>
                            <p className="text-sm text-[#6b7280]">
                                {t('dispatcher.routes.stops_description')}
                            </p>
                        </div>

                        {hasLocalReorderChanges ? (
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={saveStopOrder}
                                    disabled={reorderForm.processing}
                                    className={backofficeButtonClassName(
                                        'primary',
                                    )}
                                >
                                    {t('dispatcher.routes.save_order')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOrderedStopIds(defaultStopIds);
                                    }}
                                    disabled={reorderForm.processing}
                                    className={backofficeButtonClassName(
                                        'outline',
                                    )}
                                >
                                    {t('dispatcher.routes.reset_preview')}
                                </button>
                            </div>
                        ) : null}
                    </div>

                    <BackofficeCardBody className="space-y-3">
                        {orderedStops.length === 0 ? (
                            <BackofficeInfoNote>
                                {t('dispatcher.routes.no_stops')}
                            </BackofficeInfoNote>
                        ) : (
                            orderedStops.map((stop, index) => (
                                <div
                                    key={stop.id}
                                    className="flex flex-col gap-4 rounded-lg border border-[#e5e7eb] px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                                >
                                    <div className="space-y-1">
                                        <p className="font-semibold text-[#111827]">
                                            <Link
                                                href={stop.order_url}
                                                className="hover:text-[#2563eb] hover:underline"
                                            >
                                                {t(
                                                    'dispatcher.routes.stop_order',
                                                    {
                                                        number: index + 1,
                                                        id: stop.order_id,
                                                    },
                                                )}
                                            </Link>
                                        </p>
                                        <p className="text-sm text-[#111827]">
                                            {stop.client_name ?? '-'}
                                        </p>
                                        <p className="text-sm text-[#6b7280]">
                                            {stop.address_label || '-'}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                            <BackofficeStatusBadge
                                                status={stop.status}
                                            />
                                            {stop.proof_view_url ? (
                                                <a
                                                    href={stop.proof_view_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-sm font-medium text-[#2563eb] hover:text-[#1e40af] hover:underline"
                                                >
                                                    {t(
                                                        'courier.completed_orders.open_proof',
                                                    )}
                                                </a>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <BackofficeActionLink
                                            href={stop.order_url}
                                            variant="outline"
                                        >
                                            {t('dispatcher.routes.open_order')}
                                        </BackofficeActionLink>
                                        <button
                                            type="button"
                                            onClick={() => moveStop(index, -1)}
                                            disabled={
                                                index === 0 ||
                                                reorderForm.processing ||
                                                removeStopForm.processing
                                            }
                                            className={backofficeButtonClassName(
                                                'outline',
                                                'sm',
                                            )}
                                        >
                                            {t('dispatcher.routes.up')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveStop(index, 1)}
                                            disabled={
                                                index ===
                                                    orderedStops.length - 1 ||
                                                reorderForm.processing ||
                                                removeStopForm.processing
                                            }
                                            className={backofficeButtonClassName(
                                                'outline',
                                                'sm',
                                            )}
                                        >
                                            {t('dispatcher.routes.down')}
                                        </button>
                                        {stop.can_remove ? (
                                            <button
                                                type="button"
                                                onClick={() => removeStop(stop)}
                                                disabled={
                                                    removeStopForm.processing
                                                }
                                                className={backofficeButtonClassName(
                                                    'outline',
                                                    'sm',
                                                )}
                                            >
                                                {t('dispatcher.routes.remove')}
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            ))
                        )}
                    </BackofficeCardBody>
                </BackofficeCard>

                <BackofficeCard>
                    <BackofficeCardBody>
                        <form className="space-y-4" onSubmit={submit}>
                            <div>
                                <h2 className="text-base font-semibold text-[#111827]">
                                    {t('dispatcher.routes.add_orders')}
                                </h2>
                                <p className="text-sm text-[#6b7280]">
                                    {t(
                                        'dispatcher.routes.add_orders_description',
                                    )}
                                </p>
                            </div>

                            {availableOrders.length === 0 ? (
                                <BackofficeInfoNote>
                                    {t('dispatcher.routes.no_available_orders')}
                                </BackofficeInfoNote>
                            ) : (
                                <div className="space-y-2">
                                    {availableOrders.map((order) => (
                                        <label
                                            key={order.id}
                                            className="flex items-start gap-3 rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm transition hover:bg-[#f9fafb]"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={form.data.order_ids.includes(
                                                    order.id,
                                                )}
                                                onChange={() =>
                                                    toggleOrder(order.id)
                                                }
                                                className="mt-1 h-4 w-4 rounded border-[#cbd5e1]"
                                            />
                                            <span>
                                                <span className="font-semibold text-[#111827]">
                                                    #{order.id}{' '}
                                                    {order.client_name ?? '-'}
                                                </span>
                                                <span className="mt-1 block text-[#6b7280]">
                                                    {order.address_label} ·{' '}
                                                    {formatShortDate(
                                                        order.date,
                                                    )}{' '}
                                                    ·{' '}
                                                    {order.time_from.slice(
                                                        0,
                                                        5,
                                                    )}{' '}
                                                    -{' '}
                                                    {order.time_to.slice(0, 5)}
                                                </span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {form.errors.order_ids ? (
                                <p className="text-sm text-red-600">
                                    {form.errors.order_ids}
                                </p>
                            ) : null}

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className={backofficeButtonClassName(
                                        'primary',
                                    )}
                                >
                                    {t('dispatcher.routes.add_selected_orders')}
                                </button>
                            </div>
                        </form>
                    </BackofficeCardBody>
                </BackofficeCard>
            </BackofficePage>

            <ConfirmActionDialog
                open={pendingRemoveStop !== null}
                description={t('dispatcher.routes.remove_confirm', {
                    number: pendingRemoveStop?.seq_no ?? '',
                })}
                confirmLabel={t('dispatcher.routes.remove')}
                processing={removeStopForm.processing}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingRemoveStop(null);
                    }
                }}
                onConfirm={() => {
                    if (!pendingRemoveStop) {
                        return;
                    }

                    removeStopForm.delete(
                        `/dispatcher/routes/${deliveryRoute.id}/stops/${pendingRemoveStop.id}`,
                        {
                            preserveScroll: true,
                            onFinish: () => setPendingRemoveStop(null),
                        },
                    );
                }}
            />
        </AppLayout>
    );
}
