---
name: marocos-os-frontend
description: Use when working in frontend/ of the marocos.dev portfolio (Marocos OS) — touching components, CSS, design tokens or the visual language, configuration values, apps, the boot ceremony or the window manager; and before stating that a change did not alter the interface.
---

# Frontend do Marocos OS

Portfólio React/Vite com metáfora de sistema operacional: área de trabalho com
wallpaper por shader, janelas arrastáveis, taskbar, cerimônia de boot com um
cristal 3D, e um shell mobile separado abaixo de 1024px.

**O código aqui se explica.** Os comentários registram medições reais e
decisões pagas com depuração — leia-os antes de mudar o que eles descrevem.
Esta skill carrega só o que **não** está no código: as ferramentas de
verificação e as convenções do repositório.

## Antes de dizer que uma mudança não alterou nada

Existe uma suíte para isso. Rode-a:

```bash
cd frontend/visual
npm install          # 1ª vez: baixa o Chromium (só aqui, não polui o app)
npm run build:frontend
npm test             # 38 testes: 21 visuais + 17 funcionais
```

Falhou uma cena? Abra o relatório com `npm run report` — ele mostra referência,
resultado e diferença lado a lado.

**Só atualize as referências (`npm run test:update`) depois de conferir a
mudança visual e concluir que ela é intencional.** Atualizar para calar uma
falha que você não entendeu apaga a única evidência de que algo quebrou.

## O que cada suíte pega — e o que nenhuma pega

| suíte | pega | não pega |
|---|---|---|
| `visual.spec.js` (21 cenas) | geometria, cor, espaçamento, tipografia, nos dois temas e no mobile | qualquer coisa que dependa de **tempo** |
| `rotas.spec.js` (17 testes) | `import()` dinâmico quebrado, deep link, histórico, carga sob demanda, **e o que só existe depois de um clique** | aparência |
| `npm test` no `frontend/` | lógica pura (roteamento, reducer de janelas, config) | tudo que precisa de DOM |

**O regressor visual é estruturalmente cego a tempo.** Ele desliga a animação
antes do primeiro render, então o `uTime` dos shaders é sempre 0 em toda cena.
Uma transição de 0,6s renderiza igual a uma de 0,16s numa foto. Suíte verde
autoriza dizer *"nada mudou no que é fotografado"*, nunca *"nada mudou"*.

**Nada cobre** `:hover`, `:focus-visible`, `:active`, navegação por teclado, nem
duração/velocidade de animação. Isso se verifica lendo o código ou no navegador.

**`npm run build` não pega import dinâmico quebrado.** Ele compila com o
caminho errado e falha só em runtime. É para isso que existe o `rotas.spec.js`
— os nove apps, o cristal e o markdown do assistente são todos carregados por
`import()`.

## A regra que vale antes de todas as outras

**Nada novo no frontend nasce com valor literal.** Componente, CSS, app, aviso,
balão — se você está escrevendo uma cor, uma medida, uma duração ou uma curva,
ela vem de `config/system.js` pela ponte, ou de um token que já existe.

O caminho é sempre o mesmo:

```
config/system.js  →  config/cssBridge.js  →  --cfg-*  →  var() no CSS
```

**Por que isso não é burocracia:** o visitante escolhe um *preset* nas
Configurações, e o preset repinta o sistema inteiro — acento, chrome, fundo de
janela, cerimônia, cristal. Todo literal perdido é um lugar onde a escolha dele
**não chega**, e o sintoma é sempre o mesmo: um pedaço da interface fica roxo
depois que todo o resto já mudou de cor.

Antes de dar um valor por escrito, pergunte nesta ordem:

1. **já existe token para isto?** (`--accent-color`, `--card-bg`, `--win-*`,
   `--cer-*`, `--veu-*`, a escala de z-index, a escala tipográfica)
2. **é ajuste do sistema?** → vai para `config/system.js` e ganha um `--cfg-*`
3. **é arte desenhada ou cor semântica?** → só então fica literal, **com o
   porquê escrito ao lado** (ver as três exceções abaixo)

Preset novo: acrescente ao array em `PRESETS`, com `acento` e `ceu`, e o nome
nos dois idiomas em `i18n/os.js`. Nada mais precisa saber que ele existe.

## A linguagem visual

