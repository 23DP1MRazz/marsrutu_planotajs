import { Head } from '@inertiajs/react';
import { Check, Copy, Link2, Plus } from 'lucide-react';
import {
    BackofficeActionLink,
    BackofficeCard,
    BackofficeCardBody,
    BackofficeListItem,
    BackofficePage,
    BackofficePageHeader,
    BackofficePanelHeader,
    BackofficeStatCard,
    BackofficeStatusBadge,
    backofficeButtonClassName,
} from '@/components/backoffice/ui';
import { useClipboard } from '@/hooks/use-clipboard';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { formatShortDate } from '@/lib/date';
import type { BreadcrumbItem } from '@/types';

type DashboardProps = {
    dashboardSummary:
        | {
              role: 'admin';
              counts: {
                  users: number;
                  organizations: number;
              };
              recent_users: Array<{
                  id: number;
                  name: string;
                  email: string;
                  role: string;
                  created_at: string | null;
              }>;
              recent_organizations: Array<{
                  id: number;
                  name: string;
                  join_code: string;
                  created_at: string | null;
              }>;
          }
        | {
              role: 'dispatcher';
              counts: {
                  clients: number;
                  addresses: number;
                  orders: number;
                  pending_orders: number;
                  routes: number;
              };
              upcoming_routes: Array<{
                  id: number;
                  date: string;
                  status: string;
                  stops_count: number;
                  courier_name: string | null;
              }>;
              pending_orders: Array<{
                  id: number;
                  date: string;
                  status: string;
                  client_name: string | null;
                  address_label: string;
              }>;
          }
        | null;
    organizationInvitation: {
        organization_id: number;
        organization_name: string;
        join_code: string;
        registration_url: string;
    } | null;
};

