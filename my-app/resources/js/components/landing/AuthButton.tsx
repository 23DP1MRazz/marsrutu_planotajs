import { Link } from '@inertiajs/react';
import { useTranslation } from '@/hooks/use-translation';
import { login } from '@/routes';

export function AuthButton() {
    const { t } = useTranslation();

    return (
        <Link href={login()} className="btn btn-primary">
            {t('landing.sign_in')}
        </Link>
    );
}
