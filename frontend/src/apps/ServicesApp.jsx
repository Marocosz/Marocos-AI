import React from 'react'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import { getServicosData } from '../content/servicos'
import { getOsData } from '../i18n/os'
import { useAbrir } from '../os/NavegacaoContext'
import './ServicesApp.css'

/**
 * SERVIÇOS — o `services.msc` do Marocos OS, e a única janela do portfólio cujo
 * trabalho é CONVERTER.
 *
 * Era o app que faltava na família. O sistema já cita `winver` (Sobre este PC),
 * `explorer` (Meus Projetos), `devmgmt.msc` (Gerenciador de Dispositivos), `cmd`
 * (Terminal) e `notepad` (leia-me.txt) — o gerenciador de serviços era o buraco
 * óbvio, e o trocadilho fecha sozinho: serviço do sistema e serviço profissional
 * são a mesma palavra, e os dois têm status e tipo de inicialização.
 *
 * ==================================================
 * A REGRA DESTE APP: TODA AFIRMAÇÃO SAI COM RECIBO.
 *
 * Nenhum card aqui reconta o que outra janela já conta. Cada um tem um resumo e
 * uma PORTA para a janela que sustenta a afirmação — hospedagem aponta para o
 * leia-me (este site roda nela), sistemas para os projetos, agentes para o Marcos
 * Virtual, automação para a jornada.
 *
 * Instrução do dono do projeto: "não seja repetitivo em relação ao que já tem no
 * projeto; dá um resumo e linka onde tem a informação". Isso é a estrutura da
 * página, não um cuidado de redação — e de quebra é o que faz ela vender PROVANDO
 * em vez de anunciar.
 *
 * AS PORTAS ABREM JANELA (`useAbrir`), NÃO TROCAM ESTA. Mesma decisão das quatro
 * portas do guia do "Sobre este PC": quem foi ver os projetos ainda pode querer
 * os outros três serviços.
 *
 * ==================================================
 * O QUE MUDOU NA SEGUNDA PASSADA, e cada item é pedido do dono do projeto:
 *
 *   1. O HERÓI VIROU UMA PERGUNTA, com um glifo grande. Antes era o cabeçalho
 *      padrão de app ("4 serviços. Todos em execução."), que é rótulo de janela —
 *      e esta janela precisa abrir falando com quem está com um problema na mão.
 *   2. OS SERVIÇOS VIRARAM UMA GRADE 2x2. Era uma lista de linhas.
 *   3. O FLUXOGRAMA VIROU VERTICAL ALTERNADO, com o trilho no meio. Era
 *      horizontal, e cada etapa tinha ~130px para explicar um processo de venda.
 *   4. A FICHA DA MÁQUINA VIROU UM MONITOR desenhado.
 *   5. TUDO GANHOU AR. "Os textos estão muito grudados" — e a mesma correção foi
 *      aplicada ao "Sobre este PC", que tinha os mesmos vãos.
 */

/**
 * O GLIFO DO HERÓI — um "?" tipográfico, e não um SVG desenhado.
 *
 * A escolha foi deliberada: o projeto já tem um gesto para "número/letra em
 * destaque" (o gradiente clipado no texto do `.about-nome`, do `.devices-numero` e
 * da capa da Jornada), e reusá-lo aqui dá um glifo que escala com a JANELA, herda
 * a fonte do preset (o XP troca para Tahoma e o "?" acompanha) e não precisa de
 * arte nova para manter.
 *
 * Um SVG desenhado teria de decidir curvas de interrogação à mão, ficaria preso a
 * uma fonte que o preset pode trocar, e seria um arquivo a mais para envelhecer.
 */
const GlifoPergunta = () => (
  <span className="services-glifo" aria-hidden="true">
    <span className="services-glifo-marca">?</span>
  </span>
)

