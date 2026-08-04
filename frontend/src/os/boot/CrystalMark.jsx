import { useId } from 'react'
import './boot.css'

/**
 * CrystalMark — a marca do sistema em CSS/SVG puro.
 * --------------------------------------------------
 * O cristal "de verdade" (CrystalScene, em components/sections) monta um
 * <Canvas> do @react-three/fiber: cria contexto WebGL, ambiente procedural,
 * material com transmissão etc. Só isso já custa centenas de ms — ótimo numa
 * janela que abre depois de um clique, péssimo no boot ou em qualquer tela
 * que precisa aparecer instantaneamente.
 *
 * Este componente é o mesmo losango facetado, sem nenhum WebGL: só um SVG com
 * gradientes lineares e um brilho via drop-shadow/CSS. Serve de logo do boot
 * e de retrato estático do cristal onde a versão 3D estiver desligada
 * (protetor de tela com isAnimated=false) ou ainda carregando via React.lazy.
 *
 * `useId()` prefixa os ids dos gradientes: como o SVG pode aparecer em mais
 * de um lugar ao mesmo tempo (ex.: fallback do Suspense por um instante),
 * ids fixos colidiriam no DOM.
 */
const CrystalMark = ({ size = 120, pulse = true, className = '' }) => {
  const uid = useId()
  const idFacetA = `crystal-facet-a-${uid}`
  const idFacetB = `crystal-facet-b-${uid}`

  const classes = ['crystal-mark']
  if (pulse) classes.push('crystal-mark-pulse')
  if (className) classes.push(className)

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
        </defs>

        {/* Quatro triângulos bastam para a leitura de "gema facetada": dois
            grandes (topo/base) que recebem o gradiente principal e dois
            menores nas laterais para simular luz e sombra lateral. */}
        <polygon points="50,4 90,38 50,50 10,38" fill={`url(#${idFacetA})`} />
        <polygon points="50,50 90,38 50,96 10,38" fill={`url(#${idFacetB})`} />
        <polygon points="50,4 50,50 10,38" fill="#c4b5fd" opacity="0.55" />
        <polygon points="50,50 50,96 90,38" fill="#2e1065" opacity="0.35" />
      </svg>
    </div>
  )
}

export default CrystalMark
