import React, { useState, useEffect } from 'react'
import { LayoutGrid, Wifi, Volume2, BatteryMedium } from 'lucide-react'
import { useWindows } from '../WindowManagerContext'
import { getApp } from '../registry'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../data/os'
import './Taskbar.css'

const Taskbar = () => {
  const { windows, focusedKey, focus, minimize, minimizeAll } = useWindows()
  const { language } = useLanguage()
  const os = getOsData(language)

  return (
    <div className="noiseos-taskbar">
      <button type="button" className="noiseos-start" aria-label={os.taskbar.start}>
        <LayoutGrid size={20} />
      </button>

      <div className="noiseos-taskbar-divider" />

      <ul className="noiseos-taskbar-windows">
        {windows.map((win) => {
          const app = getApp(win.appId)
          const Icon = app?.icon
          const title = app?.titleKey ? os.windows[app.titleKey] : win.params?.slug || ''
          const isFocused = focusedKey === win.key

          return (
            <li key={win.key}>
              {/* Clicar no botão da janela em foco minimiza — comportamento
                  Windows, e é o que faz a barra parecer viva. */}
              <button
                type="button"
                className={`${isFocused ? 'focused' : ''}${win.minimized ? ' minimized' : ''}`}
                onClick={() => (isFocused ? minimize(win.key) : focus(win.key))}
                title={title}
              >
                {Icon ? <Icon size={16} /> : null}
                <span>{title}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="noiseos-taskbar-right">
        <div className="noiseos-tray" aria-hidden="true">
          <Wifi size={15} />
          <Volume2 size={15} />
          <BatteryMedium size={15} />
        </div>
        <Clock />
        <button
          type="button"
          className="noiseos-show-desktop"
          aria-label={os.taskbar.showDesktop}
          onClick={minimizeAll}
        />
      </div>
    </div>
  )
}

/** Isolado em memo para o tick de 1s não re-renderizar a taskbar toda. */
const Clock = React.memo(function Clock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="noiseos-clock">
      <span>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      <span>{now.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
    </div>
  )
})

export default Taskbar
