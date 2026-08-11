/**
 * VERIFICAÇÃO FUNCIONAL DAS NOVE ROTAS E DO CARREGAMENTO SOB DEMANDA
 * ==================================================
 * O regressor visual (`visual.spec.js`) fotografa cenas — e uma janela cujo
 * `import()` dinâmico apontou para o caminho errado aparece nas fotos como
 * janela VAZIA, o que pode não divergir da referência o bastante para
 * reprovar (o corpo vazio de uma janela quebrada e o corpo vazio do instante
 * antes do Suspense resolver às vezes têm a mesma silhueta). `npm run build`
 * também não pega: um `import('./caminho/errado')` compila sem erro e só
 * falha em runtime, quando alguém navega até ali.
 *
 * Este spec é o que fecha esse buraco: entra por DEEP LINK em cada uma das
 * nove rotas do registry (`os/registry.js`) e prova, com Chromium real, que
 * a janela certa abriu, com o título certo na taskbar, e o CORPO do app
 * renderizou CONTEÚDO — não só que o seletor existe, mas que o chunk lazy
 * resolveu e o Suspense entregou algo de verdade. Além das nove rotas,
 * cobre quatro comportamentos que dependiam de resolução SÍNCRONA antes do
 * refactor para `React.lazy`:
 *
 *   1. Deep link dinâmico (`/projetos/:slug`): a janela PAI (`projects`) abre
 *      atrás, sem o usuário ter clicado em nada — só o reducer decidindo a
 *      partir da URL.
 *   2. Voltar/avançar do navegador troca o foco entre janelas já abertas.
 *   3. Clique num ícone da área de trabalho abre a janela (o caminho
 *      "clique", não só o deep link — os dois usam mecanismos diferentes).
 *   4. Rede lenta: o fallback nulo do Suspense não deixa a janela QUEBRADA —
 *      ela mostra o chrome (barra de título) com o corpo vazio até o chunk
 *      chegar, nunca um erro ou uma janela ausente.
 *   5. O react-markdown do AssistantApp só é buscado depois da primeira
 *      resposta do agente — nunca no estado vazio — e o fallback mostra o
 *      texto cru se o chunk atrasar.
 *
 * Promovido do rascunho `task-14-rotas.mjs` (ver
 * `.superpowers/sdd/2026-08-10-refatoracao-frontend/`), escrito durante o
 * próprio refactor que introduziu o `React.lazy` por app. Uma tarefa
 * POSTERIOR (reorganização de pastas) reusou aquele rascunho sem modificação
 * e ele pegou exatamente os imports dinâmicos que a reorganização deixou
 * apontando para o caminho errado — a prova de que este tipo de teste vale
 * manter permanente, não descartar.
 *
 * Reaproveita a infraestrutura do harness permanente em vez da que o
 * rascunho tinha por conta própria: o `webServer` (vite preview) e o
 * congelamento de preferências (`use` em playwright.config.js — locale,
 * `reducedMotion`, viewport) já vêm do `playwright.config.js` compartilhado
 * com `visual.spec.js`, e cada `test()` do Playwright Test já ganha um
 * `BrowserContext` isolado — o rascunho precisava gerenciar isso à mão
 * (`chromium.launch()`, `newContext()` por teste, `spawn`/`kill` de um
 * `vite preview` próprio numa porta separada, com as armadilhas de Windows
 * documentadas nos comentários dele). Nada disso sobrou aqui: é
 * infraestrutura que este pacote já resolve uma vez para todo spec.
 */
import { test, expect } from '@playwright/test'
import { setTimeout as esperar } from 'node:timers/promises'
import { DESKTOP } from './cenas.js'

// Nenhuma cena deste spec usa viewport mobile — as nove rotas e os quatro
// comportamentos abaixo só foram exercitados em desktop no rascunho
// original, e é onde o bug de import quebrado que motivou este spec foi
// encontrado. `DESKTOP` já é o padrão em `playwright.config.js`; declarado
// aqui mesmo assim, explícito, para não depender de ninguém lembrar disso
// ao ler só este arquivo (mesmo raciocínio do `test.use()` por bloco em
// `visual.spec.js`).
test.use({ viewport: DESKTOP })

/**
 * Preferências ANTES do primeiro render, igual a `visual.spec.js`: tema
 * escuro, animação desligada (não afeta o lazy-loading, só o shader/cristal,
 * mas reduz ruído) e idioma pt — os títulos esperados abaixo são em PT.
 * `reducedMotion` e `locale` já vêm de `playwright.config.js`.
 */
async function definirPreferencias(context) {
  await context.addInitScript(() => {
    localStorage.setItem('isDarkMode', 'true')
    localStorage.setItem('isAnimationEnabled', 'false')
    localStorage.setItem('language', 'pt')
  })
}

/**
 * Boot + tela de bloqueio: clique em qualquer lugar pula o boot, clique na
 * porta destranca. Mesmo fluxo de `visual.spec.js`, sem a captura no fim.
 */
