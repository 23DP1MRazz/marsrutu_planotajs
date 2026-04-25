import { Head, Link } from '@inertiajs/react';
import { BackofficeStatusBadge } from '@/components/backoffice/ui';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { formatShortDate } from '@/lib/date';
import type { CourierRouteListRecord } from '@/types/courier';
import type { BreadcrumbItem } from '@/types';

type CourierRoutesPageProps = {
    title: string;
    description: string;
    emptyMessage: string;
    routes: CourierRouteListRecord[];
};

export default function CourierRoutesPage({
    title,
    routes,
}: CourierRoutesPageProps) {
    const { t } = useTranslation();
    const isCompletedPage = title === 'Done routes';
    const translatedTitle = isCompletedPage
        ? t('courier.routes.completed_title')
        : t('courier.routes.upcoming_title');
    const translatedDescription = isCompletedPage
        ? t('courier.routes.completed_description')
        : t('courier.routes.upcoming_description');
    const translatedEmptyMessage = isCompletedPage
        ? t('courier.routes.completed_empty')
        : t('courier.routes.upcoming_empty');
    const currentPath = isCompletedPage
        ? '/courier/routes/completed'
        : '/courier/routes/upcoming';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('dashboard.title'), href: '/dashboard' },
        { title: translatedTitle, href: currentPath },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={translatedTitle} />

            <div className="flex flex-1 flex-col gap-4 p-3 sm:gap-6 sm:p-4">
                <div className="rounded-3xl border border-border/80 bg-card/90 p-4 shadow-sm sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                {translatedTitle}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {translatedDescription}
                            </p>
                        </div>
                        <Link
                            href="/dashboard"
                            className="rounded-2xl border border-border/80 px-4 py-2 text-sm"
                        >
                            {t('courier.routes.back')}
                        </Link>
                    </div>
                </div>

                <div className="rounded-3xl border border-border/80 bg-card/90 p-4 shadow-sm sm:p-5">
                    {routes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            {translatedEmptyMessage}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {routes.map((deliveryRoute) => (
                                <div
                                    key={deliveryRoute.id}
                                    className="rounded-2xl border border-border/80 p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium">
                                                {formatShortDate(
                                                    deliveryRoute.date,
                                                )}
                                            </p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {t(
                                                    'courier.routes.planned_stops',
                                                    {
                                                        count: deliveryRoute.stops_count,
                                                    },
                                                )}
                                            </p>
                                        </div>
                                        <BackofficeStatusBadge
                                            status={deliveryRoute.status}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
