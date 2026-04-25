import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { CourierMobileHeader } from '@/components/courier/mobile-ui';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslation } from '@/hooks/use-translation';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
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
        {
            title: t('settings.layout.appearance'),
            href: editAppearance(),
            icon: null,
        },
    ];

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div>
            {isCourier && isMobile ? (
                <CourierMobileHeader
                    title={t('settings.layout.title')}
                    subtitle={t('settings.layout.description')}
                    backHref="/dashboard"
                />
            ) : null}

            <div className="px-4 py-6">
                <Heading
                    title={t('settings.layout.title')}
                    description={t('settings.layout.description')}
                />

                <div className="flex flex-col lg:flex-row lg:space-x-12">
                    <aside className="w-full max-w-xl lg:w-48">
                        <nav
                            className="flex flex-col space-y-1 space-x-0"
                            aria-label={t('settings.layout.title')}
                        >
                            {sidebarNavItems.map((item, index) => (
                                <Button
                                    key={`${toUrl(item.href)}-${index}`}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn('w-full justify-start', {
                                        'bg-muted': isCurrentUrl(item.href),
                                    })}
                                >
                                    <Link href={item.href}>
                                        {item.icon && (
                                            <item.icon className="h-4 w-4" />
                                        )}
                                        {item.title}
                                    </Link>
                                </Button>
                            ))}
                        </nav>
                    </aside>

                    <Separator className="my-6 lg:hidden" />

                    <div className="flex-1 md:max-w-2xl">
                        <section className="max-w-xl space-y-12">
                            {children}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
