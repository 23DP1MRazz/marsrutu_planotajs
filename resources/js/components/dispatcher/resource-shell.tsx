import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

type ResourceShellProps = {
    title: string;
    description: string;
    actionHref: string;
    actionLabel: string;
    children?: ReactNode;
};

export function ResourceShell({
    title,
    description,
    actionHref,
    actionLabel,
    children,
}: ResourceShellProps) {
    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <div className="flex items-start justify-between border p-4">
                <div>
                    <h1 className="text-lg font-semibold">{title}</h1>
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href={actionHref}>{actionLabel}</Link>
                </Button>
            </div>

            {children}
        </div>
    );
}
