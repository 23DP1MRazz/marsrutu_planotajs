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
    DeleteIcon,
    EditIcon,
    backofficeButtonClassName,
    backofficeInputClassName,
} from '@/components/backoffice/ui';
import { useLiveFiltering } from '@/hooks/use-live-filtering';
import AppLayout from '@/layouts/app-layout';
import type { ClientFilters, ClientRecord } from '@/types/dispatcher';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Clients', href: '/dispatcher/clients' },
];

const sortOptions = [
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
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

type DispatcherClientsIndexProps = {
    clients: ClientRecord[];
    filters: ClientFilters;
};

export default function DispatcherClientsIndex({
    clients,
    filters,
}: DispatcherClientsIndexProps) {
    const filterForm = useForm({
        search: filters.search ?? '',
        sort: filters.sort ?? 'name_asc',
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
        url: '/dispatcher/clients',
    });

    const deleteClient = (clientId: number) => {
        if (window.confirm('Delete this client?')) {
            router.delete(`/dispatcher/clients/${clientId}`);
        }
    };

    const clearFilters = () => {
        setDraftSearch('');
        filterForm.setData({
            search: '',
            sort: 'name_asc',
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clients" />

            <BackofficePage>
                <BackofficePageHeader
                    title="Clients"
                    description="Manage client records for your organization."
                    actions={
                        <BackofficeActionLink href="/dispatcher/clients/create">
                            Create Client
                        </BackofficeActionLink>
                    }
                />

                <BackofficeCard>
                    <div className="border-b border-[#e5e7eb] px-5 py-4">
                        <div className="mb-4 text-[13px] font-semibold tracking-[0.07em] text-[#6b7280] uppercase">
                            Filters
                        </div>
                        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
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
                                        placeholder="Name, phone..."
                                    />
                                    {draftSearch.trim() !== '' ? (
                                        <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded-md border border-[#bfdbfe] bg-[#eff6ff] px-2 py-1 text-[11px] font-semibold text-[#1e40af]">
                                            Enter
                                        </span>
                                    ) : null}
                                </div>
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
                        {searchTerms.length > 0 ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {searchTerms.map((term) => (
                                    <button
                                        key={term}
                                        type="button"
                                        onClick={() => removeSearchTerm(term)}
                                        className="inline-flex items-center gap-2 rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-3 py-1 text-xs font-medium text-[#1e40af]"
                                    >
                                        Search: {term}
                                        <span className="text-[#2563eb]">
                                            x
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    <BackofficeResultsBar
                        count={clients.length}
                        noun="clients"
                        sortValue={filterForm.data.sort}
                        onSortChange={(value) =>
                            filterForm.setData('sort', value)
                        }
                        sortOptions={sortOptions}
                    />

                    {clients.length === 0 ? (
                        <BackofficeEmptyState
                            title="No clients created yet"
                            description="Create your first client to start organizing deliveries."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                                        <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase">
                                            Phone
                                        </th>
                                        <th className="px-4 py-3 text-right text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.map((client) => (
                                        <tr
                                            key={client.id}
                                            className="border-b border-[#e5e7eb] transition hover:bg-[#f9fbff]"
                                        >
                                            <td className="px-4 py-4">
                                                <Link
                                                    href={`/dispatcher/clients/${client.id}/edit`}
                                                    className="font-semibold text-[#111827] hover:text-[#2563eb]"
                                                >
                                                    {client.name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-4 text-[#6b7280]">
                                                {client.phone}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-1">
                                                    <BackofficeIconButton
                                                        asChild
                                                    >
                                                        <Link
                                                            href={`/dispatcher/clients/${client.id}/edit`}
                                                        >
                                                            <EditIcon />
                                                        </Link>
                                                    </BackofficeIconButton>
                                                    <BackofficeIconButton
                                                        type="button"
                                                        variant="danger"
                                                        onClick={() =>
                                                            deleteClient(
                                                                client.id,
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
