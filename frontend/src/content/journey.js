/**
 * A TRAJETÓRIA, RECONCILIADA COM A BASE DE CONHECIMENTO.
 * ==================================================
 * A fonte da verdade é `backend/data/knowledge_base/profile.md` — o mesmo
 * arquivo que alimenta o RAG do Marcos Virtual. Este arquivo derivou dela e
 * driftou; a versão anterior punha o estágio em 2024 (a base diz agosto de
 * 2025), rebaixava o cargo para "Estagiário de TI" (a base diz desenvolvedor
 * full stack, foco em IA, na área de inovação) e trazia quatro tags —
 * PyTorch, Kubernetes, MLOps, Fine-Tuning — que não aparecem em lugar nenhum
 * da base, três delas copiadas da entrada do futuro.
 *
 * **Se este arquivo e o `profile.md` discordarem, o `profile.md` está certo.**
 * O agente responde a partir dele; duas versões da mesma carreira no mesmo site
 * é o pior defeito possível.
 *
 * ORDEM: DO MAIS RECENTE PARA O MAIS ANTIGO.
 * A versão anterior abria em 2018, e com cards de ~240px numa janela de 626px
 * o emprego ATUAL era o quarto de cinco — abaixo da dobra. Um `git log` e o
 * Histórico de Atualizações do Windows mostram o mais recente primeiro, e é
 * também o que responde primeiro à pergunta que o visitante traz.
 *
 * O roadmap fica por ÚLTIMO, e não no topo. A convenção de changelog põe
 * "Unreleased" em primeiro, mas aqui o leitor é recrutador: abrir com o que se
 * pretende ser, antes do que se é, lê como ambição no lugar de entrega.
 *
 * OS HASHES SÃO HEXADECIMAIS DE VERDADE. Os anteriores tinham `i`, `j`, `k`,
 * `x` e `t` — letras que não existem em base 16. Quem lê git todo dia percebia
 * na primeira olhada, e o efeito era o oposto do pretendido. O roadmap usa
 * `0000000`, que é o SHA nulo do git: a única forma honesta de dar hash a algo
 * que ainda não foi commitado.
 *
 * PT E EN CARREGAM A MESMA INFORMAÇÃO. Antes o inglês era o original e o
 * português uma tradução encurtada — quem lia em PT perdia frases inteiras,
 * num repositório cuja convenção é PT-BR.
 */

const journeyDataEn = [
  {
    id: "step-now",
    date: "2025 — now",
    hash: "f4c1a09",
    type: "release",
    title: "Full Stack Developer & AI",
    org: "Supporte Logística · Innovation",
    description:
      "Since August 2025 I have been on the innovation team, building full stack solutions with a focus on AI. It is where I learn architecture, DevOps and good practices alongside more experienced developers — and where I see how a technical decision plays out inside a company. In parallel I keep freelancing, owning the whole cycle: understanding the problem, designing the solution, backend, frontend, deploy and what comes after it.",
    tags: ["FastAPI", "React", "Docker", "LangChain", "DevOps"],
  },
  {
    id: "step-ai",
    date: "2024",
    hash: "8e2d5b7",
    type: "release",
    title: "Turning Point: Generative AI",
    org: "Freelance & UFU",
    description:
      "The year I stopped consuming AI APIs and started building with them: containerized RESTful APIs with FastAPI and Docker, RAG over vector databases, prompt engineering. The freelance work grew alongside it — real clients, real problems, process automation that removes manual work instead of adding screens.",
    tags: ["RAG", "LangChain", "FastAPI", "Docker", "Freelance"],
  },
  {
    id: "step-uni",
    // Intervalo fechado, como a entrada do IFTM: a graduação terminou em agosto de
    // 2026. Enquanto estava em curso, a data era só o ano de início.
    date: "2022 — 2026",
    hash: "3a91c6e",
    type: "merge",
    title: "Information Management at UFU",
    org: "Federal University of Uberlândia",
    description:
      "An interdisciplinary degree that puts Administration and Computer Science in the same room, pointed at data — Data Analysis I through IV, Artificial Intelligence, Data Structures, Software Engineering, Databases and Data Mining. Graduated in August 2026. Outside the classroom, I spent almost a year teaching computer classes to children at the Sal da Terra community centre, and started judo through the university athletic association.",
    tags: ["Data Science", "SQL", "Python", "Pandas", "Teaching"],
  },
  {
    id: "step-iftm",
    date: "2019 — 2021",
    hash: "7b0d842",
    type: "merge",
    title: "Electronics Technician, and the First Course I Taught",
    org: "IFTM · Federal Institute",
    description:
      "Full-time high school integrated with a technical degree in Electronics — where I decided to become a developer. For that year's PAE (Annual Electronics Project), a few friends and I built an introductory electronics course from scratch: microcontrollers, Arduino logic, Tinkercad, Eagle, and working prototypes. We published all of it for free on YouTube, on the Denki3577 channel.",
    tags: ["Arduino", "C++", "Electronics", "Teaching"],
  },
  {
    id: "step-first-job",
    date: "2018",
    hash: "c15e3af",
    type: "init",
    title: "First Job, at 14: Support and Repair",
    org: "ServData",
    description:
      "I formatted machines, ran backups, swapped components, fixed printers and dealt with Windows every single day. The technical part mattered, but what stuck was responsibility: someone else's equipment in my hands and a problem that had to actually be solved. I still build and repair hardware today.",
    tags: ["Hardware", "Windows", "Support", "Troubleshooting"],
  },
  {
    id: "step-next",
    date: "NEXT",
    hash: "0000000",
    type: "wip",
    title: "Where I Am Heading",
    org: "Roadmap",
    description:
      "Going deeper on what I already do daily: RAG, agents and multi-agent orchestration, and system architecture that survives contact with production. I also want the mathematics underneath the models — machine learning at bare metal, not just the API on top of it — and technical leadership skills.",
    tags: ["RAG", "Agents", "Architecture", "Machine Learning"],
  },
];

