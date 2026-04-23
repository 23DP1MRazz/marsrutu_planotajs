import type { FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
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

export default function AdminOrganizationsEdit({
    organization,
}: AdminOrganizationEditProps) {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit organization" />

            <BackofficePage>
                <BackofficePageHeader
                    title="Edit Organization"
                    description="Update the organization name or generate a fresh join code."
                    actions={
                        <BackofficeActionLink
                            href="/admin/organizations"
                            variant="outline"
                        >
                            Back to organizations
                        </BackofficeActionLink>
                    }
                />

                <div className="grid gap-3 md:grid-cols-3">
                    <BackofficeStatCard
                        label="Join code"
                        value={
                            <span className="font-mono">
                                {organization.join_code}
                            </span>
                        }
                        meta="Current invite code"
                    />
                    <BackofficeStatCard
                        label="Assigned users"
                        value={organization.users_count}
                        meta="Users in this organization"
                    />
                    <BackofficeStatCard
                        label="Organization ID"
                        value={organization.id}
                        meta="Internal platform identifier"
                    />
                </div>

                <BackofficeCard>
                    <BackofficeCardBody>
                        <form className="space-y-5" onSubmit={submit}>
                            <BackofficeField
                                label="Organization name"
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
                                Regenerating the join code keeps the
                                organization the same, but old invite codes stop
                                working.
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
                                <button
                                    type="button"
                                    disabled={regenerateForm.processing}
                                    onClick={regenerateJoinCode}
                                    className={backofficeButtonClassName(
                                        'outline',
                                    )}
                                >
                                    Regenerate join code
                                </button>
                                <BackofficeActionLink
                                    href="/admin/organizations"
                                    variant="outline"
                                >
                                    Back
                                </BackofficeActionLink>
                            </div>
                        </form>
                    </BackofficeCardBody>
                </BackofficeCard>
            </BackofficePage>
        </AppLayout>
    );
}
