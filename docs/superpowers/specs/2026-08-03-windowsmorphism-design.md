# NoiseOS — Redesign do portfólio como sistema operacional

**Data:** 2026-08-03
**Branch:** `feat/windowsmorphism`
**Escopo:** frontend apenas. Backend (FastAPI, LangGraph, RAG, ChromaDB, rate limiter, SSE) não é alterado.

---

## 1. Objetivo

Substituir o site linear atual por um ambiente de desktop navegável — "NoiseOS" — onde cada
tópico do portfólio é um app que abre em janela arrastável. O conteúdo textual existente é
preservado integralmente; o que muda é o invólucro e a navegação.

O portfólio já se autodeclara `NoisePortfolio OS [Version 3.0.1]` no conteúdo da seção de
contato, e a navbar atual já imita uma taskbar. Este redesign leva a metáfora que já estava
latente até o fim.

### Critérios de sucesso

1. Todo o conteúdo de `src/data/` continua acessível, sem perda de texto.
2. Nenhuma regressão de SEO: o conteúdo permanece no DOM e cada app tem URL própria.
3. Um único frontend serve desktop e mobile (sem duas implementações do mesmo conteúdo).
4. O backend não recebe nenhuma alteração.
5. Funciona com teclado, com leitor de tela e com `prefers-reduced-motion`.

---

## 2. Decisões tomadas

| # | Decisão | Alternativas descartadas |
|---|---|---|
| 1 | **Desktop puro, sem scroll de página.** Todo scroll acontece dentro de janelas. | Site atual dentro de uma janela "navegador"; híbrido desktop-em-cima/scroll-embaixo |
| 2 | **NoiseOS autoral** — gramática de SO com chrome de vidro roxo, evoluindo o glassmorphism atual. | Clone fiel do XP Luna repintado; Aero/Windows 7 |
| 3 | **Mobile vira SO mobile** — home screen de ícones, apps em tela cheia. | Desktop comprimido com janela maximizada; servir o site linear atual no mobile |
| 4 | **Window manager essencial + taskbar viva.** Arrastar, foco/z-order, fechar, minimizar, maximizar, botões na taskbar, deep links. Sem resize, sem snap, sem persistir posição entre visitas. | Completo com resize/snap/localStorage; mínimo só com drag e fechar |
| 5 | **Boot curto (~1,8s), pulável, 1× por sessão.** | Sem boot; POST estilo BIOS de ~4s |
| 6 | **Drag à mão com Framer Motion** (`motion/react`, já instalado e já usado em `Journey.jsx`). | `react-rnd` (metade da lib é resize, que foi cortado); `dnd-kit` (feito pra listas ordenáveis) |
| 7 | **Rotas com History API à mão** (~30 linhas: `pathname → appId` + `popstate`). | `react-router-dom` (paradigma não usado em nenhum outro lugar do projeto); SSG via `vite-plugin-ssg` (anotado como evolução futura) |

### Princípio arquitetural central

**Os apps não sabem que existem janelas.** Cada app é um componente que só renderiza conteúdo.
O desktop o envolve em `<Window>`; o mobile o envolve em `<MobileApp>`. É isso que garante um
único frontend para os dois mundos.

---

## 3. Identidade visual

### 3.1 Wallpaper

Homenagem ao Bliss do Windows XP, **recriada em SVG + gradientes CSS**, não em shader.

Motivo técnico: `Silk` e `Iridescence` são WebGL de tela cheia; o orçamento de GPU passa a ser
do cristal. SVG também funciona no mobile, onde hoje o WebGL é desligado e substituído por um
gradiente chapado.

Motivo legal: o Bliss é fotografia de Charles O'Rear (1996) cujos direitos a Microsoft comprou
em 2000. Embarcar o arquivo original num site público é risco real. Recriar as colinas resolve
o copyright e permite repintá-las na paleta roxa da marca.

Anatomia: ~60% céu, ~40% colina, crista subindo suave da esquerda para a direita, nuvens
cúmulos pequenas.

- Céu: gradiente `#2e1065` (topo) → `#6d28d9` → `#a78bfa` → `#ddd6fe` (horizonte)
- Colinas: 3 paths SVG sobrepostos em `#7c3aed`, `#6b21a8`, `#581c87`
- Nuvens: elipses brancas com blur, `opacity: .5`, deriva lenta (desligável)
- Grão de filme por cima via `feTurbulence` — o projeto se chama **noise**portfolio, então ruído
  real na textura do sistema amarra o nome à coisa