O sistema de design está em três camadas, com donos distintos. Escrever na
camada errada é o erro mais comum:

| camada | onde | dona de |
|---|---|---|
| ajuste | `config/system.js` → `--cfg-*` | blur, raios, alturas, durações |
| chrome do SO | `os/tokens.css` | `--win-*`, `--icon-tile-*`, `--taskbar-h`, escala de z-index, arte da cerimônia |
| chrome de explorador | `config/system.js` → `--cfg-explorer-*` | largura da lateral e altura das duas barras — **com contrato**: os seis apps com `explorer: true` têm `defaultSize` = tamanho antigo + lateral + barras, e há teste guardando a soma |
| conteúdo | `styles/index.css` | `--bg-color`, `--text-primary/secondary`, `--accent-color`, `--card-bg/border` |

- **Nunca invente z-index** — a escala em `tokens.css` é fonte única.
- **`config/system.js` é o ÚNICO que define; o resto lê.** Nenhum componente e
  nenhum CSS escreve cor, medida ou duração do sistema como literal. O caminho é
  sempre `system.js → cssBridge.js → --cfg-* → var()` no CSS.
- **O acento tem duas formas, e a segunda não é opcional:**

  | quer | escreva |
  |---|---|
  | a cor cheia | `var(--accent-color)` |
  | qualquer opacidade dela | `rgb(var(--accent-rgb) / 0.16)` |

  `--accent-rgb` é um trio cru (`168 85 247`) publicado pela ponte a partir do
  preset ativo. Um `rgba(168, 85, 247, X)` literal perdido em qualquer arquivo é
  um lugar onde a troca de preset **não chega** — e o sintoma é sempre o mesmo:
  um pedaço da interface fica roxo depois que todo o resto já mudou de cor.
- **As três exceções que continuam literais**, cada uma documentada onde vive:
  os gradientes da cerimônia (`os/tokens.css`, é arte), as cores de **categoria**
  (tipos do histórico, status do terminal, marcas em `content/tech.js` — elas
  significam algo, e seguir o tema faria "erro" e "sucesso" trocarem de cor) e o
  âmbar da tela de BIOS (máquina desligada não tem tema).
- **Superfície de conteúdo** é `--card-bg` + `--card-border` — não uma receita
  de vidro nova. É o que o chrome de explorador usa nas três superfícies dele, e
  **sem `backdrop-filter`**: elas ficam dentro de uma janela que já paga um
  blur, e filtro sobre filtro é o custo que `Window.css` documenta ter derrubado
  de 20px para 6px.
- **Alpha de tema escuro não se reaproveita no tema claro.** Vidro
  semitransparente conta com o que está atrás ser mais escuro que ele; sobre o
  wallpaper claro a mistura vai na direção oposta e lava a cor. O tile de ícone
  paga isso explicitamente: `rgba(46,16,101,.92)` de dia contra
  `rgba(14,9,22,.6)` de noite, e a conta está no comentário de `--icon-tile-bg`.
- **Raio**: `--win-control-radius` em qualquer coisa clicável. Pílula de 999px é
  só para elemento **não** interativo (badge, tag).

### As duas vozes tipográficas

A fonte do sistema é Poppins. `'Courier New', monospace` aparece em vários
lugares e **não é decoração** — é a voz da máquina. Vale a regra, não a lista:

- **mono + caixa alta + letter-spacing** = o sistema falando sobre si mesmo:
  ficha técnica (`.about-spec-label`), metadado de timeline (`HistoryApp`),
  terminal.
- **Poppins** = texto que uma pessoa escreveu: título de card, descrição,
  rótulo de interface.

É por isso que `.about-section-title` (mono) e `.start-menu-apps-heading`
(Poppins) parecem se contradizer e não se contradizem — a janela "Sobre" é uma
ficha técnica, o menu Iniciar é interface. **Copiar o vizinho errado desalinha.**
Decida pela voz, depois copie.

Escala aproximada, para não inventar tamanho: `1,6rem` número de destaque ·
`1,05–1,1rem` título de card · `0,9–0,95rem` corpo · `0,85rem` corpo secundário ·
`0,72–0,8rem` meta e hint · `0,65–0,68rem` micro-rótulo (sempre caixa alta, com
letter-spacing).

## Convenções do repositório

