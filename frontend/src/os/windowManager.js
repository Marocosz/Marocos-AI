/**
 * REDUCER DO GERENCIADOR DE JANELAS
 * --------------------------------------------------
 * Fonte única de verdade sobre quais janelas estão abertas, qual tem foco
 * e em que ordem elas se sobrepõem.
 *
 * Deliberadamente puro (zero React, zero DOM) porque é aqui que os bugs
 * moram: herança de foco ao fechar, z-order após N cliques, instância
 * dupla. Lógica pura é lógica testável.
 *
 * NÃO guarda tamanho de janela — tamanho vem do registry em tempo de
 * render, então mudar um defaultSize não invalida estado salvo.
 */

import { JANELAS } from '../config/system'

// Passo da cascata, faixa da barra de tarefas, folga de borda e viés de
// nascimento vêm do config (system.js) — os valores e o porquê de cada um
// estão documentados lá. Nomes locais preservados para o resto do arquivo
// não mudar.
const BASE_X = JANELAS.baseX
const BASE_Y = JANELAS.baseY
const CASCADE_STEP = JANELAS.passoCascata
const CASCADE_WRAP = JANELAS.voltaCascata
const TASKBAR_H = JANELAS.alturaTaskbar
const MARGEM = JANELAS.margem
const VIES_VERTICAL = JANELAS.viesVertical
const VIES_HORIZONTAL = JANELAS.viesHorizontal

const limitar = (v, min, max) => Math.min(Math.max(v, min), max)

// Janelas começam em 101 (a escala reserva 100+ para elas).
export const initialState = {
  windows: [],
  zTop: JANELAS.zInicial,
  focusedKey: null,
  /**
   * Contador de instâncias. Contador, e não aleatório nem timestamp, porque
   * este reducer é puro e os testes comparam estado por igualdade — `w1`, `w2`
   * têm de sair iguais em toda execução.
   */
  proximaChave: 1,
}

/**
 * ONDE a janela está — não QUEM ela é.
 *
 * Esta função era `makeKey` e devolvia a identidade da janela: singleton usava
 * o próprio appId como chave. Funcionava enquanto trocar de conteúdo só
 * acontecia abrindo outra janela, porque aí a janela ERA o app.
 *
 * Com o chrome de explorador um link da lateral troca o conteúdo da janela
 * atual, e as duas coisas se separaram: a identidade tem de ser estável (senão
 * o React remonta a subárvore, o z-order se perde e o botão da taskbar troca de
 * dono) enquanto a localização muda. Identidade virou `w1`, `w2` (ver
 * `proximaChave`); esta comparação continua sendo exatamente o que responde
 * "alguma janela já está mostrando isto?", que é o que a deduplicação de OPEN e
 * o popstate precisam saber.
 */
export function assinaturaLocal(appId, params) {
  if (params && params.slug) return `${appId}:${params.slug}`
  return appId
}

/** A janela `w` está mostrando esta localização? */
export function estaEm(w, appId, params) {
  return assinaturaLocal(w.appId, w.params) === assinaturaLocal(appId, params)
}

/**
 * QUANTO SOBRA PARA UMA JANELA depois da barra de tarefas e das margens.
 *
 * Recebe números soltos, e não um objeto, porque os dois chamadores descrevem a
 * tela com nomes diferentes — as ações do reducer mandam `{width,height}` e o
 * `useViewport()` devolve `{w,h}`. Pedir números evita um adaptador em cada
 * ponta só para acertar o nome da chave.
 */
export function areaUtil(larguraTela, alturaTela) {
  return {
    w: Math.max(JANELAS.tamanhoMinimo.w, larguraTela - MARGEM * 2),
    h: Math.max(JANELAS.tamanhoMinimo.h, alturaTela - TASKBAR_H - MARGEM * 2),
  }
}

