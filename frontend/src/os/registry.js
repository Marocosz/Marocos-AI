/**
 * REGISTRY DE APPS
 * --------------------------------------------------
 * Declaração única de cada app do Marocos OS. Quem quiser adicionar um app mexe
 * só aqui e no componente — nem o reducer nem o shell precisam saber.
 *
 * Campos:
 *   id           identidade estável, usada como chave de janela
 *   route        caminho na URL (`:slug` marca segmento dinâmico)
 *   titleKey     chave em getOsData(lang).windows; null = título vem do conteúdo
 *   icon         glifo lucide-react
 *   component    o app em si (agnóstico de container)
 *   defaultSize  tamanho inicial da janela em px
 *   singleton    true = uma instância só
 *   dynamic      true = uma instância por params.slug
 *   parent       appId que precisa estar aberto atrás desta janela
 *   onDesktop    aparece na grade de ícones
 *   inStartMenu  aparece no menu Iniciar
 *   inDock       aparece no dock do mobile
 *
 * A ordem do array é a ordem dos ícones no desktop e no menu Iniciar.
 */

import { lazy } from 'react'
import {
  MonitorCog, FolderGit2, GitCommitVertical, Cpu,
  SquareTerminal, FileText, Bot, Settings,
} from 'lucide-react'

/**
 * O COMPONENTE É LAZY; O RESTO DO REGISTRY NÃO.
 *
 * `id`, `route`, `titleKey`, `icon`, `defaultSize`, `parent` e as flags são
 * resolvidos SINCRONAMENTE — o deriveInitial() do WindowManagerContext lê a URL
 * e monta o estado inicial antes do primeiro render, e as rotas, os títulos e
 * os ícones aparecem na taskbar e no menu Iniciar sem que o app tenha montado.
 * Só o `component` pode esperar.
 *
 * Antes, os 9 apps e todo o CSS deles entravam no bundle inicial, mesmo para
 * quem abrisse um só.
 */
const AboutApp = lazy(() => import('../apps/AboutApp'))
const ProjectsApp = lazy(() => import('../apps/ProjectsApp'))
const ProjectDetailApp = lazy(() => import('../apps/ProjectDetailApp'))
const HistoryApp = lazy(() => import('../apps/HistoryApp'))
const DevicesApp = lazy(() => import('../apps/DevicesApp'))
const TerminalApp = lazy(() => import('../apps/TerminalApp'))
const ReadmeApp = lazy(() => import('../apps/ReadmeApp'))
const AssistantApp = lazy(() => import('../apps/AssistantApp'))
const SettingsApp = lazy(() => import('../apps/SettingsApp'))

export const APPS = [
  {
    id: 'about',
    route: '/sobre',
    titleKey: 'about',
    icon: MonitorCog,
    component: AboutApp,
    defaultSize: { w: 620, h: 520 },
    singleton: true,
    dynamic: false,
    parent: null,
    onDesktop: true,
    inStartMenu: true,
    inDock: true,
  },
  {
    id: 'projects',
    route: '/projetos',
    titleKey: 'projects',
    icon: FolderGit2,
    component: ProjectsApp,
    defaultSize: { w: 640, h: 440 },
    singleton: true,
    dynamic: false,
    parent: null,
    onDesktop: true,
    inStartMenu: true,
    inDock: true,
  },
  {
    // Janela filha: só é alcançada por dentro da pasta ou por deep link.
    id: 'project',
    route: '/projetos/:slug',
    titleKey: null, // título vem do nome do projeto, em projects.js
    icon: FileText,
    component: ProjectDetailApp,
    defaultSize: { w: 560, h: 500 },
    singleton: false,
    dynamic: true,
    parent: 'projects',
    onDesktop: false,
    inStartMenu: false,
    inDock: false,
  },
  {
    id: 'history',
    route: '/jornada',
    titleKey: 'history',
    icon: GitCommitVertical,
    component: HistoryApp,
    defaultSize: { w: 700, h: 520 },
    singleton: true,
    dynamic: false,
    parent: null,
    onDesktop: true,
    inStartMenu: true,
    inDock: false,
  },
  {
    id: 'devices',
    route: '/stack',
    titleKey: 'devices',
    icon: Cpu,
    component: DevicesApp,
    defaultSize: { w: 620, h: 520 },
    singleton: true,
    dynamic: false,
    parent: null,
    onDesktop: true,
    inStartMenu: true,
    inDock: false,
  },
  {
    id: 'terminal',
    route: '/contato',
    titleKey: 'terminal',
    icon: SquareTerminal,
    component: TerminalApp,
    defaultSize: { w: 680, h: 440 },
    singleton: true,
    dynamic: false,
    parent: null,
    onDesktop: true,
    inStartMenu: true,
    inDock: false,
  },
  {
    id: 'assistant',
    route: '/assistente',
    titleKey: 'assistant',
    icon: Bot,
    component: AssistantApp,
    defaultSize: { w: 460, h: 620 },
    singleton: true,
    dynamic: false,
    parent: null,
    onDesktop: true,
    inStartMenu: true,
    inDock: true,
  },
  {
    id: 'readme',
    route: '/leia-me',
    titleKey: 'readme',
    icon: FileText,
    component: ReadmeApp,
    defaultSize: { w: 520, h: 400 },
    singleton: true,
    dynamic: false,
    parent: null,
    onDesktop: true,
    inStartMenu: true,
    inDock: false,
  },
  {
    // Fora da grade do desktop de propósito: os três controles dele já estão
    // como atalho na bandeja da taskbar, então o ícone seria redundante.
    id: 'settings',
    route: '/config',
    titleKey: 'settings',
    icon: Settings,
    component: SettingsApp,
    defaultSize: { w: 520, h: 440 },
    singleton: true,
    dynamic: false,
    parent: null,
    onDesktop: false,
    inStartMenu: true,
    inDock: true,
  },
]

export function getApp(appId) {
  return APPS.find((a) => a.id === appId)
}

/**
 * Busca em segundo plano os apps que estão a um clique de distância — os que
 * têm ícone na área de trabalho. Sem isto, o primeiro clique pagaria o download
 * do chunk no meio da interação, que é exatamente o engasgo que o prefetch do
 * cristal já resolvia para o 3D.
 */
export function prefetchAppsDoDesktop() {
  import('../apps/AboutApp')
  import('../apps/ProjectsApp')
  import('../apps/HistoryApp')
  import('../apps/DevicesApp')
  import('../apps/TerminalApp')
  import('../apps/ReadmeApp')
  import('../apps/AssistantApp')
}
