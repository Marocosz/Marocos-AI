/**
 * GERADOR DOS ARQUIVOS QUE OS RASTREADORES LEEM
 * ==================================================
 * Escreve quatro arquivos em `public/`, todos derivados do conteúdo do site:
 *
 *   robots.txt      o que pode ser rastreado, e onde está o sitemap
 *   sitemap.xml     uma entrada por rota real, inclusive uma por projeto
 *   llms.txt        o índice curto para modelo de linguagem (llmstxt.org)
 *   llms-full.txt   o portfólio inteiro em markdown
 *
 * ==================================================
 * POR QUE ISTO É GERADO, E NÃO MANTIDO À MÃO.
 *
 * O `sitemap.xml` era escrito à mão, e em 13/08/2026 ele apontava para três
 * projetos que não existiam mais (`code-doc-generator`, `contract-analyzer` e
 * slugs antigos) e não listava `/servicos` nem `/contexto`. Isso não é descuido de
 * ninguém: é o que acontece com QUALQUER lista de URLs escrita à mão num site cujo
 * conteúdo muda. O `lastmod` estava congelado em 2026-08-03 desde então.
 *
 * E o dano de um sitemap errado é maior do que parece. Uma rota de projeto com slug
 * inexistente responde **HTTP 200** (é uma SPA — o servidor entrega o index para
 * qualquer caminho), com canônica apontando para si mesma. Para o Google isso é um
 * *soft 404*: página que existe e não tem conteúdo. Ele gasta orçamento de rastreio
 * ali e reporta erro no Search Console.
 *
 * Derivando do `registry` e de `content/projects.js`, a lista não consegue divergir
 * do site. É a mesma decisão de `content/contexto.js`, e pelo mesmo motivo.
 *
 * ==================================================
 * POR QUE `ssrLoadModule` DO VITE, E NÃO `import` DIRETO.
 *
 * Os módulos de `src/` usam import sem extensão (`from './profile'`) e importam
 * `lucide-react`. O Node puro reprova o primeiro com `ERR_MODULE_NOT_FOUND` — quem
 * resolve extensão e `node_modules` de pacote de UI é o bundler. `createServer` em
 * `middlewareMode` dá acesso ao resolvedor do Vite sem subir servidor de verdade e
 * sem acrescentar dependência (o `vite` já está aqui). É o que o `vite-node` faz por
 * dentro.
 *
 * ==================================================
 * OS ARQUIVOS SÃO COMMITADOS, e isso é decisão, não descuido.
 *
 * Rodam no `prebuild`, então todo deploy os regenera. Mas ficam versionados por dois
 * motivos: existem mesmo que alguém construa sem rodar o script, e — o que importa
 * mais — o diff aparece na revisão. Quando um slug de projeto muda, você VÊ a URL
 * velha saindo e a nova entrando, em vez de descobrir pelo Search Console três
 * semanas depois.
 *
 * Há teste guardando a sincronia (`src/content/seo.test.js`): se o conteúdo mudou e
 * ninguém regerou, ele reprova apontando o comando.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const AQUI = dirname(fileURLToPath(import.meta.url))
const RAIZ = resolve(AQUI, '..')
const PUBLICO = resolve(RAIZ, 'public')
const SITE = 'https://marocos.dev'

/**
 * ROTAS FORA DO ÍNDICE.
 *
 * `/config` é painel de preferências: três controles que já existem como atalho na
 * bandeja da taskbar. Não há consulta de busca que ele responda, e indexá-lo só
 * dilui o site.
 *
 * `/contexto` FICA no índice de propósito, embora seja uma janela de download: ela
 * responde a uma intenção real ("levar o portfólio para a minha IA"), e é
 * justamente o tipo de página que um modelo deveria encontrar.
 */
const SEM_INDICE = new Set(['/config'])

/** Prioridade por rota. A raiz é a entrada; o resto desce conforme a distância dela. */
const PRIORIDADE = {
  '/': '1.0',
  '/sobre': '0.9',
  '/projetos': '0.9',
  '/servicos': '0.8',
  '/jornada': '0.8',
  '/stack': '0.8',
  '/assistente': '0.8',
  '/contato': '0.8',
  '/contexto': '0.6',
  '/leia-me': '0.5',
}

