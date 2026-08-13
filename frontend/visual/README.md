# Harness de testes do Marocos OS

Harness de teste permanente, isolado em `frontend/visual/` com `package.json`
próprio. Dois specs, dois tipos de regressão diferentes:

- **`visual.spec.js`** — fotografa 24 cenas fixas do Marocos OS e compara
  pixel a pixel com referências versionadas em `__screenshots__/`. Pega
  mudança de cor, espaçamento, layout — qualquer coisa que altere o frame
  final renderizado.
- **`rotas.spec.js`** — entra por deep link em cada uma das onze rotas do
  `os/registry.js` e em quatro comportamentos de carregamento sob demanda
  (Suspense/`React.lazy`), afirmando com `expect()` que a janela certa abriu,
  com título certo e CONTEÚDO real no corpo. Não tira screenshot nenhum.

**Por que os dois, e não um só:** desde que os onze apps e o `react-markdown`
do assistente passaram a ser carregados via `import()` dinâmico
(`React.lazy`), um `import('./caminho/errado')` **compila sem erro** — só
falha em runtime, quando alguém navega até aquele caminho. `npm run build`
não pega isso. E o regressor visual, sozinho, também não pega de forma
confiável: ele fotografa cenas, e uma janela cujo chunk não carregou aparece
como janela vazia — o que às vezes tem silhueta parecida o bastante com o
estado "carregando" legítimo para não divergir da referência o suficiente
para reprovar. `rotas.spec.js` é o que fecha esse buraco: ele afirma
CONTEÚDO real dentro do corpo do app (não só que um seletor existe), então um
`import()` que resolve para o módulo errado — ou nunca resolve — reprova de
forma explícita, com uma mensagem que aponta a rota exata.

Este pacote substitui um script solto (`.superpowers/sdd/.../captura/`) que
vivia fora de versionamento. As decisões difíceis daquele script — como
congelar o tempo, como classificar ruído de WebGL — foram preservadas aqui;
só a forma mudou, de dois scripts `.mjs` chamados à mão para um projeto
`@playwright/test` padrão do ecossistema. `rotas.spec.js` tem a mesma origem:
foi promovido de um roteiro Playwright avulso (`task-14-rotas.mjs`, escrito
durante o refactor que introduziu o `React.lazy` por app) que uma tarefa
POSTERIOR de reorganização de pastas reusou sem modificação — e ele pegou
exatamente os imports dinâmicos que a reorganização deixou apontando para o
caminho errado. Essa captura real foi o motivo para promovê-lo a harness
permanente em vez de descartá-lo.

## Por que um pacote isolado

`@playwright/test` baixa um navegador (Chromium, ~130 MB) no `postinstall`.
`frontend/package.json` tem o Vite como `devDependency`, e o build de deploy
não pode rodar com `--omit=dev` — então colocar o Playwright ali faria
**todo build de produção** arrastar esse navegador. Isolado em
`frontend/visual/package.json`, a árvore de dependências da aplicação
principal fica intocada; só quem for rodar o regressor visual paga o custo
do navegador.

## Como rodar

```powershell
cd frontend/visual
npm install                 # só na primeira vez (ou após trocar a versão do Playwright)
npm run build:frontend       # roda `npm run build` dentro de frontend/ — gera dist/
npm test                     # roda os DOIS specs: visual.spec.js e rotas.spec.js
```

`npm test` sobe `vite preview` sozinho (via a opção `webServer` do
`playwright.config.js`, compartilhada pelos dois specs) sobre o `dist/` mais
recente — por isso o passo de build é manual e separado: os dois specs
exercitam o que está em `dist/`, não o que está em `src/`. Se você mudou
código e não rebuildou, `visual.spec.js` compara contra uma versão velha do
site e `rotas.spec.js` pode passar mesmo com um `import()` quebrado no `src/`
atual — o chunk errado do build anterior ainda está lá.

Para rodar só um dos specs (útil ao iterar):

```powershell
npx playwright test visual.spec.js
npx playwright test rotas.spec.js
```

Outros comandos úteis:

