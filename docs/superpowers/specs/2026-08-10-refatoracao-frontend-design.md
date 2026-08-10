# Refatoração estrutural, performance e configuração central do frontend

**Data:** 2026-08-10
**Branch:** `feat/windowsmorphism`
**Escopo:** `frontend/` inteiro (68 arquivos, ~11.000 linhas)

---

## 0. Restrição inegociável

**Design e arte não mudam.** Nenhum item deste documento pode alterar o que o
visitante vê: nem cor, nem espaçamento, nem tempo de animação, nem posição de
elemento. Toda mudança aqui é de *onde o código mora* e de *quantos bytes ele
custa*, nunca de resultado visual.

Existe **um único ponto** onde essa regra encosta em algo real — a colisão de
`.about-section` (seção 4.3) — e a decisão tomada foi preservar pixel a pixel.

Critério de aceite transversal: para cada etapa, comparar a tela antes e depois.
Se houver diferença visível, a etapa está errada, mesmo que o código esteja
"melhor".

---

## 1. Diagnóstico (medido, não estimado)

### 1.1 O bundle

Build real de `main` desta branch (`npm run build`):

| chunk | raw | gzip |
|---|---|---|
| `index.js` | 1.497.981 B (1,50 MB) | **432.103 B (432 KB)** |
| `Crystal.js` (lazy) | 59.581 B | 21.135 B |
| `index.css` | 71.817 B | 13.416 B |

O `React.lazy(() => import('../../components/Crystal'))` **não está separando a
parte pesada**. Verificado por grep no bundle emitido:

| símbolo | ocorrências em `index.js` | em `Crystal.js` |
|---|---|---|
| `THREE.WebGLRenderer` | 1 | 0 |
| `WebGLRenderer` | 5 | 0 |
| `IcosahedronGeometry` | 2 | 0 |
| `MeshPhysicalMaterial` | 3 | 0 |
| `react-markdown` | 1 | 0 |
| `micromark` | 2 | 0 |

**Causa:** `Silk.jsx` importa `@react-three/fiber` e `three` estaticamente.
A cadeia `App → Desktop → Hills → Silk` é toda estática, então o `three` inteiro
entra no caminho crítico. O chunk lazy de 21 KB carrega apenas a cola do `drei`
(`Environment`, `Lightformer`, `Sparkles`, `Float`) — a geometria e o material do
próprio cristal já estão no bundle principal.

Somam-se a isso:

- `react-markdown` + `remark-gfm` + `micromark`, usados **só** pelo `AssistantApp`
  (1 de 9 apps), no bundle inicial;
- `registry.js` importa os **9 apps estaticamente** — todo componente de app e
  todo `App.css` estão no bundle inicial, mesmo que o visitante abra um só.

### 1.2 Código morto

- `src/App.css` — boilerplate do Vite (`.logo`, `logo-spin`, `.read-the-docs`).
  **Não é importado por nenhum arquivo.** `App.jsx` importa apenas `os/tokens.css`.
- `src/components/ui/StartMenu_ignore_this.txt` — sobra de migração.
- `src/index.css` — 540 linhas, das quais ~400 pertencem à landing page que não
  existe mais: `.hero-section`, `.hero-content`, `.hero-f11-hint`,
  `.journey-section`, `.journey-title`, `.journey-container`, `.spline-canvas`,
  `.spline-loading`, `.about-main`, `.about-image`, `.about-text`,
  `.main-content`, e os blocos `@media` que atendem só essas classes.
- Exports de compatibilidade nunca consumidos em `data/`: `contactData`,
  `profileData`, `journeyData`, `projectsData`, `techData`.

### 1.3 Duplicação estrutural

