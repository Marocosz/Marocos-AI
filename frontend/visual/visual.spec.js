/**
 * REGRESSOR VISUAL DO MAROCOS OS
 * ==================================================
 * Fotografa cada cena de `cenas.js` e compara com a referência versionada em
 * `__screenshots__/`. Ver README.md para o fluxo de atualização de
 * referência e — mais importante — para o que este harness NÃO cobre.
 *
 * O DIFÍCIL NÃO É FOTOGRAFAR, É CONGELAR. Três coisas neste projeto mudam
 * sozinhas e destruiriam qualquer comparação:
 *
 *   1. o wallpaper é um shader animado (Silk no escuro, Iridescence no claro)
 *   2. o cristal 3D gira e flutua
 *   3. os relógios da taskbar e da tela de bloqueio andam
 *
 * Os dois primeiros são resolvidos desligando a animação: o próprio sistema
 * tem esse controle, persistido em `isAnimationEnabled`. Com ele desligado o
 * Silk para de invalidar o canvas e o cristal cai em `frameloop="demand"` —
 * os dois desenham UM frame e dormem, o que é reprodutível.
 *
 * O terceiro é resolvido congelando o relógio do navegador com
 * `page.clock.setFixedTime()` ANTES de navegar (ver INSTANTE_FIXO em
 * cenas.js para o porquê de congelar em vez de mascarar).
 *
 * CONSEQUÊNCIA IMPORTANTE, e limite do método: como a animação é desligada
 * antes do primeiro render, o `uTime` dos shaders é sempre 0 em toda cena. A
 * captura compara geometria, cor e layout com precisão — e é ESTRUTURALMENTE
 * CEGA a qualquer coisa que dependa de tempo: duração de transição, velocidade
 * de animação, salto ao despausar. Isso não é escolha de limiar, é
 * construção. O que depende de tempo se verifica lendo o código, não olhando
 * este harness ficar verde.
 */
import { test, expect } from '@playwright/test'
import { CENAS, DESKTOP, MOBILE, INSTANTE_FIXO } from './cenas.js'

/**
 * Piso de ruído medido: rodando a captura duas vezes no MESMO commit, cenas
 * com superfície WebGL (wallpaper por shader, cristal 3D) variaram até
 * ~1500 px; cenas que são só DOM variaram exatamente 0 px. O rasterizador de
 * WebGL arredonda diferente entre contextos mesmo com a animação congelada;
 * o DOM pinta igual sempre.
 *
 * 3000 dá folga de 2x sobre o pior valor observado e ainda é 0,23% de uma
 * tela de 1440x900 — bem abaixo de qualquer mudança visual que importe. Nas
 * cenas sem WebGL, `maxDiffPixels` simplesmente não é passado: o
 * `toHaveScreenshot()` do Playwright já falha com qualquer diferença nesse
 * caso, então a tolerância zero sai de graça. Um limiar único e folgado
 * esconderia exatamente o tipo de regressão mais provável neste projeto —
 * um pixel diferente de especificidade de CSS numa cor herdada.
 */
const TOLERANCIA_WEBGL = 3000

