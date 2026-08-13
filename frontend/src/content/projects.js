/**
 * OS PROJETOS.
 * ==================================================
 * A REGRA DESTE ARQUIVO: TODA AFIRMAÇÃO TÉCNICA FOI LIDA NO CÓDIGO.
 *
 * Não no README, não no documento de apresentação. A instrução veio do dono do
 * projeto — "ver o código dos projetos e não apenas documentações ou readmes
 * (eles podem estar desatualizados)" — e ela se pagou cinco vezes:
 *
 *   1. O InTec-Access da pasta local tem `ia_analise.py` VAZIO e os módulos de
 *      pessoas/acessos como stub. A versão DEPLOYADA tem vinte arquivos a mais.
 *      Descrever pela pasta local teria subvendido o projeto pela metade.
 *   2. O mesmo projeto tem `face-api.js` no package.json do frontend e NÃO USA
 *      em arquivo nenhum. Levantar dependência teria anunciado reconhecimento
 *      facial inexistente.
 *   3. O balanceamento do Marocos Bot era descrito aqui como "algoritmos de
 *      permutação para balanceamento matemático". O código não faz permutação
 *      NENHUMA: ele calcula um MMR ajustado (elo + LP, com peso de fila e bônus
 *      de winrate por K-factor decrescente) e distribui em snake draft. A parte
 *      interessante era o modelo de rating, e a descrição antiga apontava para o
 *      lugar errado.
 *   4. O Diário Oficial renderiza PDF com PLAYWRIGHT, não com WeasyPrint — a
 *      WeasyPrint está no requirements e o renderer usa Chromium headless.
 *   5. O Scope Intelligence não é "HDBSCAN sobre embeddings": é UMAP reduzindo a
 *      dimensionalidade ANTES, com auto-tuning por volume e refinamento
 *      recursivo macro→micro.
 *
 * Quando o README e o código discordam, o código está certo. E o que entra em
 * `destaques` é uma DECISÃO DE ENGENHARIA lida no código, nunca um adjetivo:
 * "guarda de SSRF porque o Chromium do servidor busca toda imagem do documento"
 * é destaque; "arquitetura robusta" é enchimento.
 *
 * ==================================================
 * CONTAGEM DE TESTE NÃO É DESTAQUE — e esta regra é nova.
 *
 * A primeira versão destes textos abria vários projetos com o número de testes
 * ("368 casos de teste em 70 arquivos", "74 testes", "42 testes"). Instrução do
 * dono do projeto: *"em vários lugares do projeto você dá ênfase à quantidade de
 * testes... sendo que isso não é algo importante"*. E está certo por um motivo
 * que vale escrever: o número é uma medida de ESFORÇO, e quem lê quer uma medida
 * de JULGAMENTO.
 *
 * O que ficou no lugar foi o mecanismo, que é o que a contagem tentava insinuar:
 * "a suíte aponta para um banco próprio, truncado antes de cada teste" diz mais
 * sobre disciplina do que "170 casos" jamais diria, e é verificável na mesma
 * olhada. Mesma informação, sem o troféu.
 *
 * As contagens SOBREVIVEM no comentário de `FICHA`, no fim do arquivo, e ali elas
 * são legítimas: lá elas justificam a ordem de complexidade da lista para quem
 * for mexer nela, e não vendem nada a ninguém.
 *
 * ==================================================
 * A ORDEM DO ARRAY É A DE COMPLEXIDADE, e não a cronológica.
 *
 * Decisão do dono do projeto. A lista é um explorador com coluna de data, então
 * a tentação é ordenar por data — mas quem abre a pasta quer ver primeiro o
 * trabalho mais difícil, não o mais recente. E como `bytes` já É a estimativa de
 * complexidade, ordenar por ela deixa a coluna "Tamanho" monotonicamente
 * decrescente: a lista passa a se explicar sozinha de cima para baixo.
 *
 * A coluna de data fica não-monotônica de propósito. É o preço, e é honesto:
 * data é fato, não ranking.
 *
 * ==================================================
 * NOME DE CLIENTE: EMPREGADOR SIM, FREELANCE NÃO.
 *
 * Decisão explícita do dono do projeto. Finza e Supporte Logística aparecem —
 * já apareciam na Jornada. Os freelances são descritos por SETOR e DOMÍNIO, sem
 * marca. É a mesma regra que `content/servicos.js` já registrava para a
 * contagem da VPS: nome de cliente numa página pública é decisão dele, não do
 * site.
 *
 * ==================================================
 * `contexto` É CHAVE, NÃO RÓTULO.
 *
 * Mesma decisão que `inicializacao` em `servicos.js` e `level` em `tech.js`, e
 * pela mesma razão: é ela que o CSS usa como modificador de classe
 * (`.project-detail-contexto--freelance`), e o rótulo traduzido vive no
 * `i18n/os.js`. Traduzir o dado quebraria a classe em silêncio num dos idiomas.
 *
 * ==================================================
 * `links.github` É OPCIONAL, e a ausência dele é informação.
 *
 * Oito dos doze projetos são de cliente ou de empresa e não têm repositório
 * público. Deixá-los fora seria esconder o trabalho mais recente; inventar link
 * seria pior. O `ProjectDetailApp` mostra um selo `código fechado` quando o
 * campo não existe — e o selo é honesto de um jeito que um botão quebrado nunca
 * seria.
 *
 * O Hub de Agentes ENTROU nessa lista depois: o repositório é público hoje, mas é
 * código da empresa e vai ser fechado. Melhor descrever sem link do que publicar
 * um link que morre.
 */

