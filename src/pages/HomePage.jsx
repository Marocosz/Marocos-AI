import React from 'react';
import Hero from '../components/layout/Hero';
import AboutSection from '../components/layout/AboutSection'; // 1. IMPORTAR

const HomePage = () => {
  return (
    <main>
      <Hero />
      <AboutSection /> {/* 2. ADICIONAR AQUI */}
    </main>
  );
};

export default HomePage;