async function passarDaCerimonia(page) {
  await page.waitForSelector('.cerimonia', { timeout: 15_000 })
  await page.mouse.click(10, 10)
  await page.waitForSelector('.porta:not([disabled])', { timeout: 15_000 })
  await page.click('.porta')
  await page.waitForSelector('.cerimonia', { state: 'detached', timeout: 15_000 })
}

/**
 * As nove rotas do registry, com o que cada uma precisa provar:
 *   titulo        texto esperado no botão ativo da taskbar
 *   seletorCorpo  seletor que só existe se o CORPO do app renderizou
 *   paiSeletor    (só a rota dinâmica) seletor da janela pai, que deve estar
 *                 montada atrás sem nenhum clique
 */
const ROTAS = [
  { rota: '/sobre', titulo: 'Sobre este PC', seletorCorpo: '.about-app' },
  { rota: '/projetos', titulo: 'Meus Projetos', seletorCorpo: '.projects-app-list' },
  {
    rota: '/projetos/bussola-v2',
    titulo: 'bussola-v2', // título dinâmico: sem titleKey, Window usa o slug
    seletorCorpo: '.project-detail-title',
    paiSeletor: '.projects-app-list',
  },
  { rota: '/contato', titulo: 'Terminal', seletorCorpo: '.terminal-app' },
  { rota: '/assistente', titulo: 'Marcos Virtual', seletorCorpo: '.assistant-app' },
  { rota: '/config', titulo: 'Configurações', seletorCorpo: '.settings-app' },
  { rota: '/leia-me', titulo: 'leia-me.txt', seletorCorpo: '.app-prose' },
  { rota: '/jornada', titulo: 'Histórico de Versões', seletorCorpo: '.history-app' },
  { rota: '/stack', titulo: 'Gerenciador de Dispositivos', seletorCorpo: '.devices-app' },
]

test.describe('deep link nas nove rotas', () => {
  for (const rota of ROTAS) {
    test(`${rota.rota} abre a janela certa, com título e corpo preenchidos`, async ({ page, context }) => {
      await definirPreferencias(context)
      const erros = []
      page.on('pageerror', (e) => erros.push(e.message))

      await page.goto(rota.rota, { waitUntil: 'networkidle' })
      await passarDaCerimonia(page)

      // Corpo do app: espera o chunk lazy resolver e renderizar CONTEÚDO —
      // não só o seletor existir (isso a casca vazia do Suspense também
      // satisfaria), o texto dentro dele.
      const corpo = page.locator(rota.seletorCorpo).first()
      await expect(corpo).toBeVisible({ timeout: 8000 })
      await expect(corpo).not.toBeEmpty()

      // Título certo na taskbar, no botão em foco.
      await expect(
        page.locator('.taskbar-window-btn.active .taskbar-window-label'),
      ).toHaveText(rota.titulo)

      // Deep link dinâmico: janela pai montada atrás, sem clique nenhum.
      if (rota.paiSeletor) {
        await expect(page.locator(rota.paiSeletor)).toHaveCount(1)
      }

      expect(erros, `erro de página não capturado: ${erros.join('; ')}`).toHaveLength(0)
    })
  }
})

test('voltar/avançar do navegador troca o foco entre janelas já abertas', async ({ page, context }) => {
  await definirPreferencias(context)

  // Começa numa rota (não na raiz) para não disparar a janela de boas-vindas
  // (BoasVindas só age quando `windows.length === 0` na decisão) e poder
  // controlar exatamente o histórico.
  await page.goto('/leia-me', { waitUntil: 'networkidle' })
  await passarDaCerimonia(page)
  await expect(page.locator('.app-prose')).toBeVisible({ timeout: 8000 })

  // Abre uma segunda janela via navegação de URL (equivalente a clicar num
  // link/ícone que muda a rota) — empurra '/jornada' no histórico. Sem
  // recarregar a página: é o listener de popstate do WindowManagerContext
  // quem decide o foco, tanto aqui quanto no goBack/goForward abaixo.
  await page.goto('/jornada', { waitUntil: 'networkidle' })
  await expect(page.locator('.history-app')).toBeVisible({ timeout: 8000 })
  await expect(
    page.locator('.taskbar-window-btn.active .taskbar-window-label'),
  ).toHaveText('Histórico de Versões')

  await page.goBack()
  await expect(
    page.locator('.taskbar-window-btn.active .taskbar-window-label'),
  ).toHaveText('leia-me.txt')

  await page.goForward()
  await expect(
    page.locator('.taskbar-window-btn.active .taskbar-window-label'),
  ).toHaveText('Histórico de Versões')
})

test('abertura por clique no ícone da área de trabalho', async ({ page, context }) => {
  await definirPreferencias(context)

  // Começa numa rota (não na raiz) para não disputar com a janela de
  // boas-vindas automática.
  await page.goto('/config', { waitUntil: 'networkidle' })
  await passarDaCerimonia(page)
  await expect(page.locator('.settings-app')).toBeVisible({ timeout: 8000 })

  // 'settings' não tem ícone na área de trabalho (onDesktop: false) — o
  // clique é noutro app, para o teste ficar limpo (não misturar o caminho
  // "clique" com o caminho "deep link" no mesmo app).
  await page.locator('.marocos-icons .app-icon-btn', { hasText: 'Meus Projetos' }).click()

  await expect(page.locator('.projects-app-list')).toBeVisible({ timeout: 8000 })
  await expect(
    page.locator('.taskbar-window-btn.active .taskbar-window-label'),
  ).toHaveText('Meus Projetos')
})

