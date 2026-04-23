import { Head, Link } from '@inertiajs/react';
import {
    BackofficeActionLink,
    BackofficeCard,
    BackofficeEmptyState,
    BackofficePage,
    BackofficePageHeader,
    BackofficeStatCard,
} from '@/components/backoffice/ui';
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

export default function AdminOrganizationsIndex({
    organizations,
}: AdminOrganizationsIndexProps) {
    const totalUsers = organizations.reduce(
        (sum, organization) => sum + organization.users_count,
        0,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin organizations" />

            <BackofficePage>
                <BackofficePageHeader
                    title="Organizations"
                    description="Review active organizations, join codes, and user counts."
                    actions={
                        <BackofficeActionLink
                            href="/dashboard"
                            variant="outline"
                        >
                            Back to dashboard
                        </BackofficeActionLink>
                    }
                />

                <div className="grid gap-3 md:grid-cols-3">
                    <BackofficeStatCard
                        label="Organizations"
                        value={organizations.length}
                        meta="Active organizations"
                    />
                    <BackofficeStatCard
                        label="Assigned users"
                        value={totalUsers}
                        meta="Users linked to an organization"
                    />
                    <BackofficeStatCard
                        label="Average users per org"
                        value={
                            organizations.length === 0
                                ? 0
                                : Math.round(totalUsers / organizations.length)
                        }
                        meta="Rounded organization average"
                    />
                </div>

                <BackofficeCard>
                    {organizations.length === 0 ? (
                        <BackofficeEmptyState
                            title="No organizations found"
                            description="Organizations will appear here as they are created."
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
                                            Join code
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase">
                                            Users
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {organizations.map((organization) => (
                                        <tr
                                            key={organization.id}
                                            className="border-b border-[#e5e7eb] transition hover:bg-[#f9fbff]"
                                        >
                                            <td className="px-4 py-4">
                                                <Link
                                                    href={`/admin/organizations/${organization.id}/edit`}
                                                    className="font-semibold text-[#111827] transition hover:text-[#2563eb]"
                                                >
                                                    {organization.name}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-4 font-mono text-[#6b7280]">
                                                {organization.join_code}
                                            </td>
                                            <td className="px-4 py-4 text-[#6b7280]">
                                                {organization.users_count}
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
