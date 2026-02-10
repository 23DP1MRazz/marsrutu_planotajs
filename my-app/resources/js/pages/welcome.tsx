import { Head } from '@inertiajs/react';
import { LandingPage } from '@/components/landing/LandingPage';
import '../../css/landing.css';

export default function Welcome() {
    return (
        <>
            <Head title="Maršrutu plānotājs kurjeriem" />
            <LandingPage />
        </>
    );
}
