// src/data/tech.js
import { Cpu, Globe, Server, Terminal, Database, Layout } from 'lucide-react';

export const techData = [
  {
    id: "ai",
    title: "AI & Data Science",
    icon: Cpu,
    description: "Core da minha atuação atual. Desenvolvimento de agentes, RAG e análise de dados.",
    items: [
      { name: "Python", level: "Expert", color: "#3776AB", tooltip: "Minha linguagem nativa para tudo." },
      { name: "LangChain", level: "Expert", color: "#F0C814", tooltip: "Orquestração de Agentes e Chains complexas." },
      { name: "Agents", level: "Advanced", color: "#10A37F", tooltip: "Usar LLMs para suas aplicações." },
      { name: "RAG", level: "Advanced", color: "#FF5500", tooltip: "Sistemas de busca vetorial (FAISS/Chroma)." },
      { name: "Pandas", level: "Advanced", color: "#150458", tooltip: "Manipulação de dados estruturados." },
      { name: "Scikit-learn", level: "Intermediate", color: "#F7931E", tooltip: "Machine Learning clássico." }
    ]
  },
  {
    id: "backend",
    title: "Backend Engineering",
    icon: Server,
    description: "Construção de APIs escaláveis, seguras e bem documentadas.",
    items: [
      { name: "FastAPI", level: "Expert", color: "#009688", tooltip: "Framework principal. Alta performance e tipagem." },
      { name: "SQLModel", level: "Advanced", color: "#E10098", tooltip: "ORM moderno para interagir com SQL." },
      { name: "PostgreSQL", level: "Advanced", color: "#336791", tooltip: "Banco de dados relacional robusto." },
      { name: "Flask", level: "Advanced", color: "#000000", tooltip: "Para microsserviços e projetos legacy." },
      { name: "MongoDB", level: "Intermediate", color: "#47A248", tooltip: "Armazenamento NoSQL com Beanie ODM." },
      { name: "Redis", level: "Intermediate", color: "#DC382D", tooltip: "Caching e Filas." }
    ]
  },
  {
    id: "frontend",
    title: "Frontend & UI",
    icon: Layout,
    description: "Interfaces modernas para dar vida às aplicações de inteligência.",
    items: [
      { name: "React", level: "Advanced", color: "#61DAFB", tooltip: "Ecossistema principal de Frontend (Vite)." },
      { name: "Streamlit", level: "Expert", color: "#FF4B4B", tooltip: "Prototipagem rápida de Data Apps." },
      { name: "Tailwind CSS", level: "Advanced", color: "#06B6D4", tooltip: "Estilização utilitária e responsiva." },
      { name: "Framer Motion", level: "Intermediate", color: "#0055FF", tooltip: "Animações fluidas para React." },
      { name: "JavaScript", level: "Advanced", color: "#F7DF1E", tooltip: "A base da interatividade web." }
    ]
  },
  {
    id: "devops",
    title: "DevOps & Tools",
    icon: Terminal,
    description: "Ambiente, deploy e ferramentas de produtividade.",
    items: [
      { name: "Docker", level: "Expert", color: "#2496ED", tooltip: "Containerização de todas as aplicações." },
      { name: "Git/GitHub", level: "Expert", color: "#F05032", tooltip: "Versionamento e colaboração." },
      { name: "Linux", level: "Advanced", color: "#FCC624", tooltip: "Ambiente de desenvolvimento e servidores." },
      { name: "VPS", level: "Intermediate", color: "#000000", tooltip: "Deploy e hospedagem de aplicações." }
    ]
  }
];