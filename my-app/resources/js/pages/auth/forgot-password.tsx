import { Form, Head, Link } from '@inertiajs/react';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/hooks/use-translation';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { email } from '@/routes/password';

const spinnerStyle = {
    display: 'inline-block',
    marginRight: '8px',
    verticalAlign: 'middle',
} as const;

export default function ForgotPassword({ status }: { status?: string }) {
    const { t } = useTranslation();

    return (
        <AuthLayout
            title={t('auth.forgot_password.title')}
            description={t('auth.forgot_password.description')}
        >
            <Head title={t('auth.forgot_password.title')} />

            {status && (
                <div
                    className="auth-success"
                    style={{ marginBottom: '1.25rem' }}
                >
                    {status}
                </div>
            )}

            <Form {...email.form()} className="auth-form">
                {({ processing, errors }) => (
                    <>
                        <div className="auth-field">
                            <label htmlFor="email">
                                {t('auth.fields.email_address')}
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="off"
                                autoFocus
                                placeholder={t('auth.placeholders.email')}
                            />
                            {errors.email && (
                                <span className="auth-error">
                                    {errors.email}
                                </span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={processing}
                            data-test="email-password-reset-link-button"
                        >
                            {processing ? (
                                <Spinner style={spinnerStyle} />
                            ) : null}
                            {t('auth.forgot_password.submit')}
                        </button>

                        <p className="auth-footer-text">
                            {t('auth.forgot_password.return_to_login')}{' '}
                            <Link href={login()} className="auth-link">
                                {t('auth.login.submit')}
                            </Link>
                        </p>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
