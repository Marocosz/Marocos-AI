import React, { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { HelpCircle } from 'lucide-react'
import './Dica.css'

/** Folga entre o alvo e o balão, e até a borda da tela ao reposicionar. */
const FOLGA = 8

/**
 * DICA — o balão de ajuda do sistema.
 * --------------------------------------------------
 * Um alvo pequeno que revela um balão no hover e no foco. Nasceu para o
 * seletor de papel de parede, onde a explicação do modo sóbrio ("sem
 * movimento, sem vidro") ocupava uma linha embaixo de cada amostra e poluía
 * uma grade que existe para ser escaneada de relance.
 *
 * NÃO USA O `title` NATIVO, e isso é o ponto. O balão do navegador tem fonte,
 * cor, atraso e posição do sistema operacional do visitante — num projeto que
 * desenha o próprio SO, ele é o único elemento que denuncia que há outro por
 * baixo. Este segue a linguagem do resto: superfície de vidro, borda do
 * sistema, raio de controle, e a mesma escala tipográfica.
 *
 * TECLADO NÃO FICA DE FORA. O alvo é um `<button>` de verdade, o balão aparece
 * no `:focus-visible` além do hover, e `aria-describedby` amarra os dois — um
 * balão que só existe no mouse é decoração, não informação.
 *
 * O balão é `pointer-events: none`: ele nunca rouba o clique de quem está
 * tentando alcançar o que está atrás dele.
 *
 * O BALÃO É RENDERIZADO FORA DA JANELA, POR PORTAL. São dois problemas
 * distintos resolvidos pela mesma decisão, e o segundo custou uma tentativa
 * errada antes.
 *
 * 1. RECORTE. Sendo `absolute`, ele ficava preso ao corpo da janela, que tem
 *    `overflow-y: auto` — e o CSS não deixa um eixo rolar e o outro
 *    transbordar: com `overflow-y` em `auto`, o `overflow-x` deixa de ser
 *    `visible` sozinho. Daí dois defeitos com uma causa só: o balão aparecia
 *    cortado, e a janela de Configurações ganhava uma barra de rolagem
 *    horizontal sem nada para rolar.
 *
 * 2. `position: fixed` NÃO BASTOU, e o motivo é fácil de esquecer: um ancestral
 *    com `transform` vira o bloco de contenção de descendentes `fixed`, que
 *    passam a se posicionar em relação a ELE e não à viewport. A janela é um
 *    `motion.div` cuja posição é justamente um `translate`. Maximizada o
 *    translate é zero e o balão caía no lugar certo por coincidência;
 *    restaurada — ou depois de arrastar — ele saía deslocado exatamente pela
 *    posição da janela.
 *
 * Com o portal não há ancestral transformado, então as coordenadas de viewport
 * que `medir()` calcula valem de verdade, e a janela pode ser arrastada para
 * onde quiser. Medir na ABERTURA (e não na montagem) é o que mantém isso
 * correto depois de arrastar ou rolar.
 *
 * 3. MAS O DESTINO NÃO PODE SER O `body`. Foi a primeira tentativa, e o balão
 *    parou de seguir o tema e o preset: ficava sempre com a paleta padrão, de
 *    noite, de dia e no XP.
 *
 *    O motivo está documentado em `os/tokens.css`: as classes de tema
 *    (`theme-dark`/`theme-light`, mais `modo-sobrio`/`modo-xp`) ficam numa DIV
 *    do `Shell`, e não no `<html>` — de propósito, porque custom property
 *    resolve pelo ancestral mais próximo que a declara. Portado para o `body`,
 *    o balão passa a viver FORA dessa div, e `--win-body-solid`,
 *    `--accent-color` e o resto deixam de resolver, caindo no `:root`.
 *
 *    Então o destino é a própria div de tema, encontrada subindo a partir do
 *    alvo com `closest()`. Isso mantém este componente sem saber que o `Shell`
 *    existe (ele procura uma CLASSE, não um id combinado), continua fora do
 *    `overflow` da janela, e continua sem ancestral transformado — a div de
 *    tema não tem transform nenhum, e a prova é que a cerimônia, que é
 *    `position: fixed` dentro dela, sempre cobriu a tela inteira.
 */
const Dica = ({ texto, rotulo, posicao = 'acima', className = '' }) => {
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

  /**
   * Mede na ABERTURA, não na montagem: o alvo pode ter rolado, a janela pode
   * ter sido arrastada, e uma medida velha põe o balão longe do que ele explica.
   */
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

  return (
    <span className={`dica ${className}`.trim()}>
      <button
        ref={alvoRef}
        type="button"
        className="dica-alvo"
        // O rótulo acessível é o que o botão FAZ; o texto em si vem pelo
        // describedby, que é o papel certo para conteúdo explicativo.
        aria-label={rotulo}
        aria-describedby={visivel ? id : undefined}
        aria-expanded={visivel}
        onMouseEnter={mostrar}
        onMouseLeave={() => setVisivel(false)}
        onFocus={mostrar}
        onBlur={() => setVisivel(false)}
        // Esc fecha: o balão pode cobrir o que a pessoa quer ler.
        onKeyDown={(e) => e.key === 'Escape' && setVisivel(false)}
        // Não submete nem navega; o clique só alterna, para funcionar no toque.
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (visivel) setVisivel(false)
          else mostrar()
        }}
      >
        <HelpCircle size={13} strokeWidth={2} aria-hidden="true" />
      </button>

      {/* Na div de tema, e não aqui dentro nem no `body`: ver os itens 2 e 3 do
          cabeçalho. O `role` e o `id` viajam junto, então o `aria-describedby`
          do botão continua apontando para o balão mesmo ele morando em outro
          ponto da árvore — acessibilidade segue o id, não a hierarquia. */}
      {destino &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            className={`dica-balao dica-balao--${posicao}${visivel ? ' dica-balao--visivel' : ''}`}
            style={coords ? { left: `${coords.x}px`, top: `${coords.y}px` } : undefined}
          >
            {texto}
          </span>,
          destino,
        )}
    </span>
  )
}

export default Dica
