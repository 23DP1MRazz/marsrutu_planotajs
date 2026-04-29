import { Head, Link, useForm } from '@inertiajs/react';
import { Route as RouteIcon, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
    BackofficeActionLink,
    BackofficeCard,
    BackofficeEmptyState,
    BackofficeIconButton,
    BackofficePage,
    BackofficePageHeader,
    BackofficeResultsBar,
    BackofficeStatusBadge,
    DeleteIcon,
    EditIcon,
    backofficeButtonClassName,
    backofficeInputClassName,
    backofficeSelectClassName,
} from '@/components/backoffice/ui';
import ConfirmActionDialog from '@/components/confirm-action-dialog';
import { useLiveFiltering } from '@/hooks/use-live-filtering';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import {
    type ActionPopup,
    type PopupPosition,
    popupPositionFromElement,
} from '@/lib/action-popup';
import { formatShortDate } from '@/lib/date';
import type { BreadcrumbItem } from '@/types';
import type {
    OrderFilters,
    OrderRecord,
    OrganizationOption,
} from '@/types/dispatcher';

const searchSeparator = '||';

function splitSearchTerms(search: string): string[] {
    return search
        .split(searchSeparator)
        .map((term) => term.trim())
        .filter(Boolean);
}

function joinSearchTerms(terms: string[]): string {
    return terms.join(searchSeparator);
}

type DispatcherOrdersIndexProps = {
    orders: OrderRecord[];
    filters: OrderFilters;
    statuses: string[];
    organizations: OrganizationOption[];
    canFilterByOrganization: boolean;
};

type ActiveFilter = {
    key: 'search' | 'date' | 'status' | 'organization_id';
    label: string;
    value?: string;
};

