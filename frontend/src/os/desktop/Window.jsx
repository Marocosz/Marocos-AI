import React, { useRef, useEffect, useState, useCallback, useMemo, Suspense } from 'react'
import { motion, useMotionValue, useDragControls, useReducedMotion, animate } from 'motion/react'
import { Minus, Square, X } from 'lucide-react'
import { useWindowActions } from '../WindowManagerContext'
import ExplorerChrome from './ExplorerChrome'
import { NavegacaoProvider } from '../NavegacaoContext'
import { useViewport } from '../hooks/useViewport'
import { tamanhoQueCabe, posicaoAlcancavel } from '../windowManager'
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
  const { focus, close, minimize, toggleMaximize, move, navigate, open } = useWindowActions()
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
  /**
   * O TAMANHO PASSA PELO FILTRO DA TELA ANTES DE VIRAR PIXEL.
   *
   * `defaultSize` é um desejo, não uma medida: numa tela baixa a janela nascia
   * com a altura cheia do registry e o excesso ia parar embaixo da barra de
   * tarefas. `tamanhoQueCabe` encolhe até caber; o porquê e as contas por app
   * estão em `os/windowManager.js`.
   *
   * É reativo de graça porque `useViewport()` já reavalia a cada `resize` —
   * então diminuir a janela do navegador reacomoda o que está aberto, em vez de
   * empurrar para fora do quadro. A posição passa por um filtro parecido, mas
   * com os limites do ARRASTO e não os do nascimento; o porquê está em
   * `posicaoAlcancavel`, e resumido é: apertar mais desfaria todo arrasto
   * legítimo no render seguinte.
   *
   * A maximizada não passa por aqui: ela já é calculada a partir da viewport.
   */
  const tamanhoPadrao = app?.defaultSize
  const tamanhoUtil = tamanhoQueCabe(tamanhoPadrao, viewport.w, viewport.h)
  const ancorada = posicaoAlcancavel(win.x, win.y, viewport.w, viewport.h)

  const alvoX = win.maximized ? 0 : ancorada.x
  const alvoY = win.maximized ? 0 : ancorada.y
  const alvoLargura = win.maximized ? viewport.w : tamanhoUtil?.w
  const alvoAltura = win.maximized ? viewport.h - JANELAS.alturaTaskbar : tamanhoUtil?.h

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
  const duracaoMinimizar = prefereMovimentoReduzido
    ? MOVIMENTO.minimizarJanela.duracaoReduzida
    : MOVIMENTO.minimizarJanela.duration

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

  /**
   * COMO O APP DENTRO DESTA JANELA NAVEGA. Com chrome de explorador, ir a um
   * destino é trocar o conteúdo desta janela; sem chrome, é abrir outra. O app
   * não decide — ver os/NavegacaoContext.jsx.
   *
   * O DESTINO TAMBÉM PRECISA TER CHROME, e não só a origem.
   *
   * Trocar o conteúdo por um app SEM chrome deixaria a janela sem a lateral e
   * sem o botão voltar — que é onde mora o único caminho de volta. O visitante
   * entraria no Terminal a partir do guia e ficaria preso lá, com a janela
   * ainda no tamanho de quem tinha lateral.
   *
   * Ninguém tinha esbarrado nisso porque até agora todo destino de navegação
   * (a lateral do explorador, o card de projeto) era um app com `explorer:
   * true`. O guia do "Sobre este PC" é o primeiro a apontar para fora desse
   * conjunto, e nesse caso abrir janela é a leitura certa: o Terminal não é um
   * lugar do explorador, é outra ferramenta.
   */
  /**
   * O CLIQUE QUE TRAZ A JANELA PARA A FRENTE NÃO CLICA EM NADA.
   *
   * Sem isto, ir de uma janela para outra ativa o que estiver embaixo do cursor
   * na chegada — um link externo abre uma aba, uma porta do guia navega, um card
   * de projeto troca o conteúdo. O visitante pediu foco e recebeu uma ação que
   * não escolheu, porque no instante do clique ele ainda estava lendo a OUTRA
   * janela.
   *
   * É o comportamento do macOS, e é o certo aqui: com várias janelas abertas
   * sobrepostas, trazer uma para a frente é uma intenção completa em si mesma.
   *
   * COMO: `pointerdown` decide, `click` executa. Quando o pointer desce numa
   * janela sem foco, marcamos a intenção e focamos; o `click` que vem em seguida
   * é engolido na fase de CAPTURA, antes de chegar a qualquer alvo. Não dá para
   * decidir no próprio `click`, porque a essa altura `isFocused` já virou true e
   * o clique pareceria comum.
   *
   * A marca é zerada em todo `pointerdown` de janela já focada — assim um gesto
   * que começa aqui e termina fora (arrastar para outro lugar e soltar, sem
   * `click` nenhum) não deixa a marca acesa para engolir o clique seguinte.
   *
   * A BARRA DE TÍTULO FICA DE FORA. Fechar, minimizar e maximizar continuam
   * respondendo de primeira, como em qualquer sistema — ver o `stopPropagation`
   * nos controles. Quem quer fechar uma janela de fundo não quer focá-la antes.
   */
  const engoliuCliqueRef = useRef(false)

  const aoApontar = useCallback((e) => {
    // A barra de título é a exceção: fechar ou minimizar uma janela de fundo é
    // uma intenção inequívoca, e exigir dois cliques para isso pareceria
    // travamento. É o que o macOS faz — os controles respondem sem foco.
    const naBarraDeTitulo = !!e.target?.closest?.('.marocos-titlebar')

    engoliuCliqueRef.current = !isFocused && !naBarraDeTitulo
    if (!isFocused) focus(win.key)
  }, [isFocused, focus, win.key])

  const aoClicar = useCallback((e) => {
    if (!engoliuCliqueRef.current) return
    engoliuCliqueRef.current = false
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const navegacao = useMemo(
    () => ({
      irPara: (appId, params = null) => {
        const destino = getApp(appId)
        if (app?.explorer && destino?.explorer) navigate(win.key, appId, params)
        else open(appId, params)
      },
      // Sempre janela nova, mesmo partindo de uma janela com chrome — é o que o
      // guia do "Sobre este PC" pede: ele fica aberto atrás do que abriu.
      abrir: (appId, params = null) => open(appId, params),
    }),
    [app?.explorer, navigate, open, win.key],
  )

  return (
    <motion.div
      ref={ref}
      className={`marocos-window${win.maximized ? ' maximized' : ''}${isFocused ? ' focused' : ''}${animandoGeometria ? ' animando' : ''}`}
      role="dialog"
      /* QUAL APP ESTÁ AQUI DENTRO, para o CSS.
         A janela é agnóstica de app por regra, mas alguns apps precisam mudar o
         CHROME e não só o próprio miolo — o Terminal é o caso: ele desliga o
         vidro da janela inteira, porque terminal com wallpaper aparecendo
         através não é terminal. Um atributo de dado mantém a decisão no CSS, do
         lado de quem desenha, em vez de espalhar condicionais aqui. */
      data-app={win.appId}
      aria-labelledby={`win-title-${win.key}`}
      tabIndex={-1}
      inert={win.minimized}
      onKeyDown={onKeyDown}
      onPointerDownCapture={aoApontar}
      onClickCapture={aoClicar}
      style={{
        x,
        y,
        zIndex: win.z,
        width: largura,
        height: altura,
        /* Minimizada não recebe clique. `inert` já a tira do teclado e da
           árvore de acessibilidade; isto cobre o ponteiro durante os 260ms em
           que ela ainda está na tela, desaparecendo. */
        pointerEvents: win.minimized ? 'none' : undefined,
      }}
      /**
       * ABRIR, MINIMIZAR E RESTAURAR, NOS MESMOS DOIS EIXOS.
       *
       * `display: none` saiu daqui. Ele fazia a janela minimizada sumir num
       * corte seco — a única transição que faltava no sistema —, e não havia
       * como suavizá-lo: elemento com `display: none` não anima, e voltar dele
       * também não.
       *
       * No lugar, escala e opacidade. Os dois são propriedades de composição,
       * então a animação roda fora do layout; e nenhum dos dois é disputado por
       * outro dono, ao contrário de `x`/`y`, que pertencem ao arrasto e à
       * geometria da maximizada logo acima.
       *
       * `visibility: hidden` entra por `transitionEnd`, ou seja, DEPOIS que a
       * saída termina: assim a janela para de compor de vez quando minimizada
       * (importa, porque ela ainda carrega `backdrop-filter`), e ao restaurar o
       * `visible` do alvo é aplicado na hora, antes do primeiro quadro.
       *
       * A ABERTURA CONTINUA SÓ COM OPACIDADE. `initial` não declara `scale`,
       * então a janela nasce em 1 e só o fade roda — animar escala numa janela
       * grande obriga o navegador a recompor a cada passo e, com blur, a refazer
       * o desfoque inteiro. O comentário original disto foi medido; a animação
       * de minimizar aceita esse custo porque acontece uma vez, sob comando
       * explícito, e é justamente o movimento que se quer ver.
       */
      initial={{ opacity: 0 }}
      animate={{
        opacity: win.minimized ? 0 : 1,
        scale: win.minimized ? MOVIMENTO.minimizarJanela.escala : 1,
        visibility: 'visible',
        transitionEnd: win.minimized ? { visibility: 'hidden' } : undefined,
      }}
      transition={{
        /* Saindo, a opacidade acompanha a escala: se ela terminasse antes (o
           fade de abertura é curto de propósito), a janela ficaria invisível
           encolhendo sozinha o resto do caminho, e o gesto se perderia.
           Entrando — na abertura e na restauração — o fade curto continua, que é
           o que faz a janela parecer já estar lá. */
        opacity: {
          duration: win.minimized ? duracaoMinimizar : JANELAS.aberturaMs / 1000,
          ease: 'linear',
        },
        scale: { duration: duracaoMinimizar, ease: MOVIMENTO.minimizarJanela.ease },
      }}
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

      {/* O CHROME DE EXPLORADOR ENVOLVE, O APP NÃO SABE.
          A decisão de quem recebe está no `explorer` do registry, e o app segue
          agnóstico de container — ele recebe as mesmas props com ou sem chrome.
          Terminal, Marcos Virtual e Configurações caem no ramo de baixo. */}
      <NavegacaoProvider value={navegacao}>
        {app?.explorer ? (
          <ExplorerChrome win={win}>
            <div className="marocos-window-body">
              {AppComponent ? (
                <Suspense fallback={null}>
                  <AppComponent params={win.params} />
                </Suspense>
              ) : null}
            </div>
          </ExplorerChrome>
        ) : (
          <div className="marocos-window-body">
            {/* fallback nulo de propósito: com o prefetch em ociosidade o chunk
                já chegou, e um spinner que pisca por 20ms é pior que nada. */}
            {AppComponent ? (
              <Suspense fallback={null}>
                <AppComponent params={win.params} />
              </Suspense>
            ) : null}
          </div>
        )}
      </NavegacaoProvider>
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
