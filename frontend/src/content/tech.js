import { Cpu, Server, Terminal, Layout } from 'lucide-react';

const techDataItemsEn = [
  {
    id: "ai",
    title: "AI & Data Science",
    icon: Cpu,
    description: "Core of my current work. Development of agents, RAG and data analysis.",
    items: [
      { name: "Python", level: "Expert", color: "#3776AB", tooltip: "My native language for everything." },
      { name: "LangChain", level: "Expert", color: "#F0C814", tooltip: "Agent orchestration and complex Chains." },
      { name: "Agents", level: "Advanced", color: "#10A37F", tooltip: "Using LLMs for your applications." },
      { name: "RAG", level: "Advanced", color: "#FF5500", tooltip: "Vector search systems (FAISS/Chroma)." },
      { name: "Pandas", level: "Advanced", color: "#150458", tooltip: "Structured data manipulation." },
      { name: "Scikit-learn", level: "Intermediate", color: "#F7931E", tooltip: "Classic Machine Learning." }
    ]
  },
  {
    id: "backend",
    title: "Backend Engineering",
    icon: Server,
    description: "Building scalable, secure and well-documented APIs.",
    items: [
      { name: "FastAPI", level: "Expert", color: "#009688", tooltip: "Main framework. High performance and typing." },
      { name: "SQLModel", level: "Advanced", color: "#E10098", tooltip: "Modern ORM to interact with SQL." },
      { name: "PostgreSQL", level: "Advanced", color: "#336791", tooltip: "Robust relational database." },
      { name: "Flask", level: "Advanced", color: "#000000", tooltip: "For microservices and legacy projects." },
      { name: "MongoDB", level: "Intermediate", color: "#47A248", tooltip: "NoSQL storage with Beanie ODM." },
      { name: "Redis", level: "Intermediate", color: "#DC382D", tooltip: "Caching and Queues." }
    ]
  },
  {
    id: "frontend",
    title: "Frontend & UI",
    icon: Layout,
    description: "Modern interfaces to bring intelligence applications to life.",
    items: [
      { name: "React", level: "Advanced", color: "#61DAFB", tooltip: "Main Frontend ecosystem (Vite)." },
      { name: "Streamlit", level: "Expert", color: "#FF4B4B", tooltip: "Fast prototyping of Data Apps." },
      { name: "Tailwind CSS", level: "Advanced", color: "#06B6D4", tooltip: "Utility-first and responsive styling." },
      { name: "Framer Motion", level: "Intermediate", color: "#0055FF", tooltip: "Fluid animations for React." },
      { name: "JavaScript", level: "Advanced", color: "#F7DF1E", tooltip: "The foundation of web interactivity." }
    ]
  },
  {
    id: "devops",
    title: "DevOps & Tools",
    icon: Terminal,
    description: "Environment, deployment and productivity tools.",
    items: [
      { name: "Docker", level: "Expert", color: "#2496ED", tooltip: "Containerization of all applications." },
      { name: "Git/GitHub", level: "Expert", color: "#F05032", tooltip: "Versioning and collaboration." },
      { name: "Linux", level: "Advanced", color: "#FCC624", tooltip: "Development environment and servers." },
      { name: "VPS", level: "Intermediate", color: "#000000", tooltip: "Application deployment and hosting." }
    ]
  }
];