| padrão | onde está duplicado |
|---|---|
| "ícone + label vindo do registry" | `Desktop.jsx`, `HomeScreen.jsx`, `Dock.jsx`, `StartMenu.jsx` — 4 markups diferentes para a mesma coisa |
| os 3 toggles (tema / idioma / movimento) | `SettingsApp.jsx`, `QuickSettings.jsx`, popup de tray da `Taskbar.jsx` — 3 cópias da mesma lista |
| relógio | `Taskbar.jsx` (tique de 1s), `HomeScreen.jsx` (30s), `Ceremony.jsx` (minuto alinhado à virada) |
| cabeçalho eyebrow/título/subtítulo | `DevicesApp.jsx` e `HistoryApp.jsx` — markup idêntico, CSS quase idêntico |
| pílula / chip | `.about-feature-chip`, `.project-detail-tech-item`, `.history-tag`, `.terminal-tag`, chips de `DevicesApp.css` — 5 CSS para a mesma forma |
| `requestIdleCallback` com fallback `setTimeout` | `App.jsx` (2x), `Desktop.jsx` (1x) |
| leitura de `prefers-reduced-motion` | `ThemeContext.jsx` (`useEffect` + `matchMedia`), `Ceremony.jsx` (`useState` + `matchMedia`), `MobileApp.jsx`/`QuickSettings.jsx` (`useReducedMotion` do motion) — 3 mecanismos |
| gradiente `--sky-*` | declarado em `tokens.css` como tokens **e** re-escrito literalmente em `.marocos-sky-fallback.tema-dark` / `.tema-light` (linhas 306–312) |

### 1.4 Custo de render

`WindowManagerContext.jsx` monta o objeto `value` inline, sem `useMemo`:

```jsx
const value = { windows, focusedKey, open, close, focus, ... }
```

Toda mudança de estado — focar, arrastar (no `onDragEnd`), minimizar, abrir —
gera um `value` novo e re-renderiza **todos os consumidores**, o que inclui
`Desktop`, `Taskbar`, cada `Window` e, por dentro delas, **cada app montado**.
Abrir uma janela re-renderiza todos os apps já abertos.

Outros pontos:

- `Window.jsx` calcula `dragConstraints` lendo `window.innerWidth` durante o
  render, sem reatividade a resize.
- `AssistantApp.jsx` chama `scrollIntoView({ behavior: 'smooth' })` num efeito com
  `[messages, isLoading, loadingStatus]` — cada evento SSE de status reinicia um
  scroll animado.

### 1.5 Achados soltos

- `.about-spec-number` usa `font-weight: 800`. O `index.html` importa Poppins em
  `wght@400;700;900` e o `index.css` declara `font-synthesis: none`. O peso 800
  não existe e não pode ser sintetizado — cai silenciosamente em outro peso.
- Itens do popup de tray (`Taskbar.jsx`, linhas ~74–88) são `<div onClick>` sem
  `role`, `tabIndex` nem handler de teclado. Mesma coisa em `.show-desktop-line`.
- `index.css` tem `.theme-light h1, h2, h3, h4, p, span, li, div { color: ... }` —
  um seletor que casa com praticamente todo elemento da árvore.

---

## 2. `src/config/system.js` — o arquivo central

### 2.1 O que ele controla

Seis blocos. Cada valor entra com o comentário do lugar de onde veio, dizendo o
que a mudança causa e qual é a faixa segura.

**`WALLPAPER`** — hoje espalhado por `Hills.jsx`, `Silk.jsx`, `Iridescence.jsx` e
`tokens.css`:

- Silk: `color` (`#4c1d95`), `speed` (12), `scale` (1.4), **`rotation` (2.6 rad)**,
  `noiseIntensity` (1.2), `dpr` (0.6), teto de fps (20)
- Iridescence: `color` (`[0.9, 0.9, 0.95]`), `amplitude` (0.1), `speed` (1),
  `mouseReact` (false), escala de resolução (0.6), teto de fps (20)
- Crossfade de tema: duração da animação (700 ms, hoje em `tokens.css`) e a rede
  de segurança em JS (`CROSSFADE_LIMITE_MS` = 4000, hoje em `Hills.jsx`) —
  **os dois no mesmo lugar**, porque são acoplados e hoje vivem em arquivos
  diferentes com um comentário pedindo que batam
- Gradiente base por tema (`--sky-top` / `--sky-mid` / `--sky-low`), que passa a
  alimentar também o fallback mobile, matando a duplicação literal dos hexes

