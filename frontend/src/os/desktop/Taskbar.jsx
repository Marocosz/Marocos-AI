import React, { useState } from 'react'
import { motion } from 'motion/react'
import { LayoutGrid, Wifi, Volume2, BatteryMedium } from 'lucide-react'
import { useWindows } from '../WindowManagerContext'
import { getApp } from '../registry'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../data/os'
import { MOVIMENTO } from '../../config/system'
import { useSystemToggles } from '../../ui/useSystemToggles'
import Clock from '../../ui/Clock'
import StartMenu from './StartMenu'
import './Taskbar.css'

/**
 * TASKBAR DO MAROCOS OS
 * --------------------------------------------------
 * Continuação direta da Navbar que o projeto já tinha: mesma altura de 52px,
 * mesmo material mica, mesmos tooltips com delay, mesmo system tray à direita
 * e os mesmos overrides de tema claro. O CSS é o Navbar.css preservado.
 *
 * O que muda em relação à versão anterior:
 *   1. Ancorada à esquerda (era centralizada), porque agora existem botões de
 *      janela que entram e saem — num grupo centralizado cada janela nova
 *      empurraria todos os outros alvos de navegação de lugar.
 *   2. Os ícones de seção deram lugar a botões de janela aberta, já que a
 *      navegação passou a ser por janela e não por scroll de seção.
 */
const Taskbar = ({ onShutdown }) => {
  const { windows, focusedKey, focus, minimize, minimizeAll, open } = useWindows()
  const { language } = useLanguage()
  const os = getOsData(language)
  const [temaToggle, idiomaToggle, animacaoToggle] = useSystemToggles()
  const TemaIcon = temaToggle.icon
  const AnimacaoIcon = animacaoToggle.icon
  // O botão de idioma do desktop mostra o idioma que SERÁ ativado ao clicar
  // (o oposto do atual) -- diferente do popup mobile e do QuickSettings, que
  // mostram o idioma atual (`idiomaToggle.valorCurto`). É a UX que já existia,
  // não unificar.
  const idiomaAlvo = idiomaToggle.valorCurto === 'PT' ? 'EN' : 'BR'

  const [isStartOpen, setIsStartOpen] = useState(false)

  const alternarIniciar = () => {
    setIsStartOpen((v) => !v)
  }

  return (
    <>
      <StartMenu
        isOpen={isStartOpen}
        onClose={() => setIsStartOpen(false)}
        onLaunch={(appId) => open(appId)}
        onSubmitSearch={() => open('assistant')}
        onShutdown={onShutdown}
      />

      <motion.div
        className="taskbar-container"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={MOVIMENTO.taskbarEntrada}
      >
        {/* --- ESQUERDA: Iniciar + janelas abertas --- */}
        <div className="taskbar-center">
          <div className="taskbar-icon-wrapper">
            <div className="taskbar-tooltip">{os.taskbar.start}</div>
            <button
              className={`taskbar-btn${isStartOpen ? ' active' : ''}`}
              aria-label={os.taskbar.start}
              aria-expanded={isStartOpen}
              onClick={alternarIniciar}
            >
              <LayoutGrid size={22} strokeWidth={isStartOpen ? 2.5 : 2} />
            </button>
          </div>

          <div className="tray-divider" />

          <ul className="taskbar-windows">
            {windows.map((win) => {
              const app = getApp(win.appId)
              const Icon = app?.icon
              const title = app?.titleKey ? os.windows[app.titleKey] : win.params?.slug || ''
              const isFocused = focusedKey === win.key

              return (
                <li key={win.key}>
                  {/* Clicar no botão da janela em foco minimiza — comportamento Windows. */}
                  <button
                    className={`taskbar-btn taskbar-window-btn${isFocused ? ' active' : ''}${win.minimized ? ' minimized' : ''}`}
                    onClick={() => (isFocused ? minimize(win.key) : focus(win.key))}
                    title={title}
                  >
                    {Icon ? <Icon size={18} strokeWidth={isFocused ? 2.5 : 2} /> : null}
                    <span className="taskbar-window-label">{title}</span>

                    {isFocused && (
                      <motion.div
                        layoutId="taskbar-indicator"
                        className="app-indicator"
                        transition={MOVIMENTO.indicadorTaskbar}
                      />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* --- DIREITA: System Tray (preservado do design original) --- */}
        <div className="taskbar-right">
          <button onClick={temaToggle.alternar} className="theme-toggle-btn" aria-label={temaToggle.labelCurto}>
            <TemaIcon size={18} />
          </button>

          <button onClick={animacaoToggle.alternar} className="theme-toggle-btn" aria-label={animacaoToggle.labelCurto}>
            <AnimacaoIcon size={18} />
          </button>

          <button onClick={idiomaToggle.alternar} className="theme-toggle-btn" aria-label={idiomaToggle.labelCurto}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
              {idiomaAlvo}
            </span>
          </button>

          <div className="tray-divider" />

          <div className="tray-icons">
            <div className="tray-icon-hover"><Wifi size={16} /></div>
            <div className="tray-icon-hover"><Volume2 size={16} /></div>
            <div className="tray-icon-hover"><BatteryMedium size={16} /></div>
          </div>

          <div className="tray-clock">
            {/* MUDANÇA DE COMPORTAMENTO CONSCIENTE: antes tiquetaqueava a
                cada 1s (setInterval na montagem, sem alinhamento). Nunca
                mostrou segundos, então a tela é idêntica — o que muda é
                que agora acerta a virada do minuto, que antes errava por
                até 59s. Ver comentário em src/ui/Clock.jsx. */}
            <Clock formato="hm-data" classePrincipal="time" classeSecundaria="date" />
          </div>

          <div
            className="show-desktop-line"
            onClick={minimizeAll}
            title={os.taskbar.showDesktop}
            role="button"
            tabIndex={0}
            aria-label={os.taskbar.showDesktop}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                minimizeAll()
              } else if (e.key === ' ') {
                // Sem isto o Espaço rola a página -- comportamento padrão
                // do navegador para elementos sem role nativo de botão.
                e.preventDefault()
                minimizeAll()
              }
            }}
          />
        </div>
      </motion.div>
    </>
  )
}

export default Taskbar
