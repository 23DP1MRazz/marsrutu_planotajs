import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import {
    BackofficeCard,
    BackofficePage,
    BackofficePageHeader,
    backofficeButtonClassName,
} from '@/components/backoffice/ui';
import { CourierMobileHeader } from '@/components/courier/mobile-ui';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from '@/hooks/use-translation';
import { cn, toUrl } from '@/lib/utils';
import { edit } from '@/routes/profile';
import { edit as editPassword } from '@/routes/user-password';
import type { NavItem, SharedData } from '@/types';

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentUrl } = useCurrentUrl();
    const { t } = useTranslation();
    const page = usePage<SharedData>();
    const isMobile = useIsMobile();
    const isCourier = page.props.auth.user.role === 'courier';
    const sidebarNavItems: NavItem[] = [
        {
            title: t('settings.layout.profile'),
            href: edit(),
            icon: null,
        },
        {
            title: t('settings.layout.password'),
            href: editPassword(),
            icon: null,
        },
    ];

    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <BackofficePage>
            {isCourier && isMobile ? (
                <CourierMobileHeader
                    title={t('settings.layout.title')}
                    subtitle={t('settings.layout.description')}
                    backHref="/dashboard"
                />
            ) : null}

            <div className="px-4 py-6">
                <BackofficePageHeader
                    title={t('settings.layout.title')}
                    description={t('settings.layout.description')}
                    actions={
                        !isCourier || !isMobile ? (
                            <Link
                                href="/dashboard"
                                className={backofficeButtonClassName('outline')}
                            >
                                {t('common.actions.back')}
                            </Link>
                        ) : undefined
                    }
                />

                <div className="mt-5 grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)]">
                    <aside>
                        <BackofficeCard className="p-3">
                            <nav
                                className="flex flex-col gap-1"
                                aria-label={t('settings.layout.title')}
                            >
                                {sidebarNavItems.map((item, index) => (
                                    <Link
                                        key={`${toUrl(item.href)}-${index}`}
                                        href={item.href}
                                        className={cn(
                                            'flex h-10 items-center rounded-lg px-3 text-sm font-semibold transition',
                                            {
                                                'bg-[#eff6ff] text-[#1d4ed8]':
                                                    isCurrentUrl(item.href),
                                                'text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#111827]':
                                                    !isCurrentUrl(item.href),
                                            },
                                        )}
                                    >
                                        {item.icon && (
                                            <item.icon className="h-4 w-4" />
                                        )}
                                        {item.title}
                                    </Link>
                                ))}
                            </nav>
                        </BackofficeCard>
                    </aside>

                    <div className="min-w-0">
                        <section className="space-y-5">{children}</section>
                    </div>
                </div>
            </div>
        </BackofficePage>
    );
}
