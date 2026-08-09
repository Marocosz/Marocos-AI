import React from 'react'
import Silk from '../components/backgrounds/Silk'
import Iridescence from '../components/backgrounds/Iridescence'
import { useDeviceMode } from '../os/useDeviceMode'
import { useTheme } from '../contexts/ThemeContext'

/**
 * WALLPAPER
 * --------------------------------------------------
 * Só o shader que o projeto já usava: Silk no tema escuro, Iridescence no
 * claro. Sem as cristas SVG que existiam antes — elas competiam com o fundo
 * em vez de compor com ele.
 *
 * Os dois shaders rodam com teto de 20fps (ver TetoDeFps em Silk.jsx e o
 * intervalo em Iridescence.jsx). Isso não é sobre o shader em si, que é
 * barato: é sobre o backdrop-filter das janelas, que refaz o blur toda vez
 * que o fundo redesenha. Menos frames no fundo, menos re-blur por cima.
 *
 * No mobile os dois cedem lugar a gradiente CSS, como o projeto já fazia:
 * WebGL de tela cheia não vale o custo de bateria num celular.
 */

// Cor do Silk no tema escuro. O tema claro usa o Iridescence, que era o shader
// que o projeto já aplicava no modo claro — manter esse par preserva a
// identidade dos dois temas em vez de forçar o mesmo shader nos dois.
const SILK_DARK = '#4c1d95'

const Hills = ({ isAnimated = true }) => {
  const isMobile = useDeviceMode() === 'mobile'
  const { isDark } = useTheme()

  return (
    <div className="marocos-wallpaper" aria-hidden="true">
      <div className="marocos-sky">
        {isMobile ? (
          // Celular não paga o custo de WebGL de tela cheia: só o gradiente.
          <div className="marocos-sky-fallback" />
        ) : isDark ? (
          <Silk
            color={SILK_DARK}
            speed={12}
            scale={1.4}
            rotation={2.6}
            noiseIntensity={1.2}
            isAnimated={isAnimated}
          />
        ) : (
          <Iridescence
            color={[0.9, 0.9, 0.95]}
            mouseReact={false}
            amplitude={0.1}
            speed={1}
            isAnimated={isAnimated}
          />
        )}
      </div>
    </div>
  )
}

export default Hills
