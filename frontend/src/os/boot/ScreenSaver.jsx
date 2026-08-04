import { lazy, Suspense, useEffect, useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../data/os'
import CrystalMark from './CrystalMark'
import './boot.css'

// Mesma estratégia de AboutApp/Desktop.jsx: three/@react-three/fiber/drei
// ficam fora do bundle inicial e só chegam se o protetor de tela realmente
// aparecer (90s sem interação são raros na maioria das visitas).
const CrystalScene = lazy(() => import('../../components/CrystalScene'))

/**
 * ScreenSaver — desktop escurecido + cristal + relógio grande.
 * --------------------------------------------------
 * O TIMER DE 90s NÃO É DESTE COMPONENTE: ele só é montado quando o dono do
 * timer decidir. Aqui dentro só existe "o que mostrar" e "como sair" —
 * qualquer tecla, clique/toque ou movimento do mouse chama onDismiss().
 *
 * O cristal 3D (CrystalScene) só é carregado quando isAnimated=true; com
 * isAnimated=false mostra-se a versão CSS/SVG (CrystalMark), sem custo de
 * WebGL nenhum.
 */
const ScreenSaver = ({ onDismiss, isAnimated }) => {
  const { language } = useLanguage()
  const os = getOsData(language)
  const strings = os.screensaver || {}

  const [now, setNow] = useState(() => new Date())

  // Relógio: atualiza uma vez por MINUTO, não por segundo — bem menos
  // repintura numa tela que pode ficar exibida por muito tempo sem
  // interação nenhuma. O primeiro tick é alinhado à virada do minuto.
  useEffect(() => {
    const msToNextMinute = 60000 - (Date.now() % 60000)
    let interval
    const aligner = setTimeout(() => {
      setNow(new Date())
      interval = setInterval(() => setNow(new Date()), 60000)
    }, msToNextMinute)

    return () => {
      clearTimeout(aligner)
      if (interval) clearInterval(interval)
    }
  }, [])

  // Dispensa em qualquer tecla, clique/toque ou movimento do mouse. Um
  // pequeno atraso antes de "armar" os listeners evita que o próprio evento
  // que porventura coincida com a montagem dispense o protetor no mesmo
  // instante em que ele aparece.
  useEffect(() => {
    let armed = false
    const armTimer = setTimeout(() => {
      armed = true
    }, 200)

    const dismiss = () => {
      if (armed) onDismiss()
    }

    window.addEventListener('keydown', dismiss)
    window.addEventListener('pointerdown', dismiss)
    window.addEventListener('mousemove', dismiss)

    return () => {
      clearTimeout(armTimer)
      window.removeEventListener('keydown', dismiss)
      window.removeEventListener('pointerdown', dismiss)
      window.removeEventListener('mousemove', dismiss)
    }
  }, [onDismiss])

  // Locale do navegador, não o idioma da UI — mesma convenção do relógio da
  // Taskbar (os/desktop/Taskbar.jsx).
  const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateLabel = now.toLocaleDateString([], { weekday: 'long', day: '2-digit', month: 'long' })

  return (
    <div className="screensaver" role="status" aria-label={strings.ariaLabel}>
      <div className="screensaver-crystal" role="img" aria-label={strings.crystalAlt}>
        {isAnimated ? (
          <Suspense fallback={<CrystalMark size={220} pulse={false} />}>
            <CrystalScene />
          </Suspense>
        ) : (
          <CrystalMark size={220} pulse={false} />
        )}
      </div>

      <div className="screensaver-clock">
        <span className="screensaver-time">{timeLabel}</span>
        <span className="screensaver-date">{dateLabel}</span>
      </div>

      <p className="screensaver-hint">{strings.dismissHint}</p>
    </div>
  )
}

export default ScreenSaver
