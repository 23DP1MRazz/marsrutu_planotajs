import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    CourierEmptyState,
    CourierMobileBody,
    CourierMobileHeader,
} from '@/components/courier/mobile-ui';
import {
    BackofficeCard,
    BackofficePage,
    BackofficePageHeader,
    BackofficeResultsBar,
    BackofficeStatusBadge,
    backofficeButtonClassName,
    backofficeInputClassName,
} from '@/components/backoffice/ui';
import { useLiveFiltering } from '@/hooks/use-live-filtering';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { formatShortDate } from '@/lib/date';
import { joinSearchTerms, splitSearchTerms } from '@/lib/search-terms';
import type {
    CourierCompletedOrderFilters,
    CourierCompletedOrderRecord,
} from '@/types/courier';

type CourierCompletedOrdersPageProps = {
    orders: CourierCompletedOrderRecord[];
    filters: CourierCompletedOrderFilters;
};

const sortOptions = [
    { value: 'completed_desc', label: 'Completed (newest)' },
    { value: 'completed_asc', label: 'Completed (oldest)' },
    { value: 'route_date_desc', label: 'Route date (newest)' },
    { value: 'route_date_asc', label: 'Route date (oldest)' },
];

export default function CourierCompletedOrdersPage({
    orders,
    filters,
}: CourierCompletedOrdersPageProps) {
    const { t } = useTranslation();
    const isMobile = useIsMobile();
    const filterForm = useForm({
        search: filters.search ?? '',
        date: filters.date ?? '',
        sort: filters.sort ?? 'completed_desc',
    });
    const [draftSearch, setDraftSearch] = useState('');
    const searchTerms = splitSearchTerms(filterForm.data.search);
    const liveSearch = joinSearchTerms([
        ...searchTerms,
        ...(draftSearch.trim() === '' ? [] : [draftSearch.trim()]),
    ]);

    useLiveFiltering({
        data: {
            ...filterForm.data,
            search: liveSearch,
        },
        url: '/courier/orders/completed',
    });

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

    const clearFilters = () => {
        setDraftSearch('');
        filterForm.setData({
            search: '',
            date: '',
            sort: 'completed_desc',
        });
    };

    if (!isMobile) {
        return (
            <AppLayout breadcrumbs={[]}>
                <Head title={t('courier.completed_orders.title')} />

                <BackofficePage>
                    <BackofficePageHeader
                        title={t('courier.completed_orders.title')}
                        description={t('courier.completed_orders.description')}
                    />

                    <BackofficeCard>
                        <div className="grid gap-4 border-b border-[#e5e7eb] px-5 py-4 md:grid-cols-[1fr_180px_auto] md:items-end">
                            <input
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
                                placeholder="Order, route, client, address..."
                                className={backofficeInputClassName}
                            />
                            <input
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

                        <BackofficeResultsBar
                            count={orders.length}
                            noun="orders"
                            sortValue={filterForm.data.sort}
                            onSortChange={(value) =>
                                filterForm.setData('sort', value)
                            }
                            sortOptions={sortOptions}
                        />

                        <div className="space-y-3 p-5">
                            {orders.length === 0 ? (
                                <CourierEmptyState
                                    title={t('courier.completed_orders.empty')}
                                    description={t(
                                        'courier.completed_orders.description',
                                    )}
                                />
                            ) : (
                                orders.map((order) => (
                                    <section
                                        key={order.route_stop_id}
                                        className="rounded-xl border border-[#e5e7eb] px-4 py-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-[15px] font-semibold text-[#111827]">
                                                    {order.client_name ??
                                                        t(
                                                            'courier.stop.order_number',
                                                            {
                                                                id: order.order_id,
                                                            },
                                                        )}
                                                </p>
                                                <p className="mt-1 text-sm text-[#6b7280]">
                                                    {order.address_label || '-'}
                                                </p>
                                            </div>
                                            <BackofficeStatusBadge
                                                status={order.status}
                                            />
                                        </div>

                                        <div className="mt-3 space-y-1 text-sm text-[#6b7280]">
                                            <p>
                                                {t(
                                                    'courier.completed_orders.route_date',
                                                    {
                                                        date: order.route_date
                                                            ? formatShortDate(
                                                                  order.route_date,
                                                              )
                                                            : '-',
                                                    },
                                                )}
                                            </p>
                                            <p>
                                                {t(
                                                    'courier.completed_orders.completed',
                                                    {
                                                        date: order.completed_at
                                                            ? formatShortDate(
                                                                  order.completed_at,
                                                              )
                                                            : '-',
                                                    },
                                                )}
                                            </p>
                                        </div>
                                    </section>
                                ))
                            )}
                        </div>
                    </BackofficeCard>
                </BackofficePage>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title={t('courier.completed_orders.title')} />

            <CourierMobileHeader
                title={t('courier.completed_orders.title')}
                subtitle={t('courier.completed_orders.description')}
                backHref="/dashboard"
            />

            <CourierMobileBody>
                <section className="rounded-2xl border border-[#e5e7eb] bg-white">
                    <div className="border-b border-[#e5e7eb] px-4 py-4">
                        <div className="mb-3 text-[11px] font-semibold tracking-[0.07em] text-[#6b7280] uppercase">
                            Filters
                        </div>
                        <div className="space-y-3">
                            <div className="relative">
                                <input
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
                                    placeholder="Order, route, client, address..."
                                    className={`${backofficeInputClassName} pr-28`}
                                />
                                {draftSearch.trim() !== '' ? (
                                    <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded-md border border-[#bfdbfe] bg-[#eff6ff] px-2 py-1 text-[11px] font-semibold text-[#1e40af]">
                                        Live - Enter
                                    </span>
                                ) : null}
                            </div>
                            <div className="grid grid-cols-[1fr_auto] gap-2">
                                <input
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
                        </div>

                        {searchTerms.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {searchTerms.map((term) => (
                                    <button
                                        key={term}
                                        type="button"
                                        onClick={() =>
                                            filterForm.setData(
                                                'search',
                                                joinSearchTerms(
                                                    searchTerms.filter(
                                                        (value) =>
                                                            value !== term,
                                                    ),
                                                ),
                                            )
                                        }
                                        className="rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-3 py-1 text-xs font-medium text-[#1e40af]"
                                    >
                                        {t('dispatcher.orders.search_tag', {
                                            term,
                                        })}{' '}
                                        ×
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                        <p className="text-sm text-[#6b7280]">
                            {orders.length} orders
                        </p>
                        <select
                            value={filterForm.data.sort}
                            onChange={(event) =>
                                filterForm.setData('sort', event.target.value)
                            }
                            className="h-8 rounded-lg border border-[#e5e7eb] bg-white px-3 text-[13px] text-[#111827]"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </section>
            </CourierMobileBody>

            <div className="flex flex-col gap-2.5 px-3.5 pb-5">
                {orders.length === 0 ? (
                    <CourierEmptyState
                        title={t('courier.completed_orders.empty')}
                        description={t('courier.completed_orders.description')}
                    />
                ) : (
                    orders.map((order) => (
                        <section
                            key={order.route_stop_id}
                            className="rounded-2xl border border-[#e5e7eb] bg-white px-4 py-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[15px] font-semibold text-[#111827]">
                                        {order.client_name ??
                                            t('courier.stop.order_number', {
                                                id: order.order_id,
                                            })}
                                    </p>
                                    <p className="mt-1 text-sm text-[#6b7280]">
                                        {order.address_label || '-'}
                                    </p>
                                </div>
                                <BackofficeStatusBadge status={order.status} />
                            </div>

                            <div className="mt-3 space-y-1 text-sm text-[#6b7280]">
                                <p>
                                    {t('courier.completed_orders.route_date', {
                                        date: order.route_date
                                            ? formatShortDate(order.route_date)
                                            : '-',
                                    })}
                                </p>
                                <p>
                                    {t('courier.completed_orders.completed', {
                                        date: order.completed_at
                                            ? formatShortDate(
                                                  order.completed_at,
                                              )
                                            : '-',
                                    })}
                                </p>
                            </div>

                            {order.proof_view_url ? (
                                <div className="mt-3">
                                    <a
                                        href={order.proof_view_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm font-semibold text-[#2563eb]"
                                    >
                                        {t(
                                            'courier.completed_orders.open_proof',
                                        )}
                                    </a>
                                </div>
                            ) : null}
                        </section>
                    ))
                )}
            </div>
        </AppLayout>
    );
}
