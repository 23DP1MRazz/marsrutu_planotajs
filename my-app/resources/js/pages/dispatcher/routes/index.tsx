import { Head, Link, router, useForm } from '@inertiajs/react';
import { ResourceShell } from '@/components/dispatcher/resource-shell';
import { useLiveFiltering } from '@/hooks/use-live-filtering';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatShortDate } from '@/lib/date';
import type {
    DeliveryRouteRecord,
    OrganizationOption,
    RouteFilters,
} from '@/types/dispatcher';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Routes', href: '/dispatcher/routes' },
];

type DispatcherRoutesIndexProps = {
    deliveryRoutes: DeliveryRouteRecord[];
    filters: RouteFilters;
    statuses: string[];
    organizations: OrganizationOption[];
    canFilterByOrganization: boolean;
};

export default function DispatcherRoutesIndex({
    deliveryRoutes,
    filters,
    statuses,
    organizations,
    canFilterByOrganization,
}: DispatcherRoutesIndexProps) {
    const filterForm = useForm({
        date: filters.date ?? '',
        status: filters.status ?? '',
        courier: filters.courier ?? '',
        organization_id: filters.organization_id ?? '',
        sort: filters.sort ?? 'date_desc',
    });

    useLiveFiltering({
        data: filterForm.data,
        url: '/dispatcher/routes',
    });

    const clearFilters = () => {
        filterForm.setData({
            date: '',
            status: '',
            courier: '',
            organization_id: '',
            sort: 'date_desc',
        });
    };

    const exportQuery = new URLSearchParams(
        Object.entries(filterForm.data).filter(([, value]) => value !== ''),
    ).toString();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Routes" />
            <ResourceShell
                title="Routes"
                description="Manage daily courier routes."
                actionHref="/dispatcher/routes/create"
                actionLabel="Create route"
            >
                <div className="border p-4">
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-1">
                                <label htmlFor="courier" className="block text-sm">
                                    Courier
                                </label>
                                <input
                                    id="courier"
                                    name="courier"
                                    type="text"
                                    value={filterForm.data.courier}
                                    onChange={(event) => filterForm.setData('courier', event.target.value)}
                                    className="w-full border px-3 py-2"
                                />
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="date" className="block text-sm">
                                    Date
                                </label>
                                <input
                                    id="date"
                                    name="date"
                                    type="date"
                                    value={filterForm.data.date}
                                    onChange={(event) => filterForm.setData('date', event.target.value)}
                                    className="w-full border px-3 py-2"
                                />
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="status" className="block text-sm">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={filterForm.data.status}
                                    onChange={(event) => filterForm.setData('status', event.target.value)}
                                    className="w-full border px-3 py-2"
                                >
                                    <option value="">All statuses</option>
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {canFilterByOrganization && (
                                <div className="space-y-1">
                                    <label htmlFor="organization_id" className="block text-sm">
                                        Organization
                                    </label>
                                    <select
                                        id="organization_id"
                                        name="organization_id"
                                        value={filterForm.data.organization_id}
                                        onChange={(event) => filterForm.setData('organization_id', event.target.value)}
                                        className="w-full border px-3 py-2"
                                    >
                                        <option value="">All organizations</option>
                                        {organizations.map((organization) => (
                                            <option key={organization.id} value={String(organization.id)}>
                                                {organization.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

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
                                    <option value="date_desc">Date (newest)</option>
                                    <option value="date_asc">Date (oldest)</option>
                                    <option value="courier_asc">Courier (A-Z)</option>
                                    <option value="courier_desc">Courier (Z-A)</option>
                                    <option value="status_asc">Status (A-Z)</option>
                                    <option value="status_desc">Status (Z-A)</option>
                                    <option value="updated_desc">Updated (newest)</option>
                                    <option value="updated_asc">Updated (oldest)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={clearFilters}>
                                Clear
                            </Button>
                            <Button asChild type="button" variant="outline">
                                <a href={`/dispatcher/routes/export${exportQuery ? `?${exportQuery}` : ''}`}>
                                    Export CSV
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="border p-4">
                    {deliveryRoutes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No routes created yet.
                        </p>
                    ) : (
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="p-2">Courier</th>
                                    <th className="p-2">Date</th>
                                    <th className="p-2">Status</th>
                                    <th className="p-2">Stops</th>
                                    <th className="p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliveryRoutes.map((deliveryRoute) => (
                                    <tr key={deliveryRoute.id} className="border-b">
                                        <td className="p-2">
                                            {deliveryRoute.courier_name ?? '-'}
                                        </td>
                                        <td className="p-2">
                                            {formatShortDate(deliveryRoute.date)}
                                        </td>
                                        <td className="p-2">{deliveryRoute.status}</td>
                                        <td className="p-2">{deliveryRoute.stops_count}</td>
                                        <td className="p-2">
                                            <div className="flex gap-2">
                                                <Button asChild type="button" variant="outline">
                                                    <Link href={`/dispatcher/routes/${deliveryRoute.id}`}>
                                                        Open
                                                    </Link>
                                                </Button>
                                                <Button asChild type="button" variant="outline">
                                                    <a
                                                        href={`/dispatcher/routes/${deliveryRoute.id}/print`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        Print
                                                    </a>
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
