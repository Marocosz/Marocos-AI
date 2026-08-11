const profileDataStart = {
  title: ">_ WHOAMI", 
  role: "AI Developer & Full-Stack Engineer",
  stats: [
    { number: "4+", label: "Freelance Services", sublabel: "Delivered with Excellence" },
    { number: "4+", label: "Years Experience", sublabel: "Continuous Learning" },
    { number: "20+", label: "Total Projects", sublabel: "Innovative Solutions" }
  ],
  hero: {
    sectionLabel: "01. / PORTFOLIO",
    title: "Marcos<br />Rodrigues",
    role: "AI Developer & Full-Stack Engineer",
    cta: "Let's Talk",
    f11: "Press F11 for best experience",
    scroll: "Scroll"
  },
  bio_highlight: "I transform data into actionable intelligence through AI Agents, scalable architectures and strategic automation.",
  bio_full: "Graduated in Information Management from UFU, I work at the intersection of Data Science and Software Engineering. My specialty is building robust ecosystems that integrate LLMs with business processes and rules. With hands-on experience in Advanced Python, Docker and DevOps, I develop everything from logistics automation to complete SaaS products, always focused on clean code, performance and delivering real value.",
  skills_highlight: [
    "Python Expert", 
    "FastAPI", 
    "LangChain", 
    "GenAI & RAG", 
    "Docker", 
    "PostgreSQL", 
    "React", 
    "Data Science", 
    "DevOps"
  ]
};

const profileDataPt = {
  title: ">_ QUEM_SOU_EU",
  role: "Desenvolvedor de IA & Full-Stack",
  stats: [
    { number: "4+", label: "Serviços Freelance", sublabel: "Entregues com Excelência" },
    { number: "4+", label: "Anos de Experiência", sublabel: "Aprendizado Contínuo" },
    { number: "20+", label: "Projetos Totais", sublabel: "Soluções Inovadoras" }
  ],
  hero: {
    sectionLabel: "01. / PORTFÓLIO",
    title: "Marcos<br />Rodrigues",
    role: "Desenvolvedor de IA & Full-Stack",
    cta: "Vamos Conversar",
    f11: "Pressione F11 para melhor experiência",
    scroll: "Rolar"
  },
  bio_highlight: "Transformo dados em inteligência acionável através de Agentes de IA, arquiteturas escaláveis e automação estratégica.",
  bio_full: "Formado em Gestão da Informação pela UFU, atuo na interseção entre Ciência de Dados e Engenharia de Software. Minha especialidade é construir ecossistemas robustos que integram LLMs com processos e regras de negócio. Com experiência prática em Python Avançado, Docker e DevOps, desenvolvo desde automações logísticas até produtos SaaS completos, sempre focado em código limpo, performance e entrega de valor real.",
  skills_highlight: [
    "Especialista em Python", 
    "FastAPI", 
    "LangChain", 
    "GenAI & RAG", 
    "Docker", 
    "PostgreSQL", 
    "React", 
    "Ciência de Dados", 
    "DevOps"
  ]
};

export const getProfileData = (lang) => (lang === 'pt' ? profileDataPt : profileDataStart); 