const techDataItemsPt = [
  {
    id: "ai",
    title: "IA & Ciência de Dados",
    icon: Cpu,
    description: "Núcleo do meu trabalho atual. Desenvolvimento de agentes, RAG e análise de dados.",
    items: [
      { name: "Python", level: "Expert", color: "#3776AB", tooltip: "Minha língua nativa para tudo." },
      { name: "LangChain", level: "Expert", color: "#F0C814", tooltip: "Orquestração de Agentes e Chains complexas." },
      { name: "Agentes", level: "Advanced", color: "#10A37F", tooltip: "Usando LLMs para suas aplicações." },
      { name: "RAG", level: "Advanced", color: "#FF5500", tooltip: "Sistemas de busca vetorial (FAISS/Chroma)." },
      { name: "Pandas", level: "Advanced", color: "#150458", tooltip: "Manipulação de dados estruturados." },
      { name: "Scikit-learn", level: "Intermediate", color: "#F7931E", tooltip: "Machine Learning Clássico." }
    ]
  },
  {
    id: "backend",
    title: "Engenharia Backend",
    icon: Server,
    description: "Construindo APIs escaláveis, seguras e bem documentadas.",
    items: [
      { name: "FastAPI", level: "Expert", color: "#009688", tooltip: "Framework principal. Alta performance e tipagem." },
      { name: "SQLModel", level: "Advanced", color: "#E10098", tooltip: "ORM moderno para interagir com SQL." },
      { name: "PostgreSQL", level: "Advanced", color: "#336791", tooltip: "Banco de dados relacional robusto." },
      { name: "Flask", level: "Advanced", color: "#000000", tooltip: "Para microsserviços e projetos legados." },
      { name: "MongoDB", level: "Intermediate", color: "#47A248", tooltip: "Armazenamento NoSQL com Beanie ODM." },
      { name: "Redis", level: "Intermediate", color: "#DC382D", tooltip: "Cache e Filas." }
    ]
  },
  {
    id: "frontend",
    title: "Frontend & UI",
    icon: Layout,
    description: "Interfaces modernas para dar vida a aplicações inteligentes.",
    items: [
      { name: "React", level: "Advanced", color: "#61DAFB", tooltip: "Ecossistema Frontend Principal (Vite)." },
      { name: "Streamlit", level: "Expert", color: "#FF4B4B", tooltip: "Prototipagem rápida de Data Apps." },
      { name: "Tailwind CSS", level: "Advanced", color: "#06B6D4", tooltip: "Estilização responsiva e utilitária." },
      { name: "Framer Motion", level: "Intermediate", color: "#0055FF", tooltip: "Animações fluidas para React." },
      { name: "JavaScript", level: "Advanced", color: "#F7DF1E", tooltip: "A fundação da interatividade web." }
    ]
  },
  {
    id: "devops",
    title: "DevOps & Ferramentas",
    icon: Terminal,
    description: "Ambiente, deploy e ferramentas de produtividade.",
    items: [
      { name: "Docker", level: "Expert", color: "#2496ED", tooltip: "Containerização de todas as aplicações." },
      { name: "Git/GitHub", level: "Expert", color: "#F05032", tooltip: "Versionamento e colaboração." },
      { name: "Linux", level: "Advanced", color: "#FCC624", tooltip: "Ambiente de desenvolvimento e servidores." },
      { name: "VPS", level: "Intermediate", color: "#000000", tooltip: "Deploy de aplicações e hospedagem." }
    ]
  }
];

const techPageContentEn = {
  sectionLabel: "05. / ARSENAL",
  title: "Tech Stack",
  subtitle: "Languages, frameworks and tools I use to build robust solutions.",
  items: techDataItemsEn
};

const techPageContentPt = {
  sectionLabel: "05. / ARSENAL",
  title: "Tech Stack",
  subtitle: "Linguagens, frameworks e ferramentas que uso para construir soluções robustas.",
  items: techDataItemsPt
};

/**
 * OS NÍVEIS, EM ORDEM FIXA — do mais forte para o mais fraco.
 *
 * A ordem existe porque o badge de cada pasta lista as contagens em sequência ("2
 * expert · 3 avançado"), e duas pastas lado a lado com ordens diferentes ficam
 * impossíveis de comparar de relance.
 *
 * É também a LISTA CANÔNICA: os valores de `level` nos dados estão em inglês (herança
 * da página clássica) e alimentam três coisas — a chave de contagem aqui, a classe de
 * chip no CSS (`level-expert`) e o rótulo traduzido no `i18n`. Um `level` escrito com
 * outro nome sairia do badge em silêncio e não ganharia cor; há teste guardando.
 */
export const NIVEIS = ['expert', 'advanced', 'intermediate'];

/**
 * A distribuição de níveis de uma categoria, derivada dos próprios itens.
 *
 * Derivada e não escrita: uma contagem à mão aqui envelheceria na primeira tecnologia
 * acrescentada. Este projeto já teve três números literais envelhecerem em texto
 * visível, e a regra que ficou é que quantidade na interface vem de fonte única.
 *
 * Devolve só os níveis PRESENTES — categoria sem nenhum intermediário não mostra
 * "0 intermediário" no badge.
 */
export const contarNiveis = (items) =>
  NIVEIS
    .map((nivel) => ({
      nivel,
      total: items.filter((i) => i.level.toLowerCase() === nivel).length,
    }))
    .filter((n) => n.total > 0);

export const getTechData = (lang) => (lang === 'pt' ? techPageContentPt : techPageContentEn);