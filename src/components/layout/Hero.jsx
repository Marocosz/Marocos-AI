import React from 'react';
import DarkVeil from '../backgrounds/DarkVeil';
import DecryptedText from '../effects/DecryptedText'; // 1. IMPORTAR

const Hero = () => {
  return (
    // O container principal da Hero Section
    <section className="hero-section">
      
      {/* O background animado fica aqui */}
      <div className="hero-background">
        <DarkVeil 
          speed={0.3} 
          warpAmount={0.1}
          noiseIntensity={0.03}
        />
      </div>
      
      {/* O conteúdo (texto) fica aqui, por cima */}
      <div className="hero-content">
        <h1>
          Marcos<br />Rodrigues
        </h1>
        
        {/* 2. SUBSTITUIR O <p> PELO DecryptedText */}
        <DecryptedText
          // Usamos 'parentClassName' para aplicar o estilo do CSS
          parentClassName="hero-subtitle" 
          text="Desenvolvedor - IA, Automação & FullStack"
          animateOn="view" // Anima assim que a página carregar
          sequential={true}  // Letra por letra
          speed={40}         // Velocidade (pode ajustar)
          useOriginalCharsOnly={true}
        />
      </div>

    </section>
  );
};

export default Hero;