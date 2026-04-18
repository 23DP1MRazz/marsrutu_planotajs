import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type AdminOrganizationEditProps = {
    organization: {
        id: number;
        name: string;
        join_code: string;
        users_count: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin organizations', href: '/admin/organizations' },
    { title: 'Edit organization', href: '#' },
];

export default function AdminOrganizationsEdit({ organization }: AdminOrganizationEditProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit organization" />

            <div className="space-y-4 p-4">
                <div className="border p-4">
                    <h1 className="text-xl font-semibold">Edit organization</h1>
                    <p className="text-sm text-muted-foreground">
                        Full organization edit UI comes in the next commit.
                    </p>
                </div>

                <div className="border p-4 text-sm">
                    <p>Name: {organization.name}</p>
                    <p>Join code: {organization.join_code}</p>
                    <p>Users: {organization.users_count}</p>
                </div>
            </div>
        </AppLayout>
    );
}
