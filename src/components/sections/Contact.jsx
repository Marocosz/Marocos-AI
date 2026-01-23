import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, Server } from 'lucide-react';
import { contactData } from '../../data/contact';
import './Contact.css';

const Contact = () => {
  const [isTypingDone, setIsTypingDone] = useState(false);

  // Variantes para animação de digitação
  const typingContainer = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // Velocidade da digitação
        delayChildren: 0.5
      }
    }
  };

  const letterVar = {
    hidden: { opacity: 0, display: 'none' },
    visible: { opacity: 1, display: 'inline' }
  };

  const commandText = "./get-contacts --all";

  return (
    <section className="contact-section">
      
      {/* Header Visual */}
      <div className="contact-header-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">06. / CONNECT</span>
          <h2 className="section-title-large">Let's Talk</h2>
          <p className="contact-desc">
            Below are the best channels to find me. 
            Run the command or click the links.
          </p>
        </motion.div>
      </div>

      {/* HOSTING SERVICE CARD */}
      <motion.div 
        className="hosting-service-card"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="hosting-card-header">
          <Server size={20} className="hosting-icon" />
          <span className="hosting-badge">HOSTING SERVICE</span>
        </div>
        <h3 className="hosting-title">Professional VPS Hosting Available</h3>
        <p className="hosting-description">
          I offer complete end-to-end web hosting solutions through my own VPS infrastructure. 
          From deployment to monitoring, database management to SSL certificates, I handle everything. 
          Perfect for small to medium projects that need reliable, custom hosting with direct support from the developer.
        </p>
        <div className="hosting-features">
          <span className="feature-tag">✓ Custom Configuration</span>
          <span className="feature-tag">✓ 24/7 Monitoring</span>
          <span className="feature-tag">✓ Direct Support</span>
          <span className="feature-tag">✓ SSL & Security</span>
        </div>
      </motion.div>

      {/* TERMINAL WINDOW */}
      <motion.div 
        className="terminal-window"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        
        {/* Barra Superior */}
        <div className="terminal-header-bar">
          <div className="dot red" />
          <div className="dot yellow" />
          <div className="dot green" />
          <span className="terminal-title">visitante@portfolio: ~</span>
        </div>

        {/* Corpo do Terminal */}
        <div className="terminal-body">
          
          {/* Linha de Comando (Simula digitação) */}
          <div className="cmd-line">
            <span className="prompt-user">visitante@portfolio:~$</span>
            
            <motion.span
              variants={typingContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="cmd-text"
              onAnimationComplete={() => setIsTypingDone(true)}
            >
              {commandText.split("").map((char, index) => (
                <motion.span key={index} variants={letterVar}>{char}</motion.span>
              ))}
            </motion.span>
            
            {/* Cursor piscando (some quando termina de digitar) */}
            {!isTypingDone && <span className="cursor" />}
          </div>

          {/* Resultado (Aparece só depois que digitou) */}
          {isTypingDone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              
              <div className="cmd-response">
                <Loader2 className="animate-spin" size={16} />
                <span>Fetching communication channels...</span>
              </div>

              {/* Grid de Cards */}
              <div className="contact-grid">
                {contactData.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.a 
                      key={item.id}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-card"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + (index * 0.1) }} // Cascata
                    >
                      <div className="icon-box">
                        <Icon size={20} color={item.color} />
                      </div>
                      <div className="contact-info">
                        <span className="contact-label">{item.label}</span>
                        <span className="contact-value">{item.value}</span>
                      </div>
                    </motion.a>
                  );
                })}
              </div>

            </motion.div>
          )}

        </div>
      </motion.div>

    </section>
  );
};

export default Contact;