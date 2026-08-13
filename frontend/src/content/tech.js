import { Cpu, Server, Terminal, Layout, LineChart, Workflow, Bot } from 'lucide-react';

/**
 * A STACK — sete pastas.
 * ==================================================
 * Eram quatro (IA, backend, frontend, devops), e as três novas não são
 * subdivisão das antigas: elas descrevem trabalho que o site não registrava em
 * lugar nenhum.
 *
 *   ml          A disciplina que ele passou a EXERCER, e não só a ter cursado.
 *               Estava escondida como um único item `Scikit-learn` marcado
 *               "Intermediate" dentro da pasta de IA, enquanto o TCC fazia
 *               inferência estatística e o Fraud Sentinel treinava oito modelos.
 *   automacao   n8n e a API do WhatsApp são o dia a dia na Finza. Não cabiam em
 *               backend (não são backend) nem em devops (não são infraestrutura).
 *   agentico    A habilidade que o dono do projeto pediu explicitamente para
 *               registrar: harness próprio por projeto, skills, subagentes,
 *               hooks, camadas de teste. É diferencial real e não tinha onde
 *               morar — e este portfólio é, ele mesmo, a prova dela.
 *
 * A GRADE ABSORVE QUALQUER NÚMERO DE PASTAS. `DevicesApp.css` usa
 * `repeat(auto-fill, minmax(240px, 1fr))`, então sete pastas viram mais linhas e
 * nada de CSS muda. O que muda é a altura do conteúdo, e a janela já rola.
 *
 * A ORDEM É INTENCIONAL e o `DevicesApp` não a reordena (ver a nota sobre
 * `grid-auto-flow: dense` lá): IA primeiro porque é o núcleo, ML em seguida
 * porque é o que mudou, e o desenvolvimento com IA por último porque é o
 * meta-nível — como o resto é construído.
 */

