import { useEffect, useState, useRef, Suspense, lazy } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../data/os'
import { getStartMenuData } from '../../data/startMenu'
import CrystalMark from './CrystalMark'

import './boot.css'

// Mesmo cristal da identidade, carregado sob demanda. A esta altura o boot ja
// disparou o mesmo import, entao o chunk normalmente ja esta em memoria.
const Crystal = lazy(() => import('../../components/Crystal'))

/**
 * LockScreen — a porta do Marocos SO.
 * --------------------------------------------------
 * Fica entre o boot e a área de trabalho. O desktop já está montado por baixo,
 * então destrancar não carrega nada: a camada sobe e revela o que já existe.
 *
 * O CRISTAL É O BOTÃO. A alternativa óbvia — cristal decorativo com um botão
 * "Entrar" ao lado — poria dois elementos disputando o mesmo trabalho. Aqui a
 * marca é a porta: um <button> só, focável, com o rótulo abaixo. Clicar em
 * qualquer outro lugar também entra, como conveniência.
 *
 * Sem backdrop-filter: a tela tem gradiente próprio. Um blur de tela cheia
 * sobre o shader animado é exatamente o custo que o resto do sistema evita.
 */
const LockScreen = ({ onUnlock }) => {
  const { language } = useLanguage()
  const os = getOsData(language)
  const t = os.lock || {}
  const visitante = getStartMenuData(language).visitor

  const [saindo, setSaindo] = useState(false)
  const jaDestrancou = useRef(false)

  // Sem foco programático na porta: como o listener abaixo entra com qualquer
  // tecla, focar na montagem só serviria para acender o anel de foco em todo
  // visitante de mouse. Quem usa teclado entra com Enter, ou tabula e vê o
  // anel no momento certo.

  const destrancar = () => {
    if (jaDestrancou.current) return
    jaDestrancou.current = true
    setSaindo(true)
    // Espera a camada terminar de subir antes de desmontar.
    setTimeout(onUnlock, 620)
  }

  // Qualquer tecla também entra — é o gesto que a metáfora ensina.
  useEffect(() => {
    const aoTeclar = (e) => {
      if (e.key === 'Tab') return // deixa a navegação por teclado funcionar
      destrancar()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className={`lock-screen${saindo ? ' lock-screen-leaving' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={t.ariaLabel}
      onPointerDown={destrancar}
    >
      {/* Relógio no canto: é informação real, e é onde todo sistema o coloca. */}
      <Relogio language={language} />

      <div className="lock-center">
        <span className="lock-user">{visitante}</span>

        <button
          type="button"
          className="lock-door"
          aria-label={t.enterAria}
          onClick={destrancar}
        >
          <Suspense fallback={<CrystalMark size={300} pulse className="lock-crystal" />}>
            <Crystal size={300} animated className="lock-crystal" />
          </Suspense>

          <span className="lock-wordmark">{t.systemName}</span>
          <span className="lock-enter">{t.enter}</span>
        </button>
      </div>

      <p className="lock-hint">{t.hint}</p>
    </div>
  )
}

/**
 * Relógio da tela de bloqueio. Atualiza por minuto, não por segundo: nada aqui
 * mostra segundos, então um tique por segundo seria repintura à toa.
 */
const Relogio = ({ language }) => {
  const [agora, setAgora] = useState(() => new Date())
  const locale = language === 'pt' ? 'pt-BR' : 'en-US'

  useEffect(() => {
    // Alinha o primeiro tique à virada do minuto, em vez de 60s após a
    // montagem — senão o relógio erra o minuto pela metade do intervalo.
    const msAteVirar = (60 - new Date().getSeconds()) * 1000
    let intervalo
    const inicio = setTimeout(() => {
      setAgora(new Date())
      intervalo = setInterval(() => setAgora(new Date()), 60_000)
    }, msAteVirar)

    return () => {
      clearTimeout(inicio)
      clearInterval(intervalo)
    }
  }, [])

  return (
    <div className="lock-clock">
      <span className="lock-time">
        {agora.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
      </span>
      <span className="lock-date">
        {agora.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
      </span>
    </div>
  )
}

export default LockScreen
