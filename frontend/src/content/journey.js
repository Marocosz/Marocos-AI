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
 * ORDEM DO ARRAY: DO MAIS RECENTE PARA O MAIS ANTIGO — e hoje ela significa outra
 * coisa. Continua sendo a ordem certa, mas por um motivo novo.
 *
 * A razão original: com cards de ~240px numa janela de 626px, abrir em 2018 punha o
 * emprego ATUAL abaixo da dobra. Um `git log` mostra o mais recente primeiro, e é
 * também o que responde primeiro à pergunta que o visitante traz.
 *
 * O QUE MUDOU (spec de 2026-08-12): o app virou um player, e a barra de progresso
 * dele é a linha do tempo real. Uma linha da esquerda para a direita TEM de ser
 * cronológica, ou os vãos entre marcadores não significam nada — então
 * `HistoryApp.jsx` ORDENA por `ano` para desenhar. O que esta ordem preserva agora é
 * qual entrada nasce SELECIONADA: a mais recente, que continua sendo o que o
 * recrutador veio saber. Estrutura cronológica, atenção no presente.
 *
 * O roadmap fica por ÚLTIMO, e não no topo. A convenção de changelog põe
 * "Unreleased" em primeiro, mas aqui o leitor é recrutador: abrir com o que se
 * pretende ser, antes do que se é, lê como ambição no lugar de entrega. (Ele também
 * é o único com `futuro: true`, e é o marcador vazado no fim da barra.)
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
    /**
     * `ano` É O ANO DE INÍCIO, e é ele que posiciona o marcador na barra.
     *
     * Existe separado de `date` porque `date` é string de EXIBIÇÃO ("2025 — now",
     * "PRÓXIMO"): derivar posição dela seria fazer cirurgia em texto traduzido, e
     * quebraria na primeira vez que alguém mudasse o travessão. Início e não fim
     * porque a pergunta que a posição responde é "quando isto começou".
     */
    ano: 2025,
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
    ano: 2024,
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
    ano: 2022,
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
    ano: 2019,
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
    ano: 2018,
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
    /**
     * SEM `ano`, E COM `futuro`. Esta entrada é a única que não aconteceu, então
     * datá-la seria inventar. `futuro: true` a põe no fim da barra por definição
     * (posição 100) e faz o marcador dela ser VAZADO — o desenho distingue o que já
     * foi do que se pretende, sem precisar de texto explicando.
     *
     * Também é o que o `hash: "0000000"` já dizia: é o SHA nulo do git, a única
     * forma honesta de dar hash a algo que ainda não foi commitado.
     */
    futuro: true,
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
    /** Ver a nota na versão em inglês: `ano` é o de início, e posiciona o marcador. */
    ano: 2025,
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
    ano: 2024,
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
    ano: 2022,
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
    ano: 2019,
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
    ano: 2018,
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
    /** Ver a nota na versão em inglês: sem `ano`, marcador vazado no fim da barra. */
    futuro: true,
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
 * A POSIÇÃO DE UMA ENTRADA NA BARRA DO PLAYER, em 0..100.
 *
 * É a peça que faz o design valer. A barra é a linha do tempo REAL, então o marcador
 * de 2022 fica a meio caminho porque 2022 é o meio de 2018..2026 — e não porque é a
 * terceira de seis. É isso que faz os vãos entre marcadores dizerem "três anos aqui,
 * um ano ali", coisa que uma lista de cards de altura igual não consegue dizer.
 *
 * `anoAtual` VEM POR PARÂMETRO, e não de um `new Date()` aqui dentro: é a mesma
 * decisão de `idadeEm()` em `profile.js` — função que lê o relógio não tem teste
 * determinístico, e esta é a conta que não pode estar errada.
 *
 * O FIM DA BARRA É O ANO ATUAL, não o ano da última entrada. Assim a última posição
 * real recua um pouco a cada ano que passa, e sobra o vão até hoje — que é a leitura
 * honesta: a trajetória continua acontecendo. Se o fim fosse a última entrada, ela
 * ficaria colada em 100% e a barra pareceria terminada.
 *
 * LIMITE ACEITO: duas entradas no mesmo ano se sobrepõem na barra. Não acontece hoje,
 * e forçar espaçamento mínimo faria a barra mentir sobre o tempo — que é a única
 * coisa que ela existe para dizer.
 */
