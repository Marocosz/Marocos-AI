import React from 'react'
import { Sun, Moon, Play, Pause, Languages, Sparkles } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import { getOsData } from '../data/os'
import './SettingsApp.css'

/**
 * CONFIGURAÇÕES DO MAROCOS OS
 * --------------------------------------------------
 * Casa definitiva dos três controles que antes viviam só na bandeja: tema,
 * idioma e animação. Eles continuam na taskbar como atalho rápido — o que
 * muda é que agora existe um lugar onde dá para ler o que cada um faz.
 *
 * Não sabe que janelas existem: o <Window> é quem envolve.
 */
const SettingsApp = () => {
  const { language, toggleLanguage } = useLanguage()
  const { isDark, isAnimated, toggleTheme, toggleAnimation } = useTheme()
  const os = getOsData(language)
  const t = os.settings

  const rows = [
    {
      id: 'theme',
      icon: isDark ? Moon : Sun,
      label: t.theme.label,
      hint: t.theme.hint,
      value: isDark ? t.theme.dark : t.theme.light,
      onToggle: toggleTheme,
    },
    {
      id: 'language',
      icon: Languages,
      label: t.language.label,
      hint: t.language.hint,
      value: language === 'pt' ? 'Português (BR)' : 'English (US)',
      onToggle: toggleLanguage,
    },
    {
      id: 'animation',
      icon: isAnimated ? Pause : Play,
      label: t.animation.label,
      hint: t.animation.hint,
      value: isAnimated ? t.animation.on : t.animation.off,
      onToggle: toggleAnimation,
    },
  ]

  return (
    <div className="settings-app">
      <p className="settings-intro">{t.intro}</p>

      <ul className="settings-list">
        {rows.map((row) => {
          const Icon = row.icon
          return (
            <li key={row.id} className="settings-row">
              <span className="settings-icon">
                <Icon size={18} strokeWidth={1.8} />
              </span>

              <span className="settings-text">
                <span className="settings-label">{row.label}</span>
                <span className="settings-hint">{row.hint}</span>
              </span>

              <button type="button" className="settings-value" onClick={row.onToggle}>
                {row.value}
              </button>
            </li>
          )
        })}
      </ul>

      <p className="settings-footer">
        <Sparkles size={13} />
        {t.persistNote}
      </p>
    </div>
  )
}

export default SettingsApp
