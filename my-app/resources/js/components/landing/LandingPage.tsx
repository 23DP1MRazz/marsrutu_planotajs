import { Header } from './Header';
import { Sections } from './Sections';
import { Footer } from './Footer'; 
import { useEffect } from 'react';

export function LandingPage() {
    useEffect(() => {
        document.documentElement.lang = 'lv';

        // white background
        const previousHtmlBackgroundColor =
            document.documentElement.style.backgroundColor;
        const previousBodyBackgroundColor = document.body.style.backgroundColor;

        document.documentElement.style.backgroundColor = '#ffffff';
        document.body.style.backgroundColor = '#ffffff';

        return () => {
            document.documentElement.style.backgroundColor =
                previousHtmlBackgroundColor;
            document.body.style.backgroundColor = previousBodyBackgroundColor;
        };
    }, []);

    return (
        <div className="landing-root">
            <Header />
            <Sections />
            <Footer />
        </div>
    );
}
