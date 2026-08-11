import { describe, it, expect } from 'vitest'
import {
  initialState,
  assinaturaLocal,
  estaEm,
  cascadePosition,
  windowReducer,
} from './windowManager'

/**
 * OS TESTES PERGUNTAM PELO APP, NÃO PELA CHAVE.
 *
 * A chave virou id de instância (`w1`, `w2`) quando a navegação interna separou
 * identidade de localização. Fixar `w1` nas asserções acoplaria cada teste à
 * ordem de abertura sem dizer nada sobre comportamento — e a intenção real é
 * sempre "a janela do readme", não "a primeira janela criada". Estes dois
 * ajudantes deixam isso explícito.
 */
const janelaDe = (s, appId, slug = null) =>
  s.windows.find((w) => estaEm(w, appId, slug ? { slug } : null))
const chaveDe = (s, appId, slug = null) => janelaDe(s, appId, slug)?.key

describe('assinaturaLocal', () => {
  it('usa o appId puro quando não há params', () => {
    expect(assinaturaLocal('about', null)).toBe('about')
  })

  it('concatena o slug quando há params', () => {
    expect(assinaturaLocal('project', { slug: 'bussola-v2' })).toBe('project:bussola-v2')
  })
})

describe('estaEm', () => {
  it('reconhece a janela que está no destino', () => {
    const w = { appId: 'project', params: { slug: 'bussola-v2' } }
    expect(estaEm(w, 'project', { slug: 'bussola-v2' })).toBe(true)
  })

  it('não confunde slugs diferentes do mesmo app', () => {
    const w = { appId: 'project', params: { slug: 'bussola-v2' } }
    expect(estaEm(w, 'project', { slug: 'datachat-bi' })).toBe(false)
  })

  it('não confunde a pasta com o item dentro dela', () => {
    const w = { appId: 'projects', params: null }
    expect(estaEm(w, 'project', { slug: 'bussola-v2' })).toBe(false)
  })
})

describe('cascadePosition', () => {
  it('começa na posição base', () => {
    expect(cascadePosition(0)).toEqual({ x: 96, y: 64 })
  })

  it('desloca 24px por janela', () => {
    expect(cascadePosition(2)).toEqual({ x: 144, y: 112 })
  })

  it('dá a volta depois de 240px para não sair da tela', () => {
    expect(cascadePosition(10)).toEqual({ x: 96, y: 64 })
  })

  it('nasce no meio do caminho entre a lateral e o centro', () => {
    const { x } = cascadePosition(0, { width: 1440, height: 900 }, { w: 620, h: 520 })
    const lateral = 96
    const centro = (1440 - 620) / 2
    expect(x).toBe(Math.round((lateral + centro) / 2))
    // e continua sendo mais à esquerda que o centro, que é o ponto
    expect(x).toBeLessThan(centro)
    expect(x).toBeGreaterThan(lateral)
  })

  it('nasce acima do meio geométrico, descontando a barra de tarefas', () => {
    const { y } = cascadePosition(0, { width: 1440, height: 900 }, { w: 620, h: 520 })
    const meioGeometrico = (900 - 520) / 2
    expect(y).toBeLessThan(meioGeometrico)
    expect(y).toBeGreaterThan(0)
  })

  it('mantém a cascata a partir da base centrada', () => {
    const tela = { width: 1440, height: 900 }
    const tam = { w: 620, h: 520 }
    expect(cascadePosition(1, tela, tam).x - cascadePosition(0, tela, tam).x).toBe(24)
  })

  it('não deixa a janela sair do quadro numa tela apertada', () => {
    const tela = { width: 700, height: 560 }
    const tam = { w: 620, h: 520 }
    const { x, y } = cascadePosition(9, tela, tam)
    expect(x).toBeGreaterThanOrEqual(16)
    expect(x + tam.w).toBeLessThanOrEqual(tela.width)
    expect(y).toBeGreaterThanOrEqual(16)
  })
})

