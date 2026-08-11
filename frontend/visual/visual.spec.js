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
import { mockarChat } from './mocks.js'

/**
 * PISO DE RUÍDO, RE-MEDIDO SOB `threshold: 0`.
 *
 * A receita é sempre a mesma: rodar a captura duas vezes sobre o MESMO commit e
 * tomar o pior caso observado, com folga de 2x. Estes números foram REFEITOS
 * quando `playwright.config.js` passou a usar `threshold: 0` — sob o default
 * anterior (0.2, uma folga de COR por pixel) a maior parte da diferença de
 * rasterização nem chegava a ser contada, então a base mudou e os valores
 * velhos deixaram de significar o que diziam. Re-medir foi obrigatório; subir o
 * número até a suíte calar, não.
 *
 * O que as duas execuções mostraram (diferença entre capturas consecutivas da
 * MESMA página, em px):
 *
 *   sobre-escuro         9123 / 8042  ·  9022 / 9199
 *   sobre-claro          8918 / 8123  ·  8611 / 8247
 *   bloqueio            12809 / 13273 · 13334 / 14781
 *   bloqueio-claro      12292 / 13123 · 12017 / 15091   <- pior caso
 *   menu-iniciar         9125 / 8868  ·  9070 / 9018
 *   menu-iniciar-claro   8372 / 7979  ·  8972 / 9824
 *   TODAS as outras 15 cenas: exatamente 0 px, nas duas execuções
 *
 * Pior caso 15.091 px; 2x isso é 30.182, e 0,024 de uma tela de 1440x900 dá
 * 31.104 — a folga de 2x, arredondada para um número declarável.
 *
 * SÓ O CRISTAL 3D FAZ RUÍDO. É o que a coluna de zeros acima prova: cenas com o
 * wallpaper por shader visível (ogl) repetem pixel a pixel, e quem não repete
 * são as seis cenas que montam o cristal (three/R3F). Por isso a classificação
 * em `cenas.js` é `cristal3d` e não `webgl` — ver o cabeçalho de lá.
 *
 * TOLERÂNCIA É FRAÇÃO DE ÁREA, NÃO NÚMERO ABSOLUTO. O valor antigo era um 3000
 * fixo, justificado como "~0,23% de uma tela de 1440x900" mas aplicado igual às
 * cenas mobile de 390x844, onde os mesmos 3000 px valem 0,91% — quatro vezes
 * mais frouxo do que o texto declarava. Guardando a FRAÇÃO e multiplicando pela
 * área do viewport da cena, o número declarado e o aplicado voltam a ser o
 * mesmo em qualquer viewport, sem ninguém precisar lembrar de converter.
 */
const FRACAO_RUIDO_CRISTAL = 0.024

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
    const viewport = cena.mobile ? MOBILE : DESKTOP
    test.use({ viewport })

    test(cena.nome, async ({ page, context }) => {
      /**
       * Sem isto a cena `assistente` dependeria da REDE DE PRODUÇÃO: o
       * AssistantApp busca `/chat/status` na montagem e só desenha o rodapé de
       * cota se a API responder — com um número que é a cota diária global e
       * sobe a cada conversa de qualquer visitante. Uma cena de tolerância zero
       * não pode ter isso dentro do quadro.
       *
       * Aplicado a TODAS as cenas, e não só à do assistente, de propósito: é o
       * mesmo raciocínio do campo `cristal3d` viver dentro de `cenas.js` (ver o
       * cabeçalho de lá) — classificação que alguém precisa lembrar de marcar é
       * classificação que uma cena nova vai esquecer. O handler não casa com
       * nenhuma outra rota nem asset do build, então aplicar sempre é de graça.
       */
      await mockarChat(page)

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
      /**
       * `MEDIR_RUIDO=1` tira TODA tolerância e faz cada cena reprovar dizendo
       * quantos pixels variaram — é como os números acima foram obtidos, e é
       * como se refazem quando algo muda a base (outra GPU, outro Chromium,
       * outro `threshold`). Sem isso a medição não existe: quando uma cena
       * passa, o Playwright não conta o diff em lugar nenhum.
       */
      if (cena.cristal3d && !process.env.MEDIR_RUIDO) {
        opcoes.maxDiffPixels = Math.round(
          FRACAO_RUIDO_CRISTAL * viewport.width * viewport.height,
        )
      }

      await expect(page).toHaveScreenshot(`${cena.nome}.png`, opcoes)
    })
  })
}
