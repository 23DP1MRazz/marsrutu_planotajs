import { useEffect, useState } from 'react';
import { SignUpButton } from './SignUpButton';

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeMenu();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    }, []);

    return (
        <header className="header" id="header">
            <div className="header-container">
                <a href="#" className="logo">
                    MARŠRUTU PLĀNOTĀJS
                </a>

                <nav className="nav">
                    <button
                        className={`menu-toggle${isMenuOpen ? ' active' : ''}`}
                        id="menuToggle"
                        aria-label="Toggle menu"
                        aria-controls="navLinks"
                        aria-expanded={isMenuOpen}
                        type="button"
                        onClick={() => {
                            setIsMenuOpen((open) => !open);
                        }}
                    >
                        <span />
                        <span />
                        <span />
                    </button>

                    <ul
                        className={`nav-links${isMenuOpen ? ' active' : ''}`}
                        id="navLinks"
                    >
                        <li>
                            <a
                                href="#about"
                                className="nav-link"
                                onClick={closeMenu}
                            >
                                Par sistēmu
                            </a>
                        </li>
                        <li>
                            <a
                                href="#how-it-works"
                                className="nav-link"
                                onClick={closeMenu}
                            >
                                Kā tas darbojas
                            </a>
                        </li>
                        <li>
                            <a
                                href="#features"
                                className="nav-link"
                                onClick={closeMenu}
                            >
                                Funkcionalitāte
                            </a>
                        </li>
                        <li>
                            <a
                                href="#users"
                                className="nav-link"
                                onClick={closeMenu}
                            >
                                Kam paredzēts
                            </a>
                        </li>
                        <li onClick={closeMenu}>
                            <SignUpButton />
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

