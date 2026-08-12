import React, { Suspense, lazy, useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { getProfileData } from '../content/profile'
import { getOsData } from '../i18n/os'
import { getApp } from '../os/registry'
import { useAbrir } from '../os/NavegacaoContext'
import { useDeviceMode } from '../os/useDeviceMode'
import { CERIMONIA, acentoProfundo, corpoDoCristal } from '../config/system'
import { useTheme } from '../contexts/ThemeContext'
import './AboutApp.css'

// three + @react-three/fiber + @react-three/drei são pesados demais pra
// entrar no bundle principal só por causa de um diálogo "Sobre". Carrega sob
// demanda e só em desktop (ver useDeviceMode mais abaixo).
const Crystal = lazy(() => import('../brand/Crystal'))

/**
 * "Sobre este PC" — o winver do Marocos OS, e o GUIA do site.
 *
 * ESTE APP ABRE SOZINHO para quem chega sem deep link (ver
 * `os/shell/BoasVindas.jsx`, que o monta em tempo ocioso durante a tela de
 * bloqueio). Ou seja: é a primeira coisa que quase todo visitante lê.
 *
 * E era um beco sem saída. Não tinha um único link, não mencionava nenhum outro
 * app, e não dizia o que existe nesta máquina — numa metáfora de sistema
 * operacional que ninguém explicou ao visitante. A parte "guia" existe para
 * resolver isso.
 *
 * AS PORTAS SÃO PERGUNTAS, não uma lista de janelas. Quem abre um portfólio não
 * quer "Projetos": quer saber se a pessoa sabe construir. Uma lista de nomes de
 * app obriga o visitante a adivinhar qual deles responde à pergunta que ele
 * trouxe — e sessenta segundos não dão para adivinhar duas vezes.
 *
 * AS PORTAS ABREM JANELA, E NÃO TROCAM ESTA — decisão do dono do projeto, e a
 * razão é boa: o guia é uma lista de perguntas, e quem foi ver os projetos
 * ainda pode querer as outras três. Trocar o conteúdo apagaria o mapa assim que
 * ele fosse usado pela primeira vez.
 *
 * É por isso que o app pede `useAbrir()` e não `useIrPara()`. A distinção entre
 * "entrar" (trocar o conteúdo, como a lateral do explorador) e "abrir ao lado"
 * é do sistema, não deste app — ver `os/NavegacaoContext.jsx`. Ele continua sem
 * saber que janelas existem; fora de um container o hook devolve `null` e as
 * portas viram texto, sem quebrar num teste isolado.
 */
const AboutApp = () => {
  const { language } = useLanguage()
  const deviceMode = useDeviceMode()
  const { preset, isAnimated } = useTheme()
  const profile = getProfileData(language)
  const os = getOsData(language)
  const abrir = useAbrir()

  /**
   * PERFORMANCE: o cristal só monta depois que a janela pintou.
   *
   * Criar o contexto WebGL e montar o ambiente do material custa centenas de
   * milissegundos, e fazer isso no mesmo frame da abertura travava a janela
   * inteira. Adiando, a janela aparece na hora e o cristal preenche em seguida.
   *
   * É a mesma solução que o Profile.jsx da página clássica (removida no
   * refactor) já usava, com o comentário "Delay 3D Scene load to prevent
   * startup freeze" — só que aqui o gatilho é a abertura da janela, não a
   * carga da página.
   */
  const [montarCristal, setMontarCristal] = useState(false)

  useEffect(() => {
    if (deviceMode !== 'desktop') return
    const id = setTimeout(() => setMontarCristal(true), CERIMONIA.montarCristalAboutMs)
    return () => clearTimeout(id)
  }, [deviceMode])

  /**
   * A ORDEM É A DO INTERESSE, não a do menu: primeiro se ele sabe construir,
   * depois há quanto tempo, depois esta máquina, e por fim como falar com ele.
   *
   * O ícone vem do `registry` em vez de ser escolhido aqui — ele é a fonte
   * única do ícone de cada app, e uma segunda escolha aqui sairia do lugar na
   * primeira vez que alguém trocasse o do desktop.
   */
  const portas = ['projects', 'history', 'readme', 'terminal']

  return (
    <div className="about-app">
      {/* --- IDENTIDADE: cristal (logo do sistema) + destaque --- */}
      <div className="about-identity">
        {deviceMode === 'desktop' && montarCristal && (
          <div className="about-crystal" role="img" aria-label={os.about.crystalAlt}>
            <Suspense fallback={<div className="about-crystal-fallback" aria-hidden="true" />}>
              {/* O acento atravessa por prop: o cristal monta dentro de um
                  <Canvas> do react-three-fiber, que reconcilia numa árvore
                  própria — contexto do React de fora não chega lá sozinho. */}
              {/* `animated` ERA FIXO AQUI, e o controle "Movimento" das
                  Configurações não alcançava este cristal — o único do sistema
                  que ignorava o próprio interruptor. Quem pausava o papel de
                  parede para poupar bateria continuava com um objeto 3D girando
                  numa janela aberta.
                  O README do harness visual já descrevia o mundo certo
                  ("`isAnimationEnabled = false` ... o cristal cai em
                  frameloop=demand"); era a promessa que este arquivo não
                  cumpria. */}
              {/**
                * SEM O HALO CIRCULAR — e ele nunca esteve no CSS deste app.
                *
                * A mancha redonda em volta da peça é `.crystal-3d::before`, em
                * `os/tokens.css`: um radial com `border-radius: 50%` e
                * `inset: -18%` que o COMPONENTE traz consigo. Por isso mexer no
                * `.about-crystal` daqui não adiantava — eu estava apagando um
                * gradiente diferente, atrás do que realmente aparecia.
                *
                * O halo existe por um motivo real, explicado lá: o material tem
                * `transmission: 1.0` e mostra o que está ATRÁS dele, então sobre
                * fundo escuro o cristal simplesmente sumiria sem algo para
                * transmitir. Na cerimônia isso é indispensável.
                *
                * Aqui não: a janela já é uma superfície clara o bastante para o
                * cristal ter o que transmitir, e o halo vira uma mancha de cor
                * disputando atenção com o texto ao lado. `crystal-3d-sem-halo`
                * é a saída que o próprio token já previa.
                *
                * As partículas FICAM: são pontuais e leem como faceta captando
                * luz, não como brilho em volta.
                */}
              <Crystal
                size={190}
                className="crystal-3d-sem-halo"
                intensidade={0.5}
                animated={isAnimated}
                acento={preset.acento}
                acentoFundo={acentoProfundo(preset)}
                corpo={corpoDoCristal(preset)}
              />
            </Suspense>
          </div>
        )}

        <div className="about-identity-text">
          <p className="about-kicker">{profile.role}</p>
          {/* Texto direto. O efeito de "decriptação" que embaralhava esta frase
              antes de revelá-la saiu do projeto: ela é a primeira coisa que o
              visitante lê no guia, e atrasar a leitura da linha mais importante
              da janela para exibir um truque é o custo errado. */}
          <p className="about-highlight">{profile.bio_highlight}</p>
        </div>
      </div>

      <p className="about-bio">{profile.bio_full}</p>

      {/* --- O GUIA: quatro perguntas, cada uma com a sua porta --- */}
      <section>
        <h3 className="about-section-title">{os.about.guideLabel}</h3>
        <ul className="about-guide">
          {portas.map((id) => {
            const app = getApp(id)
            const Icone = app?.icon
            const texto = os.about.guide[id]
            if (!texto) return null

            return (
              <li key={id}>
                <button
                  type="button"
                  className="about-door"
                  onClick={() => abrir?.(id)}
                  disabled={!abrir}
                >
                  {Icone && <Icone size={18} className="about-door-icon" aria-hidden="true" />}
                  <span className="about-door-text">
                    <span className="about-door-question">{texto.question}</span>
                    <span className="about-door-answer">{texto.answer}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      {/* --- ESPECIFICAÇÕES: os fatos, lidos como ficha técnica --- */}
      <section>
        <h3 className="about-section-title">{os.about.specsLabel}</h3>
        <div className="about-specs">
          {profile.stats.map((stat, index) => (
            <div className="about-spec-card" key={index}>
              <span className="about-spec-number">{stat.number}</span>
              <span className="about-spec-label">{stat.label}</span>
              <span className="about-spec-sublabel">{stat.sublabel}</span>
            </div>
          ))}
        </div>
      </section>

      {/* --- ESTA MÁQUINA: o outro metade do winver, e desta vez é hardware
              de verdade. O marquee de skills que ficava aqui saiu: era
              decorativo, não dava para ler no próprio ritmo, e repetia o app
              de Stack — que agora é uma das portas acima. */}
      <section>
        <h3 className="about-section-title">{os.about.machineLabel}</h3>
        <dl className="about-machine">
          {profile.maquina.map((item) => (
            <div className="about-machine-row" key={item.rotulo}>
              <dt>{item.rotulo}</dt>
              <dd>{item.valor}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}

export default AboutApp
