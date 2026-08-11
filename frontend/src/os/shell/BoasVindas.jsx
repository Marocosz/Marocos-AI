import { useState, useEffect, useRef } from 'react'
import { useWindows } from '../WindowManagerContext'
import { useIdleTask } from '../hooks/useIdleTask'
import { CERIMONIA } from '../../config/system'

/**
 * Abre "Sobre este PC" para ninguém cair num desktop vazio sem saber o que
 * clicar.
 *
 * QUANDO. Montar esta janela custa a árvore inteira do app mais um segundo
 * contexto WebGL para o cristal dela. O custo saiu do fim da transição (onde
 * caía bem no instante em que o desktop aparecia) para o começo dela, e daí
 * para cá: a TELA DE BLOQUEIO PARADA.
 *
 * Medi o pior frame do destravamento no Edge com e sem esta janela montada:
 * 85ms contra 42ms. Ou seja, montá-la durante a cortina custava metade da
 * suavidade da transição — "escondido atrás da cortina" nunca quis dizer
 * "de graça", porque a main thread é a mesma.
 *
 * A tela de bloqueio, ao contrário, é tempo ocioso de verdade: ela fica ali
 * esperando um clique que pode demorar segundos, com uma cerimônia já pronta e
 * nada disputando a CPU. A janela monta ali, em `requestIdleCallback`, e quando
 * o clique vem não sobra trabalho nenhum para a transição.
 *
 * A TRAVA É NA DECISÃO, NÃO NA ABERTURA. Antes o `return` do deep link vinha
 * ANTES de marcar a flag: quem entrava por uma rota (`/sobre`, `/projetos`)
 * saía deste efeito sem nada registrado. Bastava fechar aquela janela no X para
 * `windows.length` voltar a 0, o efeito rodar de novo e as boas-vindas
 * dispararem — a janela "reabria sozinha". E isso valia para todo mundo a
 * partir do segundo carregamento, porque a janela aberta aqui empurra a própria
 * rota para a URL: o F5 seguinte já chega em /sobre.
 *
 * Agora a primeira execução válida decide de uma vez: ou abre, ou respeita o
 * que a URL trouxe. Nos dois casos o assunto está encerrado.
 */
const BoasVindas = ({ ativa }) => {
  const { open, windows } = useWindows()
  const jaDecidiu = useRef(false)
  const [ativo, setAtivo] = useState(false)

  useEffect(() => {
    if (!ativa || jaDecidiu.current) return
    jaDecidiu.current = true
    // Só recebe as boas-vindas quem chegou sem rota; deep link manda.
    if (windows.length > 0) return
    setAtivo(true)
  }, [ativa, windows.length])

  // Na primeira folga: a tela de bloqueio acabou de entrar e ainda está
  // animando os próprios elementos, então montar a janela no mesmo frame só
  // trocaria um engasgo de lugar.
  useIdleTask(() => open('about'), { ...CERIMONIA.idle.boasVindas, ativo })

  return null
}

export default BoasVindas