describe('OPEN', () => {
  it('abre uma janela, foca nela e sobe o zTop', () => {
    const s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })

    expect(s.windows).toHaveLength(1)
    expect(s.windows[0]).toMatchObject({
      appId: 'readme',
      params: null,
      minimized: false,
      maximized: false,
      prevPos: null,
      z: 101,
    })
    expect(s.focusedKey).toBe(s.windows[0].key)
    expect(s.zTop).toBe(101)
  })

  it('dá chave de instância, não o appId', () => {
    const s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    // A chave não pode ser derivada do app: é isso que permite a janela trocar
    // de conteúdo sem trocar de identidade.
    expect(s.windows[0].key).not.toBe('readme')
    expect(s.windows[0].key).toBe('w1')
  })

  it('não reaproveita chave entre janelas', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'OPEN', appId: 'about' })
    expect(s.windows.map((w) => w.key)).toEqual(['w1', 'w2'])
  })

  it('o contador não recua ao fechar, para chave fechada não voltar', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'CLOSE', key: 'w1' })
    s = windowReducer(s, { type: 'OPEN', appId: 'about' })
    expect(s.windows[0].key).toBe('w2')
  })

  it('não duplica: abrir app já aberto apenas foca e sobe o z', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'OPEN', appId: 'about' })
    s = windowReducer(s, { type: 'OPEN', appId: 'readme' })

    expect(s.windows).toHaveLength(2)
    expect(s.focusedKey).toBe(chaveDe(s, 'readme'))
    expect(janelaDe(s, 'readme').z).toBe(103)
  })

  it('a deduplicação olha a localização ATUAL, não a de origem', () => {
    // Janela aberta em projetos e navegada para um projeto: abrir "projetos" de
    // novo tem de criar janela nova, porque nenhuma está mais lá.
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'projects' })
    s = windowReducer(s, {
      type: 'NAVIGATE', key: 'w1', appId: 'project', params: { slug: 'bussola-v2' },
    })
    s = windowReducer(s, { type: 'OPEN', appId: 'projects' })

    expect(s.windows).toHaveLength(2)
    expect(janelaDe(s, 'project', 'bussola-v2').key).toBe('w1')
    expect(janelaDe(s, 'projects').key).toBe('w2')
  })

  it('trata instâncias dinâmicas como janelas distintas', () => {
    let s = windowReducer(initialState, {
      type: 'OPEN', appId: 'project', params: { slug: 'bussola-v2' },
    })
    s = windowReducer(s, {
      type: 'OPEN', appId: 'project', params: { slug: 'datachat-bi' },
    })

    expect(s.windows).toHaveLength(2)
    expect(s.windows.map((w) => w.params.slug)).toEqual(['bussola-v2', 'datachat-bi'])
  })

  it('posiciona em cascata conforme a contagem de janelas', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'OPEN', appId: 'about' })

    expect(s.windows[0]).toMatchObject({ x: 96, y: 64 })
    expect(s.windows[1]).toMatchObject({ x: 120, y: 88 })
  })
})

