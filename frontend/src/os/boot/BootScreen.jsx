import { useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../data/os'
import DecryptedText from '../../components/effects/DecryptedText'
import CrystalMark from './CrystalMark'
import './boot.css'

// Duração alvo da cerimônia inteira. Pulável a qualquer momento antes disso
// por qualquer tecla ou clique/toque — ver o useEffect abaixo.
const BOOT_DURATION_MS = 1800

/**
 * BootScreen — tela de inicialização do NoiseOS.
 * --------------------------------------------------
 * Sequência: cristal (marca do sistema) → nome se montando com
 * DecryptedText → barra de progresso → onDone(). Pulável a qualquer
 * momento; e com `prefers-reduced-motion: reduce` nem chega a aparecer —
 * onDone() é chamado de imediato, sem nenhum frame de animação.
 */
const BootScreen = ({ onDone }) => {
  const { language } = useLanguage()
  const os = getOsData(language)
  const strings = os.boot || {}

  // Lido uma única vez, na montagem: decide se a cerimônia roda ou é pulada
  // por inteiro. Ler aqui (e não dentro do efeito) evita que o primeiro
  // frame chegue a pintar o boot antes de ser descartado.
  const [reduceMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    if (reduceMotion) {
      onDone()
      return
    }

    let done = false
    const finish = () => {
      if (done) return
      done = true
      onDone()
    }

    const timer = setTimeout(finish, BOOT_DURATION_MS)

    // Pulável: qualquer tecla ou clique/toque encerra o boot na hora.
    window.addEventListener('keydown', finish)
    window.addEventListener('pointerdown', finish)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', finish)
      window.removeEventListener('pointerdown', finish)
    }
  }, [reduceMotion, onDone])

  if (reduceMotion) return null

  return (
    <div className="boot-screen" role="status" aria-label={strings.ariaLabel}>
      <div className="boot-content">
        <CrystalMark size={110} pulse />

        <p className="boot-title">
          <DecryptedText
            text={strings.systemName || ''}
            speed={45}
            sequential
            animateOn="view"
            revealDirection="start"
            useOriginalCharsOnly
            parentClassName="boot-title-inner"
            className="boot-title-char"
            encryptedClassName="boot-title-char boot-title-char-encrypted"
          />
        </p>

        {strings.tagline && <p className="boot-tagline">{strings.tagline}</p>}

        <div className="boot-progress" aria-hidden="true">
          <div
            className="boot-progress-fill"
            style={{ animationDuration: `${BOOT_DURATION_MS}ms` }}
          />
        </div>

        <p className="boot-skip-hint">{strings.skipHint}</p>
      </div>
    </div>
  )
}

export default BootScreen
