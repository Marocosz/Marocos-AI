import React from 'react';
import DecryptedText from '../effects/DecryptedText'; // 1. IMPORTAR

const Hero = () => {
    return (
        // O container principal da Hero Section
        <section className="hero-section">

            {/* O background animado fica aqui (Vazio pois DarkVeil foi removido) */}
            <div className="hero-background"></div>

            {/* O conteúdo (texto) fica aqui, por cima */}
            <div className="hero-content">
                <h1>
                    Marcos<br />Rodrigues
                </h1>

                {/* 2. SUBSTITUIR O <p> PELO DecryptedText */}
                <DecryptedText
                    // Usamos 'parentClassName' para aplicar o estilo do CSS
                    parentClassName="hero-subtitle"
                    text="AI Developer & Full-Stack Engineer"
                    animateOn="view" // Anima assim que a página carregar
                    sequential={true}  // Letra por letra
                    speed={40}         // Velocidade (pode ajustar)
                    useOriginalCharsOnly={true}
                />
            </div>
            
            <div className="hero-f11-hint">
                Press F11 for best experience
            </div>

        </section>
    );
};

export default Hero;