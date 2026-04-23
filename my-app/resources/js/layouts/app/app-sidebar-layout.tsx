import { BackofficeAppFrame } from '@/components/backoffice/app-frame';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({ children }: AppLayoutProps) {
    return <BackofficeAppFrame>{children}</BackofficeAppFrame>;
}