```powershell
npm run test:update    # atualiza as referências visuais (ver seção própria abaixo) — não afeta rotas.spec.js, que não tem snapshot
npm run report         # abre o último relatório HTML (screenshots de diff do visual, e a mensagem/stack de qualquer falha do rotas.spec.js — trace e vídeo ficam `off` globalmente, ver playwright.config.js)
```

## Regressor visual (`visual.spec.js`)

Fotografa 24 cenas fixas do Marocos OS e compara pixel a pixel com
referências versionadas em `__screenshots__/`.

### As quatro coisas que mudam sozinhas, e como cada uma foi congelada

O difícil não é fotografar, é congelar. Quatro fontes de não-determinismo
existem neste projeto e destruiriam qualquer comparação sem tratamento:

#### 1. Shader do wallpaper e cristal 3D

O wallpaper é um shader animado (Silk no tema escuro, Iridescence no claro) e
a janela "Sobre este PC" carrega um cristal 3D que gira e flutua. Os dois são
desligados pelo controle de animação do próprio sistema:
`localStorage.isAnimationEnabled = 'false'`, escrito via `context.addInitScript()`
**antes do primeiro render** (não dá para desligar depois — os componentes
leem o valor na montagem). Com a animação desligada, o Silk para de invalidar
o canvas e o cristal cai em `frameloop="demand"`: os dois desenham UM frame e
dormem, o que é reprodutível.

> **Isto foi uma promessa não cumprida durante um bom tempo.** O `AboutApp`
> passava `animated` FIXO para o `<Crystal>`, então o cristal daquela janela
> girava mesmo com `isAnimationEnabled = false` — e as cenas com ele
> (`sobre-*`, `menu-iniciar-*`, `bloqueio-*`) nunca foram reprodutíveis de
> verdade. Corrigido; o cristal agora respeita o interruptor E o
> `prefers-reduced-motion`, este último por acessibilidade antes de tudo.

#### 2. Os relógios (taskbar e tela de bloqueio)

`page.clock.setFixedTime()` **antes de navegar**, não uma máscara.

Uma versão anterior deste harness mascarava as regiões de relógio, e quebrou
na virada do dia: a data mudou de "10/08" para "11/08", os glifos mudaram de
largura (o Poppins não tem algarismos tabulares), e como a caixa do relógio
dimensiona pelo próprio conteúdo (`display: flex`, sem largura fixa), ela
mudou de tamanho — a máscara, derivada daquela caixa, deslocou junto e vazou
uma fresta. Dez das 21 cenas acusaram diferença de uma vez, sem nenhuma
mudança real de código.

Máscara resolve "esta região é imprevisível"; não resolve "esta região MUDA
DE TAMANHO", porque a própria máscara deriva da caixa do elemento. Congelar o
relógio ataca a causa: com o `Date` do navegador fixo, os três relógios
exibem sempre o mesmo texto, a caixa nunca muda de tamanho, e a máscara deixa
de ser necessária — a cobertura aumenta em vez de diminuir.

#### 3. Preferência de movimento

`reducedMotion: 'reduce'` no contexto do Playwright (equivalente a
`prefers-reduced-motion: reduce`), somado a `locale: 'pt-BR'`,
`timezoneId: 'America/Sao_Paulo'` e `deviceScaleFactor: 1` — tudo fixo em
`playwright.config.js`, comum a todas as cenas.

**Isto reduz mas não elimina animação.** Várias transições do sistema (o
fade de abertura de janela, o stagger de entrada dos ícones do desktop, o
push de navegação no mobile) são feitas com a lib `motion`, não com
CSS puro — e não checam `useReducedMotion()` em todo lugar. A opção
`animations: 'disabled'` do Playwright (usada em todo `toHaveScreenshot()`
deste harness) força essas animações a terminar antes da captura, então na
prática elas não introduziram instabilidade nos testes. Mas isso é uma
garantia do Playwright sobre Web Animations, não do app — vale saber que ela
existe e por que este harness depende dela.

#### 4. O paralelismo do próprio harness

**Esta foi a mais cara de encontrar, porque não está no app.**

