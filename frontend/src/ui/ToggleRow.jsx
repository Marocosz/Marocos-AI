import React from 'react'
import './ToggleRow.css'

/**
 * LINHA DE CONTROLE DO SISTEMA
 * --------------------------------------------------
 * Cobre o app Configurações e os ajustes rápidos do mobile, que têm a mesma
 * estrutura (ícone + texto + valor) alimentada pelo mesmo `useSystemToggles`.
 *
 * O popup da bandeja (Taskbar.jsx) NÃO usa este componente: lá o ícone é o
 * próprio valor, sem coluna separada, e forçar os três no mesmo componente
 * pediria um leque de props que valeria menos que a duplicação removida. A
 * bandeja consome só o hook e mantém markup próprio.
 *
 * Estrutura de elemento — duas formas, de propósito:
 *   Hoje o Configurações tem <li> com <span>s e um <button> só na etiqueta de
 *   valor, enquanto o Ajustes rápidos tem o <button> envolvendo a linha
 *   inteira. Unificar num <button> externo faria o alvo de clique do
 *   Configurações crescer da etiqueta para a linha toda — mudança de
 *   comportamento, ainda que não de aparência. Por isso a prop `alvo`:
 *     alvo="valor"  só a etiqueta é clicável (Configurações hoje) → <li>
 *     alvo="linha"  a linha inteira é clicável (Ajustes rápidos hoje,
 *                   também o padrão) → <button>, que o consumidor envolve
 *                   em <li>
 */
const ToggleRow = ({ linha, alvo = 'linha', mostrarHint = false, className = '' }) => {
  const Icon = linha.icon
  const conteudo = (
    <>
      <span className="toggle-row-icone">
        <Icon size={mostrarHint ? 18 : 20} strokeWidth={1.8} />
      </span>
      <span className="toggle-row-texto">
        <span className="toggle-row-label">
          {mostrarHint ? linha.label : linha.labelCurto}
        </span>
        {mostrarHint && <span className="toggle-row-hint">{linha.hint}</span>}
      </span>
    </>
  )

  const valor = mostrarHint ? linha.valor : linha.valorCurto

  if (alvo === 'valor') {
    return (
      <li className={`toggle-row ${className}`.trim()}>
        {conteudo}
        <button type="button" className="toggle-row-valor" onClick={linha.alternar}>
          {valor}
        </button>
      </li>
    )
  }

  return (
    <button
      type="button"
      className={`toggle-row ${className}`.trim()}
      onClick={linha.alternar}
    >
      {conteudo}
      <span className="toggle-row-valor">{valor}</span>
    </button>
  )
}

export default ToggleRow
