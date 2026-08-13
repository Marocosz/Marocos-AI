import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { APPS } from '../os/registry'
import { getProjectsData } from './projects'
import { getOsData } from '../i18n/os'
import { projectSlug } from '../apps/projectSlug'

/**
 * OS ARQUIVOS QUE OS RASTREADORES LEEM ESTÃO EM SINCRONIA COM O CONTEÚDO?
 *
 * `public/sitemap.xml`, `robots.txt`, `llms.txt` e `llms-full.txt` são gerados por
 * `scripts/gerar-seo.mjs` e ficam COMMITADOS (a nota lá explica por quê). O risco
 * óbvio dessa combinação é o arquivo commitado envelhecer: alguém acrescenta um
 * projeto, não roda a geração, e o sitemap passa a mentir.
 *
 * Este teste é o guarda. Ele não regenera nada — compara o que está em disco com o
 * que o conteúdo diz hoje, e quando divergem aponta o comando.
 *
 * O DEFEITO QUE ELE EXISTE PARA IMPEDIR JÁ ACONTECEU. Em 13/08/2026 o sitemap
 * escrito à mão listava `code-doc-generator` e `contract-analyzer` — projetos que
 * tinham saído da lista — e não listava `/servicos` nem `/contexto`. Numa SPA um slug
 * inexistente responde HTTP 200 com corpo vazio, que é o pior tipo de erro para o
 * Google: ele chama isso de soft 404, gasta rastreio ali e reporta no Search Console.
 */
/**
 * Caminho relativo a ESTE arquivo, por `import.meta.url`, e não por `process.cwd()`:
 * o `cwd` depende de onde o vitest foi invocado, e `process` não está nos globals do
 * eslint deste projeto (a config é de navegador). `import.meta` é ESM padrão e
 * funciona nos dois mundos.
 */
const publico = (nome) =>
  readFileSync(new URL(`../../public/${nome}`, import.meta.url), 'utf8')

const SITE = 'https://marocos.dev'

/** As rotas que o sitemap DEVE ter, derivadas do registry — a mesma regra do script. */
const rotasEsperadas = () => {
  const semIndice = new Set(['/config'])
  const fixas = APPS.filter((a) => !a.dynamic && !semIndice.has(a.route)).map((a) => a.route)
  const slugs = getProjectsData('pt').items.map((p) => `/projetos/${projectSlug(p.title)}`)
  return ['/', ...fixas, ...slugs]
}

describe('sitemap.xml', () => {
  const xml = publico('sitemap.xml')
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])

  it('tem exatamente as URLs que o conteúdo de hoje produz', () => {
    const esperado = rotasEsperadas().map((r) => `${SITE}${r === '/' ? '/' : r}`)
    expect(
      [...locs].sort(),
      'sitemap fora de sincronia com o conteúdo — rode `npm run seo`',
    ).toEqual([...esperado].sort())
  })

  it('não aponta para nenhum projeto que não resolve', () => {
    // O teste acima já cobriria, mas este falha com a mensagem certa: é o defeito
    // real que motivou o gerador, e vale ser nomeado.
    const vivos = new Set(getProjectsData('pt').items.map((p) => projectSlug(p.title)))
    const mortos = locs
      .filter((l) => l.includes('/projetos/'))
      .map((l) => l.split('/projetos/')[1])
      .filter((slug) => !vivos.has(slug))

    expect(mortos, `slugs no sitemap que não existem mais: ${mortos.join(', ')}`).toEqual([])
  })

  it('não indexa o painel de preferências', () => {
    expect(locs.some((l) => l.endsWith('/config'))).toBe(false)
  })
})

describe('robots.txt', () => {
  const txt = publico('robots.txt')

  it('aponta o sitemap', () => {
    expect(txt).toContain(`Sitemap: ${SITE}/sitemap.xml`)
  })

  it('libera o site e bloqueia só o que não tem valor de busca', () => {
    expect(txt).toMatch(/^Allow: \/$/m)
    expect(txt).toMatch(/^Disallow: \/config$/m)
  })
})

describe('llms.txt', () => {
  const txt = publico('llms.txt')

  it('segue a forma de llmstxt.org: um H1 e uma citação de resumo', () => {
    const linhas = txt.split('\n')
    expect(linhas[0]).toBe('# Marcos Rodrigues')
    expect(txt).toMatch(/^> /m)
  })

  it('lista todos os projetos, com link que resolve', () => {
    for (const p of getProjectsData('pt').items) {
      const url = `${SITE}/projetos/${projectSlug(p.title)}`
      expect(txt, `projeto ausente do llms.txt: ${p.title}`).toContain(url)
    }
  })

  it('lista as capacidades e as páginas pelo nome que o site usa', () => {
    const os = getOsData('pt')
    expect(txt).toContain('## O que ele é contratado para fazer')
    expect(txt).toContain(os.windows.projects)
    expect(txt).toContain(os.windows.services)
  })

  it('aponta o corpus completo', () => {
    expect(txt).toContain(`${SITE}/llms-full.txt`)
  })
})

describe('llms-full.txt', () => {
  const txt = publico('llms-full.txt')

  it('é o corpus inteiro, não o índice', () => {
    // Dezenas de KB. Se vier pequeno, o gerador escreveu o arquivo errado.
    expect(txt.length).toBeGreaterThan(20_000)
    expect(txt).toContain('# Contexto profissional de Marcos Rodrigues')
    expect(txt).toContain('## Projetos')
  })

  it('não vaza a data de nascimento', () => {
    // A mesma garantia de `contexto.test.js`, conferida no arquivo que fica público
    // em disco — este é servido para qualquer um que peça /llms-full.txt.
    expect(txt).not.toContain('2003-12-14')
    expect(txt).not.toContain('2003')
  })
})