A suíte reprovava de forma intermitente com *"failed to take two consecutive
stable screenshots"*, em cenas SEMPRE DIFERENTES a cada execução. Duas
investigações acusaram o app: primeiro o `ruido` do shader Silk, depois o giro
do cristal. A segunda rendeu duas correções de produto legítimas (ver o aviso
no item 1), mas nenhuma das duas era a causa.

Quem desmontou as hipóteses foi uma cena: **`mobile-home-claro` falhava, e ela
não tem shader, nem cristal, nem janela** — no tema claro o fundo da home
mobile é gradiente CSS puro. Quando o sintoma aparece onde a causa suspeita não
existe, a causa é outra.

Era `workers: 4`. Aqui não existe GPU — é SwiftShader, rasterização por
software na CPU. Quatro Chromium com contexto WebGL ao mesmo tempo faziam os
quadros chegarem atrasados, e a página não assentava dentro do tempo que o
Playwright dá.

Medido no mesmo commit, sem mudar mais nada:

| workers | resultado |
|---|---|
| 4 | 6 a 7 cenas reprovando por instabilidade, variando a cada execução |
| 1 | 37 de 38 passando, e a única falha é diferença de pixel real |

Hoje é `workers: 1`. A suíte demora ~4,3 min em vez de ~1,8 — e vale, porque um
regressor que reprova sozinho ensina a ignorar o vermelho.

**Corolário prático:** não rode build, dev server ou outra coisa pesada na
máquina enquanto a suíte roda. A disputa é pela mesma CPU.

#### A quinta coisa que não é "tempo", mas parecia

Durante a montagem deste harness, três cenas de app (`contato`, `stack`,
`projeto-detalhe`) falharam de forma intermitente: a captura às vezes pegava
a janela do app **vazia**, sem ícones do desktop, sem nada — um frame de
carregamento genuíno, não ruído de pixel.

Causa: toda janela de app é `<Suspense fallback={null}>` em volta de um
`React.lazy()`. Em produção isso é seguro porque o sistema pré-carrega os
chunks em `requestIdleCallback` enquanto o visitante ainda está olhando a
tela de bloqueio — mas este harness anda pelo fluxo rápido demais para
garantir que esse prefetch já terminou, e um `waitForTimeout` fixo apostava
em vencer essa corrida.

O mesmo aconteceu com as cenas `wallpaper-escuro`/`wallpaper-claro`: elas
deveriam mostrar o wallpaper sozinho, mas `BoasVindas.jsx` abre a janela
"Sobre este PC" automaticamente (também via `requestIdleCallback`) sempre que
a rota é `/` e nenhuma janela está aberta ainda — exatamente o caso dessas
duas cenas.

A correção, nos dois casos, foi a mesma lição do relógio: **atacar a causa,
não cronometrá-la**. Em vez de um sleep maior (aposta em timing melhor, mas
ainda timing), `visual.spec.js` espera por um seletor que só existe quando o
conteúdo real está montado (`.marocos-window-body *`, ou o equivalente
mobile), e para as duas cenas de wallpaper puro, espera a janela automática
abrir de verdade e a **fecha** antes de fotografar — em vez de torcer para
fotografar antes dela abrir. Ver os comentários em `visual.spec.js` e
`cenas.js` (campo `fecharJanelaAutomatica`).

### Tolerância de cor por pixel: zero (e por que isso importa mais que o limiar)

`playwright.config.js` fixa `expect: { toHaveScreenshot: { threshold: 0 } }`.

Sem isso vale o default do pixelmatch, **`threshold: 0.2`** — e ele não é uma
folga de quantidade, é uma folga de **cor, por pixel**, aplicada ANTES de o
pixel ser contado. Um pixel que muda pouco nunca entra na conta, e o
`maxDiffPixels` da cena nem chega a vê-lo. Na prática, as cenas "de piso zero"
toleravam um número **ilimitado** de pixels mudando, desde que cada mudança
fosse sutil — que é exatamente a regressão que este projeto tem de mais
provável: um pixel diferente de especificidade de CSS numa cor herdada (foi um
bug real, pego por este harness durante o refactor que o originou).