- **Tudo em PT-BR**: código, comentários, mensagens de commit.
- **Commits**: prefixo `feat:` / `fix:` / `perf:` / `refactor:` / `docs:` /
  `chore:` / `test:`. **Nunca** adicione `Co-Authored-By:` nem qualquer
  assinatura de ferramenta — o dono do repositório proibiu explicitamente.
- **Testes só de lógica pura.** O vitest roda com `environment: 'node'` e
  `include: ['src/**/*.test.js']` — sem DOM. Não crie `.test.jsx` nem instale
  jsdom; o que precisa de navegador vive em `frontend/visual/`.
- **Não acrescente dependência ao `frontend/package.json`** sem pedir. O
  harness tem `package.json` próprio justamente para não arrastar um navegador
  para dentro de todo build.

## Onde as coisas moram

```
frontend/src/
  config/system.js    valores de ajuste do sistema (+ cssBridge.js, que os leva ao CSS)
  os/                 shell/ desktop/ mobile/ boot/ hooks/ + registry, rotas, windowManager
  apps/               os 9 apps, carregados por lazy()
  ui/                 componentes compartilhados
  wallpaper/ brand/ effects/
  content/            dados do portfólio      i18n/ strings de interface
  styles/ contexts/
frontend/visual/      a suíte de verificação
```

## Deixe o código te ensinar

Antes de mudar algo destes, leia o comentário que está junto — cada um registra
uma decisão que custou medição ou depuração:

| se você for mexer em | leia primeiro |
|---|---|
| qualquer valor visual | o cabeçalho de `config/system.js` — inclusive o que ele diz que **não** mora lá |
| CSS de componente novo | `ui/AppIconButton.css` — o hack global de tema claro de `index.css`, e por que a variante `--tile` precisa **vencê-lo** com seletor composto enquanto a `--plana` precisa **herdar** com `color: inherit` |
| custom property nova | `config/cssBridge.js` — por que todo `var(--cfg-*)` precisa de fallback |
| chrome de janela, navegação entre apps | `os/windowManager.js` — a chave é id de INSTÂNCIA, não o appId, e as três portas (`OPEN` de fora, `NAVIGATE` de dentro, `EXTERNAL_ROUTE` do voltar do navegador) |
| um app precisar levar o visitante a outro | `os/NavegacaoContext.jsx` — **duas** intenções: `useIrPara()` entra (troca o conteúdo desta janela, como a lateral do explorador) e `useAbrir()` abre ao lado (janela nova, como as portas do guia). Quem traduz cada uma para o shell é o container, nunca o app |
| um preset precisar mudar mais que cor | `config/system.js`, o bloco `PRESET_XP` — um preset pode declarar `fonte`, `nomeSistema`, `corpoCristal`, `luzCristal` e o marcador `xp`, e cada um deles tem um consumidor único documentado |
| ícone de app no modo XP | `ui/xpIcons.jsx` — SVG desenhado, um por app, chaveado pelo `id` do registry; app sem entrada cai no glifo lucide |
| wallpaper ou shader | `wallpaper/Silk.jsx` — teto de fps, tempo acumulado, e por que a pausa vive numa ref |
| acrescentar um app | `os/registry.js` — por que só `component` pode ser `lazy` |
| a cerimônia de boot | `os/shell/Shell.jsx` e `os/boot/boot.css` — os tempos medidos e os seis eixos das duas cenas |
| gradientes da cerimônia | `os/tokens.css` — são arte desenhada à mão, não configuração |

## Erros comuns

- **Afirmar que nada mudou sem rodar a suíte.** É a falha mais frequente:
  agentes propõem "inspeção visual antes e depois" sem saber que existe
  ferramenta.
- **Concluir "nada mudou" de uma suíte verde depois de mexer em duração de
  animação.** A foto não vê tempo.
- **Subir tolerância para calar ruído.** O limiar de cada cena foi medido
  rodando o mesmo commit duas vezes; cenas sem WebGL têm piso **zero** e
  qualquer diferença nelas é sinal.
