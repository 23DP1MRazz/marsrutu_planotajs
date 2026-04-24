import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/hooks/use-translation';
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
    const { t } = useTranslation();
    const {
        registerPrefill: { join_code: joinCode },
    } = usePage<SharedData>().props;
    const [organizationAction, setOrganizationAction] = useState<
        'create' | 'join'
    >(joinCode ? 'join' : 'create');

    return (
        <AuthLayout
            title={t('auth.register.title')}
            description={t('auth.register.description')}
        >
            <Head title={t('auth.register.title')} />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="auth-form"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="auth-field">
                            <label htmlFor="role">
                                {t('auth.fields.role')}
                            </label>
                            <select
                                id="role"
                                name="role"
                                required
                                defaultValue="dispatcher"
                            >
                                <option value="dispatcher">
                                    {t('auth.roles.dispatcher')}
                                </option>
                                <option value="courier">
                                    {t('auth.roles.courier')}
                                </option>
                            </select>
                            {errors.role && (
                                <span className="auth-error">
                                    {errors.role}
                                </span>
                            )}
                        </div>

                        <div className="auth-field">
                            <span className="auth-section-label">
                                {t('auth.fields.organization')}
                            </span>
                            <div className="auth-radio-group">
                                <label className="auth-radio-label">
                                    <input
                                        type="radio"
                                        name="org_action"
                                        value="create"
                                        checked={
                                            organizationAction === 'create'
                                        }
                                        onChange={() =>
                                            setOrganizationAction('create')
                                        }
                                    />
                                    <div>
                                        <div
                                            style={{
                                                fontWeight: 500,
                                                fontSize: '0.9375rem',
                                            }}
                                        >
                                            {t(
                                                'auth.register.create_organization',
                                            )}
                                        </div>
                                        <div
                                            className="auth-footer-text"
                                            style={{ marginTop: 0 }}
                                        >
                                            {t(
                                                'auth.register.create_organization_hint',
                                            )}
                                        </div>
                                    </div>
                                </label>
                                <label className="auth-radio-label">
                                    <input
                                        type="radio"
                                        name="org_action"
                                        value="join"
                                        checked={organizationAction === 'join'}
                                        onChange={() =>
                                            setOrganizationAction('join')
                                        }
                                    />
                                    <div>
                                        <div
                                            style={{
                                                fontWeight: 500,
                                                fontSize: '0.9375rem',
                                            }}
                                        >
                                            {t(
                                                'auth.register.join_organization',
                                            )}
                                        </div>
                                        <div
                                            className="auth-footer-text"
                                            style={{ marginTop: 0 }}
                                        >
                                            {t(
                                                'auth.register.join_organization_hint',
                                            )}
                                        </div>
                                    </div>
                                </label>
                            </div>
                            {errors.org_action && (
                                <span className="auth-error">
                                    {errors.org_action}
                                </span>
                            )}
                        </div>

                        {organizationAction === 'create' ? (
                            <div className="auth-field">
                                <label htmlFor="organization_name">
                                    {t('auth.fields.organization_name')}
                                </label>
                                <input
                                    id="organization_name"
                                    type="text"
                                    name="organization_name"
                                    required
                                    placeholder={t(
                                        'auth.placeholders.organization_name',
                                    )}
                                />
                                {errors.organization_name && (
                                    <span className="auth-error">
                                        {errors.organization_name}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="auth-field">
                                <label htmlFor="organization_join_code">
                                    {t('auth.fields.join_code')}
                                </label>
                                <input
                                    id="organization_join_code"
                                    type="text"
                                    name="organization_join_code"
                                    required
                                    placeholder={t(
                                        'auth.placeholders.join_code',
                                    )}
                                    defaultValue={joinCode ?? ''}
                                    style={joinCodeInputStyle}
                                />
                                {errors.organization_join_code && (
                                    <span className="auth-error">
                                        {errors.organization_join_code}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="auth-divider">
                            {t('auth.register.personal_details')}
                        </div>

                        <div className="auth-field">
                            <label htmlFor="name">
                                {t('auth.fields.full_name')}
                            </label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                required
                                autoFocus
                                autoComplete="name"
                                placeholder={t('auth.placeholders.full_name')}
                            />
                            {errors.name && (
                                <span className="auth-error">
                                    {errors.name}
                                </span>
                            )}
                        </div>

                        <div className="auth-field">
                            <label htmlFor="email">
                                {t('auth.fields.email_address')}
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                required
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
                            <label htmlFor="password">
                                {t('auth.fields.password')}
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                required
                                autoComplete="new-password"
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
                                required
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
                            data-test="register-user-button"
                        >
                            {processing ? (
                                <Spinner style={spinnerStyle} />
                            ) : null}
                            {t('auth.register.create_account')}
                        </button>

                        <p className="auth-footer-text">
                            {t('auth.register.already_have_account')}{' '}
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
