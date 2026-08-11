---
name: marocos-os-frontend
description: Use when working in frontend/ of the marocos.dev portfolio (Marocos OS) — touching components, CSS, visual configuration, apps, the boot ceremony or the window manager; and before stating that a change did not alter the interface.
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
npm test             # 34 testes: 21 visuais + 13 funcionais
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
| `rotas.spec.js` (13 testes) | `import()` dinâmico quebrado, deep link, histórico, carga sob demanda | aparência |
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
| CSS de componente novo | `ui/AppIconButton.css` — o hack global de tema claro e o uso de `:where()` |
| custom property nova | `config/cssBridge.js` — por que todo `var(--cfg-*)` precisa de fallback |
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
- **Editar o literal no componente** em vez do `config/system.js`, deixando a
  configuração inerte — a chave passa a existir sem fazer nada.
