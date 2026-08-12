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
 *   1. Deep link dinâmico (`/projetos/:slug`): abre UMA janela, com o caminho
 *      de volta no breadcrumb. (Era a janela PAI montada atrás, via o campo
 *      `parent` do registry; com navegação interna o detalhe é a própria janela
 *      da pasta em outra localização, e `parent` deixou de existir.)
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
import { mockarChat } from './mocks.js'

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
    // UMA janela, com o caminho de volta no breadcrumb. Antes este caso pedia
    // `paiSeletor: '.projects-app-list'` — a pasta montada ATRÁS do detalhe,
    // via o campo `parent` do registry. Com navegação interna o detalhe é a
    // própria janela da pasta em outra localização, então não há pai: o que
    // leva de volta é o degrau clicável do breadcrumb.
    migalhaDeVolta: 'projetos',
  },
  { rota: '/contato', titulo: 'Terminal', seletorCorpo: '.terminal-app' },
  { rota: '/assistente', titulo: 'Marcos Virtual', seletorCorpo: '.assistant-app' },
  { rota: '/config', titulo: 'Configurações', seletorCorpo: '.settings-app' },
  { rota: '/leia-me', titulo: 'leia-me.txt', seletorCorpo: '.readme-app' },
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

      // Deep link dinâmico: UMA janela só, e o breadcrumb oferecendo a volta.
      if (rota.migalhaDeVolta) {
        await expect(page.locator('.marocos-window')).toHaveCount(1)
        await expect(
          page.locator('.explorer-crumb--link', { hasText: rota.migalhaDeVolta }),
        ).toHaveCount(1)
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
  await expect(page.locator('.readme-app')).toBeVisible({ timeout: 8000 })

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

/**
 * OS ESTADOS DO CHROME DE EXPLORADOR QUE NENHUMA FOTO ALCANÇA.
 *
 * Este teste existe por causa de um bug real: `getContactData()` devolve a
 * página de contato inteira e a lista de canais é a chave `.items` dentro dela.
 * O chrome fazia `contatos.map(...)` no retorno cru — TypeError, subárvore
 * derrubada, janela preta. E ninguém viu, porque o grupo "Rede" nasce FECHADO:
 * o regressor visual fotografa o estado de repouso, e no repouso aquele `.map`
 * nunca roda.
 *
 * A lição não é sobre contato: é que grupo colapsado, painel fechado e campo de
 * busca vazio são código que só existe depois de um clique, e o harness de fotos
 * é estruturalmente cego a todos eles. Quem cobre é aqui.
 */
test('estados interativos do chrome de explorador não quebram a janela', async ({ page, context }) => {
  await definirPreferencias(context)
  const erros = []
  page.on('pageerror', (e) => erros.push(e.message))

  await page.goto('/projetos', { waitUntil: 'networkidle' })
  await passarDaCerimonia(page)
  await expect(page.locator('.projects-app-list')).toBeVisible({ timeout: 8000 })

  // "Rede": expande e tem de render os canais como links externos de verdade.
  await page.locator('.explorer-grupo-cab', { hasText: 'Rede' }).click()
  const canais = page.locator('.explorer-grupo a.explorer-lugar')
  await expect(canais).toHaveCount(4)
  await expect(canais.first()).toHaveAttribute('href', /^mailto:|^https?:/)

  // "Este Computador" já nasce aberto: os programas sem chrome abrem JANELA
  // NOVA, e não navegam a atual — é a distinção das três portas do reducer.
  await page.locator('.explorer-lugar', { hasText: 'Terminal' }).first().click()
  await expect(page.locator('.terminal-app')).toBeVisible({ timeout: 8000 })
  await expect(page.locator('.marocos-window')).toHaveCount(2)

  /**
   * DOIS CLIQUES, E É DE PROPÓSITO. A janela de Projetos perdeu o foco para o
   * Terminal que acabou de abrir, e o primeiro clique numa janela desfocada só
   * a traz para a frente — nenhum controle dentro dela dispara. Ver o bloco
   * sobre `aoApontar`/`aoClicar` em `os/desktop/Window.jsx`.
   *
   * Este teste já existia e passava com um clique só; foi ele que flagrou a
   * mudança de comportamento, que é exatamente o serviço que se espera dele.
   */
  const detalhes = page.locator('.explorer-cmd', { hasText: 'Detalhes' }).first()
  await detalhes.click()
  await expect(page.locator('.explorer-detalhes').first()).toBeHidden()

  // Painel de detalhes: fechado por padrão, então nunca é fotografado.
  await detalhes.click()
  await expect(page.locator('.explorer-detalhes').first()).toBeVisible()

  expect(erros, `erro de página não capturado: ${erros.join('; ')}`).toHaveLength(0)
})

/*
 * O contrato do "primeiro clique só foca" é verificado no teste de estados
 * interativos, logo acima — lá a janela de Projetos perde o foco para o Terminal
 * e o painel de Detalhes só abre no segundo clique.
 *
 * Uma versão dedicada deste teste foi escrita e removida: ela abria duas janelas
 * do guia e tentava clicar na de baixo, mas a cascata sobrepõe as janelas, e a
 * verificação de acionabilidade do Playwright espera até o tempo estourar quando
 * o alvo está coberto por outro elemento. O teste falhava por geometria, não por
 * comportamento — e teste que falha pelo motivo errado é pior que teste nenhum.
 */

/**
 * O GUIA DO "SOBRE ESTE PC" LEVA MESMO AONDE PROMETE.
 *
 * A foto prova que as quatro portas existem e estão bonitas. Ela não prova que
 * clicar numa delas chega em algum lugar — e este app é a porta de entrada do
 * site (`BoasVindas.jsx` o abre sozinho para quem chega sem deep link), então
 * uma porta quebrada aqui é o visitante batendo na parede logo na chegada.
 *
 * AS PORTAS ABREM JANELA NOVA, e não trocam o conteúdo desta — decisão do dono
 * do projeto. A razão é boa: o guia é uma lista de perguntas, e quem foi ver os
 * projetos ainda pode querer as outras três. Trocar o conteúdo apagaria o mapa
 * assim que ele fosse usado pela primeira vez.
 *
 * É o oposto da lateral do explorador, que continua navegando dentro da janela
 * — as duas intenções vivem em `os/NavegacaoContext.jsx` e quem escolhe entre
 * elas é o app, não o container.
 */
test('as portas do guia abrem os apps que prometem, em janela nova', async ({ page, context }) => {
  await definirPreferencias(context)
  const erros = []
  page.on('pageerror', (e) => erros.push(e.message))

  await page.goto('/sobre', { waitUntil: 'networkidle' })
  await passarDaCerimonia(page)
  await expect(page.locator('.about-app')).toBeVisible({ timeout: 8000 })
  // Quatro, e QUAIS quatro importa: projetos, jornada, leia-me e o Marcos
  // Virtual. O terminal saiu do guia e virou o botão de ação do topo (ver o teste
  // logo abaixo), então o número continuar 4 é coincidência — ele não prova que o
  // conjunto está certo, e é a asserção seguinte que cobre o assistente.
  await expect(page.locator('.about-door')).toHaveCount(4)
  await expect(
    page.locator('.about-door', { hasText: 'Consigo perguntar direto a ele?' }),
  ).toHaveCount(1)

  await page.locator('.about-door', { hasText: 'Ele sabe construir?' }).click()
  await expect(page.locator('.projects-app-list')).toBeVisible({ timeout: 8000 })

  // Duas janelas: o guia continua aberto atrás. É o ponto da decisão.
  await expect(page.locator('.marocos-window')).toHaveCount(2)
  await expect(page.locator('.about-app')).toHaveCount(1)

  expect(erros, `erro de página não capturado: ${erros.join('; ')}`).toHaveLength(0)
})

/**
 * O "SOBRE" MAXIMIZADO NUMA TELA GRANDE NÃO ESTICA O TEXTO.
 *
 * Nenhuma cena do regressor maximiza janela, então a foto não cobre este caso — e
 * ele foi apontado pelo dono do projeto: "em tela cheia, se for uma tela grande,
 * os textos ficam muito horizontais, o que é ruim de ler".
 *
 * Sem teto de medida, uma janela maximizada em 1920 dá ~1700px de conteúdo, e a
 * 0,86rem isso passa de 160 caracteres por linha — maximizar PIORARIA a leitura,
 * que é o oposto do que maximizar deveria fazer. As duas promessas que este teste
 * fixa: a prosa fica em medida de leitura, e o corpo vira DUAS colunas em vez de
 * uma linha longa.
 *
 * Asserção numérica e não captura: o que importa aqui é a geometria, e um
 * screenshot a mais só acrescentaria uma referência para rebaselinar.
 */
test.describe('em tela grande', () => {
  test.use({ viewport: { width: 1920, height: 1080 } })

  test('o Sobre maximizado limita a medida e vira duas colunas', async ({ page, context }) => {
    await definirPreferencias(context)
    await page.goto('/sobre', { waitUntil: 'networkidle' })
    await passarDaCerimonia(page)
    await expect(page.locator('.about-app')).toBeVisible({ timeout: 8000 })

    // O segundo botão da barra de título é o de maximizar (minimizar, maximizar,
    // fechar).
    await page.locator('.marocos-titlebar button').nth(1).click()
    await expect(page.locator('.marocos-window.maximized')).toBeVisible({ timeout: 8000 })

    const app = await page.locator('.about-app').boundingBox()
    const bio = await page.locator('.about-bio').boundingBox()

    // O teto de `max-width` do `.about-app`, e ele centralizado no vão que sobra.
    expect(app.width).toBeLessThanOrEqual(1040)
    expect(app.x).toBeGreaterThan(300)

    // ~64ch de medida. O limite generoso (700) é para o teste falhar quando a
    // medida DESAPARECER, não a cada ajuste de escala tipográfica.
    expect(bio.width).toBeLessThanOrEqual(700)

    // Duas colunas: a larga da voz humana e o trilho da voz da máquina.
    const colunas = await page
      .locator('.about-corpo')
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length)
    expect(colunas).toBe(2)
  })
})

