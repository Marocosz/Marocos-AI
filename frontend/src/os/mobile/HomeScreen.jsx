import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Signal, BatteryFull } from 'lucide-react'
import { useWindows } from '../WindowManagerContext'
import { APPS } from '../registry'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../data/os'

/**
 * TELA INICIAL (springboard)
 * --------------------------------------------------
 * Substitui a metáfora de desktop por uma de home screen de celular: grade
 * fixa de 3 colunas sobre o wallpaper, sem janela nenhuma. Mesma fonte de
 * apps do desktop (`APPS.filter(onDesktop)`), só que o toque abre em tela
 * cheia em vez de numa janela flutuante.
 *
 * A barra de status no topo é o gatilho do QuickSettings: toque ou arrasto
 * para baixo abrem o painel (a barra em si não sabe renderizá-lo — só avisa
 * o MobileShell via `onOpenQuickSettings`).
 */
const HomeScreen = ({ onOpenQuickSettings }) => {
  const { open } = useWindows()
  const { language } = useLanguage()
  const os = getOsData(language)
  const icons = APPS.filter((a) => a.onDesktop)

  // Minuto a minuto basta: é só um relógio de status bar, não uma contagem
  // de segundos como o relógio da taskbar do desktop.
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="marocos-mobile-home">
      <motion.div
        className="marocos-mobile-statusbar"
        role="button"
        tabIndex={0}
        aria-label={os.mobile.quickSettings.open}
        onClick={onOpenQuickSettings}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onOpenQuickSettings()
        }}
        // Arrastar a barra de status para baixo é o gesto de "puxar" o painel,
        // igual ao centro de notificações de um celular de verdade.
        onPanEnd={(_e, info) => {
          if (info.offset.y > 20) onOpenQuickSettings()
        }}
      >
        <span className="marocos-mobile-clock">
          {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="marocos-mobile-statusicons" aria-hidden="true">
          <Signal size={14} strokeWidth={2.2} />
          <BatteryFull size={17} strokeWidth={2.2} />
        </span>
      </motion.div>

      <ul className="marocos-mobile-grid">
        {icons.map((app, i) => {
          const Icon = app.icon
          return (
            <motion.li
              key={app.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i, duration: 0.25 }}
            >
              <button type="button" onClick={() => open(app.id)}>
                <span className="marocos-mobile-tile">
                  <Icon size={26} strokeWidth={1.75} />
                </span>
                <span className="marocos-mobile-label">{os.windows[app.titleKey]}</span>
              </button>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}

export default HomeScreen
