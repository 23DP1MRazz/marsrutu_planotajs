import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type AdminUserEditProps = {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        organization_name: string | null;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin users', href: '/admin/users' },
    { title: 'Edit user', href: '#' },
];

export default function AdminUsersEdit({ user }: AdminUserEditProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit user" />

            <div className="space-y-4 p-4">
                <div className="border p-4">
                    <h1 className="text-xl font-semibold">Edit user</h1>
                    <p className="text-sm text-muted-foreground">
                        Full admin edit form UI comes in the next commit.
                    </p>
                </div>

                <div className="border p-4 text-sm">
                    <p>Name: {user.name}</p>
                    <p>Email: {user.email}</p>
                    <p>Role: {user.role}</p>
                    <p>Organization: {user.organization_name ?? '-'}</p>
                </div>
            </div>
        </AppLayout>
    );
}
