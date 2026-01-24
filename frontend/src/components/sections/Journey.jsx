import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getJourneyData } from '../../data/journey';
import './Journey.css';

const Journey = () => {
  const { language } = useLanguage();
  const content = getJourneyData(language);
  const carouselRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [isCompact, setIsCompact] = useState(false);
  const x = useMotionValue(0);
  const progress = useTransform(x, [0, -width], ["0%", "100%"]);

  // Detect Compact Mode (Mobile/Tablet)
  useEffect(() => {
    const checkCompact = () => {
      setIsCompact(window.innerWidth < 1024);
    };
    
    checkCompact();
    window.addEventListener('resize', checkCompact);
    return () => window.removeEventListener('resize', checkCompact);
  }, []);

  useEffect(() => {
    // Calcula o limite do drag baseado na largura total dos cards
    if (carouselRef.current && !isCompact) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, [isCompact, content.items]); // Recalculate on content change

  // VERSÃO COMPACTA (Mobile/Tablet): Horizontal Scroll Snap
  if (isCompact) {
    return (
      <section className="journey-section journey-mobile">
        <div className="journey-header">
          <span className="section-label">{content.sectionLabel}</span>
          <h2 className="section-title-large">{content.title}</h2>
          <p className="section-subtitle">
            {content.subtitle}
          </p>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="journey-scroll-snap-container">
          {content.items.map((item) => (
            <div key={item.id} className="journey-card-snap">
              
              <div className="git-header-mobile">
                <span className="commit-hash-mobile">
                   {item.hash}
                </span>
                <span className={`commit-type-mobile type-${item.type}`}>[{item.type}]</span>
              </div>

              <div className="card-year-mobile">{content.dateLabel} {item.date}</div>
              <h3 className="card-title-mobile">{item.title}</h3>
              <p className="card-company-mobile">{content.authorLabel} {item.org}</p>
              
              <div className="card-divider-mobile" />
              
              <p className="card-description-mobile">{item.description}</p>
              <div className="card-tags-mobile">
                {item.tags.map((tag, i) => (
                  <span key={i} className="card-tag-mobile">{tag}</span>
                ))}
              </div>
            </div>
          ))}
          {/* Spacer at the end for scrolling */}
          <div style={{ minWidth: '20px' }} />
        </div>
      </section>
    );
  }

  // VERSÃO DESKTOP: Carousel com drag
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
            <span className="section-label">{content.sectionLabel}</span>
            <h2 className="section-title-large">{content.title}</h2>
            <p className="section-subtitle">
              {content.subtitle}
            </p>
            
            {/* Drag Intruction Hint */}
            <div className="drag-instruction">
              <span className="drag-icon">↔</span> {content.dragStart}
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
            {content.items.map((item, index) => (
              <div key={item.id} className="journey-card">
                
                <div className="card-inner">
                  
                  {/* GIT HEADER: Hash & Type */}
                  <div className="git-header">
                    <span className="commit-hash">
                      <span className="git-prefix">commit</span> {item.hash}
                    </span>
                    <span className={`commit-type type-${item.type}`}>
                      [{item.type}]
                    </span>
                  </div>

                  <div className="card-year">{content.dateLabel} {item.date}</div>
                  
                  <h3 className="card-title">{item.title}</h3>
                  <p className="card-company">{content.authorLabel} {item.org}</p>
                  
                  <div className="card-divider" />
                  
                  <p className="card-description">{item.description}</p>
                  <div className="card-tags">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="card-tag">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Renderiza Conexão para o PRÓXIMO card (se não for o último) */}
                {index < content.items.length - 1 && (
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