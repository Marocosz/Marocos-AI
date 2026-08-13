import { describe, it, expect } from 'vitest'
import { idiomaInicial, tagDeIdioma, PADRAO } from './idiomaInicial'

/**
 * QUAL IDIOMA O SITE ABRE — a decisão que define a primeira impressão.
 *
 * Este teste existe porque o defeito que ele guarda era invisível para quem
 * desenvolve: o `localStorage` do desenvolvedor sempre tem `language` salvo, então o
 * caminho do visitante NOVO nunca era exercitado. O site abria em inglês para todo
 * mundo, inclusive brasileiro, e ninguém via.
 *
 * A função é pura e recebe as duas entradas por parâmetro exatamente para poder ser
 * testada assim — mesma decisão de `idadeEm()` e de `posicaoNaLinha()`.
 */
describe('idiomaInicial', () => {
  it('a escolha salva ganha de tudo, inclusive do navegador', () => {
    // Quem trocou para inglês num navegador em português QUIS inglês.
    expect(idiomaInicial('en', ['pt-BR', 'pt'])).toBe('en')
    expect(idiomaInicial('pt', ['en-US'])).toBe('pt')
  })

  it('sem nada salvo, segue a preferência do navegador', () => {
    expect(idiomaInicial(null, ['pt-BR', 'en-US'])).toBe('pt')
    expect(idiomaInicial(null, ['en-US', 'pt-BR'])).toBe('en')
  })

  it('compara só a subtag primária', () => {
    // `pt-PT` é português para este site, e `en-GB` é inglês. Comparar a tag inteira
    // faria os dois caírem no padrão por um detalhe que não muda nada aqui.
    expect(idiomaInicial(null, ['pt-PT'])).toBe('pt')
    expect(idiomaInicial(null, ['en-GB'])).toBe('en')
    expect(idiomaInicial(null, ['PT-br'])).toBe('pt')
  })

  it('idioma que o site não tem cai no padrão, e não na lista inteira', () => {
    expect(idiomaInicial(null, ['es-ES', 'fr-FR'])).toBe(PADRAO)
    // Mas se houver um conhecido DEPOIS de desconhecidos, ele vale.
    expect(idiomaInicial(null, ['es-ES', 'en-US'])).toBe('en')
  })

  it('o padrão é português, e isso é decisão de conteúdo', () => {
    // O site fala de trajetória, cliente e faculdade brasileiros; o inglês existe
    // para alcance, não como língua de origem. Era 'en' e abria errado para o
    // público principal.
    expect(PADRAO).toBe('pt')
    expect(idiomaInicial(null, [])).toBe('pt')
    expect(idiomaInicial(null)).toBe('pt')
  })

  it('valor salvo inválido não envenena a decisão', () => {
    // localStorage é editável pelo visitante e sobrevive a deploy. Um valor de uma
    // versão antiga do site não pode deixar a interface sem idioma.
    expect(idiomaInicial('klingon', ['en-US'])).toBe('en')
    expect(idiomaInicial('', ['pt-BR'])).toBe('pt')
    expect(idiomaInicial(undefined, [])).toBe('pt')
  })
})

describe('tagDeIdioma', () => {
  it('devolve a tag que vai no atributo lang do html', () => {
    // `pt-br` é o que o index.html já declarava e é a variante que o conteúdo usa.
    expect(tagDeIdioma('pt')).toBe('pt-br')
    expect(tagDeIdioma('en')).toBe('en')
  })
})