const projectsDataEn = [
  {
    id: 3,
    title: 'Electronic Official Gazette',
    category: 'Multi-tenant SaaS',
    contexto: 'freelance',
    description:
      'A whitelabel multi-tenant platform for municipal official gazettes: civil servants lay out the edition in a block editor, the system renders it, signs it with the city hall\'s own digital certificate and publishes it, and any citizen searches the full text without logging in. One codebase serving many municipalities, each isolated by column.',
    problema:
      'An official gazette is a legal instrument, so a list of scanned PDFs is a filing cabinet, not a publication system. Three things have to be simultaneously true: the file carries legal validity, the archive is searchable as text going back decades, and the layout the civil servant sees is byte-for-byte the layout that gets signed. The third one is where naive solutions die — an HTML preview that paginates differently from the final PDF makes the editor a liar.',
    solucao:
      'The PDF is rendered by headless Chromium, so the browser that lays out the preview is the browser that produces the file. To fetch its own authenticated pages, the renderer receives a short-lived minted token — and because that token would otherwise end up in a stack trace, there is a scrubber with a charset-restricted regex that strips it from any error text before logging. Signing is ICP-Brasil PAdES B-B through pyHanko, with the certificate stored per city hall and the signer resolved by factory, so the test suite runs against a fake signer and production never notices. Full-text search is Postgres tsvector with GIN indexes instead of a second data store.',
    destaques: [
      'SSRF guard on section content: the server-side Chromium fetches every image in the document, so an image URL pointing at an internal address would become a GET from inside the network — validated on save, with an allowlist of hosts',
      'ICP-Brasil PAdES B-B signature via pyHanko, per-tenant certificate, with expiry and invalid-certificate as typed errors rather than a crash',
      'The filler-ad positioning editor shows rasterised real PDF pages as its background, not a live browser render — because the two paginated differently — with a content hash so it only re-renders when the edition actually changed',
      'The token the renderer uses to fetch its own pages is scrubbed from any error text before logging, by a charset-restricted regex — a short-lived credential is still a credential, and stack traces go to files',
      'Renderer and signer are both Protocols with fake implementations, which is what lets the suite run without launching Chromium or holding a real certificate',
      'Legacy archive importer, because a new gazette starts with decades of old ones',
    ],
    techs: ['FastAPI', 'asyncpg', 'PostgreSQL', 'Alembic', 'pyHanko', 'Playwright', 'pypdf', 'S3/MinIO', 'React', 'TypeScript', 'BlockNote'],
    links: {},
  },
  {
    id: 2,
    title: 'Academic Portal',
    category: 'Fullstack Engineering',
    contexto: 'freelance',
    description:
      'A request portal for a federal university department. Students, and people with no academic affiliation at all, open requests through forms the department itself builds; the professor rules, the registry office rules last, and everything that happened is recoverable. Freelance, end to end — requirements, backend, frontend, infrastructure.',
    problema:
      'The department does not want a fixed set of request types — it wants to create new ones without a developer, which turns the whole thing into a form builder with conditional logic. And the approval chain has a trap a naive state machine gets wrong: when a professor approves, the student must NOT see "approved", because only the registry office grants that. Showing it early creates an expectation the institution then has to break.',
    solucao:
      'The visible status is derived, never stored: internal states never leak, and the transition table itself declares which role may perform each move, so permission lives next to the rule instead of in a screen. Forms are a builder with eight field types, per-field format validators (including real CPF check-digit arithmetic) and visibility conditions evaluated against the answers already given. Authentication is a server-side session in Redis rather than a JWT, because a token you cannot revoke is the wrong trade for academic records — and the per-request chat runs over SSE on Redis pub/sub, with a pure-function policy deciding who sees each message so staff notes stay internal.',
    destaques: [
      'The suite points at a database of its own, truncated before every single test, with its own Redis DB flushed alongside — so a test run can never leave residue in the environment someone is developing in',
      'Module boundaries enforced by import-linter as a CI gate: a module may import another\'s service, never its models or repository, so crossing a boundary means passing primitives',
      'The attachment lifecycle mirrors the process lifecycle — files live under temp/ while pending and are moved to definitivo/ only on final approval',
      'Protocol numbers generated from a 36-character alphabet with secrets, not a sequence: an external requester can track a case by protocol precisely because the next one is not guessable',
      'Two-factor authentication with TOTP, rate limiting, CSRF by double-submit, and security headers each with their own test',
      'Transactional audit: the log enters the same transaction as the change it describes, or neither happens',
    ],
    techs: ['FastAPI', 'SQLAlchemy 2', 'PostgreSQL', 'Alembic', 'Redis', 'Celery', 'structlog', 'React', 'TypeScript', 'i18next'],
    links: {},
  },
  {
    id: 1,
    title: 'Collections Engine',
    category: 'Fullstack & Automation',
    contexto: 'produto',
    description:
      'The product I work on daily at Finza. It is the engine that decides what the collections team does next: it schedules the work, organises and filters the portfolio, and generates actions from what the integrated systems report — plus a set of services built specifically for how that team operates. Conversational agents are one of the channels it drives, not the point of it.',
    problema:
      'Collections is not a conversation problem, it is a prioritisation problem at a volume no team can work by hand. The data arrives from several integrated systems, each with its own idea of what a debtor is, and the decision of who to contact today, through which channel, with which message, has to come out the other side as a concrete action — auditable, reversible and explainable to whoever asks why that person was contacted.',
    solucao:
      'The engine sits between the integrations and the team: it consolidates and filters what comes in, schedules the work on time windows and rules, and emits actions rather than reports — so the team receives something to do, not a dashboard to interpret. Around that sit specific services for the team\'s own workflow. The conversational agents run on top as one of the execution channels, and because a bot that answers badly burns a paying customer, every conversation is instrumented: the metrics layer turns transcripts into numbers the business can argue with, which is what turns "the bot seems fine" into a decision.',
    destaques: [
      'Scheduling and filtering as the core: the output is a generated action with a reason attached, not a list for someone to read',
      'Consolidation across several integrated systems, each with its own shape for the same entity',
      'Instrumentation of the conversational agents themselves — a conversation becomes a number the business can act on',
      'Supabase as database and backend, React front end, and a defined CI/CD cycle over both, so a prompt change ships reviewed and reversible like any code change',
      'I also act as requirements analyst on it: the meetings where a business pain becomes a technical scope are mine',
    ],
    techs: ['React', 'Supabase', 'PostgreSQL', 'Edge Functions', 'n8n', 'WhatsApp Cloud API', 'AI Agents', 'CI/CD'],
    links: {},
  },
  {
    id: 6,
    title: 'AI Agent Hub',
    category: 'AI Platform',
    contexto: 'empresa',
    description:
      'An internal AI platform built at Supporte Logística: four specialised agent backends behind a single gateway, each answering a different department. Text-to-SQL over the operational database, semantic analysis of support tickets, assisted authoring of quality documents, and documentation of legacy robots.',
    problema:
      'Autonomous agents that talk to each other are the wrong answer inside a company. Swarms produce infinite loops, unpredictable cost and decisions nobody can audit — and text-to-SQL fails on its own roughly one time in five. Worse, a generated query is arbitrary code aimed at a production database: the interesting failure is not a syntax error, it is a DROP that parses cleanly.',
    solucao:
      'Control flow lives in deterministic Python — a finite state machine — and the LLM is used only for isolated cognitive tasks. A cheap router classifies intent into five categories before any expensive model is touched. Generated SQL then goes through a guard that parses it into a syntax tree with sqlglot, dialect-aware, and walks the tree rejecting forbidden node types — so DELETE, DROP, UPDATE and friends are caught structurally rather than by matching strings. When the database still rejects a query, a Fixer agent receives the broken SQL plus the actual Postgres error and rewrites it, so the user never sees the failure. Ticket analysis is a different discipline entirely: tickets become embeddings, UMAP reduces the dimensionality to densify them, HDBSCAN finds the groups, and only then does an LLM explain what each cluster has in common.',
    destaques: [
      'Four agent backends and a React front end behind an nginx gateway, orchestrated by Docker Compose',
      'SQL guard by abstract syntax tree, not by blacklist: sqlglot parses the query and the walk rejects forbidden node types, which is the difference between blocking DROP and blocking every way to write DROP',
      'Self-healing text-to-SQL: the Fixer agent takes the broken query and the database error and rewrites it, so the ~20% natural failure rate stops being the user\'s problem',
      'Row-level security injected into the prompt: the user\'s role and SQL constraints travel with the question',
      'Clustering with UMAP before HDBSCAN, auto-tuned by data volume and refined recursively macro-to-micro, returning a hierarchy plus a per-point confidence — outliers stay outliers instead of being forced into a group',
      'Document authoring as five sequential agents (planner, writer, reviser, critic, finaliser) with human approval gates between them over WebSocket, and a mock implementation of each so the flow is testable without spending a token',
    ],
    techs: ['FastAPI', 'LangChain', 'sqlglot', 'Qdrant', 'HDBSCAN', 'UMAP', 'OpenAI', 'PostgreSQL', 'WebSocket', 'React', 'nginx', 'Docker'],
    /**
     * SEM LINK, e o repositório está público neste instante. É código da empresa e
     * vai ser fechado — decisão do dono do projeto. Um link que morre é pior que
     * nenhum link, então este projeto nasce aqui já com o selo.
     */
    links: {},
  },
  {
    id: 4,
    title: 'Bússola V2',
    category: 'Fullstack & AI',
    contexto: 'pessoal',
    description:
      'My personal operating system for daily life: finances, records, training and planning in one application, with eighteen AI agents across five domains that read the actual data and propose actions instead of chatting about them. Also the project where I try architectural ideas before they reach a client.',
    problema:
      'An assistant that answers in free text is useless inside an application, because the interface cannot render a paragraph as a button. And LLM output is not deterministic: the same prompt returns a bare list one time and a dictionary wrapping that list the next. So the hard part is not getting eighteen agents to give good advice — it is getting them to answer in a shape the front end can draw, every single time, without the front end learning to parse.',
    solucao:
      'Every agent returns the same universal contract: a Pydantic schema with typed suggestions, severity and action payloads. Between the model and the rest of the system sits a sanitisation layer that normalises the structural variation into a flat list, injects the metadata the model forgot, and validates strictly — so anything malformed dies there instead of reaching the interface. Enum fields go through fuzzy matching, because a model that answers "high" where the enum says "HIGH" is right in spirit and would otherwise fail validation. The LLM comes from a factory with retry and safe JSON parsing, which makes the provider an environment variable rather than a rewrite.',
    destaques: [
      '18 agents across five domains, each with its own orchestrator over a shared base',
      'A universal response contract plus a sanitisation layer: the front end renders cards and buttons from the contract and never learns which agent produced them',
      'Fuzzy matching from loose LLM strings onto strict enums, so a valid answer in the wrong case is accepted instead of rejected',
      'Three interchangeable LLM providers behind one factory, with retry and safe JSON parsing, and imports guarded so a missing driver does not stop the app from booting',
      'Redis cache on AI answers, because the same question about the same unchanged data does not deserve a second model call',
      'Money handling is tested on its own, because it is the one place in the app where a rounding error is a bug and not a detail',
      'A companion Discord bot with its own authentication and account-linking flow',
    ],
    techs: ['React 19', 'FastAPI', 'LangGraph', 'LangChain', 'Pydantic', 'PostgreSQL', 'SQLAlchemy', 'Redis', 'discord.py', 'Docker'],
    links: { github: 'https://github.com/Marocosz/Bussola-v2' },
  },
  {
    id: 5,
    title: 'Spotify Algorithm Audit',
    category: 'Data Science & Research',
    contexto: 'academico',
    description:
      'My final undergraduate thesis in Information Management: a black-box audit of Spotify\'s recommender. Four synthetic personas were built inside real accounts, left to settle, and then what the platform recommended back to them was measured against what they had been fed. The question was whether automated curation widens musical taste or homogenises it.',
    problema:
      'You cannot read a recommender\'s source code, so its behaviour has to be inferred from outside — and any difference you find has to survive the objection that it was chance. Then, halfway through the research, Spotify progressively removed fields from its Web API, which broke the planned method for measuring what the recommendations actually contained.',
    solucao:
      'A sock puppet audit: each persona is constructed programmatically in a real account — playlists, likes, follows — with a contrasting archetype and a documented selection rule, so the input is a variable and not a taste. The removed API fields were replaced by enriching from Last.fm and MusicBrainz, and the removal itself was treated as a finding about platform opacity rather than as an accident. Diversity and concentration come from Shannon entropy, Pielou evenness, Gini, HHI and Jaccard, and none of it is reported bare: every comparison carries bootstrap confidence intervals, Mann-Whitney tests, rarefaction to control for unequal sample sizes, and a permutation test to establish what chance alone would have produced.',
    destaques: [
      'Artist repertoires stayed fully disjoint between personas — Jaccard = 0, and the permutation test puts that as more segregated than chance, p < 0.001',
      'Diversity converges by catalogue richness, not by entropy homogenisation: the platform widens the shelf without flattening the taste, which is a different answer from both of the ones the literature expects',
      'A popularity bias (+131% listeners per artist) and a hit bias inside the long tail (+405% listeners per track), both measured rather than asserted',
      'Rarefaction in the pipeline because the personas ended up with different sample sizes, and diversity metrics are sensitive to that — comparing them raw would have manufactured a result',
      '28 pipeline scripts across four phases, from building the accounts to generating the figures, with account reset as its own step so a run starts clean',
    ],
    techs: ['Python', 'spotipy', 'pandas', 'NumPy', 'SciPy', 'Matplotlib', 'Seaborn', 'Last.fm API', 'MusicBrainz'],
    links: { github: 'https://github.com/Marocosz/TCC' },
  },
  {
    id: 9,
    title: 'Access Control Portal',
    category: 'Legacy Integration & AI',
    contexto: 'freelance',
    description:
      'A portal built on top of a third-party turnstile and time-clock system. It reads the vendor\'s database, adds the visitor flow the original product never had, monitors gate events live, and mails out security reports written by an LLM over real numbers. Freelance, backend and frontend.',
    problema:
      'The valuable data was locked inside a closed commercial system with no schema documentation, and the client could not replace it. So everything useful had to be inferred from outside — and the inference had to be safe in a specific way: this is a database whose integrity another vendor is responsible for, and writing into its tables directly would be sabotage disguised as integration.',
    solucao:
      'I mapped the schema by snapshotting it repeatedly and diffing the snapshots, which produced a changelog of which tables actually move when a person walks through a gate. Then the integration became deliberately asymmetric: reads go straight to the tables and views for performance, but every create, update and delete is written into the vendor\'s own integration queue with a pending flag, so the vendor\'s task manager applies the change through its own rules. The portal never touches the main tables for writes. On top of it, a scheduler runs the reports: KPIs are computed from the gate log, an LLM writes the analysis in a fixed five-section structure, and the PDF is generated and archived.',
    destaques: [
      'Asymmetric legacy integration: direct read for speed, but writes go into the vendor\'s integration queue with a pending status so its own task manager applies them — the closed system stays consistent',
      'Legacy schema reverse-engineered by snapshot diffing, and the tool plus its changelogs are committed in the repository',
      'Five scheduled jobs: daily, weekly and monthly report generation, a 60-day retention sweep, and an hourly pass that expires stale visit requests and e-mails the people affected',
      'LLM reports constrained by a five-section template with explicit formatting prohibitions, because the failure mode of a report-writing model is preamble and invented metadata',
      'Live gate monitoring over WebSocket, with daily KPIs and a separate forensic audit log restricted to the administrator role',
      'Pydantic response models as the security boundary: the internal user schema carries the password hash and the public one does not, so a careless return cannot leak it',
    ],
    techs: ['FastAPI', 'SQL Server', 'pyodbc', 'LangChain', 'Gemini', 'APScheduler', 'ReportLab', 'Nuxt 4', 'Vue 3', 'Pinia'],
    links: {},
  },
  {
    id: 7,
    title: 'Fraud Sentinel',
    category: 'Machine Learning',
    contexto: 'academico',
    description:
      'A full machine learning pipeline for detecting fraud in bank account applications, on the Bank Account Fraud suite published at NeurIPS 2022. The goal is to catch as much fraud as possible while keeping false alarms low enough that a human team can still work the queue.',
    problema:
      'Fraud is about 1% of the base, so a model answering "legitimate" to everything is 99% accurate and worthless — accuracy is the wrong metric before anything else happens. But the subtler problem is the decision threshold. It is tempting to pick the cut that maximises F1 on the data you have, and that is data leakage wearing a lab coat: a threshold fitted on the training set is optimistic about itself, and the model looks better in the report than it will ever be in production.',
    solucao:
      'CRISP-DM end to end: exploratory analysis with significance testing and mutual information for feature selection, memory downcasting so the base fits, then eight algorithms trained and compared over a shared base class — logistic regression, decision tree, random forest, XGBoost, LightGBM, a multilayer perceptron, isolation forest for the anomaly angle, and a stacking ensemble on top. The threshold is computed on a held-out validation split the model never saw during training, which is the fix for the leakage above, and there is a separate module that moves it to hit a target precision — so the business constraint enters the mathematics instead of being argued about after the fact.',
    destaques: [
      'The threshold module exists because of a real bug: it was being computed with predict_proba on the training set, which made the estimated F1 optimistic. It now comes from a held-out validation split',
      'Eight trainers over a shared base class, including isolation forest and a stacking ensemble',
      'Target-precision tuning: you state the false-alarm rate the team can absorb and it finds the cut, rather than reporting the threshold that flatters the model',
      'Production simulation over held-out data, because a metric on a test split is not an operating model',
      'Experiment logging on every run, so a comparison between two models is a record and not a memory',
    ],
    techs: ['Python', 'scikit-learn', 'XGBoost', 'LightGBM', 'CatBoost', 'pandas', 'NumPy', 'Matplotlib', 'CRISP-DM', 'Docker'],
    links: { github: 'https://github.com/Marocosz/fraud-sentinel' },
  },
  {
    id: 8,
    title: 'Citizen Services Portal',
    category: 'Multi-tenant SaaS',
    contexto: 'freelance',
    description:
      'A whitelabel multi-tenant platform for municipalities to take social assistance requests and run a public job board online. Citizens use it without creating an account, identified by document number; staff work it from an admin panel scoped to their own city hall.',
    problema:
      'The same codebase serves several municipalities, and a single query that forgets its tenant filter puts one city\'s social assistance records on another city\'s screen — with data that is sensitive by law. On top of that, not every municipality buys every module, so the product has to sell in pieces without shipping a different build per customer.',
    solucao:
      'Every entity carries a tenant column and every query filters on it. The front end resolves the tenant from the URL slug, a middleware pins it to the request and refuses anything it cannot resolve, and a reserved-slug list stops a tenant from ever claiming an administrative route. Modules are feature flags per tenant, toggled by the platform operator — and there is a test whose entire job is to prove that turning a feature off closes its endpoints, because a flag that only hides a menu is not a flag, it is a decoration over an open API.',
    destaques: [
      'A dedicated test proving a disabled feature is closed at the API and not merely hidden in the interface — the distinction between a feature flag and a decoration',
      'Tenant isolation by column plus middleware, with reserved slugs so a tenant can never claim an admin route',
      'Four roles, including a cross-tenant operator that is the only one able to create municipalities and the only one who sees audit logs across all of them',
      'Dynamic branding per city hall — colour and logo — from a single build',
      'The tests are concentrated exactly where a multi-tenant bug is expensive: tenant resolution, feature closure, the cross-tenant override and the audit trail',
    ],
    techs: ['FastAPI', 'SQLAlchemy', 'PostgreSQL', 'Alembic', 'React', 'TypeScript', 'Zustand', 'Docker'],
    links: {},
  },
  {
    id: 13,
    title: 'DataChat BI',
    category: 'AI & Analytics',
    contexto: 'empresa',
    description:
      'Conversational business intelligence for logistics, built at Supporte Logística: you ask in plain language, the system writes the SQL, runs it and answers with numbers and charts. A dashboard sits alongside the chat over the same engine.',
    problema:
      'Most questions a manager has are one query away from being answered, and the query never gets written, because writing it requires knowing the schema. But a system that generates SQL for every incoming message wastes a model call on "good morning" — and, worse, tries to answer "and last month?" without knowing what that is a follow-up to.',
    solucao:
      'The chain is assembled in LCEL as one master chain wrapped in message history, so memory is loaded at the start of a turn and saved at the end without the flow managing it. A router classifies intent first and a branch sends the message down one of two paths, so small talk never reaches the SQL chain. Follow-ups work because a rephraser resolves the question against the history before generation, and the session keeps the last SQL it ran — so "and last month?" is answered by modifying a query that already worked instead of guessing a new one. The database schema is injected in compact form, and prompts live in their own module so the SQL prompt could be tuned without touching the flow around it.',
    destaques: [
      'One LCEL master chain with history, router and conditional branch — the cheap path stays cheap and the SQL chain only sees questions about data',
      'The last executed SQL is kept per session, so a follow-up modifies a query that worked rather than regenerating from scratch',
      'History trimming inside the chain, because an unbounded conversation eventually costs more in context than the answer is worth',
      'Prompts as a separate module of their own, tuned independently of the chain that consumes them',
      'Two surfaces over one engine: a chatbot and a dashboard',
    ],
    techs: ['FastAPI', 'LangChain', 'LCEL', 'PostgreSQL', 'LLaMA 3', 'Groq', 'React', 'Docker'],
    links: { github: 'https://github.com/Marocosz/DataChat-BI' },
  },
  {
    id: 14,
    title: 'Marocos Bot 2.0',
    category: 'Automation & Community',
    contexto: 'pessoal',
    description:
      'A Discord bot that runs a competitive League of Legends community: it verifies who you say you are against the Riot API, rates every player on its own scale, balances the custom matches, manages voice channels and permissions through the match lifecycle, and keeps the ranking of everything that happened.',
    problema:
      'A custom match falls apart before it starts. Someone overstates their rank, the teams come out lopsided, and whoever is organising spends the lobby dragging people between voice channels instead of playing. The interesting part is the rating: the visible rank is a bad input for balancing, because a player with 30 games at 70% wins is not the same strength as one with 400 games at 50% sitting in the same division.',
    solucao:
      'Identity is verified against the Riot API rather than trusted. On top of the visible rank the bot computes its own adjusted rating: tier and division and LP form the base, flex queue is weighted below solo queue, and then a winrate bonus is applied scaled by a K-factor that decays with games played — explosive under 50 games, nearly inert past 200. So a smurf climbing gets rated up and a long-term player at 50% is rated at face value. Balancing then distributes the sorted list in a snake draft, which keeps the top player away from the second and third, and voice channels and permissions are managed by the bot as the match moves through its lifecycle.',
    destaques: [
      'An adjusted rating model rather than the visible rank: base from tier/division/LP, a queue weight, and a winrate bonus whose K-factor decays across five bands of games played',
      'The uncertainty logic is the point — few games with a high winrate moves the rating a lot, many games moves it barely, which is what makes a smurf and a veteran comparable',
      'Snake draft over the sorted list for the split, so the strongest player is on the opposite side from the second and third',
      'Real-time rank validation against the Riot API, which is what makes the ranking mean anything at all',
      '10 command modules, with the lobby and the ranking as the two heaviest, over a data layer of its own',
    ],
    techs: ['Python', 'discord.py', 'Riot API', 'PostgreSQL', 'AsyncIO', 'Docker'],
    links: { github: 'https://github.com/Marocosz/Marocos-BOT-2' },
  },
  {
    id: 10,
    title: 'faculdAIde',
    category: 'AI Tooling',
    contexto: 'pessoal',
    description:
      'A personal knowledge graph that fills itself. It ships as a skill for my coding agent: whatever I actually worked on in a session gets captured as study concepts, researched, deduplicated against what is already there, and written back as connected nodes.',
    problema:
      'Everything I learn while solving a real problem evaporates, because the moment the problem is solved there is no reason left to write it down. And any note system that needs discipline to feed will not be fed — so the capture has to happen inside the work. Which creates the opposite failure: automatic capture produces forty nodes for the same idea, and a graph with forty duplicates is worse than no graph.',
    solucao:
      'One concept is one JSON file validated against a schema, and the graph is derived rather than stored — indexes, aliases, study order and the graph itself are all generated from that source of truth and gitignored, so there is exactly one place a fact can be wrong. Before anything is written, a prefilter deduplicates against the existing nodes, which is the answer to the duplication problem above. Integrity is a failing check, not a warning: a link to a node that does not exist fails validation, and so does a cycle in the study order.',
    destaques: [
      '38 concept nodes, one file each, with schema validation and graph integrity as checks that fail rather than warn',
      'The deduplication, the topological ordering and the transcript lookup each have their own tests — they are the three places where a silent failure would corrupt the graph instead of breaking it',
      'Everything derived is gitignored: the graph, the indexes and the study order are outputs, so they cannot drift from the source',
      'The agent skill is mirrored in-repo as a non-activatable copy and synced out, so the logic that writes the graph is versioned alongside what it wrote',
    ],
    techs: ['Node.js', 'TypeScript', 'ajv', 'JSON Schema', 'Vite', 'Claude Code Skills'],
    links: {},
  },
]

