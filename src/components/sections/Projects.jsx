import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { projectsData } from '../../data/projects';
import './Projects.css';

const Projects = () => {
  const [activeIndex, setActiveIndex] = useState(1); // Começa no segundo card

  // Configurações de Dimensão (Devem bater com o CSS)
  // Largura aumentada para formato "Ultra Wide" conforme pedido
  const CARD_WIDTH = 800; 
  const CARD_GAP = 64; // 4rem = 64px do CSS

  // Função para navegar
  const handleNav = (direction) => {
    if (direction === 'prev') {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : projectsData.length - 1));
    } else {
      setActiveIndex((prev) => (prev < projectsData.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <section className="projects-section">
      
      <div className="projects-header">
        <span className="section-label">03. / PORTFOLIO</span>
        <h2 className="section-title-large">Selected Work</h2>
      </div>

      <div className="carousel-viewport">
        
        {/* Botão Anterior */}
        <button className="nav-btn-floating prev" onClick={() => handleNav('prev')}>
          <ChevronLeft size={28} />
        </button>

        {/* TRILHA DO CARROSSEL */}
        <motion.div 
          className="carousel-track"
          // Lógica de centralização ajustada para o novo tamanho de 800px
          animate={{ x: `calc(-${activeIndex * (CARD_WIDTH + CARD_GAP)}px - ${CARD_WIDTH / 2}px)` }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          {projectsData.map((project, index) => {
            const isActive = index === activeIndex;
            return (
              <div 
                key={project.id} 
                className={`project-card ${isActive ? 'active' : 'inactive'}`}
                onClick={() => setActiveIndex(index)} 
              >
                
                {/* Imagem de Fundo */}
                <div className="card-image-wrapper">
                  <img src={project.image} alt={project.title} className="card-image" />
                  <div className="card-overlay"></div>
                </div>

                {/* Conteúdo "Espelho" (Glassmorphism) na parte inferior */}
                <div className="card-content">
                  <div className="project-header-row">
                     <span className="project-category">{project.category}</span>
                     <span className="project-year">2025</span>
                  </div>
                  
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-description">{project.description}</p>

                  {/* Link/Ação - Só aparece visualmente mais forte se ativo */}
                  {isActive && (
                    <div className="card-action">
                        <a href={project.links.live} style={{ 
                            color: '#fff', 
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '1rem',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            borderBottom: '1px solid #a855f7',
                            paddingBottom: '2px'
                        }}>
                            View Project <ArrowUpRight size={16} />
                        </a>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </motion.div>

        {/* Botão Próximo */}
        <button className="nav-btn-floating next" onClick={() => handleNav('next')}>
          <ChevronRight size={28} />
        </button>

      </div>

    </section>
  );
};

export default Projects;