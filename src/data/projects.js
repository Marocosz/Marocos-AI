// src/data/projects.js

export const projectsData = [
  {
    id: 1,
    title: "Bússola V2",
    category: "Fullstack & AI",
    description:
      "Personal Web Application that unifies Finance, Health and Productivity. Uses orchestrated AI Agents (LangGraph) to generate insights and optimize routines on a secure and reactive platform. Bússola V2 is the definitive answer to modern life fragmentation. It eliminates the need to switch between multiple disconnected apps (financial spreadsheets, workout apps, scattered notes and calendars), unifying all vital aspects of your routine in a single intelligent and secure platform.",
    techs: [
      "React 19",
      "FastAPI",
      "LangChain",
      "Docker",
      "Redis",
      "SQLAlchemy",
      "AI Agents",
    ],
    links: {
      github: "https://github.com/Marocosz/bussola-v2",
      live: "#",
    },
  },
  {
    id: 2,
    title: "DataChat BI",
    category: "AI & Analytics",
    description:
      "DataChat BI is a conversational Business Intelligence solution for logistics, based on generative AI. The system uses LLMs to interpret questions in natural language, generate dynamic SQL queries and deliver accurate and contextualized answers, including charts and KPIs. With modular prompt architecture and conversation memory, DataChat BI offers an intelligent interface for advanced analysis of logistics data via dashboard and especially chatbot.",
    techs: [
      "FastAPI",
      "LangChain",
      "React",
      "PostgreSQL",
      "LLaMA 3",
      "AI Agents",
    ],
    links: {
      github: "https://github.com/Marocosz/DataChat-BI",
      live: "#",
    },
  },
  {
    id: 3,
    title: "Code Doc Generator",
    category: "AI & Tools",
    description:
      "Web API that uses Artificial Intelligence to analyze source code files in Python (.py) and Pascal (.pas) and generate complete and robust technical documentation in .docx format. The goal is to automate and streamline the documentation process, making it more efficient for developers and teams.",
    techs: ["Python", "Flask", "LangChain", "AI Agents", "Docker"],
    links: {
      github: "https://github.com/Marocosz/gerador_doc_robos",
      live: "#",
    },
  },
  {
    id: 4,
    title: "Contract Analyzer",
    category: "AI & Tools",
    description:
      "RESTful API that uses Artificial Intelligence to extract and organize key information from contracts in PDF and DOCX formats. The goal is to streamline document analysis, making the process more efficient for professionals dealing with large volumes of contracts!",
    techs: ["Python", "Flask", "LangChain", "AI Agents", "Docker"],
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
      "Automation system for competitive League of Legends communities. Manages the complete lifecycle of custom matches ('in-houses'): performs real-time Elo validation via Riot API, executes permutation algorithms for mathematical team balancing and dynamically manages voice channels and permissions on the server.",
    techs: ["Python", "Discord.py", "Riot API", "Algorithms", "AsyncIO"],
    links: {
      github: "https://github.com/Marocosz/Marocos-BOT-2",
      live: "#",
    },
  }
];