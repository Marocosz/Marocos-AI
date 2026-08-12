import React, { useState, useCallback, useLayoutEffect, useRef } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { WindowManagerProvider } from '../WindowManagerContext'
import { useDeviceMode } from '../useDeviceMode'
import { useIdleTask } from '../hooks/useIdleTask'
import { prefetchAppsDoDesktop } from '../registry'
import { aplicarConfigNoCss } from '../../config/cssBridge'
import { CERIMONIA } from '../../config/system'
import Desktop from '../desktop/Desktop'
import Taskbar from '../desktop/Taskbar'
import MobileShell from '../mobile/MobileShell'
import Ceremony from '../boot/Ceremony'
import ShutdownScreen from '../boot/ShutdownScreen'
import TituloDaPagina from './TituloDaPagina'
import BoasVindas from './BoasVindas'
import '../tokens.css'

// Dispara o download do chunk 3D assim que este módulo carrega, em paralelo
// com tudo. O boot e a tela de bloqueio o consomem via React.lazy; começar
// aqui faz o fallback de carregamento quase nunca aparecer.
import('../../brand/Crystal')

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
const Shell = () => {
  const { isDark, isAnimated, preset } = useTheme()
  const modo = useDeviceMode()

  // A ponte roda antes da pintura: com useEffect haveria um frame com os
  // fallbacks do CSS em vez dos valores do config. Roda no boot e de novo a
  // cada troca de tema, porque as cores do céu (--cfg-ceu-*) dependem dela.
  // Depende também do preset: as cores do céu (--cfg-ceu-*) saem dele desde
  // que o visitante pode escolher a paleta do wallpaper.
  useLayoutEffect(() => {
    aplicarConfigNoCss(isDark ? 'dark' : 'light', preset)
  }, [isDark, preset])

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
        ? (fn) => window.requestIdleCallback(fn, { timeout: CERIMONIA.idle.desmonteBloqueio.timeout })
        : (fn) => setTimeout(fn, CERIMONIA.idle.desmonteBloqueio.fallback)

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

  /**
   * PERFORMANCE: pré-carrega os chunks dos apps do desktop quando a máquina
   * estiver ociosa — mesma ideia do prefetch do cristal em Desktop.jsx, para os
   * apps em vez do 3D. `component` agora é `React.lazy()` no registry, então o
   * primeiro clique em cada ícone pagaria o download do chunk no meio da
   * interação sem isto.
   *
   * `ativo: fase !== 'boot'` começa na tela de bloqueio: é ócio de verdade (ver
   * o comentário de `destrancar` acima), diferente do boot, que já está
   * ocupado animando o cristal.
   *
   * SEM GUARDA DE DISPOSITIVO, ao contrário do prefetch do cristal em
   * Desktop.jsx — e de propósito. Aquele é guardado porque o cristal REALMENTE
   * não existe no mobile (`AboutApp` não o monta fora do desktop). Estes sete
   * apps existem: `mobile/HomeScreen.jsx` monta a grade a partir do mesmo
   * `APPS.filter(onDesktop)` que o desktop usa, então no celular eles são a
   * tela inicial inteira, todos a UM TOQUE. Guardar aqui faria cada toque pagar
   * o download do chunk atrás do fallback nulo do `MobileApp` — que é
   * justamente o que o comentário em `mobile/MobileApp.jsx` diz não acontecer.
   */
  useIdleTask(prefetchAppsDoDesktop, {
    ...CERIMONIA.idle.prefetchCristal,
    ativo: fase !== 'boot',
  })

  // `modo-sobrio` acompanha a classe de tema no MESMO elemento, e não no
  // <html>: custom property resolve pelo ancestral mais próximo que a declara,
  // então um modo lá em cima perderia para o tema aqui. Ver a nota em
  // tokens.css.
  const classesDoTema = `${isDark ? 'theme-dark' : 'theme-light'}${
    preset.sobrio ? ' modo-sobrio' : ''
  }`

  return (
    <div className={classesDoTema}>
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

        {/* Inicialização e bloqueio são um palco só, com o cristal e a marca
            atravessando as duas cenas — ver o cabeçalho de Ceremony.jsx. */}
        {bloqueioNaArvore && !desligado && (
          <Ceremony
            fase={fase}
            onBootDone={concluirBoot}
            onUnlock={destrancar}
            onUnlockStart={() => setRevelando(true)}
          />
        )}
        {desligado && <ShutdownScreen onPowerOn={ligar} />}

        {/* A partir da tela de bloqueio — ver o porquê no cabeçalho de BoasVindas. */}
        <BoasVindas ativa={modo === 'desktop' && !desligado && fase !== 'boot'} />
      </WindowManagerProvider>
    </div>
  )
}

export default Shell