**`JANELAS`** — hoje em `windowManager.js` e `Window.jsx`:

- `BASE_X` (96), `BASE_Y` (64)
- `CASCADE_STEP` (24), `CASCADE_WRAP` (240)
- `VIES_HORIZONTAL` (0.5 — 0 nasce encostada à esquerda, 1 nasce centrada)
- `VIES_VERTICAL` (0.42 — fração da altura livre; 0.5 é centro geométrico, e o
  valor menor compensa o peso da barra de tarefas)
- `MARGEM` (16), altura reservada da taskbar (52)
- folga do arrasto (160 / 120)
- duração e curva do fade de abertura (0.12 s linear)
- `zTop` inicial (100)

Os `defaultSize` continuam no `registry.js`: tamanho é identidade do app, não
ajuste global. O `system.js` aponta para lá.

**`CERIMONIA`** — hoje em `Ceremony.jsx`, `App.jsx`, `Desktop.jsx`, `AboutApp.jsx`,
`Crystal.jsx`:

- `BOOT_DURATION_MS` (4800) e `BOOT_DURATION_REDUZIDA_MS` (2600)
- `SPIN_BOOT` (3.2), `SPIN_BLOQUEIO` (1.6)
- tamanho do cristal (300 px, 200 px abaixo de 620 px de largura)
- rede de segurança da saída (1200 ms)
- todos os timeouts de `requestIdleCallback` e seus fallbacks: desmonte do
  bloqueio (2500 / 800), boas-vindas (1500 / 400), prefetch do Crystal
  (4000 / 2500), montagem do cristal no About (450)
- parâmetros do Crystal: distância de câmera (5.6), pose parada, `dpr`,
  contagem e velocidade dos sparkles

**`MOVIMENTO`** — durações e curvas nomeadas, hoje literais em 8 componentes:

| nome | valor atual | arquivo |
|---|---|---|
| `taskbarEntrada` | delay 0.4, duration 0.5 | `Taskbar.jsx` |
| `iconesDesktop` | delay 0.05 × i, duration 0.3 | `Desktop.jsx` |
| `iconesMobile` | delay 0.03 × i, duration 0.25 | `HomeScreen.jsx` |
| `menuIniciar` | 0.16 easeOut | `StartMenu.jsx` |
| `popupTray` | 0.2 | `Taskbar.jsx` |
| `quickSettings` | 0.24 easeOut (0.15 reduzido) | `QuickSettings.jsx` |
| `pushMobile` | 0.28 easeOut | `MobileApp.jsx` |
| `acordeao` | 0.2 easeInOut | `DevicesApp.jsx` |
| `indicadorTaskbar` | spring 300 / 30 | `Taskbar.jsx` |
| `marqueeSkills` | 18 s linear | `AboutApp.css` |

**`VIDRO`** — hoje em `tokens.css` + 3 CSS de componente:

- `--win-glass-blur` (`blur(6px) saturate(125%)`)
- blur do menu iniciar (20px / 150%), do menu de contexto (16px / 150%), da
  taskbar (12px)
- `--win-radius` (10), `--win-control-radius` (8), `--win-titlebar-h` (40),
  `--taskbar-h` (52)

**`LAYOUT`**:

- `DESKTOP_BREAKPOINT` (1024)
- grade de ícones: origem (20, 20), largura do botão (88), tile (56), gap (4)
- assinatura: origem (40, 40), largura máxima (460); e os valores do `@media`
  de 1200 px

**`REDE`**: `API_BASE` (dev/prod) e timeout do chat (60 s), hoje literais em
`AssistantApp.jsx`.

### 2.2 A ponte para o CSS — `src/config/cssBridge.js`

Função `aplicarConfigNoCss(temaAtivo)` que escreve os valores derivados como
propriedades customizadas `--cfg-*` em `document.documentElement`. Chamada uma
vez no boot e novamente a cada troca de tema (para os valores que dependem dele).

`tokens.css` passa a consumir:

```css
:root {
  --win-radius: var(--cfg-win-radius);
  --win-glass-blur: var(--cfg-win-glass-blur);
  --taskbar-h: var(--cfg-taskbar-h);
  /* ... */
}
```