describe('NAVIGATE', () => {
  it('troca a localização preservando a instância', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'projects' })
    s = windowReducer(s, { type: 'MOVE', key: 'w1', x: 300, y: 200 })
    s = windowReducer(s, { type: 'NAVIGATE', key: 'w1', appId: 'history' })

    const w = s.windows[0]
    expect(s.windows).toHaveLength(1)
    expect(w.key).toBe('w1') // a identidade não mudou
    expect(w.appId).toBe('history') // a localização mudou
    expect(w).toMatchObject({ x: 300, y: 200 }) // posição preservada
    expect(s.focusedKey).toBe('w1')
  })

  it('preserva o estado de maximizada ao navegar', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'projects' })
    s = windowReducer(s, { type: 'TOGGLE_MAXIMIZE', key: 'w1' })
    s = windowReducer(s, { type: 'NAVIGATE', key: 'w1', appId: 'history' })

    expect(s.windows[0].maximized).toBe(true)
    expect(s.windows[0].prevPos).toEqual({ x: 96, y: 64 })
  })

  it('leva o slug ao navegar para instância dinâmica', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'projects' })
    s = windowReducer(s, {
      type: 'NAVIGATE', key: 'w1', appId: 'project', params: { slug: 'bussola-v2' },
    })

    expect(s.windows[0]).toMatchObject({
      appId: 'project', params: { slug: 'bussola-v2' },
    })
  })

  it('restaura janela minimizada e sobe o z', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'projects' })
    s = windowReducer(s, { type: 'OPEN', appId: 'about' })
    s = windowReducer(s, { type: 'MINIMIZE', key: 'w1' })
    s = windowReducer(s, { type: 'NAVIGATE', key: 'w1', appId: 'history' })

    expect(s.windows[0].minimized).toBe(false)
    expect(s.windows[0].z).toBeGreaterThan(s.windows[1].z)
  })

  it('navegar para onde já está apenas levanta, sem trocar de localização', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'projects' })
    s = windowReducer(s, { type: 'OPEN', appId: 'about' })
    s = windowReducer(s, { type: 'NAVIGATE', key: 'w1', appId: 'projects' })

    expect(s.focusedKey).toBe('w1')
    expect(s.windows[0].appId).toBe('projects')
    // Levantou de verdade: passou por cima da outra janela.
    expect(s.windows[0].z).toBeGreaterThan(s.windows[1].z)
  })

  it('ignora key inexistente sem quebrar', () => {
    const s = windowReducer(initialState, {
      type: 'NAVIGATE', key: 'fantasma', appId: 'history',
    })
    expect(s).toEqual(initialState)
  })

  /**
   * O CONTRATO DE IDENTIDADE, verificado por REFERÊNCIA e não por valor — é o
   * que o cabeçalho de windowManager.js pede. Comparar campo a campo passaria
   * mesmo se o reducer clonasse todas as janelas, e a regressão seria só de
   * custo de render, silenciosa.
   */
  it('não clona as janelas que não navegaram', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'projects' })
    s = windowReducer(s, { type: 'OPEN', appId: 'about' })
    const outraAntes = s.windows[1]

    s = windowReducer(s, { type: 'NAVIGATE', key: 'w1', appId: 'history' })

    expect(s.windows[1]).toBe(outraAntes)
  })
})

describe('EXTERNAL_ROUTE (voltar/avançar do navegador)', () => {
  const NAVEGAVEIS = new Set(['projects', 'project', 'history', 'about', 'readme'])
  const rota = (appId, params = null) => ({
    type: 'EXTERNAL_ROUTE', appId, params, idsNavegaveis: NAVEGAVEIS,
  })

  it('degrau 1: foca a janela que já está no destino em vez de navegar', () => {
    // É o comportamento que rotas.spec.js descreve: com duas janelas abertas,
    // voltar troca o FOCO. Nada pode ser navegado aqui.
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'OPEN', appId: 'history' })
    s = windowReducer(s, rota('readme'))

    expect(s.windows).toHaveLength(2)
    expect(s.focusedKey).toBe(chaveDe(s, 'readme'))
    expect(janelaDe(s, 'history').appId).toBe('history') // intacta
  })

  it('degrau 2: navega a janela em foco quando ninguém está no destino', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'projects' })
    s = windowReducer(s, {
      type: 'NAVIGATE', key: 'w1', appId: 'project', params: { slug: 'bussola-v2' },
    })
    s = windowReducer(s, rota('projects'))

    // UMA janela, voltando para a pasta — não duas.
    expect(s.windows).toHaveLength(1)
    expect(s.windows[0].key).toBe('w1')
    expect(s.windows[0].appId).toBe('projects')
  })

  it('degrau 3: abre quando não há nada aberto', () => {
    const s = windowReducer(initialState, rota('history'))
    expect(s.windows).toHaveLength(1)
    expect(s.windows[0].appId).toBe('history')
  })

  it('degrau 3: abre em vez de navegar quando o destino não é navegável', () => {
    // Terminal não tem chrome de explorador: não pode virar destino de
    // navegação interna nem sequestrar a janela de projetos.
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'projects' })
    s = windowReducer(s, rota('terminal'))

    expect(s.windows).toHaveLength(2)
    expect(janelaDe(s, 'projects')).toBeDefined()
    expect(janelaDe(s, 'terminal')).toBeDefined()
  })

  it('degrau 3: abre em vez de navegar quando a janela em foco não é navegável', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'terminal' })
    s = windowReducer(s, rota('history'))

    expect(s.windows).toHaveLength(2)
    expect(janelaDe(s, 'terminal').appId).toBe('terminal')
  })

  it('sem idsNavegaveis cai no comportamento antigo: abre', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'projects' })
    s = windowReducer(s, { type: 'EXTERNAL_ROUTE', appId: 'history' })

    expect(s.windows).toHaveLength(2)
  })
})

