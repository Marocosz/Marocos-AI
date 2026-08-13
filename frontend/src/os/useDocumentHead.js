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
import { tagDeIdioma } from '../contexts/idiomaInicial'

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

/**
 * A DESCRIPTION DA ROTA ATUAL.
 *
 * Antes existia UMA description para o site inteiro, chumbada no `index.html`, e ela
 * era a frase que `content/profile.js` registra ter descartado: "Especialista em
 * transformar dados em inteligência através de Agentes de IA, arquiteturas escaláveis
 * e automação estratégica" — com o veredito "era headline de LinkedIn: verdadeira para
 * umas cinquenta mil pessoas e verificável por nenhuma". Ela sobreviveu no lugar mais
 * visível de todos, que é o texto embaixo do link no resultado de busca.
 *
 * Agora cada rota tem a sua, em `os.headDesc`, e a raiz cai no `bio_highlight` — a
 * frase que já passou pelo crivo do dono do projeto e que a própria janela de entrada
 * exibe. Uma fonte, dois consumidores.
 *
 * O detalhe de projeto usa o `description` DO PROJETO, cortado no limite que o Google
 * exibe (~155 caracteres) na fronteira de palavra, para não terminar no meio de uma.
 */
const LIMITE_DESC = 155

function cortar(texto) {
  if (texto.length <= LIMITE_DESC) return texto
  const fatia = texto.slice(0, LIMITE_DESC)
  const espaco = fatia.lastIndexOf(' ')
  return `${fatia.slice(0, espaco > 80 ? espaco : LIMITE_DESC).trimEnd()}…`
}

function resolveDescription(os, language, appId, params) {
  if (appId === 'project') {
    const project = getProjectsData(language).items.find(
      (item) => projectSlug(item.title) === params?.slug,
    )
    if (project) return cortar(project.description)
  }
  return os.headDesc?.[appId] || os.headDesc?.raiz || ''
}

/** Escreve (ou cria) uma `<meta>` por `name`. */
function definirMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

/**
 * UM SLUG DE PROJETO QUE NÃO RESOLVE PRECISA DE `noindex`, e este é o conserto de um
 * defeito real medido em 13/08/2026.
 *
 * Numa SPA o servidor entrega o `index.html` para qualquer caminho, então
 * `/projetos/code-doc-generator` — projeto que saiu da lista — respondia **HTTP 200**
 * com canônica apontando para si mesmo. Para o Google isso é um *soft 404*: página que
 * existe e está vazia. Ele gasta orçamento de rastreio nela e reporta erro no Search
 * Console, e não há como devolver 404 de verdade sem servidor.
 *
 * O `noindex` é a única resposta possível do lado do cliente, e é suficiente: o
 * Googlebot executa JavaScript e lê a meta depois de renderizar.
 */
function ehRotaMorta(language, appId, params) {
  if (appId !== 'project') return false
  return !getProjectsData(language).items.some(
    (item) => projectSlug(item.title) === params?.slug,
  )
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

    /**
     * O `lang` DO `<html>` SEGUE O IDIOMA ATIVO.
     *
     * O `index.html` fixava `pt-br`, e o site abria em inglês por padrão — conteúdo
     * numa língua declarado como outra. Para leitor de tela isso escolhe a voz errada;
     * para rastreador, é incoerência que reduz relevância nas duas línguas. Escrito
     * aqui porque este hook já é o dono do `head` por rota, e o idioma é a mesma
     * dependência do efeito.
     */
    document.documentElement.lang = tagDeIdioma(language)

    definirMeta('description', resolveDescription(os, language, appId, params))

    /* `noindex` só onde precisa, e REMOVIDO quando não precisa: a tag é global e
       persiste entre navegações da SPA. Sem a remoção, visitar um slug morto e depois
       navegar para uma rota boa deixaria a rota boa fora do índice. */
    const morta = ehRotaMorta(language, appId, params)
    const robots = document.querySelector('meta[name="robots"]')
    if (morta) definirMeta('robots', 'noindex, follow')
    else if (robots) robots.remove()
  }, [language, appId, params])
}
