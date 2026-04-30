import { Head, Link } from '@inertiajs/react';
import {
    BackofficeActionLink,
    BackofficeCard,
    BackofficeEmptyState,
    BackofficePage,
    BackofficePageHeader,
    BackofficeStatCard,
} from '@/components/backoffice/ui';
import { useTranslation } from '@/hooks/use-translation';
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

export default function AdminOrganizationsIndex({
    organizations,
}: AdminOrganizationsIndexProps) {
    const { t } = useTranslation();
    const totalUsers = organizations.reduce(
        (sum, organization) => sum + organization.users_count,
        0,
    );
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('dashboard.title'), href: '/dashboard' },
        { title: t('admin.organizations.title'), href: '/admin/organizations' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('admin.organizations.title')} />

            <BackofficePage>
                <BackofficePageHeader
                    title={t('admin.organizations.title')}
                    description={t('admin.organizations.description')}
                    actions={
                        <BackofficeActionLink
                            href="/dashboard"
                            variant="outline"
                        >
                            {t('common.actions.back_to_dashboard')}
                        </BackofficeActionLink>
                    }
                />

                <div className="grid gap-3 md:grid-cols-3">
                    <BackofficeStatCard
                        label={t('admin.organizations.title')}
                        value={organizations.length}
                        meta={t('dashboard.admin.organizations_meta')}
                    />
                    <BackofficeStatCard
                        label={t('admin.organizations.users')}
                        value={totalUsers}
                        meta={t('admin.organizations.users_meta')}
                    />
                    <BackofficeStatCard
                        label={t('admin.organizations.average_users')}
                        value={
                            organizations.length === 0
                                ? 0
                                : Math.round(totalUsers / organizations.length)
                        }
                        meta={t('admin.organizations.average_users_meta')}
                    />
                </div>

                <BackofficeCard>
                    {organizations.length === 0 ? (
                        <BackofficeEmptyState
                            title={t('admin.organizations.empty_title')}
                            description={t(
                                'admin.organizations.empty_description',
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
                                            {t('admin.organizations.join_code')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase">
                                            {t('admin.organizations.users')}
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
