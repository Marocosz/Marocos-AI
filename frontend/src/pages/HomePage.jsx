import React, { useState, useEffect } from 'react';
import Hero from '../components/sections/Hero'; 
import Profile from '../components/sections/Profile'; 
import Silk from '../components/backgrounds/Silk';
import Iridescence from '../components/backgrounds/Iridescence'; 
import Projects from '../components/sections/Projects';
import Journey from '../components/sections/Journey';
import TechStack from '../components/sections/TechStack';
import Contact from '../components/sections/Contact';
import Navbar from '../components/ui/Navbar';
import PortfolioMeta from '../components/sections/PortfolioMeta';

const HomePage = () => {
  // Inicializa estado lendo do LocalStorage (Persistência)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('isDarkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isAnimationEnabled, setIsAnimationEnabled] = useState(() => {
    const saved = localStorage.getItem('isAnimationEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isMobile, setIsMobile] = useState(false);

  // Detecta se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('isDarkMode', JSON.stringify(newValue));
      return newValue;
    });
  };

  const toggleAnimation = () => {
    setIsAnimationEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('isAnimationEnabled', JSON.stringify(newValue));
      return newValue;
    });
  };

  return (
    // Adiciona classe light-mode se necessário
    <main 
      className={isDarkMode ? 'theme-dark' : 'theme-light'} 
      style={{ position: 'relative', width: '100%' }}
    >
      
      {/* 1. BACKGROUND FIXO (CONDICIONAL) */}
      {/* 1. BACKGROUND LAYERS (Dual Layer for Smooth Cross-Fade) */}
      
      {/* --- DARK THEME LAYER --- */}
      <div style={{
        position: 'fixed',
        top: 0, 
        left: 0,
        width: '100dvw', 
        height: '100dvh', 
        zIndex: 0,
        pointerEvents: 'none',
        opacity: isDarkMode ? 1 : 0,
        transition: 'opacity 1.5s ease-in-out',
        background: isMobile 
          ? 'linear-gradient(135deg, #1a0033 0%, #330066 50%, #1a0033 100%)' // Mobile Dark Gradient
          : '#050505' // Fallback color
      }}>
        {!isMobile && (
           <Silk 
             color="#661ea8" 
             speed={20} 
             scale={1} 
             rotation={3} 
             noiseIntensity={1.5}
             // Optimize: only run loop when layer is visible
             isAnimated={isAnimationEnabled && isDarkMode} 
           />
        )}
      </div>

      {/* --- LIGHT THEME LAYER --- */}
      <div style={{
        position: 'fixed',
        top: 0, 
        left: 0,
        width: '100dvw', 
        height: '100dvh', 
        zIndex: 0,
        pointerEvents: 'none',
        opacity: isDarkMode ? 0 : 1,
        transition: 'opacity 1.5s ease-in-out',
        background: isMobile 
          ? 'linear-gradient(135deg, #f0f0f5 0%, #e8e8f0 50%, #f0f0f5 100%)' // Mobile Light Gradient
          : '#ffffff' // Fallback color
      }}>
        {!isMobile && (
          <Iridescence
            color={[0.9, 0.9, 0.95]} 
            mouseReact={false}
            amplitude={0.1}
            speed={1}
            // Optimize: only run loop when layer is visible
            isAnimated={isAnimationEnabled && !isDarkMode}
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
        <div id="meta-project"><PortfolioMeta /></div>
        

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
          color: 'var(--text-secondary)',
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