export default function DispatcherOrdersIndex({
    orders,
    filters,
    statuses,
    organizations,
    canFilterByOrganization,
}: DispatcherOrdersIndexProps) {
    const { t } = useTranslation();
    const filterForm = useForm({
        search: filters.search ?? '',
        date: filters.date ?? '',
        status: filters.status ?? '',
        organization_id: filters.organization_id ?? '',
        sort: filters.sort ?? 'date_desc',
    });
    const actionForm = useForm({});
    const actionErrors = actionForm.errors as Record<
        string,
        string | undefined
    >;
    const [draftSearch, setDraftSearch] = useState('');
    const [actionPopup, setActionPopup] = useState<ActionPopup | null>(null);
    const actionPopupId = useRef(0);
    const [lastActionPosition, setLastActionPosition] =
        useState<PopupPosition | null>(null);
    const [pendingAction, setPendingAction] = useState<{
        kind: 'delete' | 'cancel';
        orderId: number;
    } | null>(null);
    const searchTerms = splitSearchTerms(filterForm.data.search);
    const liveSearch = joinSearchTerms([
        ...searchTerms,
        ...(draftSearch.trim() === '' ? [] : [draftSearch.trim()]),
    ]);
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('dashboard.title'), href: '/dashboard' },
        { title: t('app.navigation.orders'), href: '/dispatcher/orders' },
    ];
    const sortOptions = [
        { value: 'date_desc', label: t('dispatcher.sort.date_desc') },
        { value: 'date_asc', label: t('dispatcher.sort.date_asc') },
        { value: 'time_asc', label: t('dispatcher.sort.time_asc') },
        { value: 'time_desc', label: t('dispatcher.sort.time_desc') },
        { value: 'status_asc', label: t('dispatcher.sort.status_asc') },
        { value: 'status_desc', label: t('dispatcher.sort.status_desc') },
        { value: 'updated_desc', label: t('dispatcher.sort.updated_desc') },
        { value: 'updated_asc', label: t('dispatcher.sort.updated_asc') },
    ];

    useLiveFiltering({
        data: {
            ...filterForm.data,
            search: liveSearch,
        },
        url: '/dispatcher/orders',
    });

    useEffect(() => {
        if (!actionPopup) {
            return;
        }

        const hideTimeoutId = window.setTimeout(() => {
            setActionPopup((currentPopup) =>
                currentPopup?.id === actionPopup.id
                    ? { ...currentPopup, visible: false }
                    : currentPopup,
            );
            actionForm.clearErrors();
        }, 1000);

        const removeTimeoutId = window.setTimeout(() => {
            setActionPopup((currentPopup) =>
                currentPopup?.id === actionPopup.id ? null : currentPopup,
            );
        }, 1250);

        return () => {
            window.clearTimeout(hideTimeoutId);
            window.clearTimeout(removeTimeoutId);
        };
    }, [actionForm, actionPopup]);

    useEffect(() => {
        if (!actionErrors.order) {
            return;
        }

        setActionPopup({
            id: (actionPopupId.current += 1),
            message: actionErrors.order,
            position: lastActionPosition ?? undefined,
            visible: true,
        });
    }, [actionErrors.order, lastActionPosition]);

    const showActionPopup = (message: string, trigger: HTMLElement) => {
        const position = popupPositionFromElement(trigger);

        setLastActionPosition(position);
        actionForm.clearErrors();
        setActionPopup({
            id: (actionPopupId.current += 1),
            message,
            position,
            visible: true,
        });
    };

    const deleteOrder = (order: OrderRecord, trigger: HTMLElement) => {
        if (!order.can_delete) {
            showActionPopup(t('dispatcher.orders.delete_blocked'), trigger);
            return;
        }

        setLastActionPosition(popupPositionFromElement(trigger));
        setPendingAction({
            kind: 'delete',
            orderId: order.id,
        });
    };

    const cancelOrder = (orderId: number, trigger: HTMLElement) => {
        setLastActionPosition(popupPositionFromElement(trigger));
        setPendingAction({
            kind: 'cancel',
            orderId,
        });
    };

    const clearFilters = () => {
        setDraftSearch('');
        filterForm.setData({
            search: '',
            date: '',
            status: '',
            organization_id: '',
            sort: 'date_desc',
        });
    };

    const commitSearch = () => {
        const nextTerm = draftSearch.trim();

        if (nextTerm === '') {
            return;
        }

        setDraftSearch('');
        filterForm.setData(
            'search',
            joinSearchTerms([...searchTerms, nextTerm]),
        );
    };

    const removeSearchTerm = (termToRemove: string) => {
        filterForm.setData(
            'search',
            joinSearchTerms(
                searchTerms.filter((term) => term !== termToRemove),
            ),
        );
    };

    const exportQuery = new URLSearchParams(
        Object.entries(filterForm.data).filter(([, value]) => value !== ''),
    ).toString();

    const activeFilters = (
        [
            ...searchTerms.map((term) => ({
                key: 'search' as const,
                value: term,
                label: t('dispatcher.clients.search_tag', { term }),
            })),
            filterForm.data.date
                ? {
                      key: 'date' as const,
                      label: t('dispatcher.filters.active_date', {
                          date: formatShortDate(filterForm.data.date),
                      }),
                  }
                : null,
            filterForm.data.status
                ? {
                      key: 'status' as const,
                      label: t('dispatcher.filters.active_status', {
                          status: t(
                              `common.statuses.${filterForm.data.status.toLowerCase()}`,
                          ),
                      }),
                  }
                : null,
            canFilterByOrganization && filterForm.data.organization_id
                ? {
                      key: 'organization_id' as const,
                      label: t('dispatcher.filters.active_organization', {
                          organization:
                              organizations.find(
                                  (organization) =>
                                      String(organization.id) ===
                                      filterForm.data.organization_id,
                              )?.name ?? filterForm.data.organization_id,
                      }),
                  }
                : null,
        ] as Array<ActiveFilter | null>
    ).filter((value): value is ActiveFilter => value !== null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('app.navigation.orders')} />

            <BackofficePage>
                <BackofficePageHeader
                    title={t('app.navigation.orders')}
                    description={t('dispatcher.orders.description')}
                    actions={
                        <>
                            <a
                                href={`/dispatcher/orders/export${exportQuery ? `?${exportQuery}` : ''}`}
                                className={backofficeButtonClassName('outline')}
                            >
                                CSV
                            </a>
                            <BackofficeActionLink href="/dispatcher/orders/create">
                                {t('dispatcher.orders.create_title')}
                            </BackofficeActionLink>
                        </>
                    }
                />

                <BackofficeCard>
                    <div className="border-b border-[#e5e7eb] px-5 py-4">
                        <div className="mb-4 text-[13px] font-semibold tracking-[0.07em] text-[#6b7280] uppercase">
                            {t('dispatcher.filters.filters')}
                        </div>

                        <div className="grid gap-4 xl:grid-cols-[2fr_1fr_1fr_auto] xl:items-end">
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-semibold text-[#6b7280]">
                                    {t('dispatcher.filters.search')}
                                </span>
                                <div className="relative">
                                    <input
                                        id="search"
                                        name="search"
                                        type="text"
                                        value={draftSearch}
                                        onChange={(event) =>
                                            setDraftSearch(event.target.value)
                                        }
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter') {
                                                event.preventDefault();
                                                commitSearch();
                                            }
                                        }}
                                        className={`${backofficeInputClassName} pr-24`}
                                        placeholder={t(
                                            'dispatcher.orders.placeholder',
                                        )}
                                    />
                                    {draftSearch.trim() !== '' ? (
                                        <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded-md border border-[#bfdbfe] bg-[#eff6ff] px-2 py-1 text-[11px] font-semibold text-[#1e40af]">
                                            {t('dispatcher.filters.enter')}
                                        </span>
                                    ) : null}
                                </div>
                            </label>

                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-semibold text-[#6b7280]">
                                    {t('common.fields.date')}
                                </span>
                                <input
                                    id="date"
                                    name="date"
                                    type="date"
                                    value={filterForm.data.date}
                                    onChange={(event) =>
                                        filterForm.setData(
                                            'date',
                                            event.target.value,
                                        )
                                    }
                                    className={backofficeInputClassName}
                                />
                            </label>

                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-semibold text-[#6b7280]">
                                    {t('common.fields.status')}
                                </span>
                                <select
                                    id="status"
                                    name="status"
                                    value={filterForm.data.status}
                                    onChange={(event) =>
                                        filterForm.setData(
                                            'status',
                                            event.target.value,
                                        )
                                    }
                                    className={backofficeSelectClassName}
                                >
                                    <option value="">
                                        {t('dispatcher.filters.all_statuses')}
                                    </option>
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {t(
                                                `common.statuses.${status.toLowerCase()}`,
                                            )}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <button
                                type="button"
                                onClick={clearFilters}
                                className={backofficeButtonClassName(
                                    'outline',
                                    'sm',
                                )}
                            >
                                {t('common.actions.clear')}
                            </button>
                        </div>

                        <div className="mt-4 grid gap-4 lg:grid-cols-1 lg:items-end">
                            {canFilterByOrganization ? (
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-xs font-semibold text-[#6b7280]">
                                        {t('common.fields.organization')}
                                    </span>
                                    <select
                                        id="organization_id"
                                        name="organization_id"
                                        value={filterForm.data.organization_id}
                                        onChange={(event) =>
                                            filterForm.setData(
                                                'organization_id',
                                                event.target.value,
                                            )
                                        }
                                        className={backofficeSelectClassName}
                                    >
                                        <option value="">
                                            {t(
                                                'dispatcher.filters.all_organizations',
                                            )}
                                        </option>
                                        {organizations.map((organization) => (
                                            <option
                                                key={organization.id}
                                                value={String(organization.id)}
                                            >
                                                {organization.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            ) : null}
                        </div>

                        {activeFilters.length > 0 ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {activeFilters.map((filter) => (
                                    <button
                                        key={`${filter.key}:${filter.value ?? filter.label}`}
                                        type="button"
                                        onClick={() => {
                                            if (filter.key === 'search') {
                                                removeSearchTerm(
                                                    filter.value ?? '',
                                                );
                                                return;
                                            }

                                            filterForm.setData(filter.key, '');
                                        }}
                                        className="inline-flex items-center gap-2 rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-3 py-1 text-xs font-medium text-[#1e40af]"
                                    >
                                        {filter.label}
                                        <span className="text-[#2563eb]">
                                            x
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    <BackofficeResultsBar
                        count={orders.length}
                        noun={t('dispatcher.nouns.orders')}
                        sortValue={filterForm.data.sort}
                        onSortChange={(value) =>
                            filterForm.setData('sort', value)
                        }
                        sortOptions={sortOptions}
                    />

                    {orders.length === 0 ? (
                        <BackofficeEmptyState
                            title={t('dispatcher.orders.empty_title')}
                            description={t(
                                'dispatcher.orders.empty_description',
                            )}
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                                        <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase">
                                            {t('common.fields.client')}
                                        </th>
                                        <th className="hidden px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase md:table-cell">
                                            {t('common.fields.address')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase">
                                            {t('common.fields.date')}
                                        </th>
                                        <th className="hidden px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase lg:table-cell">
                                            {t('common.fields.time_window')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase">
                                            {t('common.fields.status')}
                                        </th>
                                        <th className="hidden px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase lg:table-cell">
                                            {t('common.fields.notes')}
                                        </th>
                                        <th className="px-4 py-3 text-right text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="border-b border-[#e5e7eb] transition hover:bg-[#f9fbff]"
                                        >
                                            <td className="px-4 py-4">
                                                <Link
                                                    href={`/dispatcher/orders/${order.id}/edit`}
                                                    className="font-semibold text-[#111827] hover:text-[#2563eb]"
                                                >
                                                    {order.client_name ?? '-'}
                                                </Link>
                                                <div className="mt-0.5 text-xs text-[#6b7280]">
                                                    #{order.id}
                                                </div>
                                            </td>
                                            <td className="hidden px-4 py-4 text-[#6b7280] md:table-cell">
                                                {order.address_label}
                                            </td>
                                            <td className="px-4 py-4 text-[#111827]">
                                                {formatShortDate(order.date)}
                                            </td>
                                            <td className="hidden px-4 py-4 font-mono text-[13px] text-[#6b7280] lg:table-cell">
                                                {order.time_from.slice(0, 5)} -{' '}
                                                {order.time_to.slice(0, 5)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <BackofficeStatusBadge
                                                    status={order.status}
                                                />
                                            </td>
                                            <td className="hidden max-w-[180px] px-4 py-4 text-[#6b7280] lg:table-cell">
                                                <div className="truncate text-[13px]">
                                                    {order.notes || '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-1">
                                                    {order.route_id ? (
                                                        <BackofficeIconButton
                                                            asChild
                                                            title={t(
                                                                'dispatcher.orders.open_route',
                                                                {
                                                                    id: order.route_id,
                                                                },
                                                            )}
                                                            aria-label={t(
                                                                'dispatcher.orders.open_route',
                                                                {
                                                                    id: order.route_id,
                                                                },
                                                            )}
                                                        >
                                                            <Link
                                                                href={`/dispatcher/routes/${order.route_id}`}
                                                            >
                                                                <RouteIcon className="h-3.5 w-3.5" />
                                                            </Link>
                                                        </BackofficeIconButton>
                                                    ) : null}
                                                    <BackofficeIconButton
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/dispatcher/orders/${order.id}/edit`}
                                                        >
                                                            <EditIcon />
                                                        </Link>
                                                    </BackofficeIconButton>
                                                    {order.can_cancel ? (
                                                        <BackofficeIconButton
                                                            type="button"
                                                            onClick={(event) =>
                                                                cancelOrder(
                                                                    order.id,
                                                                    event.currentTarget,
                                                                )
                                                            }
                                                            disabled={
                                                                actionForm.processing
                                                            }
                                                            title={t(
                                                                'dispatcher.orders.cancel_order',
                                                            )}
                                                            aria-label={t(
                                                                'dispatcher.orders.cancel_order',
                                                            )}
                                                        >
                                                            <XCircle className="h-3.5 w-3.5" />
                                                        </BackofficeIconButton>
                                                    ) : null}
                                                    <BackofficeIconButton
                                                        type="button"
                                                        variant="danger"
                                                        onClick={(event) =>
                                                            deleteOrder(
                                                                order,
                                                                event.currentTarget,
                                                            )
                                                        }
                                                        disabled={
                                                            actionForm.processing
                                                        }
                                                        title={
                                                            order.can_delete
                                                                ? t(
                                                                      'dispatcher.orders.delete_order',
                                                                  )
                                                                : t(
                                                                      'dispatcher.orders.delete_blocked',
                                                                  )
                                                        }
                                                        aria-label={
                                                            order.can_delete
                                                                ? t(
                                                                      'dispatcher.orders.delete_order',
                                                                  )
                                                                : t(
                                                                      'dispatcher.orders.delete_blocked',
                                                                  )
                                                        }
                                                    >
                                                        <DeleteIcon />
                                                    </BackofficeIconButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </BackofficeCard>
            </BackofficePage>

            {actionPopup ? (
                <div
                    key={actionPopup.id}
                    role="status"
                    aria-live="polite"
                    style={
                        actionPopup.position
                            ? {
                                  left: actionPopup.position.left,
                                  top: actionPopup.position.top,
                              }
                            : undefined
                    }
                    className={`pointer-events-none fixed z-[60] max-w-[min(320px,calc(100vw-2rem))] rounded-lg border border-[#fecaca] bg-white px-4 py-3 text-sm font-medium text-[#991b1b] shadow-[0_18px_40px_rgba(17,24,39,0.16)] transition duration-250 ease-out ${
                        actionPopup.position ? '' : 'top-20 right-4'
                    } ${
                        actionPopup.visible
                            ? actionPopup.position
                                ? '-translate-y-1/2 opacity-100'
                                : 'translate-y-0 opacity-100'
                            : actionPopup.position
                              ? '-translate-y-[calc(50%+0.25rem)] opacity-0'
                              : '-translate-y-2 opacity-0'
                    }`}
                >
                    {actionPopup.message}
                </div>
            ) : null}

            <ConfirmActionDialog
                open={pendingAction !== null}
                description={
                    pendingAction?.kind === 'cancel'
                        ? t('dispatcher.orders.cancel_confirm')
                        : t('dispatcher.orders.delete_confirm')
                }
                confirmLabel={
                    pendingAction?.kind === 'cancel'
                        ? t('dispatcher.orders.cancel_order')
                        : t('dispatcher.orders.delete_order')
                }
                processing={actionForm.processing}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingAction(null);
                    }
                }}
                onConfirm={() => {
                    if (!pendingAction) {
                        return;
                    }

                    setActionPopup(null);

                    if (pendingAction.kind === 'cancel') {
                        actionForm.patch(
                            `/dispatcher/orders/${pendingAction.orderId}/cancel`,
                            {
                                preserveScroll: true,
                                onFinish: () => setPendingAction(null),
                            },
                        );

                        return;
                    }

                    actionForm.delete(
                        `/dispatcher/orders/${pendingAction.orderId}`,
                        {
                            preserveScroll: true,
                            onFinish: () => setPendingAction(null),
                        },
                    );
                }}
            />
        </AppLayout>
    );
}
