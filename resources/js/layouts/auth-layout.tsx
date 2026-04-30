import AuthCardLayout from '@/layouts/auth/auth-card-layout';
import type { AuthLayoutProps } from '@/types';

export default function AuthLayout({
    children,
    title,
    description,
    ...props
}: AuthLayoutProps & { title: string; description: string }) {
    return (
        <AuthCardLayout title={title} description={description} {...props}>
            {children}
        </AuthCardLayout>
    );
}