const techDataItemsEn = [
  {
    id: "ai",
    title: "AI & Agents",
    icon: Cpu,
    description: "The core of my work: orchestrated agents, retrieval over real data, and guards that keep a model honest.",
    items: [
      { name: "Python", level: "Expert", color: "#3776AB", tooltip: "My native language for everything." },
      { name: "LangGraph", level: "Expert", color: "#1C3C3C", tooltip: "State graphs for agents that must be auditable." },
      { name: "LangChain", level: "Expert", color: "#F0C814", tooltip: "Chains, prompt templates and model abstraction." },
      { name: "RAG", level: "Advanced", color: "#FF5500", tooltip: "Vector retrieval with an answerability guard on top." },
      { name: "Agent Orchestration", level: "Advanced", color: "#10A37F", tooltip: "Deterministic flow in code, the LLM only for cognition." },
      { name: "Prompt Engineering", level: "Advanced", color: "#8B5CF6", tooltip: "Modular prompts, versioned like code." },
      { name: "Agent Evals", level: "Intermediate", color: "#0EA5E9", tooltip: "Measuring whether an agent answered well, not just that it answered." }
    ]
  },
  {
    id: "ml",
    title: "Machine Learning & Data",
    icon: LineChart,
    description: "Where I went deep in 2026: risk models, density clustering and statistics that survive a reviewer.",
    items: [
      { name: "scikit-learn", level: "Advanced", color: "#F7931E", tooltip: "Classic ML end to end, from split to threshold." },
      { name: "Gradient Boosting", level: "Advanced", color: "#EC4899", tooltip: "XGBoost and LightGBM on imbalanced problems." },
      { name: "pandas", level: "Advanced", color: "#150458", tooltip: "Structured data manipulation at scale." },
      { name: "Clustering", level: "Advanced", color: "#14B8A6", tooltip: "HDBSCAN over embeddings — density, so outliers stay outliers." },
      { name: "Statistics", level: "Advanced", color: "#0F766E", tooltip: "Bootstrap, Mann-Whitney, permutation tests, entropy and Gini." },
      { name: "Vector DBs", level: "Advanced", color: "#DC244C", tooltip: "Chroma and Qdrant as retrieval and as clustering input." },
      { name: "Embeddings", level: "Advanced", color: "#6366F1", tooltip: "Semantic representation for search and for grouping." }
    ]
  },
  {
    id: "backend",
    title: "Backend Engineering",
    icon: Server,
    description: "APIs that hold up: typed contracts, real migrations and the boundary drawn on purpose.",
    items: [
      { name: "FastAPI", level: "Expert", color: "#009688", tooltip: "Main framework. High performance and typing." },
      { name: "SQLAlchemy", level: "Advanced", color: "#E10098", tooltip: "ORM 2.x, with Alembic for migrations." },
      { name: "PostgreSQL", level: "Advanced", color: "#336791", tooltip: "Including tsvector and GIN instead of a second search engine." },
      { name: "Supabase", level: "Advanced", color: "#3ECF8E", tooltip: "Database, auth and edge functions in the product I work on." },
      { name: "Redis", level: "Advanced", color: "#DC382D", tooltip: "Cache, server-side sessions, pub/sub and queues." },
      { name: "Celery", level: "Intermediate", color: "#37814A", tooltip: "Background work that must not block a request." },
      { name: "MongoDB", level: "Intermediate", color: "#47A248", tooltip: "NoSQL storage with the Beanie ODM." }
    ]
  },
  {
    id: "frontend",
    title: "Frontend & Mobile",
    icon: Layout,
    description: "Interfaces that make intelligence usable — on the web and on a phone.",
    items: [
      { name: "React", level: "Advanced", color: "#61DAFB", tooltip: "Main frontend ecosystem, on Vite." },
      { name: "TypeScript", level: "Advanced", color: "#3178C6", tooltip: "Default on every new frontend." },
      { name: "JavaScript", level: "Advanced", color: "#F7DF1E", tooltip: "The foundation of web interactivity." },
      { name: "React Native", level: "Intermediate", color: "#61DAFB", tooltip: "Expo Router, written cross-platform by rule." },
      { name: "Tailwind CSS", level: "Advanced", color: "#06B6D4", tooltip: "Utility-first styling, and NativeWind on mobile." },
      { name: "Motion", level: "Advanced", color: "#0055FF", tooltip: "Layout animation — this system's windows run on it." },
      { name: "WebGL", level: "Intermediate", color: "#990000", tooltip: "Hand-written shaders on ogl, and three.js for the crystal." },
      { name: "Streamlit", level: "Expert", color: "#FF4B4B", tooltip: "Fast prototyping of data apps." }
    ]
  },
  {
    id: "automacao",
    title: "Automation & Integrations",
    icon: Workflow,
    description: "Removing manual work instead of adding screens. Most of what I do day to day at Finza.",
    items: [
      { name: "n8n", level: "Advanced", color: "#EA4B71", tooltip: "Orchestrating flows between systems that were never meant to talk." },
      { name: "WhatsApp Cloud API", level: "Advanced", color: "#25D366", tooltip: "Conversational channel at customer scale." },
      { name: "REST & Webhooks", level: "Expert", color: "#F59E0B", tooltip: "Integration with third-party systems, including closed ones." },
      { name: "Scheduled Jobs", level: "Advanced", color: "#A855F7", tooltip: "APScheduler and cron for what has to happen without a request." },
      { name: "ETL", level: "Advanced", color: "#4B5563", tooltip: "Extraction and normalisation from legacy databases." },
      { name: "Report Generation", level: "Advanced", color: "#B45309", tooltip: "PDF and DOCX generated programmatically, signed where the law asks." }
    ]
  },
  {
    id: "devops",
    title: "DevOps & Verification",
    icon: Terminal,
    description: "I own my own VPS, so shipping is mine. And a change I cannot verify is a change I did not make.",
    items: [
      { name: "Docker", level: "Expert", color: "#2496ED", tooltip: "Containerisation of every application." },
      { name: "Git/GitHub", level: "Expert", color: "#F05032", tooltip: "Versioning, collaboration and CI." },
      { name: "Coolify", level: "Advanced", color: "#8B5CF6", tooltip: "Deploy orchestration on my own VPS." },
      { name: "Linux & VPS", level: "Advanced", color: "#FCC624", tooltip: "Development environment and the server this site runs on." },
      { name: "Traefik", level: "Intermediate", color: "#24A1C1", tooltip: "Reverse proxy with automatic HTTPS." },
      { name: "CI/CD", level: "Advanced", color: "#2088FF", tooltip: "Continuous deploy from git, with gates that actually fail." },
      { name: "Playwright", level: "Advanced", color: "#2EAD33", tooltip: "Visual regression at zero tolerance — this site has a suite of it." },
      { name: "pytest", level: "Advanced", color: "#0A9EDC", tooltip: "Isolated suites: the tests never touch the dev database." }
    ]
  },
  {
    id: "agentico",
    title: "AI-Assisted Development",
    icon: Bot,
    description: "Not using an assistant — building one. A harness per project, so the tooling knows the codebase.",
    items: [
      { name: "Claude Code", level: "Expert", color: "#D97757", tooltip: "Main environment, with a harness written per repository." },
      { name: "Custom Skills", level: "Expert", color: "#7C3AED", tooltip: "The project's conventions as a skill the agent must follow." },
      { name: "Subagents", level: "Advanced", color: "#059669", tooltip: "Parallel work with isolated context per task." },
      { name: "Hooks", level: "Advanced", color: "#DB2777", tooltip: "Automation that fires on the harness, not on my memory." },
      { name: "MCP", level: "Advanced", color: "#0EA5E9", tooltip: "Connecting the agent to real tools — deploy panel, database, tickets." },
      { name: "Spec-driven work", level: "Advanced", color: "#64748B", tooltip: "Spec, then plan, then execution — with the reasoning committed." },
      { name: "Codex", level: "Intermediate", color: "#111827", tooltip: "Second opinion on review and on refactors." }
    ]
  }
];

