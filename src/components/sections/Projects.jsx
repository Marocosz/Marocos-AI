import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowUpRight, Github } from 'lucide-react';
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
                
                {/* 1. Header com Vidro (Título) */}
                <div className="card-header-glass">
                    <div className="header-top-row">
                        <span className="project-category">{project.category}</span>
                        <span className="project-year">2025</span>
                    </div>
                    <h3 className="project-title">{project.title}</h3>
                </div>

                {/* 2. Corpo Sólido (50% / 50%) */}
                <div className="card-body-split">
                    
                    {/* Lado Esquerdo: Proposta + Botão */}
                    <div className="card-col left-col">
                        <span className="body-label">PROPOSAL</span>
                        <p className="project-description">{project.description}</p>
                        
                        {isActive && (
                            <a href={project.links.github} className="github-btn">
                                <Github size={18} />
                                View on GitHub
                            </a>
                        )}
                    </div>

                    {/* Lado Direito: Tecnologias */}
                    <div className="card-col right-col">
                        <span className="body-label">TECHNOLOGIES</span>
                        <div className="tech-grid">
                            {project.techs.map((tech, i) => (
                                <span key={i} className="tech-tag">{tech}</span>
                            ))}
                        </div>
                    </div>

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