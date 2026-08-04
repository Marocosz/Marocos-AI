import React from 'react'
import { motion } from 'motion/react'
import Hills from '../../wallpapers/Hills'
import Window from './Window'
import { APPS } from '../registry'
import { useWindows } from '../WindowManagerContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../data/os'
import { getProfileData } from '../../data/content'
import './Desktop.css'

const Desktop = ({ isAnimated = true }) => {
  const { windows, open } = useWindows()
  const { language } = useLanguage()
  const os = getOsData(language)
  const profile = getProfileData(language)

  const icons = APPS.filter((a) => a.onDesktop)

  return (
    <div className="noiseos-desktop">
      <Hills isAnimated={isAnimated} />

      {/* Assinatura: é aqui que vive o <h1> da página. A Hero deixou de
          existir, e sem isto o site perde o cabeçalho principal. */}
      <div className="noiseos-signature">
        <h1>Marcos Rodrigues</h1>
        <p>{os.signature.role}</p>
        <span className="noiseos-signature-bio">{profile.bio_highlight}</span>
      </div>

      <ul className="noiseos-icons">
        {icons.map((app, i) => {
          const Icon = app.icon
          return (
            <motion.li
              key={app.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
            >
              {/* Clique único abre: desvio deliberado da metáfora, porque
                  estes ícones são a navegação principal do site. */}
              <button type="button" onClick={() => open(app.id)}>
                <span className="noiseos-icon-tile">
                  <Icon size={26} strokeWidth={1.75} />
                </span>
                <span className="noiseos-icon-label">{os.windows[app.titleKey]}</span>
              </button>
            </motion.li>
          )
        })}
      </ul>

      {windows.map((win) => (
        <Window key={win.key} win={win} />
      ))}
    </div>
  )
}

export default Desktop
