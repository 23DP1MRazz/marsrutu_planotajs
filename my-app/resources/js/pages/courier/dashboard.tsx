import { Head, Link } from '@inertiajs/react';
import { Settings } from 'lucide-react';
import {
    BackofficeCard,
    BackofficePage,
    BackofficePageHeader,
    BackofficeStatCard,
    BackofficeStatusBadge,
    backofficeButtonClassName,
} from '@/components/backoffice/ui';
import {
    CourierEmptyState,
    CourierMobileBody,
    CourierMobileHeader,
    CourierSectionLabel,
} from '@/components/courier/mobile-ui';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { formatShortDate } from '@/lib/date';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type {
    CourierDashboardSummary,
    CourierRouteRecord,
    CourierRouteStopRecord,
} from '@/types/courier';

type CourierDashboardPageProps = {
    deliveryRoute: CourierRouteRecord | null;
    stops: CourierRouteStopRecord[];
    dashboardSummary: CourierDashboardSummary;
};

export default function CourierDashboardPage({
    deliveryRoute,
    stops,
    dashboardSummary,
}: CourierDashboardPageProps) {
    const { t } = useTranslation();
    const isMobile = useIsMobile();

    if (!isMobile) {
        return (
            <AppLayout breadcrumbs={[]}>
                <Head title={t('dashboard.title')} />

                <BackofficePage>
                    <BackofficePageHeader
                        title={t('courier.dashboard.title')}
                        description={t('courier.dashboard.description')}
                    />

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <BackofficeStatCard
                            label={t('courier.dashboard.active_route')}
                            value={deliveryRoute ? 1 : 0}
                            meta={
                                deliveryRoute
                                    ? t('courier.dashboard.route_number', {
                                          id: deliveryRoute.id,
                                      })
                                    : t('courier.dashboard.no_today_route')
                            }
                            href="/courier/today-route"
                        />
                        <BackofficeStatCard
                            label={t('courier.dashboard.done_routes')}
                            value={dashboardSummary.done_routes}
                            meta={t('courier.dashboard.done_routes_meta')}
                            href="/courier/routes/completed"
                        />
                        <BackofficeStatCard
                            label={t('courier.dashboard.completed_orders')}
                            value={dashboardSummary.completed_orders}
                            meta={t('courier.dashboard.completed_orders_meta')}
                            href="/courier/orders/completed"
                        />
                        <BackofficeStatCard
                            label={t('courier.dashboard.upcoming_routes')}
                            value={dashboardSummary.upcoming_routes_count}
                            meta={t('courier.dashboard.upcoming_routes_meta')}
                            href="/courier/routes/upcoming"
                        />
                    </div>

                    <BackofficeCard className="p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="text-[11px] font-semibold tracking-[0.07em] text-[#6b7280] uppercase">
                                    {t('app.navigation.active_route')}
                                </div>
                                <h2 className="mt-2 text-xl font-bold tracking-[-0.03em] text-[#111827]">
                                    {deliveryRoute
                                        ? t('courier.dashboard.route_number', {
                                              id: deliveryRoute.id,
                                          })
                                        : t('courier.dashboard.no_today_route')}
                                </h2>
                                <p className="mt-1 text-sm text-[#6b7280]">
                                    {deliveryRoute
                                        ? t(
                                              'courier.dashboard.route_stops_meta',
                                              {
                                                  date: formatShortDate(
                                                      deliveryRoute.date,
                                                  ),
                                                  count: stops.length,
                                              },
                                          )
                                        : t('courier.dashboard.description')}
                                </p>
                            </div>
                            {deliveryRoute ? (
                                <BackofficeStatusBadge
                                    status={deliveryRoute.status}
                                />
                            ) : null}
                        </div>
                    </BackofficeCard>
                </BackofficePage>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title={t('dashboard.title')} />

            <CourierMobileHeader
                title={t('courier.dashboard.title')}
                subtitle={formatShortDate(new Date().toISOString())}
                rightSlot={
                    <Link
                        href={edit()}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#3b82f6] text-white"
                    >
                        <Settings className="h-4 w-4" />
                    </Link>
                }
            />

            <CourierMobileBody>
                <section className="rounded-2xl bg-[linear-gradient(135deg,#1e40af_0%,#2563eb_60%,#3b82f6_100%)] px-5 py-5 text-white">
                    <div className="text-xs font-medium text-white/75">
                        {t('courier.dashboard.description')}
                    </div>
                    <div className="mt-2 text-[22px] font-bold tracking-[-0.03em]">
                        {deliveryRoute
                            ? t('courier.dashboard.route_number', {
                                  id: deliveryRoute.id,
                              })
                            : t('courier.dashboard.no_today_route')}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[12px] text-white/80">
                        {deliveryRoute ? (
                            <>
                                <span>
                                    {formatShortDate(deliveryRoute.date)}
                                </span>
                                <span>•</span>
                                <span>
                                    {t('courier.routes.planned_stops', {
                                        count: stops.length,
                                    })}
                                </span>
                            </>
                        ) : null}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {deliveryRoute ? (
                            <Link
                                href="/courier/today-route"
                                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#1e40af]"
                            >
                                {t('courier.dashboard.open_active_route')}
                            </Link>
                        ) : null}
                        <Link
                            href="/courier/routes/upcoming"
                            className="rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white"
                        >
                            {t('courier.dashboard.upcoming_routes')}
                        </Link>
                    </div>
                </section>

                <div className="grid grid-cols-3 gap-2.5">
                    <Link
                        href="/courier/today-route"
                        className="rounded-2xl border border-[#e5e7eb] bg-white px-3 py-4 text-center"
                    >
                        <div className="text-[11px] font-semibold tracking-[0.07em] text-[#6b7280] uppercase">
                            {t('courier.dashboard.active_route_short')}
                        </div>
                        <div className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#111827]">
                            {deliveryRoute ? 1 : 0}
                        </div>
                    </Link>
                    <Link
                        href="/courier/routes/completed"
                        className="rounded-2xl border border-[#e5e7eb] bg-white px-3 py-4 text-center"
                    >
                        <div className="text-[11px] font-semibold tracking-[0.07em] text-[#6b7280] uppercase">
                            {t('courier.dashboard.done_routes')}
                        </div>
                        <div className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#111827]">
                            {dashboardSummary.done_routes}
                        </div>
                    </Link>
                    <Link
                        href="/courier/orders/completed"
                        className="rounded-2xl border border-[#e5e7eb] bg-white px-3 py-4 text-center"
                    >
                        <div className="text-[11px] font-semibold tracking-[0.07em] text-[#6b7280] uppercase">
                            {t('courier.dashboard.completed_orders')}
                        </div>
                        <div className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#111827]">
                            {dashboardSummary.completed_orders}
                        </div>
                    </Link>
                </div>
            </CourierMobileBody>

            <CourierSectionLabel>
                {t('courier.dashboard.upcoming_routes')}
            </CourierSectionLabel>

            <div className="flex flex-col gap-2.5 px-3.5 pb-4">
                {dashboardSummary.upcoming_routes.length === 0 ? (
                    <CourierEmptyState
                        title={t('courier.routes.upcoming_empty')}
                        description={t('courier.routes.upcoming_description')}
                    />
                ) : (
                    dashboardSummary.upcoming_routes.map((route) => (
                        <Link
                            key={route.id}
                            href={route.href}
                            className="rounded-2xl border border-[#e5e7eb] bg-white px-4 py-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-[15px] font-semibold text-[#111827]">
                                        {t('courier.routes.route_number', {
                                            id: route.id,
                                        })}
                                    </div>
                                    <div className="mt-1 text-sm text-[#6b7280]">
                                        {formatShortDate(route.date)} ·{' '}
                                        {t('courier.routes.planned_stops', {
                                            count: route.stops_count,
                                        })}
                                    </div>
                                </div>
                                <BackofficeStatusBadge status={route.status} />
                            </div>
                        </Link>
                    ))
                )}

                <div className="mt-1 grid grid-cols-2 gap-2">
                    <Link
                        href={edit()}
                        className={backofficeButtonClassName('outline')}
                    >
                        {t('app.shell.settings')}
                    </Link>
                    <Link
                        href={logout()}
                        as="button"
                        className={backofficeButtonClassName('outline')}
                    >
                        {t('app.shell.sign_out')}
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
