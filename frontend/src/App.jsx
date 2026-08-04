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
import ScreenSaver from './os/boot/ScreenSaver'
import './os/tokens.css'

/**
 * Shell do NoiseOS.
 *
 * O Lenis saiu junto com o scroll de página: não há mais o que suavizar,
 * porque todo scroll agora acontece dentro de janelas.
 *
 * O mesmo WindowManagerProvider serve os dois shells — o desktop lê `windows[]`
 * como conjunto, o mobile lê como pilha. É a premissa central do design, e é o
 * que evita manter dois frontends.
 */

// Uma chave só para "primeira vez nesta sessão": ela controla o boot E a
// janela de boas-vindas. Recarregar na mesma aba cai direto no desktop limpo.
const CHAVE_VISITA = 'noiseos:visited'

const OCIOSIDADE_MS = 90_000

/**
 * Leitura e escrita da marca de visita ficam SEPARADAS de propósito.
 *
 * Escrever no sessionStorage dentro do inicializador do useState seria efeito
 * colateral numa função que precisa ser pura: o StrictMode invoca
 * inicializadores duas vezes em desenvolvimento, então a primeira chamada
 * gravaria a marca e a segunda leria "já visitou" — o boot nunca apareceria em
 * dev. A leitura fica no inicializador; a escrita, num efeito.
 */
function jaVisitouNestaSessao() {
  try {
    return Boolean(sessionStorage.getItem(CHAVE_VISITA))
  } catch {
    // Modo privado com storage bloqueado: trata como visita repetida, que é o
    // caminho sem cerimônia. Melhor pular o boot do que quebrar a montagem.
    return true
  }
}

function marcarVisitado() {
  try {
    sessionStorage.setItem(CHAVE_VISITA, '1')
  } catch {
    /* storage bloqueado: sem marca, e sem quebrar nada */
  }
}

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

/** Abre "Sobre este PC" na primeira visita da sessão, para ninguém cair num
 *  desktop vazio sem saber o que clicar. */
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

/** Monta o protetor de tela após OCIOSIDADE_MS sem interação. */
const ProtetorDeTela = ({ isAnimated }) => {
  const [ativo, setAtivo] = useState(false)

  useEffect(() => {
    // Com movimento desligado (inclui prefers-reduced-motion, que o
    // ThemeContext já respeita), o timer nem é armado.
    if (!isAnimated) return

    let id
    const rearmar = () => {
      clearTimeout(id)
      id = setTimeout(() => setAtivo(true), OCIOSIDADE_MS)
    }

    const eventos = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart']
    eventos.forEach((e) => window.addEventListener(e, rearmar, { passive: true }))
    rearmar()

    return () => {
      clearTimeout(id)
      eventos.forEach((e) => window.removeEventListener(e, rearmar))
    }
  }, [isAnimated])

  if (!ativo) return null
  return <ScreenSaver isAnimated={isAnimated} onDismiss={() => setAtivo(false)} />
}

const Shell = () => {
  const { isDark, isAnimated } = useTheme()
  const modo = useDeviceMode()

  // 'boot' -> 'pronto' -> ('desligado' -> 'pronto')
  const [fase, setFase] = useState(() => (jaVisitouNestaSessao() ? 'pronto' : 'boot'))

  useEffect(marcarVisitado, [])

  const concluirBoot = useCallback(() => setFase('pronto'), [])
  const desligar = useCallback(() => setFase('desligado'), [])
  const ligar = useCallback(() => setFase('pronto'), [])

  const desligado = fase === 'desligado'

  return (
    <div className={isDark ? 'theme-dark' : 'theme-light'}>
      <WindowManagerProvider>
        <TituloDaPagina />

        {/* O shell continua montado por baixo do boot: assim ele já pintou
            quando a cortina sai, em vez de montar tudo no mesmo frame. */}
        {!desligado &&
          (modo === 'mobile' ? (
            <MobileShell isAnimated={isAnimated} />
          ) : (
            <>
              <Desktop isAnimated={isAnimated} />
              <Taskbar onShutdown={desligar} />
            </>
          ))}

        {fase === 'boot' && <BootScreen onDone={concluirBoot} />}
        {desligado && <ShutdownScreen onPowerOn={ligar} />}

        {fase === 'pronto' && (
          <>
            <BoasVindas ativa={modo === 'desktop'} />
            <ProtetorDeTela isAnimated={isAnimated && modo === 'desktop'} />
          </>
        )}
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
