import { Slot } from '@radix-ui/react-slot';
import type { ComponentProps, ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

export const backofficeInputClassName =
    'h-10 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none transition focus:border-[#2563eb] focus:ring-4 focus:ring-[rgba(37,99,235,0.10)] disabled:cursor-not-allowed disabled:opacity-60';

export const backofficeTextareaClassName =
    'min-h-28 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2.5 text-sm text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none transition focus:border-[#2563eb] focus:ring-4 focus:ring-[rgba(37,99,235,0.10)] disabled:cursor-not-allowed disabled:opacity-60';

export const backofficeSelectClassName = cn(
    backofficeInputClassName,
    'appearance-none bg-[url("data:image/svg+xml,%3csvgxmlns=%27http://www.w3.org/2000/svg%27fill=%27none%27viewBox=%27002020%27%3e%3cpathstroke=%27%236b7280%27stroke-linecap=%27round%27stroke-linejoin=%27round%27stroke-width=%271.5%27d=%27M6_8l4_4_4-4%27/%3e%3c/svg%3e")] bg-[length:16px_16px] bg-[position:right_0.75rem_center] bg-no-repeat pr-10',
);

export const backofficeButtonClassName = (
    variant: 'primary' | 'outline' = 'primary',
    size: 'default' | 'sm' = 'default',
) =>
    cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap transition-all',
        size === 'sm' ? 'h-9 px-3 text-[13px]' : 'h-10 px-4 text-sm',
        variant === 'primary'
            ? 'bg-[#2563eb] text-white shadow-[0_1px_3px_rgba(37,99,235,0.3)] hover:-translate-y-px hover:bg-[#1e40af] hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]'
            : 'border border-[#e5e7eb] bg-transparent text-[#111827] hover:border-[#6b7280] hover:bg-[#f9fafb]',
    );

export function BackofficePage({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('flex flex-col gap-5', className)}>{children}</div>
    );
}

export function BackofficePageHeader({
    title,
    description,
    actions,
}: {
    title: string;
    description: string;
    actions?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
                <h1 className="text-[1.375rem] font-bold tracking-[-0.025em] text-[#111827]">
                    {title}
                </h1>
                <p className="mt-1 text-sm text-[#6b7280]">{description}</p>
            </div>
            {actions ? (
                <div className="flex flex-wrap items-center gap-2">
                    {actions}
                </div>
            ) : null}
        </div>
    );
}

export function BackofficeCard({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={cn(
                'overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
                className,
            )}
        >
            {children}
        </section>
    );
}

