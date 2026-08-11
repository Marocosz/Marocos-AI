# Explorador de janelas: chrome de navegação e localização mutável

**Data:** 2026-08-11
**Branch:** `feat/windowsmorphism`
**Escopo:** o gerenciador de janelas, o chrome da janela do desktop e seis dos
nove apps. O shell mobile não recebe o chrome, mas é afetado pela mudança de
identidade de janela.

---

## 1. O que foi pedido

Janela com chrome de explorador de arquivos: elementos nos cantos por dentro,
lateral com links e cabeçalho. **Clicar num link da lateral troca o conteúdo da
janela atual** — diferente de clicar no atalho da área de trabalho, que abre
janela nova. Janelas abrem um pouco maiores para acomodar o chrome.

Decidido com o dono do projeto:

| pergunta | decisão |
|---|---|
| é componente? | **sim** — precedente do `AppIconButton` |
| Terminal e Marcos Virtual | **fora** — "esses são diferentes" |
| Configurações | **fora**, junto dos outros dois |
| clicar num projeto na lista | **navega na mesma janela** |
| voltar/avançar por janela | **não** — só breadcrumb e subir |
| mobile | **só desktop** |

---

## 2. O problema difícil: identidade × localização

`windowManager.js:44`:

```js
export function makeKey(appId, params) {
  if (params && params.slug) return `${appId}:${params.slug}`
  return appId          // singleton: a chave É o appId
}
```

**A janela é o app.** Enquanto trocar de conteúdo só acontece abrindo outra
janela, isso funciona e é elegante — "já está aberto?" é comparação de string.
Navegação interna quebra a premissa: a janela precisa de identidade estável
(para o React não remontar a subárvore, para o z-order e o foco não se
perderem, para o botão da taskbar não trocar de dono) e de uma localização que
muda.

```js
// hoje
{ key: 'projects', appId: 'projects', params: null, x, y, z, … }

// depois
{ key: 'w3',       appId: 'projects', params: null, x, y, z, … }
//     ^ instância         ^ localização ATUAL, mutável
```

`initialState` ganha `proximaChave: 1`, e `OPEN` consome o contador. Contador,
não aleatório nem timestamp: o reducer é puro e testado por igualdade de
estado, e `w1`/`w2` são determinísticos.

### 2.1 `makeKey` deixa de ser identidade e passa a ser localização

A função não morre — a comparação `appId:slug` continua sendo exatamente o que
responde "esta janela está mostrando aquilo?". Ela só muda de papel: era chave,
passa a ser **assinatura de localização**, e é renomeada para dizer isso
(`assinaturaLocal`). A deduplicação de `OPEN` passa a comparar assinatura em vez
de chave.

### 2.2 Ação nova: `NAVIGATE`

```js
case 'NAVIGATE': { key, appId, params }
```

Troca `appId`/`params` da janela indicada, preserva `x`, `y`, `z`, `maximized`,
`prevPos`, e **levanta o foco** (navegar é sempre consequência de um clique).
Precisa respeitar o contrato de identidade do arquivo: devolve o mesmo objeto
para as janelas não afetadas, senão o `React.memo` de `Window.jsx` para de
valer — e isso não quebra teste nenhum, só custo de render, como o comentário
de lá avisa.

Duas janelas podem acabar na mesma localização (uma navegou para onde a outra
já estava). **Permitido de propósito:** um explorador de verdade deixa duas
janelas abertas na mesma pasta, e proibir exigiria uma regra de fusão que não
tem resposta óbvia (qual das duas ganha a posição?).

---

## 3. O voltar do navegador — e o teste que ele não pode quebrar

Sem histórico por janela, **o voltar do navegador é o voltar**. E aqui há um
contrato já testado que precisa sobreviver.

`rotas.spec.js:148`, "voltar/avançar do navegador troca o foco entre janelas já
abertas": com `/leia-me` e `/jornada` abertos, voltar **muda o foco** de um para
o outro. Não navega nada. Esse é o comportamento de hoje e é bom.

