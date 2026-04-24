import { Link, router, usePage } from '@inertiajs/react';
import {
    ClipboardList,
    LayoutGrid,
    LogOut,
    MapPinned,
    Menu,
    Route,
    Settings,
    Shield,
    Truck,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { LucideIcon } from 'lucide-react';
import type { AppLayoutProps, SharedData } from '@/types';

type NavGroup = {
    label: string;
    items: Array<{
        title: string;
        href: string;
        icon: LucideIcon;
    }>;
};

function getNavigation(role: SharedData['auth']['user']['role']): NavGroup[] {
    if (role === 'courier') {
        return [
            {
                label: 'Platform',
                items: [
                    {
                        title: 'Dashboard',
                        href: '/dashboard',
                        icon: LayoutGrid,
                    },
                    {
                        title: 'Active Route',
                        href: '/courier/routes',
                        icon: Truck,
                    },
                    {
                        title: 'Completed Orders',
                        href: '/courier/completed-orders',
                        icon: ClipboardList,
                    },
                ],
            },
        ];
    }

    return [
        {
            label: 'Platform',
            items: [
                { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
                { title: 'Clients', href: '/dispatcher/clients', icon: Users },
                {
                    title: 'Addresses',
                    href: '/dispatcher/addresses',
                    icon: MapPinned,
                },
                {
                    title: 'Orders',
                    href: '/dispatcher/orders',
                    icon: ClipboardList,
                },
                { title: 'Routes', href: '/dispatcher/routes', icon: Route },
            ],
        },
        ...(role === 'admin'
            ? [
                  {
                      label: 'Administration',
                      items: [
                          {
                              title: 'Users',
                              href: '/admin/users',
                              icon: Shield,
                          },
                          {
                              title: 'Organizations',
                              href: '/admin/organizations',
                              icon: Users,
                          },
                      ],
                  },
              ]
            : []),
    ];
}

export function BackofficeAppFrame({ children }: AppLayoutProps) {
    const page = usePage<SharedData>();
    const getInitials = useInitials();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const pathname = page.url.split('?')[0];
    const navigation = getNavigation(page.props.auth.user.role);
    const organizationName =
        page.props.auth.organization_name ??
        (page.props.auth.user.role === 'admin'
            ? 'Platform administration'
            : 'No organization assigned');

    useEffect(() => {
        setMobileNavOpen(false);
    }, [pathname]);

    const handleLogout = () => {
        router.flushAll();
    };

    return (
        <div className="min-h-screen bg-[#f9fafb] text-[#111827]">
            <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center gap-4 border-b border-[#e5e7eb] bg-[rgba(255,255,255,0.88)] px-4 backdrop-blur-[14px] sm:px-6">
                <button
                    type="button"
                    onClick={() => setMobileNavOpen(true)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#111827] md:hidden"
                >
                    <Menu className="h-4 w-4" />
                </button>
                <Link
                    href="/dashboard"
                    className="shrink-0 text-sm font-bold tracking-[-0.02em] text-[#2563eb]"
                >
                    MARSRUTU PLANOTAJS
                </Link>
                <div className="hidden h-5 w-px bg-[#e5e7eb] sm:block" />
                <div className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#6b7280]">
                    {organizationName}
                </div>
                <LanguageSwitcher />
            </header>

            <div className="flex min-h-screen pt-16">
                <aside className="hidden w-60 shrink-0 border-r border-[#e5e7eb] bg-white md:fixed md:top-16 md:bottom-0 md:left-0 md:flex md:flex-col md:overflow-y-auto">
                    <div className="flex h-full flex-col gap-1 px-3 py-5">
                        {navigation.map((group) => (
                            <div key={group.label} className="space-y-1">
                                <div className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-[0.07em] text-[#6b7280] uppercase">
                                    {group.label}
                                </div>
                                {group.items.map((item) => {
                                    const isActive =
                                        pathname === item.href ||
                                        pathname.startsWith(`${item.href}/`);

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                                                isActive
                                                    ? 'bg-[#eff6ff] text-[#2563eb]'
                                                    : 'text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#111827]',
                                            )}
                                        >
                                            <item.icon className="h-4 w-4 shrink-0" />
                                            <span>{item.title}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}

                        <div className="mt-auto rounded-lg border border-[#e5e7eb] p-3">
                            <div className="flex items-center gap-2.5">
                                <Avatar className="h-8 w-8 rounded-full">
                                    <AvatarImage
                                        src={page.props.auth.user.avatar}
                                        alt={page.props.auth.user.name}
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-[#2563eb] to-[#3b82f6] text-[11px] font-bold tracking-[0.03em] text-white">
                                        {getInitials(page.props.auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <div className="truncate text-[13px] font-semibold text-[#111827]">
                                        {page.props.auth.user.name}
                                    </div>
                                    <div className="text-[11px] text-[#6b7280] capitalize">
                                        {page.props.auth.user.role}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <Link
                                    href={edit()}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#e5e7eb] px-2 py-1.5 text-xs font-semibold text-[#111827] transition hover:bg-[#f9fafb]"
                                >
                                    <Settings className="h-3.5 w-3.5" />
                                    Settings
                                </Link>
                                <Link
                                    href={logout()}
                                    as="button"
                                    onClick={handleLogout}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#e5e7eb] px-2 py-1.5 text-xs font-semibold text-[#991b1b] transition hover:bg-[#fef2f2]"
                                    data-test="logout-button"
                                >
                                    <LogOut className="h-3.5 w-3.5" />
                                    Log out
                                </Link>
                            </div>
                        </div>
                    </div>
                </aside>

                {mobileNavOpen ? (
                    <div className="fixed inset-0 z-40 md:hidden">
                        <button
                            type="button"
                            className="absolute inset-0 bg-black/25"
                            onClick={() => setMobileNavOpen(false)}
                            aria-label="Close navigation"
                        />
                        <div className="absolute inset-y-16 left-0 flex w-72 flex-col border-r border-[#e5e7eb] bg-white p-4 shadow-xl">
                            <div className="mb-3 flex items-center justify-between">
                                <div className="text-xs font-semibold tracking-[0.07em] text-[#6b7280] uppercase">
                                    Navigation
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setMobileNavOpen(false)}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb]"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            {navigation.map((group) => (
                                <div
                                    key={group.label}
                                    className="mb-3 space-y-1"
                                >
                                    <div className="px-2 pt-1 pb-1 text-[11px] font-semibold tracking-[0.07em] text-[#6b7280] uppercase">
                                        {group.label}
                                    </div>
                                    {group.items.map((item) => {
                                        const isActive =
                                            pathname === item.href ||
                                            pathname.startsWith(
                                                `${item.href}/`,
                                            );

                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                                                    isActive
                                                        ? 'bg-[#eff6ff] text-[#2563eb]'
                                                        : 'text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#111827]',
                                                )}
                                            >
                                                <item.icon className="h-4 w-4 shrink-0" />
                                                {item.title}
                                            </Link>
                                        );
                                    })}
                                </div>
                            ))}
                            <div className="mt-auto rounded-lg border border-[#e5e7eb] p-3">
                                <div className="flex items-center gap-2.5">
                                    <Avatar className="h-8 w-8 rounded-full">
                                        <AvatarImage
                                            src={page.props.auth.user.avatar}
                                            alt={page.props.auth.user.name}
                                        />
                                        <AvatarFallback className="bg-gradient-to-br from-[#2563eb] to-[#3b82f6] text-[11px] font-bold tracking-[0.03em] text-white">
                                            {getInitials(
                                                page.props.auth.user.name,
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <div className="truncate text-[13px] font-semibold text-[#111827]">
                                            {page.props.auth.user.name}
                                        </div>
                                        <div className="text-[11px] text-[#6b7280] capitalize">
                                            {page.props.auth.user.role}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <Link
                                        href={edit()}
                                        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#e5e7eb] px-2 py-1.5 text-xs font-semibold text-[#111827] transition hover:bg-[#f9fafb]"
                                    >
                                        <Settings className="h-3.5 w-3.5" />
                                        Settings
                                    </Link>
                                    <Link
                                        href={logout()}
                                        as="button"
                                        onClick={handleLogout}
                                        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#e5e7eb] px-2 py-1.5 text-xs font-semibold text-[#991b1b] transition hover:bg-[#fef2f2]"
                                        data-test="logout-button"
                                    >
                                        <LogOut className="h-3.5 w-3.5" />
                                        Log out
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}

                <main className="flex-1 md:ml-60">
                    <div className="animate-[fadeInUp_0.45s_cubic-bezier(.4,0,.2,1)_both] p-4 sm:p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
