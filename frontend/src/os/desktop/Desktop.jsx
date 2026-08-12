import React, { useRef, useMemo } from 'react'
import { motion } from 'motion/react'
import Wallpaper from '../../wallpaper/Wallpaper'
import Window from './Window'
import ContextMenu from './ContextMenu'
import AvisosDesktop from './AvisosDesktop'
import AppIconButton from '../../ui/AppIconButton'
import { APPS } from '../registry'
import { useWindows } from '../WindowManagerContext'
import { useDeviceMode } from '../useDeviceMode'
import { useIdleTask } from '../hooks/useIdleTask'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../i18n/os'
import { MOVIMENTO, CERIMONIA } from '../../config/system'
import './Desktop.css'

const Desktop = ({ isAnimated = true }) => {
  const { windows, focusedKey, open, minimizeAll } = useWindows()
  const { language } = useLanguage()
  const isDesktop = useDeviceMode() === 'desktop'
  const os = getOsData(language)

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
  useIdleTask(() => import('../../brand/Crystal'), {
    ...CERIMONIA.idle.prefetchCristal,
    ativo: isDesktop,
  })

  return (
    <div className="marocos-desktop" ref={desktopRef}>
      <ContextMenu targetRef={desktopRef} items={itensDoMenu} />
      <Wallpaper isAnimated={isAnimated} />

      {/* Assinatura: é aqui que vive o <h1> da página. A Hero deixou de
          existir, e sem isto o site perde o cabeçalho principal.

          A FRASE DE BIO SAIU DAQUI, por decisão do dono do projeto. Ela continua
          existindo — é a linha de identidade no topo do guia, em "Sobre este PC"
          — mas na área de trabalho competia com os ícones e com o papel de
          parede por uma atenção que o nome e o cargo já resolvem. Um sistema
          operacional não escreve a bio do dono na tela inicial. */}
      <div className="marocos-signature">
        <h1>Marcos Rodrigues</h1>
        <p>{os.signature.role}</p>
      </div>

      <ul className="marocos-icons">
        {icons.map((app, i) => (
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
            {/* Legenda curta quando existe; título da janela quando não —
                ver o porquê no bloco `iconLabels` de i18n/os.js. */}
            <AppIconButton
              app={app}
              titulo={os.iconLabels[app.titleKey] ?? os.windows[app.titleKey]}
              variante="tile"
              tamanho="desktop"
              onClick={() => open(app.id)}
            />
          </motion.li>
        ))}
      </ul>

      {windows.map((win) => (
        <Window key={win.key} win={win} isFocused={win.key === focusedKey} />
      ))}

      {/* Depois das janelas, para ficar por cima delas na ordem do DOM sem
          precisar de um z-index novo — a escala de tokens.css é fonte única e
          estes avisos dividem a faixa da taskbar com ela. */}
      <AvisosDesktop />
    </div>
  )
}

export default Desktop
