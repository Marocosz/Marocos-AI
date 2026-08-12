import { describe, it, expect } from 'vitest'
import { idadeEm, getProfileData } from './profile'

/**
 * A IDADE É DERIVADA DE PROPÓSITO. Escrever "22 anos" no conteúdo é escrever um
 * número com data de validade — e o dia em que ele vence é justamente o dia em
 * que ninguém está lendo o arquivo.
 *
 * As datas aqui são construídas com `new Date(ano, mes, dia)` (mês base 0, hora
 * local) e a de nascimento é quebrada à mão na implementação. Os dois de
 * propósito: `new Date('2003-12-14')` é meia-noite UTC, e comparar isso com uma
 * data local a oeste de Greenwich — que é onde este site roda — faz o
 * aniversário chegar um dia antes.
 */
describe('idadeEm', () => {
  const NASCIMENTO = '2003-12-14'

  it('na véspera do aniversário ainda não contou o ano', () => {
    expect(idadeEm(NASCIMENTO, new Date(2026, 11, 13))).toBe(22)
  })

  it('no dia do aniversário conta o ano', () => {
    expect(idadeEm(NASCIMENTO, new Date(2026, 11, 14))).toBe(23)
  })

  it('no dia seguinte segue contado', () => {
    expect(idadeEm(NASCIMENTO, new Date(2026, 11, 15))).toBe(23)
  })

  it('mês anterior ao do aniversário não conta', () => {
    expect(idadeEm(NASCIMENTO, new Date(2026, 7, 12))).toBe(22)
  })

  /**
   * Nascido em 29 de fevereiro, num ano em que o dia não existe. A regra que este
   * teste fixa é a civil brasileira: o aniversário vale em 1º de março.
   */
  it('nascido em 29 de fevereiro conta em 1º de março do ano comum', () => {
    expect(idadeEm('2004-02-29', new Date(2026, 1, 28))).toBe(21)
    expect(idadeEm('2004-02-29', new Date(2026, 2, 1))).toBe(22)
  })
})

describe('perfil', () => {
  /**
   * O NOME NÃO APARECIA EM PIXEL NENHUM DO CONTEÚDO antes desta mudança — só no
   * `<title>` da aba. Este teste existe para o campo não voltar a sumir num
   * refactor: ele é lido pelo herói do "Sobre este PC", que é o app que abre
   * sozinho para quem chega sem deep link.
   */
  it('os campos de identidade existem nos dois idiomas', () => {
    for (const lang of ['pt', 'en']) {
      const p = getProfileData(lang)
      expect(p.nome, lang).toBe('Marcos Rodrigues')
      expect(p.nascimento, lang).toBe('2003-12-14')
      expect(p.local, lang).toBeTruthy()
      expect(p.status, lang).toBeTruthy()
    }
  })
})