/**
 * O `defaultSize` DO REGISTRY, ENCOLHIDO ATÉ CABER NA TELA.
 *
 * Isto faltava, e era um bug de verdade: a posição era limitada mas o TAMANHO
 * não. Numa tela baixa o clamp de `y` só empurrava a janela até a margem de
 * cima, e o que passava do limite continuava passando — para debaixo da barra
 * de tarefas, fora de alcance.
 *
 * Ninguém tinha visto porque o cálculo que dimensionou os apps olhou só para a
 * LARGURA: o comentário do `defaultSize` em `registry.js` conclui que a maior
 * janela cabe no breakpoint de 1024px, e para na largura. Só que a altura não
 * tem breakpoint nenhum. As contas, com barra de tarefas (52) e margens (2x16):
 *
 *   settings  660 de altura  ->  exige 744 de viewport
 *   about / history / devices  626  ->  710
 *   assistant 620  ->  704
 *
 * Um notebook de 1366x768 com o navegador em janela normal dá ~620-650 de
 * viewport. Sete dos nove apps não cabiam lá. Em 1920x1080 todos cabem, que é
 * onde isto foi construído — daí o bug ter sobrevivido.
 *
 * Encolher é seguro porque `.marocos-window-body` já rola (`overflow-y: auto`):
 * o conteúdo não some, ele passa a rolar dentro de uma janela menor.
 *
 * Sem tela conhecida (SSR, primeiro instantâneo do `useViewport`) devolve o
 * tamanho original — melhor cair no comportamento de antes do que calcular com
 * viewport zerada.
 */
export function tamanhoQueCabe(size, larguraTela, alturaTela) {
  if (!size || !larguraTela || !alturaTela) return size

  const area = areaUtil(larguraTela, alturaTela)
  return { w: Math.min(size.w, area.w), h: Math.min(size.h, area.h) }
}

/**
 * REANCORA UMA JANELA QUE FICOU FORA DE ALCANCE.
 *
 * O tamanho encolhe sozinho quando a tela encolhe, mas a posição é estado
 * guardado: uma janela colocada numa tela grande continua com o `x`/`y` de lá
 * quando a janela do navegador diminui, e escorrega para trás da barra de
 * tarefas ou para fora da borda.
 *
 * OS LIMITES SÃO OS MESMOS DO ARRASTO, e não as margens de nascimento — esta é
 * a parte que não pode errar. `dragConstraints` deixa o visitante puxar uma
 * janela até sobrar só `folgaArrasto` dela na tela, de propósito, como faz
 * qualquer sistema de janelas. Se aqui a regra fosse mais apertada, todo
 * arrasto legítimo seria desfeito no render seguinte: a janela voltaria
 * sozinha, e o arrasto pareceria quebrado.
 *
 * A regra que sobra é exatamente uma: *a janela nunca fica onde você não
 * poderia tê-la arrastado*. Quem foi arrastado para o canto fica no canto; quem
 * ficou fora de alcance por mudança de tela volta para a borda mais próxima.
 *
 * Não depende do tamanho da janela porque `dragConstraints` também não depende.
 */
export function posicaoAlcancavel(x, y, larguraTela, alturaTela) {
  if (!larguraTela || !alturaTela) return { x, y }

  return {
    x: limitar(x, 0, Math.max(0, larguraTela - JANELAS.folgaArrastoX)),
    y: limitar(y, 0, Math.max(0, alturaTela - JANELAS.folgaArrastoY)),
  }
}

/**
 * Onde uma janela nova nasce. Cada uma se desloca em cascata para não cobrir a
 * anterior.
 *
 * `viewport` e `size` são OPCIONAIS, e é isso que mantém esta função pura: quem
 * sabe o tamanho da tela e o tamanho padrão de cada app é a camada React, que
 * manda os dois na ação. Sem eles a função cai na posição fixa de antes — o que
 * também é o que os testes exercitam quando querem a cascata isolada.
 *
 * Com eles, a primeira janela nasce centrada horizontalmente em vez de encostada
 * na esquerda, e o clamp garante que nem a cascata nem uma tela pequena joguem
 * uma janela para fora do quadro.
 *
 * A CONTA USA O TAMANHO JÁ ENCOLHIDO. Centrar pelo `defaultSize` numa tela onde
 * ele não cabe daria a posição de uma janela que não vai existir.
 */
export function cascadePosition(n, viewport = null, size = null) {
  const offset = (CASCADE_STEP * n) % CASCADE_WRAP
  if (!viewport || !size) return { x: BASE_X + offset, y: BASE_Y + offset }

  const cabe = tamanhoQueCabe(size, viewport.width, viewport.height)
  const alturaLivre = viewport.height - TASKBAR_H
  const centroX = (viewport.width - cabe.w) / 2
  const baseX = BASE_X + (centroX - BASE_X) * VIES_HORIZONTAL
  const baseY = (alturaLivre - cabe.h) * VIES_VERTICAL

  return {
    x: Math.round(
      limitar(baseX + offset, MARGEM, Math.max(MARGEM, viewport.width - cabe.w - MARGEM)),
    ),
    y: Math.round(
      limitar(baseY + offset, MARGEM, Math.max(MARGEM, alturaLivre - cabe.h - MARGEM)),
    ),
  }
}

