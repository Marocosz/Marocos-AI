import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Github } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getProjectsData } from '../../data/projects';
import './Projects.css';

const Projects = () => {
  const { language } = useLanguage();
  const content = getProjectsData(language);
  const [activeIndex, setActiveIndex] = useState(1);
  const [isCompact, setIsCompact] = useState(false);

  // Detect Compact Mode (Mobile/Tablet)
  useEffect(() => {
    const checkCompact = () => {
      setIsCompact(window.innerWidth < 1024);
    };
    
    checkCompact();
    window.addEventListener('resize', checkCompact);
    return () => window.removeEventListener('resize', checkCompact);
  }, []);

  // Configurações de Dimensão
  const CARD_WIDTH = 800; 
  const CARD_GAP = 64; 

  // Função para navegar
  const handleNav = (direction) => {
    if (direction === 'prev') {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : content.items.length - 1));
    } else {
      setActiveIndex((prev) => (prev < content.items.length - 1 ? prev + 1 : 0));
    }
  };

  // VERSÃO COMPACTA (Mobile/Tablet): Simple Scroll Snap Carousel
  if (isCompact) {
    return (
      <section className="projects-section projects-mobile">
        <div className="projects-header">
          <span className="section-label">{content.sectionLabel}</span>
          <h2 className="section-title-large">{content.title}</h2>
          <p className="section-subtitle">
            {content.subtitle}
          </p>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="projects-scroll-snap-container">
          {content.items.map((project) => (
            <div key={project.id} className="project-card-snap">
              
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
                  <span className="body-label">{content.labels.idea}</span>
                  <p className="project-description-mobile">{project.description}</p>
                </div>

                <div className="mobile-section">
                  <span className="body-label">{content.labels.techs}</span>
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
                  {content.labels.github}
                </a>
              </div>
            </div>
          ))}
          {/* Spacer at the end for better scrolling experience */}
          <div style={{ minWidth: '20px' }} /> 
        </div>
      </section>
    );
  }

  // VERSÃO DESKTOP: Carousel
  return (
    <section className="projects-section">
      
      <div className="projects-header">
        <span className="section-label">{content.sectionLabel}</span>
        <h2 className="section-title-large">{content.title}</h2>
        <p className="section-subtitle">
            {content.subtitle}
            <br/>{content.subtitleDesktopExtra}
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
          {content.items.map((project, index) => {
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
                        <span className="body-label">{content.labels.idea}</span>
                        <p className="project-description">{project.description}</p>
                        
                        {isActive && (
                            <a href={project.links.github} className="github-btn" target="_blank" rel="noopener noreferrer">
                                <Github size={18} />
                                {content.labels.github}
                            </a>
                        )}
                    </div>

                    {/* Coluna Techs (Menor - ~30%) */}
                    <div className="card-col tech-col">
                        <span className="body-label">{content.labels.techs}</span>

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