import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
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
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import {
    type ActionPopup,
    type PopupPosition,
    popupPositionFromElement,
} from '@/lib/action-popup';
import type { ClientFilters, ClientRecord } from '@/types/dispatcher';
import type { BreadcrumbItem } from '@/types';

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
    const { t } = useTranslation();
    const filterForm = useForm({
        search: filters.search ?? '',
        sort: filters.sort ?? 'name_asc',
    });
    const actionForm = useForm({});
    const actionErrors = actionForm.errors as Record<
        string,
        string | undefined
    >;
    const [draftSearch, setDraftSearch] = useState('');
    const [actionPopup, setActionPopup] = useState<ActionPopup | null>(null);
    const [lastActionPosition, setLastActionPosition] =
        useState<PopupPosition | null>(null);
    const searchTerms = splitSearchTerms(filterForm.data.search);
    const liveSearch = joinSearchTerms([
        ...searchTerms,
        ...(draftSearch.trim() === '' ? [] : [draftSearch.trim()]),
    ]);
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('dashboard.title'), href: '/dashboard' },
        { title: t('app.navigation.clients'), href: '/dispatcher/clients' },
    ];
    const sortOptions = [
        { value: 'name_asc', label: t('dispatcher.sort.name_asc') },
        { value: 'name_desc', label: t('dispatcher.sort.name_desc') },
        { value: 'updated_desc', label: t('dispatcher.sort.updated_desc') },
        { value: 'updated_asc', label: t('dispatcher.sort.updated_asc') },
    ];

    useLiveFiltering({
        data: {
            ...filterForm.data,
            search: liveSearch,
        },
        url: '/dispatcher/clients',
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
        if (!actionErrors.client) {
            return;
        }

        setActionPopup({
            id: Date.now(),
            message: actionErrors.client,
            position: lastActionPosition ?? undefined,
            visible: true,
        });
    }, [actionErrors.client, lastActionPosition]);

    const deleteClient = (clientId: number, trigger: HTMLElement) => {
        setLastActionPosition(popupPositionFromElement(trigger));

        if (window.confirm(t('dispatcher.clients.delete_confirm'))) {
            setActionPopup(null);
            actionForm.delete(`/dispatcher/clients/${clientId}`, {
                preserveScroll: true,
            });
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
            <Head title={t('app.navigation.clients')} />

            <BackofficePage>
                <BackofficePageHeader
                    title={t('app.navigation.clients')}
                    description={t('dispatcher.clients.description')}
                    actions={
                        <BackofficeActionLink href="/dispatcher/clients/create">
                            {t('dispatcher.clients.create_title')}
                        </BackofficeActionLink>
                    }
                />

                <BackofficeCard>
                    <div className="border-b border-[#e5e7eb] px-5 py-4">
                        <div className="mb-4 text-[13px] font-semibold tracking-[0.07em] text-[#6b7280] uppercase">
                            {t('dispatcher.filters.filters')}
                        </div>
                        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
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
                                            'dispatcher.clients.placeholder',
                                        )}
                                    />
                                    {draftSearch.trim() !== '' ? (
                                        <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded-md border border-[#bfdbfe] bg-[#eff6ff] px-2 py-1 text-[11px] font-semibold text-[#1e40af]">
                                            {t('dispatcher.filters.enter')}
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
                                {t('common.actions.clear')}
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
                                        {t('dispatcher.clients.search_tag', {
                                            term,
                                        })}
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
                        noun={t('dispatcher.nouns.clients')}
                        sortValue={filterForm.data.sort}
                        onSortChange={(value) =>
                            filterForm.setData('sort', value)
                        }
                        sortOptions={sortOptions}
                    />

                    {clients.length === 0 ? (
                        <BackofficeEmptyState
                            title={t('dispatcher.clients.empty_title')}
                            description={t(
                                'dispatcher.clients.empty_description',
                            )}
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b border-[#e5e7eb] bg-[#f9fafb]">
                                        <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase">
                                            {t('common.fields.name')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase">
                                            {t('common.fields.phone')}
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
                                                        onClick={(event) =>
                                                            deleteClient(
                                                                client.id,
                                                                event.currentTarget,
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
                    className={`fixed z-[60] max-w-[min(320px,calc(100vw-2rem))] rounded-lg border border-[#fecaca] bg-white px-4 py-3 text-sm font-medium text-[#991b1b] shadow-[0_18px_40px_rgba(17,24,39,0.16)] transition duration-250 ease-out ${
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
        </AppLayout>
    );
}
