import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type OrganizationRecord = {
    id: number;
    name: string;
    join_code: string;
    users_count: number;
};

type AdminOrganizationsIndexProps = {
    organizations: OrganizationRecord[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin organizations', href: '/admin/organizations' },
];

export default function AdminOrganizationsIndex({ organizations }: AdminOrganizationsIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin organizations" />

            <div className="space-y-4 p-4">
                <div className="border p-4">
                    <h1 className="text-xl font-semibold">Admin organizations</h1>
                    <p className="text-sm text-muted-foreground">
                        Backend organization management is ready. Full UI polish comes next.
                    </p>
                </div>

                <div className="border p-4">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="p-2">Name</th>
                                <th className="p-2">Join code</th>
                                <th className="p-2">Users</th>
                                <th className="p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {organizations.map((organization) => (
                                <tr key={organization.id} className="border-b">
                                    <td className="p-2">{organization.name}</td>
                                    <td className="p-2">{organization.join_code}</td>
                                    <td className="p-2">{organization.users_count}</td>
                                    <td className="p-2">
                                        <Link
                                            href={`/admin/organizations/${organization.id}/edit`}
                                            className="underline"
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
