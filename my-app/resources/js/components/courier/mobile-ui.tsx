import { Link, usePage } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types';

export function CourierMobileHeader({
    title,
    subtitle,
    backHref,
    rightSlot,
}: {
    title: string;
    subtitle?: string;
    backHref?: string;
    rightSlot?: ReactNode;
}) {
    const page = usePage<SharedData>();
    const getInitials = useInitials();

    return (
        <header className="sticky top-0 z-40 flex h-[60px] items-center gap-2.5 border-b border-[#e5e7eb] bg-white px-4">
            {backHref ? (
                <Link
                    href={backHref}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border-[1.5px] border-[#e5e7eb] bg-[#f9fafb] text-[#6b7280] transition active:bg-[#e5e7eb]"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Link>
            ) : (
                <div className="h-9 w-9 shrink-0" />
            )}

            <div className="min-w-0 flex-1 text-center">
                <div className="truncate text-[15px] font-bold tracking-[-0.02em] text-[#111827]">
                    {title}
                </div>
                {subtitle ? (
                    <div className="truncate text-[11px] text-[#6b7280]">
                        {subtitle}
                    </div>
                ) : null}
            </div>

            {rightSlot ?? (
                <Link
                    href="/dashboard"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#3b82f6] text-[10px] font-bold tracking-[0.03em] text-white"
                >
                    {getInitials(page.props.auth.user.name)}
                </Link>
            )}
        </header>
    );
}

export function CourierMobileBody({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn('flex flex-col gap-3 px-3.5 pt-3.5 pb-4', className)}
        >
            {children}
        </div>
    );
}

export function CourierSectionLabel({ children }: { children: ReactNode }) {
    return (
        <div className="px-3.5 text-[11px] font-bold tracking-[0.07em] text-[#6b7280] uppercase">
            {children}
        </div>
    );
}

export function CourierEmptyState({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-dashed border-[#d1d5db] bg-white px-5 py-8 text-center">
            <p className="text-sm font-semibold text-[#111827]">{title}</p>
            <p className="mt-1 text-sm text-[#6b7280]">{description}</p>
            {action ? <div className="mt-4">{action}</div> : null}
        </div>
    );
}
