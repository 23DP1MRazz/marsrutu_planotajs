import { Head, Link, useForm } from '@inertiajs/react';
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
    CourierRouteListFilters,
    CourierRouteListRecord,
} from '@/types/courier';

type CourierRoutesPageProps = {
    title: string;
    description: string;
    emptyMessage: string;
    routes: CourierRouteListRecord[];
    filters: CourierRouteListFilters;
};

const completedSortOptions = [
    { value: 'date_desc', label: 'Date (newest)' },
    { value: 'date_asc', label: 'Date (oldest)' },
    { value: 'stops_desc', label: 'Stops (high-low)' },
    { value: 'stops_asc', label: 'Stops (low-high)' },
];

const upcomingSortOptions = [
    { value: 'date_asc', label: 'Date (soonest)' },
    { value: 'date_desc', label: 'Date (latest)' },
    { value: 'stops_desc', label: 'Stops (high-low)' },
    { value: 'stops_asc', label: 'Stops (low-high)' },
];

export default function CourierRoutesPage({
    title,
    routes,
    filters,
}: CourierRoutesPageProps) {
    const { t } = useTranslation();
    const isMobile = useIsMobile();
    const isCompletedPage = title === 'Done routes';
    const translatedTitle = isCompletedPage
        ? t('courier.routes.completed_title')
        : t('courier.routes.upcoming_title');
    const translatedDescription = isCompletedPage
        ? t('courier.routes.completed_description')
        : t('courier.routes.upcoming_description');
    const translatedEmptyMessage = isCompletedPage
        ? t('courier.routes.completed_empty')
        : t('courier.routes.upcoming_empty');
    const currentPath = isCompletedPage
        ? '/courier/routes/completed'
        : '/courier/routes/upcoming';
    const sortOptions = isCompletedPage
        ? completedSortOptions
        : upcomingSortOptions;
    const filterForm = useForm({
        search: filters.search ?? '',
        date: filters.date ?? '',
        sort: filters.sort ?? sortOptions[0].value,
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
        url: currentPath,
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
            sort: sortOptions[0].value,
        });
    };

    if (!isMobile) {
        return (
            <AppLayout breadcrumbs={[]}>
                <Head title={translatedTitle} />

                <BackofficePage>
                    <BackofficePageHeader
                        title={translatedTitle}
                        description={translatedDescription}
                        actions={
                            <Link
                                href="/dashboard"
                                className={backofficeButtonClassName('outline')}
                            >
                                {t('common.actions.back_to_dashboard')}
                            </Link>
                        }
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
                                placeholder="Route ID, date, status..."
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
                            count={routes.length}
                            noun="routes"
                            sortValue={filterForm.data.sort}
                            onSortChange={(value) =>
                                filterForm.setData('sort', value)
                            }
                            sortOptions={sortOptions}
                        />

                        <div className="space-y-3 p-5">
                            {routes.length === 0 ? (
                                <CourierEmptyState
                                    title={translatedEmptyMessage}
                                    description={translatedDescription}
                                />
                            ) : (
                                routes.map((deliveryRoute) => (
                                    <Link
                                        key={deliveryRoute.id}
                                        href={deliveryRoute.href}
                                        className="block rounded-xl border border-[#e5e7eb] px-4 py-4 transition hover:border-[#3b82f6] hover:bg-[#f9fbff]"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-[15px] font-semibold text-[#111827]">
                                                    Route #{deliveryRoute.id}
                                                </p>
                                                <p className="mt-1 text-sm text-[#6b7280]">
                                                    {formatShortDate(
                                                        deliveryRoute.date,
                                                    )}
                                                </p>
                                                <p className="mt-1 text-sm text-[#6b7280]">
                                                    {t(
                                                        'courier.routes.planned_stops',
                                                        {
                                                            count: deliveryRoute.stops_count,
                                                        },
                                                    )}
                                                </p>
                                            </div>
                                            <BackofficeStatusBadge
                                                status={deliveryRoute.status}
                                            />
                                        </div>
                                    </Link>
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
            <Head title={translatedTitle} />

            <CourierMobileHeader
                title={translatedTitle}
                subtitle={translatedDescription}
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
                                    placeholder="Route ID, date, status..."
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
                                        {t('dispatcher.clients.search_tag', {
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
                            {routes.length} routes
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
                {routes.length === 0 ? (
                    <CourierEmptyState
                        title={translatedEmptyMessage}
                        description={translatedDescription}
                    />
                ) : (
                    routes.map((deliveryRoute) => (
                        <Link
                            key={deliveryRoute.id}
                            href={deliveryRoute.href}
                            className="rounded-2xl border border-[#e5e7eb] bg-white px-4 py-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[15px] font-semibold text-[#111827]">
                                        Route #{deliveryRoute.id}
                                    </p>
                                    <p className="mt-1 text-sm text-[#6b7280]">
                                        {formatShortDate(deliveryRoute.date)}
                                    </p>
                                    <p className="mt-1 text-sm text-[#6b7280]">
                                        {t('courier.routes.planned_stops', {
                                            count: deliveryRoute.stops_count,
                                        })}
                                    </p>
                                </div>
                                <BackofficeStatusBadge
                                    status={deliveryRoute.status}
                                />
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </AppLayout>
    );
}