- **Procurar no CÓDIGO uma instabilidade que era do HARNESS.** Esta suíte
  reprovava de forma intermitente, em cenas sempre diferentes, e a investigação
  passou por duas suspeitas erradas antes de achar a certa:

  1. o `ruido` do shader Silk — errada: as cenas que só têm shader nunca
     reclamaram;
  2. o giro do cristal 3D — parcialmente certa, e virou duas correções de
     produto de verdade (o `Crystal` respeita `prefers-reduced-motion`, e o
     "Sobre este PC" respeita o interruptor de Movimento), mas não explicava
     tudo;
  3. **`workers: 4` no `playwright.config.js`** — a causa. Aqui não há GPU: é
     SwiftShader, rasterização por software. Quatro Chromium com WebGL ao mesmo
     tempo atrasavam os quadros e o Playwright reprovava com *"failed to take
     two consecutive stable screenshots"*.

  O que desmontou as duas primeiras hipóteses foi uma cena: `mobile-home-claro`
  falhava, e ela não tem shader, nem cristal, nem janela. **Quando o sintoma
  aparece onde não existe a causa suspeita, a causa é outra.**

  Hoje `workers: 1` (medido: 37/38 contra 6-7 reprovando), e a suíte demora
  ~4,3 min em vez de ~1,8. É o preço certo — regressor que reprova sozinho
  ensina a ignorar o vermelho.

  **Não rode outra coisa pesada na máquina enquanto a suíte roda**, pelo mesmo
  motivo: um `npm run build` em paralelo disputa a mesma CPU.
- **Editar o literal no componente** em vez do `config/system.js`, deixando a
  configuração inerte — a chave passa a existir sem fazer nada.
- **Tentar neutralizar o tema token por token.** O preset XP precisa renderizar
  IGUAL de dia e de noite, e a primeira tentativa enumerou os tokens em
  `.theme-dark.modo-xp` e `.theme-light.modo-xp`. Não bastou e não podia bastar:
  há dezenas de regras `.theme-light .alguma-coisa` nos CSS de componente, mais
  o hack global do `index.css`. A saída foi **fixar** a classe de tema no
  `Shell.jsx` (`preset.xp` força `theme-light`) e repintar por cima de um alvo
  estável. Quando um modo precisa ignorar o tema, fixe o tema; não persiga os
  tokens.
- **Esquecer que `position: fixed` não escapa de um ancestral com `transform`.**
  A janela é um `motion.div` posicionado por `translate`, e isso a torna o bloco
  de contenção de qualquer descendente `fixed`. Um balão `fixed` dentro dela
  acerta o lugar só quando ela está maximizada (translate zero) e erra pela
  posição da janela em qualquer outro caso. Para sair de verdade: **portal para
  `document.body`** — ver `ui/Dica.jsx`.
- **Estranhar que um app novo rebaseie ~15 capturas.** A grade de ícones do
  desktop, o menu Iniciar e a home mobile são chrome presente em quase toda
  cena, então um app a mais mexe em todas. É esperado — mas **confira diff por
  diff antes de aceitar**: o único pixel diferente deve ser o ícone novo, e
  nenhum dos existentes pode ter mudado de posição. Note também que
  `rotas.spec.js` fala em "nove rotas" no texto e no comentário; se o número de
  apps mudar, decida conscientemente se aquele spec muda de escopo.

## Quando esta skill fica desatualizada

Esta skill descreve padrões. Mudar um padrão sem mudar a skill é o mecanismo
exato de apodrecimento que este projeto já documentou: a tarefa N escreve a
documentação, a tarefa N+k muda o código, e ninguém relê a documentação.

**Se a sua mudança fez alguma destas coisas, edite este arquivo no mesmo
commit** — não depois, não num commit de limpeza:

| você mudou | atualize |
|---|---|
| acrescentou, removeu ou renomeou um app | o mapa e o aviso de rebaseline |
| a escala tipográfica, o acento, os tokens de vidro, os raios | "A linguagem visual" |
| acrescentou um componente compartilhado em `ui/` | "Deixe o código te ensinar" |
| acrescentou um preset, ou um campo novo de preset | "Deixe o código te ensinar" — e confira se `config/system.test.js` ainda conta certo |
| como se roda a suíte, ou o que ela cobre | as duas primeiras seções |
| qualquer coisa que torne falso um limite declarado aqui | a seção que o declara |

Quando a mudança de padrão for pedida pelo dono do projeto, a atualização desta
skill **faz parte da entrega**, e você diz o que atualizou junto com o resto.

**Se você está lendo isto porque algo aqui não bate com o código: a skill está
errada e o código está certo.** Conserte a skill.
