import React, { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import { getTechData, contarNiveis } from '../content/tech'
import { getOsData } from '../i18n/os'
import { MOVIMENTO } from '../config/system'
import AppHeader from '../ui/AppHeader'
import TextoCortado from '../ui/TextoCortado'
import './DevicesApp.css'

/**
 * Gerenciador de Dispositivos — a stack técnica como uma grade de PASTAS.
 *
 * O design anterior era uma árvore de acordeão no espírito do Gerenciador de
 * Dispositivos do Windows: quatro nós com chevron, e dentro de cada um uma tabela
 * DISPOSITIVO / STATUS. Funcionava, mas era quatro linhas de texto numa janela de
 * 620x520 — a categoria não tinha presença nenhuma até ser aberta, e nada dizia de
 * relance o tamanho de cada uma.
 *
 * Agora cada categoria é uma pasta, com a anatomia que o dono do projeto pediu: tile de
 * ícone com gradiente no canto superior esquerdo, ícone fantasma grande e recortado
 * embaixo à direita, badge de níveis no topo direito, título, o número de tecnologias em
 * tipo grande e uma ação. O número e o badge são DERIVADOS dos dados (ver
 * `contarNiveis`), então não existe contagem escrita para envelhecer.
 *
 * AO ABRIR, A PASTA VIRA LARGURA CHEIA e empurra as outras na esteira da grade — é o
 * `grid-column: 1 / -1` do CSS. Custo aceito e conhecido: abrir uma pasta da coluna
 * direita deixa um vão ao lado do par dela, porque é assim que a grade reflui. A
 * alternativa seria `grid-auto-flow: dense`, que puxaria uma pasta posterior para o vão
 * — e aí a ordem das categorias (IA primeiro, de propósito) passaria a mentir.
 *
 * O MECANISMO DE EXPANDIR JÁ EXISTIA — era um acordeão de altura. A TRANSIÇÃO mudou por
 * inteiro: hoje quem anima posição e tamanho é o `layout` do motion, porque com a grade
 * reflui-se meia tela a cada clique e animar só a altura fazia as pastas teleportarem
 * para a linha de baixo. `MOVIMENTO.acordeaoDispositivos` saiu do config junto.
 *
 * Não sabe que janelas existem.
 */
const DevicesApp = () => {
  const { language } = useLanguage()
  const content = getTechData(language)
  const os = getOsData(language)
  const { isAnimated } = useTheme()
  const prefereMenosMovimento = useReducedMotion()

  /**
   * AS DUAS CHAVES, como o resto do sistema: o interruptor de Movimento das
   * Configurações e o `prefers-reduced-motion`. Qualquer uma desligada tira a esteira e
   * a entrada escalonada — e aí as pastas voltam a saltar, que é o que essa preferência
   * aceita. Animar meia grade é exatamente o que ela pede para não ter.
   */
  const semMovimento = !isAnimated || prefereMenosMovimento

  /**
   * A ESTEIRA — cada pasta VIAJA até o lugar novo em vez de teleportar.
   *
   * Quando uma abre, ela vira largura cheia e o CSS reposiciona as outras no mesmo
   * quadro: elas saltavam para a linha de baixo. `layout` faz o motion medir a posição
   * antes e depois e animar a diferença por transform — o que cobre TODAS as combinações
   * de abrir e fechar sem uma regra por caso, que é o que a mão nunca daria conta.
   *
   * Quem pede menos movimento recebe `false`, e aí o salto volta — mas salto é o que
   * essa preferência aceita; animar meia grade é exatamente o que ela pede para não ter.
   */
  const animarEsteira = !semMovimento

  /**
   * A COREOGRAFIA DE ABRIR: a caixa viaja VAZIA, e os itens entram depois.
   *
   * `layout` anima o tamanho por ESCALA, e tudo que está dentro é esticado junto — o
   * conteúdo aparecia distorcido durante a viagem. Segurar a entrada até a caixa assentar
   * resolve na origem: a distorção continua acontecendo, só que onde não há o que
   * distorcer.
   *
   * O atraso é a duração da esteira, LIDA do config em vez de escrita de novo — dois
   * valores que precisam ser iguais não sobrevivem a estar em dois lugares.
   *
   * FECHAR NÃO TEM ANIMAÇÃO DE SAÍDA, e a ausência é o conserto de um bug que eu mesmo
   * criei. A primeira versão tinha `AnimatePresence` com saída escalonada, e o resultado
   * era grotesco: a classe `--aberta` sai no mesmo quadro do clique (a pasta volta a uma
   * coluna da grade) enquanto o conteúdo AINDA está montado esperando o escalonamento
   * terminar — a grade de itens refluía numa coluna estreita e altíssima, e a caixa
   * esticava até o fim da janela antes de encolher.
   *
   * Desmontando na hora, a viagem de volta é vazia pelo mesmo motivo que a de ida:
   * `layout` mede a caixa cheia antes e a pequena depois, e anima entre as duas. É
   * simétrico, e é como uma pasta fecha de verdade.
   */
  const variantesCaixa = semMovimento
    ? {}
    : {
      oculto: {},
      visivel: {
        transition: {
          delayChildren: MOVIMENTO.esteiraStack.duration,
          staggerChildren: MOVIMENTO.itensStack.escalonamento,
        },
      },
    }

  const variantesFilho = semMovimento
    ? {}
    : {
      oculto: { opacity: 0, y: 8 },
      visivel: {
        opacity: 1,
        y: 0,
        transition: { duration: MOVIMENTO.itensStack.duration, ease: 'easeOut' },
      },
    }

  /**
   * TODAS NASCEM FECHADAS, e a razão mudou junto com o design.
   *
   * Antes a primeira categoria abria sozinha porque quatro linhas de árvore deixavam a
   * janela parecendo vazia. Quatro pastas já preenchem a grade e já dizem do que se
   * trata — abrir uma na chegada só empurraria as outras para fora da dobra antes de o
   * visitante escolher alguma coisa.
   *
   * Consequência que precisa de teste: a grade de itens passa a ser código que só
   * existe depois de um clique, e o regressor visual fotografa o repouso. Ver o teste
   * em `rotas.spec.js` — é a mesma lição que aquele arquivo já documenta sobre grupo
   * colapsado e painel fechado.
   */
  const [abertas, setAbertas] = useState(() => new Set())

  const alternar = (id) => {
    setAbertas((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="devices-app">
      <AppHeader
        eyebrow={content.sectionLabel}
        titulo={content.title}
        subtitulo={content.subtitle}
        escala="sm"
      />

      <ul className="devices-grade">
        {content.items.map((cat) => {
          const Icone = cat.icon
          const aberta = abertas.has(cat.id)
          const niveis = contarNiveis(cat.items)
          const corpoId = `devices-corpo-${cat.id}`

          return (
            <motion.li
              key={cat.id}
              layout={animarEsteira}
              transition={MOVIMENTO.esteiraStack}
              className={`devices-pasta${aberta ? ' devices-pasta--aberta' : ''}`}
            >
              {/* A ABA DA PASTA — elemento irmão, atrás do corpo.
                  Não é `clip-path`: `polygon()` desenharia a silhueta com uma
                  propriedade só, mas custa os cantos arredondados (polígono só tem
                  vértices) e mata a borda; `path()` aceita curvas mas exige coordenadas
                  absolutas, e a largura da pasta varia com a grade. Como a aba e o corpo
                  têm o mesmo preenchimento, a sobreposição esconde a emenda. */}
              <span className="devices-aba" aria-hidden="true" />

              <div className="devices-corpo">
                {/* A CABEÇA É O BOTÃO, e a grade de itens é IRMÃ dela — nunca dentro.
                    O card inteiro é o alvo de clique, mas `<button>` não pode conter
                    conteúdo interativo nem listas complexas. */}
                <button
                  type="button"
                  className="devices-cabeca"
                  aria-expanded={aberta}
                  aria-controls={corpoId}
                  onClick={() => alternar(cat.id)}
                >
                  <span className="devices-tile" aria-hidden="true">
                    <Icone size={20} strokeWidth={1.75} />
                  </span>

                  {/**
                    * SÓ O NÍVEL MAIS FORTE, e não a distribuição inteira.
                    *
                    * A primeira versão concatenava os três ("2 expert · 3 avançado · 1
                    * intermediário") e vazava a borda do card — 240px não cabem isso, e
                    * o badge do print é curto de propósito. Badge é destaque, não
                    * relatório: a distribuição completa está nos chips de cada item,
                    * a um clique de distância.
                    *
                    * `contarNiveis` devolve em ordem fixa do mais forte para o mais
                    * fraco, então `[0]` é sempre o mais forte que a categoria tem.
                    */}
                  {niveis[0] && (
                    <span className="devices-badge">
                      {niveis[0].total} {os.devices.niveis[niveis[0].nivel]}
                    </span>
                  )}

                  <span className="devices-titulo">{cat.title}</span>
                  <span className="devices-numero">{cat.items.length}</span>
                  <span className="devices-rotulo">{os.devices.tecnologias}</span>

                  {/* Um `<span>` e não um link: o card inteiro já é o botão, e uma
                      âncora aqui dentro seria alvo interativo dentro de alvo
                      interativo. */}
                  <span className="devices-acao">
                    {aberta ? os.devices.fechar : os.devices.abrir}
                    <ChevronRight size={14} aria-hidden="true" />
                  </span>

                  {/* O FANTASMA VIVE NA CABEÇA, não na pasta. Ancorado na pasta, ele
                      iria para o rodapé quando ela abrisse — atrás da grade de itens.
                      Aqui fica sempre no canto do cabeçalho, recortado pela borda. */}
                  <Icone className="devices-fantasma" aria-hidden="true" />
                </button>

                {/* SEM animação de altura e SEM `AnimatePresence`. A caixa monta no
                    tamanho final e quem anima posição E tamanho é o `layout` da pasta —
                    duas animações na mesma altura davam tranco, e uma saída animada
                    deixava o conteúdo montado enquanto a largura já havia colapsado (ver
                    a nota sobre o bug em `variantesCaixa`).
                    O que esta subárvore anima é só a ENTRADA do conteúdo, atrasada até a
                    viagem acabar. */}
                {aberta && (
                  <motion.div
                    id={corpoId}
                    className="devices-itens-caixa"
                    variants={variantesCaixa}
                    initial="oculto"
                    animate="visivel"
                  >
                    <motion.p className="devices-desc" variants={variantesFilho}>
                      {cat.description}
                    </motion.p>

                    <ul className="devices-itens">
                      {cat.items.map((tech) => (
                        <motion.li
                          key={tech.name}
                          className="devices-item"
                          variants={variantesFilho}
                        >
                          {/* A cor de MARCA vem dos dados — a exceção documentada do
                              projeto: ela significa algo, e seguir o tema faria o
                              Python deixar de ser azul. */}
                          <span
                            className="devices-ponto"
                            style={{ backgroundColor: tech.color, color: tech.color }}
                            aria-hidden="true"
                          />
                          {/* O NOME PODE NÃO CABER, e a coluna é estreita de
                              propósito (190px na grade). `TextoCortado` mantém as
                              reticências e revela o nome inteiro num balão do
                              sistema no hover e no foco — mas SÓ quando o texto
                              foi de fato cortado, senão metade dos chips ganharia
                              um balão sem ter o que mostrar. Ver o cabeçalho de
                              `ui/TextoCortado.jsx`. */}
                          <TextoCortado texto={tech.name} className="devices-item-nome" />
                          <span
                            className={`devices-item-nivel level-${tech.level.toLowerCase()}`}
                          >
                            {os.devices.niveis[tech.level.toLowerCase()]}
                          </span>
                          <span className="devices-item-desc">{tech.tooltip}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}

export default DevicesApp
