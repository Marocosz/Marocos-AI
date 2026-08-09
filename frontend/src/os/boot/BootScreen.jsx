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
 *
 * Só que duração não é o mesmo que movimento percebido: a versão anterior
 * durava 4,2s e mesmo assim lia como "não aconteceu animação nenhuma", porque
 * a última entrada era aos 2,6s e a barra usava uma curva ease-out que chegava
 * a ~94% no primeiro terço. Sobravam quase dois segundos de tela parada, e tela
 * parada durante um boot lê como travamento. O que consertou foi ocupar esse
 * tempo (etapas + barra linear), não esticá-lo.
 */
const BOOT_DURATION_MS = 4800

/**
 * Duração com movimento reduzido.
 *
 * Mais curta, mas NÃO zero. A versão anterior devolvia `null` e chamava onDone()
 * na hora, ou seja: quem tem "efeitos de animação" desligado no sistema — o que
 * é comum em máquina ajustada para performance — nunca via a inicialização,
 * caía direto na tela de bloqueio e concluía, com razão, que ela não existia.
 *
 * Movimento reduzido pede MENOS MOVIMENTO, não menos conteúdo. Aqui a cerimônia
 * acontece igual, só que quieta: o cristal fica na pose parada, nada sobe ao
 * entrar, a varredura da barra some. Sobram a barra avançando e as etapas
 * trocando, que são informação de progresso e não gesto.
 */
const BOOT_DURATION_REDUZIDA_MS = 2600

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
 * Com `prefers-reduced-motion: reduce` a cerimônia acontece igual, só que mais
 * curta e sem gesto nenhum — ver BOOT_DURATION_REDUZIDA_MS.
 */
const BootScreen = ({ onDone }) => {
  const { language } = useLanguage()
  const os = getOsData(language)
  const strings = os.boot || {}

  // Lido uma vez, na montagem: define o ritmo da cerimônia. Ler aqui, e não
  // dentro do efeito, garante que o primeiro frame já pinte na versão certa.
  const [reduceMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  const duracao = reduceMotion ? BOOT_DURATION_REDUZIDA_MS : BOOT_DURATION_MS

  // Etapa atual. É o que carrega a segunda metade da cerimônia: a barra sozinha
  // é uma medida sem assunto, e o texto dá ao tempo um porquê. Trocar texto não
  // é movimento, então isto roda nos dois modos.
  const etapas = strings.stages || []
  const [etapa, setEtapa] = useState(0)

  useEffect(() => {
    if (etapas.length < 2) return
    const passo = duracao / etapas.length
    const id = setInterval(() => {
      // Trava na última: o intervalo é limpo no desmonte, mas a fase pode ser
      // encurtada por quem pula o boot.
      setEtapa((n) => (n + 1 < etapas.length ? n + 1 : n))
    }, passo)
    return () => clearInterval(id)
  }, [duracao, etapas.length])

  useEffect(() => {
    let pronto = false
    const encerrar = () => {
      if (pronto) return
      pronto = true
      onDone()
    }

    const timer = setTimeout(encerrar, duracao)
    window.addEventListener('keydown', encerrar)
    window.addEventListener('pointerdown', encerrar)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', encerrar)
      window.removeEventListener('pointerdown', encerrar)
    }
  }, [duracao, onDone])

  return (
    <div className="boot-screen" role="status" aria-label={strings.ariaLabel}>
      <div className="boot-content">
        <div className="boot-crystal">
          <Suspense fallback={<div className="crystal-loading" aria-hidden="true" />}>
            {/* spin alto: no boot o movimento precisa comunicar que o sistema
                está trabalhando. Em spin=1 o cristal gira 48° em quatro
                segundos, o que lê como parado. Com movimento reduzido ele fica
                na pose parada — presente, mas sem girar. */}
            <Crystal size={300} animated={!reduceMotion} spin={3.2} />
          </Suspense>
        </div>

        <p className="boot-title">{strings.systemName}</p>
        {strings.tagline && <p className="boot-tagline">{strings.tagline}</p>}

        {/* A barra torna a duração legível: sem ela, quatro segundos de tela
            quieta leem como travamento em vez de inicialização.

            LINEAR, e não uma curva de easing. Barra de progresso é medida, não
            gesto: com ease-out ela dispara e depois rasteja, e o olho lê o
            rastejo como travamento — exatamente o sintoma que essa barra
            deveria evitar. */}
        <div className="boot-progress" aria-hidden="true">
          <span
            className="boot-progress-fill"
            style={{ animationDuration: `${duracao}ms` }}
          />
        </div>

        {/* `key` no texto: a troca de etapa remonta o span e a entrada roda de
            novo, então cada passo se anuncia em vez de trocar seco. */}
        {etapas.length > 0 && (
          <p className="boot-stage" aria-hidden="true">
            <span key={etapa} className="boot-stage-text">
              {etapas[etapa]}
            </span>
          </p>
        )}
      </div>

      <p className="boot-skip-hint">{strings.skipHint}</p>
    </div>
  )
}

export default BootScreen
