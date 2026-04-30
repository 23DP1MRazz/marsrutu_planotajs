import { Link } from '@inertiajs/react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslation } from '@/hooks/use-translation';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import '../../../css/landing.css';
import '../../../css/auth-landing.css';

export default function AuthCardLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { t } = useTranslation();

    return (
        <div className="landing-root auth-shell">
            <header className="header" id="header">
                <div className="header-container">
                    <Link href={home()} className="logo">
                        MARŠRUTU PLĀNOTĀJS
                    </Link>
                    <nav className="nav">
                        <LanguageSwitcher />
                        <Link href={home()} className="auth-back-link">
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M19 12H5M12 5l-7 7 7 7" />
                            </svg>
                            <span>{t('auth.back_to_home')}</span>
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="auth-shell__main">
                <div className="auth-shell__blob auth-shell__blob--top" />
                <div className="auth-shell__blob auth-shell__blob--bottom" />

                <div className="auth-shell__content">
                    <div className="auth-shell__intro">
                        <div
                            className="auth-shell__brand-mark"
                            aria-hidden="true"
                        >
                            <svg
                                width="26"
                                height="26"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <path
                                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                                    stroke="white"
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        {title ? (
                            <h1 className="auth-shell__title">{title}</h1>
                        ) : null}
                        {description ? (
                            <p className="auth-shell__description">
                                {description}
                            </p>
                        ) : null}
                    </div>

                    <div className="auth-shell__card">{children}</div>
                </div>
            </main>

            <footer className="auth-shell__footer">
                <p className="auth-shell__footer-text">
                    {t('auth.footer_caption')}
                </p>
            </footer>
        </div>
    );
}
