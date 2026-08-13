import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
/* O CSS DO BALÃO É IMPORTADO AQUI, e não por quem chama o hook — ver o cabeçalho
   de `DicaBalao.css`: este arquivo é quem EMITE as classes, e o Vite divide CSS por
   chunk. Enquanto as regras viviam em `Dica.css`, o balão do `TextoCortado`
   aparecia sem estilo nenhum em toda rota que não carregasse a `Dica`. */
import './DicaBalao.css'

/** Folga entre o alvo e o balão, e até a borda da tela ao reposicionar. */
const FOLGA = 8

/**
 * O BALÃO DO SISTEMA, SEM O ALVO.
 * --------------------------------------------------
 * Este arquivo nasceu de uma extração: todo o mecanismo de balão morava dentro
 * de `ui/Dica.jsx`, acoplado ao alvo dele — um botãozinho de interrogação. Quando
 * apareceu o segundo consumidor (`ui/TextoCortado.jsx`, que precisa do MESMO
 * balão pendurado num pedaço de texto qualquer), copiar a mecânica seria criar
 * dois balões que divergem na primeira correção.
 *
 * Então o que ficou aqui é a parte difícil, e ela é difícil por três razões que
 * custaram depuração — as três estão preservadas do cabeçalho original:
 *
 * 1. RECORTE. Sendo `absolute`, o balão ficava preso ao corpo da janela, que tem
 *    `overflow-y: auto` — e o CSS não deixa um eixo rolar e o outro transbordar:
 *    com `overflow-y` em `auto`, o `overflow-x` deixa de ser `visible` sozinho.
 *    Daí dois defeitos com uma causa só: o balão aparecia cortado, e a janela
 *    ganhava uma barra de rolagem horizontal sem nada para rolar.
 *
 * 2. `position: fixed` NÃO BASTOU, e o motivo é fácil de esquecer: um ancestral
 *    com `transform` vira o bloco de contenção de descendentes `fixed`, que
 *    passam a se posicionar em relação a ELE e não à viewport. A janela é um
 *    `motion.div` cuja posição é justamente um `translate`. Maximizada o
 *    translate é zero e o balão caía no lugar certo por coincidência;
 *    restaurada — ou depois de arrastar — ele saía deslocado exatamente pela
 *    posição da janela.
 *
 * 3. MAS O DESTINO DO PORTAL NÃO PODE SER O `body`. Foi a primeira tentativa, e o
 *    balão parou de seguir o tema e o preset: ficava sempre com a paleta padrão,
 *    de noite, de dia e no XP. O motivo está em `os/tokens.css` — as classes de
 *    tema ficam numa DIV do `Shell`, não no `<html>`, porque custom property
 *    resolve pelo ancestral mais próximo que a declara. Portado para o `body`, o
 *    balão vive FORA dessa div e `--win-body-solid` e `--accent-color` deixam de
 *    resolver.
 *
 *    Então o destino é a própria div de tema, encontrada subindo a partir do alvo
 *    com `closest()`. Isso mantém o mecanismo sem saber que o `Shell` existe (ele
 *    procura uma CLASSE, não um id combinado), continua fora do `overflow` da
 *    janela, e continua sem ancestral transformado.
 *
 * MEDIR NA ABERTURA, e não na montagem: o alvo pode ter rolado, a janela pode ter
 * sido arrastada, e uma medida velha põe o balão longe do que ele explica.
 */
export const useBalao = (posicao = 'acima') => {
  const id = useId()
  const [visivel, setVisivel] = useState(false)
  const [coords, setCoords] = useState(null)
  const alvoRef = useRef(null)

  /**
   * Onde o balão vai morar — resolvido na montagem, porque `closest()` precisa
   * do nó já no documento. Enquanto não resolve, o balão não é renderizado: ele
   * nasce invisível de qualquer forma, então não há nada a perder num quadro.
   */
  const [destino, setDestino] = useState(null)

  useEffect(() => {
    setDestino(alvoRef.current?.closest('.theme-dark, .theme-light') ?? null)
  }, [])

  const medir = () => {
    const r = alvoRef.current?.getBoundingClientRect()
    if (!r) return

    const meio = r.left + r.width / 2
    // Metade da largura máxima do balão (240px no CSS) mais a folga: é o quanto
    // ele precisa de cada lado para não encostar na borda.
    const meia = 128
    const largura = typeof window === 'undefined' ? 0 : window.innerWidth

    setCoords({
      x: Math.min(Math.max(meio, meia + FOLGA), Math.max(meia + FOLGA, largura - meia - FOLGA)),
      y: posicao === 'abaixo' ? r.bottom + FOLGA : r.top - FOLGA,
    })
  }

  const mostrar = () => {
    medir()
    setVisivel(true)
  }

  const esconder = () => setVisivel(false)

  /**
   * Devolve o balão já portado, ou `null` enquanto o destino não resolveu.
   *
   * `ocultoDeLeitor` existe por causa do segundo consumidor: no `TextoCortado` o
   * texto completo JÁ ESTÁ no DOM (o corte é só visual, feito por
   * `text-overflow: ellipsis`), então um leitor de tela leria o mesmo nome duas
   * vezes se o balão participasse da árvore de acessibilidade. Na `Dica` é o
   * oposto — lá o balão é a única fonte da explicação, e tem de ser lido.
   */
  const renderBalao = (texto, { ocultoDeLeitor = false } = {}) =>
    destino
      ? createPortal(
          <span
            id={ocultoDeLeitor ? undefined : id}
            role={ocultoDeLeitor ? undefined : 'tooltip'}
            aria-hidden={ocultoDeLeitor ? 'true' : undefined}
            className={`dica-balao dica-balao--${posicao}${visivel ? ' dica-balao--visivel' : ''}`}
            style={coords ? { left: `${coords.x}px`, top: `${coords.y}px` } : undefined}
          >
            {texto}
          </span>,
          destino,
        )
      : null

  return { alvoRef, id, visivel, mostrar, esconder, renderBalao }
}

export default useBalao