const journeyDataPt = [
  {
    id: "step-now",
    date: "2025 — hoje",
    hash: "f4c1a09",
    type: "release",
    title: "Desenvolvedor Full Stack & IA",
    org: "Supporte Logística · Inovação",
    description:
      "Desde agosto de 2025 estou na área de inovação, construindo soluções full stack com foco em IA. É onde aprendo arquitetura, DevOps e boas práticas ao lado de desenvolvedores mais experientes — e onde vejo uma decisão técnica render consequência dentro de uma empresa. Em paralelo sigo com freelance, assumindo o ciclo inteiro: entender o problema, desenhar a solução, backend, frontend, deploy e o que vem depois dele.",
    tags: ["FastAPI", "React", "Docker", "LangChain", "DevOps"],
  },
  {
    id: "step-ai",
    date: "2024",
    hash: "8e2d5b7",
    type: "release",
    title: "A virada: IA generativa",
    org: "Freelance & UFU",
    description:
      "O ano em que parei de consumir API de IA e passei a construir com ela: APIs RESTful containerizadas com FastAPI e Docker, RAG sobre banco vetorial, engenharia de prompt. O freelance cresceu junto — cliente de verdade, problema de verdade, automação de processo que tira trabalho manual em vez de acrescentar tela.",
    tags: ["RAG", "LangChain", "FastAPI", "Docker", "Freelance"],
  },
  {
    id: "step-uni",
    /** Ver a nota na versão em inglês: intervalo fechado desde agosto de 2026. */
    date: "2022 — 2026",
    hash: "3a91c6e",
    type: "merge",
    title: "Gestão da Informação na UFU",
    org: "Universidade Federal de Uberlândia",
    description:
      "Uma graduação interdisciplinar que põe Administração e Ciência da Computação na mesma sala, apontadas para dados — Análise de Dados I a IV, Inteligência Artificial, Estrutura de Dados, Engenharia de Software, Banco de Dados e Mineração de Dados. Formado em agosto de 2026. Fora da sala, passei quase um ano dando aula de informática para crianças no Centro Comunitário Sal da Terra, e comecei a treinar judô pela atlética.",
    tags: ["Ciência de dados", "SQL", "Python", "Pandas", "Ensino"],
  },
  {
    id: "step-iftm",
    date: "2019 — 2021",
    hash: "7b0d842",
    type: "merge",
    title: "Técnico em Eletrônica, e o primeiro curso que dei",
    org: "IFTM · Instituto Federal",
    description:
      "Ensino médio integrado ao técnico em Eletrônica, em tempo integral — foi ali que decidi seguir como desenvolvedor. Para o PAE daquele ano, eu e alguns amigos montamos do zero um curso introdutório de eletrônica: microcontroladores, lógica no Arduino, Tinkercad, Eagle e protótipos que funcionavam. Publicamos tudo de graça no YouTube, no canal Denki3577.",
    tags: ["Arduino", "C++", "Eletrônica", "Ensino"],
  },
  {
    id: "step-first-job",
    date: "2018",
    hash: "c15e3af",
    type: "init",
    title: "Primeiro emprego, aos 14: suporte e manutenção",
    org: "ServData",
    description:
      "Formatava máquinas, fazia backup, trocava componente, consertava impressora e lidava com Windows todo santo dia. A parte técnica contou, mas o que ficou foi o senso de responsabilidade: equipamento dos outros na minha mão e um problema que precisava ser resolvido de verdade. Até hoje monto e conserto hardware.",
    tags: ["Hardware", "Windows", "Suporte", "Diagnóstico"],
  },
  {
    id: "step-next",
    date: "PRÓXIMO",
    hash: "0000000",
    type: "wip",
    title: "Para onde estou indo",
    org: "Roadmap",
    description:
      "Aprofundar o que já faço todo dia: RAG, agentes e orquestração multi-agente, e arquitetura de sistema que sobrevive ao contato com produção. Quero também a matemática por baixo dos modelos — machine learning no osso, não só a API por cima dele — e habilidade de liderança técnica.",
    tags: ["RAG", "Agentes", "Arquitetura", "Machine Learning"],
  },
];

/**
 * `dragStart` e `dragMobile` ("Arraste para Explorar") saíram: eram do carrossel
 * que o refactor removeu, e não havia mais nada para arrastar.
 *
 * Os rótulos perderam o espaço final — o JSX de `HistoryApp.jsx` já insere um.
 */
const journeyPageContentEn = {
  sectionLabel: "04. / PROFESSIONAL JOURNEY",
  title: "Version History",
  subtitle: "Most recent first, like any log worth reading.",
  dateLabel: "Date:",
  authorLabel: "Author:",
  items: journeyDataEn,
};

const journeyPageContentPt = {
  sectionLabel: "04. / JORNADA PROFISSIONAL",
  title: "Histórico de Versões",
  subtitle: "Do mais recente para o mais antigo, como todo log que se preze.",
  dateLabel: "Data:",
  authorLabel: "Autor:",
  items: journeyDataPt,
};

export const getJourneyData = (lang) => (lang === 'pt' ? journeyPageContentPt : journeyPageContentEn);
