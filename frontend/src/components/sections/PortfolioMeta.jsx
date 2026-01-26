import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import './PortfolioMeta.css';

const PortfolioMeta = () => {
    const { language } = useLanguage();

    const content = {
        pt: {
            label: "Menção Honrosa",
            description: <>Além dos projetos listados acima, <strong>este próprio portfólio</strong> é um case técnico robusto que demonstra competências em <strong>UX Design</strong>, <strong>Engenharia de Software</strong> e <strong>IA Generativa</strong>. O sistema opera sobre um backend em <strong>FastAPI</strong> que utiliza <strong>LangGraph</strong> para orquestrar agentes inteligentes e uma arquitetura <strong>RAG</strong> (Retrieval Augmented Generation), permitindo que o site "pense" e responda perguntas com base em meus dados reais. Todo o código está aberto e documentado no <a href="https://github.com/Marocosz/Marocos-AI" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'inherit' }}>GitHub</a>.</>
        },
        en: {
            label: "Honorable Mention",
            description: <>Beyond the projects listed above, <strong>this portfolio itself</strong> is a robust technical case study demonstrating skills in <strong>UX Design</strong>, <strong>Software Engineering</strong>, and <strong>Generative AI</strong>. The system runs on a <strong>FastAPI</strong> backend using <strong>LangGraph</strong> to orchestrate intelligent agents and a <strong>RAG</strong> (Retrieval Augmented Generation) architecture, allowing the site to "think" and answer questions based on my real data. The full code is open and documented on <a href="https://github.com/Marocosz/Marocos-AI" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'inherit' }}>GitHub</a>.</>
        }
    };

    const text = content[language];

    return (
        <section className="portfolio-meta-section">
            <motion.div 
                className="meta-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
            >
                <div className="meta-decoration" />
                
                <div className="meta-content">

                    <div className="meta-text-col">
                        <span className="meta-label">
                            <Sparkles size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
                            {text.label}
                        </span>
                        {/* Title removed */}
                        
                        <div className="meta-description">
                            <p>{text.description}</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};


export default PortfolioMeta;