const projectsDataPt = [
  {
    id: 3,
    title: 'Diário Oficial Eletrônico',
    category: 'SaaS Multi-tenant',
    contexto: 'freelance',
    description:
      'Plataforma whitelabel multi-tenant de Diário Oficial municipal: o servidor diagrama a edição num editor de blocos, o sistema renderiza, assina com o certificado digital da própria prefeitura e publica, e qualquer cidadão pesquisa o texto integral sem login. Uma base de código atendendo vários municípios, cada um isolado por coluna.',
    problema:
      'Diário Oficial é instrumento jurídico, então listagem de PDF escaneado é arquivo morto, não sistema de publicação. Três coisas têm de ser verdade ao mesmo tempo: o arquivo carrega validade legal, o acervo é pesquisável como texto décadas para trás, e a diagramação que o servidor vê é byte a byte a que vai ser assinada. A terceira é onde as soluções ingênuas morrem — uma pré-visualização em HTML que pagina diferente do PDF final faz do editor um mentiroso.',
    solucao:
      'O PDF é renderizado por Chromium headless, então o navegador que diagrama a pré-visualização é o navegador que produz o arquivo. Para buscar as próprias páginas autenticadas, o renderizador recebe um token de vida curta emitido na hora — e porque esse token acabaria dentro de um stack trace, existe um limpador com regex restrito ao charset que o remove de qualquer texto de erro antes do log. A assinatura é ICP-Brasil PAdES B-B via pyHanko, com o certificado guardado por prefeitura e o assinador resolvido por fábrica, então a suíte roda contra um assinador falso e a produção não fica sabendo. A busca textual é tsvector com índice GIN do próprio Postgres, em vez de um segundo banco.',
    destaques: [
      'Guarda de SSRF no conteúdo da seção: o Chromium do servidor busca toda imagem do documento, então uma URL apontando para endereço interno viraria um GET de dentro da rede — validado no salvamento, com lista de hosts permitidos',
      'Assinatura ICP-Brasil PAdES B-B via pyHanko, certificado por prefeitura, com expiração e certificado inválido como erro tipado em vez de exceção solta',
      'O editor de posicionamento de calhau usa páginas reais do PDF rasterizadas como fundo, e não o render ao vivo do navegador — porque os dois paginavam diferente — com hash de conteúdo para só re-renderizar quando a edição de fato mudou',
      'O token que o renderizador usa para buscar as próprias páginas é limpo de qualquer texto de erro antes do log, por regex restrito ao charset — credencial de vida curta ainda é credencial, e stack trace vai para arquivo',
      'Renderizador e assinador são ambos Protocol com implementação falsa, e é isso que permite a suíte rodar sem subir Chromium nem ter um certificado de verdade',
      'Importador de acervo legado, porque um diário novo começa com décadas de diários antigos',
    ],
    techs: ['FastAPI', 'asyncpg', 'PostgreSQL', 'Alembic', 'pyHanko', 'Playwright', 'pypdf', 'S3/MinIO', 'React', 'TypeScript', 'BlockNote'],
    links: {},
  },
  {
    id: 2,
    title: 'Portal Acadêmico',
    category: 'Engenharia Fullstack',
    contexto: 'freelance',
    description:
      'Portal de solicitações para uma unidade de universidade federal. Alunos, e também pessoas sem vínculo acadêmico nenhum, abrem pedidos por formulários que a própria unidade monta; o professor decide, a secretaria decide por último, e tudo que aconteceu é recuperável. Freelance, do começo ao fim — requisitos, backend, frontend e infraestrutura.',
    problema:
      'A unidade não quer um conjunto fixo de tipos de solicitação — quer criar tipos novos sem desenvolvedor, o que transforma o sistema num construtor de formulário com lógica condicional. E a cadeia de aprovação tem uma armadilha que máquina de estados ingênua erra: quando o professor aprova, o aluno NÃO pode ver "aprovado", porque só a secretaria concede isso. Mostrar antes cria uma expectativa que a instituição depois tem de quebrar.',
    solucao:
      'O status visível é derivado, nunca armazenado: estado interno não vaza, e a própria tabela de transições declara qual papel pode executar cada movimento — a permissão mora ao lado da regra em vez de numa tela. Os formulários são um construtor com oito tipos de campo, validadores de formato por campo (inclusive a aritmética real de dígito verificador de CPF) e condições de visibilidade avaliadas contra as respostas já dadas. A autenticação é sessão no servidor em Redis, e não JWT, porque token que não se revoga é a troca errada para registro acadêmico — e o chat por processo roda em SSE sobre pub/sub do Redis, com uma política em funções puras decidindo quem vê cada mensagem, para nota de staff continuar interna.',
    destaques: [
      'A suíte aponta para um banco próprio, truncado antes de cada teste, com um Redis próprio limpo junto — então uma rodada de teste não consegue deixar resíduo no ambiente em que alguém está desenvolvendo',
      'Fronteira de módulos verificada por import-linter como gate de CI: um módulo importa o service do outro, nunca os models nem o repository, então cruzar fronteira significa passar primitivo',
      'O ciclo de vida do anexo espelha o do processo — o arquivo vive em temp/ enquanto pendente e só é movido para definitivo/ na aprovação final',
      'Protocolo gerado de um alfabeto de 36 caracteres com secrets, e não por sequência: o solicitante externo consegue acompanhar o caso pelo protocolo justamente porque o próximo não é adivinhável',
      'Autenticação em dois fatores com TOTP, rate limiting, CSRF por double-submit e cabeçalhos de segurança, cada um com teste próprio',
      'Auditoria transacional: o log entra na mesma transação da mudança que ele descreve, ou nenhum dos dois acontece',
    ],
    techs: ['FastAPI', 'SQLAlchemy 2', 'PostgreSQL', 'Alembic', 'Redis', 'Celery', 'structlog', 'React', 'TypeScript', 'i18next'],
    links: {},
  },
  {
    id: 1,
    title: 'Motor de Cobrança',
    category: 'Fullstack & Automação',
    contexto: 'produto',
    description:
      'O produto em que eu trabalho todo dia na Finza. É o motor que decide o que o time de cobrança faz em seguida: ele agenda o trabalho, organiza e filtra a carteira, e gera ações a partir do que os sistemas integrados reportam — mais um conjunto de serviços feitos especificamente para o jeito daquele time operar. Os agentes conversacionais são um dos canais que ele aciona, não o objetivo dele.',
    problema:
      'Cobrança não é problema de conversa, é problema de priorização num volume que time nenhum trabalha na mão. O dado chega de vários sistemas integrados, cada um com a própria ideia do que é um devedor, e a decisão de quem contatar hoje, por qual canal e com qual mensagem tem de sair do outro lado como ação concreta — auditável, reversível e explicável para quem perguntar por que aquela pessoa foi contatada.',
    solucao:
      'O motor fica entre as integrações e o time: consolida e filtra o que entra, agenda o trabalho por janela de tempo e por regra, e emite ação em vez de relatório — então o time recebe algo para fazer, e não um painel para interpretar. Em volta disso existem serviços específicos para o fluxo daquele time. Os agentes conversacionais rodam por cima, como um dos canais de execução, e porque um bot que responde mal queima um cliente que paga, toda conversa é instrumentada: a camada de métricas transforma transcrição em número que o negócio consegue discutir — é o que tira o "o bot parece estar ok" e põe uma decisão no lugar.',
    destaques: [
      'Agendamento e filtragem como o núcleo: a saída é ação gerada com o motivo anexado, e não uma lista para alguém ler',
      'Consolidação entre vários sistemas integrados, cada um com um formato próprio para a mesma entidade',
      'Métrificação dos próprios agentes conversacionais — a conversa vira um número sobre o qual o negócio consegue agir',
      'Supabase como banco e backend, frontend React, e ciclo de CI/CD definido sobre os dois, então mudar um prompt sobe revisado e reversível como qualquer mudança de código',
      'Também atuo como analista de requisitos nele: as reuniões onde uma dor de negócio vira escopo técnico são minhas',
    ],
    techs: ['React', 'Supabase', 'PostgreSQL', 'Edge Functions', 'n8n', 'API do WhatsApp', 'Agentes de IA', 'CI/CD'],
    links: {},
  },
  {
    id: 6,
    title: 'Hub de Agentes de IA',
    category: 'Plataforma de IA',
    contexto: 'empresa',
    description:
      'Plataforma interna de IA construída na Supporte Logística: quatro backends de agente especializados atrás de um gateway único, cada um atendendo uma área diferente. Text-to-SQL sobre a base operacional, análise semântica de chamados, redação assistida de documentos de qualidade, e documentação de robôs legados.',
    problema:
      'Agente autônomo conversando com agente é a resposta errada dentro de uma empresa. Swarm gera loop infinito, custo imprevisível e decisão que ninguém audita — e text-to-SQL erra sozinho em torno de uma vez a cada cinco. Pior: consulta gerada é código arbitrário apontado para um banco de produção, e a falha interessante não é erro de sintaxe, é um DROP que parseia perfeitamente.',
    solucao:
      'O controle de fluxo mora em Python determinístico — uma máquina de estados finita — e o LLM só faz tarefa cognitiva isolada. Um roteador barato classifica a intenção em cinco categorias antes de tocar modelo caro. O SQL gerado passa então por uma guarda que o transforma em árvore sintática com sqlglot, ciente do dialeto, e caminha pela árvore recusando tipos de nó proibidos — então DELETE, DROP, UPDATE e companhia são pegos estruturalmente, e não por comparação de string. Quando o banco recusa mesmo assim, um agente corretor recebe o SQL quebrado junto com o erro real do Postgres e reescreve, então o usuário nunca vê a falha. A análise de chamados é outra disciplina inteira: chamado vira embedding, o UMAP reduz a dimensionalidade para densificar, o HDBSCAN encontra os grupos, e só então um LLM explica o que cada grupo tem em comum.',
    destaques: [
      'Quatro backends de agente e um frontend React atrás de um gateway nginx, orquestrados por Docker Compose',
      'Guarda de SQL por árvore sintática, e não por blacklist: o sqlglot parseia e o caminhamento recusa tipos de nó proibidos — que é a diferença entre bloquear DROP e bloquear toda forma de escrever DROP',
      'Text-to-SQL que se conserta: o agente corretor recebe a consulta quebrada e o erro do banco e reescreve, então os ~20% de falha natural deixam de ser problema do usuário',
      'Segurança por linha injetada no prompt: o papel do usuário e as restrições de SQL dele viajam junto com a pergunta',
      'Clusterização com UMAP antes do HDBSCAN, com auto-tuning por volume de dados e refinamento recursivo de macro para micro, devolvendo hierarquia e confiança por ponto — outlier continua outlier em vez de ser forçado num grupo',
      'Redação de documento como cinco agentes sequenciais (planejador, redator, revisor, crítico, finalizador) com portas de aprovação humana entre eles por WebSocket, e um mock de cada um para o fluxo ser testável sem gastar token',
    ],
    techs: ['FastAPI', 'LangChain', 'sqlglot', 'Qdrant', 'HDBSCAN', 'UMAP', 'OpenAI', 'PostgreSQL', 'WebSocket', 'React', 'nginx', 'Docker'],
    /** Ver a nota no bloco em inglês: sem link de propósito, o repositório vai ser
     *  fechado por ser código da empresa. */
    links: {},
  },
  {
    id: 4,
    title: 'Bússola V2',
    category: 'Fullstack & IA',
    contexto: 'pessoal',
    description:
      'Meu sistema operacional pessoal: finanças, registros, treino e planejamento numa aplicação só, com dezoito agentes de IA em cinco domínios que leem o dado de verdade e propõem ação em vez de conversar sobre ela. É também o projeto onde eu testo ideia de arquitetura antes de ela chegar em cliente.',
    problema:
      'Assistente que responde em texto livre é inútil dentro de uma aplicação, porque a interface não sabe desenhar um parágrafo como botão. E saída de LLM não é determinística: o mesmo prompt devolve uma lista pura numa vez e um dicionário embrulhando essa lista na seguinte. Então a parte difícil não é fazer dezoito agentes darem bom conselho — é fazê-los responder numa forma que o frontend consiga desenhar, toda vez, sem o frontend aprender a interpretar.',
    solucao:
      'Todo agente devolve o mesmo contrato universal: um schema Pydantic com sugestão tipada, severidade e payload de ação. Entre o modelo e o resto do sistema existe uma camada de saneamento que normaliza a variação estrutural numa lista plana, injeta o metadado que o modelo esqueceu, e valida de forma estrita — então o que estiver malformado morre ali em vez de chegar na interface. Os campos de enum passam por fuzzy matching, porque um modelo que responde "alto" onde o enum diz "ALTO" está certo em espírito e reprovaria na validação. O LLM vem de uma fábrica com retry e parsing seguro de JSON, o que faz do provider uma variável de ambiente em vez de uma reescrita.',
    destaques: [
      '18 agentes em cinco domínios, cada um com orquestrador próprio sobre uma base compartilhada',
      'Contrato universal de resposta mais camada de saneamento: o frontend desenha cards e botões a partir do contrato e nunca aprende qual agente os produziu',
      'Fuzzy matching de string solta de LLM para enum rígido, então resposta válida na caixa errada é aceita em vez de recusada',
      'Três providers de LLM intercambiáveis atrás de uma fábrica, com retry e parsing seguro, e os imports protegidos para driver ausente não impedir a aplicação de subir',
      'Cache em Redis nas respostas de IA, porque a mesma pergunta sobre o mesmo dado inalterado não merece uma segunda chamada de modelo',
      'Manipulação de dinheiro tem teste próprio, porque é o único lugar da aplicação onde erro de arredondamento é bug e não detalhe',
      'Um bot de Discord companheiro, com autenticação e fluxo de vínculo de conta próprios',
    ],
    techs: ['React 19', 'FastAPI', 'LangGraph', 'LangChain', 'Pydantic', 'PostgreSQL', 'SQLAlchemy', 'Redis', 'discord.py', 'Docker'],
    links: { github: 'https://github.com/Marocosz/Bussola-v2' },
  },
  {
    id: 5,
    title: 'Auditoria Algorítmica do Spotify',
    category: 'Ciência de Dados & Pesquisa',
    contexto: 'academico',
    description:
      'Meu TCC em Gestão da Informação: uma auditoria de caixa-preta do recomendador do Spotify. Quatro personas sintéticas foram construídas dentro de contas reais, deixadas assentar, e então o que a plataforma recomendou de volta para elas foi medido contra o que elas receberam de estímulo. A pergunta era se a curadoria automatizada amplia o gosto musical ou homogeneíza.',
    problema:
      'Não dá para ler o código de um recomendador, então o comportamento tem de ser inferido de fora — e qualquer diferença encontrada precisa sobreviver à objeção de que foi acaso. E no meio da pesquisa o Spotify removeu progressivamente campos da Web API, o que quebrou o método planejado para medir o que as recomendações de fato continham.',
    solucao:
      'Auditoria por agentes-sonda: cada persona é construída programaticamente numa conta real — playlists, curtidas, seguidos — com arquétipo contrastante e regra de seleção documentada, para o input ser variável e não gosto. Os campos removidos da API foram substituídos por enriquecimento no Last.fm e no MusicBrainz, e a remoção em si foi tratada como achado sobre a opacidade da plataforma, não como acidente. Diversidade e concentração saem de entropia de Shannon, evenness de Pielou, Gini, HHI e Jaccard, e nada disso é reportado cru: toda comparação carrega intervalo de confiança por bootstrap, teste de Mann-Whitney, rarefação para controlar tamanho de amostra desigual, e teste de permutação para estabelecer o que o acaso sozinho teria produzido.',
    destaques: [
      'Os repertórios de artistas ficaram integralmente disjuntos entre as personas — Jaccard = 0, e o teste de permutação põe isso como mais segregado que o acaso, p < 0,001',
      'A diversidade converge por riqueza de catálogo, não por homogeneização de entropia: a plataforma amplia a prateleira sem achatar o gosto — o que é uma resposta diferente das duas que a literatura espera',
      'Viés de popularidade (+131% de ouvintes por artista) e viés de hit dentro da cauda longa (+405% de ouvintes por faixa), os dois medidos e não afirmados',
      'Rarefação no pipeline porque as personas terminaram com tamanhos de amostra diferentes, e métrica de diversidade é sensível a isso — comparar cru teria fabricado um resultado',
      '28 scripts de pipeline em quatro fases, da construção das contas à geração das figuras, com o reset das contas como etapa própria para uma rodada começar limpa',
    ],
    techs: ['Python', 'spotipy', 'pandas', 'NumPy', 'SciPy', 'Matplotlib', 'Seaborn', 'API do Last.fm', 'MusicBrainz'],
    links: { github: 'https://github.com/Marocosz/TCC' },
  },
  {
    id: 9,
    title: 'Portal de Controle de Acesso',
    category: 'Integração de Legado & IA',
    contexto: 'freelance',
    description:
      'Portal construído sobre um sistema de catraca e ponto de terceiro. Ele lê o banco do fornecedor, acrescenta o fluxo de visitante que o produto original nunca teve, monitora os eventos de acesso ao vivo, e dispara relatórios de segurança escritos por um LLM sobre número real. Freelance, backend e frontend.',
    problema:
      'O dado valioso estava trancado dentro de um sistema comercial fechado, sem documentação de schema, e o cliente não podia trocar de sistema. Então tudo que era útil precisava ser inferido de fora — e inferido com segurança de um jeito específico: é um banco cuja integridade outro fornecedor é responsável, e escrever direto nas tabelas dele seria sabotagem disfarçada de integração.',
    solucao:
      'Mapeei o schema tirando snapshots repetidos e comparando um com o outro, o que produziu um changelog de quais tabelas de fato se movem quando uma pessoa passa pela catraca. Depois a integração ficou deliberadamente assimétrica: a leitura vai direto nas tabelas e views por performance, mas toda criação, alteração e exclusão é escrita na fila de integração do próprio fornecedor com status pendente, para o gerenciador de tarefas dele aplicar a mudança pelas regras dele. O portal nunca toca as tabelas principais para escrever. Em cima disso, um agendador roda os relatórios: os KPIs são calculados do log de catraca, um LLM escreve a análise numa estrutura fixa de cinco seções, e o PDF é gerado e arquivado.',
    destaques: [
      'Integração assimétrica com o legado: leitura direta por velocidade, mas escrita na fila de integração do fornecedor com status pendente, para o gerenciador de tarefas dele aplicar — o sistema fechado continua consistente',
      'Schema legado mapeado por comparação de snapshots, e a ferramenta com os changelogs dela está commitada no repositório',
      'Cinco jobs agendados: geração de relatório diário, semanal e mensal, varredura de retenção de 60 dias, e uma passada horária que expira solicitação de visita vencida e avisa por e-mail quem foi afetado',
      'Relatório de LLM restringido por template de cinco seções com proibições explícitas de formatação, porque o modo de falha de um modelo que escreve relatório é preâmbulo e metadado inventado',
      'Monitoramento de catraca ao vivo por WebSocket, com KPI diário e um log de auditoria forense separado, restrito ao papel de administrador',
      'Response model do Pydantic como fronteira de segurança: o schema interno de usuário carrega o hash de senha e o público não, então um retorno descuidado não consegue vazá-lo',
    ],
    techs: ['FastAPI', 'SQL Server', 'pyodbc', 'LangChain', 'Gemini', 'APScheduler', 'ReportLab', 'Nuxt 4', 'Vue 3', 'Pinia'],
    links: {},
  },
  {
    id: 7,
    title: 'Fraud Sentinel',
    category: 'Machine Learning',
    contexto: 'academico',
    description:
      'Pipeline completo de machine learning para detectar fraude em abertura de conta bancária, sobre a base Bank Account Fraud publicada no NeurIPS 2022. O objetivo é pegar o máximo de fraude mantendo o falso alarme baixo o suficiente para um time humano ainda conseguir trabalhar a fila.',
    problema:
      'Fraude é cerca de 1% da base, então um modelo que responde "legítimo" para tudo acerta 99% e não serve para nada — acurácia é a métrica errada antes de qualquer outra coisa acontecer. Mas o problema mais sutil é o limiar de decisão. É tentador escolher o corte que maximiza F1 no dado que você tem, e isso é vazamento de dados de avental branco: um limiar ajustado no conjunto de treino é otimista sobre si mesmo, e o modelo parece melhor no relatório do que jamais será em produção.',
    solucao:
      'CRISP-DM de ponta a ponta: análise exploratória com teste de significância e mutual information para seleção de variável, downcasting de memória para a base caber, e então oito algoritmos treinados e comparados sobre uma classe base comum — regressão logística, árvore de decisão, random forest, XGBoost, LightGBM, um perceptron multicamadas, isolation forest pelo ângulo de anomalia, e um ensemble por stacking em cima. O limiar é calculado num split de validação que o modelo não viu no treino, que é o conserto do vazamento acima, e existe um módulo separado que move o corte para atingir uma precisão-alvo — assim a restrição de negócio entra na matemática em vez de ser discutida depois.',
    destaques: [
      'O módulo de limiar existe por causa de um bug real: ele estava sendo calculado com predict_proba no próprio conjunto de treino, o que deixava o F1 estimado otimista. Hoje vem de um split de validação retido',
      'Oito treinadores sobre uma classe base comum, incluindo isolation forest e um ensemble por stacking',
      'Ajuste por precisão-alvo: você declara a taxa de falso alarme que o time aguenta e ele acha o corte, em vez de reportar o limiar que lisonjeia o modelo',
      'Simulação de produção sobre dado retido, porque métrica em split de teste não é modelo em operação',
      'Log de experimento em toda rodada, então comparar dois modelos é um registro e não uma lembrança',
    ],
    techs: ['Python', 'scikit-learn', 'XGBoost', 'LightGBM', 'CatBoost', 'pandas', 'NumPy', 'Matplotlib', 'CRISP-DM', 'Docker'],
    links: { github: 'https://github.com/Marocosz/fraud-sentinel' },
  },
  {
    id: 8,
    title: 'Portal do Cidadão',
    category: 'SaaS Multi-tenant',
    contexto: 'freelance',
    description:
      'Plataforma whitelabel multi-tenant para municípios receberem solicitações de assistência social e rodarem um balcão de empregos pela internet. O cidadão usa sem criar conta, identificado por documento; o funcionário trabalha num painel administrativo restrito à própria prefeitura.',
    problema:
      'A mesma base de código atende vários municípios, e uma única consulta que esquece o filtro de tenant põe o registro de assistência social de uma cidade na tela de outra — com dado que é sensível por lei. Além disso nem todo município compra todo módulo, então o produto tem de vender em pedaços sem gerar um build diferente por cliente.',
    solucao:
      'Toda entidade carrega a coluna de tenant e toda consulta filtra por ela. O frontend resolve o tenant pelo slug da URL, um middleware prende ele na requisição e recusa o que não conseguir resolver, e uma lista de slugs reservados impede um tenant de reivindicar rota administrativa. Os módulos são feature flags por tenant, ligadas pelo operador da plataforma — e existe um teste cujo trabalho inteiro é provar que desligar uma feature fecha os endpoints dela, porque flag que só esconde menu não é flag, é enfeite em cima de uma API aberta.',
    destaques: [
      'Um teste dedicado provando que feature desligada está fechada na API e não apenas escondida na interface — a diferença entre uma feature flag e um enfeite',
      'Isolamento por coluna mais middleware, com slugs reservados para um tenant nunca conseguir reivindicar rota administrativa',
      'Quatro papéis, incluindo um operador que atravessa tenants e é o único capaz de criar município e o único que vê auditoria de todos eles',
      'Identidade visual dinâmica por prefeitura — cor e logo — a partir de um build só',
      'Os testes estão concentrados exatamente onde bug de multi-tenant é caro: resolução de tenant, fechamento de feature, o override que atravessa tenants e a trilha de auditoria',
    ],
    techs: ['FastAPI', 'SQLAlchemy', 'PostgreSQL', 'Alembic', 'React', 'TypeScript', 'Zustand', 'Docker'],
    links: {},
  },
  {
    id: 13,
    title: 'DataChat BI',
    category: 'IA & Analytics',
    contexto: 'empresa',
    description:
      'Business intelligence conversacional para logística, construído na Supporte Logística: você pergunta em linguagem natural, o sistema escreve o SQL, executa e responde com número e gráfico. Um dashboard fica ao lado do chat, sobre o mesmo motor.',
    problema:
      'A maior parte das perguntas de um gestor está a uma consulta de ser respondida, e a consulta nunca é escrita, porque escrever exige conhecer o schema. Mas um sistema que gera SQL para toda mensagem que chega gasta uma chamada de modelo com "bom dia" — e, pior, tenta responder "e no mês passado?" sem saber do que aquilo é continuação.',
    solucao:
      'A cadeia é montada em LCEL como uma master chain embrulhada em histórico de mensagem, então a memória é carregada no começo do turno e salva no fim sem o fluxo gerenciar isso. Um roteador classifica a intenção primeiro e um desvio manda a mensagem por um de dois caminhos, então conversa fiada nunca chega na cadeia de SQL. O acompanhamento funciona porque um reescritor resolve a pergunta contra o histórico antes da geração, e a sessão guarda o último SQL executado — então "e no mês passado?" é respondido modificando uma consulta que já funcionou em vez de chutar uma nova. O schema do banco é injetado em forma compacta, e os prompts vivem em módulo próprio, o que permitiu afinar o prompt de SQL sem tocar no fluxo em volta.',
    destaques: [
      'Uma master chain em LCEL com histórico, roteador e desvio condicional — o caminho barato continua barato e a cadeia de SQL só vê pergunta sobre dado',
      'O último SQL executado fica guardado por sessão, então o acompanhamento modifica uma consulta que funcionou em vez de regenerar do zero',
      'Poda de histórico dentro da cadeia, porque conversa sem limite acaba custando mais em contexto do que a resposta vale',
      'Prompts como módulo separado, afinados independentemente da cadeia que os consome',
      'Duas superfícies sobre um motor: um chatbot e um dashboard',
    ],
    techs: ['FastAPI', 'LangChain', 'LCEL', 'PostgreSQL', 'LLaMA 3', 'Groq', 'React', 'Docker'],
    links: { github: 'https://github.com/Marocosz/DataChat-BI' },
  },
  {
    id: 14,
    title: 'Marocos Bot 2.0',
    category: 'Automação & Comunidade',
    contexto: 'pessoal',
    description:
      'Um bot de Discord que administra uma comunidade competitiva de League of Legends: verifica quem você diz que é contra a API da Riot, pontua cada jogador numa escala própria, balanceia as partidas personalizadas, gerencia canais de voz e permissões ao longo da partida, e mantém o ranking de tudo que aconteceu.',
    problema:
      'Partida personalizada desanda antes de começar. Alguém superestima o elo, os times saem desequilibrados, e quem organiza passa o lobby arrastando gente entre canais de voz em vez de jogar. A parte interessante é a pontuação: o elo visível é entrada ruim para balanceamento, porque um jogador com 30 partidas e 70% de vitória não tem a mesma força de um com 400 partidas e 50% na mesma divisão.',
    solucao:
      'A identidade é verificada contra a API da Riot em vez de acreditada. Sobre o elo visível o bot calcula uma pontuação ajustada própria: tier, divisão e LP formam a base, a fila flexível pesa menos que a solo, e então um bônus de winrate é aplicado escalado por um K-factor que decai com o número de partidas — explosivo abaixo de 50 jogos, quase inerte depois de 200. Assim um smurf em ascensão sobe na conta e um jogador de longo prazo em 50% é avaliado pelo valor de face. O balanceamento então distribui a lista ordenada em snake draft, o que mantém o melhor jogador longe do segundo e do terceiro, e os canais de voz e permissões são gerenciados pelo bot conforme a partida percorre o ciclo de vida dela.',
    destaques: [
      'Um modelo de pontuação ajustada em vez do elo visível: base de tier/divisão/LP, peso de fila, e bônus de winrate com K-factor decaindo em cinco faixas de número de partidas',
      'A lógica de incerteza é o ponto — poucas partidas com winrate alto move muito a pontuação, muitas partidas move quase nada, e é isso que torna smurf e veterano comparáveis',
      'Snake draft sobre a lista ordenada para dividir os times, então o mais forte fica do lado oposto ao segundo e ao terceiro',
      'Validação de elo em tempo real contra a API da Riot, que é o que faz o ranking significar alguma coisa',
      '10 módulos de comando, com o lobby e o ranking como os dois mais pesados, sobre uma camada de dados própria',
    ],
    techs: ['Python', 'discord.py', 'Riot API', 'PostgreSQL', 'AsyncIO', 'Docker'],
    links: { github: 'https://github.com/Marocosz/Marocos-BOT-2' },
  },
  {
    id: 10,
    title: 'faculdAIde',
    category: 'Ferramentas de IA',
    contexto: 'pessoal',
    description:
      'Um grafo de conhecimento pessoal que se preenche sozinho. Ele é entregue como uma skill do meu agente de código: o que eu de fato fiz numa sessão é capturado como conceito de estudo, pesquisado, deduplicado contra o que já existe, e gravado de volta como nó conectado.',
    problema:
      'Tudo que eu aprendo resolvendo um problema real evapora, porque no instante em que o problema é resolvido não sobra motivo para anotar. E qualquer sistema de nota que exige disciplina para ser alimentado não vai ser alimentado — então a captura tem de acontecer dentro do trabalho. O que cria a falha oposta: captura automática produz quarenta nós para a mesma ideia, e um grafo com quarenta duplicatas é pior que grafo nenhum.',
    solucao:
      'Um conceito é um arquivo JSON validado contra schema, e o grafo é derivado em vez de guardado — índices, aliases, ordem de estudo e o próprio grafo saem todos dessa fonte da verdade e ficam no gitignore, então existe exatamente um lugar onde um fato pode estar errado. Antes de qualquer coisa ser escrita, um prefiltro deduplica contra os nós existentes, que é a resposta ao problema de duplicação acima. Integridade é checagem que reprova, não aviso: link para nó que não existe falha na validação, e ciclo na ordem de estudo também.',
    destaques: [
      '38 nós de conceito, um arquivo cada, com validação de schema e integridade do grafo como checagens que reprovam em vez de avisar',
      'A deduplicação, a ordenação topológica e a localização de transcrição têm teste cada uma — são os três lugares onde uma falha silenciosa corromperia o grafo em vez de quebrá-lo',
      'Tudo que é derivado está no gitignore: o grafo, os índices e a ordem de estudo são saída, então não conseguem divergir da fonte',
      'A skill do agente é espelhada no repositório como cópia não-ativável e sincronizada de lá, então a lógica que escreve o grafo é versionada junto com o que ela escreveu',
    ],
    techs: ['Node.js', 'TypeScript', 'ajv', 'JSON Schema', 'Vite', 'Skills do Claude Code'],
    links: {},
  },
]

