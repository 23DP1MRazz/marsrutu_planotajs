import { Head, Link, router, useForm } from '@inertiajs/react';
import { ResourceShell } from '@/components/dispatcher/resource-shell';
import { useLiveFiltering } from '@/hooks/use-live-filtering';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import type { ClientFilters, ClientRecord } from '@/types/dispatcher';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Clients', href: '/dispatcher/clients' },
];

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

    useLiveFiltering({
        data: filterForm.data,
        url: '/dispatcher/clients',
    });

    const deleteClient = (clientId: number) => {
        router.delete(`/dispatcher/clients/${clientId}`);
    };

    const clearFilters = () => {
        filterForm.setData({
            search: '',
            sort: 'name_asc',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clients" />
            <ResourceShell
                title="Clients"
                description="Manage client records for your organization."
                actionHref="/dispatcher/clients/create"
                actionLabel="Create client"
            >
                <div className="border p-4">
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <label htmlFor="search" className="block text-sm">
                                    Search by name or phone
                                </label>
                                <input
                                    id="search"
                                    name="search"
                                    type="text"
                                    value={filterForm.data.search}
                                    onChange={(event) => filterForm.setData('search', event.target.value)}
                                    className="w-full border px-3 py-2"
                                />
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="sort" className="block text-sm">
                                    Sort by
                                </label>
                                <select
                                    id="sort"
                                    name="sort"
                                    value={filterForm.data.sort}
                                    onChange={(event) => filterForm.setData('sort', event.target.value)}
                                    className="w-full border px-3 py-2"
                                >
                                    <option value="name_asc">Name (A-Z)</option>
                                    <option value="name_desc">Name (Z-A)</option>
                                    <option value="updated_desc">Updated (newest)</option>
                                    <option value="updated_asc">Updated (oldest)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={clearFilters}>
                                Clear
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="border p-4">
                    {clients.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No clients created yet.
                        </p>
                    ) : (
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Phone</th>
                                    <th className="p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client) => (
                                    <tr key={client.id} className="border-b">
                                        <td className="p-2">{client.name}</td>
                                        <td className="p-2">{client.phone}</td>
                                        <td className="p-2">
                                            <div className="flex gap-2">
                                                <Button asChild type="button" variant="outline">
                                                    <Link href={`/dispatcher/clients/${client.id}/edit`}>
                                                        Edit
                                                    </Link>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => deleteClient(client.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </ResourceShell>
        </AppLayout>
    );
}