Mas o listener de popstate dispara `OPEN`, e com localização mutável isso
azeda: janela em `/projetos` → clica num projeto (navega para
`/projetos/rag-api`) → voltar → `OPEN projects` não encontra nenhuma janela
*cuja localização atual* seja `projects`, e abre uma segunda. Duas janelas, a
original presa no detalhe.

**Regra do popstate, em três degraus:**

1. Alguma janela já está na localização de destino → **foca** ela.
   *(É o degrau que preserva `rotas.spec.js:148`.)*
2. Senão, se a janela com foco é de explorador e o destino também → **navega**
   ela.
3. Senão → **abre** janela nova.

O degrau 2 é o único novo, e ele fica **só no popstate** — não em `OPEN`. Se
entrasse em `OPEN`, clicar em "Jornada" na área de trabalho com uma janela de
projetos em foco navegaria aquela janela em vez de abrir outra, que é
exatamente o contrário do que foi pedido.

Três portas, três comportamentos:

| gesto | ação |
|---|---|
| ícone da área de trabalho, menu Iniciar, dock, comando do terminal | `OPEN` — dedup por localização, senão janela nova |
| link da lateral, breadcrumb, card de projeto | `NAVIGATE` — troca no lugar |
| voltar/avançar do navegador | os três degraus acima |

---

## 4. `parent` fica obsoleto, e sai

O campo existe para um caso só: `project` declara `parent: 'projects'`, e o
reducer abre a pasta atrás do detalhe num deep link. Com navegação interna o
detalhe **é** a janela da pasta em outra localização, e o breadcrumb dá o
caminho de volta — não há pai para montar.

Sai o campo do registry, sai o branch de recursão do reducer, saem os testes
dele. Manter um caminho inalcançável pelo app mas coberto por teste é a pior
das três opções: parece vivo e não é.

**Dois testes mudam de asserção, de propósito:**

- `rotas.spec.js:139-141` afirma `paiSeletor` com `toHaveCount(1)` — a pasta
  montada atrás do detalhe. Passa a afirmar **uma** janela e um breadcrumb com o
  caminho para `/projetos`.
- os testes de recursão de `parent` em `windowManager.test.js` saem junto com o
  branch.

---

## 5. O chrome

`os/desktop/ExplorerChrome.jsx` + `.css`. Em `os/desktop/` e não em `ui/`
porque a decisão de mobile foi "só desktop"; se um dia o mobile ganhar versão,
ele sobe para `ui/` com variantes, como o `AppIconButton`.

Os apps seguem **agnósticos de container**, como o cabeçalho de `registry.js`
já promete: quem envolve é `Window.jsx`, lendo uma flag nova.

```
┌──────────────────────────────────────────────────────┐
│ ▣ Meus Projetos                          – □ ✕      │  titlebar (existe)
├──────────────────────────────────────────────────────┤
│ ← ↑ │ marocos.dev / projetos            [ buscar ]  │  cantos de cima
├────────────┬─────────────────────────────────────────┤
│ ACESSO     │                                         │
│ RÁPIDO     │                                         │
│  Sobre     │         conteúdo do app                 │
│  Projetos  │                                         │
│  Jornada   │                                         │
│  Stack     │                                         │
│  leia-me   │                                         │
├────────────┴─────────────────────────────────────────┤
│ 6 itens                          /projetos           │  cantos de baixo
└──────────────────────────────────────────────────────┘
```

Os "elementos nos cantos" pedidos: subir + breadcrumb em cima à esquerda, busca
em cima à direita, contagem embaixo à esquerda, rota embaixo à direita.

O `←` é **subir um nível**, não histórico — a decisão foi breadcrumb e subir. Em
`/projetos/rag-api` ele leva a `/projetos`; na raiz de um app ele fica
desabilitado.

### 5.1 Tipografia, pelas duas vozes da skill

