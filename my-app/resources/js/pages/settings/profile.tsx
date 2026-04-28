import { Transition } from '@headlessui/react';
import { Form, Head, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import {
    BackofficeCard,
    BackofficeCardBody,
    BackofficeField,
    backofficeButtonClassName,
    backofficeInputClassName,
} from '@/components/backoffice/ui';
import DeleteUser from '@/components/delete-user';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import type { BreadcrumbItem, SharedData } from '@/types';

export default function Profile() {
    const { auth } = usePage<SharedData>().props;
    const { t } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('settings.layout.profile'),
            href: edit().url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.layout.profile')} />

            <h1 className="sr-only">{t('settings.layout.profile')}</h1>

            <SettingsLayout>
                <BackofficeCard>
                    <BackofficeCardBody className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#111827]">
                                {t('settings.profile.title')}
                            </h2>
                            <p className="mt-1 text-sm text-[#6b7280]">
                                {t('settings.profile.description')}
                            </p>
                        </div>
                        <Form
                            {...ProfileController.update()}
                            options={{
                                preserveScroll: true,
                            }}
                            className="space-y-6"
                        >
                            {({ processing, recentlySuccessful, errors }) => (
                                <>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <BackofficeField
                                            label={t('common.fields.name')}
                                            error={errors.name}
                                        >
                                            <input
                                                id="name"
                                                className={
                                                    backofficeInputClassName
                                                }
                                                defaultValue={auth.user.name}
                                                name="name"
                                                required
                                                autoComplete="name"
                                                placeholder={t(
                                                    'settings.profile.full_name_placeholder',
                                                )}
                                            />
                                        </BackofficeField>

                                        <BackofficeField
                                            label={t(
                                                'auth.fields.email_address',
                                            )}
                                            error={errors.email}
                                        >
                                            <input
                                                id="email"
                                                type="email"
                                                className={
                                                    backofficeInputClassName
                                                }
                                                defaultValue={auth.user.email}
                                                name="email"
                                                required
                                                autoComplete="username"
                                                placeholder={t(
                                                    'settings.profile.email_placeholder',
                                                )}
                                            />
                                        </BackofficeField>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            data-test="update-profile-button"
                                            className={backofficeButtonClassName(
                                                'primary',
                                            )}
                                        >
                                            {t('common.actions.save')}
                                        </button>

                                        <Transition
                                            show={recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="text-sm text-neutral-600">
                                                {t('settings.profile.saved')}
                                            </p>
                                        </Transition>
                                    </div>
                                </>
                            )}
                        </Form>
                    </BackofficeCardBody>
                </BackofficeCard>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
