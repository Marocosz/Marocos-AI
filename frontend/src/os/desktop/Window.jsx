import React, { useRef, useEffect, useState, Suspense } from 'react'
import { motion, useMotionValue, useDragControls, useReducedMotion, animate } from 'motion/react'
import { Minus, Square, X } from 'lucide-react'
import { useWindowActions } from '../WindowManagerContext'
import { useViewport } from '../hooks/useViewport'
import { getApp } from '../registry'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../i18n/os'
import { JANELAS, MOVIMENTO } from '../../config/system'
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

  // Abrir move o foco para dentro da janela, senão o teclado continua preso
  // onde estava e a janela nova é invisível para leitor de tela.
  useEffect(() => {
    ref.current?.focus()
  }, [])

  /**
   * O limite de arrasto ACOMPANHA a janela do navegador — sem isso, ao
   * redimensionar o navegador dava para arrastar a janela para fora do quadro.
   *
   * A assinatura é compartilhada de propósito: cada janela tinha o seu listener
   * de `resize`, e N janelas abertas viravam N listeners e N re-renders por
   * evento. O porquê inteiro está em `hooks/useViewport.js`.
   *
   * Desde a animação de maximizar ele tem um segundo consumidor: é daqui que
   * sai o TAMANHO da janela maximizada, que antes era `width: 100vw` no CSS.
   */
  const viewport = useViewport()

  /**
   * A GEOMETRIA DA MAXIMIZADA MORA AQUI, NÃO NO CSS — e a razão é mecânica.
   *
   * `.marocos-window.maximized` fazia `inset: 0 0 var(--taskbar-h) 0` com
   * `width: 100vw !important` e `height: auto !important`. Não há como animar
   * isso: `!important` no CSS vence estilo inline, e estilo inline é exatamente
   * como o motion escreve cada quadro. Enquanto a regra existia, qualquer
   * animação de largura era silenciosamente descartada.
   *
   * Então o CSS ficou só com o que é aparência (sem borda, sem raio, sem
   * sombra, fundo opaco, sem blur) e a geometria virou alvo em JS. O
   * `- alturaTaskbar` é o mesmo 52px que o `bottom` do CSS usava, e há teste
   * garantindo que ele bate com VIDRO.alturaTaskbar.
   */
  const tamanhoPadrao = app?.defaultSize
  const alvoX = win.maximized ? 0 : win.x
  const alvoY = win.maximized ? 0 : win.y
  const alvoLargura = win.maximized ? viewport.w : tamanhoPadrao?.w
  const alvoAltura = win.maximized ? viewport.h - JANELAS.alturaTaskbar : tamanhoPadrao?.h

  // Geometria vive em motion values, não em `animate`: durante o gesto o drag
  // é dono de x/y (sem re-render), e fora do gesto o efeito abaixo devolve o
  // controle ao estado. Sem isto, desmaximizar joga a janela no canto.
  const x = useMotionValue(alvoX)
  const y = useMotionValue(alvoY)
  const largura = useMotionValue(alvoLargura)
  const altura = useMotionValue(alvoAltura)

  const prefereMovimentoReduzido = useReducedMotion()
  const duracao = prefereMovimentoReduzido
    ? MOVIMENTO.maximizarJanela.duracaoReduzida
    : MOVIMENTO.maximizarJanela.duration

  /**
   * SÓ A TROCA DE MAXIMIZADA ANIMA. As outras duas coisas que mexem nestes
   * quatro valores têm de ser instantâneas:
   *
   *   arrasto            `win.x`/`win.y` só mudam no fim do gesto, e a essa
   *                      altura os motion values já estão lá — animar aqui
   *                      criaria um solavanco ao soltar.
   *   resize do navegador  animar largura enquanto o usuário arrasta a borda
   *                      da janela do navegador faz a maximizada perseguir o
   *                      cursor com atraso.
   *
   * O ref compara o valor anterior porque o efeito roda para os três casos, e
   * o React não diz qual dependência disparou. Ele também é o que impede
   * animação na montagem: iniciado com o valor atual, a primeira execução nunca
   * detecta troca.
   */
  const eraMaximizada = useRef(win.maximized)

  /**
   * O VIDRO SAI ENQUANTO A GEOMETRIA ANDA — e isto foi medido, não suposto.
   *
   * Maximizar já era barato de graça: a classe `.maximized` entra no primeiro
   * quadro e ela desliga o backdrop-filter, então a animação inteira corre sem
   * blur. Restaurar fazia o oposto — a classe sai no primeiro quadro, o blur
   * volta imediatamente, e os 220ms seguintes pagam um passe de filtro por
   * quadro sobre uma janela que está mudando de tamanho.
   *
   * Medido em Chromium com SwiftShader (software, pior caso), na janela
   * leia-me.txt, que é texto puro:
   *
   *   maximizar  mediana 16,7ms (60fps)   pior 50,0ms
   *   restaurar  mediana 50,0ms (20fps)   pior 83,3ms
   *
   * Mesma janela, mesma distância, mesma duração: 3x pior só por causa do blur.
   * Daí esta classe transitória, que tira o vidro nas DUAS direções durante o
   * movimento e o devolve quando assenta. O fundo continua translúcido, então o
   * que se vê é o vidro perdendo o fosco enquanto se move — que é, aliás, o que
   * o próprio Windows faz com acrylic ao arrastar e redimensionar janela.
   */
  const [animandoGeometria, setAnimandoGeometria] = useState(false)

  useEffect(() => {
    const pares = [
      [x, alvoX],
      [y, alvoY],
      [largura, alvoLargura],
      [altura, alvoAltura],
    ].filter(([, valor]) => valor != null)

    const alternou = eraMaximizada.current !== win.maximized
    eraMaximizada.current = win.maximized

    if (!alternou || duracao === 0) {
      pares.forEach(([mv, valor]) => mv.set(valor))
      return
    }

    setAnimandoGeometria(true)
    const controles = pares.map(([mv, valor]) =>
      animate(mv, valor, { duration: duracao, ease: MOVIMENTO.maximizarJanela.ease }),
    )

    let cancelado = false
    Promise.all(controles.map((c) => c.finished))
      .then(() => !cancelado && setAnimandoGeometria(false))
      // Animação interrompida rejeita a promessa; o cleanup já cuidou do estado.
      .catch(() => {})

    return () => {
      cancelado = true
      controles.forEach((c) => c.stop())
      setAnimandoGeometria(false)
    }
  }, [win.maximized, alvoX, alvoY, alvoLargura, alvoAltura, duracao, x, y, largura, altura])

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      close(win.key)
    }
  }

  return (
    <motion.div
      ref={ref}
      className={`marocos-window${win.maximized ? ' maximized' : ''}${isFocused ? ' focused' : ''}${animandoGeometria ? ' animando' : ''}`}
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
        width: largura,
        height: altura,
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
        {/* fallback nulo de propósito: com o prefetch em ociosidade o chunk já
            chegou, e um spinner que pisca por 20ms é pior que nada. */}
        {AppComponent ? (
          <Suspense fallback={null}>
            <AppComponent params={win.params} />
          </Suspense>
        ) : null}
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

/**
 * O `memo` só economiza render porque o reducer coopera: os `map` de
 * `os/windowManager.js` devolvem o MESMO objeto para as janelas não afetadas
 * (ver o "contrato de identidade" lá), então `win` só muda de referência para
 * quem realmente mudou. Se aquele arquivo passar a clonar todas as janelas em
 * toda ação, esta linha continua compilando, continua verde em todo teste, e
 * para de economizar qualquer coisa.
 */
export default React.memo(Window)
