import { useEffect } from 'react'

/**
 * TRABALHO NA PRIMEIRA FOLGA DO NAVEGADOR
 * --------------------------------------------------
 * O par `requestIdleCallback` + fallback em `setTimeout` estava copiado em três
 * lugares (duas vezes no que hoje é os/shell/Shell.jsx, uma em Desktop.jsx),
 * cada um com o seu cancelamento. Aqui ele existe uma vez.
 *
 * `ativo: false` adia sem cancelar nada — é o que permite esperar uma fase do
 * sistema antes de agendar.
 *
 * O cancelamento importa: sem ele, uma tarefa agendada roda depois da
 * desmontagem e mexe em estado que não existe mais.
 */
export function useIdleTask(fn, { timeout = 2000, fallback = 500, ativo = true } = {}) {
  useEffect(() => {
    if (!ativo) return

    let cancelado = false
    const rodar = () => {
      if (!cancelado) fn()
    }

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(rodar, { timeout })
      return () => {
        cancelado = true
        window.cancelIdleCallback(id)
      }
    }

    const id = setTimeout(rodar, fallback)
    return () => {
      cancelado = true
      clearTimeout(id)
    }
    // `fn` fica fora das dependências de propósito: quem chama costuma passar
    // uma arrow inline, e incluí-la reagendaria a cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativo, timeout, fallback])
}