for (const cena of CENAS) {
  test.describe(cena.nome, () => {
    // Viewport é a única coisa que varia por cena (mobile 390x844 vs desktop
    // 1440x900) — o resto do congelamento (locale, timezone, reducedMotion,
    // deviceScaleFactor) é comum a todas e vive em playwright.config.js.
    // `test.use()` dentro do describe aplica só às cenas deste bloco; optamos
    // por isto em vez de dois `projects` porque duplicar o project inteiro
    // para variar um único campo rodaria a suíte inteira duas vezes e
    // exigiria filtrar cena-por-project com testMatch/grep — mais um lugar
    // para uma cena nova ser esquecida (ver o comentário sobre o bug do
    // `Set` de classificação em cenas.js: a mesma classe de erro).
    test.use({ viewport: cena.mobile ? MOBILE : DESKTOP })

    test(cena.nome, async ({ page, context }) => {
      // Preferências ANTES do primeiro render: é o que desliga os shaders e o
      // cristal, e o que fixa tema e idioma sem depender de clicar em nada.
      await context.addInitScript(({ tema }) => {
        localStorage.setItem('isDarkMode', JSON.stringify(tema === 'dark'))
        localStorage.setItem('isAnimationEnabled', 'false')
        localStorage.setItem('language', 'pt')
      }, { tema: cena.tema })

      // Congela o relógio ANTES de navegar: os componentes leem `new Date()`
      // na montagem, então instalar depois pegaria o primeiro render com a
      // hora real.
      await page.clock.setFixedTime(INSTANTE_FIXO)
      await page.goto(cena.rota, { waitUntil: 'networkidle' })

      // Pula a inicialização: um clique em qualquer lugar encerra o boot.
      await page.mouse.click(10, 10)
      await page.waitForSelector('.porta:not([disabled])', { timeout: 15_000 })

      if (!cena.ficarNoBloqueio) {
        await page.click('.porta')
        // A cortina sobe e sai da árvore; esperar por isso é mais confiável
        // do que cronometrar a animação.
        await page.waitForSelector('.cerimonia', { state: 'detached', timeout: 15_000 })

        /**
         * CONTEÚDO REAL, NÃO SÓ A CASCA — a segunda fonte de instabilidade
         * que este harness precisou aprender a esperar (além do relógio).
         *
         * Toda janela de app (`Window.jsx` no desktop, `MobileApp.jsx` no
         * mobile) envolve o componente em `<Suspense fallback={null}>`: o
         * comentário no código-fonte é explícito — "com o prefetch em
         * ociosidade o chunk já chegou". Isso é verdade para um visitante de
         * carne e osso, que passa um tempo na tela de bloqueio antes de
         * clicar em algo; não é garantido para este harness, que anda pelo
         * fluxo o mais rápido possível. Fotografar cedo demais pega o
         * fallback nulo — nem casca de janela, nem ícones, nada — e o
         * resultado varia com quanto a CPU da máquina que roda o teste
         * estava ocupada naquele instante. Esperar pelo CONTEÚDO em vez de
         * cronometrar é o que torna isso determinístico.
         */
        if (cena.mobile) {
          if (cena.rota === '/') {
            // Home screen: grade de ícones síncrona, sem Suspense.
            await page.waitForSelector('.marocos-mobile-grid', { timeout: 10_000 })
          } else {
            await page.waitForSelector('.marocos-mobile-app-body *', { timeout: 10_000 })
          }
        } else {
          // Ícones do desktop são síncronos — sempre presentes.
          await page.waitForSelector('.marocos-icons', { timeout: 10_000 })

          /**
           * Toda cena de desktop chega aqui com ALGUMA janela aberta: a do
           * deep link (`rota !== '/'`), ou "Sobre este PC", que
           * `BoasVindas.jsx` abre sozinha quando a rota é `/` e ainda não há
           * nenhuma janela — é o mesmo mecanismo, então a mesma espera serve
           * para os dois casos.
           */
          await page.waitForSelector('.marocos-window-body *', { timeout: 10_000 })

          if (cena.fecharJanelaAutomatica) {
            await page.click('.marocos-titlebar-controls button.close')
            await page.waitForSelector('.marocos-window-body', { state: 'detached', timeout: 10_000 })
          }
        }
      }

      // Abre o menu Iniciar quando a cena pede. É a superfície que usa a
      // variante "plana" do botão de app no desktop, e só aparece sob clique.
      if (cena.abrirMenuIniciar) {
        await page.click('.taskbar-btn[aria-expanded]')
        await page.waitForSelector('.start-menu', { timeout: 5_000 })
      }

      /**
       * Folga final, pequena: o conteúdo real já foi confirmado acima, então
       * isto não está mais fazendo o trabalho de sincronização — só dá ao
       * shader/cristal um instante de sobra para compor o frame depois do
       * último clique. Não há um evento de "canvas pintou" para esperar.
       */
      await page.waitForTimeout(500)

      const opcoes = { animations: 'disabled' }
      if (cena.webgl) opcoes.maxDiffPixels = TOLERANCIA_WEBGL

      await expect(page).toHaveScreenshot(`${cena.nome}.png`, opcoes)
    })
  })
}
