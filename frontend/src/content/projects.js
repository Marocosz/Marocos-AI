const projectsDataEn = [
  {
    id: 1,
    title: "Bússola V2",
    category: "Fullstack & AI",
    description: "Personal Web Application that unifies Finance, Health and Productivity. Uses orchestrated AI Agents (LangGraph) to generate insights and optimize routines on a secure and reactive platform. Bússola V2 is the definitive answer to modern life fragmentation. It eliminates the need to switch between multiple disconnected apps (financial spreadsheets, workout apps, scattered notes and calendars), unifying all vital aspects of your routine in a single intelligent and secure platform.",
    techs: ["React 19", "FastAPI", "LangChain", "Docker", "Redis", "SQLAlchemy", "AI Agents"],
    links: { github: "https://github.com/Marocosz/bussola-v2", live: "#" },
  },
  {
    id: 2,
    title: "DataChat BI",
    category: "AI & Analytics",
    description: "DataChat BI is a conversational Business Intelligence solution for logistics, based on generative AI. The system uses LLMs to interpret questions in natural language, generate dynamic SQL queries and deliver accurate and contextualized answers, including charts and KPIs. With modular prompt architecture and conversation memory, DataChat BI offers an intelligent interface for advanced analysis of logistics data via dashboard and especially chatbot.",
    techs: ["FastAPI", "LangChain", "React", "PostgreSQL", "LLaMA 3", "AI Agents"],
    links: { github: "https://github.com/Marocosz/DataChat-BI", live: "#" },
  },
  {
    id: 3,
    title: "Code Doc Generator",
    category: "AI & Tools",
    description: "Web API that uses Artificial Intelligence to analyze source code files in Python (.py) and Pascal (.pas) and generate complete and robust technical documentation in .docx format. The goal is to automate and streamline the documentation process, making it more efficient for developers and teams.",
    techs: ["Python", "Flask", "LangChain", "AI Agents", "Docker"],
    links: { github: "https://github.com/Marocosz/gerador_doc_robos", live: "#" },
  },
  {
    id: 4,
    title: "Contract Analyzer",
    category: "AI & Tools",
    description: "RESTful API that uses Artificial Intelligence to extract and organize key information from contracts in PDF and DOCX formats. The goal is to streamline document analysis, making the process more efficient for professionals dealing with large volumes of contracts!",
    techs: ["Python", "Flask", "LangChain", "AI Agents", "Docker"],
    links: { github: "https://github.com/Marocosz/Analisador_Contrato", live: "#" },
  },
  {
    id: 5,
    title: "Marocos Bot 2.0",
    category: "Gaming & Automation",
    description: "Automation system for competitive League of Legends communities. Manages the complete lifecycle of custom matches ('in-houses'): performs real-time Elo validation via Riot API, executes permutation algorithms for mathematical team balancing and dynamically manages voice channels and permissions on the server.",
    techs: ["Python", "Discord.py", "Riot API", "Algorithms", "AsyncIO"],
    links: { github: "https://github.com/Marocosz/Marocos-BOT-2", live: "#" },
  }
];

const projectsDataPt = [
  {
    id: 1,
    title: "Bússola V2",
    category: "Fullstack & IA",
    description: "Aplicação Web Pessoal que unifica Finanças, Saúde e Produtividade. Usa Agentes de IA orquestrados (LangGraph) para gerar insights e otimizar rotinas em uma plataforma segura e reativa. Bússola V2 é a resposta definitiva para a fragmentação da vida moderna. Elimina a necessidade de alternar entre múltiplos apps desconectados, unificando todos os aspectos vitais da sua rotina em uma plataforma inteligente.",
    techs: ["React 19", "FastAPI", "LangChain", "Docker", "Redis", "SQLAlchemy", "Agentes de IA"],
    links: { github: "https://github.com/Marocosz/bussola-v2", live: "#" },
  },
  {
    id: 2,
    title: "DataChat BI",
    category: "IA & Analytics",
    description: "DataChat BI é uma solução de Business Intelligence conversacional para logística, baseada em IA generativa. O sistema usa LLMs para interpretar perguntas em linguagem natural, gerar consultas SQL dinâmicas e entregar respostas precisas e contextualizadas. Com arquitetura de prompt modular e memória de conversação, o DataChat BI oferece uma interface inteligente para análise avançada de dados logísticos.",
    techs: ["FastAPI", "LangChain", "React", "PostgreSQL", "LLaMA 3", "Agentes de IA"],
    links: { github: "https://github.com/Marocosz/DataChat-BI", live: "#" },
  },
  {
    id: 3,
    title: "Code Doc Generator",
    category: "IA & Ferramentas",
    description: "API Web que usa Inteligência Artificial para analisar arquivos de código fonte em Python (.py) e Pascal (.pas) e gerar documentação técnica completa em formato .docx. O objetivo é automatizar e agilizar o processo de documentação, tornando-o mais eficiente para desenvolvedores e equipes.",
    techs: ["Python", "Flask", "LangChain", "Agentes de IA", "Docker"],
    links: { github: "https://github.com/Marocosz/gerador_doc_robos", live: "#" },
  },
  {
    id: 4,
    title: "Contract Analyzer",
    category: "IA & Ferramentas",
    description: "API RESTful que usa Inteligência Artificial para extrair e organizar informações chave de contratos em PDF e DOCX. O objetivo é agilizar a análise de documentos, tornando o processo mais eficiente para profissionais que lidam com grandes volumes de contratos!",
    techs: ["Python", "Flask", "LangChain", "Agentes de IA", "Docker"],
    links: { github: "https://github.com/Marocosz/Analisador_Contrato", live: "#" },
  },
  {
    id: 5,
    title: "Marocos Bot 2.0",
    category: "Gaming & Automação",
    description: "Sistema de automação para comunidades competitivas de League of Legends. Gerencia o ciclo de vida completo de partidas personalizadas: realiza validação de Elo em tempo real via Riot API, executa algoritmos de permutação para balanceamento matemático de times e gerencia dinamicamente canais de voz.",
    techs: ["Python", "Discord.py", "Riot API", "Algoritmos", "AsyncIO"],
    links: { github: "https://github.com/Marocosz/Marocos-BOT-2", live: "#" },
  }
];

