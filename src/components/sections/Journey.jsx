import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { journeyData } from '../../data/journey';
import './Journey.css';

const Journey = () => {
  const carouselRef = useRef(null);
  const [width, setWidth] = useState(0);
  const x = useMotionValue(0);
  const progress = useTransform(x, [0, -width], ["0%", "100%"]);

  useEffect(() => {
    // Calcula o limite do drag baseado na largura total dos cards
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, []);

  return (
    <section className="journey-section">
      
      <div className="journey-content-wrapper">
        
        {/* Header */}
        <div className="journey-header">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="section-label">04. / PROFESSIONAL JOURNEY</span>
            <h2 className="section-title-large">Experience Timeline</h2>
            <p className="section-subtitle">
              Uma trajetória cronológica através do meu crescimento profissional e marcos importantes.
            </p>
            
            {/* Drag Intruction Hint */}
            <div className="drag-instruction">
              <span className="drag-icon">↔</span> Drag to Explore
            </div>
          </motion.div>
        </div>

        {/* Barra de Progresso da Timeline */}
        <div className="timeline-progress-container">
          <div className="timeline-progress-track">
            <motion.div 
              className="timeline-progress-fill" 
              style={{ width: progress }} 
            />
          </div>
        </div>

        {/* Carousel Arrastável */}
        <div className="cards-viewport" ref={carouselRef}>
          
          <motion.div 
            className="cards-container"
            drag="x"
            dragConstraints={{ right: 0, left: -width }}
            whileTap={{ cursor: "grabbing" }}
            style={{ x }}
          >
            {/* Definições de Gradiente para SVGs (Reutilizável) */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
              <defs>
                <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="gradientStrokeLight" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#cbd5e1" />
                  <stop offset="50%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
                <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M 0 0 L 6 3 L 0 6 z" fill="url(#gradientStroke)" />
                </marker>
                 <marker id="arrowheadLight" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M 0 0 L 6 3 L 0 6 z" fill="#94a3b8" />
                </marker>
              </defs>
            </svg>

            {/* Renderiza Cards com Conexões */}
            {journeyData.map((item, index) => (
              <div key={item.id} className="journey-card">
                
                <div className="card-inner">
                  <div className="card-year">{item.date}</div>
                  <h3 className="card-title">{item.title}</h3>
                  <p className="card-company">{item.org}</p>
                  <div className="card-divider" />
                  <p className="card-description">{item.description}</p>
                  <div className="card-tags">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="card-tag">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Renderiza Conexão para o PRÓXIMO card (se não for o último) */}
                {index < journeyData.length - 1 && (
                  <div 
                    className="connection-container" 
                    style={{ 
                      position: 'absolute',
                      left: '100%', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      width: '10rem', // Aumentado para criar overlap (Gap é 8rem)
                      height: '200px',
                      zIndex: 0 // Garante que fique atrás dos cards
                    }}
                  >
                    <ConnectionArrow variant={index % 2} />
                  </div>
                )}

              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Componente de Conexão SVG
const ConnectionArrow = ({ variant }) => {
  // Proporção ajustada para width 10rem (aprox 160px)
  // ViewBox 0 0 160 100
  
  // Curvas MUITO SUTIS (Amplitude reduzida para +/- 10px)
  // Quase reta, apenas um leve balanço tech
  
  const path = variant === 0 
    ? "M 0,50 C 50,50 50,40 80,40 S 110,50 160,50" // Sobe leve (Y=40)
    : "M 0,50 C 50,50 50,60 80,60 S 110,50 160,50"; // Desce leve (Y=60)

  return (
    <svg className="connection-svg" viewBox="0 0 160 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      {/* Efeito Glow (Stroke mais grosso e borrado atrás) */}
      <path 
        d={path} 
        stroke="#a855f7" 
        strokeWidth="6" 
        fill="none" 
        opacity="0.3"
        style={{ filter: 'blur(3px)' }}
        vectorEffect="non-scaling-stroke"
      />
      
      {/* Linha Principal sem Marker */}
      <path 
        d={path} 
        className="connection-path" 
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

export default Journey;