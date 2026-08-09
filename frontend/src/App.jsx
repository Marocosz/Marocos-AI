import React, { useState, useCallback, useEffect, useRef } from 'react'
import { LanguageProvider } from './contexts/LanguageContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { WindowManagerProvider, useWindows } from './os/WindowManagerContext'
import { useDeviceMode } from './os/useDeviceMode'
import { useDocumentHead } from './os/useDocumentHead'
import Desktop from './os/desktop/Desktop'
import Taskbar from './os/desktop/Taskbar'
import MobileShell from './os/mobile/MobileShell'
import BootScreen from './os/boot/BootScreen'
import ShutdownScreen from './os/boot/ShutdownScreen'
import LockScreen from './os/boot/LockScreen'
import './os/tokens.css'

// Dispara o download do chunk 3D assim que este módulo carrega, em paralelo
// com tudo. O boot e a tela de bloqueio o consomem via React.lazy; começar
// aqui faz o fallback de carregamento quase nunca aparecer.
import('./components/Crystal')

/**
 * Shell do Marocos OS.
 *
 * O Lenis saiu junto com o scroll de página: não há mais o que suavizar,
 * porque todo scroll agora acontece dentro de janelas.
 *
 * O mesmo WindowManagerProvider serve os dois shells — o desktop lê `windows[]`
 * como conjunto, o mobile lê como pilha. É a premissa central do design, e é o
 * que evita manter dois frontends.
 */

/**
 * Sincroniza título e canonical com a janela em foco. Precisa viver dentro do
 * provider para saber qual app está focado. Não renderiza nada.
 */
const TituloDaPagina = () => {
  const { windows, focusedKey } = useWindows()
  const focada = windows.find((w) => w.key === focusedKey)
  useDocumentHead({ appId: focada?.appId ?? null, params: focada?.params ?? null })
  return null
}

/**
 * Abre "Sobre este PC" para ninguém cair num desktop vazio sem saber o que
 * clicar.
 *
 * Dispara quando a CORTINA COMEÇA a subir, não quando ela termina. Montar a
 * janela custa a árvore inteira do app mais, 450ms depois, um segundo contexto
 * WebGL para o cristal dele — medi ~560ms de main thread travada. Feito no fim
 * da transição, esse custo caía exatamente sobre o momento em que o desktop
 * aparecia. Atrás da cortina, ele não é visto por ninguém, e o que a cortina
 * revela é uma janela já pintada.
 */
const BoasVindas = ({ ativa }) => {
  const { open, windows } = useWindows()
  const jaAbriu = useRef(false)

  useEffect(() => {
    // Se a URL já trouxe uma janela (deep link), respeita o deep link.
    if (!ativa || jaAbriu.current || windows.length > 0) return
    jaAbriu.current = true
    open('about')
  }, [ativa, open, windows.length])

  return null
}

const Shell = () => {
  const { isDark, isAnimated } = useTheme()
  const modo = useDeviceMode()

  // 'boot' -> 'bloqueio' -> 'pronto' -> ('desligado' -> 'bloqueio')
  //
  // A cerimonia roda em TODO carregamento, inclusive F5: o fluxo de ligar a
  // maquina e entrar por ela e parte da experiencia, nao um tutorial de
  // primeira visita. Deep link continua funcionando — a janela da rota ja
  // esta montada atras do bloqueio e aparece assim que ele sai.
  //
  // Desligar volta para o bloqueio, nao para o boot: religar um computador que
  // ja estava ligado nao repete a inicializacao, mostra a tela de entrada.
  const [fase, setFase] = useState('boot')
  const [revelando, setRevelando] = useState(false)
  // A tela de bloqueio sai da arvore DEPOIS de a fase virar 'pronto' — ver a
  // explicacao em `destrancar`.
  const [bloqueioNaArvore, setBloqueioNaArvore] = useState(true)
  const jaAgendouDesmonte = useRef(false)

  const concluirBoot = useCallback(() => setFase('bloqueio'), [])
  /**
   * Destrancar troca a fase na hora, mas NAO tira a tela de bloqueio da arvore.
   *
   * Desmontar o cristal destroi o contexto WebGL e descarta a geometria e o
   * material do three — medi ~580ms de main thread travada. Fazer isso no
   * mesmo instante em que o desktop aparece era exatamente o engasgo percebido
   * como "a animacao de entrar travada".
   *
   * A cortina ja esta fora da tela (translateY(-100%), pointer-events: none) e
   * o cristal ja esta congelado, entao mante-la montada por mais um momento
   * nao custa frame nenhum. O desmonte acontece na primeira folga do
   * navegador, quando ninguem percebe.
   */
  const destrancar = useCallback(() => {
    setFase('pronto')

    if (jaAgendouDesmonte.current) return
    jaAgendouDesmonte.current = true

    const agendar =
      typeof window.requestIdleCallback === 'function'
        ? (fn) => window.requestIdleCallback(fn, { timeout: 2500 })
        : (fn) => setTimeout(fn, 800)

    agendar(() => setBloqueioNaArvore(false))
  }, [])
  const desligar = useCallback(() => setFase('desligado'), [])
  const ligar = useCallback(() => {
    jaAgendouDesmonte.current = false
    setBloqueioNaArvore(true)
    setRevelando(false)
    setFase('bloqueio')
  }, [])

  const desligado = fase === 'desligado'

  /**
   * O wallpaper so anima quando esta realmente visivel.
   *
   * Durante o boot e o bloqueio ele fica atras de uma tela OPACA: o shader
   * gasta GPU desenhando algo que ninguem ve, e essa GPU faz falta justamente
   * onde ela e visivel — no cristal a 60fps e na cortina deslizando. Congelar
   * aqui nao tem custo visual nenhum, ao contrario de pausar com janela aberta,
   * que era um remendo.
   *
   * `revelando` religa o shader no INSTANTE em que a cortina comeca a subir, e
   * nao quando ela termina: assim o aquecimento do WebGL acontece escondido
   * atras dela, em vez de dar um pico bem quando o desktop aparece.
   */
  const wallpaperAnimado = isAnimated && (fase === 'pronto' || revelando)

  return (
    <div className={isDark ? 'theme-dark' : 'theme-light'}>
      <WindowManagerProvider>
        <TituloDaPagina />

        {/* O shell continua montado por baixo do boot: assim ele já pintou
            quando a cortina sai, em vez de montar tudo no mesmo frame. */}
        {!desligado &&
          (modo === 'mobile' ? (
            <MobileShell isAnimated={wallpaperAnimado} />
          ) : (
            <>
              <Desktop isAnimated={wallpaperAnimado} />
              <Taskbar onShutdown={desligar} />
            </>
          ))}

        {fase === 'boot' && <BootScreen onDone={concluirBoot} />}
        {bloqueioNaArvore && !desligado && (
          <LockScreen onUnlock={destrancar} onUnlockStart={() => setRevelando(true)} />
        )}
        {desligado && <ShutdownScreen onPowerOn={ligar} />}

        <BoasVindas ativa={modo === 'desktop' && (revelando || fase === 'pronto')} />
      </WindowManagerProvider>
    </div>
  )
}

const App = () => (
  <LanguageProvider>
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  </LanguageProvider>
)

export default App