**Claro/escuro = dia/noite da mesma paisagem.** Mesma geometria SVG, dois conjuntos de token:
dia com céu lilás pálido e colinas iluminadas; noite com índigo profundo, colinas em silhueta e
estrelas. Um componente, duas paletas.

`Silk` e `Iridescence` **não são deletados**: viram opções de papel de parede no app
Configurações, ao lado de *Colinas*. Deleção convertida em funcionalidade.

### 3.2 O cristal roxo

Três aparições, cada uma onde ele ganha presença em vez de competir por atenção:

1. **Boot** — logo do NoiseOS na splash
2. **Sobre este PC** — o slot onde o Windows põe a bandeirinha; o cristal é o logo do sistema
3. **Screensaver** — após 90s de inatividade, o desktop escurece e ele flutua com os `Sparkles`

Descartado: cristal fixo no centro do desktop atrás dos ícones — brigaria com a navegação e
custaria GPU permanentemente.

Refactor necessário: `CrystalScene.jsx` tem `700px` e `position: absolute` chumbados no
componente. Precisa receber `size` por prop para servir os três contextos.

### 3.3 Tokens

Mantém `--accent-color: #a855f7`. Entram:

| Token | Valor |
|---|---|
| `--win-glass` | `blur(20px) saturate(140%)` |
| `--win-border` | `1px solid rgba(255,255,255,.18)` |
| `--win-highlight` | `inset 0 1px 0 rgba(255,255,255,.25)` |
| `--win-radius` | `10px` (janela) / `8px` (controle) |
| `--icon-label-shadow` | `0 1px 3px rgba(0,0,0,.8)` |

### 3.4 Tipografia

- **Chrome das janelas:** `system-ui` — zero bytes, e é literalmente o que um SO usa
- **Conteúdo:** Poppins (mantido, já carregado)
- **Terminal:** `JetBrains Mono`, 1 peso — não existe no projeto hoje e o app precisa

### 3.5 Escala de z-index

Documentada em um único lugar, substituindo os valores espalhados de hoje
(taskbar `1000`, wallpaper `0`, conteúdo `5`/`10`, overlay `1`):

```
wallpaper          0
ícones do desktop  10
janelas            100+  (z dinâmico, cresce a partir de 100)
taskbar            1000
menu Iniciar       1100
boot / screensaver 2000
```

---

## 4. Os apps

### 4.1 Registry

| App | Rota | Conteúdo (origem) | Tamanho | Instâncias |
|---|---|---|---|---|
| Sobre este PC | `/sobre` | `content.js` — bio, 3 stats como specs, 9 skills como recursos instalados, cristal como logo | 560×420 | única |
| Meus Projetos | `/projetos` | `projects.js` — pasta com 5 "arquivos" | 640×440 | única |
| ↳ detalhe do projeto | `/projetos/<slug>` | título, categoria, descrição, techs, botão GitHub | 520×480 | até 5 juntas |
| Histórico de Versões | `/jornada` | `journey.js` — os 5 commits | 700×520 | única |
| Gerenciador de Dispositivos | `/stack` | `tech.js` — 4 categorias, 21 techs | 620×520 | única |
| Terminal | `/contato` | `contact.js` — logs, 4 canais, oferta de VPS | 680×440 | única |
| leia-me.txt | `/leia-me` | `PortfolioMeta.jsx` — o portfólio como case | 520×400 | única |
| Marcos Virtual | `/assistente` | `StartMenu.jsx` — o chat RAG | 460×620 | única |
| Configurações | `/config` | novo — wallpaper, tema, idioma, animação | 480×420 | única |

Forma de cada entrada do registry:

```js
{
  id: 'about',
  route: '/sobre',
  titleKey: 'about',        // resolvido via getOsData(lang).windows.about
  icon: User,               // lucide-react
  component: AboutApp,
  defaultSize: { w: 560, h: 420 },
  singleton: true,
  onDesktop: true,          // aparece na grade de ícones
  inStartMenu: true,
  inDock: false,            // dock do mobile
}
```

O detalhe de projeto é dinâmico e depende do pai:

```js
{
  id: 'project',
  route: '/projetos/:slug',
  titleKey: null,           // título vem de projects.js (o nome do projeto)
  icon: FileText,
  component: ProjectDetailApp,
  defaultSize: { w: 520, h: 480 },
  dynamic: true,            // instância por slug
  singleton: false,
  parent: 'projects',       // abrir exige o pai aberto
  onDesktop: false,
  inStartMenu: false,
  inDock: false,
}
```

