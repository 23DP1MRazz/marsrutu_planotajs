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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin users" />

            <div className="space-y-4 p-4">
                <div className="border p-4">
                    <h1 className="text-xl font-semibold">Admin users</h1>
                    <p className="text-sm text-muted-foreground">
                        Basic user management backend is ready. UI polish comes next.
                    </p>
                </div>

                <div className="border p-4">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b text-left">
                                <th className="p-2">Name</th>
                                <th className="p-2">Email</th>
                                <th className="p-2">Role</th>
                                <th className="p-2">Organization</th>
                                <th className="p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b">
                                    <td className="p-2">{user.name}</td>
                                    <td className="p-2">{user.email}</td>
                                    <td className="p-2">{user.role}</td>
                                    <td className="p-2">{user.organization_name ?? '-'}</td>
                                    <td className="p-2">
                                        <Link href={`/admin/users/${user.id}/edit`} className="underline">
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