/** Janela visível de maior z — quem herda o foco. */
function topmostVisible(windows) {
  const visible = windows.filter((w) => !w.minimized)
  if (visible.length === 0) return null
  return visible.reduce((top, w) => (w.z > top.z ? w : top)).key
}

/**
 * CONTRATO DE IDENTIDADE — os `map` daqui para baixo NÃO copiam quem não mudou.
 *
 * Toda transição devolve o MESMO objeto (`return w`, ou o `: w` do ternário)
 * para as janelas não afetadas, e clona só a que mudou. Não é estilo: é o que
 * faz o `React.memo` de `desktop/Window.jsx` valer alguma coisa — ele compara as
 * props por `Object.is`, então focar, minimizar, mover ou maximizar uma janela
 * re-renderiza uma ou duas, e não as N abertas.
 *
 * Trocar isto por cópia total (`{ ...w }` em todo mundo) mataria a memoização
 * SEM NENHUM TESTE FALHAR: o estado resultante é igual campo a campo, que é
 * tudo o que as asserções olham. A regressão seria só de custo de render — e
 * silenciosa. Se mudar algo aqui, o que prova a preservação é comparar
 * referências (`expect(depois.windows[1]).toBe(antes.windows[1])`), não valores.
 *
 * `MINIMIZE_ALL` é a exceção legítima: lá todas as janelas mudam mesmo.
 */
function raise(state, key) {
  const z = state.zTop + 1
  return {
    ...state,
    windows: state.windows.map((w) => (w.key === key ? { ...w, z, minimized: false } : w)),
    zTop: z,
    focusedKey: key,
  }
}

