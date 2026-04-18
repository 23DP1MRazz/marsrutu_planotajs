import type { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type AdminOrganizationEditProps = {
    organization: {
        id: number;
        name: string;
        join_code: string;
        users_count: number;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin organizations', href: '/admin/organizations' },
    { title: 'Edit organization', href: '#' },
];

export default function AdminOrganizationsEdit({ organization }: AdminOrganizationEditProps) {
    const form = useForm({
        name: organization.name,
    });

    const regenerateForm = useForm({});

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.patch(`/admin/organizations/${organization.id}`);
    };

    const regenerateJoinCode = () => {
        regenerateForm.post(`/admin/organizations/${organization.id}/regenerate-join-code`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit organization" />

            <div className="space-y-4 p-4">
                <div className="border p-4">
                    <h1 className="text-xl font-semibold">Edit organization</h1>
                    <p className="text-sm text-muted-foreground">
                        Update the organization name or generate a fresh join code.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="border p-4">
                        <p className="text-sm text-muted-foreground">Join code</p>
                        <p className="text-2xl font-semibold font-mono">{organization.join_code}</p>
                    </div>
                    <div className="border p-4">
                        <p className="text-sm text-muted-foreground">Assigned users</p>
                        <p className="text-2xl font-semibold">{organization.users_count}</p>
                    </div>
                    <div className="border p-4">
                        <p className="text-sm text-muted-foreground">Organization ID</p>
                        <p className="text-2xl font-semibold">{organization.id}</p>
                    </div>
                </div>

                <div className="border p-4">
                    <form className="space-y-4" onSubmit={submit}>
                        <div className="space-y-1">
                            <label htmlFor="name" className="block text-sm">
                                Organization name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                className="w-full border px-3 py-2"
                            />
                            {form.errors.name && (
                                <p className="text-sm text-red-600">{form.errors.name}</p>
                            )}
                        </div>

                        <div className="border p-3 text-sm text-muted-foreground">
                            Regenerating the join code keeps the organization the same, but old
                            invite codes stop working.
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="border px-4 py-2"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                disabled={regenerateForm.processing}
                                onClick={regenerateJoinCode}
                                className="border px-4 py-2"
                            >
                                Regenerate join code
                            </button>
                            <Link href="/admin/organizations" className="border px-4 py-2">
                                Back
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
