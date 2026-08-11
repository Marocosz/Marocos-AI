import { useState, useEffect } from 'react'

/**
 * BASE ÚNICA DE MEDIA QUERY
 * --------------------------------------------------
 * `matchMedia` em vez de listener de `resize`: dispara só na travessia da
 * condição, não a cada pixel arrastado na borda da janela.
 */
export function useMediaQuery(query) {
  const [casa, setCasa] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mq = window.matchMedia(query)
    const aoMudar = (e) => setCasa(e.matches)

    // Sincronia defensiva: cobre a travessia que aconteça entre o primeiro
    // render e o anexo do listener. Sem custo quando o valor não muda, porque o
    // React descarta setState com valor idêntico.
    setCasa(mq.matches)
    mq.addEventListener('change', aoMudar)
    return () => mq.removeEventListener('change', aoMudar)
  }, [query])

  return casa
}

/** Preferência de sistema por menos movimento.
 *
 *  Chegou a ser lida de três formas diferentes no projeto; duas foram
 *  unificadas aqui — esta (`useMovimentoReduzido`, usada por
 *  `ThemeContext.jsx`) e a leitura síncrona `lerMovimentoReduzido` abaixo
 *  (usada pela cerimônia de boot em `Ceremony.jsx`).
 *
 *  A terceira continua separada por decisão, não por descuido: as duas telas
 *  do shell mobile (`MobileApp.jsx`, `QuickSettings.jsx`) já animam com o
 *  `useReducedMotion()` do `motion/react`, que é a fonte nativa da mesma
 *  biblioteca que elas usam para tudo o mais. Trocá-lo por este hook exigiria
 *  reconferir o visual das duas telas — refactor com risco real e sem ganho
 *  de correção, fora do escopo deste commit. */
export function useMovimentoReduzido() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/**
 * LEITURA ÚNICA, SEM ASSINATURA.
 *
 * Para quem precisa CONGELAR a decisão em vez de acompanhá-la. Não é hook: é
 * uma função pura de leitura, feita para ser usada num inicializador de
 * `useState`.
 *
 * A cerimônia é o caso: ela usa a preferência para decidir a duração da
 * inicialização e se o cristal anima. A tela de bloqueio pode ficar minutos
 * esperando um clique, e a preferência mudando nesse meio faria o cristal
 * parar sozinho ou os timers do boot reiniciarem com outra duração — mudança
 * de comportamento no meio de uma cena que já começou.
 */
export function lerMovimentoReduzido() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}