const projectsPageContentEn = {
  sectionLabel: "03. / PORTFOLIO",
  title: "Selected Work",
  subtitle: "A selection of projects showcasing my Full-Stack and AI skills.",
  subtitleDesktopExtra: "Click on cards to see details.",
  labels: {
    idea: "IDEA",
    techs: "TECHS",
    github: "View on GitHub"
  },
  items: projectsDataEn
};

const projectsPageContentPt = {
  sectionLabel: "03. / PORTFÓLIO",
  title: "Trabalhos Selecionados",
  subtitle: "Uma seleção de projetos mostrando minhas habilidades em Full-Stack e IA.",
  subtitleDesktopExtra: "Clique nos cards para ver detalhes.",
  labels: {
    idea: "IDEIA",
    techs: "TECS",
    github: "Ver no GitHub"
  },
  items: projectsDataPt
};

/**
 * A FICHA DE ARQUIVO DE CADA PROJETO — o que a lista em modo Detalhes mostra
 * nas colunas de data e tamanho.
 * ==================================================
 * FICA NUMA TABELA SÓ, chaveada pelo id, e não dentro de cada array de idioma.
 * Data e tamanho não têm tradução, e duplicá-los nas duas listas seria criar
 * mais duas chances de as versões PT e EN discordarem — que é exatamente o
 * defeito que este repositório acabou de consertar em `journey.js`.
 *
 * `bytes` NÃO É O PESO DO REPOSITÓRIO. É uma estimativa de COMPLEXIDADE,
 * vestida de tamanho de arquivo porque a janela é um explorador e a coluna
 * pede um número em KB. A ordem é o que importa e ela é defensável a partir do
 * próprio resumo de cada projeto:
 *
 *   Bússola V2          fullstack com agentes orquestrados, fila, ORM e cache;
 *                       sete tecnologias e três domínios num produto só
 *   DataChat BI         LLM traduzindo linguagem natural em SQL, com memória de
 *                       conversa, dashboard E chatbot
 *   Marocos Bot 2.0     algoritmo de balanceamento, integração com API externa
 *                       e gestão de estado assíncrono
 *   Code Doc Generator  um pipeline, dois formatos de entrada, um de saída
 *   Contract Analyzer   o mais focado: extrair campos de PDF e DOCX
 *
 * `data` é a única coisa aqui que eu NÃO consigo derivar do conteúdo, e por
 * isso é a única que precisa de conferência do dono do projeto. São datas
 * plausíveis para a ordem em que os projetos aparecem, não datas verificadas.
 */
const FICHA = {
  1: { data: '2026-02-14', bytes: 4404019 },
  2: { data: '2025-09-30', bytes: 3250586 },
  3: { data: '2025-06-12', bytes: 1003520 },
  4: { data: '2025-04-25', bytes: 762880 },
  5: { data: '2024-11-08', bytes: 1887437 },
};

/** Junta a ficha ao item do idioma pedido, sem tocar nos arrays originais. */
const comFicha = (pagina) => ({
  ...pagina,
  items: pagina.items.map((p) => ({ ...p, ...(FICHA[p.id] || {}) })),
});

export const getProjectsData = (lang) =>
  comFicha(lang === 'pt' ? projectsPageContentPt : projectsPageContentEn);