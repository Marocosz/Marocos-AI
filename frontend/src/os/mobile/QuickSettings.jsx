import React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { X } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../data/os'
import { MOVIMENTO } from '../../config/system'
import { useSystemToggles } from '../../ui/useSystemToggles'
import ToggleRow from '../../ui/ToggleRow'

/**
 * PAINEL DE AJUSTES RÁPIDOS
 * --------------------------------------------------
 * Equivalente mobile do popup de tray do desktop (Taskbar.jsx): os mesmos
 * três controles — tema, idioma, movimento — só que descendo do topo em vez
 * de subir do rodapé, porque quem o invoca é a barra de status.
 *
 * Os três toggles vêm de `useSystemToggles`, que já reaproveita as chaves de
 * i18n que existiam para esses controles (`os.tray.*` para os rótulos e
 * `os.settings.*` para os valores) em vez de duplicá-las.
 */
const QuickSettings = ({ open, onClose }) => {
  const { language } = useLanguage()
  const os = getOsData(language)
  const toggles = useSystemToggles()
  const prefersReducedMotion = useReducedMotion()

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
              {toggles.map((l) => (
                <li key={l.id}>
                  <ToggleRow linha={l} className="toggle-row--quick" />
                </li>
              ))}
            </ul>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  )
}

export default QuickSettings