export function windowReducer(state, action) {
  switch (action.type) {
    /**
     * OPEN É A PORTA DE FORA: ícone da área de trabalho, menu Iniciar, dock,
     * comando do terminal. Ele nunca reaproveita uma janela para outro destino —
     * dedup só quando o destino é o MESMO. Quem troca o destino de uma janela
     * existente é NAVIGATE, e a separação é o pedido explícito do dono do
     * projeto: clicar no atalho abre janela, clicar no link da lateral troca.
     *
     * `parent` saiu daqui. Ele existia para um caso só — o deep link de
     * `/projetos/:slug` montava a pasta atrás do detalhe — e com navegação
     * interna o detalhe é a própria janela da pasta em outra localização, com o
     * breadcrumb dando o caminho de volta. Não há pai para montar.
     */
    case 'OPEN': {
      const { appId, params = null, viewport = null, size = null } = action

      // Já tem janela nesse destino: foca em vez de duplicar.
      const existente = state.windows.find((w) => estaEm(w, appId, params))
      if (existente) return raise(state, existente.key)

      const key = `w${state.proximaChave}`
      const z = state.zTop + 1
      const { x, y } = cascadePosition(state.windows.length, viewport, size)

      return {
        ...state,
        windows: [
          ...state.windows,
          { key, appId, params, x, y, z, minimized: false, maximized: false, prevPos: null },
        ],
        zTop: z,
        focusedKey: key,
        proximaChave: state.proximaChave + 1,
      }
    }

    /**
     * NAVIGATE É A PORTA DE DENTRO: link da lateral, breadcrumb, card de
     * projeto. Troca a localização no lugar e preserva tudo que é da instância —
     * posição, tamanho maximizado, z. Levanta o foco porque navegar é sempre
     * consequência de um clique dentro da janela.
     *
     * Duas janelas podem terminar na mesma localização (uma navegou para onde a
     * outra já estava). Permitido de propósito: um explorador de verdade deixa
     * duas janelas abertas na mesma pasta, e proibir exigiria uma regra de fusão
     * sem resposta óbvia (qual das duas fica com a posição?).
     */
    case 'NAVIGATE': {
      const { key, appId, params = null } = action
      const alvo = state.windows.find((w) => w.key === key)
      if (!alvo) return state
      // Já está lá: só levanta, sem clonar a janela por nada.
      if (estaEm(alvo, appId, params)) return raise(state, key)

      const z = state.zTop + 1
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.key === key ? { ...w, appId, params, z, minimized: false } : w,
        ),
        zTop: z,
        focusedKey: key,
      }
    }

    /**
     * O VOLTAR/AVANÇAR DO NAVEGADOR — a terceira porta, e a única com três
     * degraus.
     *
     * Sem histórico por janela (decisão de design: breadcrumb e subir), o voltar
     * do navegador É o voltar. E ele não pode ser nem OPEN nem NAVIGATE puro:
     *
     *   1. alguma janela já está no destino  -> FOCA ela.
     *      Este degrau é o que preserva o comportamento testado em
     *      rotas.spec.js ("voltar/avançar troca o foco entre janelas já
     *      abertas"): com /leia-me e /jornada abertos, voltar muda o foco e não
     *      navega nada.
     *   2. senão, a janela com foco é navegável e o destino também -> NAVEGA.
     *      Sem este degrau, navegar de /projetos para /projetos/rag-api e voltar
     *      abriria uma SEGUNDA janela de projetos, deixando a original presa no
     *      detalhe.
     *   3. senão -> ABRE.
     *
     * O degrau 2 existe só aqui, e não em OPEN, de propósito: em OPEN ele faria
     * clicar em "Jornada" na área de trabalho reaproveitar a janela de projetos
     * em foco, que é o oposto do que foi pedido.
     *
     * `idsNavegaveis` chega pela ação porque quem sabe quais apps têm chrome de
     * explorador é o registry — e o registry importa React e ícones, coisas que
     * este módulo não pode tocar sem perder a pureza que o cabeçalho promete.
     */
    case 'EXTERNAL_ROUTE': {
      const { appId, params = null, idsNavegaveis = null, size = null, viewport = null } = action

      const existente = state.windows.find((w) => estaEm(w, appId, params))
      if (existente) return raise(state, existente.key)

      const focada = state.windows.find((w) => w.key === state.focusedKey)
      const podeNavegar =
        !!focada && !!idsNavegaveis && idsNavegaveis.has(focada.appId) && idsNavegaveis.has(appId)

      if (podeNavegar) {
        return windowReducer(state, { type: 'NAVIGATE', key: focada.key, appId, params })
      }
      return windowReducer(state, { type: 'OPEN', appId, params, size, viewport })
    }

    case 'CLOSE': {
      if (!state.windows.some((w) => w.key === action.key)) return state

      const windows = state.windows.filter((w) => w.key !== action.key)
      const focusedKey =
        state.focusedKey === action.key ? topmostVisible(windows) : state.focusedKey

      return { ...state, windows, focusedKey }
    }

    case 'FOCUS': {
      if (!state.windows.some((w) => w.key === action.key)) return state
      return raise(state, action.key)
    }

    case 'MINIMIZE': {
      if (!state.windows.some((w) => w.key === action.key)) return state

      const windows = state.windows.map((w) =>
        w.key === action.key ? { ...w, minimized: true } : w,
      )
      const focusedKey =
        state.focusedKey === action.key ? topmostVisible(windows) : state.focusedKey

      return { ...state, windows, focusedKey }
    }

    case 'TOGGLE_MAXIMIZE': {
      return {
        ...state,
        windows: state.windows.map((w) => {
          if (w.key !== action.key) return w
          // Guarda x/y ao maximizar porque o CSS passa a mandar via inset:0,
          // e sem isso a janela restaurada volta na posição errada.
          if (w.maximized) {
            const { x, y } = w.prevPos || { x: w.x, y: w.y }
            return { ...w, maximized: false, x, y, prevPos: null }
          }
          return { ...w, maximized: true, prevPos: { x: w.x, y: w.y } }
        }),
      }
    }

    case 'MOVE': {
      return {
        ...state,
        windows: state.windows.map((w) =>
          // Maximizada não tem posição própria; ignora para não guardar
          // coordenada suja que reapareceria ao restaurar.
          w.key === action.key && !w.maximized ? { ...w, x: action.x, y: action.y } : w,
        ),
      }
    }

    case 'MINIMIZE_ALL': {
      return {
        ...state,
        windows: state.windows.map((w) => ({ ...w, minimized: true })),
        focusedKey: null,
      }
    }

    case 'CLOSE_ALL': {
      return { ...state, windows: [], focusedKey: null }
    }

    default:
      return state
  }
}