const ServicesApp = () => {
  const { language } = useLanguage()
  const { isAnimated } = useTheme()
  const content = getServicosData(language)
  const os = getOsData(language)
  const t = os.services
  const abrir = useAbrir()

  return (
    /**
     * O INTERRUPTOR DE MOVIMENTO CHEGA NUMA CLASSE SÓ, na raiz — mesma solução do
     * "Sobre este PC". Este app tem três coisas que se movem (o pulso do trilho, os
     * pontos de "em execução" e a luz no hover), e um marcador na raiz é o que
     * impede a quarta de inventar um quarto jeito de obedecer ao interruptor.
     */
    <div className={`services-app${isAnimated ? '' : ' services-app--sem-movimento'}`}>
      {/* ==========================================================
          1. O HERÓI — uma pergunta, não um rótulo de janela.

          TEXTO À ESQUERDA, GLIFO À DIREITA, e a ordem não é gosto: é a lição
          registrada no `AboutApp.css`. Com a arte antes do texto, o herói inteiro
          nasce ~200px para dentro, e a janela perde a espinha à esquerda que
          alinha título, cards e seções.
          ========================================================== */}
      <header className="services-heroi">
        <div className="services-heroi-texto">
          <p className="services-eyebrow">{content.sectionLabel}</p>
          <h2 className="services-titulo">{content.title}</h2>
          <p className="services-sub">{content.subtitle}</p>

          {/* A contagem é DERIVADA. Este projeto já teve quatro literais
              envelhecerem em texto visível; um quinto não vai nascer aqui. */}
          <p className="services-heroi-status">
            <span className="services-status-ponto" aria-hidden="true" />
            {content.statusLinha.replace('%d', content.servicos.length)}
          </p>
        </div>

        <GlifoPergunta />
      </header>

      {/* ==========================================================
          2. OS SERVIÇOS — grade 2x2.

          A ANATOMIA É A DAS PASTAS DA STACK, e isso é deliberado: aquele desenho
          (tile de ícone com gradiente do acento, badge no topo direito, ícone
          fantasma recortado no canto) já foi aprovado pelo dono do projeto e já é
          linguagem do sistema. Quatro retângulos de mesma largura, mesmo raio e
          mesma borda seriam template; quatro cards com hierarquia interna e uma
          marca d'água são um componente.

          Sem a ABA das pastas: lá ela diz "isto é uma pasta e abre". Aqui o card
          não abre — ele leva a outra janela, e prometer pasta seria mentir.
          ========================================================== */}
      <ul className="services-grade" aria-label={t.listLabel}>
        {content.servicos.map((servico) => {
          const Icone = servico.icon
          return (
            <li key={servico.id}>
              <button
                type="button"
                className={`services-card${servico.destaque ? ' services-card--destaque' : ''}`}
                onClick={() => abrir?.(servico.prova)}
                disabled={!abrir}
              >
                <span className="services-tile" aria-hidden="true">
                  <Icone size={20} strokeWidth={1.75} />
                </span>

                {/* O status é a piada E a informação: mono, caixa alta, com o
                    pontinho pulsando — a mesma marca do "aberto a freelance" do
                    herói do "Sobre este PC", que é o mesmo fato dito de outro
                    jeito. */}
                <span className="services-card-badge">
                  <span className="services-status-ponto" aria-hidden="true" />
                  {t.running}
                </span>

                <span className="services-card-nome">{servico.nome}</span>
                <span className="services-card-desc">{servico.descricao}</span>

                <span className="services-card-pe">
                  <span className="services-card-inicio">
                    {t.startup[servico.inicializacao]}
                  </span>
                  <span className="services-card-prova">
                    {servico.provaRotulo}
                    <ChevronRight size={14} aria-hidden="true" />
                  </span>
                </span>

                {/**
                  * O FANTASMA nasce meio para fora da caixa: é o recorte que o faz
                  * ler como marca d'água em vez de um segundo ícone.
                  *
                  * E ELE VIVE NUMA CAMADA DE RECORTE PRÓPRIA, não direto no botão.
                  * A Stack consegue pôr `overflow: hidden` no card porque o hover
                  * dela é uma luz de RODAPÉ; aqui o hover é o anel que percorre a
                  * borda, e anel vive em `inset: -1px` — `overflow: hidden` no
                  * botão o clipa no padding box e o efeito some. A lição está
                  * escrita em `.about-acao`, e custou 88 pixels de referência
                  * visual para ser aprendida.
                  */}
                <span className="services-card-recorte" aria-hidden="true">
                  <Icone className="services-fantasma" />
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {/* ==========================================================
          3. COMO FUNCIONA — a timeline vertical alternada.

          O TRILHO FICA NO MEIO e as etapas caem alternadas: a 1 à esquerda, a 2 à
          direita, a 3 à esquerda. Pedido do dono do projeto, e ele resolve um
          problema real da versão anterior: horizontal, cada etapa tinha ~130px de
          coluna — espaço para duas linhas de texto, o que é pouco para explicar um
          processo de contratação. Em zigue-zague cada uma tem quase metade da
          janela, e aí a venda cabe.

          Continua sendo um PIPELINE e não uma linha do tempo: a Jornada já é uma
          timeline com playhead, e o que separa as duas é o pulso atravessando o
          trilho — um pacote passando por estágios, que é o desenho de um deploy.
          ========================================================== */}
      <section className="services-secao">
        <p className="services-eyebrow services-secao-eyebrow">{t.flowLabel}</p>
        <h3 className="services-headline">
          {t.flowHeadline.replace('%d', content.etapas.length)}
        </h3>

        {/* `<ol>` e não `<ul>`: a ordem das etapas É a informação. */}
        <ol className="services-fluxo">
          {content.etapas.map((etapa, indice) => (
            <li
              className="services-etapa"
              key={etapa.id}
              /**
               * A POSIÇÃO NA FILA VIAJA PARA O CSS, e é o que sincroniza cada
               * marcador com o feixe que percorre o trilho: o círculo acende quando
               * a luz chega nele, com `animation-delay` proporcional.
               *
               * OS DOIS VALORES SÃO DERIVADOS — o índice e o TOTAL. Escrever "5" no
               * CSS faria a sexta etapa acender fora de hora, e ninguém ligaria uma
               * coisa à outra ao acrescentá-la.
               */
              style={{ '--etapa-i': indice, '--etapa-n': content.etapas.length }}
            >
              {/* O número vem do índice (ver `content/servicos.js`), então
                  acrescentar uma etapa no meio não deixa dois "3" na tela. */}
              <span className="services-etapa-marca" aria-hidden="true">
                {etapa.numero}
              </span>
              <div className="services-etapa-corpo">
                <span className="services-etapa-titulo">{etapa.titulo}</span>
                <p className="services-etapa-texto">{etapa.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ==========================================================
          4. A MÁQUINA — um monitor desenhado, com a ficha dentro da tela.

          A seção GANHOU HEADLINE porque passou a afirmar. Antes era ficha técnica
          pura, e ficha técnica não afirma — lista. O que ela afirma agora é o
          argumento comercial que o dono do projeto pediu para destacar: uma VPS
          própria não tem catálogo de recursos, o teto é o hardware.

          O monitor é ARTE DESENHADA, a mesma categoria dos gradientes da
          cerimônia — chassi, tela, pé e base em CSS, sem imagem. Ele existe porque
          uma ficha solta no meio de uma página de venda lê como rodapé; dentro de
          uma tela, ela lê como a máquina se reportando.
          ========================================================== */}
      <section className="services-secao">
        <p className="services-eyebrow services-secao-eyebrow">{t.machineLabel}</p>
        <h3 className="services-headline">{t.machineHeadline}</h3>
        <p className="services-lead">{t.machineLead}</p>

        <figure className="services-monitor">
          <div className="services-monitor-chassi">
            <div className="services-monitor-tela">
              <div className="services-monitor-barra">
                <span className="services-monitor-luzes" aria-hidden="true" />
                <span className="services-monitor-nome">{content.maquina.janela}</span>
                <span className="services-monitor-status">
                  <span className="services-status-ponto" aria-hidden="true" />
                  {content.maquina.status}
                </span>
              </div>

              <dl className="services-ficha">
                {content.maquina.linhas.map((linha) => (
                  <div className="services-ficha-row" key={linha.rotulo}>
                    <dt>{linha.rotulo}</dt>
                    <dd>{linha.valor}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* O pé e a base são o que fazem a caixa ler como MONITOR e não como
              mais um card com borda grossa. */}
          <span className="services-monitor-pe" aria-hidden="true" />
          <span className="services-monitor-base" aria-hidden="true" />
        </figure>
      </section>

      {/* ==========================================================
          5. A AÇÃO — a única superfície preenchida de largura cheia.

          NÃO REPETE CANAL NENHUM: abre o terminal, que é onde os endereços moram.
          Decisão do dono do projeto — "não quero repetir informação, quero que ele
          use elas mandando a pessoa ir até a determinada janela com elas".
          ========================================================== */}
      <button
        type="button"
        className="services-acao"
        onClick={() => abrir?.('terminal')}
        disabled={!abrir}
      >
        <span className="services-acao-texto">
          <span className="services-acao-titulo">{t.acao.titulo}</span>
          <span className="services-acao-sub">{t.acao.sub}</span>
        </span>
        <ArrowRight size={18} className="services-acao-seta" aria-hidden="true" />
      </button>
    </div>
  )
}

export default ServicesApp
