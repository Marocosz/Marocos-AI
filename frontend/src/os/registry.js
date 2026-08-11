/**
 * REGISTRY DE APPS
 * --------------------------------------------------
 * Declaração única de cada app do Marocos OS. Quem quiser adicionar um app mexe
 * só aqui e no componente — nem o reducer nem o shell precisam saber.
 *
 * Campos:
 *   id           identidade estável, usada para casar localização de janela
 *   route        caminho na URL (`:slug` marca segmento dinâmico)
 *   titleKey     chave em getOsData(lang).windows; null = título vem do conteúdo
 *   icon         glifo lucide-react
 *   component    o app em si (agnóstico de container)
 *   defaultSize  tamanho inicial da janela em px
 *   singleton    true = uma instância só
 *   dynamic      true = uma instância por params.slug
 *   explorer     true = a janela ganha o chrome de explorador (lateral,
 *                breadcrumb, barra de status) e pode ser destino de navegação
 *                DENTRO de uma janela
 *   onDesktop    aparece na grade de ícones
 *   inStartMenu  aparece no menu Iniciar
 *   inDock       aparece no dock do mobile
 *
 * A ordem do array é a ordem dos ícones no desktop e no menu Iniciar.
 *
 * O CAMPO `parent` NÃO EXISTE MAIS, e o motivo é a navegação interna. Ele servia
 * a um caso só: `project` declarava `parent: 'projects'` e o reducer montava a
 * pasta atrás do detalhe num deep link. Agora o detalhe É a janela da pasta em
 * outra localização, e o breadcrumb dá o caminho de volta — não há pai para
 * montar. O branch de recursão saiu do reducer junto, porque caminho
 * inalcançável pelo app mas coberto por teste é a pior das três opções: parece
 * vivo e não é.
 */

import { lazy } from 'react'
import {
  MonitorCog, FolderGit2, GitCommitVertical, Cpu,
  SquareTerminal, FileText, Bot, Settings,
} from 'lucide-react'

/**
 * O COMPONENTE É LAZY; O RESTO DO REGISTRY NÃO.
 *
 * `id`, `route`, `titleKey`, `icon`, `defaultSize`, `explorer` e as flags são
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

/**
 * O CHROME DE EXPLORADOR CUSTA ESPAÇO, E O `defaultSize` PAGOU.
 *
 * Lateral de 168px, barra de navegação de 36px e barra de status de 26px. Os
 * seis apps com `explorer: true` cresceram exatamente isso (+168 na largura,
 * +62 na altura) para o conteúdo continuar com a mesma área útil de antes — sem
 * isso o chrome comeria a janela em vez de emoldurá-la.
 *
 * A maior fica em 868px de largura. Com os 16px de JANELAS.margem dos dois lados
 * isso pede 900px, que cabe no breakpoint de 1024px onde o shell de desktop
 * começa.
 *
 * Terminal, Marcos Virtual e Configurações não recebem o chrome — decisão do
 * dono do projeto, "esses são diferentes" — e portanto não mudaram de tamanho.
 */
export const APPS = [
  {
    id: 'about',
    route: '/sobre',
    titleKey: 'about',
    icon: MonitorCog,
    component: AboutApp,
    defaultSize: { w: 788, h: 582 },
    singleton: true,
    dynamic: false,
    explorer: true,
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
    defaultSize: { w: 808, h: 502 },
    singleton: true,
    dynamic: false,
    explorer: true,
    onDesktop: true,
    inStartMenu: true,
    inDock: true,
  },
  {
    // Alcançado por navegação de dentro da pasta ou por deep link. Não abre
    // janela nova a partir do card: troca o conteúdo da janela da pasta, como
    // entrar numa pasta num explorador de verdade.
    id: 'project',
    route: '/projetos/:slug',
    titleKey: null, // título vem do nome do projeto, em projects.js
    icon: FileText,
    component: ProjectDetailApp,
    defaultSize: { w: 728, h: 562 },
    singleton: false,
    dynamic: true,
    explorer: true,
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
    defaultSize: { w: 868, h: 582 },
    singleton: true,
    dynamic: false,
    explorer: true,
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
    defaultSize: { w: 788, h: 582 },
    singleton: true,
    dynamic: false,
    explorer: true,
    onDesktop: true,
    inStartMenu: true,
    inDock: false,
  },
  {
    // Sem chrome de explorador: um terminal com lateral de navegação de arquivos
    // seria duas metáforas brigando na mesma janela.
    id: 'terminal',
    route: '/contato',
    titleKey: 'terminal',
    icon: SquareTerminal,
    component: TerminalApp,
    defaultSize: { w: 680, h: 440 },
    singleton: true,
    dynamic: false,
    explorer: false,
    onDesktop: true,
    inStartMenu: true,
    inDock: false,
  },
  {
    // Sem chrome de explorador: é uma conversa, não um lugar.
    id: 'assistant',
    route: '/assistente',
    titleKey: 'assistant',
    icon: Bot,
    component: AssistantApp,
    defaultSize: { w: 460, h: 620 },
    singleton: true,
    dynamic: false,
    explorer: false,
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
    defaultSize: { w: 688, h: 462 },
    singleton: true,
    dynamic: false,
    explorer: true,
    onDesktop: true,
    inStartMenu: true,
    inDock: false,
  },
  {
    // Fora da grade do desktop de propósito: os três controles dele já estão
    // como atalho na bandeja da taskbar, então o ícone seria redundante. E sem
    // chrome de explorador — é painel de preferências, e uma lateral de
    // navegação para três linhas ficaria maior que o conteúdo.
    id: 'settings',
    route: '/config',
    titleKey: 'settings',
    icon: Settings,
    component: SettingsApp,
    defaultSize: { w: 520, h: 440 },
    singleton: true,
    dynamic: false,
    explorer: false,
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
