import { Head, Link } from '@inertiajs/react';
import { Check, Copy, Link2, Users } from 'lucide-react';
import { useClipboard } from '@/hooks/use-clipboard';
import AppLayout from '@/layouts/app-layout';
import { formatShortDate } from '@/lib/date';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
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
              upcoming_routes: Array<unknown>;
              pending_orders: Array<unknown>;
          }
        | null;
    organizationInvitation: {
        organization_id: number;
        organization_name: string;
        join_code: string;
        registration_url: string;
    } | null;
};

export default function Dashboard({ dashboardSummary, organizationInvitation }: DashboardProps) {
    const [copiedText, copyToClipboard] = useClipboard();
    const registrationLink = organizationInvitation === null
        ? null
        : `${
            typeof window === 'undefined' ? '' : window.location.origin
        }${organizationInvitation.registration_url}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {dashboardSummary?.role === 'admin' ? (
                    <>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                                <p className="text-sm text-muted-foreground">Users</p>
                                <p className="mt-2 text-3xl font-semibold">
                                    {dashboardSummary.counts.users}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Total registered accounts across all organizations.
                                </p>
                            </div>
                            <div className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                                <p className="text-sm text-muted-foreground">Organizations</p>
                                <p className="mt-2 text-3xl font-semibold">
                                    {dashboardSummary.counts.organizations}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Active organizations managed by the platform.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 xl:grid-cols-2">
                            <div className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold">Recent users</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Latest created accounts across all roles.
                                        </p>
                                    </div>
                                    <Link
                                        href="/admin/users"
                                        className="text-sm underline underline-offset-4"
                                    >
                                        Open users
                                    </Link>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {dashboardSummary.recent_users.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            No users created yet.
                                        </p>
                                    ) : (
                                        dashboardSummary.recent_users.map((user) => (
                                            <div key={user.id} className="rounded-lg border p-3">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="font-medium">{user.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm uppercase text-muted-foreground">
                                                        {user.role}
                                                    </p>
                                                </div>
                                                <p className="mt-2 text-xs text-muted-foreground">
                                                    {user.created_at
                                                        ? formatShortDate(user.created_at)
                                                        : '-'}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold">Recent organizations</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Latest organizations and their join codes.
                                        </p>
                                    </div>
                                    <Link
                                        href="/admin/organizations"
                                        className="text-sm underline underline-offset-4"
                                    >
                                        Open organizations
                                    </Link>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {dashboardSummary.recent_organizations.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            No organizations created yet.
                                        </p>
                                    ) : (
                                        dashboardSummary.recent_organizations.map((organization) => (
                                            <div key={organization.id} className="rounded-lg border p-3">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="font-medium">{organization.name}</p>
                                                        <p className="mt-1 font-mono text-sm text-muted-foreground">
                                                            {organization.join_code}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {organization.created_at
                                                            ? formatShortDate(organization.created_at)
                                                            : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : organizationInvitation ? (
                    <>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                                <p className="text-sm text-muted-foreground">Organization</p>
                                <p className="mt-2 text-2xl font-semibold">
                                    {organizationInvitation.organization_name}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    ID #{organizationInvitation.organization_id}
                                </p>
                            </div>
                            <div className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                                <p className="text-sm text-muted-foreground">Join code</p>
                                <p className="mt-2 font-mono text-2xl font-semibold">
                                    {organizationInvitation.join_code}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => void copyToClipboard(organizationInvitation.join_code)}
                                    className="mt-3 inline-flex items-center gap-2 text-sm underline underline-offset-4"
                                >
                                    {copiedText === organizationInvitation.join_code ? (
                                        <Check className="size-4" />
                                    ) : (
                                        <Copy className="size-4" />
                                    )}
                                    Copy code
                                </button>
                            </div>
                            <div className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                                <p className="text-sm text-muted-foreground">Quick actions</p>
                                <div className="mt-3 flex flex-col gap-2">
                                    <Link
                                        href="/dispatcher/orders/create"
                                        className="inline-flex items-center gap-2 text-sm underline underline-offset-4"
                                    >
                                        <Users className="size-4" />
                                        Create order
                                    </Link>
                                    <Link
                                        href="/dispatcher/routes/create"
                                        className="inline-flex items-center gap-2 text-sm underline underline-offset-4"
                                    >
                                        <Link2 className="size-4" />
                                        Create route
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="space-y-2">
                                    <h2 className="text-lg font-semibold">Invite to organization</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Share this registration link so dispatchers or couriers can join
                                        your organization with the code already filled in.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {registrationLink && (
                                        <button
                                            type="button"
                                            onClick={() => void copyToClipboard(registrationLink)}
                                            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm"
                                        >
                                            {copiedText === registrationLink ? (
                                                <Check className="size-4" />
                                            ) : (
                                                <Copy className="size-4" />
                                            )}
                                            Copy link
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 rounded-md border px-4 py-3 text-sm font-mono break-all">
                                {registrationLink ?? organizationInvitation.registration_url}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                            <p className="text-sm text-muted-foreground">Dashboard</p>
                            <p className="mt-2 text-lg font-semibold">Welcome back</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Your role-specific dashboard widgets will continue expanding in the
                                next commits.
                            </p>
                        </div>
                        <div className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                            <p className="text-sm text-muted-foreground">Admin tools</p>
                            <p className="mt-2 text-lg font-semibold">Manage users and organizations</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Use the sidebar to open admin user and organization management.
                            </p>
                        </div>
                        <div className="rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border">
                            <p className="text-sm text-muted-foreground">Next steps</p>
                            <p className="mt-2 text-lg font-semibold">Dashboards are being refined</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                More role-specific cards and summaries come in the next dashboard
                                commits.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
