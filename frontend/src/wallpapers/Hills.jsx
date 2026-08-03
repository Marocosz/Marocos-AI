import React from 'react'

/**
 * WALLPAPER "COLINAS"
 * --------------------------------------------------
 * Homenagem original ao Bliss do Windows XP, repintada na paleta roxa.
 * SVG em vez de shader por três motivos: nítido em qualquer resolução,
 * ~2KB, e deixa o orçamento de GPU livre para o cristal 3D.
 *
 * Dia e noite compartilham a geometria e trocam só os tokens de cor.
 */

const Hills = ({ isAnimated = true }) => (
  <div className="noiseos-wallpaper" aria-hidden="true">
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      className="noiseos-wallpaper-svg"
    >
      <defs>
        <linearGradient id="noiseos-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--hill-sky-top)" />
          <stop offset="55%" stopColor="var(--hill-sky-mid)" />
          <stop offset="100%" stopColor="var(--hill-sky-low)" />
        </linearGradient>

        <filter id="noiseos-cloud-blur">
          <feGaussianBlur stdDeviation="18" />
        </filter>

        {/* Grão de filme: o projeto se chama noiseportfolio, então o ruído
            na textura do sistema é literal, não decorativo. */}
        <filter id="noiseos-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      <rect width="1440" height="900" fill="url(#noiseos-sky)" />

      <g filter="url(#noiseos-cloud-blur)" opacity="var(--hill-cloud-opacity)">
        {[
          { cx: 240, cy: 150, rx: 120, ry: 34, dur: 90 },
          { cx: 700, cy: 100, rx: 90, ry: 26, dur: 120 },
          { cx: 1130, cy: 190, rx: 150, ry: 40, dur: 105 },
          { cx: 950, cy: 300, rx: 70, ry: 20, dur: 140 },
        ].map((c, i) => (
          <ellipse
            key={i}
            className="noiseos-cloud"
            cx={c.cx}
            cy={c.cy}
            rx={c.rx}
            ry={c.ry}
            fill="var(--hill-cloud)"
            style={
              isAnimated
                ? {
                    animation: `noiseos-cloud-drift ${c.dur}s ease-in-out ${i * -20}s infinite alternate`,
                  }
                : undefined
            }
          />
        ))}
      </g>

      {/* Três camadas de colina — a da frente é a crista do Bliss,
          subindo suave da esquerda para a direita. */}
      <path d="M0,760 C260,690 420,742 700,660 C980,578 1180,626 1440,560 L1440,900 L0,900 Z"
            fill="var(--hill-back)" opacity="0.55" />
      <path d="M0,820 C300,742 520,790 820,706 C1080,634 1260,676 1440,640 L1440,900 L0,900 Z"
            fill="var(--hill-mid)" opacity="0.8" />
      <path d="M0,900 C240,820 480,862 780,784 C1060,712 1260,748 1440,714 L1440,900 Z"
            fill="var(--hill-front)" />

      <rect width="1440" height="900" filter="url(#noiseos-grain)" opacity="0.05" />
    </svg>
  </div>
)

export default Hills
