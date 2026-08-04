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
  about: {
    specsLabel: 'System Specifications',
    featuresLabel: 'Installed Features',
    crystalAlt: '3D system logo',
  },
  devices: {
    device: 'Device',
    status: 'Status',
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
    },
    commandNotFound: 'command not found',
    tryHelp: "Type 'help' to see what is available.",
    neofetchSkillsLabel: 'Installed features',
    contactStatus: 'ONLINE',
    outputLabel: 'Terminal output',
    inputLabel: 'Type a command',
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
    more: 'More options',
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
  about: {
    specsLabel: 'Especificações do Sistema',
    featuresLabel: 'Recursos Instalados',
    crystalAlt: 'Logotipo 3D do sistema',
  },
  devices: {
    device: 'Dispositivo',
    status: 'Status',
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
    },
    commandNotFound: 'comando não encontrado',
    tryHelp: "Digite 'help' para ver o que existe.",
    neofetchSkillsLabel: 'Recursos instalados',
    contactStatus: 'ONLINE',
    outputLabel: 'Saída do terminal',
    inputLabel: 'Digite um comando',
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
    more: 'Mais opções',
  },
  signature: {
    role: 'Desenvolvedor de IA & Full-Stack',
  },
}

export const getOsData = (lang) => (lang === 'pt' ? osContentPt : osContentEn)
