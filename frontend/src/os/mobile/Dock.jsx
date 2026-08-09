import React from 'react'
import { useWindows } from '../WindowManagerContext'
import { APPS } from '../registry'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../data/os'

/**
 * DOCK
 * --------------------------------------------------
 * Barra fixa no rodapé da HomeScreen com os apps marcados `inDock: true` no
 * registry (about, projects, assistant, settings — 4 no total). Mesmo papel
 * do dock de um celular: os favoritos que não exigem abrir a grade inteira.
 *
 * Some quando um app está em primeiro plano porque o header dele (com o
 * botão Voltar) já assume o papel de navegação — ver MobileShell.
 */
const Dock = () => {
  const { open } = useWindows()
  const { language } = useLanguage()
  const os = getOsData(language)
  const apps = APPS.filter((a) => a.inDock)

  return (
    <nav className="marocos-mobile-dock" aria-label={os.mobile.dock.label}>
      {apps.map((app) => {
        const Icon = app.icon
        const title = app.titleKey ? os.windows[app.titleKey] : ''

        return (
          <button
            key={app.id}
            type="button"
            className="marocos-mobile-dock-btn"
            onClick={() => open(app.id)}
            aria-label={title}
            title={title}
          >
            <Icon size={22} strokeWidth={1.9} />
          </button>
        )
      })}
    </nav>
  )
}

export default Dock
