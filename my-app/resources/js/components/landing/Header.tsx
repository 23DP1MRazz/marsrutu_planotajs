import { useCallback, useEffect, useRef, useState } from 'react';
import type { AnchorHTMLAttributes, MouseEventHandler } from 'react';
import { HEADER_SCROLL_OFFSET_PX } from './data';
import { SignUpButton } from './SignUpButton';

const HEADER_HIDE_SCROLL_THRESHOLD_PX = 100;

function scrollToHash(hash: string) {
    if (!hash || hash === '#') {
        return;
    }

    const target = document.querySelector(hash);
    if (!target) {
        return;
    }

    const elementPosition = target.getBoundingClientRect().top;
    const offsetPosition =
        elementPosition + window.pageYOffset - HEADER_SCROLL_OFFSET_PX;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
    });
}

type LandingLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
    closeMenu?: () => void;
};

export function LandingLink({
    href,
    onClick,
    closeMenu,
    ...props
}: LandingLinkProps) {
    const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
        onClick?.(event);
        if (event.defaultPrevented) {
            return;
        }

        if (typeof href !== 'string') {
            return;
        }

        if (!href.startsWith('#') || href === '#') {
            return;
        }

        event.preventDefault();
        closeMenu?.();
        scrollToHash(href);
    };

    return <a href={href} onClick={handleClick} {...props} />;
}

export function Header() {
    const headerRef = useRef<HTMLElement | null>(null);
    const menuToggleRef = useRef<HTMLButtonElement | null>(null);
    const navLinksRef = useRef<HTMLUListElement | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const closeMenu = useCallback(() => {
        setIsMenuOpen(false);
    }, []);

    useEffect(() => {
        let lastScroll = 0;

        const onScroll = () => {
            const header = headerRef.current;
            if (!header) {
                return;
            }

            const currentScroll = window.pageYOffset;

            if (currentScroll <= 0) {
                header.style.transform = 'translateY(0)';
                lastScroll = 0;
                return;
            }

            if (
                currentScroll > lastScroll &&
                currentScroll > HEADER_HIDE_SCROLL_THRESHOLD_PX
            ) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }

            lastScroll = currentScroll;
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    useEffect(() => {
        if (!isMenuOpen) {
            return;
        }

        const onPointerDown = (event: PointerEvent) => {
            const target = event.target;
            if (!(target instanceof Node)) {
                return;
            }

            if (
                menuToggleRef.current?.contains(target) ||
                navLinksRef.current?.contains(target)
            ) {
                return;
            }

            closeMenu();
        };

        document.addEventListener('pointerdown', onPointerDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
        };
    }, [closeMenu, isMenuOpen]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isMenuOpen) {
                closeMenu();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [closeMenu, isMenuOpen]);

    return (
        <header className="header" id="header" ref={headerRef}>
            <div className="header-container">
                <a href="#" className="logo">
                    MARŠRUTU PLĀNOTĀJS
                </a>
                <nav className="nav">
                    <button
                        className={`menu-toggle${isMenuOpen ? ' active' : ''}`}
                        id="menuToggle"
                        ref={menuToggleRef}
                        aria-label="Toggle menu"
                        aria-controls="navLinks"
                        aria-expanded={isMenuOpen}
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
                        ref={navLinksRef}
                    >
                        <li>
                            <LandingLink
                                href="#about"
                                className="nav-link"
                                closeMenu={closeMenu}
                            >
                                Par sistēmu
                            </LandingLink>
                        </li>
                        <li>
                            <LandingLink
                                href="#how-it-works"
                                className="nav-link"
                                closeMenu={closeMenu}
                            >
                                Kā tas darbojas
                            </LandingLink>
                        </li>
                        <li>
                            <LandingLink
                                href="#features"
                                className="nav-link"
                                closeMenu={closeMenu}
                            >
                                Funkcionalitāte
                            </LandingLink>
                        </li>
                        <li>
                            <LandingLink
                                href="#users"
                                className="nav-link"
                                closeMenu={closeMenu}
                            >
                                Kam paredzēts
                            </LandingLink>
                        </li>
                        <li>
                            <SignUpButton />
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