São **9 entradas no registry**: 8 lançáveis pelo usuário + o detalhe de projeto, que só é
alcançado por dentro da pasta ou por deep link.

Onde cada uma aparece:

| Superfície | Quais |
|---|---|
| Ícones do desktop (`onDesktop`) | 7 — todos os lançáveis exceto Configurações |
| Menu Iniciar (`inStartMenu`) | 8 — todos os lançáveis |
| Grade do mobile | 8 — todos os lançáveis |
| Dock do mobile (`inDock`) | 4 — Marcos Virtual, Projetos, Sobre, Configurações |

O dock do mobile **duplica** 4 apps que também estão na grade. Isso é intencional e segue o
padrão do Android (hotseat repete apps da gaveta), não é bug.

### 4.2 Três traduções que melhoram o conteúdo

**Projetos → pasta com janelas filhas.** O carrossel é removido. Hoje `CARD_WIDTH = 800` está
chumbado e só um projeto fica legível por vez. Como janelas independentes, o visitante abre
Bússola e DataChat lado a lado e compara — o carrossel proíbe isso por construção.

**Jornada → histórico de versões vertical.** Hoje é carrossel horizontal arrastável com setas
SVG entre cards. Vira lista vertical estilo histórico de atualizações do Windows. A metáfora de
commit já está nos dados (`hash`, `[init]`, `[merge]`, `[release]`, `[wip]`) e finalmente tem a
moldura certa. `ConnectionArrow` e a maior parte das 593 linhas de `Journey.css` saem.

**Stack → árvore de dispositivos.** Categoria vira nó expansível, tech vira dispositivo com
bolinha na cor já definida em `tech.js`, e `level` vira coluna de status. A estrutura de dados
já é uma árvore de dois níveis.

### 4.3 Terminal navegável

O conteúdo já é um terminal falso; passa a ser real, com ~8 comandos — incluindo alguns que
abrem outras janelas, criando uma segunda via de navegação por ~60 linhas de mapa de comandos:

| Comando | Efeito |
|---|---|
| `help` | lista os comandos |
| `whoami` | imprime `bio_highlight` de `content.js` |
| `neofetch` | imprime as 3 stats + skills como especificações de sistema (mesmo conteúdo do `AboutApp`) |
| `contato` | tabela dos 4 canais de `contact.js` |
| `vps` | a oferta de hospedagem de `contact.js` |
| `projetos` | **abre a janela** Meus Projetos |
| `stack` | **abre a janela** Gerenciador de Dispositivos |
| `clear` | limpa a tela |

Comando desconhecido responde no estilo de shell (`comando não encontrado: xyz`) e sugere `help`.

### 4.4 O chat de IA em dois lugares

O campo de busca continua no Menu Iniciar ("digite para pesquisar" é a metáfora correta), mas
enviar **abre/foca a janela do Marcos Virtual** com aquela pergunta.

As 313 linhas de `StartMenu.jsx` são reaproveitadas quase inteiras no `AssistantApp`: o parser
de SSE, o contador de cota, o timeout de 60s e o `react-markdown`. Só o invólucro muda.

### 4.5 A Hero não tem janela — e carrega o `<h1>`

Único conteúdo sem lugar natural num desktop. Perder o `<h1>` é regressão de SEO real.
Duas medidas:

1. **Assinatura no wallpaper** — bloco de identidade com `<h1>Marcos Rodrigues</h1>` e o cargo.
   Posição: alinhado à esquerda, verticalmente centralizado, à direita da grade de ícones.
   A analogia de "marca d'água de sistema" é sobre o **tratamento** (tipografia integrada ao
   wallpaper, baixo contraste, sem card nem caixa), não sobre encolher para um canto — o H1 pode
   e deve ser grande. Some no mobile, onde a grade ocupa a tela (lá o H1 vive no `AboutApp`).
2. **Na primeira visita da sessão, "Sobre este PC" abre sozinho** — ninguém deve cair num
   desktop vazio sem saber o que clicar.

Ambos usam a **mesma** chave `sessionStorage['noiseos:visited']` que controla o boot: a primeira
visita da sessão recebe boot + janela de boas-vindas; recarregar na mesma aba cai direto num
desktop limpo. Uma chave, um conceito ("primeira vez nesta sessão").

