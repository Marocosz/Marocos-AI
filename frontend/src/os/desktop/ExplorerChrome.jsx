import React, { useMemo, useState, useRef, useEffect } from 'react'
import {
  ArrowLeft, ArrowRight, ArrowUp, RotateCw, House, Search, ExternalLink,
  Plus, Scissors, Copy, ClipboardPaste, PenLine, Share2, Trash2,
  ArrowUpDown, LayoutList, Filter, MoreHorizontal, PanelRight,
  ChevronRight, ChevronDown, Pin, Monitor, Globe, X,
} from 'lucide-react'
import { useWindowActions } from '../WindowManagerContext'
import { APPS } from '../registry'
import { resolveRoute, buildRoute } from '../routes'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../i18n/os'
import { getContactData } from '../../content/contact'
import TextoCortado from '../../ui/TextoCortado'
import './ExplorerChrome.css'

/**
 * CHROME DE EXPLORADOR
 * --------------------------------------------------
 * A moldura de navegação em volta do app, desenhada em cima do Explorer do
 * Windows 11: linha de navegação, barra de comandos, lateral em três grupos e
 * barra de status. Envolve sete dos onze apps — Terminal, Marcos Virtual e
 * Configurações ficam de fora, e a decisão vive no `explorer` do registry.
 *
 * O APP CONTINUA AGNÓSTICO DE CONTAINER, como o cabeçalho de registry.js
 * promete: quem envolve é o Window. Nenhum app sabe que este componente existe.
 *
 * A REGRA QUE SEPARA ENFEITE DE MENTIRA
 *
 * A referência tem muito controle, e boa parte não tem equivalente num
 * portfólio. A saída não foi desenhar botão morto: foi usar o estado que o
 * próprio Windows usa. Com NADA SELECIONADO — que é sempre o caso aqui —
 * recortar, copiar, colar, renomear, compartilhar e excluir ficam cinza no
 * Explorer de verdade. Desenhá-los cinza é ao mesmo tempo mais fiel à
 * referência e honesto: a barra fica cheia e nenhum botão aceita clique para
 * não fazer nada.
 *
 * O que é REAL, e é real de graça:
 *   ← →        histórico do navegador, que já é a fonte de verdade da rota
 *   ↑          sobe um nível pelo breadcrumb
 *   ⟳          remonta o conteúdo (troca a key do wrapper)
 *   ⌂          vai para o primeiro lugar da lateral
 *   busca      filtra os lugares e navega para o escolhido
 *   Detalhes   abre um painel com rota, tipo e processo da localização
 *   lateral    os três grupos, cada um com a ação que faz sentido
 */

/**
 * Os destinos fixados: apps com chrome de explorador, menos os dinâmicos. Uma
 * instância dinâmica não é um lugar fixo — `/projetos/:slug` só existe a partir
 * de um projeto escolhido. Calculado no módulo porque o registry é estático.
 */
const LUGARES = APPS.filter((a) => a.explorer && !a.dynamic)

/**
 * O grupo "Este Computador": os apps que NÃO têm chrome. Eles não podem ser
 * destino de navegação interna (o reducer recusaria), então aqui a ação é
 * `open` — janela nova. É a mesma distinção das três portas, aparecendo na
 * interface: lugar navega, programa abre.
 */
const PROGRAMAS = APPS.filter((a) => !a.explorer && a.inStartMenu)

/**
 * Migalhas a partir da rota, não de estado paralelo.
 *
 * A rota já é a verdade sobre onde a janela está (é ela que o efeito
 * estado->URL do WindowManagerContext publica), então derivar daqui evita a
 * segunda fonte de verdade que sempre desanda.
 */
function migalhas(appId, params) {
  const partes = buildRoute(appId, params).split('/').filter(Boolean)

  return partes.map((parte, i) => {
    const caminho = `/${partes.slice(0, i + 1).join('/')}`
    return {
      texto: decodeURIComponent(parte),
      caminho,
      destino: resolveRoute(caminho),
      atual: i === partes.length - 1,
    }
  })
}

