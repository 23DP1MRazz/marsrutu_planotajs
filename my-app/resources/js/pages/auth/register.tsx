import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';
import type { SharedData } from '@/types';

const joinCodeInputStyle = {
    fontFamily: 'monospace',
    letterSpacing: '0.05em',
} as const;

const spinnerStyle = {
    display: 'inline-block',
    marginRight: '8px',
    verticalAlign: 'middle',
} as const;

export default function Register() {
    const {
        registerPrefill: { join_code: joinCode },
    } = usePage<SharedData>().props;
    const [organizationAction, setOrganizationAction] = useState<'create' | 'join'>(
        joinCode ? 'join' : 'create',
    );

    return (
        <AuthLayout
            title="Create an account"
            description="Join your organization and start managing deliveries"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="auth-form"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="auth-field">
                            <label htmlFor="role">Your role</label>
                            <select id="role" name="role" required defaultValue="dispatcher">
                                <option value="dispatcher">Dispatcher</option>
                                <option value="courier">Courier</option>
                            </select>
                            {errors.role && <span className="auth-error">{errors.role}</span>}
                        </div>

                        <div className="auth-field">
                            <span className="auth-section-label">Organization</span>
                            <div className="auth-radio-group">
                                <label className="auth-radio-label">
                                    <input
                                        type="radio"
                                        name="org_action"
                                        value="create"
                                        checked={organizationAction === 'create'}
                                        onChange={() => setOrganizationAction('create')}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>
                                            Create a new organization
                                        </div>
                                        <div
                                            className="auth-footer-text"
                                            style={{ marginTop: 0 }}
                                        >
                                            Start fresh with a new team
                                        </div>
                                    </div>
                                </label>
                                <label className="auth-radio-label">
                                    <input
                                        type="radio"
                                        name="org_action"
                                        value="join"
                                        checked={organizationAction === 'join'}
                                        onChange={() => setOrganizationAction('join')}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>
                                            Join an existing organization
                                        </div>
                                        <div
                                            className="auth-footer-text"
                                            style={{ marginTop: 0 }}
                                        >
                                            Use an invite code to join
                                        </div>
                                    </div>
                                </label>
                            </div>
                            {errors.org_action && <span className="auth-error">{errors.org_action}</span>}
                        </div>

                        {organizationAction === 'create' ? (
                            <div className="auth-field">
                                <label htmlFor="organization_name">Organization name</label>
                                <input
                                    id="organization_name"
                                    type="text"
                                    name="organization_name"
                                    required
                                    placeholder="e.g. Riga Fast Delivery"
                                />
                                {errors.organization_name && <span className="auth-error">{errors.organization_name}</span>}
                            </div>
                        ) : (
                            <div className="auth-field">
                                <label htmlFor="organization_join_code">Join code</label>
                                <input
                                    id="organization_join_code"
                                    type="text"
                                    name="organization_join_code"
                                    required
                                    placeholder="e.g. ABC12345"
                                    defaultValue={joinCode ?? ''}
                                    style={joinCodeInputStyle}
                                />
                                {errors.organization_join_code && <span className="auth-error">{errors.organization_join_code}</span>}
                            </div>
                        )}

                        <div className="auth-divider">Personal details</div>

                        <div className="auth-field">
                            <label htmlFor="name">Full name</label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                required
                                autoFocus
                                autoComplete="name"
                                placeholder="Your full name"
                            />
                            {errors.name && <span className="auth-error">{errors.name}</span>}
                        </div>

                        <div className="auth-field">
                            <label htmlFor="email">Email address</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoComplete="email"
                                placeholder="you@example.com"
                            />
                            {errors.email && <span className="auth-error">{errors.email}</span>}
                        </div>

                        <div className="auth-field">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                required
                                autoComplete="new-password"
                                placeholder="••••••••"
                            />
                            {errors.password && <span className="auth-error">{errors.password}</span>}
                        </div>

                        <div className="auth-field">
                            <label htmlFor="password_confirmation">Confirm password</label>
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                required
                                autoComplete="new-password"
                                placeholder="••••••••"
                            />
                            {errors.password_confirmation && <span className="auth-error">{errors.password_confirmation}</span>}
                        </div>

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={processing}
                            data-test="register-user-button"
                        >
                            {processing ? <Spinner style={spinnerStyle} /> : null}
                            Create account
                        </button>

                        <p className="auth-footer-text">
                            Already have an account?{' '}
                            <Link href={login()} className="auth-link">
                                Log in
                            </Link>
                        </p>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
