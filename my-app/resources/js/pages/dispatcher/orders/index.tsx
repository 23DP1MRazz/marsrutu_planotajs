import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
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
import { useLiveFiltering } from '@/hooks/use-live-filtering';
import AppLayout from '@/layouts/app-layout';
import { formatShortDate } from '@/lib/date';
import type {
    OrderFilters,
    OrderRecord,
    OrganizationOption,
} from '@/types/dispatcher';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Orders', href: '/dispatcher/orders' },
];

const sortOptions = [
    { value: 'date_desc', label: 'Date (newest)' },
    { value: 'date_asc', label: 'Date (oldest)' },
    { value: 'time_asc', label: 'Time (earliest)' },
    { value: 'time_desc', label: 'Time (latest)' },
    { value: 'status_asc', label: 'Status (A-Z)' },
    { value: 'status_desc', label: 'Status (Z-A)' },
    { value: 'updated_desc', label: 'Updated (newest)' },
    { value: 'updated_asc', label: 'Updated (oldest)' },
];

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

    useLiveFiltering({
        data: {
            ...filterForm.data,
            search: liveSearch,
        },
        url: '/dispatcher/orders',
    });

    const deleteOrder = (orderId: number) => {
        if (window.confirm('Delete this order?')) {
            router.delete(`/dispatcher/orders/${orderId}`);
        }
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
                label: `Search: ${term}`,
            })),
            filterForm.data.date
                ? {
                      key: 'date' as const,
                      label: `Date: ${formatShortDate(filterForm.data.date)}`,
                  }
                : null,
            filterForm.data.status
                ? {
                      key: 'status' as const,
                      label: `Status: ${filterForm.data.status}`,
                  }
                : null,
            canFilterByOrganization && filterForm.data.organization_id
                ? {
                      key: 'organization_id' as const,
                      label: `Organization: ${
                          organizations.find(
                              (organization) =>
                                  String(organization.id) ===
                                  filterForm.data.organization_id,
                          )?.name ?? filterForm.data.organization_id
                      }`,
                  }
                : null,
        ] as Array<ActiveFilter | null>
    ).filter((value): value is ActiveFilter => value !== null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />

            <BackofficePage>
                <BackofficePageHeader
                    title="Orders"
                    description="Manage delivery orders for your organization."
                    actions={
                        <>
                            <a
                                href={`/dispatcher/orders/export${exportQuery ? `?${exportQuery}` : ''}`}
                                className={backofficeButtonClassName('outline')}
                            >
                                Export CSV
                            </a>
                            <BackofficeActionLink href="/dispatcher/orders/create">
                                Create Order
                            </BackofficeActionLink>
                        </>
                    }
                />

                <BackofficeCard>
                    <div className="border-b border-[#e5e7eb] px-5 py-4">
                        <div className="mb-4 text-[13px] font-semibold tracking-[0.07em] text-[#6b7280] uppercase">
                            Filters
                        </div>

                        <div className="grid gap-4 xl:grid-cols-[2fr_1fr_1fr_auto] xl:items-end">
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-semibold text-[#6b7280]">
                                    Search
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
                                        placeholder="Client, address, date, status, notes..."
                                    />
                                    {draftSearch.trim() !== '' ? (
                                        <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded-md border border-[#bfdbfe] bg-[#eff6ff] px-2 py-1 text-[11px] font-semibold text-[#1e40af]">
                                            Enter
                                        </span>
                                    ) : null}
                                </div>
                            </label>

                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-semibold text-[#6b7280]">
                                    Date
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
                                    Status
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
                                    <option value="">All statuses</option>
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
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
                                Clear
                            </button>
                        </div>

                        <div className="mt-4 grid gap-4 lg:grid-cols-1 lg:items-end">
                            {canFilterByOrganization ? (
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-xs font-semibold text-[#6b7280]">
                                        Organization
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
                                            All organizations
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
                        noun="orders"
                        sortValue={filterForm.data.sort}
                        onSortChange={(value) =>
                            filterForm.setData('sort', value)
                        }
                        sortOptions={sortOptions}
                    />

                    {orders.length === 0 ? (
                        <BackofficeEmptyState
                            title="No orders found"
                            description="Adjust the filters or create a new order."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                                        <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase">
                                            Client
                                        </th>
                                        <th className="hidden px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase md:table-cell">
                                            Address
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase">
                                            Date
                                        </th>
                                        <th className="hidden px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase lg:table-cell">
                                            Time Window
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase">
                                            Status
                                        </th>
                                        <th className="hidden px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase lg:table-cell">
                                            Notes
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
                                                    <BackofficeIconButton
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/dispatcher/orders/${order.id}/edit`}
                                                        >
                                                            <EditIcon />
                                                        </Link>
                                                    </BackofficeIconButton>
                                                    <BackofficeIconButton
                                                        type="button"
                                                        variant="danger"
                                                        onClick={() =>
                                                            deleteOrder(
                                                                order.id,
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
        </AppLayout>
    );
}
