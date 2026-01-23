import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { journeyData } from '../../data/journey';
import './Journey.css';

const Journey = () => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    // O offset define quando a barra começa e termina de encher
    offset: ["start center", "end center"] 
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section className="journey-section" ref={containerRef}>
      
      <div className="journey-header">
        <span className="section-label">04. / COMMIT HISTORY</span>
        <h2 className="section-title-large">My Journey</h2>
      </div>

      <div className="timeline-container">
        
        {/* Trilho Fixo */}
        <div className="timeline-rail"></div>
        
        {/* Trilho Animado */}
        <motion.div 
          className="timeline-fill" 
          style={{ scaleY }} 
        ></motion.div>

        {/* Commits */}
        {journeyData.map((item, index) => {
          const isEven = index % 2 === 0; 

          return (
            <div 
              key={item.id} 
              className={`commit-row ${isEven ? 'left' : 'right'}`}
            >
              
              {/* Nó */}
              <motion.div 
                className="commit-node"
                initial={{ backgroundColor: "#000", borderColor: "#333" }}
                whileInView={{ backgroundColor: "#a855f7", borderColor: "#a855f7", scale: 1.2 }}
                viewport={{ once: true, margin: "-50% 0px -50% 0px" }}
                transition={{ duration: 0.4 }}
              />

              {/* Card */}
              <motion.div 
                className="journey-card"
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-20% 0px -20% 0px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="commit-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span className="commit-date">{item.date}</span>
                    <span className="commit-hash">commit {item.hash}</span>
                  </div>
                  <h3 className="commit-title">{item.title}</h3>
                  <span className="commit-org">{item.org}</span>
                </div>

                <p className="commit-description">{item.description}</p>

                <div className="commit-tags">
                  {item.tags.map((tag, i) => (
                    <span key={i} className="tag-sm">{tag}</span>
                  ))}
                </div>
              </motion.div>

            </div>
          );
        })}

      </div>
    </section>
  );
};

export default Journey;