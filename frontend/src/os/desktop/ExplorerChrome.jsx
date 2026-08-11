import React, { useMemo } from 'react'
import { ArrowUp, ExternalLink } from 'lucide-react'
import { useWindowActions } from '../WindowManagerContext'
import { APPS } from '../registry'
import { resolveRoute, buildRoute } from '../routes'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../i18n/os'
import './ExplorerChrome.css'

/**
 * CHROME DE EXPLORADOR
 * --------------------------------------------------
 * A moldura de navegação em volta do app: lateral de lugares, breadcrumb com
 * subir, e barra de status. Envolve seis dos nove apps — Terminal, Marcos
 * Virtual e Configurações ficam de fora por decisão do dono do projeto, e a
 * decisão vive no `explorer` do registry, não aqui.
 *
 * O APP CONTINUA AGNÓSTICO DE CONTAINER, como o cabeçalho de registry.js
 * promete: quem envolve é o Window, lendo a flag. Nenhum app sabe que este
 * componente existe.
 *
 * A DIFERENÇA QUE DÁ SENTIDO A TUDO: os links daqui chamam `navigate`, que troca
 * o conteúdo DESTA janela. O ícone da área de trabalho chama `open`, que abre
 * outra. É o pedido literal do dono do projeto, e a separação está nas três
 * portas documentadas no reducer.
 *
 * O QUE ELE NÃO SABE: o conteúdo do app. Por isso o canto inferior esquerdo é
 * um "Pronto" de barra de status clássica e não uma contagem de itens —
 * contagem exigiria cada app reportar o próprio conteúdo para cima, plumbing
 * que não se paga por um número decorativo. E por isso o canto superior direito
 * é "abrir em nova janela" em vez de busca: é uma ação que o chrome consegue
 * cumprir sozinho, e ela complementa o navegar-no-lugar em vez de fingir.
 */

/**
 * Os destinos da lateral: apps com chrome de explorador, menos os dinâmicos.
 * Uma instância dinâmica não é um lugar fixo — `/projetos/:slug` só existe a
 * partir de um projeto escolhido, e não há como listá-lo aqui sem inventar um
 * slug. Calculado no módulo porque o registry é estático.
 */
const LUGARES = APPS.filter((a) => a.explorer && !a.dynamic)

/**
 * Migalhas a partir da rota, não de estado paralelo.
 *
 * A rota já é a verdade sobre onde a janela está (é ela que o efeito
 * estado->URL do WindowManagerContext publica), então derivar daqui evita a
 * segunda fonte de verdade que sempre desanda. `/projetos/rag-api` vira
 * [projetos, rag-api], e cada degrau intermediário é clicável porque
 * `resolveRoute` sabe traduzir `/projetos` de volta para um app.
 */
function migalhas(appId, params) {
  const rota = buildRoute(appId, params)
  const partes = rota.split('/').filter(Boolean)

  return partes.map((parte, i) => {
    const caminho = `/${partes.slice(0, i + 1).join('/')}`
    const destino = resolveRoute(caminho)
    return {
      texto: decodeURIComponent(parte),
      caminho,
      destino,
      // O último degrau é onde já estamos: rótulo, não link.
      atual: i === partes.length - 1,
    }
  })
}

const ExplorerChrome = ({ win, children }) => {
  const { navigate, open } = useWindowActions()
  const { language } = useLanguage()
  const os = getOsData(language)
  const t = os.explorer

  const trilha = useMemo(() => migalhas(win.appId, win.params), [win.appId, win.params])

  // Subir só existe com mais de um degrau: na raiz de um app não há para onde.
  const acima = trilha.length > 1 ? trilha[trilha.length - 2] : null

  const irPara = (destino) => {
    if (!destino) return
    navigate(win.key, destino.appId, destino.params)
  }

  return (
    <div className="explorer-chrome">
      <div className="explorer-nav">
        <button
          type="button"
          className="explorer-nav-btn"
          aria-label={t.up}
          title={t.up}
          disabled={!acima}
          onClick={() => irPara(acima?.destino)}
        >
          <ArrowUp size={15} strokeWidth={2} />
        </button>

        <nav className="explorer-crumbs" aria-label={t.breadcrumbLabel}>
          {/* Primeiro degrau: o domínio. Não é link porque a raiz do sistema é
              a área de trabalho, e "navegar para a área de trabalho" dentro de
              uma janela não quer dizer nada. */}
          <span className="explorer-crumb-raiz">{t.root}</span>
          {trilha.map((m) => (
            <React.Fragment key={m.caminho}>
              <span className="explorer-crumb-sep" aria-hidden="true">/</span>
              {m.atual ? (
                <span className="explorer-crumb explorer-crumb--atual" aria-current="page">
                  {m.texto}
                </span>
              ) : (
                <button
                  type="button"
                  className="explorer-crumb explorer-crumb--link"
                  onClick={() => irPara(m.destino)}
                >
                  {m.texto}
                </button>
              )}
            </React.Fragment>
          ))}
        </nav>

        <button
          type="button"
          className="explorer-nav-btn"
          aria-label={t.newWindow}
          title={t.newWindow}
          onClick={() => open(win.appId, win.params)}
        >
          <ExternalLink size={14} strokeWidth={2} />
        </button>
      </div>

      <div className="explorer-corpo">
        <nav className="explorer-lateral" aria-label={t.sidebarLabel}>
          <h2 className="explorer-lateral-titulo">{t.quickAccess}</h2>
          <ul className="explorer-lugares">
            {LUGARES.map((app) => {
              const Icon = app.icon
              const aqui = app.id === win.appId
              return (
                <li key={app.id}>
                  <button
                    type="button"
                    className={`explorer-lugar${aqui ? ' explorer-lugar--aqui' : ''}`}
                    aria-current={aqui ? 'page' : undefined}
                    onClick={() => navigate(win.key, app.id, null)}
                  >
                    {Icon ? <Icon size={15} strokeWidth={1.9} /> : null}
                    <span>{os.iconLabels[app.titleKey] ?? os.windows[app.titleKey]}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="explorer-conteudo">{children}</div>
      </div>

      <div className="explorer-status">
        <span>{t.ready}</span>
        {/* A rota exposta como ornamento — é o sistema dizendo onde está, e por
            isso mono, igual ao resto da voz de máquina do projeto. */}
        <span className="explorer-status-rota">{buildRoute(win.appId, win.params)}</span>
      </div>
    </div>
  )
}

/**
 * `memo` pelo mesmo motivo do Window: o `win` só troca de referência para a
 * janela que mudou (contrato de identidade do reducer), então arrastar uma
 * janela não re-renderiza o chrome das outras.
 */
export default React.memo(ExplorerChrome)