Com `threshold: 0`, qualquer diferença de cor conta, e quem decide o que passa
é só o `maxDiffPixels` da cena. **Tolerância zero passou a significar zero.**

### Limiar por cena, medido — não chutado

A receita é: rodar a captura **duas vezes sobre o mesmo commit**, sem mudar
nada, e tomar o pior caso observado com folga de 2×.

Os números atuais foram **re-medidos sob `threshold: 0`**. Os anteriores tinham
sido medidos sob 0.2, onde a maior parte da variação de rasterização nem
chegava a ser contada — a base mudou, então os valores velhos deixaram de
significar o que diziam. Re-medir era obrigatório; subir o número até a suíte
calar teria sido a outra coisa.

Diferença entre capturas consecutivas da mesma página, nas duas execuções:

| Cena | execução 1 | execução 2 |
|---|---|---|
| `sobre-escuro` | 9123 / 8042 | 9022 / 9199 |
| `sobre-claro` | 8918 / 8123 | 8611 / 8247 |
| `bloqueio` | 12809 / 13273 | 13334 / 14781 |
| `bloqueio-claro` | 12292 / 13123 | 12017 / **15091** |
| `menu-iniciar` | 9125 / 8868 | 9070 / 9018 |
| `menu-iniciar-claro` | 8372 / 7979 | 8972 / 9824 |
| **as outras 15 cenas** | **0** | **0** |

Pior caso 15.091 px; 2× isso é 30.182. O valor adotado é **`0,024` da área do
viewport** (31.104 px em 1440×900).

#### O ruído é do cristal 3D, não de "ter WebGL"

Aquela coluna de zeros é o achado da re-medição. Cenas com o **wallpaper por
shader** visível (`wallpaper-escuro`, `wallpaper-claro`, `mobile-home`,
`mobile-sobre`) repetem **pixel a pixel**, iguais às cenas de puro DOM. Quem
não repete são as seis cenas que montam o **cristal 3D** (three/R3F).

Por isso a classificação em `cenas.js` chama-se **`cristal3d`**, e não `webgl`
como antes: sob a classificação larga, as quatro cenas de wallpaper ganhavam
2% de folga de graça — inclusive `wallpaper-escuro`, que é a cena mais
importante do conjunto. Hoje **6 cenas** pagam tolerância e **15** ficam em
zero de verdade.

A classificação vive **na própria cena**, não numa lista separada por nome — a
versão anterior deste harness guardava isso num `Set` de nomes num arquivo
diferente, e uma cena nova (`menu-iniciar`) foi adicionada às cenas mas
esquecida no `Set`, transformando ruído legítimo do cristal em alarme falso.
Colocar o campo ao lado da cena elimina essa classe de erro.

#### O limiar é fração de área, não número absoluto

O valor antigo era um `3000` fixo, justificado no texto como "~0,23% de uma
tela de 1440×900" — mas aplicado igual às cenas mobile de 390×844, onde os
mesmos 3000 px valem **0,91%**: quatro vezes mais frouxo do que o texto
declarava. Guardando a **fração** e multiplicando pela área do viewport da
cena, o número declarado e o aplicado voltam a ser o mesmo em qualquer
viewport, sem ninguém precisar lembrar de converter.

#### Como refazer a medição

```powershell
$env:MEDIR_RUIDO=1; npx playwright test visual.spec.js; Remove-Item Env:MEDIR_RUIDO
```

Isso tira **toda** tolerância e faz cada cena reprovar dizendo quantos pixels
variaram. É necessário porque, quando uma cena passa, o Playwright não reporta
o diff em lugar nenhum — sem esse modo não há o que medir, só o que chutar.
Rode duas vezes, tome o pior caso, multiplique por 2, divida pela área do
viewport.

### Tabela de cenas

