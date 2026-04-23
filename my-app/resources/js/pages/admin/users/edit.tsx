import type { FormEvent } from 'react';
import { Head } from '@inertiajs/react';
import {
    BackofficeActionLink,
    BackofficeCard,
    BackofficeCardBody,
    BackofficeField,
    BackofficeInfoNote,
    BackofficePage,
    BackofficePageHeader,
    backofficeButtonClassName,
    backofficeInputClassName,
    backofficeSelectClassName,
} from '@/components/backoffice/ui';
import AppLayout from '@/layouts/app-layout';
import { useForm } from '@inertiajs/react';
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
    { title: 'Users', href: '/admin/users' },
    { title: 'Edit user', href: '#' },
];

export default function AdminUsersEdit({
    user,
    roles,
    organizations,
}: AdminUserEditProps) {
    const form = useForm({
        name: user.name,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id
            ? String(user.organization_id)
            : '',
    });

    const selectedRoleNeedsOrganization = form.data.role !== 'admin';

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.patch(`/admin/users/${user.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit user" />

            <BackofficePage>
                <BackofficePageHeader
                    title="Edit User"
                    description="Update role and organization carefully. Users with the admin role stay global."
                    actions={
                        <BackofficeActionLink
                            href="/admin/users"
                            variant="outline"
                        >
                            Back to users
                        </BackofficeActionLink>
                    }
                />

                <BackofficeCard>
                    <BackofficeCardBody>
                        <form className="space-y-5" onSubmit={submit}>
                            <div className="grid gap-4 md:grid-cols-2">
                                <BackofficeField
                                    label="Name"
                                    error={form.errors.name}
                                >
                                    <input
                                        id="name"
                                        type="text"
                                        value={form.data.name}
                                        onChange={(event) =>
                                            form.setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        className={backofficeInputClassName}
                                    />
                                </BackofficeField>

                                <BackofficeField
                                    label="Email"
                                    error={form.errors.email}
                                >
                                    <input
                                        id="email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={(event) =>
                                            form.setData(
                                                'email',
                                                event.target.value,
                                            )
                                        }
                                        className={backofficeInputClassName}
                                    />
                                </BackofficeField>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <BackofficeField
                                    label="Role"
                                    error={form.errors.role}
                                >
                                    <select
                                        id="role"
                                        value={form.data.role}
                                        onChange={(event) => {
                                            const nextRole = event.target.value;

                                            form.setData((data) => ({
                                                ...data,
                                                role: nextRole,
                                                organization_id:
                                                    nextRole === 'admin'
                                                        ? ''
                                                        : data.organization_id,
                                            }));
                                        }}
                                        className={backofficeSelectClassName}
                                    >
                                        {roles.map((role) => (
                                            <option key={role} value={role}>
                                                {role}
                                            </option>
                                        ))}
                                    </select>
                                </BackofficeField>

                                <BackofficeField
                                    label="Organization"
                                    error={form.errors.organization_id}
                                >
                                    <select
                                        id="organization_id"
                                        value={form.data.organization_id}
                                        onChange={(event) =>
                                            form.setData(
                                                'organization_id',
                                                event.target.value,
                                            )
                                        }
                                        disabled={
                                            !selectedRoleNeedsOrganization
                                        }
                                        className={backofficeSelectClassName}
                                    >
                                        <option value="">
                                            {selectedRoleNeedsOrganization
                                                ? 'Select organization'
                                                : 'Not needed for admin'}
                                        </option>
                                        {organizations.map((organization) => (
                                            <option
                                                key={organization.id}
                                                value={organization.id}
                                            >
                                                {organization.name}
                                            </option>
                                        ))}
                                    </select>
                                </BackofficeField>
                            </div>

                            <BackofficeInfoNote>
                                <p>
                                    Current organization:{' '}
                                    {user.organization_name ?? '-'}
                                </p>
                                <p className="mt-1">
                                    Changing a courier with existing route or
                                    route records is blocked by backend safety
                                    checks.
                                </p>
                            </BackofficeInfoNote>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className={backofficeButtonClassName(
                                        'primary',
                                    )}
                                >
                                    Save
                                </button>
                                <BackofficeActionLink
                                    href="/admin/users"
                                    variant="outline"
                                >
                                    Cancel
                                </BackofficeActionLink>
                            </div>
                        </form>
                    </BackofficeCardBody>
                </BackofficeCard>
            </BackofficePage>
        </AppLayout>
    );
}
