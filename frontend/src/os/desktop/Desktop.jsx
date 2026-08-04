import React, { useEffect } from 'react'
import { motion } from 'motion/react'
import Hills from '../../wallpapers/Hills'
import Window from './Window'
import { APPS } from '../registry'
import { useWindows } from '../WindowManagerContext'
import { useDeviceMode } from '../useDeviceMode'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../data/os'
import { getProfileData } from '../../data/content'
import './Desktop.css'

const Desktop = ({ isAnimated = true }) => {
  const { windows, open } = useWindows()
  const { language } = useLanguage()
  const isDesktop = useDeviceMode() === 'desktop'
  const os = getOsData(language)
  const profile = getProfileData(language)

  const icons = APPS.filter((a) => a.onDesktop)

  /**
   * PERFORMANCE: o wallpaper para de animar enquanto houver janela visível.
   *
   * Duas contas caem juntas com isso. O shader deixa de renderizar (o Silk
   * respeita `isAnimated` via frameloop), e — mais importante — o
   * backdrop-filter das janelas passa a ter um fundo ESTÁTICO atrás: sem
   * conteúdo mudando, o navegador não precisa refazer o blur a cada frame, que
   * era o custo dominante ao mover e abrir janelas.
   *
   * O movimento volta sozinho quando a última janela fecha ou é minimizada.
   * Perde-se pouco: quando há janela aberta o visitante está lendo conteúdo,
   * não admirando o papel de parede.
   */
  const temJanelaVisivel = windows.some((w) => !w.minimized)
  const wallpaperAnimado = isAnimated && !temJanelaVisivel

  /**
   * PERFORMANCE: pré-carrega o chunk 3D quando a máquina estiver ociosa.
   *
   * O AboutApp importa CrystalScene por React.lazy, o que mantém three/fiber/
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
      if (!cancelado) import('../../components/sections/CrystalScene')
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
    <div className="noiseos-desktop">
      <Hills isAnimated={wallpaperAnimado} />

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
