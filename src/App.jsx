import { useEffect } from 'react';
import Lenis from 'lenis';
import HomePage from './pages/HomePage';

function App() {

  useEffect(() => {
    // Inicialização do Lenis para Scroll Suave (Inertial Scrolling)
    const lenis = new Lenis({
      duration: 1.2, // Duração da inércia (1.2s é um bom valor premium)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing suave (exponential)
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false, // Mobile geralmente prefere nativo, mas pode testar true
      touchMultiplier: 2,
    });

    // Loop de animação sincronizado
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <HomePage />
  );
}

export default App;