import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Power } from 'lucide-react'
import { APPS } from '../registry'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../data/os'
import { getStartMenuData } from '../../data/startMenu'
import './StartMenu.css'

/**
 * MENU INICIAR DO MAROCOS OS
 * --------------------------------------------------
 * Continua a linguagem visual da taskbar (mesmo material mica, mesmo raio,
 * mesmas transições de tema) e ancora acima do botão Iniciar, no canto
 * inferior esquerdo.
 *
 * Este componente não conhece o window manager: quem abre apps e fecha o
 * menu é quem o instancia, via as props `onLaunch`, `onSubmitSearch` e
 * `onShutdown`. Isso mantém o menu reutilizável e testável sem precisar de
 * um WindowManagerProvider por perto.
 *
 * Decisão de UX: selecionar um app ou confirmar a busca já fecha o menu
 * internamente (chama `onClose` depois de `onLaunch`/`onSubmitSearch`) — é o
 * comportamento padrão de qualquer menu iniciar. O botão de energia não
 * fecha nada por conta própria; só dispara `onShutdown`, porque o que
 * acontece depois (tela de boot, confirmação etc.) é decisão de quem liga o
 * componente.
 */
export default function StartMenu({
  isOpen, onClose, onSubmitSearch, onLaunch, onShutdown,
}) {
  const { language } = useLanguage()
  const os = getOsData(language)
  const startMenuData = getStartMenuData(language)

  const apps = APPS.filter((app) => app.inStartMenu)

  const [query, setQuery] = useState('')
  const searchRef = useRef(null)
  // Refs dos botões de app, na mesma ordem de `apps` — é o que permite as
  // setas ↑/↓ moverem o foco sem precisar de um índice em estado.
  const itemRefs = useRef([])

  // Ao abrir: limpa a busca anterior e manda o foco pro campo de busca,
  // como pede o comportamento do menu (abre já pronto para digitar).
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      searchRef.current?.focus()
    }
  }, [isOpen])

  const focusItem = (index) => {
    itemRefs.current[index]?.focus()
  }

  // Esc fecha de qualquer lugar dentro do menu; ↑/↓ navegam entre o campo de
  // busca e a lista de apps, não importa onde o foco esteja.
  const handleMenuKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
      return
    }

    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return

    const activeIndex = itemRefs.current.indexOf(document.activeElement)

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusItem(activeIndex === -1 ? 0 : Math.min(activeIndex + 1, apps.length - 1))
      return
    }

    // ArrowUp
    event.preventDefault()
    if (activeIndex <= 0) {
      searchRef.current?.focus()
    } else {
      focusItem(activeIndex - 1)
    }
  }

  const handleSearchKeyDown = (event) => {
    if (event.key !== 'Enter') return

    const text = query.trim()
    if (!text) return

    onSubmitSearch(text)
    onClose()
  }

  const handleLaunch = (appId) => {
    onLaunch(appId)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Clique fora fecha o menu. Sem blur/tint: é só uma área de
              captura de clique, o backdrop-filter grande fica reservado para
              o próprio menu (pequeno). */}
          <div className="start-menu-backdrop" onClick={onClose} />

          <motion.div
            className="start-menu"
            role="dialog"
            aria-label={os.startMenu.title}
            onKeyDown={handleMenuKeyDown}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            <div className="start-menu-search">
              <Search size={16} strokeWidth={2} />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={os.startMenu.searchPlaceholder}
                aria-label={os.startMenu.searchPlaceholder}
              />
            </div>

            <div className="start-menu-apps">
              <p className="start-menu-apps-heading">{os.startMenu.appsHeading}</p>

              <ul role="listbox" aria-label={os.startMenu.appsHeading}>
                {apps.map((app, index) => {
                  const Icon = app.icon
                  const title = app.titleKey ? os.windows[app.titleKey] : ''

                  return (
                    <li key={app.id} role="none">
                      <button
                        type="button"
                        role="option"
                        ref={(el) => { itemRefs.current[index] = el }}
                        className="start-menu-app-btn"
                        onClick={() => handleLaunch(app.id)}
                      >
                        {Icon ? <Icon size={20} strokeWidth={1.75} /> : null}
                        <span>{title}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="start-menu-footer">
              <div className="start-menu-visitor">
                <span className="start-menu-avatar" aria-hidden="true">
                  {startMenuData.visitor.charAt(0)}
                </span>
                <span className="start-menu-visitor-name">{startMenuData.visitor}</span>
              </div>

              <button
                type="button"
                className="start-menu-power-btn"
                aria-label={os.startMenu.shutdown}
                onClick={onShutdown}
              >
                <Power size={18} strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
