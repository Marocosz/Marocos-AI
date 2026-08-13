import React, { useCallback, useEffect, useState } from 'react'
import { useBalao } from './useBalao'
import './TextoCortado.css'

/**
 * TEXTO CORTADO — o balão que mostra a palavra inteira.
 * --------------------------------------------------
 * Vários rótulos do sistema são cortados com reticências porque a caixa deles é
 * estreita de propósito: os chips da Stack vivem numa grade de colunas de 190px,
 * e "Orquestração de agentes" não cabe. Cortar está certo — o pedido do dono do
 * projeto foi explícito ("pode continuar assim") —, mas o visitante ficava sem
 * jeito de ler o que sobrou.
 *
 * ELE SÓ EXISTE QUANDO O TEXTO REALMENTE FOI CORTADO. Isto é a decisão central do
 * componente: um balão que aparece em cima de texto que caiu inteiro é ruído, e
 * ruído em metade dos chips ensina o visitante a ignorar o mecanismo justamente
 * onde ele importa. A medida é `scrollWidth > clientWidth` no próprio nó — a
 * mesma pergunta que o navegador se faz para decidir desenhar as reticências.
 *
 * E A MEDIDA SE REFAZ, por `ResizeObserver`. A largura da coluna muda quando a
 * janela é redimensionada, quando ela é maximizada, e quando uma pasta da Stack
 * abre e empurra a grade — nos três casos um chip pode passar a caber ou deixar
 * de caber. Medir uma vez na montagem daria a resposta certa por acidente e
 * errada depois do primeiro arrasto de borda.
 *
 * O BALÃO É INVISÍVEL PARA LEITOR DE TELA, e isso não é descuido: o corte aqui é
 * só VISUAL (`text-overflow: ellipsis` no CSS), então o texto completo já está no
 * DOM e já é anunciado. Um `aria-describedby` faria o leitor ler o mesmo nome
 * duas vezes. É a diferença em relação à `Dica`, onde o balão é a única fonte da
 * informação e portanto precisa ser lido — as duas usam o mesmo `useBalao`, e o
 * hook recebe essa distinção por parâmetro.
 *
 * O ALVO FICA FOCÁVEL SÓ QUANDO CORTADO — e só quando `focavel` permite. Quem navega
 * por teclado e vê a tela não tem hover, e sem isso não teria como ler o resto;
 * quando o texto cabe, o nó não entra na ordem de tabulação, porque não há nada a
 * revelar e um ponto de parada sem função é pior que nenhum.
 *
 * `focavel={false}` EXISTE PARA UM DEFEITO REAL QUE ESTE COMPONENTE CRIOU.
 *
 * A primeira versão punha `tabIndex={0}` em todo texto cortado, e a maioria dos usos
 * dele está DENTRO de um elemento interativo: a linha da lista de projetos é um
 * `<button>`, a faixa da Jornada é um `<button>`, o lugar da lateral do explorador é
 * um `<button>` ou um `<a>`, e o botão da taskbar é um `<button>`. Um nó focável
 * dentro de um botão é controle aninhado — o teclado passa a parar duas vezes no
 * mesmo alvo, e o leitor de tela anuncia um elemento sem papel dentro de outro que
 * tem.
 *
 * Nesses casos o balão continua funcionando no MOUSE, e o teclado não perde nada:
 * o texto completo está no DOM (o corte é visual), então o nome acessível do botão
 * que envolve este texto já é o nome inteiro. Quem chega por teclado com leitor de
 * tela ouve tudo; quem chega por teclado enxergando tem o foco no botão, que é o
 * alvo certo.
 *
 * O padrão é `true` porque o uso mais simples — um pedaço de texto solto, como o chip
 * da Stack — é o que precisa da tabulação.
 */
const TextoCortado = ({ texto, className = '', posicao = 'acima', focavel = true }) => {
  const { alvoRef, mostrar, esconder, renderBalao } = useBalao(posicao)
  const [cortado, setCortado] = useState(false)

  /* `+ 1` de tolerância: com fonte subpixel o `scrollWidth` fica um pouco acima do
     `clientWidth` em texto que na prática caiu inteiro, e sem a folga metade dos
     chips ganharia balão sem ter reticência nenhuma. */
  const medirCorte = useCallback(() => {
    const el = alvoRef.current
    if (!el) return
    setCortado(el.scrollWidth > el.clientWidth + 1)
  }, [alvoRef])

  useEffect(() => {
    medirCorte()

    const el = alvoRef.current
    if (!el || typeof ResizeObserver === 'undefined') return

    const observador = new ResizeObserver(medirCorte)
    observador.observe(el)
    return () => observador.disconnect()
  }, [alvoRef, medirCorte, texto])

  return (
    <>
      <span
        ref={alvoRef}
        className={`texto-cortado${cortado ? ' texto-cortado--cortado' : ''} ${className}`.trim()}
        /* Ver a nota no cabeçalho: dentro de um botão, `tabIndex` aqui seria controle
           aninhado. Os handlers de foco acompanham o `tabIndex` — sem ele o nó nunca
           recebe foco, e registrar o par seria código morto. */
        tabIndex={cortado && focavel ? 0 : undefined}
        onMouseEnter={cortado ? mostrar : undefined}
        onMouseLeave={cortado ? esconder : undefined}
        onFocus={cortado && focavel ? mostrar : undefined}
        onBlur={cortado && focavel ? esconder : undefined}
        onKeyDown={(e) => e.key === 'Escape' && esconder()}
      >
        {texto}
      </span>

      {/* Só monta o balão quando há corte: sem isso, todo chip do sistema
          carregaria um portal invisível de graça. */}
      {cortado && renderBalao(texto, { ocultoDeLeitor: true })}
    </>
  )
}

export default TextoCortado
