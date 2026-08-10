import React, { useEffect, useRef, useMemo } from 'react'
import { motion } from 'motion/react'
import Hills from '../../wallpapers/Hills'
import Window from './Window'
import ContextMenu from './ContextMenu'
import { APPS } from '../registry'
import { useWindows } from '../WindowManagerContext'
import { useDeviceMode } from '../useDeviceMode'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../data/os'
import { getProfileData } from '../../data/content'
import { MOVIMENTO } from '../../config/system'
import './Desktop.css'

const Desktop = ({ isAnimated = true }) => {
  const { windows, open, minimizeAll } = useWindows()
  const { language } = useLanguage()
  const isDesktop = useDeviceMode() === 'desktop'
  const os = getOsData(language)
  const profile = getProfileData(language)

  const icons = APPS.filter((a) => a.onDesktop)



  // O menu de contexto escuta no proprio desktop; ele so intercepta o clique
  // quando o alvo nao e janela, link nem campo de texto, para o menu nativo
  // continuar disponivel sobre conteudo (copiar e-mail, por exemplo).
  const desktopRef = useRef(null)

  const itensDoMenu = useMemo(
    () => [
      { id: 'refresh', label: os.contextMenu.refresh, onSelect: () => window.location.reload() },
      { id: 'wallpaper', label: os.contextMenu.wallpaper, onSelect: () => open('settings') },
      { id: 'arrange', label: os.contextMenu.arrange, onSelect: () => minimizeAll() },
    ],
    [os.contextMenu, open, minimizeAll],
  )

  /**
   * PERFORMANCE: pré-carrega o chunk 3D quando a máquina estiver ociosa.
   *
   * O AboutApp importa Crystal por React.lazy, o que mantém three/fiber/
   * drei fora do bundle inicial — bom para a primeira pintura. O efeito
   * colateral era um travão de segundos no CLIQUE, porque o download e o parse
   * dessas libs aconteciam no meio da interação. Buscando o chunk em idle, a
   * carga inicial segue leve e o clique encontra o código já pronto.
   *
   * Só no desktop: o cristal 3D não é montado no mobile.
   */
  useEffect(() => {
    if (!isDesktop) return

    let cancelado = false
    const buscar = () => {
      if (!cancelado) import('../../components/Crystal')
    }

    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(buscar, { timeout: 4000 })
      return () => {
        cancelado = true
        window.cancelIdleCallback(id)
      }
    }

    const id = setTimeout(buscar, 2500)
    return () => {
      cancelado = true
      clearTimeout(id)
    }
  }, [isDesktop])

  return (
    <div className="marocos-desktop" ref={desktopRef}>
      <ContextMenu targetRef={desktopRef} items={itensDoMenu} />
      <Hills isAnimated={isAnimated} />

      {/* Assinatura: é aqui que vive o <h1> da página. A Hero deixou de
          existir, e sem isto o site perde o cabeçalho principal. */}
      <div className="marocos-signature">
        <h1>Marcos Rodrigues</h1>
        <p>{os.signature.role}</p>
        <span className="marocos-signature-bio">{profile.bio_highlight}</span>
      </div>

      <ul className="marocos-icons">
        {icons.map((app, i) => {
          const Icon = app.icon
          return (
            <motion.li
              key={app.id}
              initial={{ opacity: 0, y: MOVIMENTO.iconesDesktop.deslocamentoY }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: MOVIMENTO.iconesDesktop.delayPorItem * i,
                duration: MOVIMENTO.iconesDesktop.duration,
              }}
            >
              {/* Clique único abre: desvio deliberado da metáfora, porque
                  estes ícones são a navegação principal do site. */}
              <button type="button" onClick={() => open(app.id)}>
                <span className="marocos-icon-tile">
                  <Icon size={26} strokeWidth={1.75} />
                </span>
                <span className="marocos-icon-label">{os.windows[app.titleKey]}</span>
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
