import React, { forwardRef } from 'react'
import './AppIconButton.css'

/**
 * BOTÃO DE APP
 * --------------------------------------------------
 * O ícone do registry, com a moldura de identidade do sistema. Antes existia em
 * quatro markups diferentes — área de trabalho, tela inicial do mobile, dock e
 * menu Iniciar — com as mesmas declarações de gradiente, borda, sombra e cor
 * copiadas entre eles.
 *
 * Duas variantes:
 *   tile   moldura roxa quadrada + label embaixo (área de trabalho, tela inicial)
 *   plana  ícone solto, sem moldura (dock, menu Iniciar)
 *
 * O tamanho vem da variante de tamanho, não de prop numérica: os quatro usos
 * têm medidas fixas e conhecidas, e um número livre convidaria a inventar um
 * quinto tamanho sem motivo.
 *
 * Não conhece o gerenciador de janelas: quem abre é quem passa `onClick`.
 */
const TAMANHO_ICONE = {
  desktop: 26,
  mobile: 26,
  dock: 22,
  lista: 20,
}

const ESPESSURA_ICONE = {
  desktop: 1.75,
  mobile: 1.75,
  dock: 1.9,
  lista: 1.75,
}

const AppIconButton = forwardRef(function AppIconButton(
  { app, titulo, variante = 'tile', tamanho = 'desktop', onClick, ...resto },
  ref,
) {
  const Icon = app.icon

  return (
    <button
      ref={ref}
      type="button"
      className={`app-icon-btn app-icon-btn--${variante} app-icon-btn--${tamanho}`}
      onClick={onClick}
      {...resto}
    >
      <span className="app-icon-btn-glifo">
        {Icon ? (
          <Icon size={TAMANHO_ICONE[tamanho]} strokeWidth={ESPESSURA_ICONE[tamanho]} />
        ) : null}
      </span>
      {variante === 'tile' && <span className="app-icon-btn-label">{titulo}</span>}
      {variante === 'plana' && tamanho === 'lista' && <span>{titulo}</span>}
    </button>
  )
})

export default AppIconButton
