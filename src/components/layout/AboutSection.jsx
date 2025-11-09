import React from 'react';
import Squares from '../backgrounds/Squares';
// 1. IMPORTAR AMBAS AS IMAGENS
import profileImageBw from '../../assets/profile.png'; // Imagem P&B
import profileImageColor from '../../assets/profile-color.png'; // Imagem Colorida
import BlurText from '../effects/BlurText';
import DecryptedText from '../effects/DecryptedText';
import GlitchImage from '../effects/GlitchImage'; 

const AboutSection = () => {

  return (
    <section className="about-section">
      
      {/* --- O BACKGROUND FICA AQUI --- */}
      <div className="about-background">
        <Squares
          direction='down'
          speed={2.5}
          borderColor='#222'
          squareSize={40}
          hoverFillColor='#060630'
        />
      </div>
      
      {/* --- O CONTEÚDO (TEXTO) FICA AQUI --- */}
      <div className="about-content">
        
        <BlurText
          text="Sobre Mim"
          className="section-title"
          animateBy="words"
          delay={150}
        />
        
        <div className="about-main">
          
          <div className="about-image">
            {/* 2. PASSAR AMBAS AS IMAGENS COMO PROPS */}
            <GlitchImage
              srcBw={profileImageBw}
              srcColor={profileImageColor}
              alt="Marcos Rodrigues - Desenvolvedor Full-Stack"
              glitchChance={0.8} 
            />
          </div>

          <div className="about-text">
            
            <p>
              <DecryptedText
                text="Sou um Desenvolvedor Full-Stack com foco em Inteligência Artificial e Automação. Como graduando em Gestão da Informação pela UFU, minha especialidade é transformar processos de negócio e dados brutos em soluções inteligentes. Tenho experiência profissional em desenvolvimento e inovação , construindo aplicações de ponta-a-ponta: desde APIs de alta performance em Python (usando FastAPI e Flask ) e orquestração de LLMs com LangChain , até o desenvolvimento de frontends em React e Nuxt. Minha proficiência inclui arquiteturas com Docker , implementação de pipelines RAG e bancos de dados SQL/NoSQL."
                animateOn="view"
                speed={50}
                maxIterations={20}
                sequential={false}
                revealDirection="start"
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
                revealDirection="start"
                useOriginalCharsOnly={true}
              />
            </p>
          </div>
        </div>

      </div>

    </section>
  );
};

export default AboutSection;