import { Form, Head, Link } from '@inertiajs/react';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

const spinnerStyle = {
    display: 'inline-block',
    marginRight: '8px',
    verticalAlign: 'middle',
} as const;

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Verify email"
            description="Please verify your email address by clicking on the link we just emailed to you."
        >
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="auth-success" style={{ marginBottom: '1.25rem' }}>
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <Form {...send.form()} className="auth-form">
                {({ processing }) => (
                    <>
                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={processing}
                        >
                            {processing ? <Spinner style={spinnerStyle} /> : null}
                            Resend verification email
                        </button>

                        <p className="auth-footer-text">
                            Need a different account?{' '}
                            <Link href={logout()} className="auth-link">
                                Log out
                            </Link>
                        </p>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