Sai: o indicador "Scroll". Sobrevive melhor: a dica de F11, que num SO faz mais sentido do que
num site que rola.

---

## 5. O shell

### 5.1 Desktop

Grade de ícones no canto superior esquerdo, células de 88px, preenchendo em coluna. Cada ícone é
um glifo `lucide-react` dentro de um tile de vidro de 56px com leve gradiente roxo — lê como
ícone de app sem nenhum asset novo.

**Clique único abre** (desvio deliberado da metáfora). No SO real é clique para selecionar e
duplo para abrir, mas na web quem clica uma vez e não vê reação acha que quebrou. Como esses
ícones são a navegação principal, usabilidade ganha de fidelidade.

Botão direito no wallpaper abre menu de contexto: *Atualizar*, *Alterar plano de fundo* (abre
Configurações), *Alinhar ícones*. Aplicado **apenas** à superfície do wallpaper — sobre texto e
links o menu nativo do navegador continua, para não atrapalhar quem quer copiar um e-mail.

### 5.2 Taskbar

Evolui de `Navbar.jsx` / `Navbar.css`; boa parte do CSS sobrevive.

```
[⊞] │ ▣ Sobre   ▣ Projetos   ▢ Terminal │ ☀ 🌐 ⏸ │ 📶 🔊 🔋 │ 14:32 │ ▏
 ↑        aberta    com foco   minimizada   toggles    tray falso  clock  mostrar
Iniciar                                      reais                        desktop
```

**Ancorada à esquerda**, não centralizada como hoje. Motivo: botões de janela aparecem e
desaparecem dinamicamente; num grupo centralizado cada janela nova empurra todos os outros
botões de lugar, movendo alvos de navegação sozinhos.

- Clicar no botão da janela com foco **minimiza** (comportamento Windows)
- `.show-desktop-line`, que já existe no canto direito, ganha função: minimiza todas
- Ícones falsos de Wifi/Volume/Bateria ficam — vendem a ilusão
- Toggles reais (tema, idioma, animação) continuam como atalho, além de existirem em Configurações
- `Clock` já está isolado em `React.memo` e continua assim

### 5.3 Menu Iniciar

Campo de busca no topo (vai para o Marcos Virtual), lista dos 9 apps, rodapé com "Visitante"
(o `visitor` que já existe em `startMenu.js` e hoje não é usado) e botão de energia.

**Easter egg:** desligar apaga a tela e mostra *"É seguro desligar o seu computador"* em laranja
sobre preto — a tela do Windows 9x — com um botão para ligar de novo.

### 5.4 Screensaver

90s sem interação → desktop escurece, cristal flutua com os `Sparkles`, relógio grande ao lado.
Qualquer tecla ou movimento dispensa. Com o toggle de animação desligado, o timer não é armado.
Desktop apenas.

---

## 6. Mobile

### 6.1 Mesmo estado, outro renderizador

| | Desktop | Mobile |
|---|---|---|
| `windows[]` é lido como | conjunto — todas visíveis | pilha — só a última visível |
| `open(appId)` | cria janela em cascata | empilha, desliza da direita |
| `focus(key)` | traz pro topo do z-index | move pro fim da pilha |
| `close(key)` | remove | *pop* |
| minimizar / maximizar | funciona | no-op |
| voltar | — | *pop*, ligado ao botão físico |

### 6.2 Home screen

Grade de 3 colunas, tiles de 60px, labels com sombra. Barra de status no topo (hora + ícones
falsos). Dock fixo com 4 atalhos: Marcos Virtual, Projetos, Sobre, Configurações.

Puxar a barra de status para baixo abre o painel de ajustes rápidos (tema, idioma, animação) —
metáfora de Central de Controle, e resolve onde pôr os toggles sem poluir o dock.

### 6.3 Navegação

Abrir app faz `pushState`, então o botão físico de voltar do Android e o gesto de swipe do iOS
funcionam. O listener de `popstate` escrito para os deep links do desktop atende os dois casos.

Projetos vira drill-down: lista → `/projetos/bussola-v2` → voltar.

### 6.4 Breakpoint único

Hoje existem **dois** breakpoints decidindo a mesma coisa, e três componentes replicando o mesmo
`useEffect` com listener de `resize`:

- `HomePage.jsx` → `isMobile = innerWidth < 768`
- `Navbar.jsx`, `Projects.jsx`, `Journey.jsx` → `isCompact = innerWidth < 1024`

