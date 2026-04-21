import { Form, Head, Link } from '@inertiajs/react';
import { Spinner } from '@/components/ui/spinner';
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
    return (
        <AuthLayout
            title="Welcome back"
            description="Log in to manage your courier routes"
        >
            <Head title="Log in" />

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
                            <label htmlFor="email">Email address</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoFocus
                                autoComplete="email"
                                placeholder="you@example.com"
                            />
                            {errors.email && <span className="auth-error">{errors.email}</span>}
                        </div>

                        <div className="auth-field">
                            <div className="auth-helper-row">
                                <label htmlFor="password">Password</label>
                                {canResetPassword && (
                                    <Link href={request()} className="auth-forgot-link">
                                        Forgot password?
                                    </Link>
                                )}
                            </div>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                required
                                autoComplete="current-password"
                                placeholder="••••••••"
                            />
                            {errors.password && <span className="auth-error">{errors.password}</span>}
                        </div>

                        <label className="auth-checkbox-label">
                            <input type="checkbox" id="remember" name="remember" />
                            <span>Remember me</span>
                        </label>

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={processing}
                            data-test="login-button"
                        >
                            {processing ? <Spinner style={spinnerStyle} /> : null}
                            Log in
                        </button>

                        {canRegister && (
                            <p className="auth-footer-text">
                                Don&apos;t have an account?{' '}
                                <Link href={register()} className="auth-link">
                                    Sign up
                                </Link>
                            </p>
                        )}
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