export function BackofficeCardBody({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return <div className={cn('p-5', className)}>{children}</div>;
}

export function BackofficePanelHeader({
    title,
    description,
    href,
    hrefLabel,
}: {
    title: string;
    description: string;
    href?: string;
    hrefLabel?: string;
}) {
    return (
        <div className="flex flex-col gap-3 border-b border-[#e5e7eb] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h2 className="text-base font-semibold text-[#111827]">
                    {title}
                </h2>
                <p className="mt-0.5 text-xs text-[#6b7280]">{description}</p>
            </div>
            {href && hrefLabel ? (
                <Link
                    href={href}
                    className="text-sm font-medium text-[#2563eb] transition hover:text-[#1e40af] hover:underline"
                >
                    {hrefLabel}
                </Link>
            ) : null}
        </div>
    );
}

export function BackofficeResultsBar({
    count,
    noun,
    sortValue,
    onSortChange,
    sortOptions,
}: {
    count: number;
    noun: string;
    sortValue?: string;
    onSortChange?: (value: string) => void;
    sortOptions?: Array<{
        value: string;
        label: string;
    }>;
}) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-3 border-b border-[#e5e7eb] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#6b7280]">
                {t('app.tables.showing', { count, noun })}
            </p>
            {sortValue !== undefined && onSortChange && sortOptions ? (
                <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                    <span>{t('app.tables.sort')}</span>
                    <select
                        value={sortValue}
                        onChange={(event) => onSortChange(event.target.value)}
                        className="h-8 rounded-lg border border-[#e5e7eb] bg-white px-3 pr-8 text-[13px] text-[#111827] transition outline-none focus:border-[#2563eb] focus:ring-4 focus:ring-[rgba(37,99,235,0.10)]"
                    >
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            ) : null}
        </div>
    );
}

export function BackofficeField({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold tracking-[0.02em] text-[#6b7280]">
                {label}
            </span>
            {children}
            {error ? (
                <span className="text-sm text-red-600">{error}</span>
            ) : null}
        </label>
    );
}

export function BackofficeInfoNote({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-sm text-[#6b7280]',
                className,
            )}
        >
            {children}
        </div>
    );
}

export function BackofficeStatCard({
    label,
    value,
    meta,
    href,
    accent,
}: {
    label: string;
    value: ReactNode;
    meta: ReactNode;
    href?: string;
    accent?: 'amber' | 'default';
}) {
    const Comp = href ? Link : 'div';

    return (
        <Comp
            {...(href ? { href } : {})}
            className={cn(
                'block rounded-xl border border-[#e5e7eb] bg-white px-5 py-[1.125rem] text-left transition',
                href
                    ? 'hover:-translate-y-0.5 hover:border-[#3b82f6] hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08),0_2px_4px_-2px_rgba(0,0,0,0.05)]'
                    : '',
            )}
        >
            <div className="mb-1.5 text-[11px] font-semibold tracking-[0.07em] text-[#6b7280] uppercase">
                {label}
            </div>
            <div
                className={cn(
                    'text-[1.75rem] leading-none font-bold tracking-[-0.03em] text-[#111827]',
                    accent === 'amber' ? 'text-[#f59e0b]' : '',
                )}
            >
                {value}
            </div>
            <div className="mt-1.5 flex items-center gap-1 text-xs text-[#6b7280]">
                <span
                    className={cn(
                        'h-1.5 w-1.5 rounded-full bg-current',
                        accent === 'amber' ? 'text-[#f59e0b]' : '',
                    )}
                />
                {meta}
            </div>
        </Comp>
    );
}

export function BackofficeEmptyState({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="px-4 py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f3f4f6] text-[#6b7280]">
                <Plus className="h-5 w-5" />
            </div>
            <p className="font-semibold text-[#111827]">{title}</p>
            <p className="mt-1 text-sm text-[#6b7280]">{description}</p>
        </div>
    );
}

export function BackofficeStatusBadge({
    status,
    className,
}: {
    status: string;
    className?: string;
}) {
    const { t } = useTranslation();
    const normalizedStatus = status.trim().toUpperCase();
    const statusKey = normalizedStatus.toLowerCase();
    const statusClassName = (() => {
        switch (normalizedStatus) {
            case 'PLANNED':
                return 'bg-[#f3f4f6] text-[#6b7280]';
            case 'IN_PROGRESS':
                return 'bg-[#fef3c7] text-[#92400e]';
            case 'COMPLETED':
            case 'DONE':
                return 'bg-[#d1fae5] text-[#065f46]';
            case 'PENDING':
                return 'bg-[#e0f2fe] text-[#0c4a6e]';
            case 'NEW':
                return 'bg-[#f0fdf4] text-[#166534]';
            case 'ASSIGNED':
                return 'bg-[#ede9fe] text-[#5b21b6]';
            case 'FAILED':
                return 'bg-[#fee2e2] text-[#991b1b]';
            case 'CANCELLED':
                return 'bg-[#f3f4f6] text-[#6b7280]';
            default:
                return 'bg-[#eff6ff] text-[#1e40af]';
        }
    })();

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.03em] uppercase',
                'before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:content-[""]',
                statusClassName,
                className,
            )}
        >
            {t(`common.statuses.${statusKey}`)}
        </span>
    );
}

export function BackofficeListItem({
    title,
    meta,
    href,
    badge,
    aside,
}: {
    title: string;
    meta: ReactNode;
    href: string;
    badge?: ReactNode;
    aside?: ReactNode;
}) {
    return (
        <Link
            href={href}
            className="flex items-center justify-between gap-3 rounded-lg border border-transparent px-3 py-3 transition hover:border-[#e5e7eb] hover:bg-[#f9fafb]"
        >
            <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-semibold text-[#111827]">
                    {title}
                </div>
                <div className="mt-0.5 text-xs text-[#6b7280]">{meta}</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                {aside}
                {badge}
            </div>
        </Link>
    );
}

export function BackofficeActionLink({
    href,
    children,
    variant = 'outline',
    size = 'default',
}: {
    href: string;
    children: ReactNode;
    variant?: 'primary' | 'outline';
    size?: 'default' | 'sm';
}) {
    return (
        <Link href={href} className={backofficeButtonClassName(variant, size)}>
            {children}
        </Link>
    );
}

export function BackofficeIconButton({
    variant = 'default',
    asChild = false,
    ...props
}: ComponentProps<'button'> & {
    variant?: 'default' | 'danger';
    asChild?: boolean;
}) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            {...props}
            className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#e5e7eb] bg-white text-[#6b7280] transition hover:bg-[#eff6ff]',
                variant === 'danger'
                    ? 'hover:border-[#ef4444] hover:bg-[#fef2f2] hover:text-[#ef4444]'
                    : 'hover:border-[#2563eb] hover:text-[#2563eb]',
                props.className,
            )}
        />
    );
}

export function EditIcon() {
    return <Pencil className="h-3.5 w-3.5" />;
}

export function DeleteIcon() {
    return <Trash2 className="h-3.5 w-3.5" />;
}
