import { Link, usePage } from '@inertiajs/react';
import { BookOpen, ClipboardList, Folder, LayoutGrid, MapPinned, Route, Shield, Users } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem, SharedData } from '@/types';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const canUseDispatcherPages =
        auth.user.role === 'admin' || auth.user.role === 'dispatcher';
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        ...(canUseDispatcherPages
            ? [
                  {
                      title: 'Clients',
                      href: '/dispatcher/clients',
                      icon: Users,
                  },
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
                  {
                      title: 'Routes',
                      href: '/dispatcher/routes',
                      icon: Route,
                  },
              ]
            : []),
        ...(auth.user.role === 'admin'
            ? [
                  {
                      title: 'Users',
                      href: '/admin/users',
                      icon: Shield,
                  },
                  {
                      title: 'Admin organizations',
                      href: '/admin/organizations',
                      icon: Users,
                  },
              ]
            : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