/**
 * ABRIR UMA PASTA DA STACK LISTA AS TECNOLOGIAS.
 *
 * As quatro pastas nascem FECHADAS, então a grade de itens é código que só existe depois
 * de um clique — e o regressor visual fotografa o estado de repouso. É exatamente a
 * classe de defeito que este arquivo já documenta no chrome de explorador: subárvore que
 * só monta sob interação não tem quem a cubra além daqui. Lá foi uma janela preta que
 * ninguém viu porque o grupo "Rede" nasce fechado.
 *
 * Também fixa a promessa da ESTEIRA: a pasta aberta ocupa a linha inteira da grade, e é
 * isso que empurra as outras para baixo.
 */
test('abrir uma pasta da stack lista as tecnologias', async ({ page, context }) => {
  await definirPreferencias(context)
  const erros = []
  page.on('pageerror', (e) => erros.push(e.message))

  await page.goto('/stack', { waitUntil: 'networkidle' })
  await passarDaCerimonia(page)
  await expect(page.locator('.devices-app')).toBeVisible({ timeout: 8000 })

  // Em repouso: quatro pastas, nenhum item renderizado.
  await expect(page.locator('.devices-pasta')).toHaveCount(4)
  await expect(page.locator('.devices-item')).toHaveCount(0)

  const primeira = page.locator('.devices-pasta').first()
  const fechada = (await primeira.boundingBox()).width

  await primeira.locator('.devices-cabeca').click()

  // A categoria de IA tem seis tecnologias.
  await expect(primeira.locator('.devices-item')).toHaveCount(6)
  await expect(primeira).toHaveClass(/devices-pasta--aberta/)

  /**
   * A ESTEIRA: aberta, a pasta ocupa a linha inteira — bem mais que a largura de antes.
   *
   * `expect.poll` e não uma medição direta: as pastas VIAJAM até o lugar novo (o
   * `layout` do motion anima a diferença ao longo de `MOVIMENTO.esteiraStack`), então
   * medir logo depois do clique pega a largura no meio do caminho — a primeira versão
   * deste teste leu 315px de uma viagem de 281 para 574 e reprovou por isso.
   *
   * Poll em vez de `waitForTimeout` porque a promessa que importa é "termina em largura
   * cheia", e não "chega lá em N ms": afirmar o estado final sobrevive a qualquer ajuste
   * de duração no config.
   */
  await expect
    .poll(async () => (await primeira.boundingBox()).width, { timeout: 4000 })
    .toBeGreaterThan(fechada * 1.5)

  // E fechar devolve a grade ao repouso.
  await primeira.locator('.devices-cabeca').click()
  await expect(primeira.locator('.devices-item')).toHaveCount(0)

  expect(erros, `erro de página não capturado: ${erros.join('; ')}`).toHaveLength(0)
})

