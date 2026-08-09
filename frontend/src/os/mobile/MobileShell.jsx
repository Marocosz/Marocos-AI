import React, { useState } from 'react'
import Hills from '../../wallpapers/Hills'
import { useWindows } from '../WindowManagerContext'
import HomeScreen from './HomeScreen'
import MobileApp from './MobileApp'
import Dock from './Dock'
import QuickSettings from './QuickSettings'
import './MobileShell.css'

/**
 * SHELL MOBILE DO MAROCOS OS
 * --------------------------------------------------
 * Lê o MESMO estado de `useWindows()` que o desktop, só que como PILHA em vez
 * de conjunto: no desktop todas as janelas ficam visíveis e a diferença entre
 * elas é o z-index; aqui só a última importa.
 *
 *   windows vazio        -> HomeScreen (grade de apps)
 *   windows[length - 1]  -> MobileApp envolvendo o app do topo
 *
 * minimize/maximize do reducer não têm equivalente aqui: não há janela
 * flutuante para minimizar nem maximizar, então essas ações são ignoradas.
 * "Voltar" é simplesmente `close(key)` da janela do topo.
 */
const MobileShell = ({ isAnimated = true }) => {
  const { windows } = useWindows()
  const [quickSettingsOpen, setQuickSettingsOpen] = useState(false)

  const topWindow = windows.length > 0 ? windows[windows.length - 1] : null

  // Mesmo truque de performance do Desktop: o wallpaper só anima na tela
  // inicial. Com um app cobrindo a tela ele fica invisível de qualquer jeito,
  // então animá-lo ali seria só custo de bateria sem benefício visual.
  const wallpaperAnimado = isAnimated && !topWindow

  return (
    <div className="marocos-mobile-shell">
      <Hills isAnimated={wallpaperAnimado} />

      {topWindow ? (
        // key=win.key força remontagem ao trocar de app no topo da pilha,
        // o que replay a animação de entrada — cada novo passo na navegação
        // volta a deslizar da direita, como um push de verdade.
        <MobileApp key={topWindow.key} win={topWindow} />
      ) : (
        <HomeScreen onOpenQuickSettings={() => setQuickSettingsOpen(true)} />
      )}

      {/* O dock só faz sentido na tela inicial: dentro de um app o próprio
          header dele já ocupa o papel de navegação (botão Voltar). */}
      {!topWindow && <Dock />}

      <QuickSettings open={quickSettingsOpen} onClose={() => setQuickSettingsOpen(false)} />
    </div>
  )
}

export default MobileShell
