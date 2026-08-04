import React from 'react'
import Silk from '../components/backgrounds/Silk'
import { useDeviceMode } from '../os/useDeviceMode'
import { useTheme } from '../contexts/ThemeContext'

/**
 * WALLPAPER "COLINAS"
 * --------------------------------------------------
 * Composição em duas camadas:
 *   1. CÉU — o shader Silk que o projeto já usava, animado. O movimento vem de
 *      arte já validada, em vez de nuvens SVG que na prática renderizavam como
 *      manchas cinzas borradas.
 *   2. COLINAS — três paths SVG opacos ancorados embaixo, dando a forma de
 *      paisagem que o shader sozinho não tem. Homenagem original ao Bliss do
 *      Windows XP, repintada na paleta roxa (a foto original é licenciada).
 *
 * No mobile o Silk cede lugar a gradiente CSS, como o projeto já fazia: WebGL
 * de tela cheia não vale o custo de bateria num celular.
 */

// Silk pinta o céu; a cor troca com o tema para o horizonte não sumir.
const SILK_DARK = '#4c1d95'
const SILK_LIGHT = '#a78bfa'

const Hills = ({ isAnimated = true }) => {
  const isMobile = useDeviceMode() === 'mobile'
  const { isDark } = useTheme()

  return (
    <div className="noiseos-wallpaper" aria-hidden="true">
      {/* --- CAMADA 1: CÉU --- */}
      <div className="noiseos-sky">
        {isMobile ? (
          <div className="noiseos-sky-fallback" />
        ) : (
          <Silk
            color={isDark ? SILK_DARK : SILK_LIGHT}
            speed={12}
            scale={1.4}
            rotation={2.6}
            noiseIntensity={1.2}
            isAnimated={isAnimated}
          />
        )}
      </div>

      {/* --- CAMADA 2: COLINAS --- */}
      <div className="noiseos-hills">
        {/* Brilho de horizonte: separa céu de terra sem linha dura. */}
        <div className="noiseos-horizon" />

        <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="noiseos-hills-svg">
          <defs>
            {/* Grão de filme — o projeto se chama noiseportfolio, então o ruído
                na textura do sistema é literal, não decorativo. */}
            <filter id="noiseos-grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
          </defs>

          <path
            d="M0,260 C260,190 420,242 700,160 C980,78 1180,126 1440,60 L1440,400 L0,400 Z"
            fill="var(--hill-back)"
            opacity="0.65"
          />
          <path
            d="M0,320 C300,242 520,290 820,206 C1080,134 1260,176 1440,140 L1440,400 L0,400 Z"
            fill="var(--hill-mid)"
            opacity="0.85"
          />
          <path
            d="M0,400 C240,320 480,362 780,284 C1060,212 1260,248 1440,214 L1440,400 Z"
            fill="var(--hill-front)"
          />

          <rect width="1440" height="400" filter="url(#noiseos-grain)" opacity="0.06" />
        </svg>
      </div>
    </div>
  )
}

export default Hills
