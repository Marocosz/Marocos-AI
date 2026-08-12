const osContentEn = {
  windows: {
    readme: 'readme.txt',
    projects: 'My Projects',
    about: 'About This PC',
    history: 'Version History',
    devices: 'Device Manager',
    terminal: 'Terminal',
    assistant: 'Virtual Marcos',
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
    guideLabel: 'Where to start',
    guide: {
      projects: {
        question: 'Can he build?',
        answer: 'Five projects, each led by its hard problem instead of a list of technologies.',
      },
      history: {
        question: 'For how long?',
        answer: 'From fixing printers at 14 to full stack developer. Seven years, in order.',
      },
      readme: {
        question: 'And this site here?',
        answer: 'This operating system is hand-built. Its technical guide explains how.',
      },
      terminal: {
        question: 'How do I reach him?',
        answer: 'E-mail, LinkedIn and GitHub — in a terminal that opens with them on screen.',
      },
    },
    specsLabel: 'System Specifications',
    machineLabel: 'This computer',
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
  readme: {
    lead: 'This is not a page with a dark theme. It is a window manager, a WebGL wallpaper and an AI agent, all hand-built — and everything you have clicked so far is the demo.',
    sections: [
      {
        title: 'The window system',
        body: 'A pure reducer that separates a window\'s identity from its location, so the same window can navigate between contents while keeping its position, size and place in the z-order. Desktop and mobile are two shells reading the same state: one as a set, the other as a stack. That is what keeps this from being two frontends.',
      },
      {
        title: 'The wallpaper is a shader',
        body: 'Two fragment shaders over ogl — silk for the dark theme, iridescence for the light one — with an fps ceiling and a hard stop when they are not visible, because an animated wallpaper you cannot switch off is a battery bug. Below 1024px it becomes a CSS gradient: a phone has no budget for this.',
      },
      {
        title: 'Virtual Marcos is an agent, not a chatbot',
        body: 'A LangGraph graph on FastAPI: it detects the language, summarises long conversations, routes casual from technical in a single LLM call, retrieves from a vector base over my real career data, and passes through an answerability guard that would rather say "I do not know" than invent. The answer streams over SSE, node by node.',
      },
      {
        /**
         * O NÚMERO É INTERPOLADO, e a razão é que ele já esteve errado: esta
         * frase dizia 36 quando a suíte tinha 38 — ela cresceu e ninguém releu o
         * texto. Agora vem de `SISTEMA.testes` (`content/sistema.js`), a mesma
         * constante que a ficha "Este sistema" do "Sobre este PC" exibe. As duas
         * janelas não têm mais como discordar.
         */
        title: 'And %d tests watch all of it',
        body: 'A Playwright suite: 21 visual scenes at zero tolerance across both themes and mobile, plus route tests that catch what a build cannot — a broken dynamic import only fails at runtime, and every app here is loaded on demand.',
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
  },
  head: {
    about: 'About This PC | Marcos Rodrigues',
    projects: 'Projects | Marcos Rodrigues',
    project: '%s | Projects | Marcos Rodrigues',
    history: 'Career Timeline | Marcos Rodrigues',
    devices: 'Tech Stack | Marcos Rodrigues',
    terminal: 'Contact | Marcos Rodrigues',
    assistant: 'Talk to Virtual Marcos | Marcos Rodrigues',
    readme: 'About this portfolio | Marcos Rodrigues',
    settings: 'Settings | Marcos Rodrigues',
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
      temas: {
        titulo: 'Make it yours',
        corpo: 'Twelve wallpapers, and each one repaints the whole system. Open Settings.',
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
    firmwareVersion: 'v3.0.1',
    copyright: '(C) 2026 Marcos Rodrigues',
    postLabel: 'Power-On Self-Test',
    inventory: [
      { chave: 'Main Processor', valor: 'Marcos Rodrigues — AI & Full-Stack' },
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
    },
    commandNotFound: 'command not found',
    tryHelp: "Type 'help' to see what is available.",
    /**
     * A VOZ DA MÁQUINA. Antes o `whoami` imprimia o `bio_highlight` — a mesma
     * string do topo do guia, e escrita em primeira pessoa de marketing. Um
     * `whoami` responde com registro de identidade, não com headline.
     */
    whoami: [
      'marcos · full stack developer, focused on AI',
      'in the field since 2018 · Uberlândia, Brazil',
      'now: innovation team at Supporte Logística + freelance',
    ],
    /** Impressa no boot, com os nomes clicáveis — ver a nota em TerminalApp. */
    commandsHint: 'Also available:',
    neofetchSkillsLabel: 'Installed features',
    contactStatus: 'ONLINE',
    outputLabel: 'Terminal output',
    inputLabel: 'Type a command',
    openingProjects: 'opening My Projects...',
    openingStack: 'opening Device Manager...',
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
    betaNotice:
      'This assistant uses Generative AI to produce dynamic answers. Although tuned for accuracy, the model can show the imprecisions inherent to the technology. Knowledge base updated through Jan/2026.',
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
    role: 'Full Stack Developer & AI',
  },
}

const osContentPt = {
  windows: {
    readme: 'leia-me.txt',
    projects: 'Meus Projetos',
    about: 'Sobre este PC',
    history: 'Histórico de Versões',
    devices: 'Gerenciador de Dispositivos',
    terminal: 'Terminal',
    assistant: 'Marcos Virtual',
    settings: 'Configurações',
  },
  /** Legenda curta do ícone — ver o bloco `iconLabels` do inglês, acima. */
  iconLabels: {
    history: 'Jornada',
    devices: 'Stack',
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
    guideLabel: 'Por onde começar',
    guide: {
      projects: {
        question: 'Ele sabe construir?',
        answer: 'Cinco projetos, cada um puxado pelo problema difícil em vez da lista de tecnologias.',
      },
      history: {
        question: 'Há quanto tempo?',
        answer: 'De consertar impressora aos 14 a desenvolvedor full stack. Sete anos, em ordem.',
      },
      readme: {
        question: 'E este site aqui?',
        answer: 'Este sistema operacional é feito à mão. O guia técnico dele conta como.',
      },
      terminal: {
        question: 'Como falo com ele?',
        answer: 'E-mail, LinkedIn e GitHub — num terminal que já abre com eles na tela.',
      },
    },
    specsLabel: 'Especificações do Sistema',
    machineLabel: 'Este computador',
  },
  readme: {
    lead: 'Isto não é uma página com tema escuro. É um gerenciador de janelas, um papel de parede em WebGL e um agente de IA, tudo feito à mão — e tudo que você clicou até agora é a demonstração.',
    sections: [
      {
        title: 'O sistema de janelas',
        body: 'Um reducer puro que separa a identidade de uma janela da sua localização, então a mesma janela navega entre conteúdos sem perder posição, tamanho nem lugar na ordem de empilhamento. Desktop e mobile são dois shells lendo o mesmo estado: um como conjunto, o outro como pilha. É o que impede isto de virar dois frontends.',
      },
      {
        title: 'O papel de parede é um shader',
        body: 'Dois fragment shaders sobre ogl — seda no tema escuro, iridescência no claro — com teto de fps e parada seca quando não estão visíveis, porque papel de parede animado que não desliga é bug de bateria. Abaixo de 1024px vira gradiente CSS: celular não tem orçamento para isso.',
      },
      {
        title: 'O Marcos Virtual é um agente, não um chatbot',
        body: 'Um grafo LangGraph sobre FastAPI: detecta o idioma, resume conversas longas, separa casual de técnico numa única chamada de LLM, recupera de uma base vetorial montada sobre a minha trajetória real, e passa por uma guarda de responsabilidade que prefere dizer "não sei" a inventar. A resposta chega por SSE, nó a nó.',
      },
      {
        /** Ver a nota no bloco em inglês: o número vem de `SISTEMA.testes`. */
        title: 'E %d testes olham para tudo isso',
        body: 'Uma suíte Playwright: 21 cenas visuais com tolerância zero nos dois temas e no mobile, mais testes de rota que pegam o que build nenhum pega — import dinâmico quebrado só falha em runtime, e todo app daqui é carregado sob demanda.',
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
  },
  head: {
    about: 'Sobre este PC | Marcos Rodrigues',
    projects: 'Projetos | Marcos Rodrigues',
    project: '%s | Projetos | Marcos Rodrigues',
    history: 'Trajetória | Marcos Rodrigues',
    devices: 'Stack Técnica | Marcos Rodrigues',
    terminal: 'Contato | Marcos Rodrigues',
    assistant: 'Converse com o Marcos Virtual | Marcos Rodrigues',
    readme: 'Sobre este portfólio | Marcos Rodrigues',
    settings: 'Configurações | Marcos Rodrigues',
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
      temas: {
        titulo: 'Deixe do seu jeito',
        corpo: 'Doze papéis de parede, e cada um repinta o sistema inteiro. Abra as Configurações.',
      },
    },
  },
  /** POST de BIOS parado — ver a nota no bloco em inglês. */
  shutdown: {
    ariaLabel: 'Sistema desligado',
    firmware: 'MAROCOS BIOS',
    firmwareVersion: 'v3.0.1',
    copyright: '(C) 2026 Marcos Rodrigues',
    postLabel: 'Autoteste de inicialização',
    inventory: [
      { chave: 'Processador', valor: 'Marcos Rodrigues — IA & Full-Stack' },
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
    },
    commandNotFound: 'comando não encontrado',
    tryHelp: "Digite 'help' para ver o que existe.",
    /** Voz da máquina — ver a nota no bloco inglês. */
    whoami: [
      'marcos · desenvolvedor full stack, foco em IA',
      'na área desde 2018 · Uberlândia, MG',
      'agora: área de inovação da Supporte Logística + freelance',
    ],
    commandsHint: 'Também disponível:',
    neofetchSkillsLabel: 'Recursos instalados',
    contactStatus: 'ONLINE',
    outputLabel: 'Saída do terminal',
    inputLabel: 'Digite um comando',
    openingProjects: 'abrindo Meus Projetos...',
    openingStack: 'abrindo Gerenciador de Dispositivos...',
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
    betaNotice:
      'Este assistente utiliza IA Generativa para criar respostas dinâmicas. Embora otimizado, o modelo pode apresentar imprecisões inerentes à tecnologia. Base de conhecimento atualizada até Jan/2026.',
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
    role: 'Desenvolvedor Full Stack & IA',
  },
}

export const getOsData = (lang) => (lang === 'pt' ? osContentPt : osContentEn)
