import React from 'react'
import './AppHeader.css'

/**
 * CABEÇALHO DE APP
 * --------------------------------------------------
 * Eyebrow monoespaçada + título + subtítulo. `DevicesApp` e `HistoryApp` tinham
 * este bloco copiado, com a mesma receita (Courier New na eyebrow, cor de
 * destaque, caixa alta, letter-spacing 2px; título em --text-primary com
 * letter-spacing -0.5px; subtítulo em --text-secondary).
 *
 * OS TAMANHOS NÃO FORAM UNIFICADOS. Os dois apps diferem por 0.02–0.1rem em
 * cada linha (e no gap do próprio cabeçalho) — quase certamente ruído de
 * copiar e ajustar no olho, e não decisão de design. Mas unificar é mudança
 * visual, então a diferença virou variante de escala e continua exatamente
 * onde estava. Colapsar as duas é decisão de design, a ser tomada de
 * propósito.
 *
 *   sm  DevicesApp   eyebrow 0.68 / título 1.3 / subtítulo 0.82rem, gap 0.3rem
 *   md  (sem consumidor hoje)  eyebrow 0.72 / título 1.4 / subtítulo 0.85rem, gap 0.6rem
 *
 * `md` FICOU SEM CONSUMIDOR e não é código morto: é o `escala` PADRÃO deste
 * componente, ou seja o comportamento de `<AppHeader>` escrito sem a prop. O
 * consumidor era o "Histórico de Versões", que virou um player em 2026-08-12 e
 * passou a ter cabeçalho próprio — na escala `md` este componente ocupava ~90px dos
 * 520 de altura útil da janela, e isso empurrava a barra do tempo do player para
 * fora da dobra. Se um app novo precisar de cabeçalho grande, `md` está aqui.
 *
 * Não conhece o app que a usa: quem decide os textos e a escala é quem
 * renderiza.
 */
const AppHeader = ({ eyebrow, titulo, subtitulo, escala = 'md' }) => (
  <header className={`app-header app-header--${escala}`}>
    {eyebrow && <span className="app-header-eyebrow">{eyebrow}</span>}
    <h2 className="app-header-titulo">{titulo}</h2>
    {subtitulo && <p className="app-header-subtitulo">{subtitulo}</p>}
  </header>
)

export default AppHeader
