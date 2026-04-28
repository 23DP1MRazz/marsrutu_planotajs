import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { useRef } from 'react';
import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import {
    BackofficeCard,
    BackofficeCardBody,
    BackofficeField,
    backofficeButtonClassName,
    backofficeInputClassName,
} from '@/components/backoffice/ui';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/user-password';
import type { BreadcrumbItem } from '@/types';

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('settings.layout.password'),
            href: edit().url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.layout.password')} />

            <h1 className="sr-only">{t('settings.layout.password')}</h1>

            <SettingsLayout>
                <BackofficeCard>
                    <BackofficeCardBody className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#111827]">
                                {t('settings.password.title')}
                            </h2>
                            <p className="mt-1 text-sm text-[#6b7280]">
                                {t('settings.password.description')}
                            </p>
                        </div>
                        <Form
                            {...PasswordController.update.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            resetOnError={[
                                'password',
                                'password_confirmation',
                                'current_password',
                            ]}
                            resetOnSuccess
                            onError={(errors) => {
                                if (errors.password) {
                                    passwordInput.current?.focus();
                                }

                                if (errors.current_password) {
                                    currentPasswordInput.current?.focus();
                                }
                            }}
                            className="space-y-6"
                        >
                            {({ errors, processing, recentlySuccessful }) => (
                                <>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <BackofficeField
                                            label={t(
                                                'settings.password.current_password',
                                            )}
                                            error={errors.current_password}
                                        >
                                            <input
                                                id="current_password"
                                                ref={currentPasswordInput}
                                                name="current_password"
                                                type="password"
                                                className={
                                                    backofficeInputClassName
                                                }
                                                autoComplete="current-password"
                                                placeholder={t(
                                                    'settings.password.current_password',
                                                )}
                                            />
                                        </BackofficeField>

                                        <div className="hidden md:block" />

                                        <BackofficeField
                                            label={t(
                                                'settings.password.new_password',
                                            )}
                                            error={errors.password}
                                        >
                                            <input
                                                id="password"
                                                ref={passwordInput}
                                                name="password"
                                                type="password"
                                                className={
                                                    backofficeInputClassName
                                                }
                                                autoComplete="new-password"
                                                placeholder={t(
                                                    'settings.password.new_password',
                                                )}
                                            />
                                        </BackofficeField>

                                        <BackofficeField
                                            label={t(
                                                'settings.password.confirm_password',
                                            )}
                                            error={errors.password_confirmation}
                                        >
                                            <input
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                type="password"
                                                className={
                                                    backofficeInputClassName
                                                }
                                                autoComplete="new-password"
                                                placeholder={t(
                                                    'settings.password.confirm_password',
                                                )}
                                            />
                                        </BackofficeField>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            data-test="update-password-button"
                                            className={backofficeButtonClassName(
                                                'primary',
                                            )}
                                        >
                                            {t('settings.password.save')}
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
            </SettingsLayout>
        </AppLayout>
    );
}