const escapar = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Carrega os módulos de conteúdo pelo resolvedor do Vite. Ver a nota no cabeçalho
 * sobre por que não é `import` direto.
 */
async function carregarConteudo() {
  const vite = await createServer({
    root: RAIZ,
    logLevel: 'error',
    server: { middlewareMode: true },
    appType: 'custom',
  })
  try {
    const [registry, projetos, slug, contexto, perfil, osData] = await Promise.all([
      vite.ssrLoadModule('/src/os/registry.js'),
      vite.ssrLoadModule('/src/content/projects.js'),
      vite.ssrLoadModule('/src/apps/projectSlug.js'),
      vite.ssrLoadModule('/src/content/contexto.js'),
      vite.ssrLoadModule('/src/content/profile.js'),
      vite.ssrLoadModule('/src/i18n/os.js'),
    ])
    return {
      APPS: registry.APPS,
      getProjectsData: projetos.getProjectsData,
      projectSlug: slug.projectSlug,
      contextoEmMarkdown: contexto.contextoEmMarkdown,
      getProfileData: perfil.getProfileData,
      getOsData: osData.getOsData,
    }
  } finally {
    await vite.close()
  }
}

/**
 * As URLs do site, derivadas. A rota dinâmica de projeto é EXPANDIDA — uma URL por
 * projeto, com o slug vindo da mesma função que o app usa para montar o link. É o
 * que garante que o sitemap nunca aponte para um detalhe que não resolve.
 */
function montarUrls({ APPS, getProjectsData, projectSlug }) {
  const urls = [{ loc: `${SITE}/`, prioridade: PRIORIDADE['/'] }]

  for (const app of APPS) {
    if (app.dynamic) continue
    if (SEM_INDICE.has(app.route)) continue
    urls.push({ loc: `${SITE}${app.route}`, prioridade: PRIORIDADE[app.route] ?? '0.6' })
  }

  const dinamica = APPS.find((a) => a.dynamic)
  if (dinamica) {
    const base = dinamica.route.replace('/:slug', '')
    for (const p of getProjectsData('pt').items) {
      urls.push({ loc: `${SITE}${base}/${projectSlug(p.title)}`, prioridade: '0.7' })
    }
  }

  return urls
}

