// src/data/projects.js

export const projectsData = [
  {
    id: 1, // Pode ajustar o ID conforme necessário na sua lista
    title: "Bússola V2",
    category: "Fullstack & AI",
    description:
      "Aplicação Web Pessoal que unifica Finanças, Saúde e Produtividade. Utiliza Agentes de IA orquestrados (LangGraph) para gerar insights e otimizar rotinas em uma plataforma segura e reativa. O Bússola V2 é a resposta definitiva para a fragmentação da vida moderna.Ele elimina a necessidade de alternar entre múltiplos aplicativos desconexos (planilhas financeiras, apps de treino, notas soltas e agendas), unificando todos os aspectos vitais da sua rotina em uma única plataforma inteligente e segura.",
    techs: [
      "React 19",
      "FastAPI",
      "LangChain",
      "Docker",
      "Redis",
      "SQLAlchemy",
      "Ai Agents",
    ],
    links: {
      github: "https://github.com/Marocosz/bussola-v2",
      live: "#", // Se tiver um link de deploy, coloque aqui, senão mantenha # ou remova
    },
  },
  {
    id: 2, // Ajuste o ID conforme a sequência
    title: "DataChat BI",
    category: "AI & Analytics",
    description:
      "DataChat BI é uma solução de Business Intelligence conversacional para logística, baseada em IA generativa. O sistema utiliza LLMs para interpretar perguntas em linguagem natural, gerar consultas SQL dinâmicas e entregar respostas precisas e contextualizadas, incluindo gráficos e KPIs. Com arquitetura modular de prompts e memória de conversa, DataChat BI oferece uma interface inteligente para análise avançada de dados logísticos via dashboard e principalmente chatbot.",
    techs: [
      "FastAPI",
      "LangChain",
      "React",
      "PostgreSQL",
      "LLaMA 3",
      "Ai Agents",
    ],
    links: {
      github: "https://github.com/Marocosz/DataChat-BI", // Link extraído do README
      live: "#",
    },
  },
  {
    id: 3, // Ajuste o ID conforme a sequência
    title: "Code Doc Generator",
    category: "AI & Tools",
    description:
      "API Web que utiliza Inteligência Artificial para analisar arquivos de código-fonte em Python (.py) e Pascal (.pas) e gerar uma documentação técnica completa e bem robusta em formato .docx. O objetivo é automatizar e agilizar o processo de documentação, tornando-o mais eficiente para desenvolvedores e equipes.",
    techs: ["Python", "Flask", "LangChain", "Ai Agents", "Docker"],
    links: {
      github: "https://github.com/Marocosz/gerador_doc_robos",
      live: "#",
    },
  },
  {
    id: 4, // Ajuste o ID conforme a sequência
    title: "Code Doc Generator",
    category: "AI & Tools",
    description:
      "API RESTful que utiliza Inteligência Artificial para extrair e organizar informações-chave de contratos nos formatos PDF e DOCX. O objetivo é agilizar a análise documental, tornando o processo mais eficiente para profissionais que lidam com grandes volumes de contratos!",
    techs: ["Python", "Flask", "LangChain", "Ai Agents", "Docker"],
    links: {
      github: "https://github.com/Marocosz/Analisador_Contrato",
      live: "#",
    },
  },
  {
    id: 5,
    title: "Marocos Bot 2.0",
    category: "Gaming & Automation",
    description:
      "Sistema de automação para comunidades competitivas de League of Legends. Gerencia o ciclo de vida completo de partidas personalizadas ('in-houses'): realiza a validação de Elo em tempo real via Riot API, executa algoritmos de permutação para o balanceamento matemático das equipes e gerencia dinamicamente canais de voz e permissões no servidor.",
    techs: ["Python", "Discord.py", "Riot API", "Algorithms", "AsyncIO"],
    links: {
      github: "https://github.com/Marocosz/Marocos-BOT-2",
      live: "#",
    },
  }
  // Adicione mais projetos conforme necessário
];