import { describe, it, expect } from 'vitest'
import { getJourneyData, posicaoNaLinha } from './journey'

/**
 * A POSIÇÃO NA BARRA É O ARGUMENTO INTEIRO DA REFATORAÇÃO.
 *
 * A barra do player é a linha do tempo real da carreira: os marcadores ficam em
 * posição proporcional ao ANO, e é isso que faz os vãos entre eles carregarem
 * informação (três anos entre 2019 e 2022; um ano entre 2024 e 2025). Se esta conta
 * estiver errada, a barra mente sobre o tempo — e mentir sobre o tempo é o único
 * jeito de este design não valer nada.
 *
 * `anoAtual` entra por PARÂMETRO, e não de um `new Date()` dentro da função: é a
 * mesma decisão de `idadeEm()` em `profile.js`, e é o que torna o teste
 * determinístico em qualquer máquina e em qualquer dia.
 */
describe('posicaoNaLinha', () => {
  const entradas = getJourneyData('pt').items
  const pos = (ano, anoAtual = 2026) =>
    posicaoNaLinha(entradas, entradas.find((e) => e.ano === ano), anoAtual)

  it('a primeira entrada abre a barra e a futura fecha', () => {
    const futura = entradas.find((e) => e.futuro)
    expect(pos(2018)).toBe(0)
    expect(posicaoNaLinha(entradas, futura, 2026)).toBe(100)
  })

  it('as posições são proporcionais ao ano, não ao índice', () => {
    // 2018..2026 é a extensão da barra; cada ano vale 12,5%.
    expect(pos(2018)).toBe(0)
    expect(pos(2019)).toBe(12.5)
    expect(pos(2022)).toBe(50)
    expect(pos(2024)).toBe(75)
    expect(pos(2025)).toBe(87.5)
  })

  it('os vãos entre marcadores refletem os vãos entre os anos', () => {
    // O salto de 2019 para 2022 é TRÊS vezes o de 2024 para 2025. É a única coisa
    // que este design mostra e que a lista vertical não mostrava.
    expect(pos(2022) - pos(2019)).toBeCloseTo(3 * (pos(2025) - pos(2024)), 5)
  })

  it('a barra cresce com o ano atual em vez de encostar no fim', () => {
    // Em 2026 a última entrada real não está no fim: sobra o vão até hoje, que é a
    // leitura honesta — a trajetória continua acontecendo.
    expect(pos(2025, 2026)).toBeLessThan(100)
    // E em 2030 ela recua mais ainda: a linha do tempo é viva.
    expect(pos(2025, 2030)).toBeLessThan(pos(2025, 2026))
  })

  it('nunca sai de 0..100, nem com ano atual no passado', () => {
    for (const e of entradas) {
      for (const ano of [2018, 2026, 2050]) {
        const p = posicaoNaLinha(entradas, e, ano)
        expect(p, `${e.id} em ${ano}`).toBeGreaterThanOrEqual(0)
        expect(p, `${e.id} em ${ano}`).toBeLessThanOrEqual(100)
      }
    }
  })
})

describe('dados da jornada', () => {
  for (const lang of ['pt', 'en']) {
    it(`${lang}: toda entrada tem ano, e existe exatamente uma futura`, () => {
      const itens = getJourneyData(lang).items
      expect(itens.length).toBeGreaterThan(1)

      const futuras = itens.filter((e) => e.futuro)
      expect(futuras.length, 'a barra tem UM marcador vazado, no fim').toBe(1)

      for (const e of itens) {
        if (e.futuro) continue
        expect(typeof e.ano, `${e.id}.ano`).toBe('number')
        expect(e.ano, `${e.id}.ano`).toBeGreaterThan(2000)
      }
    })
  }

  it('os dois idiomas descrevem a mesma trajetória', () => {
    // Os ids e os anos têm de bater entre PT e EN, senão a barra muda de FORMA
    // quando o visitante troca de idioma — e a forma é a informação.
    const pt = getJourneyData('pt').items
    const en = getJourneyData('en').items
    expect(en.map((e) => e.id)).toEqual(pt.map((e) => e.id))
    expect(en.map((e) => e.ano ?? null)).toEqual(pt.map((e) => e.ano ?? null))
    expect(en.map((e) => Boolean(e.futuro))).toEqual(pt.map((e) => Boolean(e.futuro)))
  })
})