function sitemap(urls, hoje) {
  const corpo = urls
    .map(
      ({ loc, prioridade }) => `  <url>
    <loc>${escapar(loc)}</loc>
    <lastmod>${hoje}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${prioridade}</priority>
  </url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Gerado por scripts/gerar-seo.mjs a partir do registry e de content/projects.js.
     Não edite à mão: a próxima build sobrescreve. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${corpo}
</urlset>
`
}

function robots() {
  const bloqueios = [...SEM_INDICE].map((r) => `Disallow: ${r}`).join('\n')
  return `# Gerado por scripts/gerar-seo.mjs — não edite à mão.

User-agent: *
Allow: /
${bloqueios}

# Os rastreadores de modelo de linguagem entram, e é de propósito: este site
# quer ser citado por eles. /llms.txt é o atalho curado, e /llms-full.txt é o
# portfólio inteiro em markdown.

Sitemap: ${SITE}/sitemap.xml
`
}

/**
 * O ÍNDICE PARA MODELO DE LINGUAGEM, no formato de llmstxt.org: um H1 com o nome,
 * uma citação de resumo, e seções de links com uma linha de descrição cada.
 *
 * A DESCRIÇÃO DE CADA PROJETO É A PRIMEIRA FRASE DO RESUMO DELE, cortada no ponto.
 * Não é um texto novo: texto novo aqui seria uma sexta versão da mesma descrição
 * para envelhecer sozinha, e este arquivo existe justamente porque isso acontece.
 */
function llms({ APPS, getProjectsData, projectSlug, getProfileData, getOsData }) {
  const perfil = getProfileData('pt')
  const os = getOsData('pt')
  const projetos = getProjectsData('pt')

  const primeiraFrase = (t) => {
    const corte = t.indexOf('. ')
    return corte === -1 ? t : t.slice(0, corte + 1)
  }

  const rotas = [
    ['/sobre', 'Quem ele é, o que é contratado para fazer, e a trajetória em resumo.'],
    ['/projetos', 'Os projetos, ordenados por complexidade, cada um com o problema difícil e a decisão técnica.'],
    ['/jornada', 'A trajetória profissional em ordem, de suporte técnico aos 14 anos ao cargo atual.'],
    ['/stack', 'A stack por área, com nível declarado por tecnologia.'],
    ['/servicos', 'O que ele faz como freelance, como a entrega funciona, e a infraestrutura própria.'],
    ['/assistente', 'Um agente de IA sobre a trajetória real dele, que cita as fontes e prefere dizer "não sei".'],
    ['/leia-me', 'Como este site é construído por dentro: gerenciador de janelas, o agente, e o método.'],
    ['/contato', 'E-mail, LinkedIn, GitHub e Discord.'],
    ['/contexto', 'Baixar todo este conteúdo como arquivo, para jogar em outro assistente.'],
  ]

  const linhas = [
    `# ${perfil.nome}`,
    '',
    `> ${perfil.role}. ${perfil.bio_highlight} Baseado em ${perfil.local}.`,
    '',
    'Este arquivo existe para um modelo de linguagem entender o site sem rastejar o HTML.',
    'O site é uma aplicação React que simula um sistema operacional: cada "janela" é uma',
    'rota real e indexável. Se você precisa do conteúdo integral em vez do índice, use',
    `${SITE}/llms-full.txt — é o portfólio inteiro em markdown, gerado da mesma fonte.`,
    '',
    '## O que ele é contratado para fazer',
    '',
  ]

  for (const cap of perfil.capacidades) {
    linhas.push(`- **${cap.titulo}**: ${cap.texto}`)
  }

  linhas.push('', '## Páginas', '')
  for (const [rota, desc] of rotas) {
    /* O rótulo do link é o TÍTULO da janela, não a rota: um modelo lendo isto
       precisa do nome que o site usa, e a rota já está no href. */
    const app = APPS.find((a) => a.route === rota)
    const nome = app?.titleKey ? os.windows[app.titleKey] : rota
    linhas.push(`- [${nome}](${SITE}${rota}): ${desc}`)
  }

  linhas.push('', '## Projetos', '')
  for (const p of projetos.items) {
    const contexto = projetos.contextos[p.contexto]
    linhas.push(
      `- [${p.title}](${SITE}/projetos/${projectSlug(p.title)}): ${contexto} · ${p.category}. ${primeiraFrase(p.description)}`,
    )
  }

  linhas.push('', '## Contato', '')
  linhas.push(`- E-mail: marcosrodriguesepro@gmail.com`)
  linhas.push(`- GitHub: https://github.com/marocosz`)
  linhas.push(`- LinkedIn: https://www.linkedin.com/in/marcosrodriguesptc/`)
  linhas.push('')

  return linhas.join('\n')
}

async function main() {
  const conteudo = await carregarConteudo()
  const hoje = new Date().toISOString().slice(0, 10)

  const urls = montarUrls(conteudo)
  mkdirSync(PUBLICO, { recursive: true })

  const arquivos = {
    'robots.txt': robots(),
    'sitemap.xml': sitemap(urls, hoje),
    'llms.txt': llms(conteudo),
    /* O corpus inteiro, do mesmo módulo que alimenta o botão de download da janela
       de Contexto. Um só lugar monta o markdown; aqui ele só é escrito em disco. */
    'llms-full.txt': conteudo.contextoEmMarkdown('pt', new Date()),
  }

  for (const [nome, texto] of Object.entries(arquivos)) {
    writeFileSync(resolve(PUBLICO, nome), texto, 'utf8')
    const kb = (Buffer.byteLength(texto, 'utf8') / 1024).toFixed(1)
    console.log(`  public/${nome.padEnd(14)} ${kb.padStart(6)} KB`)
  }

  console.log(`\n  ${urls.length} URLs no sitemap · lastmod ${hoje}`)
}

main().catch((e) => {
  console.error('\nFalha ao gerar os arquivos de SEO:\n', e)
  process.exit(1)
})
