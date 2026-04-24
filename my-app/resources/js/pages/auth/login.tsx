import { Form, Head, Link } from '@inertiajs/react';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/hooks/use-translation';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

const spinnerStyle = {
    display: 'inline-block',
    marginRight: '8px',
    verticalAlign: 'middle',
} as const;

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const { t } = useTranslation();

    return (
        <AuthLayout
            title={t('auth.login.title')}
            description={t('auth.login.description')}
        >
            <Head title={t('auth.login.submit')} />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="auth-form"
            >
                {({ processing, errors }) => (
                    <>
                        {status && (
                            <div
                                className="auth-success"
                                style={{ marginBottom: '1.25rem' }}
                            >
                                {status}
                            </div>
                        )}

                        <div className="auth-field">
                            <label htmlFor="email">
                                {t('auth.fields.email_address')}
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoFocus
                                autoComplete="email"
                                placeholder={t('auth.placeholders.email')}
                            />
                            {errors.email && (
                                <span className="auth-error">
                                    {errors.email}
                                </span>
                            )}
                        </div>

                        <div className="auth-field">
                            <div className="auth-helper-row">
                                <label htmlFor="password">
                                    {t('auth.fields.password')}
                                </label>
                                {canResetPassword && (
                                    <Link
                                        href={request()}
                                        className="auth-forgot-link"
                                    >
                                        {t('auth.forgot_password.link')}
                                    </Link>
                                )}
                            </div>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                required
                                autoComplete="current-password"
                                placeholder={t('auth.placeholders.password')}
                            />
                            {errors.password && (
                                <span className="auth-error">
                                    {errors.password}
                                </span>
                            )}
                        </div>

                        <label className="auth-checkbox-label">
                            <input
                                type="checkbox"
                                id="remember"
                                name="remember"
                            />
                            <span>{t('auth.login.remember')}</span>
                        </label>

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={processing}
                            data-test="login-button"
                        >
                            {processing ? (
                                <Spinner style={spinnerStyle} />
                            ) : null}
                            {t('auth.login.submit')}
                        </button>

                        {canRegister && (
                            <p className="auth-footer-text">
                                {t('auth.login.no_account')}{' '}
                                <Link href={register()} className="auth-link">
                                    {t('auth.register.create_account')}
                                </Link>
                            </p>
                        )}
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
