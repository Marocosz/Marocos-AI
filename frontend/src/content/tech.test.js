import { describe, it, expect } from 'vitest'
import { getTechData, contarNiveis, NIVEIS } from './tech'

/**
 * O BADGE DE CADA PASTA É DERIVADO, não escrito.
 *
 * Ele diz "2 expert · 3 avançado" a partir dos próprios itens. Escrever essa contagem à
 * mão em `tech.js` seria criar um número que envelhece na primeira tecnologia
 * acrescentada — e este projeto já teve três desses envelhecerem em texto visível (o
 * "36 testes" do leia-me, o "Doze papéis de parede" do balão e o "8º período").
 */
describe('contarNiveis', () => {
  it('conta por nível e omite os que não aparecem', () => {
    const itens = [{ level: 'Expert' }, { level: 'Expert' }, { level: 'Advanced' }]
    expect(contarNiveis(itens)).toEqual([
      { nivel: 'expert', total: 2 },
      { nivel: 'advanced', total: 1 },
    ])
  })

  it('a ordem é sempre a mesma, do mais forte para o mais fraco', () => {
    // Sem ordem fixa o badge trocaria de ordem entre categorias, e duas pastas lado a
    // lado ficariam impossíveis de comparar.
    const itens = [{ level: 'Intermediate' }, { level: 'Expert' }]
    expect(contarNiveis(itens).map((n) => n.nivel)).toEqual(['expert', 'intermediate'])
  })

  it('lista vazia devolve nada, em vez de zeros', () => {
    expect(contarNiveis([])).toEqual([])
  })

  it('soma sempre o total de itens da categoria', () => {
    for (const lang of ['pt', 'en']) {
      for (const grupo of getTechData(lang).items) {
        const soma = contarNiveis(grupo.items).reduce((a, n) => a + n.total, 0)
        expect(soma, `${lang}/${grupo.id}`).toBe(grupo.items.length)
      }
    }
  })

  it('todo nível dos dados é um nível conhecido', () => {
    // Um `level` novo escrito com outro nome sairia do badge EM SILÊNCIO e não ganharia
    // cor de chip — defeito que só apareceria numa revisão visual.
    for (const lang of ['pt', 'en']) {
      for (const grupo of getTechData(lang).items) {
        for (const item of grupo.items) {
          expect(NIVEIS, `${lang}/${grupo.id}/${item.name}`).toContain(item.level.toLowerCase())
        }
      }
    }
  })
})

describe('dados da stack', () => {
  it('os dois idiomas têm as mesmas categorias e os mesmos tamanhos', () => {
    // Se divergirem, o número grande de cada pasta muda ao trocar de idioma.
    const pt = getTechData('pt').items
    const en = getTechData('en').items
    expect(en.map((g) => g.id)).toEqual(pt.map((g) => g.id))
    expect(en.map((g) => g.items.length)).toEqual(pt.map((g) => g.items.length))
  })

  it('toda tecnologia tem cor de marca', () => {
    // A cor é o que distingue os itens na grade; sem ela o ponto desaparece.
    for (const grupo of getTechData('pt').items) {
      for (const item of grupo.items) {
        expect(item.color, `${grupo.id}/${item.name}`).toMatch(/^#[0-9a-fA-F]{3,6}$/)
      }
    }
  })
})
