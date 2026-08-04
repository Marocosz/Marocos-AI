import React from 'react'
import Silk from '../components/backgrounds/Silk'
import Iridescence from '../components/backgrounds/Iridescence'
import { useDeviceMode } from '../os/useDeviceMode'
import { useTheme } from '../contexts/ThemeContext'

/**
 * WALLPAPER "ONDAS"
 * --------------------------------------------------
 * Duas camadas:
 *   1. CÉU — o shader que o projeto já usava, animado: Silk no tema escuro,
 *      Iridescence no claro. Movimento vindo de arte já validada.
 *   2. ONDAS — três cristas SVG empilhadas, todas semitransparentes com
 *      opacidade crescente da mais distante para a mais próxima. Como são
 *      translúcidas, o shader continua visível através delas e as
 *      sobreposições criam tons intermediários de graça.
 *
 * A onda da frente recebe um halo escuro largo e difuso — vinheta por fora, não
 * por dentro — que a separa do céu. Sem ele, roxo translúcido sobre roxo
 * animado se dissolvia e a silhueta desaparecia.
 *
 * No mobile o shader cede lugar a gradiente CSS, como o projeto já fazia:
 * WebGL de tela cheia não vale o custo de bateria num celular.
 */

// Cor do Silk no tema escuro. O tema claro usa o Iridescence, que era o shader
// que o projeto já aplicava no modo claro — manter esse par preserva a
// identidade dos dois temas em vez de forçar o mesmo shader nos dois.
const SILK_DARK = '#4c1d95'

/**
 * As tres cristas, da mais distante para a mais próxima.
 *
 * `op` cresce em direção ao observador: a de trás quase se dissolve no céu, a
 * da frente é quase sólida — mas nenhuma chega a ser opaca, para o shader
 * continuar aparecendo atraves delas.
 */
const ONDAS = [
  { d: 'M0,260 C260,190 420,242 700,160 C980,78 1180,126 1440,60 L1440,400 L0,400 Z', op: 0.45 },
  { d: 'M0,320 C300,242 520,290 820,206 C1080,134 1260,176 1440,140 L1440,400 L0,400 Z', op: 0.68 },
  { d: 'M0,400 C240,320 480,362 780,284 C1060,212 1260,248 1440,214 L1440,400 Z', op: 0.88 },
]

const FRENTE = ONDAS[ONDAS.length - 1].d

const Hills = ({ isAnimated = true }) => {
  const isMobile = useDeviceMode() === 'mobile'
  const { isDark } = useTheme()

  return (
    <div className="noiseos-wallpaper" aria-hidden="true">
      {/* --- CAMADA 1: CÉU --- */}
      <div className="noiseos-sky">
        {isMobile ? (
          // Celular não paga o custo de WebGL de tela cheia: só o gradiente.
          <div className="noiseos-sky-fallback" />
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

      {/* --- CAMADA 2: AS ONDAS --- */}
      <div className="noiseos-hills">
        <svg viewBox="0 0 1440 400" preserveAspectRatio="none" className="noiseos-hills-svg">
          <defs>
            {/* Gradiente vertical compartilhado: cada crista pega luz no alto e
                afunda embaixo, então empilhá-las gera bandas de tom sem eu ter
                de pintar cada uma à mão. */}
            <linearGradient id="noiseos-wave" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--wave-top)" />
              <stop offset="55%" stopColor="var(--wave-mid)" />
              <stop offset="100%" stopColor="var(--wave-bottom)" />
            </linearGradient>

            {/* Vinheta externa: traço grosso e escuro na crista da frente,
                fortemente desfocado, desenhado ATRÁS do preenchimento. O
                resultado vaza para cima e escurece o céu junto à silhueta. */}
            <filter
              id="noiseos-outer-vignette"
              x="-10%"
              y="-60%"
              width="120%"
              height="220%"
            >
              <feGaussianBlur stdDeviation="16" />
            </filter>
          </defs>

          {/* Halo escuro da onda mais externa, antes de tudo. */}
          <path
            d={FRENTE}
            fill="none"
            stroke="var(--wave-vignette)"
            strokeWidth="30"
            filter="url(#noiseos-outer-vignette)"
            opacity="0.9"
          />

          {ONDAS.map((onda, i) => (
            <path key={i} d={onda.d} fill="url(#noiseos-wave)" opacity={onda.op} />
          ))}

          {/* Fio de luz na crista da frente, para a borda não ficar mole. */}
          <path
            d={FRENTE}
            fill="none"
            stroke="var(--wave-crest)"
            strokeWidth="1.25"
            vectorEffect="non-scaling-stroke"
            opacity="0.5"
          />
        </svg>
      </div>
    </div>
  )
}

export default Hills
