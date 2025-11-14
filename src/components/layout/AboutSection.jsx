import React from 'react';
import { motion } from 'motion/react'; 
import Particles from '../backgrounds/Particles'; 
import profileImageBw from '../../assets/profile.png';
import profileImageColor from '../../assets/profile-color.png';
import BlurText from '../effects/BlurText';
import DecryptedText from '../effects/DecryptedText';
import GlitchImage from '../effects/GlitchImage';

const AboutSection = () => {

  return (
    <section className="about-section">

      <div className="about-background">
        <Particles
          // --- VALORES ATUALIZADOS ---
          particleCount={150}         // Mais partículas
          particleSpread={7}
          speed={0.2}                 // Um pouco mais rápidas
          particleColors={['#FFFFFF']} 
          moveParticlesOnHover={true}
          particleHoverFactor={0.2}   
          alphaParticles={true}      // <-- MUDADO: Serão quadrados (mais visíveis)
          particleBaseSize={100}       // <-- MUDADO: Tamanho 5x maior
          sizeRandomness={1}
          cameraDistance={15}
          disableRotation={false}
        />
      </div>
      
      <div className="about-content">
        
        <BlurText
          text="Sobre Mim"
          className="section-title"
          animateBy="words"
          delay={150}
        />
        
        <div className="about-main">
          
          <motion.div 
            className="about-image"
            initial={{ opacity: 0, y: 50 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ margin: "-100px" }} 
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <GlitchImage
              srcBw={profileImageBw}
              srcColor={profileImageColor}
              alt="Marcos Rodrigues - Desenvolvedor Full-Stack"
              glitchChance={0.8} 
            />
          </motion.div>

          <motion.div 
            className="about-text"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            <p>
              <DecryptedText
                text="Sou um Desenvolvedor Full-Stack com foco em Inteligência Artificial e Automação. Como graduando em Gestão da Informação pela UFU, minha especialidade é transformar processos de negócio e dados brutos em soluções inteligentes. Tenho experiência profissional em desenvolvimento e inovação , construindo aplicações de ponta-a-ponta: desde APIs de alta performance em Python (usando FastAPI e Flask ) e orquestração de LLMs com LangChain , até o desenvolvimento de frontends em React e Nuxt. Minha proficiência inclui arquiteturas com Docker , implementação de pipelines RAG e bancos de dados SQL/NoSQL."
                animateOn="view"
                speed={50}
                maxIterations={20}
                sequential={false}
                useOriginalCharsOnly={true}
              />
            </p>
            
            <p>
              <DecryptedText
                text="Essa paixão por empoderar pessoas com tecnologia é o que me move profissionalmente. Em meus projetos, busco aplicar os mesmos princípios: seja desenvolvendo soluções de IA que traduzem dados complexos em respostas claras , ou criando aplicações full-stack que automatizam tarefas e otimizam a tomada de decisão. Minha formação e experiência em desenvolvimento de inovação se unem no objetivo de criar ferramentas que sejam não apenas inteligentes, mas genuinamente úteis."
                animateOn="view"
                speed={50}
                maxIterations={20}
                sequential={false}
                useOriginalCharsOnly={true}
              />
            </p>
          </motion.div>
        </div>

      </div>

    </section>
  );
};

export default AboutSection;