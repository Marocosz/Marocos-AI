import React from 'react';
import DecryptedText from '../effects/DecryptedText'; 
import { ArrowDown } from 'lucide-react';
import './Hero.css';

const Hero = () => {
    const scrollToContact = () => {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const scrollDown = () => {
        // Scroll to the next section (Profile usually)
        const profileSection = document.getElementById('profile');
        if (profileSection) {
            profileSection.scrollIntoView({ behavior: 'smooth' });
        } else {
             window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
        }
    };

    return (
        <section className="hero-section" id="hero">

            <div className="hero-background"></div>

            <div className="hero-content">
                <span className="hero-section-label">01. / PORTFOLIO</span>
                <h1 className="os-boot-title">
                    Marcos<br />Rodrigues
                </h1>

                <div className="os-boot-subtitle-wrapper">
                    <DecryptedText
                        parentClassName="hero-subtitle"
                        text="AI Developer & Full-Stack Engineer"
                        animateOn="view" 
                        sequential={true} 
                        speed={40}         
                        useOriginalCharsOnly={true}
                    />
                </div>

                <div>
                    <button onClick={scrollToContact} className="hero-contact-link">
                        Let's Talk
                    </button>
                </div>
            </div>
            
            <div className="hero-f11-hint">
                Press F11 for best experience
            </div>

            <div className="hero-scroll-indicator" onClick={scrollDown}>
                <span className="hero-scroll-text">Scroll</span>
                <ArrowDown size={24} />
            </div>

        </section>
    );
};

export default Hero;