Consolidar num hook `useDeviceMode()` com corte em **1024px**: acima é desktop-SO, abaixo é
mobile-SO. 1024 porque tablet em retrato não tem espaço para janelas flutuantes, e porque é o
valor que os componentes interativos já usavam. iPad em paisagem cai em desktop e consegue
arrastar por toque, já que o Framer Motion usa pointer events.

### 6.5 Ganho de performance capturado de brinde

`Profile.jsx` faz `import CrystalScene from './CrystalScene'` — import estático. O timer de 1,5s
adia a **montagem**, não o **download**: `three`, `@react-three/fiber` e `@react-three/drei`
estão no bundle principal hoje, e todo visitante de celular baixa isso sem nunca ver o cristal.

No redesign:

- `React.lazy` no `CrystalScene` → sai do bundle principal
- Mobile usa cristal em SVG/CSS no boot e no Sobre; o 3D real é desktop-only
- Screensaver é desktop-only

---

## 7. Estado

### 7.1 Shape

```js
{
  windows: [
    { key: 'about',                 // appId, ou `${appId}:${slug}` se dinâmico
      appId: 'about',
      params: null,                 // { slug } quando dinâmico
      x: 120, y: 80,
      z: 101,
      minimized: false,
      maximized: false,
      prevPos: null }               // {x, y} guardado ao maximizar
  ],
  zTop: 101,
  focusedKey: 'about',
}
```

`key` é `appId` para singletons e `appId:slug` para dinâmicos. Isso torna "já está aberto?" uma
busca por igualdade simples.

### 7.2 Ações

`OPEN` · `CLOSE` · `FOCUS` · `MINIMIZE` · `TOGGLE_MAXIMIZE` · `MOVE` · `MINIMIZE_ALL` · `CLOSE_ALL`

Regras que o reducer precisa garantir:

- `OPEN` de app já aberto **foca**, não duplica (vale para singleton e para dinâmico com o mesmo `key`)
- `OPEN` restaura janela minimizada
- `OPEN` de app com `parent` abre o pai primeiro se ele não estiver aberto
- `CLOSE` da janela focada passa o foco para a de maior `z` entre as não-minimizadas; se não
  houver nenhuma, `focusedKey` fica `null`
- `MINIMIZE` da janela focada passa o foco pela mesma regra
- `TOGGLE_MAXIMIZE` guarda `{x, y}` em `prevPos` ao maximizar e restaura ao desmaximizar
- Cascata: janela nova entra em `base + (24 * n) % 240`, onde `n` é a contagem de janelas abertas

**`MOVE` é despachado apenas no `onDragEnd`, nunca durante o arrasto.** Durante o gesto, os
motion values `x`/`y` do Framer Motion são a fonte da verdade e não causam re-render. Despachar a
cada `pointermove` re-renderizaria a árvore inteira de janelas a 60fps — é o erro de performance
mais fácil de cometer nesta arquitetura.

### 7.3 Rotas

A URL reflete a janela focada (desktop) ou o topo da pilha (mobile). Sem janela aberta, `/`.

```
/                      desktop limpo
/sobre                 Sobre este PC
/projetos              pasta Projetos
/projetos/bussola-v2   pasta + janela do projeto
/jornada               Histórico de Versões
/stack                 Gerenciador de Dispositivos
/contato               Terminal
/leia-me               leia-me.txt
/assistente            Marcos Virtual
/config                Configurações
```

---

## 8. Estrutura de arquivos

```
frontend/src/
├── App.jsx                        providers + boot + escolhe o shell
├── os/
│   ├── WindowManagerContext.jsx   reducer da seção 7
│   ├── registry.js                declaração dos 9 apps
│   ├── useDeviceMode.js           'desktop' | 'mobile' — corte único em 1024
│   ├── useUrlSync.js              pathname ⇄ appId + popstate
│   ├── desktop/                   Desktop · DesktopIcons · Window · Taskbar
│   │                              StartMenu · ContextMenu · ScreenSaver
│   ├── mobile/                    HomeScreen · MobileApp · Dock · QuickSettings
│   └── boot/                      BootScreen · ShutdownScreen
├── apps/
│   ├── AboutApp.jsx               (ex-Profile)
│   ├── ProjectsApp.jsx            (ex-Projects, vira pasta)
│   ├── ProjectDetailApp.jsx       (novo, janela por projeto)
│   ├── HistoryApp.jsx             (ex-Journey, vira lista vertical)
│   ├── DevicesApp.jsx             (ex-TechStack, vira árvore)
│   ├── TerminalApp.jsx            (ex-Contact + comandos)
│   ├── ReadmeApp.jsx              (ex-PortfolioMeta)
│   ├── AssistantApp.jsx           (ex-StartMenu, o chat)
│   └── SettingsApp.jsx            (novo)
├── wallpapers/                    Hills (novo, SVG) · Silk · Iridescence
├── components/                    CrystalScene (parametrizado, lazy)
│                                  CrystalSvg (novo) · DecryptedText (mantido)
├── contexts/                      LanguageContext (mantido) · ThemeContext (novo)
└── data/                          INTACTO + os.js (labels do SO)
```