describe('CLOSE', () => {
  it('remove a janela', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'CLOSE', key: 'w1' })

    expect(s.windows).toEqual([])
    expect(s.focusedKey).toBe(null)
  })

  it('passa o foco para a janela de maior z ao fechar a focada', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'OPEN', appId: 'about' })
    const alvo = chaveDe(s, 'about')
    s = windowReducer(s, { type: 'CLOSE', key: alvo })

    expect(s.focusedKey).toBe(chaveDe(s, 'readme'))
  })

  it('ignora key inexistente sem quebrar', () => {
    const s = windowReducer(initialState, { type: 'CLOSE', key: 'fantasma' })
    expect(s).toEqual(initialState)
  })
})

describe('FOCUS', () => {
  it('traz a janela para o topo do z', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'OPEN', appId: 'about' })
    s = windowReducer(s, { type: 'FOCUS', key: chaveDe(s, 'readme') })

    expect(s.focusedKey).toBe(chaveDe(s, 'readme'))
    expect(janelaDe(s, 'readme').z).toBeGreaterThan(janelaDe(s, 'about').z)
  })

  it('restaura janela minimizada', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'MINIMIZE', key: 'w1' })
    s = windowReducer(s, { type: 'FOCUS', key: 'w1' })

    expect(s.windows[0].minimized).toBe(false)
    expect(s.focusedKey).toBe('w1')
  })
})

describe('MINIMIZE', () => {
  it('marca como minimizada e passa o foco adiante', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'OPEN', appId: 'about' })
    s = windowReducer(s, { type: 'MINIMIZE', key: chaveDe(s, 'about') })

    expect(janelaDe(s, 'about').minimized).toBe(true)
    expect(s.focusedKey).toBe(chaveDe(s, 'readme'))
  })

  it('deixa focusedKey nulo quando não há mais janela visível', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'MINIMIZE', key: 'w1' })

    expect(s.focusedKey).toBe(null)
  })
})

describe('TOGGLE_MAXIMIZE', () => {
  it('guarda a posição anterior ao maximizar', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'MOVE', key: 'w1', x: 300, y: 200 })
    s = windowReducer(s, { type: 'TOGGLE_MAXIMIZE', key: 'w1' })

    const w = s.windows[0]
    expect(w.maximized).toBe(true)
    expect(w.prevPos).toEqual({ x: 300, y: 200 })
  })

  it('devolve a posição guardada ao restaurar', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'MOVE', key: 'w1', x: 300, y: 200 })
    s = windowReducer(s, { type: 'TOGGLE_MAXIMIZE', key: 'w1' })
    s = windowReducer(s, { type: 'TOGGLE_MAXIMIZE', key: 'w1' })

    expect(s.windows[0]).toMatchObject({
      maximized: false, x: 300, y: 200, prevPos: null,
    })
  })
})

describe('MOVE', () => {
  it('atualiza a posição', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'MOVE', key: 'w1', x: 42, y: 43 })

    expect(s.windows[0]).toMatchObject({ x: 42, y: 43 })
  })

  it('não move janela maximizada', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'TOGGLE_MAXIMIZE', key: 'w1' })
    s = windowReducer(s, { type: 'MOVE', key: 'w1', x: 500, y: 500 })

    expect(s.windows[0]).toMatchObject({ x: 96, y: 64 })
  })
})

describe('MINIMIZE_ALL', () => {
  it('minimiza todas e zera o foco', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'OPEN', appId: 'about' })
    s = windowReducer(s, { type: 'MINIMIZE_ALL' })

    expect(s.windows.every((w) => w.minimized)).toBe(true)
    expect(s.focusedKey).toBe(null)
  })
})

describe('CLOSE_ALL', () => {
  it('volta ao estado inicial preservando o zTop', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'CLOSE_ALL' })

    expect(s.windows).toEqual([])
    expect(s.focusedKey).toBe(null)
    expect(s.zTop).toBe(101)
  })
})