export default function Dashboard({
    dashboardSummary,
    organizationInvitation,
}: DashboardProps) {
    const [copiedText, copyToClipboard] = useClipboard();
    const { t } = useTranslation();
    const registrationLink =
        organizationInvitation === null
            ? null
            : `${typeof window === 'undefined' ? '' : window.location.origin}${organizationInvitation.registration_url}`;
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('dashboard.title'),
            href: '/dashboard',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('dashboard.title')} />

            <BackofficePage>
                {dashboardSummary?.role === 'admin' ? (
                    <>
                        <BackofficePageHeader
                            title={t('dashboard.title')}
                            description={t('dashboard.admin.description')}
                        />

                        <div className="grid gap-3 lg:grid-cols-2">
                            <BackofficeStatCard
                                label={t('app.navigation.users')}
                                value={dashboardSummary.counts.users}
                                meta={t('dashboard.admin.users_meta')}
                                href="/admin/users"
                            />
                            <BackofficeStatCard
                                label={t('app.navigation.organizations')}
                                value={dashboardSummary.counts.organizations}
                                meta={t('dashboard.admin.organizations_meta')}
                                href="/admin/organizations"
                            />
                        </div>

                        <div className="grid gap-4 xl:grid-cols-2">
                            <BackofficeCard>
                                <BackofficePanelHeader
                                    title={t('dashboard.admin.recent_users')}
                                    description={t(
                                        'dashboard.admin.recent_users_description',
                                    )}
                                    href="/admin/users"
                                    hrefLabel={t('dashboard.links.open_users')}
                                />
                                <BackofficeCardBody className="space-y-1">
                                    {dashboardSummary.recent_users.length ===
                                    0 ? (
                                        <p className="text-sm text-[#6b7280]">
                                            {t('dashboard.empty.no_users')}
                                        </p>
                                    ) : (
                                        dashboardSummary.recent_users.map(
                                            (user) => (
                                                <BackofficeListItem
                                                    key={user.id}
                                                    href={`/admin/users/${user.id}/edit`}
                                                    title={user.name}
                                                    meta={`${user.email} · ${t(`common.roles.${user.role}`)} · ${
                                                        user.created_at
                                                            ? formatShortDate(
                                                                  user.created_at,
                                                              )
                                                            : '-'
                                                    }`}
                                                />
                                            ),
                                        )
                                    )}
                                </BackofficeCardBody>
                            </BackofficeCard>

                            <BackofficeCard>
                                <BackofficePanelHeader
                                    title={t(
                                        'dashboard.admin.recent_organizations',
                                    )}
                                    description={t(
                                        'dashboard.admin.recent_organizations_description',
                                    )}
                                    href="/admin/organizations"
                                    hrefLabel={t(
                                        'dashboard.links.open_organizations',
                                    )}
                                />
                                <BackofficeCardBody className="space-y-1">
                                    {dashboardSummary.recent_organizations
                                        .length === 0 ? (
                                        <p className="text-sm text-[#6b7280]">
                                            {t(
                                                'dashboard.empty.no_organizations',
                                            )}
                                        </p>
                                    ) : (
                                        dashboardSummary.recent_organizations.map(
                                            (organization) => (
                                                <BackofficeListItem
                                                    key={organization.id}
                                                    href={`/admin/organizations/${organization.id}/edit`}
                                                    title={organization.name}
                                                    meta={`${organization.join_code} · ${
                                                        organization.created_at
                                                            ? formatShortDate(
                                                                  organization.created_at,
                                                              )
                                                            : '-'
                                                    }`}
                                                />
                                            ),
                                        )
                                    )}
                                </BackofficeCardBody>
                            </BackofficeCard>
                        </div>
                    </>
                ) : dashboardSummary?.role === 'dispatcher' &&
                  organizationInvitation ? (
                    <>
                        <BackofficePageHeader
                            title={t('dashboard.title')}
                            description={t('dashboard.dispatcher.description', {
                                organization:
                                    organizationInvitation.organization_name,
                            })}
                        />

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                            <BackofficeStatCard
                                label={t('app.navigation.clients')}
                                value={dashboardSummary.counts.clients}
                                meta={t('dashboard.dispatcher.clients_meta')}
                                href="/dispatcher/clients"
                            />
                            <BackofficeStatCard
                                label={t('app.navigation.addresses')}
                                value={dashboardSummary.counts.addresses}
                                meta={t('dashboard.dispatcher.addresses_meta')}
                                href="/dispatcher/addresses"
                            />
                            <BackofficeStatCard
                                label={t('app.navigation.orders')}
                                value={dashboardSummary.counts.orders}
                                meta={t(
                                    'dashboard.dispatcher.total_orders_meta',
                                )}
                                href="/dispatcher/orders"
                            />
                            <BackofficeStatCard
                                label={t('dashboard.dispatcher.pending_orders')}
                                value={dashboardSummary.counts.pending_orders}
                                meta={t(
                                    'dashboard.dispatcher.pending_orders_meta',
                                )}
                                href="/dispatcher/orders"
                                accent="amber"
                            />
                            <BackofficeStatCard
                                label={t('app.navigation.routes')}
                                value={dashboardSummary.counts.routes}
                                meta={t('dashboard.dispatcher.routes_meta')}
                                href="/dispatcher/routes"
                            />
                        </div>

                        <div className="grid gap-3 lg:grid-cols-3">
                            <BackofficeCard>
                                <BackofficeCardBody>
                                    <div className="text-[11px] font-semibold tracking-[0.07em] text-[#6b7280] uppercase">
                                        {t('common.fields.organization')}
                                    </div>
                                    <div className="mt-2 text-xl font-bold tracking-[-0.02em] text-[#111827]">
                                        {
                                            organizationInvitation.organization_name
                                        }
                                    </div>
                                    <div className="mt-1 text-xs text-[#6b7280]">
                                        {t(
                                            'dashboard.dispatcher.organization_id',
                                            {
                                                id: organizationInvitation.organization_id,
                                            },
                                        )}
                                    </div>
                                </BackofficeCardBody>
                            </BackofficeCard>

                            <BackofficeCard>
                                <BackofficeCardBody>
                                    <div className="text-[11px] font-semibold tracking-[0.07em] text-[#6b7280] uppercase">
                                        {t('admin.organizations.join_code')}
                                    </div>
                                    <div className="mt-2 font-mono text-2xl font-bold tracking-[0.08em] text-[#111827]">
                                        {organizationInvitation.join_code}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            copyToClipboard(
                                                organizationInvitation.join_code,
                                            )
                                        }
                                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#2563eb] transition hover:text-[#1e40af]"
                                    >
                                        {copiedText ===
                                        organizationInvitation.join_code ? (
                                            <Check className="h-3.5 w-3.5" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5" />
                                        )}
                                        {t('dashboard.dispatcher.copy_code')}
                                    </button>
                                </BackofficeCardBody>
                            </BackofficeCard>

                            <BackofficeCard>
                                <BackofficeCardBody>
                                    <div className="text-[11px] font-semibold tracking-[0.07em] text-[#6b7280] uppercase">
                                        {t(
                                            'dashboard.dispatcher.quick_actions',
                                        )}
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <BackofficeActionLink
                                            href="/dispatcher/orders/create"
                                            variant="outline"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            {t(
                                                'dispatcher.orders.create_title',
                                            )}
                                        </BackofficeActionLink>
                                        <BackofficeActionLink
                                            href="/dispatcher/routes/create"
                                            variant="outline"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            {t(
                                                'dispatcher.routes.create_title',
                                            )}
                                        </BackofficeActionLink>
                                    </div>
                                </BackofficeCardBody>
                            </BackofficeCard>
                        </div>

                        {registrationLink ? (
                            <div className="flex flex-col gap-4 rounded-xl border border-[#bfdbfe] bg-gradient-to-br from-[#eff6ff] to-[#dbeafe] p-5 lg:flex-row lg:items-center">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#2563eb] to-[#3b82f6] text-white">
                                    <Link2 className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-[15px] font-semibold text-[#1e40af]">
                                        {t('dashboard.dispatcher.invite')}
                                    </div>
                                    <div className="truncate font-mono text-[13px] text-[#2563eb]">
                                        {registrationLink}
                                    </div>
                                </div>
                                <div className="shrink-0 rounded-md border border-[#bfdbfe] bg-white px-3 py-1 font-mono text-[15px] font-bold tracking-[0.05em] text-[#1e40af]">
                                    {organizationInvitation.join_code}
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        copyToClipboard(registrationLink)
                                    }
                                    className={backofficeButtonClassName(
                                        'outline',
                                    )}
                                >
                                    {copiedText === registrationLink ? (
                                        <Check className="h-3.5 w-3.5" />
                                    ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                    )}
                                    {t('dashboard.dispatcher.copy_link')}
                                </button>
                            </div>
                        ) : null}

                        <div className="grid gap-4 xl:grid-cols-2">
                            <BackofficeCard>
                                <BackofficePanelHeader
                                    title={t(
                                        'dashboard.dispatcher.upcoming_routes',
                                    )}
                                    description={t(
                                        'dashboard.dispatcher.upcoming_routes_description',
                                    )}
                                    href="/dispatcher/routes"
                                    hrefLabel={t('dashboard.links.open_routes')}
                                />
                                <BackofficeCardBody className="space-y-1">
                                    {dashboardSummary.upcoming_routes.length ===
                                    0 ? (
                                        <p className="text-sm text-[#6b7280]">
                                            {t('dashboard.empty.no_routes')}
                                        </p>
                                    ) : (
                                        dashboardSummary.upcoming_routes.map(
                                            (deliveryRoute) => (
                                                <BackofficeListItem
                                                    key={deliveryRoute.id}
                                                    href={`/dispatcher/routes/${deliveryRoute.id}`}
                                                    title={
                                                        deliveryRoute.courier_name ??
                                                        t(
                                                            'dispatcher.routes.unassigned_courier',
                                                        )
                                                    }
                                                    meta={`${formatShortDate(deliveryRoute.date)} · ${t('dispatcher.routes.stops_count', { count: deliveryRoute.stops_count })}`}
                                                    badge={
                                                        <BackofficeStatusBadge
                                                            status={
                                                                deliveryRoute.status
                                                            }
                                                        />
                                                    }
                                                />
                                            ),
                                        )
                                    )}
                                </BackofficeCardBody>
                            </BackofficeCard>

                            <BackofficeCard>
                                <BackofficePanelHeader
                                    title={t(
                                        'dashboard.dispatcher.pending_orders',
                                    )}
                                    description={t(
                                        'dashboard.dispatcher.pending_orders_description',
                                    )}
                                    href="/dispatcher/orders"
                                    hrefLabel={t('dashboard.links.open_orders')}
                                />
                                <BackofficeCardBody className="space-y-1">
                                    {dashboardSummary.pending_orders.length ===
                                    0 ? (
                                        <p className="text-sm text-[#6b7280]">
                                            {t(
                                                'dashboard.empty.no_pending_orders',
                                            )}
                                        </p>
                                    ) : (
                                        dashboardSummary.pending_orders.map(
                                            (order) => (
                                                <BackofficeListItem
                                                    key={order.id}
                                                    href={`/dispatcher/orders/${order.id}/edit`}
                                                    title={
                                                        order.client_name ??
                                                        t(
                                                            'dispatcher.orders.order_number',
                                                            { id: order.id },
                                                        )
                                                    }
                                                    meta={`${order.address_label} · ${formatShortDate(order.date)}`}
                                                    badge={
                                                        <BackofficeStatusBadge
                                                            status={
                                                                order.status
                                                            }
                                                        />
                                                    }
                                                />
                                            ),
                                        )
                                    )}
                                </BackofficeCardBody>
                            </BackofficeCard>
                        </div>
                    </>
                ) : (
                    <BackofficePageHeader
                        title={t('dashboard.title')}
                        description={t('dashboard.empty.no_summary')}
                    />
                )}
            </BackofficePage>
        </AppLayout>
    );
}