`data/` não é tocado: todo o texto de projetos, jornada, stack e contato sobrevive byte a byte.

---

## 9. i18n

Títulos de janela, menu de contexto, texto do boot, comandos e saídas do terminal, labels de
Configurações e a tela de desligar são **texto novo**. Entram em `data/os.js` seguindo a mesma
convenção `getOsData(lang)` dos outros seis arquivos de dados — caso contrário a i18n do projeto
fica quebrada pela metade.

---

## 10. Acessibilidade

- Janela é `role="dialog"` com `aria-labelledby` apontando para o título, **não-modal** (várias
  abertas convivem, sem focus trap)
- Abrir move o foco para dentro da janela; `Esc` fecha a focada; fechar devolve o foco ao ícone
  que a abriu
- Janela fechada ou minimizada recebe `inert` — o mesmo mecanismo que mantém o conteúdo no DOM
  para indexação **também** impede que o Tab caia em janela invisível
- `prefers-reduced-motion` pula o boot, congela as nuvens e desarma o screensaver. Hoje o projeto
  não respeita isso em lugar nenhum
- Arrastar é enfeite: nenhuma funcionalidade depende de conseguir arrastar

---

## 11. O que sai

| Sai | Observação |
|---|---|
| `pages/HomePage.jsx` | estado de tema/animação migra para `ThemeContext` |
| `sections/Hero.jsx` | identidade vira a assinatura no wallpaper |
| `ui/Navbar.jsx` | vira `Taskbar`; boa parte do CSS sobrevive |
| `ConnectionArrow` (em `Journey.jsx`) | setas entre cards não fazem sentido em lista vertical |
| `ui/SplineScene.jsx` | já é código morto hoje — não é importado em lugar nenhum |
| `.mouse-light-overlay` | CSS morto — 2 declarações em `index.css`, zero uso em JSX |
| dep `lenis` | sem scroll de página não há o que suavizar (usado em `App.jsx` e `StartMenu.jsx`) |
| deps `@splinetool/react-spline`, `@splinetool/runtime` | só existiam para o `SplineScene` morto |
| CSS de seção | `Journey.css` 593 · `StartMenu.css` 560 · `Contact.css` 518 · `Projects.css` 445 · `Profile.css` 374 · `TechStack.css` 247 · `Hero.css` 164 · `PortfolioMeta.css` 91. Cada seção reimplementou card/vidro/borda; o chrome de janela centraliza isso |

Sobre a dep `framer-motion`: nenhum arquivo do projeto importa dela (tudo usa `motion/react`).
A dependência direta provavelmente pode sair, mas o pacote `motion` pode depender dela
internamente — **verificar com `npm ls framer-motion` antes de remover**, não remover às cegas.

---

## 12. Backend

Nenhuma alteração. LangGraph, nós do grafo, RAG, ChromaDB, rate limiter, prompts e streaming SSE
permanecem como estão. O `AssistantApp` fala o mesmo contrato `POST /api/chat` com
`{message, history, language}` e consome o mesmo stream de eventos `status` / `result` / `error`.
`CORS_ORIGINS` continua válido (mesmo domínio).

---

## 13. Riscos e mitigações

**1. Maximizar briga com o drag.** Framer Motion move por `transform: translate`; maximizar quer
`inset: 0`. Convivendo, a janela maximizada aparece deslocada.
→ Ao maximizar, guardar `x/y` em `prevPos`, zerar os motion values e aplicar classe `.maximized`;
ao restaurar, devolver os valores.