/**
 * `sectionLabel`, `title`, `subtitle` e `subtitleDesktopExtra` SAÍRAM DAQUI, e o
 * precedente é o `hero` de `content/profile.js`: nenhum componente lia nada
 * disso. Eram herança da página clássica de rolagem — a janela de Projetos tem
 * chrome de explorador, então quem nomeia é a barra de título e o breadcrumb, e
 * o miolo é a lista.
 *
 * A remoção não é limpeza cosmética. O `subtitle` deste arquivo diria "N
 * projetos", e número escrito à mão em campo que ninguém renderiza é a pior
 * versão do defeito que este projeto já viu envelhecer cinco vezes: ele não tem
 * como ser percebido, porque não aparece em pixel nenhum para alguém reler.
 */
const projectsPageContentEn = {
  labels: {
    idea: 'SUMMARY',
    problema: 'THE HARD PART',
    solucao: 'HOW IT WORKS',
    destaques: 'IN THE CODE',
    techs: 'TECHS',
    github: 'View on GitHub',
    /**
     * O SELO, e não um botão desabilitado. Oito dos doze projetos são de cliente
     * ou de empresa: um botão que não leva a lugar nenhum lê como bug, e a
     * ausência do repositório é informação — diz que o trabalho é de produção e
     * não de vitrine.
     */
    fechado: 'Closed source',
    fechadoHint: 'Client or employer code — described here, not published',
  },
  contextos: {
    produto: 'Product in production',
    empresa: 'Built at work',
    freelance: 'Freelance',
    academico: 'Academic',
    pessoal: 'Personal',
  },
  items: projectsDataEn,
}

