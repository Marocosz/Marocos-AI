import React, { useEffect, useMemo, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import {
  Disc3, Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, ChevronsRight,
} from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import { getJourneyData, posicaoNaLinha } from '../content/journey'
import { MOVIMENTO } from '../config/system'
import TextoCortado from '../ui/TextoCortado'
import './HistoryApp.css'

/**
 * A JORNADA COMO PLAYER — e a barra de progresso é a linha do tempo.
 *
 * O design anterior era um `git log` vertical: seis cards empilhados com hash, badge
 * de tipo, data, título, organização, descrição e tags. Funcionava e usava bem os
 * dados. O problema não era o card — era o que a lista NÃO conseguia dizer.
 *
 * Os anos das entradas são 2018 · 2019 · 2022 · 2024 · 2025 · PRÓXIMO. Numa lista de
 * cards de altura igual esses números são só texto: ninguém sente os três anos entre
 * 2019 e 2022. A informação mais interessante da trajetória — que ela ACELERA — está
 * nos vãos, e a lista apagava os vãos.
 *
 * Num player o scrubber mapeia posição → tempo. Aqui mapeia posição → ano, com cada
 * marcador em posição proporcional (ver `posicaoNaLinha` em `content/journey.js`).
 * Todo o resto do vocabulário de player existe para tornar essa barra legível: uma
 * barra de tempo sozinha, sem "agora tocando", sem controles e sem lista de faixas,
 * seria um gráfico, não uma interface.
 *
 * O `git log` NÃO morreu — virou o mostrador técnico. Players mostram bitrate e
 * codec; este mostra `commit f4c1a09 · release · 5 tags`. É onde `hash` e `type`
 * cabem sem virar dado órfão, e é a voz mono da máquina continuando.
 *
 * O app não sabe que janelas existem, e o chrome de explorador da janela não muda: a
 * metáfora vive só aqui dentro.
 */
const HistoryApp = () => {
  const { language } = useLanguage()
  const { isAnimated } = useTheme()
  const prefereMenosMovimento = useReducedMotion()
  const content = getJourneyData(language)

  /**
   * A ORDEM DA TELA É CRONOLÓGICA, e a do array não é.
   *
   * `journey.js` guarda do mais recente para o mais antigo, por uma razão que continua
   * boa (registrada lá). Mas uma linha do tempo da esquerda para a direita TEM de ser
   * cronológica, ou os vãos entre marcadores não significam nada. Ordenar aqui mantém
   * as duas decisões: a estrutura é cronológica e a ATENÇÃO fica na entrada mais
   * recente, que é a que nasce selecionada logo abaixo.
   *
   * Ordena por `ano`, e não por índice invertido: assim continua certo se alguém
   * reordenar o array ou acrescentar uma entrada no meio. E copia antes (`[...]`)
   * porque `sort` MUTA — mutar o array do módulo de conteúdo mudaria em runtime a
   * ordem que `journey.js` documenta, inclusive para o próximo consumidor.
   */
  const faixas = useMemo(
    () =>
      [...content.items].sort((a, b) => {
        if (Boolean(a.futuro) !== Boolean(b.futuro)) return a.futuro ? 1 : -1
        return a.ano - b.ano
      }),
    [content.items],
  )

  /**
   * A última entrada que JÁ ACONTECEU — o cargo atual, que é o que o visitante veio
   * saber. O roadmap fica visível na barra como marcador vazado, mas não é o que abre:
   * abrir com o que se pretende ser, antes do que se é, lê como ambição no lugar de
   * entrega (é a mesma razão que põe o roadmap por último em `journey.js`).
   */
  const indiceInicial = useMemo(
    () => faixas.reduce((acc, f, i) => (f.futuro ? acc : i), 0),
    [faixas],
  )

  const [indice, setIndice] = useState(indiceInicial)
  const [passeando, setPasseando] = useState(false)

  /* O ano atual entra na conta da barra. Lido aqui, e não dentro da função pura — ver
     a nota em `posicaoNaLinha`. */
  const anoAtual = new Date().getFullYear()

  /* O primeiro ano da trajetória, para a legenda dizer quantos anos ela cobre sem
     ninguém escrever o número. `filter` porque a entrada de roadmap não tem `ano` —
     um `Math.min` sobre `undefined` devolveria `NaN` e a frase sairia "NaN anos". */
  const primeiroAno = Math.min(...faixas.filter((f) => !f.futuro).map((f) => f.ano))

  /**
   * O PASSEIO SÓ EXISTE SE HOUVER MOVIMENTO, e aqui ele SOME em vez de parar.
   *
   * É uma divergência consciente em relação à luz de hover do "Sobre este PC", que
   * continua acendendo parada. A distinção: a luz é RETORNO — sem ela o visitante
   * perde o único sinal de que o alvo é clicável. O passeio é o próprio MOVIMENTO;
   * sem ele o botão não tem função nenhuma, e botão que não faz nada é pior que
   * botão nenhum.
   */
  const mostrarPasseio = isAnimated && !prefereMenosMovimento

  /**
   * Qualquer navegação manual pausa o passeio. Conteúdo se mexendo depois de a pessoa
   * ter escolhido outra coisa é hostil — e é a razão pela qual o passeio automático
   * quase nunca vale a pena. Aqui vale porque ele é opt-in e desiste na primeira
   * discordância.
   */
  const irPara = (i) => {
    setIndice(Math.min(faixas.length - 1, Math.max(0, i)))
    setPasseando(false)
  }

  /** "Percorrer do início": salta para a primeira e caminha. Não dá laço — uma
   *  carreira não repete. */
  const alternarPasseio = () => {
    if (passeando) {
      setPasseando(false)
      return
    }
    setIndice(0)
    setPasseando(true)
  }

  useEffect(() => {
    if (!passeando || !mostrarPasseio) return
    /* A parada é checada ANTES de agendar, e não dentro do updater de `setIndice`: em
       StrictMode o updater roda duas vezes, e efeito colateral ali dentro duplica. */
    if (indice >= faixas.length - 1) {
      setPasseando(false)
      return
    }
    const id = setTimeout(() => setIndice((i) => i + 1), MOVIMENTO.jornadaPasseioS * 1000)
    return () => clearTimeout(id)
  }, [passeando, mostrarPasseio, indice, faixas.length])

  const atual = faixas[indice]
  const posicaoAtual = posicaoNaLinha(faixas, atual, anoAtual)

  /**
   * NÃO HÁ MAIS SETAS DE TECLADO NA BARRA, e a perda é nenhuma.
   *
   * Elas existiam porque a barra tinha um botão por entrada e era um alvo de foco. A
   * barra virou decorativa (o dono do projeto pediu a linha limpa, sem marcadores),
   * então não há o que focar ali — e os cinco controles logo abaixo são botões de
   * verdade, alcançáveis por Tab, que fazem exatamente o mesmo. Manter um `tabIndex`
   * numa barra decorativa seria criar um ponto de parada de teclado que não responde
   * a nada.
   */

  return (
    <div className="history-app">
      {/* CABEÇALHO PRÓPRIO, E NÃO O `ui/AppHeader` — a razão é medida, não gosto.
          Na escala `md` aquele componente ocupa ~90px dos 520 de altura útil, e com
          ele a BARRA DO TEMPO nascia cortada pela dobra, junto com os controles e as
          faixas. Cortar o argumento do design para exibir um título que a barra de
          título da janela já mostra é a troca errada.
          Sobrou eyebrow + legenda: ~40px, e o player inteiro cabe acima da dobra. A
          lista de faixas rola, como a fila de um player de verdade. */}
      <header className="history-cabecalho">
        <p className="history-eyebrow">{content.sectionLabel}</p>
        {/* OS DOIS NÚMEROS DA LEGENDA SÃO DERIVADOS — ver a nota em
            `content/journey.js`. Esta frase já disse "sete anos em seis faixas"
            enquanto eram oito e sete: envelheceu nas DUAS pontas ao mesmo tempo,
            o que é o argumento final contra escrever quantidade à mão.
            `%a` conta do primeiro ano da trajetória até hoje, e não até a última
            entrada — é a mesma leitura que a barra faz. */}
        <p className="history-legenda">
          {content.subtitle
            .replace('%a', String(anoAtual - primeiroAno))
            .replace('%b', String(faixas.length))}
        </p>
      </header>

      <div className="history-corpo">
        <div className="history-coluna">
          {/* --- O PLAYER, NUMA CAIXA SÓ ---
                  Borda em volta de tudo que é o aparelho: da linha de meta até os
                  botões. É o que faz aquilo ler como um dispositivo em vez de três
                  blocos soltos um embaixo do outro — e é o que permite a barra e os
                  controles ficarem SEMPRE na mesma altura.

                  A caixa tem altura mínima calculada para a entrada de descrição mais
                  longa. Sem isso, trocar de faixa mexia a barra e os botões de lugar,
                  porque cada descrição tem um número diferente de linhas — e controle
                  que se move sob o cursor é o oposto de um player. */}
          <section className={`history-player history-player--${atual.type}`}>
            {/* --- 1. AGORA TOCANDO --- */}
            <div className="history-agora">
            {/* A CAPA É O ANO, em tipo grande com o gradiente de texto do projeto — o
                mesmo gesto do nome no herói do "Sobre" e dos números de destaque. É
                honesto (o ano É a identidade da entrada) e não pede asset novo.
                `aria-hidden` porque o ano já está no `history-data` abaixo, com a
                data completa: para leitor de tela a capa é repetição.

                A ENTRADA FUTURA GANHA SETAS EM VEZ DE PALAVRA. Ela não tem ano, e
                "PRÓXIMO" em tipo de capa vazava o quadrado — a palavra é longa e a
                caixa tem 116px. Setas de avanço rápido dizem "o que vem depois" com o
                vocabulário do próprio player, e couberam. */}
            <div className="history-capa" aria-hidden="true">
              {atual.futuro
                ? <ChevronsRight className="history-capa-setas" strokeWidth={2.5} />
                : <span className="history-capa-ano">{atual.ano}</span>}
            </div>

            {/**
              * TODAS AS SEIS ENTRADAS OCUPAM A MESMA CÉLULA, e só a atual é visível.
              *
              * É o que faz a barra e os botões NUNCA mudarem de lugar ao trocar de
              * faixa — a exigência do dono do projeto, e ela custou duas tentativas
              * erradas antes desta:
              *
              *   1. Nada: cada descrição tem um número diferente de linhas, então os
              *      controles subiam e desciam a cada passo.
              *   2. `min-height` medido na caixa: só prende as entradas CURTAS. As
              *      longas estouram o piso e empurram tudo para baixo de novo. Medido:
              *      24px de variação na largura padrão, 94px numa janela estreita.
              *
              * Empilhando com `grid-area: 1 / 1`, a altura da célula é a da MAIOR
              * entrada — em qualquer largura, em qualquer idioma, e sem número mágico
              * para envelhecer. `visibility: hidden` preserva o espaço (ao contrário
              * de `display: none`), que é exatamente o que se quer aqui.
              *
              * As cópias inativas levam `aria-hidden`: para leitor de tela existe uma
              * entrada só. E o `aria-live` fica apenas na ativa — seis regiões vivas
              * anunciariam umas por cima das outras.
              */}
            <div className="history-agora-pilha">
              {faixas.map((f, i) => (
                <div
                  key={f.id}
                  className={
                    'history-agora-texto'
                    + (i === indice ? '' : ' history-agora-texto--oculta')
                  }
                  aria-hidden={i === indice ? undefined : 'true'}
                >
                  <p className="history-meta">
                    <span className="history-tipo">{f.type}</span>
                    <span className="history-meta-sep" aria-hidden="true">·</span>
                    <span>{f.org}</span>
                  </p>

                  {/* `aria-live` só na ativa: quem navega por teclado precisa saber que
                      a troca aconteceu. Só no título — pôr na região inteira faria o
                      leitor reler a descrição de 60 palavras a cada passo. */}
                  <h3
                    className="history-titulo"
                    aria-live={i === indice ? 'polite' : undefined}
                  >
                    {f.title}
                  </h3>

                  <p className="history-data">{f.date}</p>
                  <p className="history-desc">{f.description}</p>

                  <ul className="history-tags">
                    {f.tags.map((tag) => (
                      <li key={tag} className="history-tag">{tag}</li>
                    ))}
                  </ul>

                  {/* O MOSTRADOR TÉCNICO — é aqui que o `git log` do design anterior
                      sobrevive. Player mostra bitrate e codec; este mostra o commit. */}
                  <p className="history-readout">
                    commit {f.hash} · {f.type} · {f.tags.length} tags
                  </p>
                </div>
              ))}
            </div>
            </div>

            {/* --- 2. A LINHA DO TEMPO ---
                    BARRA DE DURAÇÃO, sem marcadores. Ela era uma lista de botões, um
                    por entrada, e os círculos mostravam os seis vãos ao mesmo tempo;
                    o dono do projeto pediu a linha limpa, como a de um player de
                    música de verdade.

                    O TEMPO CONTINUA CODIFICADO: a parte preenchida para na posição
                    proporcional ao ANO da entrada atual (ver `posicaoNaLinha`), então
                    cada passo avança um pedaço diferente da barra — o salto de 2019
                    para 2022 é três vezes o de 2024 para 2025, e isso se sente. O que
                    saiu foi a visão de conjunto, não a informação.

                    E ela é DECORATIVA agora (`aria-hidden`): sem os botões não há o
                    que focar nem o que anunciar, e os cinco controles abaixo mais a
                    lista de faixas já dão a navegação inteira. Barra decorativa com
                    `tabIndex` seria um ponto de parada de teclado que não faz nada. */}
            <div className="history-linha" aria-hidden="true">
              <div className="history-trilho">
                <div className="history-trilho-feito" style={{ width: `${posicaoAtual}%` }} />
              </div>

              <div className="history-linha-pontas">
                <span>{faixas[0]?.ano}</span>
                <span>{content.proximoCurto}</span>
              </div>
            </div>

            {/* --- 3. CONTROLES ---
                    Centralizados, como num player. Os rótulos dizem a AÇÃO ("ver a
                    entrada anterior"), não "faixa anterior": visualmente é um player,
                    semanticamente é uma trajetória. */}
            <div className="history-controles">
              {/* Coluna vazia à esquerda: é ela que faz os botões ficarem no centro
                  ÓPTICO da caixa mesmo com o contador ocupando a direita. Centralizar
                  com `justify-content: center` e o contador em `margin-left: auto`
                  empurraria o grupo para a esquerda pela largura do contador. */}
              <span aria-hidden="true" />

              <div className="history-botoes">
                <button
                  type="button"
                  className="history-btn"
                  aria-label={content.controles.primeira}
                  onClick={() => irPara(0)}
                  disabled={indice === 0}
                >
                  <SkipBack size={15} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className="history-btn"
                  aria-label={content.controles.anterior}
                  onClick={() => irPara(indice - 1)}
                  disabled={indice === 0}
                >
                  <ChevronLeft size={18} aria-hidden="true" />
                </button>

                {mostrarPasseio && (
                  <button
                    type="button"
                    className="history-btn history-btn--passeio"
                    aria-label={passeando ? content.controles.pausar : content.controles.passear}
                    aria-pressed={passeando}
                    onClick={alternarPasseio}
                  >
                    {passeando
                      ? <Pause size={15} aria-hidden="true" />
                      : <Play size={15} aria-hidden="true" />}
                  </button>
                )}

                <button
                  type="button"
                  className="history-btn"
                  aria-label={content.controles.proxima}
                  onClick={() => irPara(indice + 1)}
                  disabled={indice === faixas.length - 1}
                >
                  <ChevronRight size={18} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className="history-btn"
                  aria-label={content.controles.ultima}
                  onClick={() => irPara(faixas.length - 1)}
                  disabled={indice === faixas.length - 1}
                >
                  <SkipForward size={15} aria-hidden="true" />
                </button>
              </div>

              <span className="history-contador">
                {content.contador
                  .replace('%a', String(indice + 1))
                  .replace('%b', String(faixas.length))}
              </span>
            </div>
          </section>
        </div>

        {/* --- 4. LISTA DE FAIXAS ---
                Vira trilho à direita quando a janela é larga (ver o @container no
                CSS). A faixa ativa usa `--sup-faixa`, a mesma marca de "este é o item
                em destaque" da lateral do explorador e das ações do "Sobre" — o app
                novo consome o vocabulário do sistema em vez de inventar outro. */}
        <section className="history-faixas-secao">
          <p className="history-eyebrow">{content.faixasLabel}</p>
          <ul className="history-faixas">
            {faixas.map((f, i) => (
              <li key={f.id} className={`history-faixa-item history-faixa-item--${f.type}`}>
                <button
                  type="button"
                  className={`history-faixa${i === indice ? ' history-faixa--ativa' : ''}`}
                  aria-current={i === indice ? 'true' : undefined}
                  onClick={() => irPara(i)}
                >
                  <span className="history-faixa-num">{i + 1}</span>
                  <span
                    className={
                      'history-faixa-ponto'
                      + (f.futuro ? ' history-faixa-ponto--futuro' : '')
                    }
                    aria-hidden="true"
                  />
                  <span className="history-faixa-data">{f.date}</span>
                  {/* Os títulos de faixa são longos ("Técnico em Eletrônica, e o
                      primeiro curso que dei") e a lista é estreita, então eles
                      cortam. O balão revela o título inteiro no hover e no foco —
                      só quando de fato cortou. Ver `ui/TextoCortado.jsx`. */}
                  <TextoCortado texto={f.title} className="history-faixa-titulo" focavel={false} />
                  {i === indice && (
                    <Disc3 size={14} className="history-faixa-agora" aria-hidden="true" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

export default HistoryApp
