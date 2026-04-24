import { Head } from '@inertiajs/react';
import { LandingPage } from '@/components/landing/LandingPage';
import { useTranslation } from '@/hooks/use-translation';
import '../../css/landing.css';

export default function Welcome() {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('landing.footer.title')} />
            <LandingPage />
        </>
    );
}
