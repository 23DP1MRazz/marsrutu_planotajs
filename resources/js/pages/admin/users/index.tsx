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

export default function AdminUsersIndex({ users }: AdminUsersIndexProps) {
    const { t } = useTranslation();
    const adminCount = users.filter((user) => user.role === 'admin').length;
    const dispatcherCount = users.filter(
        (user) => user.role === 'dispatcher',
    ).length;
    const courierCount = users.filter((user) => user.role === 'courier').length;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('dashboard.title'), href: '/dashboard' },
        { title: t('admin.users.title'), href: '/admin/users' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('admin.users.title')} />

            <BackofficePage>
                <BackofficePageHeader
                    title={t('admin.users.title')}
                    description={t('admin.users.description')}
                    actions={
                        <BackofficeActionLink
                            href="/dashboard"
                            variant="outline"
                        >
                            {t('common.actions.back_to_dashboard')}
                        </BackofficeActionLink>
                    }
                />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <BackofficeStatCard
                        label={t('admin.users.total')}
                        value={users.length}
                        meta={t('admin.users.all_meta')}
                    />
                    <BackofficeStatCard
                        label={t('admin.users.admins')}
                        value={adminCount}
                        meta={t('admin.users.admins_meta')}
                    />
                    <BackofficeStatCard
                        label={t('admin.users.dispatchers')}
                        value={dispatcherCount}
                        meta={t('admin.users.dispatchers_meta')}
                    />
                    <BackofficeStatCard
                        label={t('admin.users.couriers')}
                        value={courierCount}
                        meta={t('admin.users.couriers_meta')}
                    />
                </div>

                <BackofficeCard>
                    {users.length === 0 ? (
                        <BackofficeEmptyState
                            title={t('admin.users.empty_title')}
                            description={t('admin.users.empty_description')}
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
                                            {t('common.fields.email')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase">
                                            {t('common.fields.role')}
                                        </th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase">
                                            {t('common.fields.organization')}
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
                                                {t(`common.roles.${user.role}`)}
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
