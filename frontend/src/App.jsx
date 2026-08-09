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

  const concluirBoot = useCallback(() => setFase('bloqueio'), [])
  const destrancar = useCallback(() => setFase('pronto'), [])
  const desligar = useCallback(() => setFase('desligado'), [])
  const ligar = useCallback(() => setFase('bloqueio'), [])

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
        {fase === 'bloqueio' && <LockScreen onUnlock={destrancar} />}
        {desligado && <ShutdownScreen onPowerOn={ligar} />}

        {fase === 'pronto' && <BoasVindas ativa={modo === 'desktop'} />}
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
