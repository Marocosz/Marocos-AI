import React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Sun, Moon, Play, Pause, Languages, X } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../data/os'
import { MOVIMENTO } from '../../config/system'

/**
 * PAINEL DE AJUSTES RÁPIDOS
 * --------------------------------------------------
 * Equivalente mobile do popup de tray do desktop (Taskbar.jsx): os mesmos
 * três controles — tema, idioma, movimento — só que descendo do topo em vez
 * de subir do rodapé, porque quem o invoca é a barra de status.
 *
 * Reaproveita as chaves de i18n que já existem para esses controles
 * (`os.tray.*` para os rótulos e `os.settings.*` para os valores), em vez de
 * duplicá-las: o painel mostra os mesmos três toggles, só muda o container.
 */
const QuickSettings = ({ open, onClose }) => {
  const { isDark, isAnimated, toggleTheme, toggleAnimation } = useTheme()
  const { language, toggleLanguage } = useLanguage()
  const os = getOsData(language)
  const prefersReducedMotion = useReducedMotion()

  const rows = [
    {
      id: 'theme',
      icon: isDark ? Moon : Sun,
      label: os.tray.theme,
      value: isDark ? os.settings.theme.dark : os.settings.theme.light,
      onToggle: toggleTheme,
    },
    {
      id: 'language',
      icon: Languages,
      label: os.tray.language,
      value: language === 'pt' ? 'PT' : 'EN',
      onToggle: toggleLanguage,
    },
    {
      id: 'animation',
      icon: isAnimated ? Pause : Play,
      label: os.tray.animation,
      value: isAnimated ? os.settings.animation.on : os.settings.animation.off,
      onToggle: toggleAnimation,
    },
  ]

  return (
    <AnimatePresence>
      {open && (
        <React.Fragment>
          <motion.div
            className="marocos-mobile-qs-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : MOVIMENTO.quickSettingsFundo.duration }}
            onClick={onClose}
          />

          <motion.div
            className="marocos-mobile-qs-panel"
            role="dialog"
            aria-label={os.mobile.quickSettings.title}
            initial={prefersReducedMotion ? { opacity: 0 } : { y: '-100%' }}
            animate={{ y: 0, opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { y: '-100%' }}
            transition={{
              duration: prefersReducedMotion
                ? MOVIMENTO.quickSettings.duracaoReduzida
                : MOVIMENTO.quickSettings.duration,
              ease: MOVIMENTO.quickSettings.ease,
            }}
            // Arrastar o painel para cima fecha, espelhando o gesto que o abre
            // na barra de status.
            onPanEnd={(_e, info) => {
              if (info.offset.y < -20) onClose()
            }}
          >
            <div className="marocos-mobile-qs-header">
              <span className="marocos-mobile-qs-title">{os.mobile.quickSettings.title}</span>
              <button
                type="button"
                className="marocos-mobile-qs-close"
                onClick={onClose}
                aria-label={os.controls.close}
              >
                <X size={18} />
              </button>
            </div>

            <ul className="marocos-mobile-qs-list">
              {rows.map((row) => {
                const Icon = row.icon
                return (
                  <li key={row.id}>
                    <button type="button" className="marocos-mobile-qs-row" onClick={row.onToggle}>
                      <Icon size={20} strokeWidth={1.8} />
                      <span className="marocos-mobile-qs-label">{row.label}</span>
                      <span className="marocos-mobile-qs-value">{row.value}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  )
}

export default QuickSettings
