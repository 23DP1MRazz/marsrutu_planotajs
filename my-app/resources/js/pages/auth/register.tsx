import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    // Toggle create/join fields in the form.
    const [organizationAction, setOrganizationAction] = useState<'create' | 'join'>('create');

    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="role">Role</Label>
                                <select
                                    id="role"
                                    name="role"
                                    required
                                    defaultValue="dispatcher"
                                    className="border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                                >
                                    <option value="dispatcher">Dispatcher</option>
                                    <option value="courier">Courier</option>
                                </select>
                                <InputError message={errors.role} />
                            </div>

                            <div className="grid gap-3">
                                <div className="grid gap-2">
                                    <Label>Organization</Label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="radio"
                                            name="org_action"
                                            value="create"
                                            checked={organizationAction === 'create'}
                                            onChange={() => {
                                                setOrganizationAction('create');
                                            }}
                                        />
                                        Create organization
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="radio"
                                            name="org_action"
                                            value="join"
                                            checked={organizationAction === 'join'}
                                            onChange={() => {
                                                setOrganizationAction('join');
                                            }}
                                        />
                                        Join organization
                                    </label>
                                    <InputError message={errors.org_action} />
                                </div>

                                {organizationAction === 'create' ? (
                                    <div className="grid gap-2">
                                        <Label htmlFor="organization_name">Organization name</Label>
                                        <Input
                                            id="organization_name"
                                            type="text"
                                            required
                                            tabIndex={1}
                                            name="organization_name"
                                            placeholder="Organization name"
                                        />
                                        <InputError message={errors.organization_name} />
                                    </div>
                                ) : (
                                    <div className="grid gap-2">
                                        <Label htmlFor="organization_join_code">Join code</Label>
                                        <Input
                                            id="organization_join_code"
                                            type="text"
                                            required
                                            tabIndex={1}
                                            name="organization_join_code"
                                            placeholder="ABC12345"
                                        />
                                        <InputError message={errors.organization_join_code} />
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={2}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Full name"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={3}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={5}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={6}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={6}>
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
