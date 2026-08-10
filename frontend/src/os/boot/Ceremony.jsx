import { useEffect, useState, useRef, Suspense, lazy } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../data/os'
import { getStartMenuData } from '../../data/startMenu'
import { lerMovimentoReduzido } from '../hooks/useMediaQuery'
import Clock from '../../ui/Clock'
import './boot.css'

// O App dispara este mesmo import no escopo do módulo, então quando a cerimônia
// monta o chunk já costuma estar a caminho.
const Crystal = lazy(() => import('../../components/Crystal'))

/**
 * CERIMÔNIA — inicialização e tela de bloqueio, num palco só.
 * ==========================================================
 *
 * Antes eram dois componentes irmãos, cada um com a sua tela cheia e o SEU
 * PRÓPRIO CRISTAL. Isso trazia três problemas de uma vez:
 *
 *   1. dois contextos WebGL vivos ao mesmo tempo (o bloqueio já montava durante
 *      o boot, para aquecer), pelo dobro do custo de GPU;
 *   2. a passagem de um para o outro era um corte — o cristal do boot sumia e o
 *      do bloqueio aparecia quase no mesmo lugar, o que o olho lê como um
 *      solavanco justamente onde deveria haver continuidade;
 *   3. as duas telas dividiam o mesmo z-index, e a de baixo cobria a de cima.
 *
 * Aqui existe UM palco. O CRISTAL é o elemento que atravessa: fica parado, no
 * mesmo pixel, do primeiro frame do boot até a cortina subir. O que muda é a
 * cena ao redor dele — o céu faz crossfade, a cena do boot se afasta e a do
 * bloqueio se aproxima, cada camada com uma distância diferente. É a mesma
 * leitura de um parallax: o que está longe quase não anda, o que está perto anda
 * bastante, e o que está no centro da atenção não anda nada.
 *
 * A marca e os rótulos do bloqueio pertencem só à segunda cena, mas o ESPAÇO
 * deles existe desde o primeiro frame, com opacidade zero. Se aparecessem do
 * nada, a coluna cresceria e empurraria o cristal — que é exatamente o
 * deslocamento que este arranjo inteiro existe para evitar.
 */

/**
 * Duração da inicialização.
 *
 * Longa de propósito: o cristal gira e flutua, e a graça é ter tempo de ver
 * isso acontecer. Pulável a qualquer momento, então quem tem pressa não paga o
 * preço.
 *
 * Duração não é o mesmo que movimento percebido: uma versão anterior durava
 * 4,2s e mesmo assim lia como "não aconteceu animação nenhuma", porque a última
 * entrada era aos 2,6s e a barra usava uma curva ease-out que chegava a ~94% no
 * primeiro terço. Sobravam quase dois segundos de tela parada, e tela parada
 * durante um boot lê como travamento. O que consertou foi ocupar esse tempo
 * (etapas + barra linear), não esticá-lo.
 */
const BOOT_DURATION_MS = 4800

/**
 * Duração com movimento reduzido. Mais curta, mas NÃO zero: quem tem "efeitos
 * de animação" desligado no sistema — comum em máquina ajustada para
 * performance — chegava direto na tela de bloqueio e concluía, com razão, que a
 * inicialização não existia. Movimento reduzido pede menos movimento, não menos
 * conteúdo.
 */
const BOOT_DURATION_REDUZIDA_MS = 2600

/** Velocidade de rotação em cada cena. A queda é o sistema assentando. */
const SPIN_BOOT = 3.2
const SPIN_BLOQUEIO = 1.6

/**
 * Palco da cerimônia.
 *
 * `fase` vem do App: 'boot' -> 'bloqueio' -> 'pronto'. O CSS lê isso em
 * `data-fase` e é ele quem coreografa a passagem; aqui só se decide quando cada
 * fase termina.
 */
