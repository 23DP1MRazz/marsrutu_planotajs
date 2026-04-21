import { Form, Head, Link } from '@inertiajs/react';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { email } from '@/routes/password';

const spinnerStyle = {
    display: 'inline-block',
    marginRight: '8px',
    verticalAlign: 'middle',
} as const;

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Forgot password"
            description="Enter your email to receive a password reset link"
        >
            <Head title="Forgot password" />

            {status && (
                <div className="auth-success" style={{ marginBottom: '1.25rem' }}>
                    {status}
                </div>
            )}

            <Form {...email.form()} className="auth-form">
                {({ processing, errors }) => (
                    <>
                        <div className="auth-field">
                            <label htmlFor="email">Email address</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="off"
                                autoFocus
                                placeholder="you@example.com"
                            />
                            {errors.email && <span className="auth-error">{errors.email}</span>}
                        </div>

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={processing}
                            data-test="email-password-reset-link-button"
                        >
                            {processing ? <Spinner style={spinnerStyle} /> : null}
                            Email password reset link
                        </button>

                        <p className="auth-footer-text">
                            Or, return to{' '}
                            <Link href={login()} className="auth-link">
                                log in
                            </Link>
                        </p>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
