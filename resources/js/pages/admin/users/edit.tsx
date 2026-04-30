import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
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
import { useTranslation } from '@/hooks/use-translation';
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

export default function AdminUsersEdit({
    user,
    roles,
    organizations,
}: AdminUserEditProps) {
    const { t } = useTranslation();
    const form = useForm({
        name: user.name,
        email: user.email,
        role: user.role,
        organization_id: user.organization_id
            ? String(user.organization_id)
            : '',
    });

    const selectedRoleNeedsOrganization = form.data.role !== 'admin';
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('dashboard.title'), href: '/dashboard' },
        { title: t('admin.users.title'), href: '/admin/users' },
        { title: t('admin.users.edit_title'), href: '#' },
    ];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.patch(`/admin/users/${user.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('admin.users.edit_title')} />

            <BackofficePage>
                <BackofficePageHeader
                    title={t('admin.users.edit_title')}
                    description={t('admin.users.edit_description')}
                    actions={
                        <BackofficeActionLink
                            href="/admin/users"
                            variant="outline"
                        >
                            {t('admin.users.back')}
                        </BackofficeActionLink>
                    }
                />

                <BackofficeCard>
                    <BackofficeCardBody>
                        <form className="space-y-5" onSubmit={submit}>
                            <div className="grid gap-4 md:grid-cols-2">
                                <BackofficeField
                                    label={t('common.fields.name')}
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
                                    label={t('common.fields.email')}
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
                                    label={t('common.fields.role')}
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
                                                {t(`common.roles.${role}`)}
                                            </option>
                                        ))}
                                    </select>
                                </BackofficeField>

                                <BackofficeField
                                    label={t('common.fields.organization')}
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
                                                ? t(
                                                      'admin.users.select_organization',
                                                  )
                                                : t('admin.users.admin_no_org')}
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
                                    {t('admin.users.current_organization', {
                                        organization:
                                            user.organization_name ?? '-',
                                    })}
                                </p>
                                <p className="mt-1">
                                    {t('admin.users.route_safety_note')}
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
                                    {t('common.actions.save')}
                                </button>
                                <BackofficeActionLink
                                    href="/admin/users"
                                    variant="outline"
                                >
                                    {t('common.actions.cancel')}
                                </BackofficeActionLink>
                            </div>
                        </form>
                    </BackofficeCardBody>
                </BackofficeCard>
            </BackofficePage>
        </AppLayout>
    );
}
