import React from 'react';
import Hero from '../components/sections/Hero'; 
import Profile from '../components/sections/Profile'; 
import Silk from '../components/backgrounds/Silk';
import Projects from '../components/sections/Projects';
import Journey from '../components/sections/Journey';

const HomePage = () => {
  return (
    <main style={{ position: 'relative', width: '100%', overflowX: 'hidden' }}>
      
      {/* 1. BACKGROUND FIXO BLINDADO
          - Usamos 'dvh' e 'dvw' para lidar melhor com o zoom e mobile.
          - Transform: 'translateZ(0)' força a GPU a renderizar em camada separada, 
            o que muitas vezes corrige glitches visuais.
      */}
      <div style={{
        position: 'fixed',
        top: 0, 
        left: 0,
        width: '100dvw', // Moderno
        height: '100dvh', // Moderno
        zIndex: 0,
        pointerEvents: 'none',
        transform: 'translateZ(0)' // Truque de performance/renderização
      }}>
        <Silk 
          color="#661ea8" 
          speed={10} 
          scale={1}
          rotation={3}
          noiseIntensity={6.15} 
        />
      </div>

      {/* 2. HERO SECTION */}
      <div style={{ 
        position: 'relative', 
        zIndex: 10,
        // Gradiente removido para deixar o Silk permanente
        // background: 'linear-gradient(...)',
      }}>
        <Hero />
      </div>

      {/* 3. PERFIL & OUTRAS SEÇÕES */}
      <div style={{ 
        position: 'relative', 
        zIndex: 5
      }}>
        <Profile />
        <Projects />
        <Journey />
        
        {/* Espaço extra no final para garantir que o scroll vá até o fim sem cortes */}
        <div style={{ height: '100px', pointerEvents: 'none' }}></div>
      </div>

    </main>
  );
};

export default HomePage;