const techDataItemsPt = [
  {
    id: "ai",
    title: "IA & Agentes",
    icon: Cpu,
    description: "O núcleo do meu trabalho: agentes orquestrados, recuperação sobre dado real, e guardas que mantêm o modelo honesto.",
    items: [
      { name: "Python", level: "Expert", color: "#3776AB", tooltip: "Minha língua nativa para tudo." },
      { name: "LangGraph", level: "Expert", color: "#1C3C3C", tooltip: "Grafo de estados para agente que precisa ser auditável." },
      { name: "LangChain", level: "Expert", color: "#F0C814", tooltip: "Chains, templates de prompt e abstração de modelo." },
      { name: "RAG", level: "Advanced", color: "#FF5500", tooltip: "Recuperação vetorial com guarda de responsabilidade em cima." },
      { name: "Orquestração de agentes", level: "Advanced", color: "#10A37F", tooltip: "Fluxo determinístico em código, LLM só para a cognição." },
      { name: "Engenharia de prompt", level: "Advanced", color: "#8B5CF6", tooltip: "Prompt modular, versionado como código." },
      { name: "Avaliação de agentes", level: "Intermediate", color: "#0EA5E9", tooltip: "Medir se o agente respondeu bem, não só que respondeu." }
    ]
  },
  {
    id: "ml",
    title: "Machine Learning & Dados",
    icon: LineChart,
    description: "Onde eu me aprofundei em 2026: modelo de risco, clustering por densidade e estatística que sobrevive a uma banca.",
    items: [
      { name: "scikit-learn", level: "Advanced", color: "#F7931E", tooltip: "ML clássico de ponta a ponta, do split ao limiar." },
      { name: "Gradient Boosting", level: "Advanced", color: "#EC4899", tooltip: "XGBoost e LightGBM em problema desbalanceado." },
      { name: "pandas", level: "Advanced", color: "#150458", tooltip: "Manipulação de dado estruturado em escala." },
      { name: "Clustering", level: "Advanced", color: "#14B8A6", tooltip: "HDBSCAN sobre embeddings — densidade, então outlier continua outlier." },
      { name: "Estatística", level: "Advanced", color: "#0F766E", tooltip: "Bootstrap, Mann-Whitney, permutação, entropia e Gini." },
      { name: "Bancos vetoriais", level: "Advanced", color: "#DC244C", tooltip: "Chroma e Qdrant como recuperação e como entrada de clustering." },
      { name: "Embeddings", level: "Advanced", color: "#6366F1", tooltip: "Representação semântica para busca e para agrupamento." }
    ]
  },
  {
    id: "backend",
    title: "Engenharia Backend",
    icon: Server,
    description: "API que aguenta: contrato tipado, migração de verdade e a fronteira desenhada de propósito.",
    items: [
      { name: "FastAPI", level: "Expert", color: "#009688", tooltip: "Framework principal. Alta performance e tipagem." },
      { name: "SQLAlchemy", level: "Advanced", color: "#E10098", tooltip: "ORM 2.x, com Alembic para as migrações." },
      { name: "PostgreSQL", level: "Advanced", color: "#336791", tooltip: "Inclusive tsvector e GIN em vez de um segundo motor de busca." },
      { name: "Supabase", level: "Advanced", color: "#3ECF8E", tooltip: "Banco, autenticação e edge functions no produto onde trabalho." },
      { name: "Redis", level: "Advanced", color: "#DC382D", tooltip: "Cache, sessão no servidor, pub/sub e fila." },
      { name: "Celery", level: "Intermediate", color: "#37814A", tooltip: "Trabalho em segundo plano que não pode travar a requisição." },
      { name: "MongoDB", level: "Intermediate", color: "#47A248", tooltip: "Armazenamento NoSQL com o ODM Beanie." }
    ]
  },
  {
    id: "frontend",
    title: "Frontend & Mobile",
    icon: Layout,
    description: "Interface que torna a inteligência usável — na web e no celular.",
    items: [
      { name: "React", level: "Advanced", color: "#61DAFB", tooltip: "Ecossistema frontend principal, sobre Vite." },
      { name: "TypeScript", level: "Advanced", color: "#3178C6", tooltip: "Padrão em todo frontend novo." },
      { name: "JavaScript", level: "Advanced", color: "#F7DF1E", tooltip: "A fundação da interatividade web." },
      { name: "React Native", level: "Intermediate", color: "#61DAFB", tooltip: "Expo Router, escrito cross-platform por regra." },
      { name: "Tailwind CSS", level: "Advanced", color: "#06B6D4", tooltip: "Estilização utilitária, e NativeWind no mobile." },
      { name: "Motion", level: "Advanced", color: "#0055FF", tooltip: "Animação de layout — as janelas deste sistema rodam nela." },
      { name: "WebGL", level: "Intermediate", color: "#990000", tooltip: "Shaders escritos à mão sobre ogl, e three.js no cristal." },
      { name: "Streamlit", level: "Expert", color: "#FF4B4B", tooltip: "Prototipagem rápida de data apps." }
    ]
  },
  {
    id: "automacao",
    title: "Automação & Integrações",
    icon: Workflow,
    description: "Tirar trabalho manual em vez de acrescentar tela. É a maior parte do meu dia a dia na Finza.",
    items: [
      { name: "n8n", level: "Advanced", color: "#EA4B71", tooltip: "Orquestração de fluxo entre sistemas que nunca foram feitos para conversar." },
      { name: "API do WhatsApp", level: "Advanced", color: "#25D366", tooltip: "Canal conversacional em escala de cliente." },
      { name: "REST & Webhooks", level: "Expert", color: "#F59E0B", tooltip: "Integração com sistema de terceiro, inclusive fechado." },
      { name: "Jobs agendados", level: "Advanced", color: "#A855F7", tooltip: "APScheduler e cron para o que tem de acontecer sem requisição." },
      { name: "ETL", level: "Advanced", color: "#4B5563", tooltip: "Extração e normalização a partir de banco legado." },
      { name: "Geração de relatório", level: "Advanced", color: "#B45309", tooltip: "PDF e DOCX gerados por código, assinados onde a lei pede." }
    ]
  },
  {
    id: "devops",
    title: "DevOps & Verificação",
    icon: Terminal,
    description: "A VPS é minha, então subir é comigo. E mudança que eu não consigo verificar é mudança que eu não fiz.",
    items: [
      { name: "Docker", level: "Expert", color: "#2496ED", tooltip: "Containerização de toda aplicação." },
      { name: "Git/GitHub", level: "Expert", color: "#F05032", tooltip: "Versionamento, colaboração e CI." },
      { name: "Coolify", level: "Advanced", color: "#8B5CF6", tooltip: "Orquestração de deploy na minha própria VPS." },
      { name: "Linux & VPS", level: "Advanced", color: "#FCC624", tooltip: "Ambiente de desenvolvimento e o servidor onde este site roda." },
      { name: "Traefik", level: "Intermediate", color: "#24A1C1", tooltip: "Proxy reverso com HTTPS automático." },
      { name: "CI/CD", level: "Advanced", color: "#2088FF", tooltip: "Deploy contínuo a partir do git, com gate que de fato reprova." },
      { name: "Playwright", level: "Advanced", color: "#2EAD33", tooltip: "Regressão visual com tolerância zero — este site tem uma suíte disso." },
      { name: "pytest", level: "Advanced", color: "#0A9EDC", tooltip: "Suíte isolada: o teste nunca toca o banco de desenvolvimento." }
    ]
  },
  {
    id: "agentico",
    title: "Desenvolvimento com IA",
    icon: Bot,
    description: "Não é usar um assistente — é construir um. Um harness por projeto, para a ferramenta conhecer o código.",
    items: [
      { name: "Claude Code", level: "Expert", color: "#D97757", tooltip: "Ambiente principal, com harness escrito por repositório." },
      { name: "Skills próprias", level: "Expert", color: "#7C3AED", tooltip: "As convenções do projeto como skill que o agente tem de seguir." },
      { name: "Subagentes", level: "Advanced", color: "#059669", tooltip: "Trabalho paralelo com contexto isolado por tarefa." },
      { name: "Hooks", level: "Advanced", color: "#DB2777", tooltip: "Automação que dispara no harness, e não na minha memória." },
      { name: "MCP", level: "Advanced", color: "#0EA5E9", tooltip: "Ligar o agente a ferramenta real — painel de deploy, banco, chamados." },
      { name: "Trabalho por spec", level: "Advanced", color: "#64748B", tooltip: "Spec, depois plano, depois execução — com o raciocínio commitado." },
      { name: "Codex", level: "Intermediate", color: "#111827", tooltip: "Segunda opinião em revisão e em refatoração." }
    ]
  }
];

const techPageContentEn = {
  sectionLabel: "05. / ARSENAL",
  title: "Tech Stack",
  subtitle: "What I build with, and how deep I am in each — declared per item, not averaged into a bar.",
  items: techDataItemsEn
};

const techPageContentPt = {
  sectionLabel: "05. / ARSENAL",
  title: "Tech Stack",
  subtitle: "Com o que eu construo, e quão fundo estou em cada — declarado por item, não achatado numa barrinha.",
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
 * acrescentada. Este projeto já teve cinco números literais envelhecerem em texto
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
