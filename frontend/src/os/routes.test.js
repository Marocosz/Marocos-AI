import { describe, it, expect } from 'vitest'
import { resolveRoute, buildRoute } from './routes'
import { getApp } from './registry'

describe('getApp', () => {
  it('encontra app declarado', () => {
    expect(getApp('readme').route).toBe('/leia-me')
  })

  it('devolve undefined para app inexistente', () => {
    expect(getApp('nao-existe')).toBeUndefined()
  })
})

describe('resolveRoute', () => {
  it('resolve a raiz como nenhuma janela', () => {
    expect(resolveRoute('/')).toBe(null)
  })

  it('resolve rota estática', () => {
    expect(resolveRoute('/leia-me')).toEqual({ appId: 'readme', params: null })
  })

  it('resolve rota estática com barra final', () => {
    expect(resolveRoute('/leia-me/')).toEqual({ appId: 'readme', params: null })
  })

  it('resolve rota dinâmica extraindo o slug', () => {
    expect(resolveRoute('/projetos/bussola-v2')).toEqual({
      appId: 'project',
      params: { slug: 'bussola-v2' },
    })
  })

  it('prefere a rota estática do pai quando não há slug', () => {
    expect(resolveRoute('/projetos')).toEqual({ appId: 'projects', params: null })
  })

  it('devolve null para rota desconhecida', () => {
    expect(resolveRoute('/nao-existe')).toBe(null)
  })
})

describe('buildRoute', () => {
  it('constrói rota estática', () => {
    expect(buildRoute('readme', null)).toBe('/leia-me')
  })

  it('constrói rota dinâmica substituindo o parâmetro', () => {
    expect(buildRoute('project', { slug: 'datachat-bi' })).toBe('/projetos/datachat-bi')
  })

  it('devolve a raiz para app inexistente', () => {
    expect(buildRoute('nao-existe', null)).toBe('/')
  })
})

describe('ida e volta', () => {
  it('buildRoute e resolveRoute são inversos', () => {
    const cases = [
      ['readme', null],
      ['projects', null],
      ['project', { slug: 'bussola-v2' }],
    ]
    for (const [appId, params] of cases) {
      expect(resolveRoute(buildRoute(appId, params))).toEqual({ appId, params })
    }
  })
})
