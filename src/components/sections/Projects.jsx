import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Github } from 'lucide-react';
import { projectsData } from '../../data/projects';
import './Projects.css';

const Projects = () => {
  const [activeIndex, setActiveIndex] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  // Detecta mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Configurações de Dimensão
  const CARD_WIDTH = 800; 
  const CARD_GAP = 64; 

  // Função para navegar
  const handleNav = (direction) => {
    if (direction === 'prev') {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : projectsData.length - 1));
    } else {
      setActiveIndex((prev) => (prev < projectsData.length - 1 ? prev + 1 : 0));
    }
  };

  // VERSÃO MOBILE: Lista vertical simples
  if (isMobile) {
    return (
      <section className="projects-section projects-mobile">
        <div className="projects-header">
          <span className="section-label">03. / PORTFOLIO</span>
          <h2 className="section-title-large">Selected Work</h2>
          <p className="section-subtitle">
            A selection of projects showcasing my Full-Stack and AI skills.
          </p>
        </div>

        <div className="projects-list-mobile">
          {projectsData.map((project, index) => (
            <div key={project.id} className="project-card-mobile">
              
              {/* Header */}
              <div className="card-header-mobile">
                <div className="header-top-row-mobile">
                  <span className="project-category">{project.category}</span>
                  <span className="project-year">2025</span>
                </div>
                <h3 className="project-title-mobile">{project.title}</h3>
              </div>

              {/* Body */}
              <div className="card-body-mobile">
                <div className="mobile-section">
                  <span className="body-label">IDEA</span>
                  <p className="project-description-mobile">{project.description}</p>
                </div>

                <div className="mobile-section">
                  <span className="body-label">TECHS</span>
                  <div className="tech-tags-mobile">
                    {project.techs && project.techs.map((tech, idx) => (
                      <span key={idx} className="tech-tag-mobile">{tech}</span>
                    ))}
                  </div>
                </div>

                <a 
                  href={project.links.github} 
                  className="github-btn-mobile" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Github size={16} />
                  View on GitHub
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // VERSÃO DESKTOP: Carousel
  return (
    <section className="projects-section">
      
      <div className="projects-header">
        <span className="section-label">03. / PORTFOLIO</span>
        <h2 className="section-title-large">Selected Work</h2>
        <p className="section-subtitle">
            A selection of projects showcasing my Full-Stack and AI skills.
            Click on cards to see details.
        </p>
      </div>

      <div className="carousel-viewport">
        
        <button className="nav-btn-floating prev" onClick={() => handleNav('prev')}>
          <ChevronLeft size={28} />
        </button>

        <motion.div 
          className="carousel-track"
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
                
                {/* 1. Header */}
                <div className="card-header-glass">
                    <div className="header-top-row">
                        <span className="project-category">{project.category}</span>
                        <span className="project-year">2025</span>
                    </div>
                    <h3 className="project-title">{project.title}</h3>
                </div>

                {/* 2. Corpo Dividido (70% | 30%) */}
                <div className="card-body-split">
                    
                    {/* Conteúdo Principal: IDEA (Maior) */}
                    <div className="card-col main-col">
                        <span className="body-label">IDEA</span>
                        <p className="project-description">{project.description}</p>
                        
                        {isActive && (
                            <a href={project.links.github} className="github-btn" target="_blank" rel="noopener noreferrer">
                                <Github size={18} />
                                View on GitHub
                            </a>
                        )}
                    </div>

                    {/* Coluna Techs (Menor - ~30%) */}
                    <div className="card-col tech-col">
                        <span className="body-label">TECHS</span>
                        <ul className="tech-list">
                            {project.techs && project.techs.map((tech, idx) => (
                                <li key={idx} className="tech-item-project">{tech}</li>
                            ))}
                        </ul>
                    </div>

                </div>

              </div>
            );
          })}
        </motion.div>

        <button className="nav-btn-floating next" onClick={() => handleNav('next')}>
          <ChevronRight size={28} />
        </button>

      </div>

    </section>
  );
};

export default Projects;