| Cena | Rota | Tema | Viewport | Passo extra | Limiar | Por quê |
|---|---|---|---|---|---|---|
| `wallpaper-escuro` | `/` | dark | 1440×900 | fecha a janela "Sobre" que abre sozinha | 0 px | shader repete pixel a pixel (medido) |
| `wallpaper-claro` | `/` | light | 1440×900 | idem | 0 px | idem |
| `sobre-escuro` | `/sobre` | dark | 1440×900 | — | 31.104 px | cristal 3D na janela |
| `sobre-claro` | `/sobre` | light | 1440×900 | — | 31.104 px | idem |
| `projetos` | `/projetos` | dark | 1440×900 | — | 0 px | só DOM |
| `projeto-detalhe` | `/projetos/bussola-v2` | dark | 1440×900 | — | 0 px | só DOM |
| `jornada` | `/jornada` | dark | 1440×900 | — | 0 px | só DOM |
| `stack` | `/stack` | dark | 1440×900 | — | 0 px | só DOM |
| `contato` | `/contato` | dark | 1440×900 | — | 0 px | só DOM |
| `assistente` | `/assistente` | dark | 1440×900 | `/chat/status` mockado | 0 px | só DOM |
| `leia-me` | `/leia-me` | dark | 1440×900 | — | 0 px | só DOM |
| `config` | `/config` | dark | 1440×900 | — | 0 px | só DOM |
| `stack-claro` | `/stack` | light | 1440×900 | — | 0 px | tipografia densa, tema claro |
| `jornada-claro` | `/jornada` | light | 1440×900 | — | 0 px | tipografia densa, tema claro |
| `bloqueio` | `/` | dark | 1440×900 | fica na tela de bloqueio | 31.104 px | cristal visível atrás da cortina |
| `bloqueio-claro` | `/` | light | 1440×900 | idem | 31.104 px | idem |
| `mobile-home` | `/` | dark | 390×844 | viewport mobile | 0 px | shader, mas sem cristal (medido em 0) |
| `mobile-sobre` | `/sobre` | dark | 390×844 | viewport mobile | 0 px | o AboutApp não monta o cristal no mobile |
| `mobile-home-claro` | `/` | light | 390×844 | viewport mobile | 0 px | home claro no mobile é gradiente CSS, sem WebGL |
| `menu-iniciar-claro` | `/` | light | 1440×900 | abre o menu Iniciar | 31.104 px | janela "Sobre" (cristal) aberta por baixo |
| `menu-iniciar` | `/` | dark | 1440×900 | idem | 31.104 px | idem |

**6 cenas** com `cristal3d: true` (0,024 da área do viewport = 31.104 px em
1440×900), **15 cenas** com tolerância zero — e agora zero de verdade, porque
`threshold: 0` tirou a folga de cor por pixel que existia por baixo.

### A cena `assistente` não fala com produção

`AssistantApp.jsx` busca `/chat/status` na montagem e só desenha o rodapé de
cota se a API responder — e o texto dele é a **cota diária global do projeto**,
que sobe a cada conversa de qualquer visitante. Uma cena de tolerância zero não
pode ter isso dentro do quadro: ou a API está fora e o rodapé não existe (era o
caso da referência antiga, capturada sem ele), ou está no ar e o número muda
com o movimento do dia.

`visual.spec.js` mocka o endpoint, reusando o **mesmo handler** que
`rotas.spec.js` já usava — extraído para `mocks.js`, porque duas cópias quase
iguais divergiriam no primeiro ajuste (o preflight CORS e o formato do SSE são
exatamente o tipo de detalhe que se corrige num arquivo e se esquece no outro).
O mock é aplicado a **todas** as cenas, não só à do assistente: é o mesmo
raciocínio do campo `cristal3d` viver dentro de `cenas.js` — classificação que
alguém precisa lembrar de marcar é classificação que uma cena nova vai
esquecer. O handler não casa com nenhuma outra rota nem asset do build.

A referência de `assistente` foi regenerada uma vez por causa disso: ela agora
inclui o rodapé com `1/100`, fixo. A cobertura **aumentou** — o rodapé passou a
ser fotografado, em vez de depender de a API estar fora do ar.

### Desktop e mobile: opção por cena, não dois `projects`