/**
 * O BOTÃO DE CONTATO DO "SOBRE" LEVA AO TERMINAL.
 *
 * Ele existe porque a janela do "Sobre" deliberadamente NÃO repete os canais: os
 * quatro ícones dizem quais existem, e o endereço continua morando no terminal —
 * decisão do dono do projeto ("não quero repetir informação, quero que ele use
 * elas mandando a pessoa ir até a determinada janela com elas").
 *
 * O preço dessa decisão é que o contato do site inteiro passa a depender de um
 * clique só, num app que abre sozinho na chegada. Se este botão quebrar, o
 * visitante perde o caminho de contato acima da dobra e NADA MAIS RECLAMA: a foto
 * mostraria o botão bonito no lugar, e nenhuma outra asserção passa por ele.
 */
test('o botão de contato do Sobre abre o terminal', async ({ page, context }) => {
  await definirPreferencias(context)
  const erros = []
  page.on('pageerror', (e) => erros.push(e.message))

  await page.goto('/sobre', { waitUntil: 'networkidle' })
  await passarDaCerimonia(page)
  await expect(page.locator('.about-app')).toBeVisible({ timeout: 8000 })

  await page.locator('.about-acao').click()
  await expect(page.locator('.terminal-app')).toBeVisible({ timeout: 8000 })

  // Abre AO LADO, não troca o conteúdo — mesma regra das portas do guia.
  await expect(page.locator('.about-app')).toHaveCount(1)

  expect(erros, `erro de página não capturado: ${erros.join('; ')}`).toHaveLength(0)
})

