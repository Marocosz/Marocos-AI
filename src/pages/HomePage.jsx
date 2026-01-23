import React, { useState } from 'react';
import Hero from '../components/sections/Hero'; 
import Profile from '../components/sections/Profile'; 
import Silk from '../components/backgrounds/Silk';
import Iridescence from '../components/backgrounds/Iridescence'; // IMPORTAR
import Projects from '../components/sections/Projects';
import Journey from '../components/sections/Journey';
import TechStack from '../components/sections/TechStack';
import Contact from '../components/sections/Contact';
import Navbar from '../components/ui/Navbar';

const HomePage = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleAnimation = () => {
    setIsAnimationEnabled(!isAnimationEnabled);
  };

  return (
    // Adiciona classe light-mode se necessário
    <main 
      className={isDarkMode ? 'theme-dark' : 'theme-light'} 
      style={{ position: 'relative', width: '100%' }}
    >
      
      {/* 1. BACKGROUND FIXO (CONDICIONAL) */}
      <div style={{
        position: 'fixed',
        top: 0, 
        left: 0,
        width: '100dvw', 
        height: '100dvh', 
        zIndex: 0,
        pointerEvents: 'none',
        transform: 'translateZ(0)',
        transition: 'opacity 0.5s ease'
      }}>
        {isDarkMode ? (
          <Silk 
            color="#661ea8" 
            speed={20} 
            scale={1} 
            rotation={3} 
            noiseIntensity={1.5}
            isAnimated={isAnimationEnabled} 
          />
        ) : (
          <Iridescence
            color={[0.9, 0.9, 0.95]} // Cor clarinha (prata/azulado)
            mouseReact={true}
            amplitude={0.1}
            speed={1}
            isAnimated={isAnimationEnabled}
          />
        )}
      </div>

      {/* 2. CONTEÚDO */}
      <div id="hero" style={{ position: 'relative', zIndex: 10 }}>
        <Hero />
      </div>

      <div style={{ position: 'relative', zIndex: 5 }}>
        <div id="profile"><Profile /></div>
        <div id="projects"><Projects /></div>
        


        <div id="journey"><Journey /></div>
        <div id="tech"><TechStack /></div>
        <div id="contact"><Contact /></div>
        
        <div style={{ 
          height: '150px', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          // Cor do texto do footer ajustável via CSS da classe theme
          color: isDarkMode ? '#444' : '#666',
          fontSize: '0.8rem',
          marginTop: '4rem',
          paddingBottom: '2rem'
        }}>
          <p>© 2026 Marcos Rodrigues. Built with React & Framer Motion.</p>
        </div>
      </div>
      
      {/* 3. NAVBAR COM TOGGLE */}
      <Navbar 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
        isAnimationEnabled={isAnimationEnabled}
        toggleAnimation={toggleAnimation}
      />

    </main>
  );
};

export default HomePage;