import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { journeyData } from '../../data/journey';
import './Journey.css';

const Journey = () => {
  const containerRef = useRef(null);

  // Monitora o scroll da seção inteira (400vh)
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });

  // Cálculo Dinâmico para o scroll horizontal
  // Queremos mover os cards para a esquerda o suficiente para ver o último card
  // Ajuste o valor final (-85%) dependendo de quantos cards você tem. 
  // Para 4 cards largos, -75% a -85% costuma funcionar bem.
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-85%"]);

  return (
    <section className="journey-section" ref={containerRef}>
      
      {/* Container Sticky que trava na tela */}
      <div className="journey-sticky-container">
        
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
          </motion.div>
        </div>

        {/* Viewport dos Cards */}
        <div className="cards-viewport">
          
          {/* Container que se move horizontalmente */}
          {/* A div extra 'motion.div' aplica a transformação X baseada no scroll Y */}
          <motion.div 
            className="cards-container"
            style={{ x }} // Aplica o movimento horizontal
          >
            {/* Linha Conectora (Fundo) */}
            <div className="timeline-line" />

            {/* Renderiza Cards */}
            {journeyData.map((item) => (
              <div key={item.id} className="journey-card">
                
                {/* Node da Timeline (Bolinha na esquerda) */}
                <div className="timeline-node">
                  <div className="node-inner" />
                </div>

                {/* Conteúdo do Card */}
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

              </div>
            ))}
          </motion.div>

        </div>

        {/* Progress Indicator (Barra inferior) */}
        <div className="scroll-indicator">
          <motion.div 
            className="indicator-fill"
            style={{ scaleX: scrollYProgress }}
          />
        </div>

      </div>

    </section>
  );
};

export default Journey;