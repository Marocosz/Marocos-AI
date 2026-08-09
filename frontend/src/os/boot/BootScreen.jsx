import { useEffect, useState, Suspense, lazy } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../data/os'
import CrystalMark from './CrystalMark'

import './boot.css'

// O cristal de verdade e pesado (three + fiber + drei). Carrega sob demanda;
// ate chegar, a marca em SVG se monta faceta a faceta no lugar dele — o que
// torna o fallback um indicador de carregamento honesto em vez de um vazio.
const Crystal = lazy(() => import('../../components/Crystal'))

// Duração da cerimônia. A montagem das facetas ocupa os primeiros ~900ms; o
// resto é o nome entrando e um respiro antes da tela de bloqueio.
const BOOT_DURATION_MS = 2000

/**
 * BootScreen — inicialização do Marocos SO.
 * --------------------------------------------------
 * Sem barra de progresso e sem anel de bolinhas. O cristal da identidade
 * aparece assim que o chunk 3D chega; enquanto ele não chega, a marca em SVG
 * se monta faceta a faceta no lugar. O indicador de progresso é a própria
 * marca se formando — nasce da geometria do logo em vez de ser aplicada por
 * cima dele, e some sozinho quando a peça real assume.
 *
 * Pulável a qualquer momento por tecla ou clique. Com
 * `prefers-reduced-motion: reduce` nem chega a pintar: onDone() na hora.
 */
const BootScreen = ({ onDone }) => {
  const { language } = useLanguage()
  const os = getOsData(language)
  const strings = os.boot || {}

  // Lido uma vez, na montagem: decide se a cerimônia roda ou é pulada por
  // inteiro. Ler aqui, e não dentro do efeito, evita que o primeiro frame
  // chegue a pintar o boot antes de ser descartado.
  const [reduceMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    if (reduceMotion) {
      onDone()
      return
    }

    let pronto = false
    const encerrar = () => {
      if (pronto) return
      pronto = true
      onDone()
    }

    const timer = setTimeout(encerrar, BOOT_DURATION_MS)
    window.addEventListener('keydown', encerrar)
    window.addEventListener('pointerdown', encerrar)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', encerrar)
      window.removeEventListener('pointerdown', encerrar)
    }
  }, [reduceMotion, onDone])

  if (reduceMotion) return null

  return (
    <div className="boot-screen" role="status" aria-label={strings.ariaLabel}>
      <div className="boot-content">
        <Suspense fallback={<CrystalMark size={168} pulse={false} assemble />}>
          <Crystal size={168} animated />
        </Suspense>

        <p className="boot-title">{strings.systemName}</p>
        {strings.tagline && <p className="boot-tagline">{strings.tagline}</p>}
      </div>

      <p className="boot-skip-hint">{strings.skipHint}</p>
    </div>
  )
}

export default BootScreen
