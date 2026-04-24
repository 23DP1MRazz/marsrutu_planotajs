import { Form, Head } from '@inertiajs/react';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/hooks/use-translation';
import AuthLayout from '@/layouts/auth-layout';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
};

const spinnerStyle = {
    display: 'inline-block',
    marginRight: '8px',
    verticalAlign: 'middle',
} as const;

export default function ResetPassword({ token, email }: Props) {
    const { t } = useTranslation();

    return (
        <AuthLayout
            title={t('auth.reset_password.title')}
            description={t('auth.reset_password.description')}
        >
            <Head title={t('auth.reset_password.title')} />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
                className="auth-form"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="auth-field">
                            <label htmlFor="email">
                                {t('auth.fields.email')}
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                readOnly
                            />
                            {errors.email && (
                                <span className="auth-error">
                                    {errors.email}
                                </span>
                            )}
                        </div>

                        <div className="auth-field">
                            <label htmlFor="password">
                                {t('auth.fields.password')}
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                autoComplete="new-password"
                                autoFocus
                                placeholder={t('auth.placeholders.password')}
                            />
                            {errors.password && (
                                <span className="auth-error">
                                    {errors.password}
                                </span>
                            )}
                        </div>

                        <div className="auth-field">
                            <label htmlFor="password_confirmation">
                                {t('auth.fields.confirm_password')}
                            </label>
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                autoComplete="new-password"
                                placeholder={t('auth.placeholders.password')}
                            />
                            {errors.password_confirmation && (
                                <span className="auth-error">
                                    {errors.password_confirmation}
                                </span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing ? (
                                <Spinner style={spinnerStyle} />
                            ) : null}
                            {t('auth.reset_password.submit')}
                        </button>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
