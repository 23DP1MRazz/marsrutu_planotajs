import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    BackofficeActionLink,
    BackofficeCard,
    BackofficeEmptyState,
    BackofficePage,
    BackofficePageHeader,
    BackofficeResultsBar,
    BackofficeStatusBadge,
    backofficeButtonClassName,
    backofficeInputClassName,
    backofficeSelectClassName,
} from '@/components/backoffice/ui';
import { useLiveFiltering } from '@/hooks/use-live-filtering';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { formatShortDate } from '@/lib/date';
import type { BreadcrumbItem } from '@/types';
import type {
    DeliveryRouteRecord,
    OrganizationOption,
    RouteFilters,
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

type DispatcherRoutesIndexProps = {
    deliveryRoutes: DeliveryRouteRecord[];
    filters: RouteFilters;
    statuses: string[];
    organizations: OrganizationOption[];
    canFilterByOrganization: boolean;
};

type ActiveFilter = {
    key: 'search' | 'date' | 'status' | 'organization_id';
    label: string;
    value?: string;
};

export default function DispatcherRoutesIndex({
    deliveryRoutes,
    filters,
    statuses,
    organizations,
    canFilterByOrganization,
}: DispatcherRoutesIndexProps) {
    const { t } = useTranslation();
    const filterForm = useForm({
        search: filters.search ?? '',
        date: filters.date ?? '',
        status: filters.status ?? '',
        organization_id: filters.organization_id ?? '',
        sort: filters.sort ?? 'date_desc',
    });
    const [draftSearch, setDraftSearch] = useState('');
    const searchTerms = splitSearchTerms(filterForm.data.search);
    const liveSearch = joinSearchTerms([
        ...searchTerms,
        ...(draftSearch.trim() === '' ? [] : [draftSearch.trim()]),
    ]);
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('dashboard.title'), href: '/dashboard' },
        { title: t('app.navigation.routes'), href: '/dispatcher/routes' },
    ];
    const sortOptions = [
        { value: 'date_desc', label: t('dispatcher.sort.date_desc') },
        { value: 'date_asc', label: t('dispatcher.sort.date_asc') },
        { value: 'courier_asc', label: t('dispatcher.sort.courier_asc') },
        { value: 'courier_desc', label: t('dispatcher.sort.courier_desc') },
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
        url: '/dispatcher/routes',
    });

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
            <Head title={t('app.navigation.routes')} />

            <BackofficePage>
                <BackofficePageHeader
                    title={t('app.navigation.routes')}
                    description={t('dispatcher.routes.description')}
                    actions={
                        <>
                            <a
                                href={`/dispatcher/routes/export${exportQuery ? `?${exportQuery}` : ''}`}
                                className={backofficeButtonClassName('outline')}
                            >
                                CSV
                            </a>
                            <BackofficeActionLink href="/dispatcher/routes/create">
                                {t('dispatcher.routes.create_title')}
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
                                            'dispatcher.routes.placeholder',
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
                        count={deliveryRoutes.length}
                        noun={t('dispatcher.nouns.routes')}
                        sortValue={filterForm.data.sort}
                        onSortChange={(value) =>
                            filterForm.setData('sort', value)
                        }
                        sortOptions={sortOptions}
                    />

                    {deliveryRoutes.length === 0 ? (
                        <BackofficeEmptyState
                            title={t('dispatcher.routes.empty_title')}
                            description={t(
                                'dispatcher.routes.empty_description',
                            )}
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                                        <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase">
                                            {t('common.fields.courier')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase">
                                            {t('common.fields.date')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase">
                                            {t('common.fields.status')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase">
                                            {t('common.fields.stops')}
                                        </th>
                                        <th className="px-4 py-3 text-right text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase">
                                            {t('common.fields.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deliveryRoutes.map((deliveryRoute) => (
                                        <tr
                                            key={deliveryRoute.id}
                                            className="border-b border-[#e5e7eb] transition hover:bg-[#f9fbff]"
                                        >
                                            <td className="px-4 py-4">
                                                <Link
                                                    href={`/dispatcher/routes/${deliveryRoute.id}`}
                                                    className="font-semibold text-[#111827] hover:text-[#2563eb]"
                                                >
                                                    {deliveryRoute.courier_name ??
                                                        t(
                                                            'dispatcher.routes.unassigned_courier',
                                                        )}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-4 text-[#111827]">
                                                {formatShortDate(
                                                    deliveryRoute.date,
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <BackofficeStatusBadge
                                                    status={
                                                        deliveryRoute.status
                                                    }
                                                />
                                            </td>
                                            <td className="px-4 py-4 text-[#6b7280]">
                                                {deliveryRoute.stops_count}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/dispatcher/routes/${deliveryRoute.id}`}
                                                        className={backofficeButtonClassName(
                                                            'outline',
                                                            'sm',
                                                        )}
                                                    >
                                                        {t(
                                                            'dispatcher.routes.open',
                                                        )}
                                                    </Link>
                                                    <a
                                                        href={`/dispatcher/routes/${deliveryRoute.id}/print`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className={backofficeButtonClassName(
                                                            'outline',
                                                            'sm',
                                                        )}
                                                    >
                                                        {t(
                                                            'dispatcher.routes.print',
                                                        )}
                                                    </a>
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
        </AppLayout>
    );
}
