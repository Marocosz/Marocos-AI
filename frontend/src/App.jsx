import React, { useState, useCallback, useEffect, useRef } from 'react'
import { LanguageProvider } from './contexts/LanguageContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { WindowManagerProvider, useWindows } from './os/WindowManagerContext'
import { useDeviceMode } from './os/useDeviceMode'
import { useDocumentHead } from './os/useDocumentHead'
import Desktop from './os/desktop/Desktop'
import Taskbar from './os/desktop/Taskbar'
import MobileShell from './os/mobile/MobileShell'
import Ceremony from './os/boot/Ceremony'
import ShutdownScreen from './os/boot/ShutdownScreen'
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
 * QUANDO. Montar esta janela custa a árvore inteira do app mais um segundo
 * contexto WebGL para o cristal dela. O custo saiu do fim da transição (onde
 * caía bem no instante em que o desktop aparecia) para o começo dela, e daí
 * para cá: a TELA DE BLOQUEIO PARADA.
 *
 * Medi o pior frame do destravamento no Edge com e sem esta janela montada:
 * 85ms contra 42ms. Ou seja, montá-la durante a cortina custava metade da
 * suavidade da transição — "escondido atrás da cortina" nunca quis dizer
 * "de graça", porque a main thread é a mesma.
 *
 * A tela de bloqueio, ao contrário, é tempo ocioso de verdade: ela fica ali
 * esperando um clique que pode demorar segundos, com uma cerimônia já pronta e
 * nada disputando a CPU. A janela monta ali, em `requestIdleCallback`, e quando
 * o clique vem não sobra trabalho nenhum para a transição.
 *
 * A TRAVA É NA DECISÃO, NÃO NA ABERTURA. Antes o `return` do deep link vinha
 * ANTES de marcar a flag: quem entrava por uma rota (`/sobre`, `/projetos`)
 * saía deste efeito sem nada registrado. Bastava fechar aquela janela no X para
 * `windows.length` voltar a 0, o efeito rodar de novo e as boas-vindas
 * dispararem — a janela "reabria sozinha". E isso valia para todo mundo a
 * partir do segundo carregamento, porque a janela aberta aqui empurra a própria
 * rota para a URL: o F5 seguinte já chega em /sobre.
 *
 * Agora a primeira execução válida decide de uma vez: ou abre, ou respeita o
 * que a URL trouxe. Nos dois casos o assunto está encerrado.
 */
const BoasVindas = ({ ativa }) => {
  const { open, windows } = useWindows()
  const jaDecidiu = useRef(false)

  useEffect(() => {
    if (!ativa || jaDecidiu.current) return
    jaDecidiu.current = true
    // Só recebe as boas-vindas quem chegou sem rota; deep link manda.
    if (windows.length > 0) return

    // Na primeira folga: a tela de bloqueio acabou de entrar e ainda está
    // animando os próprios elementos, então montar a janela no mesmo frame só
    // trocaria um engasgo de lugar.
    const agendar =
      typeof window.requestIdleCallback === 'function'
        ? (fn) => window.requestIdleCallback(fn, { timeout: 1500 })
        : (fn) => setTimeout(fn, 400)

    agendar(() => open('about'))
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

const App = () => (
  <LanguageProvider>
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  </LanguageProvider>
)

export default App
