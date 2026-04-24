import { useTranslation } from '@/hooks/use-translation';

export function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <p className="footer-title">{t('landing.footer.title')}</p>
                    <p>{t('landing.footer.subtitle')}</p>
                    <p>&copy; 2026 | {t('landing.footer.project')}</p>
                </div>
            </div>
        </footer>
    );
}
