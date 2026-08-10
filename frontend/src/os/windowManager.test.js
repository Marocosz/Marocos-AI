import { describe, it, expect } from 'vitest'
import {
  initialState,
  makeKey,
  cascadePosition,
  windowReducer,
} from './windowManager'

describe('makeKey', () => {
  it('usa o appId puro quando não há params', () => {
    expect(makeKey('about', null)).toBe('about')
  })

  it('concatena o slug quando há params', () => {
    expect(makeKey('project', { slug: 'bussola-v2' })).toBe('project:bussola-v2')
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
      key: 'readme',
      appId: 'readme',
      params: null,
      minimized: false,
      maximized: false,
      prevPos: null,
      z: 101,
    })
    expect(s.focusedKey).toBe('readme')
    expect(s.zTop).toBe(101)
  })

  it('não duplica: abrir app já aberto apenas foca e sobe o z', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'OPEN', appId: 'about' })
    s = windowReducer(s, { type: 'OPEN', appId: 'readme' })

    expect(s.windows).toHaveLength(2)
    expect(s.focusedKey).toBe('readme')
    expect(s.windows.find((w) => w.key === 'readme').z).toBe(103)
  })

  it('trata instâncias dinâmicas como janelas distintas', () => {
    let s = windowReducer(initialState, {
      type: 'OPEN', appId: 'project', params: { slug: 'bussola-v2' },
    })
    s = windowReducer(s, {
      type: 'OPEN', appId: 'project', params: { slug: 'datachat-bi' },
    })

    expect(s.windows.map((w) => w.key)).toEqual([
      'project:bussola-v2',
      'project:datachat-bi',
    ])
  })

  it('posiciona em cascata conforme a contagem de janelas', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'OPEN', appId: 'about' })

    expect(s.windows[0]).toMatchObject({ x: 96, y: 64 })
    expect(s.windows[1]).toMatchObject({ x: 120, y: 88 })
  })
})

describe('CLOSE', () => {
  it('remove a janela', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'CLOSE', key: 'readme' })

    expect(s.windows).toEqual([])
    expect(s.focusedKey).toBe(null)
  })

  it('passa o foco para a janela de maior z ao fechar a focada', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'OPEN', appId: 'about' })
    s = windowReducer(s, { type: 'CLOSE', key: 'about' })

    expect(s.focusedKey).toBe('readme')
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
    s = windowReducer(s, { type: 'FOCUS', key: 'readme' })

    expect(s.focusedKey).toBe('readme')
    expect(s.windows.find((w) => w.key === 'readme').z).toBeGreaterThan(
      s.windows.find((w) => w.key === 'about').z,
    )
  })

  it('restaura janela minimizada', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'MINIMIZE', key: 'readme' })
    s = windowReducer(s, { type: 'FOCUS', key: 'readme' })

    expect(s.windows[0].minimized).toBe(false)
    expect(s.focusedKey).toBe('readme')
  })
})

describe('MINIMIZE', () => {
  it('marca como minimizada e passa o foco adiante', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'OPEN', appId: 'about' })
    s = windowReducer(s, { type: 'MINIMIZE', key: 'about' })

    expect(s.windows.find((w) => w.key === 'about').minimized).toBe(true)
    expect(s.focusedKey).toBe('readme')
  })

  it('deixa focusedKey nulo quando não há mais janela visível', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'MINIMIZE', key: 'readme' })

    expect(s.focusedKey).toBe(null)
  })
})

describe('TOGGLE_MAXIMIZE', () => {
  it('guarda a posição anterior ao maximizar', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'MOVE', key: 'readme', x: 300, y: 200 })
    s = windowReducer(s, { type: 'TOGGLE_MAXIMIZE', key: 'readme' })

    const w = s.windows[0]
    expect(w.maximized).toBe(true)
    expect(w.prevPos).toEqual({ x: 300, y: 200 })
  })

  it('devolve a posição guardada ao restaurar', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'MOVE', key: 'readme', x: 300, y: 200 })
    s = windowReducer(s, { type: 'TOGGLE_MAXIMIZE', key: 'readme' })
    s = windowReducer(s, { type: 'TOGGLE_MAXIMIZE', key: 'readme' })

    expect(s.windows[0]).toMatchObject({
      maximized: false, x: 300, y: 200, prevPos: null,
    })
  })
})

describe('MOVE', () => {
  it('atualiza a posição', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'MOVE', key: 'readme', x: 42, y: 43 })

    expect(s.windows[0]).toMatchObject({ x: 42, y: 43 })
  })

  it('não move janela maximizada', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'TOGGLE_MAXIMIZE', key: 'readme' })
    s = windowReducer(s, { type: 'MOVE', key: 'readme', x: 500, y: 500 })

    expect(s.windows[0]).toMatchObject({ x: 96, y: 64 })
  })
})

describe('OPEN com pai', () => {
  it('abre o pai antes do filho e mantém o foco no filho', () => {
    const s = windowReducer(initialState, {
      type: 'OPEN', appId: 'project', params: { slug: 'bussola-v2' }, parent: 'projects',
    })

    expect(s.windows.map((w) => w.key)).toEqual(['projects', 'project:bussola-v2'])
    expect(s.focusedKey).toBe('project:bussola-v2')
    expect(s.windows.find((w) => w.key === 'project:bussola-v2').z).toBeGreaterThan(
      s.windows.find((w) => w.key === 'projects').z,
    )
  })

  it('não reabre o pai se ele já estiver aberto', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'projects' })
    s = windowReducer(s, {
      type: 'OPEN', appId: 'project', params: { slug: 'bussola-v2' }, parent: 'projects',
    })

    expect(s.windows.filter((w) => w.key === 'projects')).toHaveLength(1)
    expect(s.windows).toHaveLength(2)
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
