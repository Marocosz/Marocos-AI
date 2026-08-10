import React, { useRef, useEffect, useState } from 'react'
import { motion, useMotionValue, useDragControls } from 'motion/react'
import { Minus, Square, X } from 'lucide-react'
import { useWindowActions } from '../WindowManagerContext'
import { getApp } from '../registry'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../data/os'
import { JANELAS } from '../../config/system'
import './Window.css'

/**
 * `isFocused` vem por prop, e não do contexto: assim uma troca de foco
 * re-renderiza apenas as duas janelas cujo estado de foco realmente mudou, em
 * vez de todas. Com o React.memo abaixo, as demais nem entram no render.
 */
const Window = ({ win, isFocused }) => {
  const { focus, close, minimize, toggleMaximize, move } = useWindowActions()
  const { language } = useLanguage()
  const os = getOsData(language)
  const app = getApp(win.appId)
  const ref = useRef(null)
  const dragControls = useDragControls()

  const title = app?.titleKey ? os.windows[app.titleKey] : win.params?.slug || ''
  const AppComponent = app?.component

  // Posição vive em motion values, não em `animate`: durante o gesto o drag
  // é dono deles (sem re-render), e fora do gesto o efeito abaixo devolve o
  // controle ao estado. Sem isto, desmaximizar joga a janela no canto.
  const x = useMotionValue(win.x)
  const y = useMotionValue(win.y)

  useEffect(() => {
    if (win.maximized) {
      x.set(0)
      y.set(0)
    } else {
      x.set(win.x)
      y.set(win.y)
    }
  }, [win.x, win.y, win.maximized, x, y])

  // Abrir move o foco para dentro da janela, senão o teclado continua preso
  // onde estava e a janela nova é invisível para leitor de tela.
  useEffect(() => {
    ref.current?.focus()
  }, [])

  /**
   * O limite de arrasto acompanha a janela do navegador. Lendo `window.innerWidth`
   * direto no render, o valor congelava no primeiro render e redimensionar
   * deixava arrastar a janela para fora do quadro.
   */
  const [viewport, setViewport] = useState(() => ({
    w: typeof window === 'undefined' ? 0 : window.innerWidth,
    h: typeof window === 'undefined' ? 0 : window.innerHeight,
  }))

  useEffect(() => {
    const aoRedimensionar = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', aoRedimensionar)
    return () => window.removeEventListener('resize', aoRedimensionar)
  }, [])

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      close(win.key)
    }
  }

  return (
    <motion.div
      ref={ref}
      className={`marocos-window${win.maximized ? ' maximized' : ''}${isFocused ? ' focused' : ''}`}
      role="dialog"
      aria-labelledby={`win-title-${win.key}`}
      tabIndex={-1}
      inert={win.minimized}
      onKeyDown={onKeyDown}
      onPointerDownCapture={() => !isFocused && focus(win.key)}
      style={{
        x,
        y,
        zIndex: win.z,
        width: win.maximized ? undefined : app?.defaultSize.w,
        height: win.maximized ? undefined : app?.defaultSize.h,
        display: win.minimized ? 'none' : undefined,
      }}
      /* Só opacidade na abertura. Animar `scale` numa janela grande obrigava o
         navegador a recompor a cada passo (e, quando havia backdrop-filter,
         refazer o blur inteiro), o que travava a abertura. Fade é barato. */
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: JANELAS.aberturaMs / 1000, ease: 'linear' }}
      drag={!win.maximized}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{
        left: 0,
        top: 0,
        right: Math.max(0, viewport.w - JANELAS.folgaArrastoX),
        bottom: Math.max(0, viewport.h - JANELAS.folgaArrastoY),
      }}
      // MOVE só no fim do gesto: despachar a cada pointermove re-renderizaria
      // a árvore inteira de janelas a 60fps.
      onDragEnd={() => move(win.key, x.get(), y.get())}
    >
      <TitleBar
        title={title}
        titleId={`win-title-${win.key}`}
        Icon={app?.icon}
        maximized={win.maximized}
        labels={os.controls}
        onDragStart={(e) => dragControls.start(e)}
        onMinimize={() => minimize(win.key)}
        onToggleMaximize={() => toggleMaximize(win.key)}
        onClose={() => close(win.key)}
      />

      <div className="marocos-window-body">
        {AppComponent ? <AppComponent params={win.params} /> : null}
      </div>
    </motion.div>
  )
}

/**
 * Barra de título. Separada porque é ela que inicia o arrasto — o corpo da
 * janela precisa continuar selecionável e scrollável.
 */
const TitleBar = ({
  title, titleId, Icon, maximized, labels, onDragStart,
  onMinimize, onToggleMaximize, onClose,
}) => (
  <div className="marocos-titlebar" onPointerDown={onDragStart}>
    <div className="marocos-titlebar-label">
      {Icon ? <Icon size={15} strokeWidth={2} /> : null}
      <span id={titleId}>{title}</span>
    </div>

    <div className="marocos-titlebar-controls">
      <button type="button" aria-label={labels.minimize} onClick={onMinimize}>
        <Minus size={14} />
      </button>
      <button
        type="button"
        aria-label={maximized ? labels.restore : labels.maximize}
        onClick={onToggleMaximize}
      >
        <Square size={12} />
      </button>
      <button type="button" aria-label={labels.close} className="close" onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  </div>
)

export default React.memo(Window)