O viewport (1440×900 desktop, 390×844 mobile) é a **única** coisa que varia
por cena — locale, timezone, `reducedMotion` e `deviceScaleFactor` são
comuns a todas e vivem uma vez em `playwright.config.js`. `visual.spec.js`
aplica o viewport certo por cena com `test.use({ viewport })` dentro de um
`test.describe` por cena.

A alternativa seria modelar desktop e mobile como dois `projects`. Não foi
essa a escolha: um `project` inteiro rodaria a suíte **duas vezes** (uma por
project) e exigiria filtrar qual cena pertence a qual project via
`testMatch`/`grep` — mais um lugar onde uma cena nova pode ser esquecida,
exatamente a mesma classe de bug que o campo `cristal3d` em `cenas.js` já
corrigiu uma vez (ver acima). Uma opção por cena, ao lado dos outros campos
da própria cena, é onde uma cena nova naturalmente já teria que declarar seu
viewport de qualquer forma.

### O que o regressor visual NÃO cobre

**Isto é o limite mais importante do método, não uma escolha de limiar.**

A animação é desligada **antes do primeiro render** (`isAnimationEnabled`
gravado via `addInitScript`), então o `uTime` dos shaders é **sempre 0** em
toda cena, em toda execução. A captura compara geometria, cor e layout com
precisão — e é **estruturalmente cega** a qualquer coisa que dependa de
tempo:

- duração de uma transição;
- velocidade de uma animação;
- o salto visual ao despausar o wallpaper ou o cristal;
- qualquer regressão de performance que não mude o frame final, só o tempo
  para chegar nele.

Uma suíte verde **não autoriza concluir "nada mudou"** — autoriza
**"nada mudou no que é fotografado"**. O que depende de tempo se verifica
lendo o código, não olhando este harness passar.

Também fora do alcance:

- estados de `:hover`, `:focus-visible`, `:active`;
- navegação por teclado;
- qualquer coisa que só exista sob interação contínua (arrastar uma janela
  em movimento, por exemplo — a POSIÇÃO final de uma janela arrastada é
  fotografável; o gesto de arrastar não é);
- **um `import()` dinâmico que resolve para o módulo errado ou nunca
  resolve.** Uma janela cujo chunk falhou aparece como janela vazia — o que
  às vezes tem silhueta parecida o bastante com o estado "carregando"
  legítimo para não divergir da referência o suficiente para reprovar. Este
  é justamente o buraco que `rotas.spec.js` fecha (ver seção própria abaixo)
  — ele afirma CONTEÚDO real dentro do corpo do app, não só a existência de
  um seletor, então essa classe de bug reprova lá de forma explícita.

### Atualizando as referências

```powershell
npm run test:update
```

Isto sobrescreve `__screenshots__/*.png` com o que o navegador captura agora,
e commit o novo PNG é o que promove a mudança a "esperado".

**Quando é legítimo:** depois de uma mudança visual **intencional e
conferida** — você mudou uma cor, um espaçamento, o layout de um app, olhou o
resultado (visualmente, ou pelo relatório HTML: `npm run report`) e confirma
que é o que queria.

**Quando NÃO é legítimo:** para calar uma falha que você não entendeu. Se
uma cena está divergindo e a razão não está clara, o `--update-snapshots`
não é um jeito de "resolver" isso — é um jeito de committar a regressão como
se fosse a referência nova. Investigue a causa (este README documentou duas
já encontradas: relógio não congelado, e conteúdo fotografado antes de
carregar) antes de atualizar.

### Validação de determinismo

Antes de considerar as referências prontas, a suíte foi rodada três vezes
consecutivas sobre o mesmo commit, sem tocar em nada entre as execuções:
**21 de 21 cenas passaram nas três vezes**, sem exceção e sem precisar subir
nenhum limiar depois de gerado.

Isso não aconteceu de primeira — duas classes de instabilidade real foram
encontradas e corrigidas durante a montagem deste harness (documentadas nas
seções acima): captura antes do conteúdo lazy-loaded montar, e paralelismo
alto demais derrubando o Chromium (WebGL disputando GPU entre vários
workers simultâneos — por isso `workers: 4` em vez do padrão, que usa um
worker por núcleo). As duas foram resolvidas atacando a causa, não subindo
limiar nem aumentando um sleep cego.

