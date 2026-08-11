import React from 'react'
import { Sparkles } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { getOsData } from '../i18n/os'
import { useSystemToggles } from '../ui/useSystemToggles'
import ToggleRow from '../ui/ToggleRow'
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
  const { language } = useLanguage()
  const os = getOsData(language)
  const toggles = useSystemToggles()

  return (
    <div className="settings-app">
      <p className="settings-intro">{os.settings.intro}</p>

      <ul className="settings-list">
        {toggles.map((l) => (
          <ToggleRow key={l.id} linha={l} mostrarHint alvo="valor" className="toggle-row--settings" />
        ))}
      </ul>

      <p className="settings-footer">
        <Sparkles size={13} />
        {os.settings.persistNote}
      </p>
    </div>
  )
}

export default SettingsApp
