/**
 * TRADUÇÃO ENTRE URL E APP
 * --------------------------------------------------
 * Puro de propósito: deep link errado é bug silencioso, e função pura é
 * testável sem navegador.
 *
 * Rotas estáticas ganham prioridade sobre dinâmicas para que `/projetos`
 * abra a pasta em vez de ser lido como slug vazio.
 */

import { APPS } from './registry'

function normalize(pathname) {
  if (!pathname) return '/'
  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed === '' ? '/' : trimmed
}

export function resolveRoute(pathname) {
  const path = normalize(pathname)
  if (path === '/') return null

  const staticMatch = APPS.find((a) => !a.dynamic && a.route === path)
  if (staticMatch) return { appId: staticMatch.id, params: null }

  for (const app of APPS.filter((a) => a.dynamic)) {
    const prefix = app.route.replace('/:slug', '')
    if (path.startsWith(`${prefix}/`)) {
      const slug = path.slice(prefix.length + 1)
      if (slug && !slug.includes('/')) return { appId: app.id, params: { slug } }
    }
  }

  return null
}

export function buildRoute(appId, params) {
  const app = APPS.find((a) => a.id === appId)
  if (!app) return '/'
  if (app.dynamic && params && params.slug) {
    return app.route.replace(':slug', params.slug)
  }
  return app.route
}
