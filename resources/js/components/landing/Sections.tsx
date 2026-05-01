import { useTranslation } from '@/hooks/use-translation';
import { AuthButton } from './AuthButton';
import { featureCards, howItWorksSteps, targetUsers } from './data';
import { LandingLink } from './Header';

function HeroSection() {
    const { t } = useTranslation();

    return (
        <section className="hero" id="hero">
            <div className="container">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1>{t('landing.hero.title')}</h1>
                        <p className="subtitle">{t('landing.hero.subtitle')}</p>
                        <div className="hero-actions">
                            <AuthButton />
                            <LandingLink
                                href="#about"
                                className="btn btn-secondary"
                            >
                                {t('landing.hero.learn_more')}
                            </LandingLink>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-placeholder">
                            <span>{t('landing.hero.photo')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function AboutSection() {
    const { t } = useTranslation();
    const benefits = ['control', 'realtime', 'structured'] as const;

    return (
        <section className="about" id="about">
            <div className="container">
                <div className="about-content">
                    <h2>{t('landing.about.title')}</h2>
                    <p className="about-intro">{t('landing.about.intro')}</p>

                    <div className="benefits-list">
                        {benefits.map((benefit) => (
                            <div className="benefit-item" key={benefit}>
                                <h3>
                                    {t(
                                        `landing.about.benefits.${benefit}.title`,
                                    )}
                                </h3>
                                <p>
                                    {t(
                                        `landing.about.benefits.${benefit}.description`,
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function HowItWorksSection() {
    const { t } = useTranslation();

    return (
        <section className="how-it-works" id="how-it-works">
            <div className="container">
                <h2>{t('landing.how.title')}</h2>
                <div className="steps">
                    {howItWorksSteps.map((step, index) => (
                        <div className="step" key={step}>
                            <div className="step-number">{index + 1}</div>
                            <h3>{t(`landing.how.steps.${step}.title`)}</h3>
                            <p>{t(`landing.how.steps.${step}.description`)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FeaturesSection() {
    const { t } = useTranslation();

    return (
        <section className="features" id="features">
            <div className="container">
                <h2>{t('landing.features.title')}</h2>
                <div className="features-grid">
                    {featureCards.map((feature) => (
                        <div className="feature-card" key={feature.key}>
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>
                                {t(`landing.features.${feature.key}.title`)}
                            </h3>
                            <p>
                                {t(
                                    `landing.features.${feature.key}.description`,
                                )}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function TargetUsersSection() {
    const { t } = useTranslation();

    return (
        <section className="target-users" id="users">
            <div className="container">
                <h2>{t('landing.users.title')}</h2>
                <div className="users-grid">
                    {targetUsers.map((user) => (
                        <div className="user-card" key={user.key}>
                            <h3>{t(`landing.users.${user.key}.title`)}</h3>
                            <p>{t(`landing.users.${user.key}.subtitle`)}</p>
                            <ul className="user-benefits">
                                {user.benefits.map((benefit) => (
                                    <li key={benefit}>
                                        {t(
                                            `landing.users.${user.key}.benefits.${benefit}`,
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function CTASection() {
    const { t } = useTranslation();

    return (
        <section className="cta" id="cta">
            <div className="container">
                <h2>{t('landing.cta.title')}</h2>
                <p>{t('landing.cta.description')}</p>
                <AuthButton />
            </div>
        </section>
    );
}

export function Sections() {
    return (
        <>
            <HeroSection />
            <AboutSection />
            <HowItWorksSection />
            <FeaturesSection />
            <TargetUsersSection />
            <CTASection />
        </>
    );
}
