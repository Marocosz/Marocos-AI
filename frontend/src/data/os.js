const osContentEn = {
  windows: {
    readme: 'readme.txt',
    projects: 'My Projects',
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
