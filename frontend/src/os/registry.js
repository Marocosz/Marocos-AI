/**
 * REGISTRY DE APPS
 * --------------------------------------------------
 * Declaração única de cada app do NoiseOS. Quem quiser adicionar um app
 * mexe só aqui e no componente — nem o reducer nem o shell precisam saber.
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
 */

import { FileText, FolderGit2 } from 'lucide-react'
import ReadmeApp from '../apps/ReadmeApp'

export const APPS = [
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
  // Fase 2 substitui o placeholder de conteúdo destes dois. As entradas
  // existem desde já porque são elas que exercitam resolução de pai e
  // rota aninhada no reducer e no parser.
  {
    id: 'projects',
    route: '/projetos',
    titleKey: 'projects',
    icon: FolderGit2,
    component: null,
    defaultSize: { w: 640, h: 440 },
    singleton: true,
    dynamic: false,
    parent: null,
    onDesktop: false,
    inStartMenu: false,
    inDock: false,
  },
  {
    id: 'project',
    route: '/projetos/:slug',
    titleKey: null,
    icon: FileText,
    component: null,
    defaultSize: { w: 520, h: 480 },
    singleton: false,
    dynamic: true,
    parent: 'projects',
    onDesktop: false,
    inStartMenu: false,
    inDock: false,
  },
]

export function getApp(appId) {
  return APPS.find((a) => a.id === appId)
}
