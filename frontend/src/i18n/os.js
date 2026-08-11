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
    up: 'Up one level',
    newWindow: 'Open in a new window',
    ready: 'Ready',
    root: 'marocos.dev',
    sidebarLabel: 'Places',
    breadcrumbLabel: 'Current location',
  },
  about: {
    specsLabel: 'System Specifications',
    featuresLabel: 'Installed Features',
    crystalAlt: '3D system logo',
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
    ariaLabel: 'Lock screen',
  },
  shutdown: {
    message: "It's now safe to turn off your computer.",
    subMessage: 'Marocos OS has been shut down.',
    powerOnLabel: 'Turn on again',
    ariaLabel: 'System off',
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
    helpCommands: {
      help: 'this list',
      whoami: 'who Marcos is',
      neofetch: 'system specifications',
      contato: 'contact channels',
      vps: 'hosting service',
      clear: 'clear the screen',
      projetos: 'open the projects folder',
      stack: 'open the device manager',
    },
    commandNotFound: 'command not found',
    tryHelp: "Type 'help' to see what is available.",
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
    betaNotice: 'Beta: answers come from a RAG over my own data.',
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
  signature: {
    role: 'AI Developer & Full-Stack Engineer',
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
    up: 'Subir um nível',
    newWindow: 'Abrir em nova janela',
    ready: 'Pronto',
    root: 'marocos.dev',
    sidebarLabel: 'Lugares',
    breadcrumbLabel: 'Localização atual',
  },
  about: {
    specsLabel: 'Especificações do Sistema',
    featuresLabel: 'Recursos Instalados',
    crystalAlt: 'Logotipo 3D do sistema',
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
    ariaLabel: 'Tela de bloqueio',
  },
  shutdown: {
    message: 'É seguro desligar o seu computador.',
    subMessage: 'O Marocos SO foi encerrado.',
    powerOnLabel: 'Ligar novamente',
    ariaLabel: 'Sistema desligado',
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
      vps: 'serviço de hospedagem',
      clear: 'limpa a tela',
      projetos: 'abre a pasta de projetos',
      stack: 'abre o gerenciador de dispositivos',
    },
    commandNotFound: 'comando não encontrado',
    tryHelp: "Digite 'help' para ver o que existe.",
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
    betaNotice: 'Beta: as respostas vêm de um RAG sobre meus próprios dados.',
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
    role: 'Desenvolvedor de IA & Full-Stack',
  },
}

export const getOsData = (lang) => (lang === 'pt' ? osContentPt : osContentEn)
