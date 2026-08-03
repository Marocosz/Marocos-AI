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
