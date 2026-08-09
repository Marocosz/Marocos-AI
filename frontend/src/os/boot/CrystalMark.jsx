import { useId } from 'react'
import './boot.css'

/**
 * CrystalMark — a marca do sistema em CSS/SVG puro.
 * --------------------------------------------------
 * O cristal "de verdade" (Crystal, em components/) monta um <Canvas> do
 * @react-three/fiber: cria contexto WebGL, ambiente procedural, material com
 * transmissão. Só isso já custa centenas de ms — ótimo numa janela que abre
 * depois de um clique, péssimo numa tela que precisa aparecer instantaneamente.
 *
 * Aqui é o mesmo losango facetado sem nenhum WebGL: SVG com gradientes e um
 * brilho por drop-shadow.
 *
 * `assemble` faz as quatro facetas entrarem em sequência, e é o que serve de
 * indicador de carregamento no boot: em vez de uma barra de progresso
 * genérica, o que "carrega" é a própria marca se formando.
 *
 * `useId()` prefixa os ids dos gradientes porque o SVG pode aparecer em mais
 * de um lugar ao mesmo tempo, e ids fixos colidiriam no DOM.
 */
const CrystalMark = ({ size = 120, pulse = true, assemble = false, className = '' }) => {
  const uid = useId()
  const idFacetA = `crystal-facet-a-${uid}`
  const idFacetB = `crystal-facet-b-${uid}`
  const idGlow = `crystal-glow-${uid}`

  const classes = ['crystal-mark']
  if (pulse) classes.push('crystal-mark-pulse')
  if (assemble) classes.push('crystal-mark-assemble')
  if (className) classes.push(className)

  // Ordem de entrada: as duas facetas grandes primeiro (a silhueta aparece),
  // depois as duas de luz e sombra (o volume aparece).
  const facetas = [
    { points: '50,4 90,38 50,50 10,38', fill: `url(#${idFacetA})`, opacity: 1, atraso: 0 },
    { points: '50,50 90,38 50,96 10,38', fill: `url(#${idFacetB})`, opacity: 1, atraso: 180 },
    { points: '50,4 50,50 10,38', fill: '#c4b5fd', opacity: 0.55, atraso: 380 },
    { points: '50,50 50,96 90,38', fill: '#2e1065', opacity: 0.35, atraso: 520 },
  ]

  return (
    <div className={classes.join(' ')} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 100 100" className="crystal-mark-svg">
        <defs>
          <linearGradient id={idFacetA} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d8b4fe" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id={idFacetB} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
          <radialGradient id={idGlow}>
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Halo atrás das facetas: dá a impressão de que o cristal emite luz,
            em vez de só refletir. Entra por último na montagem. */}
        <circle cx="50" cy="50" r="46" fill={`url(#${idGlow})`} className="crystal-mark-glow" />

        {facetas.map((f) => (
          <polygon
            key={f.points}
            points={f.points}
            fill={f.fill}
            opacity={f.opacity}
            className="crystal-mark-facet"
            style={assemble ? { animationDelay: `${f.atraso}ms` } : undefined}
          />
        ))}
      </svg>
    </div>
  )
}

export default CrystalMark
