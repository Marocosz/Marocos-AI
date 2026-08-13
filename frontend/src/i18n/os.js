/* A versão do sistema vem de `content/sistema.js` e não é escrita aqui — ver a nota
   lá. É a única coisa que este arquivo de interface importa de `content/`, e a
   exceção se justifica porque versão não é texto traduzível: é um fato do sistema
   que aparece dentro de duas frases traduzidas. */
import { SISTEMA } from '../content/sistema'

const osContentEn = {
  windows: {
    readme: 'readme.txt',
    projects: 'My Projects',
    about: 'About This PC',
    history: 'Version History',
    devices: 'Device Manager',
    services: 'Services',
    terminal: 'Terminal',
    assistant: 'Virtual Marcos',
    contexto: 'Download my context',
    settings: 'Settings',
  },
  /**
   * LEGENDA DO ÍCONE NA ÁREA DE TRABALHO — mapa PARCIAL, de propósito.
   *
   * `windows` acima é compartilhado com a barra de título e a taskbar, onde
   * "Device Manager" está certo. Mas como legenda de ícone ele quebra em duas
   * linhas, o item cresce de 94,4px para 108,8px, e uma coluna com alturas
   * diferentes e `gap` uniforme deixa de ser grade (ver o clamp em
   * AppIconButton.css).
   *
   * Então aqui só entram os títulos longos demais para uma linha. Os outros
   * cinco caem no fallback `os.iconLabels[k] ?? os.windows[k]` dos call sites
   * — Desktop.jsx e HomeScreen.jsx —, e esse fallback é load-bearing: um app
   * futuro na área de trabalho sem entrada aqui mostra o título da janela em
   * vez de `undefined`.
   *
   * As duas escolhas seguem a rota do app (`/jornada`, `/stack`), não uma
   * abreviação inventada.
   */
  iconLabels: {
    history: 'Timeline',
    devices: 'Stack',
    /* "Download my context" quebra em duas linhas como legenda. Segue a rota do app
       (`/contexto`), como as outras duas — não uma abreviação inventada. */
    contexto: 'Context',
  },
  /**
   * Chrome de explorador. `root` é o primeiro degrau do breadcrumb e NÃO é
   * traduzido de propósito: é o domínio, não uma palavra.
   */
  explorer: {
    quickAccess: 'Quick access',
    thisComputer: 'This Computer',
    network: 'Network',
    up: 'Up one level',
    back: 'Back',
    forward: 'Forward',
    refresh: 'Refresh',
    home: 'Home',
    newWindow: 'Open in a new window',
    ready: 'Ready',
    root: 'marocos.dev',
    sidebarLabel: 'Places',
    breadcrumbLabel: 'Current location',
    searchPlaceholder: 'Search %s',
    searchLabel: 'Search places',
    noResults: 'No place found',
    /**
     * A barra de comandos. Estes ficam DESABILITADOS, e isso não é preguiça: no
     * Explorer de verdade recortar/copiar/renomear/compartilhar/excluir ficam
     * cinza enquanto nada está selecionado, e aqui nunca há seleção. Desenhar
     * cinza é ao mesmo tempo mais fiel à referência e honesto — botão que
     * aceita clique e não faz nada lê como bug, não como enfeite.
     */
    commands: {
      new: 'New',
      cut: 'Cut',
      copy: 'Copy',
      paste: 'Paste',
      rename: 'Rename',
      share: 'Share',
      delete: 'Delete',
      sort: 'Sort',
      view: 'View',
      filter: 'Filter',
      more: 'See more',
      details: 'Details',
      disabledHint: 'Nothing selected',
    },
    details: {
      title: 'Details',
      type: 'Type',
      typeFolder: 'System folder',
      typeItem: 'Item',
      route: 'Route',
      app: 'Process',
      close: 'Close details',
    },
  },
  /**
   * O GUIA. Este app abre sozinho para quem chega sem deep link (ver
   * `os/shell/BoasVindas.jsx`), e é a primeira coisa que quase todo visitante
   * lê. Antes ele não tinha um único link: a porta de entrada era um beco.
   *
   * AS PORTAS SÃO PERGUNTAS, não seções. Quem chega não quer "Projetos", quer
   * saber se a pessoa sabe construir — e uma lista de nomes de janela obriga o
   * visitante a adivinhar qual delas responde a isso.
   *
   * CHAVEADAS POR ID DE APP, e não por posição: reordenar as portas não pode
   * trocar o texto de ninguém. Mesma razão do bloco `iconLabels`.
   */
  about: {
    crystalAlt: '3D system logo',
    /** Interpolado com a idade derivada de `profile.nascimento`. */
    idade: '%d years old',
    /**
     * O CONTATO É UM ALVO SÓ, E NÃO REPETE NADA.
     *
     * A janela não traz e-mail, handle nem URL: os quatro ícones dizem QUAIS
     * canais existem, e o botão inteiro abre o terminal, que é onde eles moram.
     * Decisão do dono do projeto — "não quero repetir informação, quero que ele
     * use elas mandando a pessoa ir até a determinada janela com elas".
     *
     * É por isso que o terminal SAIU do guia abaixo: ele deixou de ser uma
     * pergunta a ser encontrada no meio de uma lista para virar a ação do topo,
     * que é onde uma página de entrada põe o contato.
     */
    acao: {
      titulo: 'Talk to me',
      sub: 'E-mail, LinkedIn, GitHub and Discord — in the terminal',
    },
    /**
     * O CABEÇALHO DO BLOCO DE CAPACIDADES, que é o segundo bloco de informação da
     * janela — por pedido do dono do projeto, e a posição é o argumento.
     *
     * Vem depois do nome e antes da faixa de tecnologias, porque a ordem em que a
     * janela apresenta as três coisas importa: QUEM ele é, O QUE ele resolve, e só
     * então COM O QUE. Um portfólio que abre pelas ferramentas obriga o leitor a
     * inferir a capacidade a partir de uma lista de logotipos.
     *
     * E ele GANHA HEADLINE porque afirma — é a regra de corte do par eyebrow +
     * headline do projeto. As três fichas técnicas continuam com o eyebrow sozinho.
     */
    forteLabel: 'What I do',
    /** `%d` vem de `profile.capacidades.length`. Escrever "Five" aqui seria repetir,
     *  no mesmo commit, o defeito que este arquivo já consertou cinco vezes. */
    forteHeadline: '%d things I get hired for.',
    stackLabel: 'Day to day',
    bioLabel: 'Who writes this',
    /**
     * A HEADLINE É A VOZ HUMANA; o eyebrow acima dela é a da máquina. As duas
     * juntas são a receita que `ui/AppHeader.css` já define e que este app era o
     * único a não usar — ele tinha um nível de título só, e com ele nada na janela
     * distinguia a ideia principal de um detalhe.
     *
     * E SÓ GANHA HEADLINE A SEÇÃO QUE AFIRMA. As três fichas técnicas mais abaixo
     * ficam com o eyebrow sozinho, porque ficha técnica não afirma nada — lista.
     */
    bioHeadline: 'I got here through hardware.',
    guideLabel: 'Where to start',
    /**
     * A CONTAGEM É INTERPOLADA, e a razão é a de sempre neste projeto: esta frase
     * dizia "Four questions, four windows" em literal, e a quinta porta acabou de
     * entrar. Agora `%d` vem de `portas.length` no `AboutApp` — a mesma lista que
     * desenha as portas conta quantas são, então não há como divergir.
     */
    guideHeadline: '%d questions, %d windows.',
    guide: {
      projects: {
        question: 'Can he build?',
        /** `%d` vem de `items.length` de `content/projects.js`. Dizia "Five
         *  projects" quando eram catorze. */
        answer: '%d projects, each led by its hard problem instead of a list of technologies.',
      },
      history: {
        question: 'For how long?',
        answer: 'From fixing printers at 14 to a developer paid to build agents. In order, with the gaps visible.',
      },
      readme: {
        question: 'And this site here?',
        /* "hand-built" saiu daqui pelo mesmo motivo que saiu do `readme.lead`: é
           falso, e a versão verificável é melhor. Ver a nota lá. */
        answer: 'A window manager, a shader and an agent, with no UI framework under them. Its technical guide explains how.',
      },
      /**
       * A QUARTA PORTA É O MARCOS VIRTUAL, e ela entrou no lugar do terminal. Ele
       * é a prova mais forte do portfólio — grafo LangGraph com RAG, guarda de
       * responsabilidade, resposta por SSE nó a nó — e não era porta nenhuma.
       */
      assistant: {
        question: 'Can I just ask him?',
        answer: 'An agent over my real career data — and it would rather say "I do not know" than invent.',
      },
      /**
       * A QUINTA PORTA. A janela de Serviços é a ÚNICA do portfólio cujo trabalho
       * é converter, e ela não era porta nenhuma — o visitante só a encontrava
       * pelo ícone da área de trabalho ou adivinhando um comando no terminal.
       *
       * Entra por último de propósito: quem chega no guia primeiro quer saber se a
       * pessoa sabe construir. Contratar é a pergunta de quem já se convenceu.
       */
      services: {
        question: 'And if I need to hire someone?',
        answer: 'What I build, how the delivery runs, and the machine it all lives on — mine.',
      },
    },
    specsLabel: 'System Specifications',
    /**
     * `machineLabel` ("This computer") SAIU junto da ficha de hardware, por
     * decisão do dono do projeto: o setup fica para o Marcos Virtual responder
     * quando alguém perguntar. `sistemaLabel` é a que sobrou, e a ficha que ela
     * rotula é a do próprio site — o outro sentido de "Sobre este PC".
     */
    sistemaLabel: 'This system',
  },
  /**
   * O CASE TÉCNICO DO PRÓPRIO SITE. Este app carrega sozinho a melhor prova do
   * portfólio: marocos.dev ficou deliberadamente fora da janela de Projetos
   * (decisão registrada na spec da fase 1), então é aqui ou em lugar nenhum.
   *
   * O texto morava chumbado em JSX dentro de `ReadmeApp.jsx`, por idioma — o
   * único app do projeto que fazia isso, contra a convenção de que texto vive
   * em `i18n/` ou `content/`.
   */
  /**
   * BAIXAR O CONTEXTO — os textos da janela que entrega o portfólio como arquivo.
   *
   * A ORDEM DAS CHAVES É A ORDEM DA TELA, e ela carrega a decisão de produto: o
   * `agente` vem antes de `baixarLabel` porque a janela recomenda o Marcos Virtual
   * PRIMEIRO e só depois oferece o download. Ver o cabeçalho de `apps/ContextoApp.jsx`.
   */
  contexto: {
    eyebrow: 'Take it with you',
    titulo: 'The whole portfolio, in one file',
    lead:
      'Everything this site says about me, exported as a single document you can drop into your own AI assistant — and then ask whatever you actually want to know.',
    agente: {
      titulo: 'Or just ask the agent here',
      sub: 'It answers in my voice, over the same data, and would rather say "I do not know" than invent',
    },
    /**
     * O TEXTO DA ESCOLHA. Ele NOMEIA a alternativa em vez de rotulá-la ("Download"),
     * porque o visitante está decidindo entre duas ferramentas e não entre um verbo e
     * um substantivo. E o `sub` já responde à objeção que a escolha levanta — "então
     * eu perco algo?" — dizendo que não: é o mesmo conteúdo.
     */
    prefiro: {
      titulo: 'I would rather use my own AI',
      sub: 'Same content, as a file — one click, no form and no e-mail',
    },
    baixarLabel: 'Download',
    baixarHeadline: 'Two formats, no strings attached.',
    /** `%d` é o número de projetos do arquivo, derivado — não escrito. */
    baixarCorpo:
      'No form, no e-mail, no sign-up. The file is generated in your browser from the same source that draws these windows, so it cannot disagree with the site: identity, capabilities, the full journey, all %d projects with their technical detail, the stack with levels, and the services.',
    formatos: {
      md: { nome: 'Markdown', sub: '~%d KB · best for pasting into a chat' },
      json: { nome: 'JSON', sub: '~%d KB · best for processing' },
    },
    confirmado: 'Downloaded. Drop it into your assistant and ask away.',
    dentroLabel: 'What is inside',
    dentro: [
      'Who I am, what I am hired for, and the biography',
      'The professional journey, entry by entry, with the roadmap',
      'Every project: the hard problem, how it works, and what is in the code',
      'The stack by area, with a declared level per technology',
      'The services, the delivery steps, and the machine it all runs on',
      'The public contact channels — the same ones in the terminal',
    ],
    nota:
      'No personal data beyond what these windows already show: the file carries my age, never my date of birth, and nothing about clients that is not already public here.',
  },
  readme: {
    /**
     * "HAND-BUILT" SAIU, e a remoção é uma correção de fato — sinalizada pelo dono
     * do projeto.
     *
     * Não é verdade: este sistema foi construído com um harness de IA que ele mesmo
     * montou, e a última seção desta janela explica exatamente isso. Dizer "feito à
     * mão" no primeiro parágrafo e "construído por spec com um agente" no último é o
     * site se contradizendo em duas telas de rolagem.
     *
     * E o mais importante: a versão honesta é MAIS FORTE. "Feito à mão" só
     * impressiona quem acha que escrever CSS devagar é mérito. "Não há framework de
     * UI nem biblioteca de componente aqui dentro" é uma afirmação verificável
     * sobre o `package.json`, e é o que o visitante técnico realmente quer saber.
     */
    lead: 'This is not a page with a dark theme. It is a window manager and an AI agent — no UI framework, no component library, no CSS framework. Everything you have clicked so far is the demo.',
    /**
     * DUAS SEÇÕES SAÍRAM (2026-08-13), e a remoção foi pedida pelo dono do projeto:
     * *"em vários lugares do projeto você dá ênfase à quantidade de testes, a esse
     * lance de shaders... sendo que isso não é algo importante"*.
     *
     *   "O papel de parede é um shader" — descrevia com orgulho dois fragment
     *   shaders e um teto de fps. O visitante VÊ o papel de parede; explicar como
     *   ele é feito não muda a decisão de ninguém, e ocupava uma das quatro seções
     *   da única janela que podia falar de arquitetura.
     *
     *   "E %d testes olham para tudo isso" — a suíte continua existindo e continua
     *   obrigatória, mas a CONTAGEM dela é orgulho de quem escreveu, não informação
     *   para quem contrata.
     *
     * O que sobrou são três seções, e cada uma responde a uma pergunta que alguém
     * de fora faria: como o sistema de janelas funciona, o que o agente realmente
     * é, e como isto foi construído. A seção de testes virou uma frase dentro da
     * última — ela pertence ao MÉTODO, que é a parte interessante.
     */
    sections: [
      {
        title: 'The window system',
        body: 'A pure reducer that separates a window\'s identity from its location, so the same window can navigate between contents while keeping its position, size and place in the z-order. Desktop and mobile are two shells reading the same state: one as a set, the other as a stack. That is what keeps this from being two frontends instead of one.',
      },
      {
        title: 'Virtual Marcos is an agent, not a chatbot',
        body: 'A LangGraph graph on FastAPI: it detects the language, summarises long conversations, routes casual from technical in a single LLM call, retrieves from a vector base over my real career data, and passes through an answerability guard that would rather say "I do not know" than invent. The answer streams over SSE, node by node — so you watch it decide.',
      },
      {
        /**
         * A QUINTA SEÇÃO — como isto foi construído.
         *
         * Ela existe porque o dono do projeto pediu explicitamente que a habilidade
         * de montar harness aparecesse no site, e este é o único lugar honesto para
         * ela: as outras janelas falariam SOBRE a habilidade, e esta janela é o
         * artefato produzido por ela. O visitante está clicando no resultado.
         *
         * Sem número, de propósito. A contagem de commits e de specs envelhece toda
         * semana, e a seção sobrevive melhor descrevendo o método do que medindo o
         * volume dele.
         */
        title: 'And how it was built',
        body: 'Each feature here started as a written spec, became a plan, and only then became code — the reasoning is committed next to the diff, so the comments in this repository explain decisions rather than syntax. The agent I build with reads a skill written for this project: the design tokens, the pattern for adding an app, and the mistakes already paid for in debugging. It is also forbidden from claiming a change did not alter the interface without running the visual suite first, which is the kind of rule that only matters once you have been wrong about it. That is the part I would take to any codebase — tooling that knows the project beats tooling that only knows the language.',
      },
    ],
    repoLabel: 'The whole thing is open on GitHub',
  },
  /**
   * As colunas da lista de projetos em modo Detalhes. Mesmos nomes que o
   * Explorer usa, porque a janela inteira é a citação dele.
   */
  projects: {
    colName: 'Name',
    colDate: 'Date modified',
    colType: 'Type',
    colSize: 'Size',
    countOne: '%s item',
    countMany: '%s items',
  },
  devices: {
    device: 'Device',
    status: 'Status',
    /**
     * OS NÍVEIS SÃO ESCRITOS EM INGLÊS NOS DADOS (`level: "Expert"`), e é assim desde a
     * página clássica. Traduzir o DADO quebraria duas coisas de uma vez: a chave de
     * contagem de `contarNiveis` e a classe de chip do CSS (`level-expert`). Traduzir só
     * a EXIBIÇÃO resolve sem tocar em nenhuma das duas.
     */
    niveis: { expert: 'expert', advanced: 'advanced', intermediate: 'intermediate' },
    tecnologias: 'technologies',
    abrir: 'Open',
    fechar: 'Close',
  },
  /**
   * SERVIÇOS — o `services.msc` desta máquina, e o trocadilho é o desenho todo:
   * serviço do sistema e serviço profissional são a mesma palavra, e os dois têm
   * status e tipo de inicialização.
   *
   * OS RÓTULOS DE STATUS SÃO INTERFACE, e por isso moram aqui e não em
   * `content/servicos.js` — lá fica a CHAVE (`automatico`, `sobDemanda`), que é
   * também o modificador de classe do CSS. É a mesma separação dos níveis da
   * Stack: traduz-se a exibição, nunca o dado.
   */
  services: {
    running: 'Running',
    startup: { automatico: 'Automatic', sobDemanda: 'On demand' },
    listLabel: 'Services offered',
    flowLabel: 'How it works',
    /** `%d` vem de `etapas.length`, não escrito à mão. */
    flowHeadline: '%d steps, and you follow every one.',
    stepLabel: 'Step %d',
    machineLabel: 'The machine',
    /**
     * A SEÇÃO DA MÁQUINA GANHOU HEADLINE porque ela passou a AFIRMAR — antes era
     * uma ficha técnica, e ficha técnica não afirma, lista. A regra de corte do
     * par eyebrow + headline continua valendo; o que mudou foi o conteúdo.
     *
     * E a afirmação é o argumento comercial que o dono do projeto pediu para
     * destacar: uma VPS própria não tem catálogo de recursos. O limite é o
     * hardware, não a tabela de preços de um PaaS.
     */
    machineHeadline: 'It is a machine, not a plan.',
    machineLead:
      'The VPS is mine, so the ceiling is the hardware — not somebody else’s pricing table. Any database, worker, queue, cron job or bot that runs on Linux fits in there, with no per-request billing and no process that falls asleep when nobody is looking.',
    /**
     * O TEXTO DIVERGE DO BOTÃO DO "SOBRE" DE PROPÓSITO. Lá é "Talk to me", uma
     * apresentação; aqui é o problema, porque quem chega nesta janela já sabe
     * quem ele é e quer saber se ele resolve o caso dele. A mesma frase em duas
     * janelas seria a repetição que esta página existe para não cometer.
     */
    acao: { titulo: 'Send me the problem', sub: 'The channels are in the terminal' },
  },
  /**
   * O TÍTULO DA ABA VENDE, O DA JANELA NOMEIA — e esta regra estava escrita aqui,
   * aplicada a UMA rota, enquanto todas as outras usavam o nome do app.
   *
   * "About This PC", "Version History" e "Device Manager" são a metáfora do sistema
   * operacional, e ela é excelente DENTRO da janela. Como título de resultado de
   * busca, não corresponde a consulta nenhuma: ninguém pesquisa "About This PC" para
   * encontrar um desenvolvedor.
   *
   * A generalização veio depois de uma auditoria (13/08/2026) mostrar que o comentário
   * abaixo — escrito para a janela de Serviços — descrevia uma decisão certa que nunca
   * saiu daquela linha. Agora todas carregam a proposta; `os.windows` continua com os
   * nomes de app, e é ele que a barra de título e a taskbar leem.
   *
   * O NOME VEM PRIMEIRO em quase todas, porque a busca por "Marcos Rodrigues" é a que
   * mais importa acertar e o Google trunca o fim do título. As exceções são as rotas
   * cuja INTENÇÃO é o assunto, e não a pessoa.
   */
  head: {
    about: 'Marcos Rodrigues — AI & automation developer',
    projects: 'Projects — Marcos Rodrigues',
    project: '%s — project by Marcos Rodrigues',
    history: 'Career timeline — Marcos Rodrigues',
    devices: 'Tech stack — Marcos Rodrigues',
    /* A que já estava certa: quem procura isto no Google digita o serviço, não o
       nome do programa. */
    services: 'Freelance developer & managed hosting — Marcos Rodrigues',
    terminal: 'Contact Marcos Rodrigues',
    assistant: 'Ask my AI agent — Marcos Rodrigues',
    readme: 'How this site is built — Marcos Rodrigues',
    contexto: 'Download my full context for your AI — Marcos Rodrigues',
    settings: 'Settings — Marcos Rodrigues',
  },

  /**
   * A DESCRIPTION POR ROTA. Antes existia uma só, no `index.html`, para o site
   * inteiro — e era a headline de LinkedIn que `content/profile.js` registra ter
   * descartado. Ver a nota em `os/useDocumentHead.js`.
   *
   * `raiz` é o fallback, usado quando nenhuma janela está em foco. Cada uma fica
   * abaixo de ~155 caracteres, que é o que o Google exibe antes de cortar.
   */
  headDesc: {
    raiz: 'AI and automation developer in Brazil. I build agents that reach production, and I own the whole cycle — from the requirement to the deploy.',
    about: 'Who I am, the four things I get hired for, and how I got from technical support at 14 to building AI agents in production.',
    projects: 'Twelve projects ordered by complexity, each led by the hard problem it solves and the engineering decision behind it.',
    history: 'From fixing printers at 14 to an AI and automation developer. The whole trajectory in order, with the gaps visible.',
    devices: 'The stack by area — AI and agents, machine learning, backend, frontend, automation, DevOps — with a declared level per technology.',
    services: 'Custom systems, AI agents, automation and managed hosting on my own VPS. From the problem to production, including what breaks after.',
    terminal: 'E-mail, LinkedIn, GitHub and Discord. Open to freelance work in AI, automation and full-stack development.',
    assistant: 'An AI agent over my real career data. It answers in my voice, cites its sources, and would rather say I do not know than invent.',
    readme: 'A window manager, a WebGL wallpaper and a LangGraph agent, with no UI framework under them — and the method used to build it.',
    contexto: 'Download this entire portfolio as one markdown or JSON file, and ask your own AI whatever you want to know.',
    settings: 'Theme, language and motion preferences for this site.',
  },
  mobile: {
    back: 'Back',
    dock: { label: 'Favorite apps' },
    quickSettings: { open: 'Open quick settings', title: 'Quick settings' },
  },
  boot: {
    systemName: 'MAROCOS OS',
    tagline: 'Marocos Systems',
    // Etapas reais do que acontece atrás desta tela, na ordem em que acontece:
    // o shell monta por baixo do boot e o assistente é um app de verdade. São o
    // que dá assunto à segunda metade da cerimônia.
    stages: [
      'loading system modules',
      'mounting the desktop',
      'starting Virtual Marcos',
      'ready',
    ],
    skipHint: 'click to skip',
    ariaLabel: 'Starting the system',
  },
  lock: {
    systemName: 'MAROCOS OS',
    enter: 'Enter',
    enterAria: 'Enter the desktop',
    hint: 'click MAROCOS OS to enter',
    /**
     * Só no desktop, e só enquanto a janela NÃO está em tela cheia. É um
     * sistema operacional dentro de uma aba — a barra do navegador em volta é a
     * única coisa que denuncia a moldura, e F11 a remove. Aqui é o momento
     * certo de sugerir: antes de entrar, uma vez, sem interromper nada depois.
     */
    ariaLabel: 'Lock screen',
  },
  /**
   * O balão do canto inferior direito da área de trabalho. `corpo` traz um
   * <kbd> porque a tecla é um objeto na frase, não uma palavra — e é assim que
   * ela ganha a voz de máquina do projeto.
   */
  desktop: {
    avisos: {
      fechar: 'Dismiss',
      telaCheia: {
        titulo: 'Full screen works better',
        corpo: 'This is an OS inside a browser tab. Press F11 to hide everything around it.',
      },
      /**
       * O TERCEIRO AVISO, e ele é o único que oferece algo em vez de explicar algo.
       *
       * Os outros dois ensinam a máquina (tela cheia, papéis de parede). Este
       * entrega um arquivo — então ele é o que mais se aproxima de um anúncio, e é
       * por isso que o TEXTO tem de compensar: ele diz para quem o arquivo serve,
       * não que ele existe. "Baixe meu contexto" sozinho não significa nada para
       * quem acabou de chegar.
       *
       * Entra em ÚLTIMO na pilha (índice 2) e portanto aparece por último: quem
       * chegou agora precisa entender a máquina antes de ser convidado a levá-la
       * embora.
       */
      contexto: {
        titulo: 'Download my context',
        corpo: 'The whole portfolio as one file, for your own AI. Or ask the agent here.',
      },
      temas: {
        titulo: 'Make it yours',
        /**
         * O NÚMERO É INTERPOLADO, e a razão é que ele já esteve errado: esta frase
         * dizia "Twelve" quando havia dezessete papéis de parede — a lista cresceu e
         * ninguém releu o texto. Agora vem de `contarPresets()`, a mesma função que
         * a ficha "Este sistema" do "Sobre este PC" usa.
         */
        corpo: '%d wallpapers, and each one repaints the whole system. Open Settings.',
      },
    },
  },
  /**
   * A tela de desligado é um POST de BIOS parado no meio.
   *
   * Escolha deliberada: uma máquina desligada não mostra o sistema operacional,
   * mostra o firmware. Então aqui não há vidro, nem roxo, nem Poppins — é a
   * camada de baixo do computador, e ela fala em mono âmbar sobre preto.
   *
   * O CONTEÚDO É VERDADEIRO. Cada linha do inventário aponta para algo que
   * existe no portfólio (o agente, o RAG, os apps, a VPS), porque um POST que
   * lista hardware inventado é só cenário — e o resto do sistema não faz isso.
   */
  shutdown: {
    ariaLabel: 'System halted',
    firmware: 'MAROCOS BIOS',
    /* Interpolado de `SISTEMA.versao` — ver a nota lá: eram cinco cópias da mesma
       string, e a máquina desligada podia anunciar uma versão diferente da que a
       máquina ligada mostrava. */
    firmwareVersion: `v${SISTEMA.versao}`,
    copyright: '(C) 2026 Marcos Rodrigues',
    postLabel: 'Power-On Self-Test',
    inventory: [
      { chave: 'Main Processor', valor: 'Marcos Rodrigues — AI Software Engineer' },
      { chave: 'Memory Test', valor: '4+ years .......... OK' },
      { chave: 'Primary Runtime', valor: 'Python / FastAPI' },
      { chave: 'Display Adapter', valor: 'React 19 + WebGL' },
      { chave: 'Agent Module', valor: 'LangGraph + RAG .... OK' },
      { chave: 'Host', valor: 'Docker on self-managed VPS' },
    ],
    halted: 'System halted.',
    haltedHint: 'It is now safe to turn off your computer.',
    powerOnLabel: 'Press here to power on',
    powerKey: 'ENTER',
  },
  startMenu: {
    title: 'Start menu',
    searchPlaceholder: 'Type here to search',
    appsHeading: 'All apps',
    shutdown: 'Shut down',
  },
  contextMenu: {
    ariaLabel: 'Desktop actions',
    refresh: 'Refresh',
    wallpaper: 'Change wallpaper',
    arrange: 'Arrange icons',
  },
  errors: {
    projectNotFound: 'Project not found.',
  },
  terminal: {
    helpTitle: 'Available commands:',
    /**
     * OS NOMES QUE O `help` MOSTRA. A lista era montada a partir das chaves
     * canônicas do mapa de comandos, que são portuguesas — então quem lia a
     * interface em inglês via "contato — contact channels": nome numa língua,
     * descrição na outra, e os aliases ingleses que o app já aceitava
     * (`contact`, `who`, `projects`, `devices`) nunca apareciam em lugar nenhum.
     *
     * Só existe no bloco inglês. Em português a chave canônica já é o nome.
     */
    helpNames: {
      whoami: 'who',
      contato: 'contact',
      projetos: 'projects',
      stack: 'devices',
      servicos: 'services',
    },
    helpCommands: {
      help: 'this list',
      whoami: 'who Marcos is',
      neofetch: 'system specifications',
      contato: 'contact channels',
      vps: 'the machine this runs on',
      clear: 'clear the screen',
      projetos: 'open the projects folder',
      stack: 'open the device manager',
      servicos: 'freelance and hosting',
    },
    commandNotFound: 'command not found',
    tryHelp: "Type 'help' to see what is available.",
    /**
     * A VOZ DA MÁQUINA. Antes o `whoami` imprimia o `bio_highlight` — a mesma
     * string do topo do guia, e escrita em primeira pessoa de marketing. Um
     * `whoami` responde com registro de identidade, não com headline.
     */
    whoami: [
      'marcos · ai software engineer | full-stack developer',
      /* "Desde 2018" conta a ÁREA (o suporte técnico aos 14), e não a experiência
         como desenvolvedor — que é o "4+ anos" da ficha do "Sobre este PC". São duas
         contagens de duas coisas, e é de propósito que elas não batem. */
      'in the field since 2018 · Uberlândia, Brazil',
      /* Dizia "innovation team at Supporte Logística" e ficou oito meses errado. */
      'now: ai & automation developer at Finza + freelance',
    ],
    /** Impressa no boot, com os nomes clicáveis — ver a nota em TerminalApp. */
    commandsHint: 'Also available:',
    neofetchSkillsLabel: 'Installed features',
    contactStatus: 'ONLINE',
    outputLabel: 'Terminal output',
    inputLabel: 'Type a command',
    openingProjects: 'opening My Projects...',
    openingStack: 'opening Device Manager...',
    openingServicos: 'opening Services...',
  },
  assistant: {
    searchPlaceholder: 'Ask me anything about my work…',
    emptyTitle: 'Virtual Marcos',
    emptySubtitle:
      'An AI agent with access to my real career data. Ask about projects, stack or trajectory.',
    suggestions: [
      'What are your main projects?',
      'Do you have professional experience?',
      'What is your tech stack?',
      'Tell me about yourself',
    ],
    /**
     * A DATA DA BASE É UMA PROMESSA VERIFICÁVEL, e por isso ela não pode ficar para
     * trás: quem pergunta ao agente sobre o emprego atual compara a resposta com esta
     * linha. Ela dizia Jan/2026 enquanto a base já tinha sido reescrita.
     *
     * AO MEXER AQUI, CONFIRA QUE A REINGESTÃO RODOU. Editar
     * `backend/data/knowledge_base/profile.md` não muda o que o agente responde — é
     * preciso subir com `FORCE_REINGEST=true`. Adiantar a data sem reingerir é a única
     * forma de esta linha virar mentira.
     */
    betaNotice:
      'This assistant uses Generative AI to produce dynamic answers. Although tuned for accuracy, the model can show the imprecisions inherent to the technology. Knowledge base updated through Aug/2026.',
    closeNotice: 'Dismiss',
    usageTooltip: 'Daily quota shared by all visitors (free APIs)',
    startingStatus: 'Starting…',
    processingStatus: 'Thinking…',
    timeoutError: 'The server took too long to respond. Please try again.',
    connectionError: 'Error connecting to the server. Please try again later.',
    errorPrefix: 'Error:',
  },
  settings: {
    intro:
      'Preferences are stored in this browser and survive a reload. The same three controls are available as shortcuts in the taskbar tray.',
    theme: {
      label: 'Appearance',
      hint: 'Switches the whole system, including the wallpaper, between day and night.',
      dark: 'Night',
      light: 'Day',
    },
    language: {
      label: 'Language',
      hint: 'Changes the interface and the language the AI answers in.',
    },
    animation: {
      label: 'Motion',
      hint: 'Pauses the animated wallpaper. Useful on battery or to reduce motion.',
      on: 'Enabled',
      off: 'Paused',
    },
    persistNote: 'Your system preference for reduced motion is respected automatically.',
    /**
     * Os nomes são chaveados pelo `id` do preset, e não pela posição na lista:
     * é o id que vai para o localStorage, então reordenar as listas em
     * config/system.js não pode trocar o rótulo de ninguém.
     */
    wallpaper: {
      label: 'Wallpaper',
      hintNight: 'Palettes for the night shader. Only the look changes — the rendering cost is the same in all of them.',
      hintDay: 'Palettes for the day shader. Only the look changes — the rendering cost is the same in all of them.',
      current: 'In use',
      presets: {
        ametista: 'Amethyst',
        'meia-noite': 'Midnight',
        brasa: 'Ember',
        esmeralda: 'Emerald',
        grafite: 'Graphite',
        magenta: 'Magenta',
        perola: 'Pearl',
        aurora: 'Aurora',
        'algodao-doce': 'Cotton candy',
        'ceu-claro': 'Clear sky',
        citrino: 'Citrine',
        neblina: 'Mist',
        ardosia: 'Slate',
        carvao: 'Charcoal',
        papel: 'Paper',
        linho: 'Linen',
        // Não traduz, e é o ponto: o nome do produto é o mesmo em toda língua.
        xp: 'Windows XP',
      },
      /** Explica os presets sem shader e sem vidro. Vive numa dica, não numa
       *  legenda: a grade existe para ser escaneada de relance. */
      sober: 'Static background, opaque windows — no animation and no glass. The lightest of the presets.',
      soberLabel: 'About this preset',
    },
  },
  controls: {
    minimize: 'Minimize',
    maximize: 'Maximize',
    restore: 'Restore',
    close: 'Close',
  },
  taskbar: {
    start: 'Start',
    showDesktop: 'Show desktop',
  },
  tray: {
    theme: 'Theme',
    language: 'Language',
    animation: 'Animation',
  },
  // Mesmo cargo de `content/profile.js`. Eram dois textos para a mesma coisa,
  // na mesma tela: a assinatura dizia "AI Developer & Full-Stack Engineer" e o
  // guia logo abaixo dizia outra coisa.
  signature: {
    /** Tem de bater com `profile.role` — ver a nota lá: quatro superfícies dizem
     *  o cargo, e elas já divergiram uma vez. */
    role: 'AI Software Engineer | Full-Stack Developer',
  },
}