/** Um botão da barra de comandos que existe para compor, e por isso é cinza. */
const Comando = ({ Icon, rotulo, dica, comTexto = false, comSeta = false }) => (
  <button
    type="button"
    className={`explorer-cmd${comTexto ? ' explorer-cmd--texto' : ''}`}
    disabled
    title={`${rotulo} — ${dica}`}
    aria-label={rotulo}
  >
    <Icon size={15} strokeWidth={1.8} />
    {comTexto && <span>{rotulo}</span>}
    {comSeta && <ChevronDown size={12} strokeWidth={2} aria-hidden="true" />}
  </button>
)

const ExplorerChrome = ({ win, children }) => {
  const { navigate, open } = useWindowActions()
  const { language } = useLanguage()
  const os = getOsData(language)
  const t = os.explorer
  // `.items`, e não o retorno inteiro: getContactData devolve a página de
  // contato completa (rótulo, título, terminal, hospedagem) e a lista de canais
  // é uma chave dentro dela.
  const contatos = getContactData(language).items

  const trilha = useMemo(() => migalhas(win.appId, win.params), [win.appId, win.params])
  const acima = trilha.length > 1 ? trilha[trilha.length - 2] : null
  const atual = trilha[trilha.length - 1]

  const [busca, setBusca] = useState('')
  const [verDetalhes, setVerDetalhes] = useState(false)
  const [grupos, setGrupos] = useState({ computador: true, rede: false })
  // Trocar esta chave remonta a subárvore do app — é o "atualizar" de verdade,
  // e não um reload de página, que jogaria fora o resto do sistema.
  const [geracao, setGeracao] = useState(0)
  const buscaRef = useRef(null)

  // A busca é por localização: mudou de lugar, a consulta antiga não vale mais.
  useEffect(() => setBusca(''), [win.appId, win.params])

  const irPara = (destino) => destino && navigate(win.key, destino.appId, destino.params)

  const achados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return []
    return LUGARES.filter((a) =>
      (os.iconLabels[a.titleKey] ?? os.windows[a.titleKey]).toLowerCase().includes(q),
    )
  }, [busca, os])

  const rotuloDe = (app) => os.iconLabels[app.titleKey] ?? os.windows[app.titleKey]

  return (
    <div className="explorer-chrome">
      {/* ==========================================================
          LINHA 1 — navegação, barra de endereço e busca
          ========================================================== */}
      <div className="explorer-nav">
        <div className="explorer-nav-grupo">
          <button
            type="button" className="explorer-nav-btn"
            title={t.back} aria-label={t.back}
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={16} strokeWidth={2} />
          </button>
          <button
            type="button" className="explorer-nav-btn"
            title={t.forward} aria-label={t.forward}
            onClick={() => window.history.forward()}
          >
            <ArrowRight size={16} strokeWidth={2} />
          </button>
          <button
            type="button" className="explorer-nav-btn"
            title={t.up} aria-label={t.up}
            disabled={!acima}
            onClick={() => irPara(acima?.destino)}
          >
            <ArrowUp size={16} strokeWidth={2} />
          </button>
          <button
            type="button" className="explorer-nav-btn"
            title={t.refresh} aria-label={t.refresh}
            onClick={() => setGeracao((g) => g + 1)}
          >
            <RotateCw size={15} strokeWidth={2} />
          </button>
        </div>

        {/* Barra de endereço: campo rebaixado com a casinha e o caminho, como
            na referência. O breadcrumb mora DENTRO dela, não solto na barra. */}
        <div className="explorer-endereco">
          <button
            type="button" className="explorer-endereco-casa"
            title={t.home} aria-label={t.home}
            onClick={() => navigate(win.key, LUGARES[0].id, null)}
          >
            <House size={15} strokeWidth={1.9} />
          </button>

          <nav className="explorer-crumbs" aria-label={t.breadcrumbLabel}>
            <ChevronRight size={13} strokeWidth={2} className="explorer-crumb-sep" aria-hidden="true" />
            <span className="explorer-crumb-raiz">{t.root}</span>
            {trilha.map((m) => (
              <React.Fragment key={m.caminho}>
                <ChevronRight size={13} strokeWidth={2} className="explorer-crumb-sep" aria-hidden="true" />
                {m.atual ? (
                  <span className="explorer-crumb explorer-crumb--atual" aria-current="page">
                    {m.texto}
                  </span>
                ) : (
                  <button
                    type="button" className="explorer-crumb explorer-crumb--link"
                    onClick={() => irPara(m.destino)}
                  >
                    {m.texto}
                  </button>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        <div className="explorer-busca">
          <Search size={14} strokeWidth={2} className="explorer-busca-icone" aria-hidden="true" />
          <input
            ref={buscaRef}
            type="text"
            className="explorer-busca-campo"
            placeholder={t.searchPlaceholder.replace('%s', atual?.texto ?? t.root)}
            aria-label={t.searchLabel}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setBusca('')
              if (e.key === 'Enter' && achados[0]) {
                navigate(win.key, achados[0].id, null)
                buscaRef.current?.blur()
              }
            }}
          />
          {busca.trim() && (
            <ul className="explorer-busca-lista">
              {achados.length === 0 ? (
                <li className="explorer-busca-vazio">{t.noResults}</li>
              ) : (
                achados.map((app) => {
                  const Icon = app.icon
                  return (
                    <li key={app.id}>
                      <button
                        type="button" className="explorer-busca-item"
                        onClick={() => navigate(win.key, app.id, null)}
                      >
                        {Icon ? <Icon size={14} strokeWidth={1.9} /> : null}
                        <TextoCortado texto={rotuloDe(app)} focavel={false} />
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          )}
        </div>
      </div>

      {/* ==========================================================
          LINHA 2 — barra de comandos (ver a nota sobre cinza no topo)
          ========================================================== */}
      <div className="explorer-comandos">
        {/* O ENFEITE CEDE ESPAÇO ANTES DO BOTÃO DE VERDADE.
            Todos os comandos aqui dentro estão desabilitados de propósito — são
            o estado "nada selecionado" do Explorer. Antes eles dividiam a linha
            de igual para igual com "Detalhes", e numa janela estreita (a de
            projeto tem 744px) quem ficava cortado era justamente o único botão
            que faz alguma coisa. Agrupados, eles truncam primeiro. */}
        <div className="explorer-cmd-enfeites">
          <Comando Icon={Plus} rotulo={t.commands.new} dica={t.commands.disabledHint} comTexto comSeta />
          <span className="explorer-cmd-sep" aria-hidden="true" />
          <Comando Icon={Scissors} rotulo={t.commands.cut} dica={t.commands.disabledHint} />
          <Comando Icon={Copy} rotulo={t.commands.copy} dica={t.commands.disabledHint} />
          <Comando Icon={ClipboardPaste} rotulo={t.commands.paste} dica={t.commands.disabledHint} />
          <Comando Icon={PenLine} rotulo={t.commands.rename} dica={t.commands.disabledHint} />
          <Comando Icon={Share2} rotulo={t.commands.share} dica={t.commands.disabledHint} />
          <Comando Icon={Trash2} rotulo={t.commands.delete} dica={t.commands.disabledHint} />
          <span className="explorer-cmd-sep" aria-hidden="true" />
          <Comando Icon={ArrowUpDown} rotulo={t.commands.sort} dica={t.commands.disabledHint} comTexto comSeta />
          <Comando Icon={LayoutList} rotulo={t.commands.view} dica={t.commands.disabledHint} comTexto comSeta />
          <Comando Icon={Filter} rotulo={t.commands.filter} dica={t.commands.disabledHint} comTexto comSeta />
          <Comando Icon={MoreHorizontal} rotulo={t.commands.more} dica={t.commands.disabledHint} />
        </div>

        {/* Único da barra que age: ele só precisa do que o chrome já sabe. */}
        <button
          type="button"
          className={`explorer-cmd explorer-cmd--texto${verDetalhes ? ' explorer-cmd--ativo' : ''}`}
          aria-pressed={verDetalhes}
          title={t.commands.details}
          onClick={() => setVerDetalhes((v) => !v)}
        >
          <PanelRight size={15} strokeWidth={1.8} />
          <span>{t.commands.details}</span>
        </button>
      </div>

      {/* ==========================================================
          CORPO — lateral, conteúdo e painel de detalhes
          ========================================================== */}
      <div className="explorer-corpo">
        <nav className="explorer-lateral" aria-label={t.sidebarLabel}>
          {/* Grupo 1: os lugares fixados. O pin é enfeite honesto — eles são
              mesmo os fixos do sistema, não dá para desafixar porque não há
              como afixar outros. */}
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
                    <span>{rotuloDe(app)}</span>
                    <Pin size={11} strokeWidth={2} className="explorer-pin" aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>

          <span className="explorer-lateral-sep" aria-hidden="true" />

          {/* Grupo 2: os apps SEM chrome. Aqui a ação é `open`, janela nova —
              eles não podem ser destino de navegação interna. É a distinção
              das três portas do reducer aparecendo na interface. */}
          <div className="explorer-grupo">
            <button
              type="button" className="explorer-grupo-cab"
              aria-expanded={grupos.computador}
              onClick={() => setGrupos((g) => ({ ...g, computador: !g.computador }))}
            >
              {grupos.computador
                ? <ChevronDown size={13} strokeWidth={2} />
                : <ChevronRight size={13} strokeWidth={2} />}
              <Monitor size={15} strokeWidth={1.9} />
              <span>{t.thisComputer}</span>
            </button>
            {grupos.computador && (
              <ul className="explorer-lugares explorer-lugares--filho">
                {PROGRAMAS.map((app) => {
                  const Icon = app.icon
                  return (
                    <li key={app.id}>
                      <button
                        type="button" className="explorer-lugar"
                        onClick={() => open(app.id)}
                      >
                        {Icon ? <Icon size={15} strokeWidth={1.9} /> : null}
                        <TextoCortado texto={os.windows[app.titleKey]} focavel={false} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Grupo 3: Rede — os canais de contato. Links de verdade, para fora. */}
          <div className="explorer-grupo">
            <button
              type="button" className="explorer-grupo-cab"
              aria-expanded={grupos.rede}
              onClick={() => setGrupos((g) => ({ ...g, rede: !g.rede }))}
            >
              {grupos.rede
                ? <ChevronDown size={13} strokeWidth={2} />
                : <ChevronRight size={13} strokeWidth={2} />}
              <Globe size={15} strokeWidth={1.9} />
              <span>{t.network}</span>
            </button>
            {grupos.rede && (
              <ul className="explorer-lugares explorer-lugares--filho">
                {contatos.map((c) => {
                  const Icon = c.icon
                  return (
                    <li key={c.id}>
                      <a
                        className="explorer-lugar"
                        href={c.link}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {Icon ? <Icon size={15} strokeWidth={1.9} /> : null}
                        <span>{c.label}</span>
                        <ExternalLink size={11} strokeWidth={2} className="explorer-pin" aria-hidden="true" />
                      </a>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </nav>

        {/* `key` no wrapper: é isto que o botão atualizar troca. Remonta só a
            subárvore do app, sem tocar no resto do sistema — recarregar a
            página jogaria fora as outras janelas, o tema e a cerimônia. */}
        <div className="explorer-conteudo" key={geracao}>{children}</div>

        {verDetalhes && (
          <aside className="explorer-detalhes">
            <div className="explorer-detalhes-cab">
              <span>{t.details.title}</span>
              <button
                type="button" className="explorer-detalhes-fechar"
                aria-label={t.details.close}
                onClick={() => setVerDetalhes(false)}
              >
                <X size={13} strokeWidth={2} />
              </button>
            </div>
            <dl className="explorer-detalhes-lista">
              <dt>{t.details.type}</dt>
              <dd>{win.params?.slug ? t.details.typeItem : t.details.typeFolder}</dd>
              <dt>{t.details.route}</dt>
              <dd>{buildRoute(win.appId, win.params)}</dd>
              <dt>{t.details.app}</dt>
              <dd>{win.appId}</dd>
            </dl>
          </aside>
        )}
      </div>

      {/* ==========================================================
          BARRA DE STATUS
          ========================================================== */}
      <div className="explorer-status">
        <span>{t.ready}</span>
        <span className="explorer-status-dir">
          {/* A rota exposta como ornamento — o sistema dizendo onde está, e por
              isso mono, igual ao resto da voz de máquina do projeto. */}
          <span className="explorer-status-rota">{buildRoute(win.appId, win.params)}</span>
          <button
            type="button" className="explorer-status-nova"
            title={t.newWindow} aria-label={t.newWindow}
            onClick={() => open(win.appId, win.params)}
          >
            <ExternalLink size={12} strokeWidth={2} />
          </button>
        </span>
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