const Ceremony = ({ fase, onBootDone, onUnlock, onUnlockStart }) => {
  const { language } = useLanguage()
  const os = getOsData(language)
  const boot = os.boot || {}
  const bloqueio = os.lock || {}
  const visitante = getStartMenuData(language).visitor

  // Congelada na montagem, de propósito: a tela de bloqueio pode ficar
  // minutos esperando um clique, e a preferência mudando nesse meio faria o
  // cristal parar sozinho ou os timers do boot reiniciarem com outra duração.
  const [reduceMotion] = useState(lerMovimentoReduzido)

  // Tamanho do cristal, lido uma vez. A cerimônia dura segundos; redimensionar
  // a janela no meio dela não é um caso que valha um listener.
  const [tamanhoCristal] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 620 ? 200 : 300,
  )

  // Ligar a máquina de novo (depois de desligar) entra direto no bloqueio. Nesse
  // caso a cena do boot nem é montada: se ela existisse, a animação de saída
  // dela rodaria na montagem e daria um lampejo de conteúdo que nunca esteve lá.
  const comecouNoBoot = useRef(fase === 'boot').current

  const [saindo, setSaindo] = useState(false)
  const jaDestrancou = useRef(false)
  const portaRef = useRef(null)

  const noBoot = fase === 'boot'

  // A porta recebe o foco quando deixa de estar desabilitada. É o comportamento
  // correto para um diálogo modal e, como ela é o único caminho para entrar,
  // quem navega por teclado passa a ter Enter disponível de imediato — sem
  // isso o Tab cairia primeiro nos ícones da área de trabalho, que estão
  // montados atrás da cortina e invisíveis.
  useEffect(() => {
    if (noBoot) return
    portaRef.current?.focus({ preventScroll: true })
  }, [noBoot])

  /**
   * GUARDA DE FOCO — o que torna esta tela realmente modal.
   *
   * A janela de boas-vindas monta ATRÁS da cortina enquanto esta tela está no
   * ar, e abrir uma janela move o foco para ela. Resultado: o Enter parava de
   * destrancar, porque não havia mais nada focado aqui. O mesmo valeria para
   * quem apertasse Tab e caísse nos ícones da área de trabalho — invisíveis,
   * atrás de uma camada opaca.
   *
   * Enquanto a cerimônia é a tela, o foco pertence à porta. Devolver no próximo
   * frame, e não na hora, evita brigar com o elemento que ainda está no meio do
   * próprio processo de receber o foco.
   */
  useEffect(() => {
    if (noBoot || saindo) return

    const devolverFoco = (e) => {
      const porta = portaRef.current
      if (!porta || e.target === porta) return
      requestAnimationFrame(() => {
        if (!jaDestrancou.current) porta.focus({ preventScroll: true })
      })
    }

    document.addEventListener('focusin', devolverFoco)
    return () => document.removeEventListener('focusin', devolverFoco)
  }, [noBoot, saindo])

  /**
   * O FOCO FICA MUDO ATÉ ALGUÉM TOCAR NO TECLADO.
   *
   * Foco programático numa página recém-carregada casa com `:focus-visible` no
   * Chrome, então a porta abria já com a moldura acesa: para quem usa mouse ela
   * parecia pré-selecionada, um estado de hover que ninguém pediu. Tirar o foco
   * resolveria a aparência e quebraria o teclado.
   *
   * Então o foco continua onde deve estar, só não se pinta. Na primeira tecla
   * pressionada a moldura acende — que é exatamente quando ela passa a servir
   * para alguma coisa.
   */
  const [tecladoEmUso, setTecladoEmUso] = useState(false)
  useEffect(() => {
    if (tecladoEmUso) return
    const aoTeclar = () => setTecladoEmUso(true)
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [tecladoEmUso])

  const destrancar = () => {
    if (noBoot || jaDestrancou.current) return
    jaDestrancou.current = true
    setSaindo(true)
    // Avisa cedo: o wallpaper volta a animar JÁ, durante a subida da cortina, em
    // vez de acordar frio no instante em que o desktop aparece. O aquecimento do
    // shader acontece escondido atrás da cortina.
    onUnlockStart?.()
  }

  // Rede de segurança: se `animationend` não disparar (aba em segundo plano,
  // animação cancelada), o desmonte ainda acontece. Quem manda no caso normal é
  // o animationend.
  useEffect(() => {
    if (!saindo) return
    const id = setTimeout(onUnlock, 1200)
    return () => clearTimeout(id)
  }, [saindo, onUnlock])

  const aoTerminarAnimacao = (e) => {
    // O evento borbulha dos filhos; só a cortina encerra a cerimônia.
    if (e.target !== e.currentTarget || e.animationName !== 'cerimonia-sai') return
    onUnlock()
  }

  return (
    <div
      className={`cerimonia${comecouNoBoot ? ' cerimonia-com-boot' : ''}${
        saindo ? ' cerimonia-saindo' : ''
      }`}
      data-fase={fase}
      data-foco={tecladoEmUso ? 'visivel' : 'mudo'}
      style={{ '--cristal': `${tamanhoCristal}px` }}
      role={noBoot ? 'status' : 'dialog'}
      aria-modal={noBoot ? undefined : 'true'}
      aria-label={noBoot ? boot.ariaLabel : bloqueio.ariaLabel}
      onAnimationEnd={aoTerminarAnimacao}
    >
      {/* Os dois céus, empilhados e em crossfade. São a camada mais funda: numa
          leitura de parallax, o fundo é o que menos se mexe. */}
      <div className="cerimonia-ceu cerimonia-ceu--boot" aria-hidden="true" />
      <div className="cerimonia-ceu cerimonia-ceu--lock" aria-hidden="true" />
      {/* A nebulosa do bloqueio: núcleo quente com dois braços afilando para os
          lados, sobre o campo de estrelas do céu. É o que separa esta cena da
          inicialização — lá a luz é uma coluna vertical, aqui é uma banda
          horizontal. Ver boot.css. */}
      <div className="cerimonia-nebulosa" aria-hidden="true" />

      {/* ---- NÚCLEO PERSISTENTE ----
          Nada aqui dentro se move entre as cenas. Os espaços do rótulo de
          visitante e do "Entrar" ficam RESERVADOS desde o boot, com opacidade
          zero: se aparecessem só no bloqueio, a coluna cresceria e empurraria o
          cristal — que é exatamente o deslocamento que este arranjo existe para
          evitar. */}
      <div className="cerimonia-nucleo">
        <span className="lock-user">{visitante}</span>

        <button
          type="button"
          ref={portaRef}
          className="porta"
          disabled={noBoot}
          aria-label={bloqueio.enterAria}
          onClick={destrancar}
        >
          <span className="cerimonia-cristal">
            <Suspense fallback={<span className="crystal-loading" aria-hidden="true" />}>
              {/* Um cristal para a cerimônia inteira. `animated={!saindo}`:
                  enquanto a cortina sobe ele congela, senão cada frame do canvas
                  obriga o compositor a reenviar a textura e recompor a tela. */}
              <Crystal
                size={tamanhoCristal}
                animated={!saindo && !reduceMotion}
                spin={noBoot ? SPIN_BOOT : SPIN_BLOQUEIO}
              />
            </Suspense>
          </span>

          {/* Só aparece no bloqueio, mas ocupa a altura dela desde já — ver a
              nota sobre espaço reservado no cabeçalho. */}
          <span className="cerimonia-marca">{boot.systemName}</span>
          <span className="porta-entrar">{bloqueio.enter}</span>
        </button>
      </div>

      {comecouNoBoot && (
        <CenaBoot
          strings={boot}
          ativa={noBoot}
          reduceMotion={reduceMotion}
          onDone={onBootDone}
        />
      )}

      <CenaBloqueio strings={bloqueio} language={language} ativa={!noBoot} />
    </div>
  )
}