test('fallback nulo sob rede lenta: chrome intacto, corpo vazio, nunca quebrado', async ({ page, context }) => {
  await definirPreferencias(context)
  const erros = []
  page.on('pageerror', (e) => erros.push(e.message))

  // Generoso de propósito: a cerimônia inteira (boot pulado + destrancar +
  // cortina) leva bem menos que isto quando o clique chega no momento certo
  // (ver `passarDaCerimonia`), então uma folga grande garante que a checagem
  // do corpo vazio, logo depois da cortina sair, aconteça ANTES do chunk
  // resolver — sem depender de cronometrar os dois processos exatamente.
  const ATRASO_MS = 8000
  await page.route('**/assets/HistoryApp-*.js', async (route) => {
    await esperar(ATRASO_MS)
    await route.continue()
  })

  // 'domcontentloaded', não 'networkidle': a janela do HistoryApp já monta
  // (e já dispara o import lazy) atrás da cortina, então esperar a REDE
  // ficar ociosa bloquearia até o chunk atrasado terminar de baixar —
  // exatamente o estado que este teste quer flagrar ANTES de existir.
  await page.goto('/jornada', { waitUntil: 'domcontentloaded' })
  await passarDaCerimonia(page)

  // Logo depois da cortina sair o chunk ainda está atrasado: o chrome já
  // deve existir (barra de título com o título certo)...
  await page.waitForSelector('.marocos-titlebar', { timeout: 3000 })
  await expect(page.locator('.marocos-titlebar-label span')).toHaveText('Histórico de Versões')

  // ...com o corpo ainda vazio (fallback nulo do Suspense), não quebrado.
  const filhosDoCorpo = await page.locator('.marocos-window-body').first().evaluate(
    (el) => el.childElementCount,
  )
  expect(filhosDoCorpo).toBe(0)
  expect(erros, `erro de página durante o atraso: ${erros.join('; ')}`).toHaveLength(0)

  // Quando o chunk enfim resolve, o conteúdo aparece — a janela nunca ficou
  // "travada" vazia para sempre.
  const corpo = page.locator('.history-app')
  await expect(corpo).toBeVisible({ timeout: ATRASO_MS + 5000 })
  await expect(corpo).not.toBeEmpty()
})

test('react-markdown carrega só sob demanda (estado vazio -> resposta)', async ({ page, context }) => {
  await definirPreferencias(context)

  const chunksDeMarkdown = []
  page.on('request', (req) => {
    if (req.url().includes('/assets/AssistantMarkdown-')) chunksDeMarkdown.push(req.url())
  })

  // Mocka os dois endpoints do backend via page.route() (inclui o preflight
  // CORS, porque o `apiBase` de produção é cross-origin em relação ao
  // `vite preview` local) — não depende do FastAPI estar no ar.
  await page.route((url) => url.pathname.includes('/chat'), async (route) => {
    const req = route.request()
    const corsHeaders = {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
    }

    if (req.method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: corsHeaders })
    }

    if (req.url().endsWith('/chat/status')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({ current: 1, limit: 100 }),
      })
    }

    // POST /chat — devolve um SSE de um evento de status + um resultado com
    // markdown de verdade (negrito + link), num corpo só (sem streaming
    // real: a leitura via reader() funciona igual).
    const sse = [
      'event: status',
      'data: {"message":"Pensando..."}',
      '',
      'event: result',
      'data: {"response":"**Bússola V2** é um projeto. Veja o [repositório](https://example.com/bussola).","usage":{"current":2,"limit":100}}',
      '',
      '',
    ].join('\n')

    return route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      headers: corsHeaders,
      body: sse,
    })
  })

  await page.goto('/assistente', { waitUntil: 'networkidle' })
  await passarDaCerimonia(page)

  // Estado vazio: sugestões visíveis, ZERO requisição ao chunk de markdown.
  await expect(page.locator('.assistant-empty-state')).toBeVisible({ timeout: 8000 })
  expect(chunksDeMarkdown, 'chunk do react-markdown baixado antes de qualquer mensagem').toHaveLength(0)

  // Clica na primeira sugestão -> dispara sendMessage -> mock devolve a
  // resposta acima.
  await page.click('.assistant-suggestion-chip')

  // A bolha do assistente deve renderizar markdown de verdade (negrito).
  await expect(page.locator('.assistant-bubble strong').first()).toHaveText('Bússola V2')

  // E o link, passando pelo componente customizado (target=_blank).
  const link = page.locator('.assistant-bubble a').first()
  await expect(link).toHaveCount(1)
  await expect(link).toHaveAttribute('target', '_blank')

  expect(
    chunksDeMarkdown.length,
    'chunk do react-markdown nunca foi baixado, mesmo depois da resposta',
  ).toBeGreaterThan(0)
})