**Fallback obrigatório:** cada `var(--cfg-*)` recebe o valor atual como segundo
argumento (`var(--cfg-win-radius, 10px)`). Assim, se a ponte falhar ou rodar
tarde, o CSS pinta o valor correto em vez de nada — não pode existir um frame
sem raio de janela.

### 2.3 O limite explícito

**Fica em `tokens.css`, não no `system.js`:** os gradientes desenhados à mão da
cerimônia — `--cer-ceu-boot`, `--cer-campo-lock`, `--cer-estrelas`,
`--cer-nebulosa`, `--cer-nebulosa-forte` — e a paleta de texto/borda derivada
deles, nos dois temas.

Motivo: são de 6 a 18 camadas de `radial-gradient` por variável, com documentação
dos seis eixos que separam a cena de inicialização da de bloqueio (forma,
textura, temperatura, movimento, valor, moldura). Transformar aquilo em strings
de JavaScript perde a legibilidade e ganha nada — não são botões de ajuste, são
arte com histórico de decisão registrado ao lado.

O `system.js` carrega um bloco de comentário apontando para lá, explicando o
critério: **número e cor simples viram configuração; forma desenhada continua
sendo arte no CSS.**

---

## 3. Componentes e hooks reutilizáveis

Criados apenas onde há duplicação real hoje — nada especulativo.

### `src/ui/`

- **`AppIconButton.jsx`** — recebe um item do `registry` e uma variante
  (`tile` | `grade` | `lista` | `dock`). Substitui os 4 markups de
  `Desktop`, `HomeScreen`, `Dock` e `StartMenu`. O CSS de cada variante fica
  junto; a diferença visual atual entre os quatro é preservada exatamente.
- **`Clock.jsx`** — prop `formato` (`'hm'` | `'hm-data'` | `'extenso'`) e
  `locale`. O intervalo é derivado do formato: formato sem segundos alinha o
  primeiro tique à virada do minuto (comportamento que hoje só o relógio da
  cerimônia tem) e depois usa 60 s. Substitui as 3 implementações.
- **`useSystemToggles()`** — devolve as 3 linhas já resolvidas (ícone, rótulo,
  dica, valor, ação) lendo `ThemeContext` e `LanguageContext`. **Este é o ganho
  principal:** adicionar um quarto controle passa a custar um arquivo em vez de
  três. Os três consumidores (`SettingsApp`, `QuickSettings`, popup de tray da
  `Taskbar`) passam a ler daqui.
- **`ToggleRow.jsx`** — só para `SettingsApp` e `QuickSettings`, cujas linhas têm
  a mesma estrutura (ícone + rótulo + valor). O popup de tray tem um formato
  diferente (sem valor separado, o ícone *é* o valor) e **mantém o markup
  próprio**, consumindo apenas o hook. Forçar os três no mesmo componente exigiria
  um leque de props que valeria menos que a duplicação que remove.
- **`AppHeader.jsx`** — eyebrow + título + subtítulo, usado por `DevicesApp` e
  `HistoryApp`.
- **`Chip.jsx`** — a pílula. **Caso mais fraco da lista, e com um critério de
  corte:** os 5 usos atuais têm valores visuais diferentes entre si (fonte,
  padding, raio, cor). A unificação só acontece para os que compartilham a *mesma*
  base computada; onde o visual diverge de verdade, o `Chip` fornece a base e o
  app aplica seu modificador. Se ao executar sobrarem 5 variantes distintas, o
  componente não se paga — nesse caso o item é descartado e fica registrado o
  porquê, em vez de entregar uma abstração que só move o problema.

### `src/os/hooks/`

- **`useIdleTask(fn, { timeout, fallbackMs })`** — encapsula o par
  `requestIdleCallback` / `setTimeout` com cancelamento correto, e passa a ser a
  única implementação.
- **`useMediaQuery(query)`** — base única. `useDeviceMode` passa a ser uma
  chamada dela, e a leitura de `prefers-reduced-motion` do `ThemeContext` e da
  `Ceremony` também.

### `src/os/primitives.css`

