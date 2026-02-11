import { featureCards, howItWorksSteps, targetUsers } from './data';
import { SignUpButton } from './SignUpButton';

function HeroSection() {
    return (
        <section className="hero" id="hero">
            <div className="container">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1>
                            Pārvaldiet kurjeru maršrutus efektīvi un
                            strukturēti
                        </h1>
                        <p className="subtitle">
                            Iekšējā web sistēma sīkajām un vidējām piegādes
                            kompānijām. Aizstājiet Excel tabulas ar
                            profesionālu maršrutu plānošanas rīku.
                        </p>
                        <div className="hero-actions">
                            <SignUpButton />
                            <a href="#about" className="btn btn-secondary">
                                Uzzināt vairāk
                            </a>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-placeholder">
                            <span>Photo</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function AboutSection() {
    return (
        <section className="about" id="about">
            <div className="container">
                <div className="about-content">
                    <h2>Par sistēmu</h2>
                    <p className="about-intro">
                        Maršrutu plānotājs ir iekšēja web lietojumprogramma,
                        kas paredzēta loģistikas uzņēmumiem. Sistēma nodrošina
                        centralizētu un strukturētu pieeju pasūtījumu
                        pārvaldībai, maršrutu plānošanai un piegāžu izpildes
                        kontrolei reāllaikā.
                    </p>

                    <div className="benefits-list">
                        <div className="benefit-item">
                            <h3>Centralizēta kontrole</h3>
                            <p>
                                Visi pasūtījumi, maršruti un kurjeri vienuviet.
                                Dispečeri var plānot un pārraudzīt visu procesu
                                no vienas platformas.
                            </p>
                        </div>
                        <div className="benefit-item">
                            <h3>Reāllaika pārskatāmība</h3>
                            <p>
                                Sekojiet piegāžu statusiem un saņemiet
                                atjauninājumus tiešsaistē. Nekādu komunikācijas
                                problēmu vai zaudētas informācijas.
                            </p>
                        </div>
                        <div className="benefit-item">
                            <h3>Strukturēta pieeja</h3>
                            <p>
                                Aizstājiet Excel tabulas un neformālu saziņu ar
                                profesionālu rīku, kas paredzēts specifiskiem
                                loģistikas uzdevumiem.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function HowItWorksSection() {
    return (
        <section className="how-it-works" id="how-it-works">
            <div className="container">
                <h2>Kā tas darbojas</h2>
                <div className="steps">
                    {howItWorksSteps.map((step, index) => (
                        <div className="step" key={step.title}>
                            <div className="step-number">{index + 1}</div>
                            <h3>{step.title}</h3>
                            <p>{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function FeaturesSection() {
    return (
        <section className="features" id="features">
            <div className="container">
                <h2>Funkcionalitāte</h2>
                <div className="features-grid">
                    {featureCards.map((feature) => (
                        <div className="feature-card" key={feature.title}>
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function TargetUsersSection() {
    return (
        <section className="target-users" id="users">
            <div className="container">
                <h2>Kam paredzēts</h2>
                <div className="users-grid">
                    {targetUsers.map((user) => (
                        <div className="user-card" key={user.title}>
                            <h3>{user.title}</h3>
                            <p>{user.subtitle}</p>
                            <ul className="user-benefits">
                                {user.benefits.map((benefit) => (
                                    <li key={benefit}>{benefit}</li>
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
    return (
        <section className="cta" id="cta">
            <div className="container">
                <h2>Gatavi sākt?</h2>
                <p>
                    Pieprasiet piekļuvi maršrutu plānotājam un pārvaldiet
                    piegādes efektīvāk
                </p>
                <SignUpButton />
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
