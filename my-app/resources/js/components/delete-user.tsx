import { Form } from '@inertiajs/react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import {
    BackofficeCard,
    BackofficeCardBody,
    backofficeInputClassName,
} from '@/components/backoffice/ui';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/use-translation';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    return (
        <BackofficeCard>
            <BackofficeCardBody className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#111827]">
                        {t('settings.delete_account.title')}
                    </h2>
                    <p className="mt-1 text-sm text-[#6b7280]">
                        {t('settings.delete_account.description')}
                    </p>
                </div>
                <div className="space-y-4 rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4">
                    <div className="space-y-0.5 text-[#b91c1c]">
                        <p className="font-semibold">
                            {t('settings.delete_account.warning')}
                        </p>
                        <p className="text-sm">
                            {t('settings.delete_account.warning_description')}
                        </p>
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <button
                                type="button"
                                className="inline-flex h-10 items-center justify-center rounded-lg border border-[#fca5a5] bg-white px-4 text-sm font-semibold text-[#b91c1c] transition hover:border-[#ef4444] hover:bg-[#fee2e2] hover:text-[#991b1b]"
                                data-test="delete-user-button"
                            >
                                {t('settings.delete_account.title')}
                            </button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogTitle>
                                {t('settings.delete_account.confirm_title')}
                            </DialogTitle>
                            <DialogDescription>
                                {t(
                                    'settings.delete_account.confirm_description',
                                )}
                            </DialogDescription>

                            <Form
                                {...ProfileController.destroy()}
                                options={{
                                    preserveScroll: true,
                                }}
                                onError={() => passwordInput.current?.focus()}
                                resetOnSuccess
                                className="space-y-6"
                            >
                                {({
                                    resetAndClearErrors,
                                    processing,
                                    errors,
                                }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <label
                                                htmlFor="password"
                                                className="text-xs font-semibold tracking-[0.02em] text-[#6b7280]"
                                            >
                                                {t('auth.fields.password')}
                                            </label>

                                            <input
                                                id="password"
                                                type="password"
                                                name="password"
                                                ref={passwordInput}
                                                className={
                                                    backofficeInputClassName
                                                }
                                                placeholder={t(
                                                    'settings.delete_account.password_placeholder',
                                                )}
                                                autoComplete="current-password"
                                            />

                                            {errors.password ? (
                                                <p className="text-sm text-red-600">
                                                    {errors.password}
                                                </p>
                                            ) : null}
                                        </div>

                                        <DialogFooter className="gap-2">
                                            <DialogClose asChild>
                                                <button
                                                    type="button"
                                                    className="inline-flex h-10 items-center justify-center rounded-lg border border-[#e5e7eb] bg-transparent px-4 text-sm font-semibold text-[#111827] transition hover:border-[#6b7280] hover:bg-[#f9fafb]"
                                                    onClick={() =>
                                                        resetAndClearErrors()
                                                    }
                                                >
                                                    {t('common.actions.cancel')}
                                                </button>
                                            </DialogClose>

                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#dc2626] px-4 text-sm font-semibold text-white transition hover:bg-[#b91c1c] disabled:cursor-not-allowed disabled:opacity-60"
                                                data-test="confirm-delete-user-button"
                                            >
                                                {t(
                                                    'settings.delete_account.title',
                                                )}
                                            </button>
                                        </DialogFooter>
                                    </>
                                )}
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </BackofficeCardBody>
        </BackofficeCard>
    );
}