As classes de superfície (`.os-surface`, `.os-row`, `.os-chip`) que hoje cada
`App.css` recopia. **Não é um redesign:** os valores são exatamente os que já
estão em uso; o que muda é haver uma declaração em vez de cinco.

---

## 4. Estrutura de pastas

### 4.1 Alvo

```
src/
  config/
    system.js            ← o arquivo central
    cssBridge.js         ← config → CSS vars
  os/
    shell/               ← App.jsx quebrado aqui
      Shell.jsx
      BoasVindas.jsx
      TituloDaPagina.jsx
    desktop/  mobile/  boot/
    hooks/               useDeviceMode  useIdleTask  useMediaQuery  useDocumentHead
    registry.js  routes.js  windowManager.js  WindowManagerContext.jsx
    tokens.css  primitives.css
  apps/                  ← os 9 apps, inalterados
  ui/                    ← AppIconButton  Clock  ToggleRow  AppHeader  Chip
  wallpaper/             ← funde components/backgrounds/ + wallpapers/
    Wallpaper.jsx        ← era Hills.jsx
    Silk.jsx  Iridescence.jsx
  brand/Crystal.jsx      ← era components/Crystal.jsx
  effects/DecryptedText.jsx
  content/               ← era data/: projects  journey  tech  contact  content
  i18n/                  ← os.js  startMenu.js
  contexts/
  styles/index.css
```

### 4.2 Justificativas

- **`Hills` → `Wallpaper`**: o nome descreve cristas SVG que o próprio cabeçalho
  do arquivo diz terem sido removidas. Hoje o componente é o wallpaper.
- **`components/backgrounds/` + `wallpapers/` → `wallpaper/`**: a divisão entre as
  duas pastas não corresponde a nenhuma diferença real — `Hills` importa os dois
  shaders e é o único consumidor deles.
- **`data/` → `content/` + `i18n/`**: `os.js` tem 325 linhas de string de
  interface (rótulos de janela, texto do boot, mensagens do assistente) e está
  na mesma pasta que `projects.js`, que é conteúdo de portfólio. São coisas
  diferentes com ciclos de vida diferentes.
- **`App.jsx` quebrado**: 211 linhas contendo 3 componentes (`Shell`,
  `BoasVindas`, `TituloDaPagina`) mais o `App`, com blocos de comentário longos
  que documentam decisões de performance. Separados, cada arquivo cabe na cabeça.

### 4.3 A colisão de `.about-section` — tratamento obrigatório

`AboutApp.jsx` renderiza `<section className="about-section">` duas vezes.
`AboutApp.css` **não define** `.about-section` — só `.about-section-title`.
Quem define é o `index.css` legado, na regra da landing page antiga:

```css
.about-section {
  position: relative;  width: 100%;  min-height: 70vh;
  padding: 5rem 2rem;  background-color: transparent;
  display: flex;  align-items: center;  justify-content: center;
  overflow: hidden;  border-top: none;
}
```

Ou seja: **as duas seções da janela "Sobre" são estilizadas hoje por CSS morto**,
com 70vh de altura mínima e 5rem de padding dentro de uma janela de 620×520.

**Decisão: preservar pixel a pixel.** As regras acima são copiadas para
`AboutApp.css` sob um nome próprio (`.about-block`), o JSX passa a usar esse
nome, e só então o bloco legado do `index.css` pode ser apagado. Verificação por
comparação de tela antes/depois da janela "Sobre", nos dois temas.

Se depois disso o dono do projeto quiser reduzir o padding, é uma decisão de
design isolada e explícita — não um efeito colateral de faxina.

---

## 5. Performance

### 5.1 Bytes

**5.1.1 Portar `Silk` de `@react-three/fiber` para `ogl`.**
O `ogl` já é dependência do projeto (`Iridescence` usa). O Silk é um quad de tela
cheia com um `shaderMaterial` — não usa câmera, luz, cena nem nada que justifique
o `three`. A porta mantém: o mesmo vertex shader, o mesmo fragment shader
(byte a byte), os mesmos uniforms, `dpr` 0.6, teto de 20 fps, `alpha: true`,
`antialias: false`, e a pausa por ref sem destruir o contexto WebGL — que é o
padrão que o `Iridescence` já usa e que existe justamente porque alternar a
animação recriando o contexto travava a subida da cortina.

