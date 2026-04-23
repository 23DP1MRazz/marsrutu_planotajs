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
import AppLayout from '@/layouts/app-layout';
import { formatShortDate } from '@/lib/date';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

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
    const registrationLink =
        organizationInvitation === null
            ? null
            : `${typeof window === 'undefined' ? '' : window.location.origin}${organizationInvitation.registration_url}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <BackofficePage>
                {dashboardSummary?.role === 'admin' ? (
                    <>
                        <BackofficePageHeader
                            title="Dashboard"
                            description="Overview of platform users and organizations."
                        />

                        <div className="grid gap-3 lg:grid-cols-2">
                            <BackofficeStatCard
                                label="Users"
                                value={dashboardSummary.counts.users}
                                meta="Registered accounts across all roles"
                                href="/admin/users"
                            />
                            <BackofficeStatCard
                                label="Organizations"
                                value={dashboardSummary.counts.organizations}
                                meta="Active organizations on the platform"
                                href="/admin/organizations"
                            />
                        </div>

                        <div className="grid gap-4 xl:grid-cols-2">
                            <BackofficeCard>
                                <BackofficePanelHeader
                                    title="Recent Users"
                                    description="Latest created accounts across the platform."
                                    href="/admin/users"
                                    hrefLabel="Open users ->"
                                />
                                <BackofficeCardBody className="space-y-1">
                                    {dashboardSummary.recent_users.length ===
                                    0 ? (
                                        <p className="text-sm text-[#6b7280]">
                                            No users created yet.
                                        </p>
                                    ) : (
                                        dashboardSummary.recent_users.map(
                                            (user) => (
                                                <BackofficeListItem
                                                    key={user.id}
                                                    href={`/admin/users/${user.id}/edit`}
                                                    title={user.name}
                                                    meta={`${user.email} · ${user.role.toUpperCase()} · ${
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
                                    title="Recent Organizations"
                                    description="Newest organizations and their invite codes."
                                    href="/admin/organizations"
                                    hrefLabel="Open organizations ->"
                                />
                                <BackofficeCardBody className="space-y-1">
                                    {dashboardSummary.recent_organizations
                                        .length === 0 ? (
                                        <p className="text-sm text-[#6b7280]">
                                            No organizations created yet.
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
                            title="Dashboard"
                            description={`Welcome back. Here's what's happening in ${organizationInvitation.organization_name} today.`}
                        />

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                            <BackofficeStatCard
                                label="Clients"
                                value={dashboardSummary.counts.clients}
                                meta="Managed customer records"
                                href="/dispatcher/clients"
                            />
                            <BackofficeStatCard
                                label="Addresses"
                                value={dashboardSummary.counts.addresses}
                                meta="Saved delivery destinations"
                                href="/dispatcher/addresses"
                            />
                            <BackofficeStatCard
                                label="Orders"
                                value={dashboardSummary.counts.orders}
                                meta="All delivery orders"
                                href="/dispatcher/orders"
                            />
                            <BackofficeStatCard
                                label="Pending Orders"
                                value={dashboardSummary.counts.pending_orders}
                                meta="Need attention or assignment"
                                href="/dispatcher/orders"
                                accent="amber"
                            />
                            <BackofficeStatCard
                                label="Routes"
                                value={dashboardSummary.counts.routes}
                                meta="Created delivery routes"
                                href="/dispatcher/routes"
                            />
                        </div>

                        <div className="grid gap-3 lg:grid-cols-3">
                            <BackofficeCard>
                                <BackofficeCardBody>
                                    <div className="text-[11px] font-semibold tracking-[0.07em] text-[#6b7280] uppercase">
                                        Organization
                                    </div>
                                    <div className="mt-2 text-xl font-bold tracking-[-0.02em] text-[#111827]">
                                        {
                                            organizationInvitation.organization_name
                                        }
                                    </div>
                                    <div className="mt-1 text-xs text-[#6b7280]">
                                        ID #
                                        {organizationInvitation.organization_id}
                                    </div>
                                </BackofficeCardBody>
                            </BackofficeCard>

                            <BackofficeCard>
                                <BackofficeCardBody>
                                    <div className="text-[11px] font-semibold tracking-[0.07em] text-[#6b7280] uppercase">
                                        Join Code
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
                                        Copy code
                                    </button>
                                </BackofficeCardBody>
                            </BackofficeCard>

                            <BackofficeCard>
                                <BackofficeCardBody>
                                    <div className="text-[11px] font-semibold tracking-[0.07em] text-[#6b7280] uppercase">
                                        Quick Actions
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <BackofficeActionLink
                                            href="/dispatcher/orders/create"
                                            variant="outline"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Create Order
                                        </BackofficeActionLink>
                                        <BackofficeActionLink
                                            href="/dispatcher/routes/create"
                                            variant="outline"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Create Route
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
                                        Invite to organization
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
                                    Copy Link
                                </button>
                            </div>
                        ) : null}

                        <div className="grid gap-4 xl:grid-cols-2">
                            <BackofficeCard>
                                <BackofficePanelHeader
                                    title="Upcoming Routes"
                                    description="Next planned routes for your organization."
                                    href="/dispatcher/routes"
                                    hrefLabel="Open routes ->"
                                />
                                <BackofficeCardBody className="space-y-1">
                                    {dashboardSummary.upcoming_routes.length ===
                                    0 ? (
                                        <p className="text-sm text-[#6b7280]">
                                            No routes planned yet.
                                        </p>
                                    ) : (
                                        dashboardSummary.upcoming_routes.map(
                                            (deliveryRoute) => (
                                                <BackofficeListItem
                                                    key={deliveryRoute.id}
                                                    href={`/dispatcher/routes/${deliveryRoute.id}`}
                                                    title={
                                                        deliveryRoute.courier_name ??
                                                        'Unassigned courier'
                                                    }
                                                    meta={`${formatShortDate(deliveryRoute.date)} · ${deliveryRoute.stops_count} stops`}
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
                                    title="Pending Orders"
                                    description="Orders that need attention or assignment."
                                    href="/dispatcher/orders"
                                    hrefLabel="Open orders ->"
                                />
                                <BackofficeCardBody className="space-y-1">
                                    {dashboardSummary.pending_orders.length ===
                                    0 ? (
                                        <p className="text-sm text-[#6b7280]">
                                            No pending orders right now.
                                        </p>
                                    ) : (
                                        dashboardSummary.pending_orders.map(
                                            (order) => (
                                                <BackofficeListItem
                                                    key={order.id}
                                                    href={`/dispatcher/orders/${order.id}/edit`}
                                                    title={
                                                        order.client_name ??
                                                        `Order #${order.id}`
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
                        title="Dashboard"
                        description="No summary is available for this account yet."
                    />
                )}
            </BackofficePage>
        </AppLayout>
    );
}
