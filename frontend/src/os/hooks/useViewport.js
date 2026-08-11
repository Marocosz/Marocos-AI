import { useSyncExternalStore } from 'react'

/**
 * DIMENSÕES DA JANELA DO NAVEGADOR — UMA LEITURA PARA TODO MUNDO
 * --------------------------------------------------
 * Um listener de `resize` no módulo, um instantâneo, N consumidores.
 *
 * POR QUE NÃO UM LISTENER POR COMPONENTE. Era assim que `desktop/Window.jsx`
 * fazia: cada janela montada registrava o PRÓPRIO `resize`, e o handler chamava
 * `setViewport({ w, h })` — objeto novo a cada evento, e o React só descarta um
 * setState por `Object.is`. Com N janelas abertas eram N listeners e N
 * re-renders POR EVENTO. E `resize` dispara dezenas de vezes por segundo
 * enquanto se arrasta a borda da janela, e no mobile ao esconder/mostrar a
 * barra de URL — onde a dimensão às vezes nem muda.
 *
 * É o mesmo motivo pelo qual `useMediaQuery` (ao lado) trocou `resize` por
 * `matchMedia`. Só que `matchMedia` não serve aqui: quem consome isto precisa
 * do NÚMERO, não da travessia de um limiar. Então o evento continua sendo
 * `resize`; o que muda é que existe um só, e que ele tem guarda de igualdade.
 *
 * O QUE ESTE HOOK TEM DE PRESERVAR. Antes do estado assinado, o valor era lido
 * direto no corpo do render (`window.innerWidth`), congelava no primeiro render
 * e as `dragConstraints` da janela ficavam erradas depois de redimensionar o
 * navegador — dava para arrastar a janela para fora do quadro. O limite de
 * arrasto TEM de acompanhar a janela do navegador; é por isso que isto é um
 * estado assinado e não uma leitura solta.
 */

const VAZIO = { w: 0, h: 0 }

const medir = () =>
  typeof window === 'undefined'
    ? VAZIO
    : { w: window.innerWidth, h: window.innerHeight }

let instantaneo = medir()
const inscritos = new Set()

/**
 * GUARDA DE IGUALDADE. Só troca a referência do instantâneo quando algum número
 * mudou de verdade — e só então avisa alguém. Sem isto, cada `resize` produziria
 * um objeto novo e re-renderizaria todo consumidor mesmo com a tela do mesmo
 * tamanho, que é exatamente o caso do mobile quando a barra de URL some e volta.
 *
 * A guarda sozinha não resolveria o problema original: ela corta o re-render
 * redundante, não os N listeners. Quem corta os N listeners é este módulo ter um.
 */
function sincronizar() {
  const novo = medir()
  if (novo.w === instantaneo.w && novo.h === instantaneo.h) return
  instantaneo = novo
  for (const avisar of inscritos) avisar()
}

function inscrever(avisar) {
  inscritos.add(avisar)
  if (inscritos.size === 1) window.addEventListener('resize', sincronizar)

  // Sincronia defensiva, a mesma ideia do useMediaQuery: entre a medição feita
  // na carga do módulo e a primeira inscrição pode ter havido um `resize` sem
  // ninguém escutando. Sem custo quando nada mudou — a guarda acima corta.
  sincronizar()

  return () => {
    inscritos.delete(avisar)
    if (inscritos.size === 0) window.removeEventListener('resize', sincronizar)
  }
}

const lerInstantaneo = () => instantaneo
const lerNoServidor = () => VAZIO

/**
 * `{ w, h }` da janela do navegador, ESTÁVEL POR REFERÊNCIA enquanto os números
 * não mudam — o que permite usar o valor em dependência de efeito ou de memo
 * sem disparar trabalho a cada evento.
 */
export function useViewport() {
  return useSyncExternalStore(inscrever, lerInstantaneo, lerNoServidor)
}