**2. Blur empilhado no iOS.** Janela com `backdrop-filter` sobre wallpaper sobre taskbar com
`backdrop-filter` degrada o Safari mobile.
→ Blur apenas no chrome da janela e na taskbar; nunca dentro do conteúdo. Testar em iPhone real.

**3. Janela arrastada para fora e perdida.**
→ `dragConstraints` na área do desktop com folga, garantindo que a barra de título nunca saia do
alcance do ponteiro.

**4. `canonical` fixo quebra com rotas.** `index.html` tem
`<link rel="canonical" href="https://marocos.dev/">` chumbado. Com rotas novas, toda URL passa a
declarar a raiz como canônica, atrapalhando ativamente a indexação.
→ Tornar dinâmico e listar as rotas em `public/sitemap.xml`.

**5. Deep link aninhado tem ordem.** `/projetos/bussola-v2` precisa abrir a pasta *e* a janela
filha, na ordem certa, já no primeiro render.
→ Resolver `parent` no registry antes de montar; cobrir com teste do reducer.

**6. Regressão de SEO por desmontagem.** Se janela fechada desmontar, o conteúdo sai do DOM.
→ Janela fechada é escondida com `hidden`/`inert`, não desmontada. Conteúdo de app é texto (poucos
KB); o que é lazy é apenas o WebGL decorativo.

---

## 14. Testes

O frontend hoje só tem `eslint`, sem infra de teste. Não se propõe suíte grande.

**Vitest, cobrindo duas coisas** — lógica pura, sem DOM, onde os bugs vão morar:

1. **Reducer do window manager:** minimizar a focada, fechar a do topo e verificar quem herda o
   foco, abrir a mesma app duas vezes, `OPEN` com `parent` não aberto, z-order após N cliques,
   `TOGGLE_MAXIMIZE` preservando `prevPos`, `MINIMIZE_ALL` e `CLOSE_ALL`.
2. **Parser de URL:** `pathname → {appId, params}` e o inverso, incluindo rota aninhada e rota
   desconhecida (deve cair em `/`).

**Checklist manual de QA** (não se testa em unidade): iPhone real (blur e scroll interno),
Firefox, navegação só por teclado, leitor de tela, `prefers-reduced-motion`, exatamente 1024px,
rotação de tela, e um teste de arrastar cada janela até cada borda.

---

## 15. Fases sugeridas

O escopo é grande (window manager + 2 shells + 9 apps + boot + screensaver). Sugestão de
faseamento para o plano de implementação, cada fase deixando a `main` em estado utilizável:

**Fase 1 — o sistema, sem conteúdo migrado.** Reducer + testes, registry, `useDeviceMode`,
`useUrlSync`, `<Window>` com drag/minimizar/maximizar, `<Desktop>`, `<Taskbar>`, wallpaper
Hills, escala de z-index, tokens. Valida com **um** app trivial (`ReadmeApp`, que é só texto).
Ao fim desta fase a metáfora já está de pé e testável.

**Fase 2 — migração de conteúdo.** Os 7 apps restantes, um por vez, na ordem: `AboutApp`,
`ProjectsApp` + `ProjectDetailApp` (valida instância dinâmica e `parent`), `DevicesApp`,
`HistoryApp`, `TerminalApp` (com os comandos), `AssistantApp` (o chat, maior risco por causa do
SSE), `SettingsApp`. `data/os.js` cresce junto.

**Fase 3 — shell mobile.** `HomeScreen`, `MobileApp`, `Dock`, `QuickSettings`, integração com
`popstate`/voltar físico, cristal SVG. Aqui é que se confirma se a premissa "mesmo estado, outro
renderizador" se sustenta — se não sustentar, é melhor descobrir com todos os apps já prontos.

**Fase 4 — cerimônia e limpeza.** Boot, screensaver, menu de contexto, easter egg de desligar,
`canonical` dinâmico, `sitemap.xml`, remoção das deps mortas, remoção do CSS de seção, QA manual
da checklist da seção 14.

## 16. Fora de escopo

Cortados por YAGNI, registrados para não voltarem como surpresa:

- Redimensionar janela por canto/borda
- Snap ao arrastar para a borda da tela
- Persistir posição e janelas abertas entre visitas (localStorage)
- Thumbnails de preview ao passar o mouse na taskbar (estilo Aero)
- Múltiplas áreas de trabalho / desktops virtuais
- Ícones arrastáveis no desktop (posição livre)
- Pré-renderização SSG — anotada como evolução se houver queda de ranking
- Qualquer alteração no backend
