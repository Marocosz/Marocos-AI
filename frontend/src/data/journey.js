const journeyDataEn = [
  {
    id: "step-01",
    date: "2018 - 2021",
    hash: "a1b2c3d",
    type: "init",
    title: "Technical Foundation: Hardware & Code",
    org: "ServData & IFTM",
    description: "My journey began by combining hands-on infrastructure practice at ServData with development logic in the Electronics course at IFTM. From technical support to microcontrollers with C++ and Arduino, I built the foundation that connects the physical world to the digital one.",
    tags: ["Hardware", "Arduino", "Electronics", "Support"]
  },
  {
    id: "step-02",
    date: "2022",
    hash: "i7j8k9l",
    type: "merge",
    title: "Academic Immersion & Data",
    org: "Federal University of Uberlândia",
    description: "Enrolled at the Federal University of Uberlândia (UFU) in Information Management. I dove into statistics, Machine Learning and database manipulation, building the analytical foundation for the more complex projects that would follow. This opened up freelance opportunities in automation.",
    tags: ["Data Science", "SQL", "Academic", "Python"],
  },
  {
    id: "step-03",
    date: "2024",
    hash: "m0n1o2p",
    type: "release",
    title: "Focus on Artificial Intelligence",
    org: "Supporte Logística",
    description: "This year marked my specialization in AI. I developed complex projects like a containerized RESTful API with Docker and FastAPI, implementing RAG practices, Vector Databases, Prompt Engineering. And I had my first freelance gigs in process automation and robust web applications.",
    tags: ["Generative AI", "RAG", "Freelance", "FastAPI", "Web"],
  },
  {
    id: "step-04",
    date: "2025",
    hash: "a2b42xt",
    type: "wip",
    title: "Fullstack & AI Developer",
    org: "Supporte Logística",
    description: "Starting in August 2025, I joined as an IT Intern at Supporte Logística, focused on development and innovation projects with AI. Simultaneously, I work more intensely as a Freelance Fullstack Developer, creating custom web applications, Python APIs and data automation solutions for clients.",
    tags: ["PyTorch", "Kubernetes", "MLOps", "Fine-Tuning"],
  },
  {
    id: "step-05",
    date: "FUTURE",
    hash: "q3r4s5t",
    type: "init",
    title: "Next Level: AI Engineer",
    org: "Roadmap 2026+",
    description: "Continuous deepening in software applications with the best of AI, Agents, Multi-Agents and Orchestrators. Learning more about RAG and model Fine Tuning, MLOps and scalable distributed systems architecture for robust AI solutions.",
    tags: ["AI", "Kubernetes", "MLOps", "Fine-Tuning"],
  },
];

const journeyDataPt = [
  {
    id: "step-01",
    date: "2018 - 2021",
    hash: "a1b2c3d",
    type: "init",
    title: "Fundação Técnica: Hardware & Código",
    org: "ServData & IFTM",
    description: "Minha jornada começou combinando prática de infraestrutura na ServData com lógica de desenvolvimento no curso de Eletrônica no IFTM. Do suporte técnico a microcontroladores com C++ e Arduino, construí a base que conecta o mundo físico ao digital.",
    tags: ["Hardware", "Arduino", "Eletrônica", "Suporte"]
  },
  {
    id: "step-02",
    date: "2022",
    hash: "i7j8k9l",
    type: "merge",
    title: "Imersão Acadêmica & Dados",
    org: "Universidade Federal de Uberlândia",
    description: "Ingressei na Universidade Federal de Uberlândia (UFU) em Gestão da Informação. Mergulhei em estatística, Machine Learning e manipulação de bancos de dados, construindo a base analítica para projetos complexos. Isso abriu portas para automação freelancer.",
    tags: ["Ciência de Dados", "SQL", "Acadêmico", "Python"],
  },
  {
    id: "step-03",
    date: "2024",
    hash: "m0n1o2p",
    type: "release",
    title: "Foco em Inteligência Artificial",
    org: "Supporte Logística",
    description: "Este ano marcou minha especialização em IA. Desenvolvi projetos complexos como APIs RESTful containerizadas com Docker e FastAPI, implementando práticas de RAG, Bancos de Dados Vetoriais e Engenharia de Prompt.",
    tags: ["IA Generativa", "RAG", "Freelance", "FastAPI", "Web"],
  },
  {
    id: "step-04",
    date: "2025",
    hash: "a2b42xt",
    type: "wip",
    title: "Desenvolvedor Fullstack & IA",
    org: "Supporte Logística",
    description: "Começando em Agosto de 2025, atuo como Estagiário de TI na Supporte Logística, focado em desenvolvimento e inovação com IA. Simultaneamente, trabalho como Desenvolvedor Fullstack Freelancer, criando aplicações web, APIs Python e automações.",
    tags: ["PyTorch", "Kubernetes", "MLOps", "Fine-Tuning"],
  },
  {
    id: "step-05",
    date: "FUTURO",
    hash: "q3r4s5t",
    type: "init",
    title: "Próximo Nível: Engenheiro de IA",
    org: "Roadmap 2026+",
    description: "Aprofundamento contínuo em aplicações de software com o melhor da IA, Agentes, Multi-Agentes e Orquestradores. Aprendendo mais sobre RAG, Fine Tuning, MLOps e arquitetura de sistemas distribuídos escaláveis.",
    tags: ["IA", "Kubernetes", "MLOps", "Fine-Tuning"],
  },
];

const journeyPageContentEn = {
  sectionLabel: "04. / PROFESSIONAL JOURNEY",
  title: "Experience Timeline",
  subtitle: "A chronological journey through my professional growth and important milestones.",
  dragStart: "Drag to Explore",
  dragMobile: "Swipe to Explore",
  dateLabel: "Date: ",
  authorLabel: "Author: ",
  items: journeyDataEn
};

const journeyPageContentPt = {
  sectionLabel: "04. / JORNADA PROFISSIONAL",
  title: "Linha do Tempo",
  subtitle: "Uma jornada cronológica através do meu crescimento profissional e marcos importantes.",
  dragStart: "Arraste para Explorar",
  dragMobile: "Deslize para Explorar",
  dateLabel: "Data: ",
  authorLabel: "Autor: ",
  items: journeyDataPt
};

export const getJourneyData = (lang) => (lang === 'pt' ? journeyPageContentPt : journeyPageContentEn);
