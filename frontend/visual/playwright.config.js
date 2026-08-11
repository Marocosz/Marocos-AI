/**
 * CONFIGURAÇÃO DO REGRESSOR VISUAL
 * ==================================================
 * Ver README.md para o que este harness cobre e, mais importante, o que ele
 * NÃO cobre — a suíte passar não autoriza concluir "nada mudou visualmente",
 * só "nada mudou no que foi fotografado".
 *
 * Pacote ISOLADO de `frontend/package.json` de propósito: o @playwright/test
 * baixa um navegador (~130 MB) no postinstall. Como o Vite também é
 * devDependency do frontend, o build de deploy não pode usar `--omit=dev` —
 * então pôr o Playwright ali faria todo build arrastar o navegador. Isolado
 * aqui, a árvore de dependências da aplicação fica intocada.
 */
import { defineConfig } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Raiz do frontend a servir. Configurável por env var para permitir capturar
 * a MESMA lista de cenas num worktree de outro commit — é assim que se gera a
 * referência de uma cena nova sem precisar mexer no checkout principal.
 * (Herdado do script solto que este pacote substitui.)
 */
const FRONTEND_RAIZ = process.env.FRONTEND_RAIZ || path.resolve(__dirname, '..')
const PORTA = 4183

export default defineConfig({
  testDir: __dirname,
  snapshotDir: path.join(__dirname, '__screenshots__'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,

  // Cada cena abre um contexto Chromium com WebGL (o wallpaper por shader, e
  // às vezes o cristal 3D). O paralelismo padrão (uma instância por núcleo de
  // CPU) chegou a derrubar o próprio Chromium em teste local — várias janelas
  // WebGL disputando GPU ao mesmo tempo. 4 workers roda tudo em pouco mais de
  // um minuto sem esse risco.
  workers: 4,
  reporter: [
    ['list'],
    // O relatório HTML embute os PNGs de esperado/obtido/diff lado a lado —
    // é o que substitui a pasta `_diff/` que o comparador antigo escrevia à
    // mão. `open: 'never'` porque isto roda sem supervisão a maior parte do
    // tempo; abra com `npx playwright show-report` quando quiser olhar.
    ['html', { open: 'never' }],
  ],

  // Achata o caminho da referência para `__screenshots__/<nome-da-cena>.png`,
  // sem sufixo de projeto ou plataforma — é o formato que o time já revisa
  // (era assim no script antigo) e o que faz `git diff --stat` de uma cena só
  // mostrar um arquivo.
  snapshotPathTemplate: '{snapshotDir}/{arg}{ext}',

  use: {
    baseURL: `http://localhost:${PORTA}`,

    // Congelamento comum a TODAS as cenas — o viewport (a única coisa que
    // varia por cena) é definido por cena em visual.spec.js via `test.use()`.
    deviceScaleFactor: 1,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    // O app respeita esta preferência: encurta a inicialização e tira o
    // deslocamento das entradas. Menos movimento, menos variação entre
    // execuções.
    reducedMotion: 'reduce',

    viewport: { width: 1440, height: 900 },
    trace: 'off',
    video: 'off',
    screenshot: 'off',
  },

  // Sobe `vite preview` e espera a porta responder — substitui o
  // `spawn` manual + polling do script antigo. `reuseExistingServer` deixa
  // reaproveitar um preview já no ar (útil em execuções repetidas locais,
  // como o teste de determinismo) e evita a dança de matar a porta no
  // Windows que o script antigo precisava fazer à mão.
  webServer: {
    command: `npx vite preview --port ${PORTA} --strictPort`,
    cwd: FRONTEND_RAIZ,
    port: PORTA,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
