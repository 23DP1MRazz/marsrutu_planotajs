import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import {
    BackofficeActionLink,
    BackofficeCard,
    BackofficeCardBody,
    BackofficeField,
    BackofficeInfoNote,
    BackofficePage,
    BackofficePageHeader,
    BackofficeStatCard,
    backofficeButtonClassName,
    backofficeInputClassName,
} from '@/components/backoffice/ui';
import { useTranslation } from '@/hooks/use-translation';
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

export default function AdminOrganizationsEdit({
    organization,
}: AdminOrganizationEditProps) {
    const { t } = useTranslation();
    const form = useForm({
        name: organization.name,
    });

    const regenerateForm = useForm({});

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.patch(`/admin/organizations/${organization.id}`);
    };

    const regenerateJoinCode = () => {
        regenerateForm.post(
            `/admin/organizations/${organization.id}/regenerate-join-code`,
        );
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('dashboard.title'), href: '/dashboard' },
        { title: t('admin.organizations.title'), href: '/admin/organizations' },
        { title: t('admin.organizations.edit_title'), href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('admin.organizations.edit_title')} />

            <BackofficePage>
                <BackofficePageHeader
                    title={t('admin.organizations.edit_title')}
                    description={t('admin.organizations.edit_description')}
                    actions={
                        <BackofficeActionLink
                            href="/admin/organizations"
                            variant="outline"
                        >
                            {t('admin.organizations.back')}
                        </BackofficeActionLink>
                    }
                />

                <div className="grid gap-3 md:grid-cols-3">
                    <BackofficeStatCard
                        label={t('admin.organizations.join_code')}
                        value={
                            <span className="font-mono">
                                {organization.join_code}
                            </span>
                        }
                        meta={t('admin.organizations.current_join_code')}
                    />
                    <BackofficeStatCard
                        label={t('admin.organizations.users')}
                        value={organization.users_count}
                        meta={t('admin.organizations.users_this_org')}
                    />
                    <BackofficeStatCard
                        label={t('common.fields.organization_id')}
                        value={organization.id}
                        meta={t('admin.organizations.id_meta')}
                    />
                </div>

                <BackofficeCard>
                    <BackofficeCardBody>
                        <form className="space-y-5" onSubmit={submit}>
                            <BackofficeField
                                label={t('admin.organizations.name')}
                                error={form.errors.name}
                            >
                                <input
                                    id="name"
                                    type="text"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                    className={backofficeInputClassName}
                                />
                            </BackofficeField>

                            <BackofficeInfoNote>
                                {t('admin.organizations.regenerate_note')}
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
                                <button
                                    type="button"
                                    disabled={regenerateForm.processing}
                                    onClick={regenerateJoinCode}
                                    className={backofficeButtonClassName(
                                        'outline',
                                    )}
                                >
                                    {t('admin.organizations.regenerate')}
                                </button>
                                <BackofficeActionLink
                                    href="/admin/organizations"
                                    variant="outline"
                                >
                                    {t('common.actions.back')}
                                </BackofficeActionLink>
                            </div>
                        </form>
                    </BackofficeCardBody>
                </BackofficeCard>
            </BackofficePage>
        </AppLayout>
    );
}
