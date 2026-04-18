import type { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type AdminUserEditProps = {
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
        organization_id: number | null;
        organization_name: string | null;
    };
    roles: string[];
    organizations: Array<{
        id: number;
        name: string;
    }>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Admin users', href: '/admin/users' },
    { title: 'Edit user', href: '#' },
];

export default function AdminUsersEdit({ user, roles, organizations }: AdminUserEditProps) {
    const form = useForm({
        name: user.name,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id ? String(user.organization_id) : '',
    });

    const selectedRoleNeedsOrganization = form.data.role !== 'admin';

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.patch(`/admin/users/${user.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit user" />

            <div className="space-y-4 p-4">
                <div className="border p-4">
                    <h1 className="text-xl font-semibold">Edit user</h1>
                    <p className="text-sm text-muted-foreground">
                        Update role and organization carefully. Admin users stay global.
                    </p>
                </div>

                <div className="border p-4">
                    <form className="space-y-4" onSubmit={submit}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <label htmlFor="name" className="block text-sm">
                                    Name
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

                            <div className="space-y-1">
                                <label htmlFor="email" className="block text-sm">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(event) => form.setData('email', event.target.value)}
                                    className="w-full border px-3 py-2"
                                />
                                {form.errors.email && (
                                    <p className="text-sm text-red-600">{form.errors.email}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <label htmlFor="role" className="block text-sm">
                                    Role
                                </label>
                                <select
                                    id="role"
                                    value={form.data.role}
                                    onChange={(event) => {
                                        const nextRole = event.target.value;

                                        form.setData((data) => ({
                                            ...data,
                                            role: nextRole,
                                            organization_id: nextRole === 'admin'
                                                ? ''
                                                : data.organization_id,
                                        }));
                                    }}
                                    className="w-full border px-3 py-2"
                                >
                                    {roles.map((role) => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.role && (
                                    <p className="text-sm text-red-600">{form.errors.role}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="organization_id" className="block text-sm">
                                    Organization
                                </label>
                                <select
                                    id="organization_id"
                                    value={form.data.organization_id}
                                    onChange={(event) =>
                                        form.setData('organization_id', event.target.value)
                                    }
                                    disabled={!selectedRoleNeedsOrganization}
                                    className="w-full border px-3 py-2 disabled:opacity-60"
                                >
                                    <option value="">
                                        {selectedRoleNeedsOrganization
                                            ? 'Select organization'
                                            : 'Not needed for admin'}
                                    </option>
                                    {organizations.map((organization) => (
                                        <option key={organization.id} value={organization.id}>
                                            {organization.name}
                                        </option>
                                    ))}
                                </select>
                                {form.errors.organization_id && (
                                    <p className="text-sm text-red-600">
                                        {form.errors.organization_id}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="border p-3 text-sm text-muted-foreground">
                            <p>Current organization: {user.organization_name ?? '-'}</p>
                            <p>
                                Changing a courier with existing route or vehicle records is blocked
                                by backend safety checks.
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="border px-4 py-2"
                            >
                                Save
                            </button>
                            <Link href="/admin/users" className="border px-4 py-2">
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
