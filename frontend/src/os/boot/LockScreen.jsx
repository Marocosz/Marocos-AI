import { useEffect, useState, useRef, Suspense, lazy } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../data/os'
import { getStartMenuData } from '../../data/startMenu'
import './boot.css'

// Mesmo cristal da identidade. A esta altura o boot já rodou por 4s com o
// mesmo import em voo, então o chunk normalmente já está em memória.
const Crystal = lazy(() => import('../../components/Crystal'))

/**
 * LockScreen — a porta do Marocos OS.
 * --------------------------------------------------
 * Fica entre o boot e a área de trabalho. O desktop já está montado por baixo,
 * então destrancar não carrega nada: a camada sobe e revela o que já existe.
 *
 * O CRISTAL É O BOTÃO. A alternativa óbvia — cristal decorativo com um botão
 * "Entrar" ao lado — poria dois elementos disputando o mesmo trabalho. Aqui a
 * marca é a porta.
 *
 * E SÓ A PORTA ABRE. Antes qualquer clique e qualquer tecla destrancavam, o que
 * transformava a porta em decoração: ninguém chegava a usá-la, e o hover que
 * ela oferece não queria dizer nada. Uma tela de bloqueio que abre sozinha ao
 * primeiro toque não é uma porta, é uma cortina. Agora o gesto é um só, e é o
 * que a tela mostra.
 *
 * ── DUAS DECISÕES DE PERFORMANCE QUE VALEM O COMENTÁRIO ──
 *
 * 1. O CRISTAL CONGELA ANTES DA CORTINA SUBIR. Ele é um canvas WebGL a 60fps
 *    dentro da camada que vai deslizar; enquanto produz frames, cada passo da
 *    animação obriga o compositor a reenviar a textura e recompor a tela
 *    inteira. Parado (`frameloop="demand"`), a textura fica estável e a subida
 *    vira movimento puro de composição.
 *
 * 2. O FIM DA ANIMAÇÃO É OUVIDO, NÃO CRONOMETRADO. Antes havia um
 *    setTimeout(620) espelhando um keyframe de 600ms; qualquer ajuste no CSS
 *    dessincronizava os dois e deixava um frame preto ou um corte precoce.
 *    Agora o desmonte acontece no `animationend` da própria cortina.
 */
const LockScreen = ({ onUnlock, onUnlockStart }) => {
  const { language } = useLanguage()
  const os = getOsData(language)
  const t = os.lock || {}
  const visitante = getStartMenuData(language).visitor

  const [saindo, setSaindo] = useState(false)
  const jaDestrancou = useRef(false)
  const portaRef = useRef(null)

  // A porta recebe o foco na montagem. É o comportamento correto para um
  // diálogo modal, e como ela virou o único caminho para entrar, quem navega
  // por teclado passa a ter Enter disponível de imediato em vez de precisar
  // descobrir que existe um Tab a dar.
  useEffect(() => {
    portaRef.current?.focus({ preventScroll: true })
  }, [])

  const destrancar = () => {
    if (jaDestrancou.current) return
    jaDestrancou.current = true
    setSaindo(true)
    // Avisa cedo: o wallpaper volta a animar JA, durante os 620ms da cortina,
    // em vez de acordar frio no instante em que o desktop aparece. O
    // aquecimento do shader acontece escondido atras da cortina, e o que a
    // cortina revela e um papel de parede vivo em vez de um congelado.
    onUnlockStart?.()
  }

  // Rede de segurança: se `animationend` não disparar (aba em segundo plano,
  // movimento reduzido, animação cancelada), o desmonte ainda acontece.
  // Generoso de propósito — quem manda no caso normal é o animationend.
  useEffect(() => {
    if (!saindo) return
    const id = setTimeout(onUnlock, 1200)
    return () => clearTimeout(id)
  }, [saindo, onUnlock])

  const aoTerminarAnimacao = (e) => {
    // O evento borbulha dos filhos; só a cortina encerra a tela.
    if (e.target !== e.currentTarget || e.animationName !== 'lock-out') return
    onUnlock()
  }

  return (
    <div
      className={`lock-screen${saindo ? ' lock-screen-leaving' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={t.ariaLabel}
      onAnimationEnd={aoTerminarAnimacao}
    >
      {/* Relógio no canto: é informação real, e é onde todo sistema o coloca. */}
      <Relogio language={language} />

      <div className="lock-center">
        <span className="lock-user">{visitante}</span>

        <button
          type="button"
          ref={portaRef}
          className="lock-door"
          aria-label={t.enterAria}
          onClick={destrancar}
        >
          <Suspense fallback={<div className="crystal-loading lock-crystal" aria-hidden="true" />}>
            {/* `animated={!saindo}`: ver a decisão 1 no topo do arquivo. */}
            <Crystal size={340} animated={!saindo} spin={1.6} className="lock-crystal" />
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
