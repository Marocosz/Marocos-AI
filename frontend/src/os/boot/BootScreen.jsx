import { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../data/os'
import CrystalMark from './CrystalMark'
import './boot.css'

// Duração da cerimônia. A montagem das facetas ocupa os primeiros ~900ms; o
// resto é o nome entrando e um respiro antes da tela de bloqueio.
const BOOT_DURATION_MS = 2000

/**
 * BootScreen — inicialização do Marocos SO.
 * --------------------------------------------------
 * Sem barra de progresso e sem anel de bolinhas. A marca do sistema é um
 * cristal FACETADO, então o carregamento é o cristal se montando faceta por
 * faceta: o indicador de progresso é a própria marca se formando. É a única
 * animação de boot que este projeto poderia ter, porque nasce da geometria do
 * logo em vez de ser aplicada por cima dele.
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
        <CrystalMark size={104} pulse={false} assemble />

        <p className="boot-title">{strings.systemName}</p>
        {strings.tagline && <p className="boot-tagline">{strings.tagline}</p>}
      </div>

      <p className="boot-skip-hint">{strings.skipHint}</p>
    </div>
  )
}

export default BootScreen
