import React, {
  useCallback, useEffect, useLayoutEffect, useRef, useState,
} from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../data/os'
import './ContextMenu.css'

/**
 * MENU DE CONTEXTO DO MAROCOS OS
 * --------------------------------------------------
 * Se registra sozinho no elemento apontado por `targetRef`, escutando o
 * evento nativo `contextmenu` — não precisa de nenhum contêiner especial
 * fornecido por quem liga o componente.
 *
 * Crítico: só assume o clique quando o alvo é a própria superfície do
 * wallpaper. Texto, link, campo de formulário ou o interior de uma janela
 * (`.marocos-window`) continuam abrindo o menu nativo do navegador — o
 * visitante precisa poder copiar texto normalmente (o e-mail, por exemplo).
 * Um elemento pode pedir esse comportamento nativo explicitamente com
 * `data-menu-nativo`.
 */
export default function ContextMenu({ targetRef, items }) {
  const { language } = useLanguage()
  const os = getOsData(language)

  // null = menu fechado. Guardamos a posição do clique, não um booleano,
  // porque é o que o menu precisa pra se posicionar.
  const [position, setPosition] = useState(null)
  const menuRef = useRef(null)
  const itemRefs = useRef([])

  const close = useCallback(() => setPosition(null), [])

  // Escuta contextmenu direto no elemento-alvo, não em document: só a
  // superfície que o chamador aponta deve abrir este menu.
  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const onContextMenu = (event) => {
      const isNativeSurface = event.target.closest(
        '.marocos-window, a, input, textarea, [data-menu-nativo]',
      )
      if (isNativeSurface) return // desiste: deixa o menu nativo aparecer

      event.preventDefault()
      setPosition({ x: event.clientX, y: event.clientY })
    }

    target.addEventListener('contextmenu', onContextMenu)
    return () => target.removeEventListener('contextmenu', onContextMenu)
  }, [targetRef])

  // Fecha com Esc, clique fora ou perda de foco da janela (alt-tab).
  useEffect(() => {
    if (!position) return

    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) close()
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        close()
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('blur', close)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('blur', close)
    }
  }, [position, close])

  // Reposiciona para não vazar da viewport e foca o primeiro item — só
  // depois que o menu já tem tamanho real (por isso useLayoutEffect, não
  // useEffect: precisa medir e corrigir antes da pintura).
  useLayoutEffect(() => {
    if (!position || !menuRef.current) return

    const rect = menuRef.current.getBoundingClientRect()
    const maxX = Math.max(8, window.innerWidth - rect.width - 8)
    const maxY = Math.max(8, window.innerHeight - rect.height - 8)
    const clampedX = Math.min(position.x, maxX)
    const clampedY = Math.min(position.y, maxY)

    if (clampedX !== position.x || clampedY !== position.y) {
      setPosition({ x: clampedX, y: clampedY })
      return
    }

    itemRefs.current[0]?.focus()
  }, [position])

  if (!position || !items?.length) return null

  const focusItem = (index) => {
    itemRefs.current[index]?.focus()
  }

  const handleItemKeyDown = (event, index) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusItem(Math.min(index + 1, items.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusItem(Math.max(index - 1, 0))
    }
  }

  // Tab saindo do menu (foco vai pra fora) também fecha — o clique-fora
  // acima só cobre mouse/touch, não navegação por teclado.
  const handleBlur = (event) => {
    if (!menuRef.current?.contains(event.relatedTarget)) close()
  }

  return (
    <ul
      ref={menuRef}
      className="marocos-context-menu"
      role="menu"
      aria-label={os.contextMenu.ariaLabel}
      style={{ top: position.y, left: position.x }}
      onBlur={handleBlur}
    >
      {items.map((item, index) => (
        <li key={item.id} role="none">
          <button
            type="button"
            role="menuitem"
            ref={(el) => { itemRefs.current[index] = el }}
            className="marocos-context-menu-item"
            onClick={() => {
              item.onSelect?.()
              close()
            }}
            onKeyDown={(event) => handleItemKeyDown(event, index)}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  )
}
