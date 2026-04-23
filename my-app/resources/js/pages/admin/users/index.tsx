import { Head, Link } from '@inertiajs/react';
import {
    BackofficeActionLink,
    BackofficeCard,
    BackofficeCardBody,
    BackofficeEmptyState,
    BackofficePage,
    BackofficePageHeader,
    BackofficeStatCard,
} from '@/components/backoffice/ui';
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
    { title: 'Users', href: '/admin/users' },
];

export default function AdminUsersIndex({ users }: AdminUsersIndexProps) {
    const adminCount = users.filter((user) => user.role === 'admin').length;
    const dispatcherCount = users.filter(
        (user) => user.role === 'dispatcher',
    ).length;
    const courierCount = users.filter((user) => user.role === 'courier').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <BackofficePage>
                <BackofficePageHeader
                    title="Users"
                    description="Manage names, emails, roles, and organization assignments."
                    actions={
                        <BackofficeActionLink
                            href="/dashboard"
                            variant="outline"
                        >
                            Back to dashboard
                        </BackofficeActionLink>
                    }
                />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <BackofficeStatCard
                        label="Total users"
                        value={users.length}
                        meta="All registered accounts"
                    />
                    <BackofficeStatCard
                        label="Admins"
                        value={adminCount}
                        meta="Global platform access"
                    />
                    <BackofficeStatCard
                        label="Dispatchers"
                        value={dispatcherCount}
                        meta="Organization operators"
                    />
                    <BackofficeStatCard
                        label="Couriers"
                        value={courierCount}
                        meta="Delivery staff accounts"
                    />
                </div>

                <BackofficeCard>
                    {users.length === 0 ? (
                        <BackofficeEmptyState
                            title="No users found"
                            description="User accounts will appear here once they are created."
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
                                            Email
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase">
                                            Role
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase">
                                            Organization
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-[#e5e7eb] transition hover:bg-[#f9fbff]"
                                        >
                                            <td className="px-4 py-4">
                                                <Link
                                                    href={`/admin/users/${user.id}/edit`}
                                                    className="font-semibold text-[#111827] transition hover:text-[#2563eb]"
                                                >
                                                    {user.name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-4 text-[#6b7280]">
                                                {user.email}
                                            </td>
                                            <td className="px-4 py-4 text-[#6b7280] uppercase">
                                                {user.role}
                                            </td>
                                            <td className="px-4 py-4 text-[#6b7280]">
                                                {user.organization_name ?? '-'}
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
