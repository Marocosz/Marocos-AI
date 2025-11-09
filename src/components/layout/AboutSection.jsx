import React from 'react';
// import RippleGrid from '../backgrounds/RippleGrid'; // 1. REMOVIDO
import Squares from '../backgrounds/Squares';      // 2. ADICIONADO
import profileImage from '../../assets/profile.png'; 

const AboutSection = () => {
  return (
    <section className="about-section">
      
      {/* --- O BACKGROUND FICA AQUI --- */}
      <div className="about-background">
        
        {/* 3. COMPONENTE TROCADO */}
        <Squares
          // --- EDITE TODAS AS VARIÁVEIS AQUI ---
          direction='down'
          speed={2}
          borderColor='#19191aff'      // Cor da borda (cinza escuro sutil)
          squareSize={40}
          hoverFillColor='#171616ff' // Cor do hover (seu azul)
        />

      </div>
      
      {/* --- O CONTEÚDO (IMAGEM E TEXTO) CONTINUA IDÊNTICO --- */}
      <div className="about-content">
        
        <h2>Sobre Mim</h2>
        
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