/**
 * O TERMINAL ENTREGA OS CANAIS SEM NINGUÉM DIGITAR.
 *
 * É o app de CONTATO do portfólio, e durante muito tempo ele exigiu adivinhar a
 * palavra `contato` — nada na tela mencionava `help` e o input nem nascia
 * focado. Agora o boot termina executando o comando, como um `.bashrc`.
 *
 * A foto de `contato.png` mostraria a tabela na tela, mas não distingue "o boot
 * rodou o comando" de "alguém deixou a tabela chumbada no HTML". O que importa
 * é o e-mail estar alcançável em zero teclas.
 */
test('o terminal já abre com os canais de contato na tela', async ({ page, context }) => {
  await definirPreferencias(context)

  await page.goto('/contato', { waitUntil: 'networkidle' })
  await passarDaCerimonia(page)
  await expect(page.locator('.terminal-app')).toBeVisible({ timeout: 8000 })

  // Sem nenhuma digitação: os quatro canais, como links de verdade.
  const canais = page.locator('.terminal-table .terminal-link')
  await expect(canais).toHaveCount(4)
  await expect(canais.first()).toHaveAttribute('href', /^mailto:/)

  // E os comandos são descobríveis com o mouse, não só por adivinhação.
  const atalhos = page.locator('.terminal-cmd-chip')
  await expect(atalhos.first()).toBeVisible()
  await atalhos.filter({ hasText: 'whoami' }).click()
  await expect(page.locator('.terminal-output')).toContainText('marcos')
})

/**
 * A tela de desligado também não tem cena no regressor — e o markup dela viveu
 * um bom tempo com classes que não tinham CSS em lugar nenhum do projeto,
 * exatamente porque nada a olhava.
 */
test('desligar mostra o POST de BIOS, e ligar devolve o sistema', async ({ page, context }) => {
  await definirPreferencias(context)
  const erros = []
  page.on('pageerror', (e) => erros.push(e.message))

  await page.goto('/leia-me', { waitUntil: 'networkidle' })
  await passarDaCerimonia(page)

  await page.click('.taskbar-btn[aria-expanded]')
  await page.waitForSelector('.start-menu', { timeout: 5000 })
  // O botão de desligar é só o ícone de power com aria-label — não tem texto,
  // então `hasText` não o alcança.
  await page.locator('.start-menu-power-btn').click()

  const tela = page.locator('.shutdown-screen')
  await expect(tela).toBeVisible({ timeout: 8000 })
  // O inventário é conteúdo, não enfeite: se ele sumir, a tela virou casca.
  await expect(page.locator('.shutdown-linha')).toHaveCount(6)
  await expect(page.locator('.shutdown-halted')).not.toBeEmpty()

  await page.locator('.shutdown-power-btn').click()
  await expect(tela).toBeHidden({ timeout: 8000 })

  expect(erros, `erro de página não capturado: ${erros.join('; ')}`).toHaveLength(0)
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

  // Mocka os dois endpoints do backend — não depende do FastAPI estar no ar.
  // O handler mora em mocks.js porque `visual.spec.js` usa o MESMO: a cena
  // `assistente` fotografa o rodapé de cota, que só existe se `/chat/status`
  // responder. Ver o cabeçalho de mocks.js.
  await mockarChat(page)

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
