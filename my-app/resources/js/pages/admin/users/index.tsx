import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type AdminUserRecord = {
    id: number;
    name: string;
    email: string;
    role: string;
    organization_name: string | null;
};

type AdminUsersIndexProps = {
    users: AdminUserRecord[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin users', href: '/admin/users' },
];

export default function AdminUsersIndex({ users }: AdminUsersIndexProps) {
    const adminCount = users.filter((user) => user.role === 'admin').length;
    const dispatcherCount = users.filter((user) => user.role === 'dispatcher').length;
    const courierCount = users.filter((user) => user.role === 'courier').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin users" />

            <div className="space-y-4 p-4">
                <div className="border p-4">
                    <h1 className="text-xl font-semibold">Admin users</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage names, emails, roles, and organization assignments.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <div className="border p-4">
                        <p className="text-sm text-muted-foreground">Total users</p>
                        <p className="text-2xl font-semibold">{users.length}</p>
                    </div>
                    <div className="border p-4">
                        <p className="text-sm text-muted-foreground">Admins</p>
                        <p className="text-2xl font-semibold">{adminCount}</p>
                    </div>
                    <div className="border p-4">
                        <p className="text-sm text-muted-foreground">Dispatchers</p>
                        <p className="text-2xl font-semibold">{dispatcherCount}</p>
                    </div>
                    <div className="border p-4">
                        <p className="text-sm text-muted-foreground">Couriers</p>
                        <p className="text-2xl font-semibold">{courierCount}</p>
                    </div>
                </div>

                <div className="border p-4">
                    {users.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No users found.</p>
                    ) : (
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="p-2">Name</th>
                                    <th className="p-2">Email</th>
                                    <th className="p-2">Role</th>
                                    <th className="p-2">Organization</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b">
                                        <td className="p-2 font-medium">
                                            <Link
                                                href={`/admin/users/${user.id}/edit`}
                                                className="block underline-offset-4 hover:underline"
                                            >
                                                {user.name}
                                            </Link>
                                        </td>
                                        <td className="p-2">{user.email}</td>
                                        <td className="p-2 uppercase">{user.role}</td>
                                        <td className="p-2">{user.organization_name ?? '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
