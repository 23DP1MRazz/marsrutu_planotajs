import { usePage } from '@inertiajs/react';
import { BackofficeAppFrame } from '@/components/backoffice/app-frame';
import { CourierAppFrame } from '@/components/courier/app-frame';
import { useIsMobile } from '@/hooks/use-mobile';
import type { AppLayoutProps } from '@/types';
import type { SharedData } from '@/types';

export default function AppSidebarLayout({ children }: AppLayoutProps) {
    const page = usePage<SharedData>();
    const isMobile = useIsMobile();

    if (page.props.auth.user.role === 'courier' && isMobile) {
        return <CourierAppFrame>{children}</CourierAppFrame>;
    }

    return <BackofficeAppFrame>{children}</BackofficeAppFrame>;
}