export const posicaoNaLinha = (entradas, entrada, anoAtual) => {
  // A entrada de roadmap não tem ano: ela é o fim da barra por definição.
  if (entrada.futuro) return 100;

  const anos = entradas.filter((e) => !e.futuro).map((e) => e.ano);
  const inicio = Math.min(...anos);
  const fim = Math.max(anoAtual, ...anos);

  // Uma entrada só, ou todas no mesmo ano: não há extensão para dividir.
  if (fim === inicio) return 0;

  const bruto = ((entrada.ano - inicio) / (fim - inicio)) * 100;
  return Math.min(100, Math.max(0, bruto));
};

/**
 * `dragStart` e `dragMobile` ("Arraste para Explorar") saíram no refactor que removeu
 * o carrossel da página clássica.
 *
 * `dateLabel` e `authorLabel` ainda estão aqui e SAEM junto com o card de `git log`
 * que os consome — no player a data tem lugar próprio e a organização entra na linha
 * de meta, sem rótulo. Removê-los antes do consumidor deixaria a janela renderizando
 * "undefined" no meio da série de commits.
 *
 * As chaves de CONTROLE abaixo são strings de interface, e não dado de portfólio.
 * Ficam aqui, junto do resto do conteúdo da jornada, porque era onde `dateLabel` e
 * `authorLabel` já ficavam — mover a família toda para `i18n/` é uma arrumação
 * própria, não desta refatoração.
 */
const journeyPageContentEn = {
  sectionLabel: "04. / PROFESSIONAL JOURNEY",
  title: "Version History",
  /**
   * O anterior dizia "Most recent first, like any log worth reading" — virou FALSO
   * quando a barra passou a ser cronológica. Este aponta para o que ela faz de
   * diferente: os vãos.
   */
  subtitle: "Seven years in six tracks. The gaps between them count too.",
  dateLabel: "Date:",
  authorLabel: "Author:",
  /** Curto porque cabe na capa e na ponta direita da barra. */
  proximoCurto: "NEXT",
  linhaLabel: "Career timeline — use the arrow keys to move between entries",
  faixasLabel: "Tracks",
  /** `%a` de `%b` — interpolado no app. */
  contador: "%a of %b",
  controles: {
    primeira: "Go to the first entry",
    anterior: "See the previous entry",
    passear: "Walk the journey from the start",
    pausar: "Pause the walkthrough",
    proxima: "See the next entry",
    ultima: "Go to the last entry",
  },
  items: journeyDataEn,
};

const journeyPageContentPt = {
  sectionLabel: "04. / JORNADA PROFISSIONAL",
  title: "Histórico de Versões",
  /** Ver a nota no bloco em inglês: o anterior virou falso com a barra cronológica. */
  subtitle: "Sete anos em seis faixas. Os vãos entre elas também contam.",
  dateLabel: "Data:",
  authorLabel: "Autor:",
  proximoCurto: "PRÓXIMO",
  linhaLabel: "Linha do tempo da carreira — use as setas para mover entre entradas",
  faixasLabel: "Faixas",
  contador: "%a de %b",
  controles: {
    primeira: "Ir para a primeira entrada",
    anterior: "Ver a entrada anterior",
    passear: "Percorrer a jornada desde o início",
    pausar: "Pausar o passeio",
    proxima: "Ver a próxima entrada",
    ultima: "Ir para a última entrada",
  },
  items: journeyDataPt,
};

export const getJourneyData = (lang) => (lang === 'pt' ? journeyPageContentPt : journeyPageContentEn);
