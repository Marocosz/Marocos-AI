import { describe, it, expect } from 'vitest'
import { montarContexto, contextoEmMarkdown, contextoEmJson, nomeDoArquivo } from './contexto'
import { getProjectsData } from './projects'
import { getProfileData } from './profile'

/**
 * O ARQUIVO QUE O VISITANTE BAIXA.
 *
 * Este é o único conteúdo do projeto que sai do site e vira um artefato na máquina de
 * outra pessoa — e é por isso que ele merece teste apesar de ser "só texto". Três
 * coisas podem dar errado aqui, e as três são silenciosas:
 *
 *   1. VAZAR DADO. O corpus é montado a partir dos módulos de conteúdo, e um deles
 *      guarda a data de nascimento. Se alguém trocar `idadeEm(...)` por
 *      `perfil.nascimento` num refactor distraído, nada quebra e o arquivo passa a
 *      carregar dado pessoal que o site nunca exibiu.
 *   2. FICAR INCOMPLETO. O valor da ideia é ser o portfólio INTEIRO. Um projeto que
 *      entra na janela e não entra no arquivo derrota o propósito, e ninguém
 *      compararia os dois à mão.
 *   3. OS DOIS FORMATOS DIVERGIREM. `.md` e `.json` têm de carregar a mesma
 *      informação; o dia em que um deles ganhar um campo que o outro não tem, quem
 *      escolheu o formato "errado" recebe menos sem saber.
 *
 * `hoje` ENTRA POR PARÂMETRO em toda função deste módulo, e é o que torna estes
 * testes determinísticos — mesma decisão de `idadeEm()` e de `posicaoNaLinha()`.
 */
const HOJE = new Date(2026, 7, 13) // 13 de agosto de 2026, hora local

describe('contexto para download', () => {
  for (const lang of ['pt', 'en']) {
    it(`${lang}: leva todos os projetos da janela`, () => {
      const doSite = getProjectsData(lang).items
      const doArquivo = montarContexto(lang, HOJE).projetos

      expect(doArquivo).toHaveLength(doSite.length)
      // A ORDEM também: ela é a de complexidade decrescente, e quem pedir "o projeto
      // mais complexo" à própria IA recebe a resposta certa de graça por causa dela.
      expect(doArquivo.map((p) => p.titulo)).toEqual(doSite.map((p) => p.title))
    })

    it(`${lang}: o markdown cita cada projeto e cada área da stack`, () => {
      const md = contextoEmMarkdown(lang, HOJE)
      const c = montarContexto(lang, HOJE)

      for (const p of c.projetos) {
        expect(md, `projeto ausente do markdown: ${p.titulo}`).toContain(p.titulo)
      }
      for (const area of c.stack) {
        expect(md, `área ausente do markdown: ${area.area}`).toContain(area.area)
      }
      for (const cap of c.capacidades) {
        expect(md, `capacidade ausente do markdown: ${cap.titulo}`).toContain(cap.titulo)
      }
    })

    it(`${lang}: não vaza a data de nascimento, em formato nenhum`, () => {
      const nascimento = getProfileData(lang).nascimento
      const md = contextoEmMarkdown(lang, HOJE)
      const json = contextoEmJson(lang, HOJE)
      const contexto = montarContexto(lang, HOJE)

      // A string ISO inteira, e também só o ano — o ano de nascimento sozinho já
      // permite reconstruir a data junto com a idade.
      const [ano] = nascimento.split('-')
      for (const [nome, saida] of [['markdown', md], ['json', json]]) {
        expect(saida, `${nome} contém a data de nascimento`).not.toContain(nascimento)
        expect(saida, `${nome} contém o ano de nascimento`).not.toContain(ano)
      }

      // E a idade DEVE estar lá: é o que substitui a data.
      expect(typeof contexto.identidade.idade).toBe('number')
      expect(contexto.identidade.idade).toBeGreaterThan(18)
    })

    it(`${lang}: não leva a estimativa interna de complexidade`, () => {
      // `bytes` é convenção interna do explorador (ver content/projects.js). Fora
      // dele não significa nada, e num arquivo que uma IA vai ler só convida à
      // conclusão errada de que é o peso do repositório.
      for (const p of montarContexto(lang, HOJE).projetos) {
        expect(p).not.toHaveProperty('bytes')
      }
    })

    it(`${lang}: o json é válido e carrega as mesmas seções`, () => {
      const json = JSON.parse(contextoEmJson(lang, HOJE))
      const objeto = montarContexto(lang, HOJE)
      expect(json).toEqual(objeto)

      for (const chave of [
        'identidade',
        'capacidades',
        'numeros',
        'trajetoria',
        'projetos',
        'stack',
        'servicos',
        'contato',
      ]) {
        expect(json, `seção ausente do json: ${chave}`).toHaveProperty(chave)
      }
    })

    it(`${lang}: projeto sem repositório vira null, e não uma string vazia`, () => {
      // `null` é a informação ("é código fechado"); string vazia é um campo
      // quebrado, e uma IA lendo `""` conclui que o link existe e está errado.
      for (const p of montarContexto(lang, HOJE).projetos) {
        expect(p.repositorio === null || p.repositorio.startsWith('https://')).toBe(true)
      }
    })
  }

  it('o nome do arquivo carrega idioma e data', () => {
    expect(nomeDoArquivo('pt', 'md', HOJE)).toBe('marcos-rodrigues-contexto-pt-2026-08-13.md')
    expect(nomeDoArquivo('en', 'json', HOJE)).toBe('marcos-rodrigues-contexto-en-2026-08-13.json')
  })

  it('os dois idiomas descrevem o mesmo conjunto de coisas', () => {
    // Tamanhos iguais em toda seção: se o inglês perder um projeto ou uma
    // capacidade, quem baixa em inglês recebe um portfólio menor.
    const pt = montarContexto('pt', HOJE)
    const en = montarContexto('en', HOJE)

    expect(en.projetos.length).toBe(pt.projetos.length)
    expect(en.capacidades.length).toBe(pt.capacidades.length)
    expect(en.trajetoria.length).toBe(pt.trajetoria.length)
    expect(en.stack.length).toBe(pt.stack.length)
    expect(en.contato.length).toBe(pt.contato.length)
    expect(en.servicos.oferta.length).toBe(pt.servicos.oferta.length)
  })
})