Efeito: `three` + `@react-three/fiber` saem do bundle inicial. O `Crystal`, que
já é lazy, passa a carregar de fato o `three` + `drei` — só quando alguém abre o
"Sobre" ou vê a cerimônia (que já dispara o prefetch em idle).

**Verificação obrigatória:** comparação visual lado a lado do wallpaper escuro,
em movimento, antes e depois. Shader idêntico deve dar imagem idêntica; se não
der, a porta está errada.

**5.1.2 `React.lazy` por app no `registry.js`.**
O campo `component` passa a ser `lazy(() => import(...))`. Os demais campos
(`id`, `route`, `titleKey`, `icon`, `defaultSize`, `parent`, flags) continuam
estáticos, porque rotas, títulos e ícones são resolvidos sincronamente — o
`deriveInitial` do `WindowManagerContext` depende disso e não pode virar assíncrono.

`Window.jsx` e `MobileApp.jsx` ganham um `<Suspense>` com fallback vazio. Como o
chunk é pequeno e o prefetch acontece em idle (mesmo padrão do `Crystal`), o
fallback praticamente não aparece.

**Prefetch:** ao terminar o boot, disparar em idle o import dos apps marcados
`onDesktop` — são os que o visitante alcança com um clique.

**5.1.3 `react-markdown` lazy dentro do `AssistantApp`.**
A renderização de markdown vira um componente próprio carregado por `lazy`,
montado só quando existe pelo menos uma mensagem do assistente. Enquanto não há
mensagem, o Assistant mostra o estado vazio, que não precisa de markdown.

**5.1.4 `manualChunks` no `vite.config.js`.**
Separar `react` + `react-dom` + `motion` num chunk de vendor estável, para que
uma mudança de código de app não invalide o cache do vendor.

**5.1.5 Faxina.**
Apagar `App.css`, `StartMenu_ignore_this.txt`, os ~400 linhas mortas de
`index.css` (depois da 4.3) e os exports de compatibilidade de `data/`.

**Alvo:** caminho crítico de **432 KB gzip → ~180–200 KB gzip**.
O número é uma projeção; o critério de aceite é a medição do build, registrada
na conclusão de cada etapa.

### 5.2 Runtime

**5.2.1 `WindowManagerContext` em dois contextos.**
`WindowStateContext` (`windows`, `focusedKey`) e `WindowActionsContext`
(`open`, `close`, `focus`, ...), este último com `value` memoizado e estável para
sempre — as ações são todas `useCallback` sem dependências.

Consumidores que só disparam ações (`ProjectsApp`, `TerminalApp`, `Dock`,
`HomeScreen`, `Desktop` nos ícones) passam a assinar só as ações e **param de
re-renderizar** quando uma janela é focada ou arrastada.

`useWindows()` continua existindo, lendo os dois, para não quebrar quem
legitimamente precisa dos dois.

**5.2.2 `React.memo` na `Window`.** Com o contexto dividido, uma janela só
re-renderiza quando o seu próprio objeto `win` ou o seu foco mudam.

**5.2.3 `dragConstraints` reativo.** Passa a derivar de um `useMediaQuery`/
listener de resize em vez de ler `window.innerWidth` no corpo do render.

**5.2.4 `AssistantApp`: scroll.** O efeito de `scrollIntoView` separa os casos —
mensagem nova rola com `behavior: 'smooth'`; mudança de texto de status ajusta a
posição direto, sem reiniciar uma animação de scroll a cada evento SSE.

### 5.3 Correções pontuais

- **Peso da fonte:** `.about-spec-number` usa `font-weight: 800`, que não existe
  no import do Poppins e não pode ser sintetizado (`font-synthesis: none`).
  Correção **sem mudança visual**: trocar a declaração para o peso que o
  navegador já está pintando hoje. Confirmar qual é, medindo no navegador, antes
  de escrever o valor.