## Verificação funcional das rotas (`rotas.spec.js`)

Entra por deep link em cada uma das onze rotas do registry (`os/registry.js`)
e afirma, com Chromium real, que a janela certa abriu, com o título certo na
taskbar e CONTEÚDO real no corpo — prova de que o chunk lazy resolveu e o
`Suspense` entregou algo de verdade, não só que a casca da janela montou
vazia. Não tira nenhum screenshot; não depende de `__screenshots__/`; não
tem conceito de "atualizar referência".

Promovido de um roteiro Playwright avulso escrito durante o próprio refactor
que introduziu o `React.lazy` por app
(`.superpowers/sdd/2026-08-10-refatoracao-frontend/task-14-rotas.mjs`). Uma
tarefa posterior de reorganização de pastas reusou aquele roteiro **sem
modificação** e ele pegou exatamente os imports dinâmicos que a
reorganização deixou apontando para o caminho errado — a prova de que este
teste vale a pena manter permanente, não descartar depois da tarefa que o
motivou.

### O que cada teste prova

**As onze rotas** (`test.describe('deep link nas onze rotas')`), uma por
`/sobre`, `/projetos`, `/projetos/bussola-v2`, `/contato`, `/assistente`,
`/config`, `/leia-me`, `/jornada`, `/stack` e `/servicos`: para cada uma,

- o corpo do app (`.about-app`, `.projects-app-list`, etc.) fica visível e
  **não vazio** — o teste lê o conteúdo, não só a existência do seletor;
- o botão em foco na taskbar mostra o título certo
  (`.taskbar-window-btn.active .taskbar-window-label`);
- para a rota dinâmica (`/projetos/bussola-v2`), a janela PAI (`projects`,
  via `.projects-app-list`) está montada atrás **sem nenhum clique** — só o
  reducer decidindo a partir da URL no primeiro render;
- nenhum `pageerror` foi disparado durante a navegação.

**Voltar/avançar do navegador**: abre `/leia-me`, navega para `/jornada`
(empurra no histórico), confirma o foco na taskbar, e então `goBack()` /
`goForward()` devem trocar o foco entre as duas janelas já abertas — sem
recarregar a página, via o listener de `popstate` do
`WindowManagerContext`.

**Abertura por clique no ícone da área de trabalho**: o caminho "clique"
usa um mecanismo diferente do deep link (o reducer decide a partir de um
`onClick`, não da URL na montagem) — clicar no ícone "Meus Projetos" abre a
janela e a foca.

**Fallback nulo sob rede lenta**: atrasa artificialmente o chunk do
`HistoryApp` (`page.route('**/assets/HistoryApp-*.js', ...)`, 8s) e confirma
que, enquanto o chunk não chega, a barra de título já existe com o título
certo e o corpo (`.marocos-window-body`) tem **zero filhos** — chrome
intacto, nunca um erro de página, nunca uma janela ausente. Quando o chunk
enfim resolve, o conteúdo aparece.

**React-markdown só sob demanda**: mocka os dois endpoints do backend
(`/chat/status` e `/chat`, incluindo o preflight CORS) via `mocks.js` — o mesmo
handler que `visual.spec.js` usa, e não depende do FastAPI estar no ar. No
estado vazio do assistente, **zero**
requisição ao chunk `AssistantMarkdown-*`; depois de clicar numa sugestão e
receber a resposta mockada, a bolha renderiza markdown de verdade (negrito,
link com `target="_blank"`) e o chunk **é** requisitado.

### O que `rotas.spec.js` NÃO cobre

Não é um substituto do regressor visual — os dois têm buracos diferentes:

- nenhuma regressão de CSS/layout/cor é pega aqui (isso é trabalho do
  `visual.spec.js`);
- não testa viewport mobile (as onze rotas e os quatro comportamentos só
  foram exercitados em desktop);
- não testa idioma inglês (os títulos afirmados são os em PT-BR);
- a suíte inteira roda contra o `dist/` do último `npm run build:frontend`
  — os mesmos avisos de "build desatualizado" do regressor visual valem
  aqui.
