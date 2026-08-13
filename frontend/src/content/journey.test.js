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
    // 2018..2027 é a extensão da barra (ver a nota sobre o `+ 1` em journey.js);
    // cada ano vale 1/9 dela.
    expect(pos(2018)).toBe(0)
    expect(pos(2019)).toBeCloseTo(100 / 9, 5)
    expect(pos(2022)).toBeCloseTo((4 / 9) * 100, 5)
    expect(pos(2025)).toBeCloseTo((7 / 9) * 100, 5)
    expect(pos(2026)).toBeCloseTo((8 / 9) * 100, 5)
  })

  it('os vãos entre marcadores refletem os vãos entre os anos', () => {
    // O salto de 2019 para 2022 é TRÊS vezes o de 2025 para 2026. É a única coisa
    // que este design mostra e que a lista vertical não mostrava.
    expect(pos(2022) - pos(2019)).toBeCloseTo(3 * (pos(2026) - pos(2025)), 5)
  })

  it('a barra cresce com o ano atual em vez de encostar no fim', () => {
    // A última entrada real nunca está no fim: sobra o vão até o futuro, que é a
    // leitura honesta — a trajetória continua acontecendo.
    expect(pos(2026, 2026)).toBeLessThan(100)
    // E em 2030 ela recua mais ainda: a linha do tempo é viva.
    expect(pos(2026, 2030)).toBeLessThan(pos(2026, 2026))
  })

  /**
   * O TESTE QUE EXISTE POR CAUSA DE UM DEFEITO REAL.
   *
   * Com a fórmula antiga (`fim = max(anoAtual, ...anos)`), uma entrada criada NO ANO
   * CORRENTE caía em 100 — exatamente onde fica o marcador vazado do roadmap. Foi o
   * que aconteceu ao acrescentar a entrada da Finza em 2026: os dois marcadores se
   * sobrepunham, e a barra perdia a única distinção que ela existe para desenhar.
   *
   * A posição 100 é RESERVADA para o futuro. Este teste é o que impede a fórmula de
   * voltar a entregá-la a uma entrada real.
   */
  it('nenhuma entrada real ocupa a posição do marcador de futuro', () => {
    for (const e of entradas) {
      if (e.futuro) continue
      // Testado com o ano atual igual ao da entrada mais recente, que é o cenário
      // em que a fórmula antiga falhava.
      const anoMaisRecente = Math.max(...entradas.filter((x) => !x.futuro).map((x) => x.ano))
      expect(posicaoNaLinha(entradas, e, anoMaisRecente), e.id).toBeLessThan(100)
    }
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