- **Teclado no popup de tray:** os `<div onClick>` de `Taskbar.jsx` viram
  `<button>` com o mesmo CSS. `.show-desktop-line` ganha `role="button"`,
  `tabIndex` e handler de teclado. Aparência inalterada.
- **`.theme-light h1, ..., div { color }`:** substituído por herança a partir de
  um container, preservando a cor final de cada elemento. Última etapa da faxina
  de `index.css`, porque é a de maior risco de regressão visual.

---

## 6. Ordem de execução

Cada etapa termina com build medido e comparação visual. Nenhuma etapa depende de
uma etapa futura.

1. **Faxina inerte** — apagar `App.css`, o `.txt`, os exports mortos de `data/`.
   Risco zero: nada disso é referenciado.
2. **Colisão `.about-section`** (4.3) — isolada, porque é a única com risco visual
   real e precisa de verificação dedicada.
3. **Resto do `index.css` morto** — só depois de 2.
4. **`config/system.js` + `cssBridge.js`** — criar e migrar os consumidores. Sem
   mudança de valor: cada literal vira uma referência ao mesmo número.
5. **Hooks (`useIdleTask`, `useMediaQuery`)** — pré-requisito dos componentes.
6. **Componentes de `ui/`** — um por vez, com comparação visual de cada
   consumidor.
7. **Divisão do contexto de janelas + `memo`** — mudança de comportamento de
   render, verificada com abertura/arrasto/foco de várias janelas.
8. **`Silk` → `ogl`** — a de maior ganho e maior risco visual; isolada.
9. **`React.lazy` por app + prefetch** — depois de 8, para a medição do ganho ser
   atribuível.
10. **`react-markdown` lazy + `manualChunks`.**
11. **Movimentação de pastas** — por último, de propósito: é churn de diff puro e
    não deve se misturar com mudança de comportamento no histórico.
12. **Correções pontuais** (5.3).

**Regra de posicionamento, para a etapa 11 não contradizer as anteriores:**
arquivo **novo** (`config/`, `os/hooks/`, `ui/`) nasce direto no destino final da
seção 4.1, nas etapas 4–6. A etapa 11 move apenas arquivos que **já existem**:
`wallpapers/Hills.jsx` → `wallpaper/Wallpaper.jsx`, `components/backgrounds/*` →
`wallpaper/`, `components/Crystal.jsx` → `brand/`,
`components/effects/` → `effects/`, `data/` → `content/` + `i18n/`, e a quebra de
`App.jsx` em `os/shell/`.

**Faseamento.** As etapas 1–3 são faxina e podem ir juntas. 4–7 são a refatoração
estrutural. 8–10 são performance de bundle. 11–12 são acabamento. Cada bloco é
mergeável sozinho; nenhum deles precisa do seguinte para o site funcionar.

---

## 7. Verificação

Não existe suíte automatizada de UI neste projeto, e este trabalho não é a hora
de criar uma. A verificação é:

- **Build medido** a cada etapa: `npm run build` e o tamanho gzip de cada chunk,
  comparado com a linha de base da seção 1.1.
- **`npm run lint`** limpo.
- **`npm test`** — os testes puros existentes (`routes.test.js`,
  `windowManager.test.js`) continuam passando. As etapas 4 e 7 ganham teste novo
  onde a lógica é pura: `cascadePosition` lendo do `system.js`, e o reducer
  inalterado.
- **Comparação visual manual**, nos dois temas e nos dois modos (desktop/mobile),
  cobrindo: boot → bloqueio → desktop, abertura/arrasto/maximização de janela,
  troca de tema (crossfade), menu iniciar, menu de contexto, e cada um dos 9 apps.

Nenhuma etapa é declarada pronta sem essas três saídas registradas.

---

## 8. Fora de escopo

- Qualquer mudança de design, layout, cor, tipografia ou timing percebido.
- Migração para TypeScript.
- Adicionar biblioteca de roteamento, de estado ou de i18n.
- Suíte de testes de componente / e2e.
- Backend, deploy e configuração de Coolify.
- Reescrever os gradientes da cerimônia (ver 2.3).
