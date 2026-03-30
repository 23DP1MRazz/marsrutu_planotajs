import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

type Field = {
    label: string;
    name: string;
    placeholder?: string;
};

type ResourceShellProps = {
    title: string;
    description: string;
    actionHref: string;
    actionLabel: string;
    fields?: Field[];
};

export function ResourceShell({
    title,
    description,
    actionHref,
    actionLabel,
    fields = [],
}: ResourceShellProps) {
    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <div className="flex items-start justify-between border p-4">
                <div>
                    <h1 className="text-lg font-semibold">{title}</h1>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <Button asChild variant="outline">
                    <Link href={actionHref}>{actionLabel}</Link>
                </Button>
            </div>

            {fields.length > 0 && (
                <div className="border p-4">
                    <h2 className="mb-4 font-medium">Input area</h2>
                    <form className="space-y-4">
                        {fields.map((field) => (
                            <div key={field.name} className="space-y-1">
                                <label
                                    htmlFor={field.name}
                                    className="block text-sm"
                                >
                                    {field.label}
                                </label>
                                <input
                                    id={field.name}
                                    name={field.name}
                                    type="text"
                                    placeholder={field.placeholder}
                                    className="w-full border px-3 py-2"
                                />
                            </div>
                        ))}
                        <div className="flex gap-2">
                            <Button type="button">Save</Button>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
