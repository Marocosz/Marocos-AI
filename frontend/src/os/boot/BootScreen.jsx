import { useEffect, useState, Suspense, lazy } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../data/os'
import './boot.css'

// O cristal da identidade. O App dispara este mesmo import no escopo do
// módulo, então quando o boot monta o chunk já costuma estar a caminho.
const Crystal = lazy(() => import('../../components/Crystal'))

/**
 * Duração da cerimônia.
 *
 * Longa de propósito: o cristal gira e flutua, e a graça é ter tempo de ver
 * isso acontecer. Abaixo de ~3s a sequência vira um flash e o visitante só
 * registra que "piscou alguma coisa". Pulável a qualquer momento, então quem
 * tem pressa não paga o preço.
 */
const BOOT_DURATION_MS = 4200

/**
 * BootScreen — inicialização do Marocos OS.
 * --------------------------------------------------
 * Sequência: halo acende → cristal entra girando → nome sobe → assinatura →
 * a barra completa e o sistema vai para a tela de bloqueio.
 *
 * Não há mais cristal desenhado à mão aqui. Enquanto o chunk 3D não chega, o
 * lugar dele é ocupado só pelo halo pulsando: um vazio honesto é melhor do que
 * uma segunda versão da marca que não é a marca.
 *
 * Com `prefers-reduced-motion: reduce` nem chega a pintar: onDone() na hora.
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
        <div className="boot-crystal">
          <Suspense fallback={<div className="crystal-loading" aria-hidden="true" />}>
            <Crystal size={300} animated />
          </Suspense>
        </div>

        <p className="boot-title">{strings.systemName}</p>
        {strings.tagline && <p className="boot-tagline">{strings.tagline}</p>}

        {/* A barra torna a duração legível: sem ela, quatro segundos de tela
            quieta leem como travamento em vez de inicialização. */}
        <div className="boot-progress" aria-hidden="true">
          <span
            className="boot-progress-fill"
            style={{ animationDuration: `${BOOT_DURATION_MS}ms` }}
          />
        </div>
      </div>

      <p className="boot-skip-hint">{strings.skipHint}</p>
    </div>
  )
}

export default BootScreen
