/**
 * QUAL IDIOMA O SITE ABRE.
 * ==================================================
 * Esta função existe por causa de um defeito que ficou vivo por meses e não era
 * visível em nenhuma tela de desenvolvimento, porque quem desenvolve já tem
 * `language` salvo no localStorage.
 *
 * O `LanguageContext` fazia `localStorage.getItem('language') || 'en'`. Ou seja:
 * **todo visitante novo recebia o site em inglês** — inclusive os brasileiros, que
 * são o público principal de um portfólio escrito por alguém em Uberlândia, com
 * clientes de prefeituras brasileiras.
 *
 * E havia um segundo dano, pior porque é silencioso: o `index.html` declara
 * `<html lang="pt-br">` e uma meta description em português. Carregando `/sobre`
 * num Chromium limpo, o `<title>` voltava "About This PC | Marcos Rodrigues" e as
 * seções em inglês. Para um rastreador, isso é conteúdo em inglês declarado como
 * português — incoerência que reduz relevância nas duas línguas.
 *
 * ==================================================
 * A REGRA, EM TRÊS DEGRAUS, E A ORDEM IMPORTA.
 *
 *   1. o que o visitante ESCOLHEU (localStorage) — sempre ganha
 *   2. o que o navegador dele DIZ (`navigator.languages`)
 *   3. português, como padrão
 *
 * O degrau 1 vem primeiro porque escolha explícita não se sobrescreve: quem trocou
 * para inglês num navegador em português quis inglês.
 *
 * O PADRÃO DEIXOU DE SER INGLÊS, e é decisão de conteúdo, não de código. O site
 * fala de trajetória brasileira, cliente brasileiro e faculdade brasileira; a versão
 * em inglês existe para alcance, não como língua de origem. Quando o navegador não
 * diz nada de útil, o palpite honesto é português.
 *
 * `navigator.languages` (plural) antes de `navigator.language`: a lista carrega a
 * ordem de preferência real do usuário, e um navegador configurado como
 * `['pt-BR', 'en-US']` deve dar português mesmo que a `language` principal esteja
 * em outra coisa por acidente de instalação.
 *
 * A função é PURA e recebe as duas entradas por parâmetro — mesma decisão de
 * `idadeEm()` e `posicaoNaLinha()`. Função que lê `window` por dentro não tem teste
 * determinístico, e esta é a que decide a primeira impressão do site.
 */

/** Os dois idiomas que o conteúdo tem. Qualquer outro cai no padrão. */
export const IDIOMAS = ['pt', 'en']

export const PADRAO = 'pt'

/**
 * @param salvo        o valor de `localStorage.getItem('language')`, ou null
 * @param preferidos   lista de tags BCP-47 do navegador (`navigator.languages`)
 */
export const idiomaInicial = (salvo, preferidos = []) => {
  if (IDIOMAS.includes(salvo)) return salvo

  for (const tag of preferidos) {
    /* Compara só a SUBTAG primária: `pt-BR`, `pt-PT` e `pt` são todos português
       para este site, e `en-GB` é inglês. Comparar a tag inteira faria um navegador
       em `pt-PT` cair no padrão por um detalhe que não muda nada aqui. */
    const primaria = String(tag).toLowerCase().split('-')[0]
    if (IDIOMAS.includes(primaria)) return primaria
  }

  return PADRAO
}

/**
 * A tag que vai para o atributo `lang` do `<html>`.
 *
 * `pt-br` e não `pt`: é o que o `index.html` já declarava, e é a variante que o
 * conteúdo de fato usa (Uberlândia, prefeituras, "você"). Para o inglês, `en` sem
 * região — o texto não é marcadamente americano nem britânico.
 */
export const tagDeIdioma = (idioma) => (idioma === 'pt' ? 'pt-br' : 'en')