/**
 * Cena do boot: tudo o que só existe enquanto o sistema está iniciando. Fica
 * fora do fluxo do núcleo de propósito — assim entrar e sair daqui nunca mexe
 * um pixel do cristal.
 */
const CenaBoot = ({ strings, ativa, reduceMotion, onDone }) => {
  const duracao = reduceMotion ? BOOT_DURATION_REDUZIDA_MS : BOOT_DURATION_MS
  const etapas = strings.stages || []
  const [etapa, setEtapa] = useState(0)

  // Etapas: é o que carrega a segunda metade da inicialização. A barra sozinha é
  // uma medida sem assunto, e o texto dá ao tempo um porquê. Trocar texto não é
  // movimento, então isto roda nos dois modos.
  useEffect(() => {
    if (!ativa || etapas.length < 2) return
    const id = setInterval(() => {
      setEtapa((n) => (n + 1 < etapas.length ? n + 1 : n))
    }, duracao / etapas.length)
    return () => clearInterval(id)
  }, [ativa, duracao, etapas.length])

  useEffect(() => {
    if (!ativa) return
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
  }, [ativa, duracao, onDone])

  return (
    <div className="cena cena--boot" aria-hidden={!ativa}>
      <div className="cena-boot-pilha">
        {strings.tagline && <p className="boot-tagline">{strings.tagline}</p>}

        {/* A barra torna a duração legível. LINEAR, e não uma curva de easing:
            barra de progresso é medida, não gesto — com ease-out ela dispara e
            depois rasteja, e o olho lê o rastejo como travamento. */}
        <div className="boot-progress">
          <span className="boot-progress-fill" style={{ animationDuration: `${duracao}ms` }} />
        </div>

        {/* `key` no texto: a troca remonta o span e a entrada roda de novo, então
            cada passo se anuncia em vez de trocar seco. */}
        {etapas.length > 0 && (
          <p className="boot-stage">
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

/**
 * Cena do bloqueio: o relógio, a dica, e nada mais. O cristal, a marca e o botão
 * vivem no núcleo — aqui só entra o que é exclusivo desta cena.
 */
const CenaBloqueio = ({ strings, language, ativa }) => (
  <div className="cena cena--lock" aria-hidden={!ativa}>
    {/* Locale explícito (diferente da taskbar e da barra de status mobile,
        que usam o padrão do navegador): aqui a data sai por extenso, e o
        idioma da interface -- não o do sistema do visitante -- decide se o
        texto vem em português ou inglês. .lock-clock é flex, então o <div>
        que o Clock emite no lugar do <span> anterior não muda nada visual. */}
    <div className="lock-clock">
      <Clock
        formato="extenso"
        locale={language === 'pt' ? 'pt-BR' : 'en-US'}
        classePrincipal="lock-time"
        classeSecundaria="lock-date"
      />
    </div>
    <p className="lock-hint">{strings.hint}</p>
  </div>
)

export default Ceremony
