import React from 'react';
import Squares from '../backgrounds/Squares';
import profileImage from '../../assets/profile.png'; 
import BlurText from '../effects/BlurText'; // 1. IMPORTAR O NOVO COMPONENTE

const AboutSection = () => {
  return (
    <section className="about-section">
      
      {/* --- O BACKGROUND FICA AQUI --- */}
      <div className="about-background">
        <Squares
          direction='up'
          speed={2}
          borderColor='#1b1b1bff'
          squareSize={40}
          hoverFillColor='#232323ff'
        />
      </div>
      
      {/* --- O CONTEÚDO (TEXTO) FICA AQUI --- */}
      <div className="about-content">
        
        {/* 2. SUBSTITUIR O H2 PELO BLURTEXT */}
        <BlurText
          text="Sobre Mim"
          className="section-title" // Usamos uma classe para o CSS
          animateBy="words"
          delay={150}
        />
        
        <div className="about-main">
          
          <div className="about-image">
            <img src={profileImage} alt="Marcos Rodrigues - Desenvolvedor Full-Stack" />
          </div>

          <div className="about-text">
            <p>
              Sou um Desenvolvedor Full-Stack com foco em Inteligência Artificial e
              Automação. Como graduando em Gestão da Informação pela UFU, minha
              especialidade é transformar processos de negócio e dados brutos em
              soluções inteligentes. Tenho experiência profissional em
              desenvolvimento e inovação , construindo aplicações de
              ponta-a-ponta: desde APIs de alta performance em Python (usando
              FastAPI e Flask ) e orquestração de LLMs com LangChain , até o
              desenvolvimento de frontends em React e Nuxt. Minha proficiência
              inclui arquiteturas com Docker , implementação de pipelines RAG e
              bancos de dados SQL/NoSQL.
            </p>
            <p>
              Essa paixão por empoderar pessoas com tecnologia é o que me move
              profissionalmente. Em meus projetos, busco aplicar os mesmos
              princípios: seja desenvolvendo soluções de IA que traduzem dados
              complexos em respostas claras , ou criando aplicações full-stack
              que automatizam tarefas e otimizam a tomada de decisão. Minha
              formação e experiência em desenvolvimento de inovação se unem no
              objetivo de criar ferramentas que sejam não apenas inteligentes,
              mas genuinamente úteis.
            </p>
          </div>
        </div>

      </div>

    </section>
  );
};

export default AboutSection;