// src/data/tech.js
import { Cpu, Globe, Server, Terminal, Database, Layout } from 'lucide-react';

export const techData = [
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