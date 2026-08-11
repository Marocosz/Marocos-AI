/**
 * DOCUMENT HEAD POR ROTA
 * --------------------------------------------------
 * O Marocos OS ganhou rotas de verdade (ver registry.js), mas o <title> e o
 * <link rel="canonical"> continuavam chumbados em index.html apontando pra
 * raiz. Toda URL do site anunciava a mesma canônica, o que atrapalha
 * indexação em vez de ajudar.
 *
 * Este hook resolve os dois a partir do app em foco, escrevendo direto no
 * DOM: não monta JSX de <head> (nada de react-helmet/react-head) porque a
 * troca é só de duas strings — trazer uma lib pra isso seria peso de
 * dependência sem ganho real.
 *
 * Uso: chamar uma vez, no nível do shell, passando o appId e os params da
 * janela em foco (mesmo formato que WindowManagerContext já expõe).
 *
 *   useDocumentHead({ appId: focusedApp?.appId, params: focusedApp?.params })
 */
import { useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { getOsData } from '../i18n/os'
import { getProjectsData } from '../content/projects'
import { projectSlug } from '../apps/projectSlug'
import { buildRoute } from './routes'

const SITE_URL = 'https://marocos.dev'

// Título que já vem escrito em index.html, capturado uma vez no load do
// módulo, antes de qualquer troca de rota. É o fallback usado sempre que não
// há app em foco (rota "/") ou a chave de título ainda não existe em os.head
// — assim o hook nunca deixa o <title> vazio.
const BASE_TITLE = typeof document !== 'undefined' ? document.title : ''

/**
 * Resolve o título da rota atual. Função pura (recebe tudo por parâmetro)
 * pra não depender de hooks fora do corpo de useDocumentHead.
 */
function resolveTitle(os, language, appId, params) {
  if (!appId) return BASE_TITLE

  // 'project' é a única janela com titleKey null no registry (ver
  // registry.js): o título vem do conteúdo — o nome do projeto — não de uma
  // chave estática. Por isso os.head.project é tratado como molde com "%s"
  // no lugar do nome, em vez de um texto fixo.
  if (appId === 'project') {
    const template = os.head?.project
    const project = getProjectsData(language).items.find(
      (item) => projectSlug(item.title) === params?.slug,
    )
    if (!template || !project) return BASE_TITLE
    return template.replace('%s', project.title)
  }

  return os.head?.[appId] || BASE_TITLE
}

export function useDocumentHead({ appId, params } = {}) {
  const { language } = useLanguage()

  useEffect(() => {
    const os = getOsData(language)

    document.title = resolveTitle(os, language, appId, params)

    // <link rel="canonical"> pode não existir ainda em algum contexto de
    // teste/SSR; cria sob demanda em vez de assumir que index.html garante.
    let link = document.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.setAttribute('href', `${SITE_URL}${buildRoute(appId, params)}`)
  }, [language, appId, params])
}