/** Ver a nota no bloco em inglês: os quatro campos de cabeçalho saíram porque
 *  componente nenhum os lia. */
const projectsPageContentPt = {
  labels: {
    idea: 'RESUMO',
    problema: 'O PROBLEMA',
    solucao: 'COMO FUNCIONA',
    destaques: 'NO CÓDIGO',
    techs: 'TECS',
    github: 'Ver no GitHub',
    /** Ver a nota no bloco em inglês: é selo, não botão desabilitado. */
    fechado: 'Código fechado',
    fechadoHint: 'Código de cliente ou de empresa — descrito aqui, não publicado',
  },
  contextos: {
    produto: 'Produto em produção',
    empresa: 'Feito no trabalho',
    freelance: 'Freelance',
    academico: 'Acadêmico',
    pessoal: 'Pessoal',
  },
  items: projectsDataPt,
}

/**
 * A FICHA DE ARQUIVO DE CADA PROJETO — o que a lista em modo Detalhes mostra
 * nas colunas de data e tamanho.
 * ==================================================
 * FICA NUMA TABELA SÓ, chaveada pelo id, e não dentro de cada array de idioma.
 * Data e tamanho não têm tradução, e duplicá-los nas duas listas seria criar
 * mais duas chances de as versões PT e EN discordarem.
 *
 * OS IDS NÃO SÃO SEQUENCIAIS, e é de propósito: eles são a identidade estável de
 * cada projeto, e a ORDEM é a do array. Renumerar ao reordenar significaria que o
 * `bytes` e a `data` de todos os projetos trocariam de dono em silêncio na
 * primeira vez que alguém movesse uma linha. Os buracos (11 e 12) são o Cine
 * Sessão e a Gestão Legislativa, que saíram da lista por decisão do dono do
 * projeto — e o buraco documenta a remoção melhor do que a renumeração faria.
 *
 * `bytes` NÃO É O PESO DO REPOSITÓRIO. É uma estimativa de COMPLEXIDADE, vestida
 * de tamanho de arquivo porque a janela é um explorador e a coluna pede um número
 * em KB. Como o array agora está ORDENADO por complexidade, esta coluna é
 * monotonicamente decrescente na tela — a lista se explica sozinha de cima para
 * baixo. A ordem é sustentada por sinal contado no código, não por impressão:
 *
 *   Diário Oficial       368 casos de teste em 70 arquivos, 18 domínios de
 *                        endpoint, assinatura ICP-Brasil, pipeline de PDF em
 *                        Chromium e guarda de SSRF
 *   Portal Acadêmico     170 casos de teste, 10 módulos com fronteira verificada,
 *                        construtor de formulário com lógica condicional, 2FA
 *   Motor de Cobrança    produto em produção: agendamento, filtragem, geração de
 *                        ação sobre integrações, agentes métricados e CI/CD
 *   Hub de Agentes       quatro backends, orquestrador FSM, guarda de SQL por AST,
 *                        UMAP+HDBSCAN recursivo
 *   Bússola V2           18 agentes em 5 domínios, contrato universal com camada
 *                        de saneamento, 74 testes, mais um bot
 *   Auditoria Spotify    28 scripts, 4 personas em contas reais, cinco métricas de
 *                        diversidade e quatro procedimentos inferenciais
 *   Controle de Acesso   integração assimétrica com legado, 5 jobs agendados,
 *                        relatório por LLM, WebSocket
 *   Fraud Sentinel       8 treinadores, ensemble por stacking, limiar em split
 *                        retido para não vazar
 *   Portal do Cidadão    multi-tenant com 4 papéis, feature flag com teste de
 *                        fechamento, 42 testes
 *   DataChat BI          master chain em LCEL com roteador, desvio e memória
 *   Marocos Bot 2.0      modelo de rating ajustado, snake draft, 10 cogs
 *   faculdAIde           grafo derivado, prefiltro de dedup, 12 arquivos de teste
 *
 * `data` é o último dia de trabalho real em cada um, conferido no `git log` do
 * repositório (ou no painel de deploy, para os que não têm remoto). Na versão
 * anterior deste arquivo estas datas eram, nas palavras do próprio comentário,
 * "plausíveis para a ordem em que os projetos aparecem, não datas verificadas".
 * Agora são verificadas — e como a lista é ordenada por complexidade, esta coluna
 * aparece FORA de ordem na tela. É o preço aceito: data é fato, não ranking.
 * O Motor de Cobrança é o único aproximado, porque não tem "último commit": ele
 * continua acontecendo.
 */
const FICHA = {
  3: { data: '2026-07-06', bytes: 13002342 },
  2: { data: '2026-08-09', bytes: 11744051 },
  1: { data: '2026-08-12', bytes: 10276044 },
  6: { data: '2026-02-05', bytes: 9017753 },
  4: { data: '2026-07-21', bytes: 8283750 },
  5: { data: '2026-07-14', bytes: 6501171 },
  9: { data: '2026-06-01', bytes: 5662310 },
  7: { data: '2026-03-09', bytes: 5033165 },
  8: { data: '2026-06-14', bytes: 4299161 },
  13: { data: '2025-11-15', bytes: 2831155 },
  14: { data: '2026-03-27', bytes: 2306867 },
  10: { data: '2026-08-10', bytes: 1153434 },
}

/** Junta a ficha ao item do idioma pedido, sem tocar nos arrays originais. */
const comFicha = (pagina) => ({
  ...pagina,
  items: pagina.items.map((p) => ({ ...p, ...(FICHA[p.id] || {}) })),
})

export const getProjectsData = (lang) =>
  comFicha(lang === 'pt' ? projectsPageContentPt : projectsPageContentEn)