| elemento | voz | forma |
|---|---|---|
| `ACESSO RÁPIDO` | máquina | mono, caixa alta, letter-spacing, 0,66rem |
| breadcrumb | máquina | mono, 0,72rem — é um caminho |
| barra de status | máquina | mono, 0,68rem |
| links da lateral | interface | Poppins, 0,85rem |
| campo de busca | interface | Poppins, 0,8rem |

Os links da lateral são Poppins pelo mesmo motivo que
`.start-menu-apps-heading` é: menu de navegação é interface, não ficha técnica.
A barra de status e o breadcrumb são a máquina relatando onde ela está.

### 5.2 Sem cor nova, sem receita de vidro nova

Superfície da lateral e das barras: `--card-bg` + `--card-border`, que é o que a
skill manda usar para superfície de conteúdo. Acento do item ativo:
`--accent-color`. Raio de qualquer coisa clicável:
`--win-control-radius`.

### 5.3 Quem recebe

| app | explorer | por quê |
|---|---|---|
| about, projects, project, history, devices, readme | **sim** | são lugares por onde se navega |
| terminal, assistant | não | decisão do dono: "esses são diferentes" |
| settings | não | painel de preferências, e três controles não sustentam uma lateral |

### 5.4 Tamanhos

Lateral 168px + barra de navegação 36px + barra de status 26px.

| app | antes | depois |
|---|---|---|
| about | 620×520 | 788×582 |
| projects | 640×440 | 808×502 |
| project | 560×500 | 728×562 |
| history | 700×520 | 868×582 |
| devices | 620×520 | 788×582 |
| readme | 520×400 | 688×462 |

Terminal (680×440), assistant (460×620) e settings (520×440) não mudam.

A mais larga fica em 868px. Com a margem de 16px de `JANELAS.margem` dos dois
lados isso pede 900px, que cabe no breakpoint de 1024px do desktop.

---

## 6. Arquivos

| arquivo | mudança |
|---|---|
| `os/windowManager.js` | chave de instância, `assinaturaLocal`, `NAVIGATE`, remoção de `parent` |
| `os/windowManager.test.js` | 28 testes revisados; os de `parent` saem |
| `os/WindowManagerContext.jsx` | ação `navigate`, os três degraus do popstate, `deriveInitial` sem `parent` |
| `os/registry.js` | flag `explorer`, tamanhos novos, `parent` fora |
| `os/desktop/ExplorerChrome.jsx` `.css` | novos |
| `os/desktop/Window.jsx` | envolve o app quando `app.explorer` |
| `apps/ProjectsApp.jsx` | card chama `navigate`, não `open` |
| `i18n/os.js` | `explorer.*` nos dois idiomas |
| `visual/rotas.spec.js` | asserção do deep link dinâmico |

---

## 7. Verificação

1. `npm test` em `frontend/` — o reducer é o arquivo mais testado do projeto, e
   é o que mais muda. Nenhum teste pode ser afrouxado para passar: se um cai, ou
   a mudança está errada ou a asserção descreve o comportamento antigo, e nos
   dois casos a decisão é consciente e registrada aqui.
2. `rotas.spec.js` — 13 testes. É o único guarda contra `import()` quebrado, e
   dois dos comportamentos que ele descreve mudam nesta entrega.
3. Suíte visual — **todas** as cenas de janela rebaseiam, porque toda janela de
   app muda de tamanho e ganha chrome. Conferir diff por diff.
4. `contain: paint` e o `React.memo` de `Window.jsx` continuam valendo: o
   `NAVIGATE` não pode clonar janela que não mudou.
5. Hover, foco e teclado da lateral no navegador — a suíte não fotografa nenhum
   dos três.

### O que esta entrega NÃO resolve

A animação de maximizar degrada na janela "Sobre este PC" por causa do cristal
three.js (medido: 1 a 2 passos de largura, pior quadro de 533ms, contra 16,7ms
de mediana numa janela sem WebGL). O conserto é a janela avisar o app do próprio
estado — plumbing que este chrome introduz. Fica registrado como o próximo passo
natural, não feito aqui.
