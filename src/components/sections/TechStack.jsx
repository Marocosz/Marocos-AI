import React from 'react';
import { motion } from 'motion/react';
import { techData } from '../../data/tech';
import './TechStack.css';

const TechStack = () => {
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
  };

  return (
    <section className="tech-section">
      
      {/* Header */}
      <div className="tech-header">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">05. / ARSENAL</span>
          <h2 className="section-title-large">Tech Stack</h2>
          <p className="section-subtitle">
            Linguagens, frameworks e ferramentas que utilizo para construir soluções robustas.
          </p>
        </motion.div>
      </div>

      {/* Grid de Categorias */}
      <motion.div 
        className="tech-grid"
        variants={containerVars}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
      >
        {techData.map((category) => {
          const Icon = category.icon;
          
          return (
            <motion.div 
              key={category.id} 
              className="tech-category-card"
              variants={itemVars}
            >
              {/* Cabeçalho da Categoria */}
              <div className="category-header">
                <div className="category-icon-wrapper">
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="category-title">{category.title}</h3>
              </div>

              <p className="category-desc">{category.description}</p>

              {/* Grid de Tecnologias (Chips) */}
              <div className="items-grid">
                {category.items.map((tech, index) => (
                  <div key={index} className="tech-item">
                    <span 
                      className="tech-dot" 
                      style={{ backgroundColor: tech.color, color: tech.color }}
                    />
                    <span className="tech-name">{tech.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

    </section>
  );
};

export default TechStack;