const osContentPt = {
  windows: {
    readme: 'leia-me.txt',
    projects: 'Meus Projetos',
    about: 'Sobre este PC',
    history: 'Histórico de Versões',
    devices: 'Gerenciador de Dispositivos',
    services: 'Serviços',
    terminal: 'Terminal',
    assistant: 'Marcos Virtual',
    contexto: 'Baixar meu contexto',
    settings: 'Configurações',
  },
  /** Legenda curta do ícone — ver o bloco `iconLabels` do inglês, acima. */
  iconLabels: {
    history: 'Jornada',
    devices: 'Stack',
    /* Ver a nota no bloco em inglês: segue a rota, `/contexto`. */
    contexto: 'Contexto',
  },
  explorer: {
    quickAccess: 'Acesso rápido',
    thisComputer: 'Este Computador',
    network: 'Rede',
    up: 'Subir um nível',
    back: 'Voltar',
    forward: 'Avançar',
    refresh: 'Atualizar',
    home: 'Início',
    newWindow: 'Abrir em nova janela',
    ready: 'Pronto',
    root: 'marocos.dev',
    sidebarLabel: 'Lugares',
    breadcrumbLabel: 'Localização atual',
    searchPlaceholder: 'Pesquisar em %s',
    searchLabel: 'Pesquisar lugares',
    noResults: 'Nenhum lugar encontrado',
    /** Ver a nota no bloco em inglês: desabilitados de propósito. */
    commands: {
      new: 'Novo',
      cut: 'Recortar',
      copy: 'Copiar',
      paste: 'Colar',
      rename: 'Renomear',
      share: 'Compartilhar',
      delete: 'Excluir',
      sort: 'Classificar',
      view: 'Visualizar',
      filter: 'Filtro',
      more: 'Ver mais',
      details: 'Detalhes',
      disabledHint: 'Nada selecionado',
    },
    details: {
      title: 'Detalhes',
      type: 'Tipo',
      typeFolder: 'Pasta do sistema',
      typeItem: 'Item',
      route: 'Rota',
      app: 'Processo',
      close: 'Fechar detalhes',
    },
  },
  about: {
    crystalAlt: 'Logotipo 3D do sistema',
    idade: '%d anos',
    /** Ver a nota no bloco em inglês: um alvo só, e o terminal saiu do guia. */
    acao: {
      titulo: 'Falar comigo',
      sub: 'E-mail, LinkedIn, GitHub e Discord — no terminal',
    },
    /** Ver a nota no bloco em inglês: segundo bloco de informação, e a ordem
     *  (quem → o que → com o que) é o argumento da posição. */
    forteLabel: 'O que eu faço',
    /** `%d` vem de `profile.capacidades.length` — ver a nota no bloco em inglês. */
    forteHeadline: '%d coisas pelas quais eu sou contratado.',
    stackLabel: 'No dia a dia',
    bioLabel: 'Quem escreve isto',
    /** Ver a nota no bloco em inglês: headline só onde há afirmação. */
    bioHeadline: 'Cheguei aqui pelo hardware.',
    guideLabel: 'Por onde começar',
    /** Ver a nota no bloco em inglês: a contagem vem de `portas.length`, porque esta
     *  frase dizia "Quatro perguntas" na véspera de a quinta entrar. */
    guideHeadline: '%d perguntas, %d janelas.',
    guide: {
      projects: {
        question: 'Ele sabe construir?',
        /** `%d` vem de `items.length` de `content/projects.js`. Dizia "Cinco
         *  projetos" quando eram catorze. */
        answer: '%d projetos, cada um puxado pelo problema difícil em vez da lista de tecnologias.',
      },
      history: {
        question: 'Há quanto tempo?',
        answer: 'De consertar impressora aos 14 a desenvolvedor pago para construir agentes. Em ordem, com os vãos à vista.',
      },
      readme: {
        question: 'E este site aqui?',
        /* Ver a nota no bloco em inglês: "feito à mão" é falso, e a afirmação
           verificável sobre o `package.json` diz mais. */
        answer: 'Um gerenciador de janelas, um shader e um agente, sem framework de UI por baixo. O guia técnico dele conta como.',
      },
      /** Ver a nota no bloco em inglês: entrou no lugar do terminal. */
      assistant: {
        question: 'Consigo perguntar direto a ele?',
        answer: 'Um agente sobre a minha trajetória real — e que prefere dizer "não sei" a inventar.',
      },
      /** Ver a nota no bloco em inglês: a janela que converte não era porta nenhuma,
       *  e entra por último porque contratar é a pergunta de quem já se convenceu. */
      services: {
        question: 'E se eu precisar contratar?',
        answer: 'O que eu construo, como a entrega funciona, e a máquina onde tudo isso mora — minha.',
      },
    },
    specsLabel: 'Especificações do Sistema',
    /** Ver a nota no bloco em inglês: `machineLabel` saiu com a ficha de hardware. */
    sistemaLabel: 'Este sistema',
  },
  /** Ver a nota no bloco em inglês: a ordem das chaves é a da tela, e o agente vem
   *  antes do download de propósito. */
  contexto: {
    eyebrow: 'Leve com você',
    titulo: 'O portfólio inteiro, num arquivo',
    lead:
      'Tudo que este site diz sobre mim, exportado num documento só para você jogar no seu próprio assistente de IA — e então perguntar o que você realmente quer saber.',
    agente: {
      titulo: 'Ou pergunte direto ao agente daqui',
      sub: 'Ele responde com a minha voz, sobre os mesmos dados, e prefere dizer "não sei" a inventar',
    },
    /** Ver a nota no bloco em inglês: a escolha nomeia a alternativa, e o `sub` já
     *  responde "então eu perco algo?" antes de a pergunta aparecer. */
    prefiro: {
      titulo: 'Prefiro usar a minha própria IA',
      sub: 'O mesmo conteúdo, como arquivo — um clique, sem formulário e sem e-mail',
    },
    baixarLabel: 'Download',
    baixarHeadline: 'Dois formatos, sem pedir nada em troca.',
    /** `%d` é o número de projetos do arquivo, derivado — não escrito. */
    baixarCorpo:
      'Sem formulário, sem e-mail, sem cadastro. O arquivo é gerado no seu navegador a partir da mesma fonte que desenha estas janelas, então ele não consegue discordar do site: identidade, capacidades, a trajetória inteira, os %d projetos com o detalhe técnico deles, a stack com os níveis, e os serviços.',
    formatos: {
      md: { nome: 'Markdown', sub: '~%d KB · melhor para colar num chat' },
      json: { nome: 'JSON', sub: '~%d KB · melhor para processar' },
    },
    confirmado: 'Baixado. Jogue no seu assistente e pergunte à vontade.',
    dentroLabel: 'O que tem dentro',
    dentro: [
      'Quem eu sou, o que eu sou contratado para fazer, e a biografia',
      'A trajetória profissional, entrada por entrada, com o roadmap',
      'Cada projeto: o problema difícil, como funciona, e o que está no código',
      'A stack por área, com nível declarado por tecnologia',
      'Os serviços, as etapas da entrega, e a máquina onde tudo roda',
      'Os canais públicos de contato — os mesmos que estão no terminal',
    ],
    nota:
      'Nenhum dado pessoal além do que estas janelas já mostram: o arquivo leva a minha idade, nunca a data de nascimento, e nada de cliente que já não esteja público aqui.',
  },
  readme: {
    /** Ver a nota no bloco em inglês: "feito à mão" saiu porque é falso — este
     *  sistema foi construído com um harness de IA, e a última seção desta janela
     *  diz isso. A versão verificável é mais forte. */
    lead: 'Isto não é uma página com tema escuro. É um gerenciador de janelas e um agente de IA — sem framework de UI, sem biblioteca de componente, sem framework de CSS. Tudo que você clicou até agora é a demonstração.',
    /** Ver a nota no bloco em inglês: as seções do shader e da contagem de testes
     *  saíram por decisão do dono do projeto. Sobraram três, e cada uma responde a
     *  uma pergunta que alguém de fora faria. */
    sections: [
      {
        title: 'O sistema de janelas',
        body: 'Um reducer puro que separa a identidade de uma janela da sua localização, então a mesma janela navega entre conteúdos sem perder posição, tamanho nem lugar na ordem de empilhamento. Desktop e mobile são dois shells lendo o mesmo estado: um como conjunto, o outro como pilha. É o que impede isto de ser dois frontends em vez de um.',
      },
      {
        title: 'O Marcos Virtual é um agente, não um chatbot',
        body: 'Um grafo LangGraph sobre FastAPI: detecta o idioma, resume conversas longas, separa casual de técnico numa única chamada de LLM, recupera de uma base vetorial montada sobre a minha trajetória real, e passa por uma guarda de responsabilidade que prefere dizer "não sei" a inventar. A resposta chega por SSE, nó a nó — então você vê ele decidindo.',
      },
      {
        /** Ver a nota no bloco em inglês: é o único lugar honesto para a habilidade
         *  de harness, porque esta janela é o artefato que ela produziu. */
        title: 'E como isto foi construído',
        body: 'Cada funcionalidade daqui começou como uma spec escrita, virou plano, e só então virou código — o raciocínio fica commitado ao lado do diff, então os comentários deste repositório explicam decisão em vez de sintaxe. O agente com que eu construo lê uma skill escrita para este projeto: os tokens de design, o caminho para acrescentar um app, e os erros que já foram pagos em depuração. Ele também é proibido de afirmar que uma mudança não alterou a interface sem rodar a suíte visual antes, que é o tipo de regra que só importa depois de você ter errado nisso. É essa a parte que eu levaria para qualquer código — ferramenta que conhece o projeto ganha de ferramenta que só conhece a linguagem.',
      },
    ],
    repoLabel: 'Está tudo aberto no GitHub',
  },
  projects: {
    colName: 'Nome',
    colDate: 'Data de modificação',
    colType: 'Tipo',
    colSize: 'Tamanho',
    countOne: '%s item',
    countMany: '%s itens',
  },
  devices: {
    device: 'Dispositivo',
    status: 'Status',
    /** Ver a nota no bloco em inglês: traduz-se a exibição, nunca o dado. */
    niveis: { expert: 'expert', advanced: 'avançado', intermediate: 'intermediário' },
    tecnologias: 'tecnologias',
    abrir: 'Abrir',
    fechar: 'Fechar',
  },
  /** Ver a nota no bloco em inglês: o status é interface, a chave é dado. */
  services: {
    running: 'Em execução',
    startup: { automatico: 'Automático', sobDemanda: 'Sob demanda' },
    listLabel: 'Serviços oferecidos',
    flowLabel: 'Como funciona',
    /** `%d` vem de `etapas.length`, não escrito à mão. */
    flowHeadline: '%d etapas, e você acompanha todas.',
    stepLabel: 'Etapa %d',
    machineLabel: 'A máquina',
    /** Ver a nota no bloco em inglês: a seção passou a afirmar, então ganhou
     *  headline — e a afirmação é o argumento comercial da VPS própria. */
    machineHeadline: 'É uma máquina, não um plano.',
    machineLead:
      'A VPS é minha, então o teto é o hardware — e não a tabela de preços de outra pessoa. Cabe lá dentro qualquer banco, worker, fila, cron ou bot que rode em Linux, sem cobrança por requisição e sem processo que dorme quando ninguém está olhando.',
    /** Ver a nota no bloco em inglês: diverge do botão do "Sobre" de propósito. */
    acao: { titulo: 'Me manda o problema', sub: 'Os canais estão no terminal' },
  },
  /** Ver a nota longa no bloco em inglês: a aba vende, a janela nomeia — e a regra
   *  estava escrita para uma rota só. */
  head: {
    about: 'Marcos Rodrigues — desenvolvedor de IA e automações',
    projects: 'Projetos — Marcos Rodrigues',
    project: '%s — projeto de Marcos Rodrigues',
    history: 'Trajetória — Marcos Rodrigues',
    devices: 'Stack técnica — Marcos Rodrigues',
    /* A que já estava certa: quem procura isto no Google digita o serviço, não o
       nome do programa. */
    services: 'Desenvolvedor freelance e hospedagem gerenciada — Marcos Rodrigues',
    terminal: 'Contato — Marcos Rodrigues',
    assistant: 'Pergunte ao meu agente de IA — Marcos Rodrigues',
    readme: 'Como este site é feito — Marcos Rodrigues',
    contexto: 'Baixe meu contexto completo para a sua IA — Marcos Rodrigues',
    settings: 'Configurações — Marcos Rodrigues',
  },

  /** Ver a nota no bloco em inglês: uma description por rota, e `raiz` é o fallback. */
  headDesc: {
    raiz: 'Desenvolvedor de IA e automações. Construo agentes que chegam em produção e assumo o ciclo inteiro — do requisito ao deploy e ao que quebra depois.',
    about: 'Quem eu sou, as quatro coisas pelas quais eu sou contratado, e como saí do suporte técnico aos 14 anos para construir agentes de IA em produção.',
    projects: 'Doze projetos ordenados por complexidade, cada um puxado pelo problema difícil que resolve e pela decisão de engenharia por trás dele.',
    history: 'De consertar impressora aos 14 anos a desenvolvedor de IA e automações. A trajetória inteira em ordem, com os vãos à vista.',
    devices: 'A stack por área — IA e agentes, machine learning, backend, frontend, automação, DevOps — com nível declarado por tecnologia.',
    services: 'Sistemas sob medida, agentes de IA, automação e hospedagem gerenciada na minha VPS. Do problema ao ar, inclusive o que quebra depois.',
    terminal: 'E-mail, LinkedIn, GitHub e Discord. Aberto a freelance em IA, automação e desenvolvimento full-stack.',
    assistant: 'Um agente de IA sobre a minha trajetória real. Ele responde com a minha voz, cita as fontes, e prefere dizer não sei a inventar.',
    readme: 'Um gerenciador de janelas, um papel de parede em WebGL e um agente LangGraph, sem framework de UI por baixo — e o método usado para construir.',
    contexto: 'Baixe este portfólio inteiro como um arquivo markdown ou JSON e pergunte à sua própria IA o que você quiser saber.',
    settings: 'Preferências de tema, idioma e movimento deste site.',
  },
  mobile: {
    back: 'Voltar',
    dock: { label: 'Apps favoritos' },
    quickSettings: { open: 'Abrir ajustes rápidos', title: 'Ajustes rápidos' },
  },
  boot: {
    systemName: 'MAROCOS SO',
    tagline: 'Marocos Systems',
    // Etapas reais do que acontece atrás desta tela, na ordem em que acontece:
    // o shell monta por baixo do boot e o assistente é um app de verdade. São o
    // que dá assunto à segunda metade da cerimônia.
    stages: [
      'carregando módulos do sistema',
      'montando a área de trabalho',
      'iniciando o Marcos Virtual',
      'pronto',
    ],
    skipHint: 'clique para pular',
    ariaLabel: 'Iniciando o sistema',
  },
  lock: {
    systemName: 'MAROCOS SO',
    enter: 'Entrar',
    enterAria: 'Entrar na área de trabalho',
    hint: 'clique em MAROCOS SO para entrar',
    /** Ver a nota no bloco em inglês: desktop, e só fora de tela cheia. */
    ariaLabel: 'Tela de bloqueio',
  },
  /** Ver a nota no bloco em inglês. */
  desktop: {
    avisos: {
      fechar: 'Dispensar',
      telaCheia: {
        titulo: 'Melhor em tela cheia',
        corpo: 'Isto é um sistema operacional dentro de uma aba. Aperte F11 para esconder tudo em volta.',
      },
      /** Ver a nota no bloco em inglês: é o único aviso que OFERECE algo, então o
       *  texto tem de dizer para quem o arquivo serve, e não que ele existe. */
      contexto: {
        titulo: 'Baixe meu contexto',
        corpo: 'O portfólio inteiro num arquivo, para a sua IA. Ou pergunte ao agente daqui.',
      },
      temas: {
        titulo: 'Deixe do seu jeito',
        /** Ver a nota no bloco em inglês: o número vem de `contarPresets()`. */
        corpo: '%d papéis de parede, e cada um repinta o sistema inteiro. Abra as Configurações.',
      },
    },
  },
  /** POST de BIOS parado — ver a nota no bloco em inglês. */
  shutdown: {
    ariaLabel: 'Sistema desligado',
    firmware: 'MAROCOS BIOS',
    /* Interpolado de `SISTEMA.versao` — ver a nota lá: eram cinco cópias da mesma
       string, e a máquina desligada podia anunciar uma versão diferente da que a
       máquina ligada mostrava. */
    firmwareVersion: `v${SISTEMA.versao}`,
    copyright: '(C) 2026 Marcos Rodrigues',
    postLabel: 'Autoteste de inicialização',
    inventory: [
      { chave: 'Processador', valor: 'Marcos Rodrigues — AI Software Engineer' },
      { chave: 'Teste de memória', valor: '4+ anos ........... OK' },
      { chave: 'Runtime principal', valor: 'Python / FastAPI' },
      { chave: 'Adaptador de vídeo', valor: 'React 19 + WebGL' },
      { chave: 'Módulo de agente', valor: 'LangGraph + RAG .... OK' },
      { chave: 'Hospedagem', valor: 'Docker em VPS própria' },
    ],
    halted: 'Sistema parado.',
    haltedHint: 'É seguro desligar o seu computador.',
    powerOnLabel: 'Pressione aqui para ligar',
    powerKey: 'ENTER',
  },
  startMenu: {
    title: 'Menu Iniciar',
    searchPlaceholder: 'Digite aqui para pesquisar',
    appsHeading: 'Todos os apps',
    shutdown: 'Desligar',
  },
  contextMenu: {
    ariaLabel: 'Ações da área de trabalho',
    refresh: 'Atualizar',
    wallpaper: 'Alterar plano de fundo',
    arrange: 'Alinhar ícones',
  },
  errors: {
    projectNotFound: 'Projeto não encontrado.',
  },
  terminal: {
    helpTitle: 'Comandos disponíveis:',
    helpCommands: {
      help: 'esta lista',
      whoami: 'quem é o Marcos',
      neofetch: 'especificações do sistema',
      contato: 'canais de contato',
      vps: 'a máquina onde isto roda',
      clear: 'limpa a tela',
      projetos: 'abre a pasta de projetos',
      stack: 'abre o gerenciador de dispositivos',
      servicos: 'freelance e hospedagem',
    },
    commandNotFound: 'comando não encontrado',
    tryHelp: "Digite 'help' para ver o que existe.",
    /** Voz da máquina — ver a nota no bloco inglês. */
    whoami: [
      'marcos · ai software engineer | desenvolvedor full-stack',
      /* Ver a nota no bloco em inglês: "desde 2018" é a ÁREA, não a experiência como
         desenvolvedor — as duas contagens não batem de propósito. */
      'na área desde 2018 · Uberlândia, MG',
      /* Dizia "área de inovação da Supporte Logística" e ficou oito meses errado. */
      'agora: desenvolvedor de ia e automações na Finza + freelance',
    ],
    commandsHint: 'Também disponível:',
    neofetchSkillsLabel: 'Recursos instalados',
    contactStatus: 'ONLINE',
    outputLabel: 'Saída do terminal',
    inputLabel: 'Digite um comando',
    openingProjects: 'abrindo Meus Projetos...',
    openingStack: 'abrindo Gerenciador de Dispositivos...',
    openingServicos: 'abrindo Serviços...',
  },
  assistant: {
    searchPlaceholder: 'Pergunte qualquer coisa sobre meu trabalho…',
    emptyTitle: 'Marcos Virtual',
    emptySubtitle:
      'Um agente de IA com acesso aos dados reais da minha carreira. Pergunte sobre projetos, stack ou trajetória.',
    suggestions: [
      'Quais são seus principais projetos?',
      'Tem experiência profissional?',
      'Qual sua stack de tecnologia?',
      'Me fale sobre você',
    ],
    /** Ver a nota no bloco em inglês: adiantar esta data sem rodar a reingestão
     *  (`FORCE_REINGEST=true`) é a única forma de ela virar mentira. */
    betaNotice:
      'Este assistente utiliza IA Generativa para criar respostas dinâmicas. Embora otimizado, o modelo pode apresentar imprecisões inerentes à tecnologia. Base de conhecimento atualizada até Ago/2026.',
    closeNotice: 'Dispensar',
    usageTooltip: 'Cota diária compartilhada por todos os visitantes (APIs gratuitas)',
    startingStatus: 'Iniciando…',
    processingStatus: 'Pensando…',
    timeoutError: 'O servidor demorou muito para responder. Tente novamente.',
    connectionError: 'Erro ao conectar com o servidor. Tente novamente mais tarde.',
    errorPrefix: 'Erro:',
  },
  settings: {
    intro:
      'As preferências ficam salvas neste navegador e sobrevivem a um recarregamento. Os mesmos três controles estão como atalho na bandeja da barra de tarefas.',
    theme: {
      label: 'Aparência',
      hint: 'Alterna o sistema inteiro, incluindo o papel de parede, entre dia e noite.',
      dark: 'Noite',
      light: 'Dia',
    },
    language: {
      label: 'Idioma',
      hint: 'Muda a interface e o idioma em que a IA responde.',
    },
    animation: {
      label: 'Movimento',
      hint: 'Pausa o papel de parede animado. Útil na bateria ou para reduzir movimento.',
      on: 'Ativado',
      off: 'Pausado',
    },
    persistNote: 'Sua preferência de sistema por menos movimento é respeitada automaticamente.',
    /** Ver a nota no bloco em inglês: chaveado pelo id do preset. */
    wallpaper: {
      label: 'Papel de parede',
      hintNight: 'Paletas do shader da noite. Só a aparência muda — o custo de renderização é o mesmo em todas.',
      hintDay: 'Paletas do shader do dia. Só a aparência muda — o custo de renderização é o mesmo em todas.',
      current: 'Em uso',
      presets: {
        ametista: 'Ametista',
        'meia-noite': 'Meia-noite',
        brasa: 'Brasa',
        esmeralda: 'Esmeralda',
        grafite: 'Grafite',
        magenta: 'Magenta',
        perola: 'Pérola',
        aurora: 'Aurora',
        'algodao-doce': 'Algodão-doce',
        'ceu-claro': 'Céu claro',
        citrino: 'Citrino',
        neblina: 'Neblina',
        ardosia: 'Ardósia',
        carvao: 'Carvão',
        papel: 'Papel',
        linho: 'Linho',
        xp: 'Windows XP',
      },
      /** Ver a nota no bloco em inglês: vive numa dica, não numa legenda. */
      sober: 'Fundo parado, janelas opacas — sem animação e sem vidro. É o mais leve dos presets.',
      soberLabel: 'Sobre este preset',
    },
  },
  controls: {
    minimize: 'Minimizar',
    maximize: 'Maximizar',
    restore: 'Restaurar',
    close: 'Fechar',
  },
  taskbar: {
    start: 'Iniciar',
    showDesktop: 'Mostrar área de trabalho',
  },
  tray: {
    theme: 'Tema',
    language: 'Idioma',
    animation: 'Animação',
  },
  signature: {
    /** Ver a nota no bloco em inglês: tem de bater com `profile.role`. */
    role: 'AI Software Engineer | Desenvolvedor Full-Stack',
  },
}

export const getOsData = (lang) => (lang === 'pt' ? osContentPt : osContentEn)
