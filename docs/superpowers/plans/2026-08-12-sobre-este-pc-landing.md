# "Sobre este PC" como página de entrada — plano de implementação

> **Para trabalhadores agênticos:** SUB-SKILL OBRIGATÓRIA: use
> `superpowers:executing-plans` (ou `superpowers:subagent-driven-development`)
> para executar tarefa por tarefa. Os passos usam `- [ ]` para rastreio.

**Objetivo:** transformar o conteúdo da janela `/sobre` numa página de entrada
— hierarquia de três níveis, superfície com contraste real, um alvo de contato
que leva ao Terminal, e a ficha técnica do próprio sistema ao lado da do hardware.

**Arquitetura:** os dados novos entram em `content/` (com a idade *derivada* e a
ficha do sistema com dois campos *derivados*); a superfície elevada nasce como
par de tokens em `os/tokens.css`, derivada de `--win-body-base` para acertar em
todos os temas e presets de graça; o `AboutApp` é reescrito sobre esses tokens e
sobre a receita tipográfica que o `ui/AppHeader.css` já define.

**Stack:** React 18 + Vite, CSS puro com custom properties, vitest
(`environment: 'node'`, só lógica pura), Playwright em `frontend/visual/`.

**Spec:** `docs/superpowers/specs/2026-08-12-sobre-este-pc-landing-design.md`

## Restrições globais

- **Tudo em PT-BR:** código, comentários, mensagens de commit.
- **Commits:** prefixo `feat:` / `fix:` / `docs:` / `test:` / `refactor:`.
  **Nunca** `Co-Authored-By:` nem qualquer assinatura de ferramenta.
- **Nenhum valor visual literal novo.** Cor, medida, duração e curva vêm de
  `config/system.js` pela ponte (`--cfg-*`) ou de token existente. As três
  exceções documentadas do projeto seguem valendo (arte da cerimônia, cores de
  categoria/marca, âmbar da BIOS).
- **Acento em duas formas:** `var(--accent-color)` para a cor cheia,
  `rgb(var(--accent-rgb) / 0.16)` para qualquer opacidade. Nenhum `rgba(168,85,247,X)`.
- **Raio:** `var(--win-control-radius)` em tudo clicável; pílula `999px` só em
  elemento **não** interativo. Cards não interativos deste app seguem em `14px`,
  que é o literal que o arquivo já usava (não introduzir raio novo).
- **Texto novo entra nos dois idiomas** (`i18n/os.js`, `content/*.js`).
- **Nada em `src/` importa `three` estaticamente.**
- **Não acrescentar dependência** a `frontend/package.json`.
- **Fonte da verdade do conteúdo:** `backend/data/knowledge_base/profile.md`.
- **Vitest só de lógica pura:** `src/**/*.test.js`, sem DOM, sem `.test.jsx`.

---

## Estrutura de arquivos

| arquivo | responsabilidade |
|---|---|
| `frontend/src/content/profile.js` | dados do perfil + `idadeEm()` (função pura) |
| `frontend/src/content/profile.test.js` | **novo** — só `idadeEm()` |
| `frontend/src/content/sistema.js` | **novo** — ficha técnica do site; literais conferidos + rótulos por idioma |
| `frontend/src/content/contact.js` | conserto do `color` do GitHub |
| `frontend/src/i18n/os.js` | strings de interface do `about`; título do Leia-me como template |
| `frontend/src/apps/ReadmeApp.jsx` | interpola `SISTEMA.testes` no título |
| `frontend/src/os/tokens.css` | os 5 tokens de superfície, por tema + override do XP |
| `frontend/src/os/registry.js` | `about.defaultSize.w` 804 → 884 |
| `frontend/src/config/system.test.js` | `ANTES.about.w` 620 → 700 |
| `frontend/src/apps/AboutApp.jsx` | a árvore nova |
| `frontend/src/apps/AboutApp.css` | o CSS novo |
| `frontend/visual/rotas.spec.js` | teste do botão de contato + comentário das portas |
| `.claude/skills/marocos-os-frontend/SKILL.md` | tokens novos e a escala tipográfica |

---

## Task 1: a idade é derivada, não escrita

**Files:**
- Modify: `frontend/src/content/profile.js`
- Test: `frontend/src/content/profile.test.js` (criar)

**Interfaces:**
- Produces: `idadeEm(nascimentoISO: string, hoje?: Date) => number`;
  `profileData*.nome`, `.local`, `.nascimento`, `.status`.

- [ ] **Step 1: escrever o teste que falha**

Criar `frontend/src/content/profile.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { idadeEm, getProfileData } from './profile'

/**
 * A IDADE É DERIVADA DE PROPÓSITO. Escrever "22 anos" no conteúdo é escrever um
 * número que fica errado em 14/12/2026 — e ninguém relê o texto no aniversário.
 *
 * As datas dos testes são construídas com `new Date(ano, mes, dia)` (mês base 0,
 * hora local) e a data de nascimento é PARSEADA À MÃO na implementação. Os dois
 * de propósito: `new Date('2003-12-14')` é meia-noite UTC, e comparar isso com
 * uma data local desloca o resultado em um dia a oeste de Greenwich — que é
 * onde este site roda.
 */
describe('idadeEm', () => {
  const NASCIMENTO = '2003-12-14'

  it('na véspera do aniversário ainda não contou o ano', () => {
    expect(idadeEm(NASCIMENTO, new Date(2026, 11, 13))).toBe(22)
  })

  it('no dia do aniversário conta o ano', () => {
    expect(idadeEm(NASCIMENTO, new Date(2026, 11, 14))).toBe(23)
  })

  it('no dia seguinte segue contado', () => {
    expect(idadeEm(NASCIMENTO, new Date(2026, 11, 15))).toBe(23)
  })

  it('mês anterior ao do aniversário não conta', () => {
    expect(idadeEm(NASCIMENTO, new Date(2026, 7, 12))).toBe(22)
  })

  it('nascido em 29 de fevereiro conta no dia 1º de março do ano comum', () => {
    expect(idadeEm('2004-02-29', new Date(2026, 1, 28))).toBe(21)
    expect(idadeEm('2004-02-29', new Date(2026, 2, 1))).toBe(22)
  })
})

describe('perfil', () => {
  it('os campos de identidade existem nos dois idiomas', () => {
    for (const lang of ['pt', 'en']) {
      const p = getProfileData(lang)
      expect(p.nome, lang).toBe('Marcos Rodrigues')
      expect(p.nascimento, lang).toBe('2003-12-14')
      expect(p.local, lang).toBeTruthy()
      expect(p.status, lang).toBeTruthy()
    }
  })
})
```

- [ ] **Step 2: rodar e confirmar que falha**

```powershell
cd frontend; npx vitest run src/content/profile.test.js
```
Esperado: FAIL — `idadeEm is not a function`.

- [ ] **Step 3: implementar**

Em `frontend/src/content/profile.js`, acrescentar antes de `maquinaItens`:

```js
/**
 * A IDADE, DERIVADA DA DATA DE NASCIMENTO.
 *
 * O `profile.md` diz "nasci em 14 de dezembro de 2003"; o site precisa dizer
 * quantos anos isso dá HOJE. Escrever o número no conteúdo é escrever um valor
 * com data de validade — e o dia em que ele vence é justamente o dia em que
 * ninguém está lendo este arquivo.
 *
 * A data de nascimento é quebrada à mão em vez de ir para o `Date`: um
 * `new Date('2003-12-14')` é meia-noite UTC, e comparado com uma data local a
 * oeste de Greenwich (que é onde este site roda) o aniversário chega um dia
 * antes. Comparando três inteiros não há fuso nenhum envolvido.
 */
export const idadeEm = (nascimentoISO, hoje = new Date()) => {
  const [ano, mes, dia] = nascimentoISO.split('-').map(Number)
  const aindaNaoFezAniversario =
    hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < dia)
  return hoje.getFullYear() - ano - (aindaNaoFezAniversario ? 1 : 0)
}
```

Em `profileDataEn`, acrescentar acima de `role`:

```js
  /**
   * O NOME NÃO APARECIA EM PIXEL NENHUM DO CONTEÚDO. Estava no `<title>` da aba,
   * no copyright do terminal e no menu Iniciar — nunca no corpo do "Sobre este
   * PC", que é o app que abre sozinho para quem chega sem deep link. Quem entrava
   * por `/sobre` lia um cargo e uma frase e saía sem saber de quem é o site.
   */
  nome: 'Marcos Rodrigues',
  local: 'Uberlândia – MG',
  nascimento: '2003-12-14',
  /**
   * FIEL À BASE, E NEUTRO. O `profile.md` diz "Aberto a propostas de projetos
   * Freelance ... estou empregado atualmente". "Disponível" sugeriria outra
   * coisa; "aberto a freelance" é o que está escrito lá.
   */
  status: 'open to freelance',
```

Em `profileDataPt`, o mesmo bloco com `local: 'Uberlândia – MG'`,
`status: 'aberto a freelance'` (e o comentário só na versão inglesa, que é a
primeira do arquivo — a convenção do arquivo).

- [ ] **Step 4: rodar e confirmar que passa**

```powershell
cd frontend; npx vitest run src/content/profile.test.js
```
Esperado: PASS, 6 testes.

- [ ] **Step 5: commit**

```powershell
git add frontend/src/content/profile.js frontend/src/content/profile.test.js
git commit -F <mensagem>
```
Mensagem: `feat: o nome, o lugar e a idade derivada no perfil`

---

## Task 2: a ficha técnica do sistema, com fonte única para o número de testes

**Files:**
- Create: `frontend/src/content/sistema.js`
- Modify: `frontend/src/i18n/os.js` (2 títulos do Leia-me), `frontend/src/apps/ReadmeApp.jsx`

**Interfaces:**
- Consumes: nada.
- Produces: `SISTEMA = { versao, testes, shaders }`;
  `getSistemaData(lang, { apps, presets }) => Array<{ rotulo, valor }>`.

- [ ] **Step 1: criar `content/sistema.js`**

```js
/**
 * A FICHA TÉCNICA DO PRÓPRIO SITE — a outra metade do que "Sobre este PC"
 * promete. Uma janela com esse nome que só descreve o notebook do dono cumpre
 * metade da piada: a máquina que o visitante está usando é este sistema.
 *
 * DOIS CAMPOS SÃO DERIVADOS E NÃO CONSEGUEM MENTIR — o número de apps sai de
 * `APPS.length` e o de presets de `PRESETS`, os dois lidos em runtime pelo
 * `AboutApp`. Eles entram por parâmetro em vez de serem importados aqui de
 * propósito: `content/` guarda dado de portfólio e não deve passar a depender de
 * `os/` nem de `config/`.
 */

export const SISTEMA = {
  /** O mesmo do banner do terminal, em `content/contact.js`. */
  versao: '3.0.1',

  /**
   * CONFERIDO EM 2026-08-12 — e é um número que envelhece, então aqui está como
   * reconferir:
   *   cenas visuais  contar `{ nome:` em `frontend/visual/cenas.js`        → 21
   *   funcionais     os `test(` avulsos de `frontend/visual/rotas.spec.js` (8)
   *                  + uma entrada por rota no laço sobre `ROTAS` (9)      → 17
   *
   * O texto do Leia-me dizia 36 e tinha ficado para trás. É por isso que o
   * número mora AQUI, numa fonte só: a partir desta mudança as duas janelas que
   * o exibem leem a mesma constante e não têm como discordar de novo.
   */
  testes: 38,

  /** Silk no tema escuro, Iridescence no claro — os dois sobre `ogl`. */
  shaders: 2,
}

const rotulosEn = {
  apps: 'Apps',
  testes: 'Tests',
  shaders: 'Shaders',
  presets: 'Presets',
  versao: 'Version',
}

const rotulosPt = {
  apps: 'Apps',
  testes: 'Testes',
  shaders: 'Shaders',
  presets: 'Presets',
  versao: 'Versão',
}

/**
 * Mesma forma de `profile.maquina` — `{ rotulo, valor }` — para as duas fichas
 * do "Sobre este PC" poderem ser renderizadas pelo mesmo bloco de JSX e pelo
 * mesmo CSS. Elas são a mesma coisa dita sobre dois assuntos.
 */
export const getSistemaData = (lang, { apps, presets }) => {
  const r = lang === 'pt' ? rotulosPt : rotulosEn
  return [
    { rotulo: r.apps, valor: String(apps) },
    { rotulo: r.testes, valor: String(SISTEMA.testes) },
    { rotulo: r.shaders, valor: String(SISTEMA.shaders) },
    { rotulo: r.presets, valor: String(presets) },
    { rotulo: r.versao, valor: SISTEMA.versao },
  ]
}
```

- [ ] **Step 2: o título do Leia-me vira template**

Em `frontend/src/i18n/os.js`, linha 148: `'And 36 tests watch all of it'` →
`'And %d tests watch all of it'`. Linha 524:
`'E 36 testes olham para tudo isso'` → `'E %d testes olham para tudo isso'`.

Acrescentar o comentário acima do bloco `sections` do inglês:

```js
      /**
       * O NÚMERO É INTERPOLADO, e a razão é que ele já esteve errado: este texto
       * dizia 36 quando a suíte tinha 38. Ele agora vem de `SISTEMA.testes`
       * (`content/sistema.js`), que é a mesma constante que a ficha "Este
       * sistema" do "Sobre este PC" exibe — as duas janelas não têm mais como
       * discordar.
       */
```

- [ ] **Step 3: `ReadmeApp` interpola**

`frontend/src/apps/ReadmeApp.jsx` — acrescentar o import e trocar o `<h3>`:

```jsx
import { SISTEMA } from '../content/sistema'
```

```jsx
          <h3 className="readme-section-title">
            {secao.title.replace('%d', SISTEMA.testes)}
          </h3>
```

O `key={secao.title}` fica como está: o template continua único entre as seções.

- [ ] **Step 4: verificar**

```powershell
cd frontend; npm run lint; npm test
```
Esperado: lint sem erro novo, vitest verde. `npm run build` também tem de passar.

- [ ] **Step 5: commit**

Mensagem: `fix: o leia-me dizia 36 testes e sao 38, agora numa fonte unica`

---

## Task 3: a superfície elevada, no sistema

**Files:**
- Modify: `frontend/src/os/tokens.css`

**Interfaces:**
- Produces: `--sup-fundo`, `--sup-borda`, `--sup-luz`, `--sup-lavagem`,
  `--filete-secao`.

Esta tarefa **não muda um pixel** — nenhum consumidor ainda. A suíte visual tem
de continuar verde no fim dela, e é isso que a torna um bom degrau.

- [ ] **Step 1: acrescentar ao bloco `.theme-dark`** (depois de `--win-body-solid`)

```css
  /* SUPERFÍCIE ELEVADA — para o conteúdo que precisa ler como bloco próprio.
   *
   * O PROBLEMA QUE ELA RESOLVE, com a conta feita: `--card-bg` é
   * rgba(10,10,10,.6) e o corpo da janela é acento 10% em preto a 60% — duas
   * camadas translúcidas quase idênticas, com a borda em rgba(255,255,255,.08)
   * carregando sozinha a diferença entre "card" e "fundo". No tema claro é
   * pior: card branco a 40% sobre um corpo que já é quase branco.
   *
   * TRÊS ESCOLHAS, E CADA UMA É O MOTIVO DA OUTRA:
   *
   * 1. DERIVA DE --win-body-base, que é o único token que cada tema, cada
   *    preset sóbrio e o XP já definem para si. Uma superfície derivada dele
   *    acerta em todos de graça — o `.modo-sobrio` não precisa de uma linha,
   *    porque ele só troca o ALPHA do corpo, não a base.
   *
   * 2. É OPACA. Card opaco dentro de janela translúcida é a mesma lógica que
   *    --icon-tile-bg já paga: o contraste deixa de depender de qual região do
   *    wallpaper caiu atrás. E custa zero, sem backdrop-filter — que é o que
   *    Window.css documenta ter derrubado de 20px para 6px.
   *
   * 3. SAI DO ACENTO, então repinta junto com o preset escolhido.
   *
   * POR QUE ISTO NÃO PODE MORAR EM :root — e é uma armadilha silenciosa:
   * a substituição de uma custom property acontece no elemento onde ela é
   * DECLARADA, não onde é usada. `--win-body-base` só existe em
   * .theme-dark/.theme-light; declarado em :root, o color-mix receberia um
   * var() inválido, viraria guaranteed-invalid, e a superfície simplesmente não
   * pintaria. É o mesmo motivo por que --win-body-bg e --win-body-solid já são
   * declarados duas vezes, um por tema. */
  --sup-fundo: color-mix(in srgb, rgb(var(--accent-rgb)) 16%, var(--win-body-base));
  --sup-borda: color-mix(in srgb, rgb(var(--accent-rgb)) 26%, transparent);
  /* A aresta de luz: 1px no topo da superfície, esvanecendo para a direita.
     Mesma leitura de --win-highlight, agora tingida pelo preset. */
  --sup-luz: linear-gradient(90deg, rgb(var(--accent-rgb) / 0.55), transparent 72%);
  /* Lavagem diagonal, para o bloco que precisa de um pouco mais de peso que os
     vizinhos sem virar uma cor cheia. */
  --sup-lavagem: linear-gradient(160deg, rgb(var(--accent-rgb) / 0.14), transparent 70%);
  /* Divisor entre seções: some antes de chegar à outra borda, então separa sem
     desenhar uma tabela. */
  --filete-secao: linear-gradient(90deg, rgb(var(--accent-rgb) / 0.45), transparent);
```

- [ ] **Step 2: acrescentar ao bloco `.theme-light`** (depois de `--win-shadow`)

```css
  /* A MESMA SUPERFÍCIE, COM AS DOSES DO DIA. Ver o bloco de .theme-dark para o
     raciocínio inteiro. O que muda aqui é só a quantidade: a base já é branca
     (acento 4% em #fff), então 16% de acento empastelaria — 8% é o que faz o
     bloco existir contra o corpo sem deixar de ser claro. Mesma lição de
     --icon-tile-bg: dose de tema escuro não se reaproveita no claro. */
  --sup-fundo: color-mix(in srgb, rgb(var(--accent-rgb)) 8%, var(--win-body-base));
  --sup-borda: color-mix(in srgb, rgb(var(--accent-rgb)) 24%, transparent);
  --sup-luz: linear-gradient(90deg, rgb(var(--accent-rgb) / 0.45), transparent 72%);
  --sup-lavagem: linear-gradient(160deg, rgb(var(--accent-rgb) / 0.1), transparent 70%);
  --filete-secao: linear-gradient(90deg, rgb(var(--accent-rgb) / 0.4), transparent);
```

- [ ] **Step 3: o override do XP**

No bloco `.theme-light.modo-xp` que já define `--card-bg: #ffffff`, acrescentar:

```css
  /* A superfície elevada no Luna é o card branco que ele já tinha, sem lavagem
     nem aresta de luz: as duas são material de vidro, e o XP é opaco. Lavagem
     violeta sobre o bege quebraria a citação. */
  --sup-fundo: #ffffff;
  --sup-borda: #b7b7a4;
  --sup-luz: none;
  --sup-lavagem: none;
  --filete-secao: linear-gradient(90deg, #b7b7a4, transparent);
```

- [ ] **Step 4: provar que nada mudou**

```powershell
cd frontend/visual; npm run build:frontend; npm test
```
Esperado: **38 verdes**. Token sem consumidor não pinta nada; qualquer vermelho
aqui significa erro de sintaxe que invalidou um bloco inteiro.

- [ ] **Step 5: commit**

Mensagem: `feat: superficie elevada como token do sistema`

---

## Task 4: a janela cresce para o teto que já existe

**Files:**
- Modify: `frontend/src/os/registry.js`, `frontend/src/config/system.test.js`

- [ ] **Step 1: registry**

Em `frontend/src/os/registry.js`, no app `about`:

```js
    // 884 e não 804: o conteúdo virou página de entrada e precisa de duas
    // colunas que respirem (a grade de portas e as duas fichas técnicas lado a
    // lado). 700 de área útil + 184 de lateral é o MESMO teto que a Jornada já
    // usa, então nada de novo entra no orçamento: com os 16px de JANELAS.margem
    // dos dois lados a largura pede 916px, que cabe no breakpoint de 1024 onde o
    // shell de desktop começa.
    defaultSize: { w: 884, h: 626 },
```

- [ ] **Step 2: o contrato do teste**

Em `frontend/src/config/system.test.js`, no mapa `ANTES`:

```js
      // O "Sobre" cresceu de 620 para 700 de área útil quando virou página de
      // entrada — decisão registrada na spec de 2026-08-12. Este mapa é a área
      // ÚTIL desejada por app, não um arquivo histórico: o que ele guarda é que
      // o chrome de explorador não coma o conteúdo, e essa conta continua exata.
      about: { w: 700, h: 520 },
```

- [ ] **Step 3: rodar**

```powershell
cd frontend; npm test
```
Esperado: verde, incluindo `o chrome de explorador bate com o crescimento dos
tamanhos de janela`.

- [ ] **Step 4: commit**

Mensagem: `feat: a janela do Sobre vai a 884 para caber duas colunas`

---

## Task 5: as strings, nos dois idiomas

**Files:**
- Modify: `frontend/src/i18n/os.js` (bloco `about` do EN, linhas ~99-122, e do
  PT, ~484-507)

**Interfaces:**
- Produces: `os.about.{crystalAlt, idade, acao:{titulo,sub}, stackLabel,
  bioLabel, bioHeadline, guideLabel, guideHeadline, guide:{projects, history,
  readme, assistant}, specsLabel, machineLabel, sistemaLabel}`.

- [ ] **Step 1: substituir o bloco `about` do inglês**

```js
  about: {
    crystalAlt: '3D system logo',
    /** Interpolado com a idade derivada de `profile.nascimento`. */
    idade: '%d years old',
    /**
     * O CONTATO É UM ALVO SÓ, E NÃO REPETE NADA.
     *
     * A janela não traz e-mail, handle nem URL: os quatro ícones dizem QUAIS
     * canais existem, e o botão inteiro abre o terminal, que é onde eles moram.
     * Decisão do dono do projeto — "não quero repetir informação, quero que ele
     * use elas mandando a pessoa ir até a determinada janela com elas".
     *
     * É por isso que o terminal SAIU do guia: ele deixou de ser uma pergunta
     * para virar a ação do topo, que é onde uma página de entrada põe o contato.
     */
    acao: {
      titulo: 'Talk to me',
      sub: 'E-mail, LinkedIn, GitHub and Discord — in the terminal',
    },
    stackLabel: 'Day to day',
    bioLabel: 'Who writes this',
    /**
     * A HEADLINE É A VOZ HUMANA, o eyebrow é a da máquina. As duas juntas são a
     * receita que `ui/AppHeader.css` já define e que este app era o único a não
     * usar. E só ganha headline a seção que faz uma AFIRMAÇÃO: as três fichas
     * técnicas abaixo ficam com o eyebrow sozinho, porque ficha técnica não
     * afirma nada — ela lista.
     */
    bioHeadline: 'I got here through hardware.',
    guideLabel: 'Where to start',
    guideHeadline: 'Four questions, four windows.',
    guide: {
      projects: {
        question: 'Can he build?',
        answer: 'Five projects, each led by its hard problem instead of a list of technologies.',
      },
      history: {
        question: 'For how long?',
        answer: 'From fixing printers at 14 to full stack developer. Seven years, in order.',
      },
      readme: {
        question: 'And this site here?',
        answer: 'This operating system is hand-built. Its technical guide explains how.',
      },
      assistant: {
        question: 'Can I just ask him?',
        answer: 'An agent over my real career data — and it would rather say "I do not know" than invent.',
      },
    },
    specsLabel: 'System Specifications',
    machineLabel: 'This computer',
    sistemaLabel: 'This system',
  },
```

- [ ] **Step 2: substituir o bloco `about` do português**

```js
  about: {
    crystalAlt: 'Logotipo 3D do sistema',
    idade: '%d anos',
    /** Ver a nota no bloco em inglês: um alvo só, e o terminal saiu do guia. */
    acao: {
      titulo: 'Falar comigo',
      sub: 'E-mail, LinkedIn, GitHub e Discord — no terminal',
    },
    stackLabel: 'No dia a dia',
    bioLabel: 'Quem escreve isto',
    /** Ver a nota no bloco em inglês: headline só onde há afirmação. */
    bioHeadline: 'Cheguei aqui pelo hardware.',
    guideLabel: 'Por onde começar',
    guideHeadline: 'Quatro perguntas, quatro janelas.',
    guide: {
      projects: {
        question: 'Ele sabe construir?',
        answer: 'Cinco projetos, cada um puxado pelo problema difícil em vez da lista de tecnologias.',
      },
      history: {
        question: 'Há quanto tempo?',
        answer: 'De consertar impressora aos 14 a desenvolvedor full stack. Sete anos, em ordem.',
      },
      readme: {
        question: 'E este site aqui?',
        answer: 'Este sistema operacional é feito à mão. O guia técnico dele conta como.',
      },
      assistant: {
        question: 'Consigo perguntar direto a ele?',
        answer: 'Um agente sobre a minha trajetória real — e que prefere dizer "não sei" a inventar.',
      },
    },
    specsLabel: 'Especificações do Sistema',
    machineLabel: 'Este computador',
    sistemaLabel: 'Este sistema',
  },
```

- [ ] **Step 3: verificar**

```powershell
cd frontend; npm run lint; npm run build
```
Esperado: os dois passam. (A janela ainda renderiza o layout antigo — as chaves
novas só ganham consumidor na Task 6; `guide.terminal` deixou de existir e o
`portas` antigo pede `os.about.guide[id]` com guarda `if (!texto) return null`,
então a porta do terminal apenas desaparece. Nenhum erro.)

- [ ] **Step 4: commit**

Mensagem: `feat: as strings do Sobre — headlines, acao e a quinta porta`

---

## Task 6: o conserto do GitHub em `contact.js`

**Files:**
- Modify: `frontend/src/content/contact.js:26`

- [ ] **Step 1: trocar o literal**

```js
  {
    id: "github",
    label: "GITHUB",
    value: "/marocosz",
    link: "https://github.com/marocosz",
    icon: Github,
    /**
     * TOKEN, E NÃO "#fff".
     *
     * Este campo `color` não tinha consumidor nenhum até agora — o Terminal
     * renderiza `<Icon size={14} />` sem cor (o `entry.color` dele vem de
     * `terminal.logs`, não daqui). Então o branco literal não era bug: passaria
     * a ser no instante em que o botão de contato do "Sobre este PC" o usasse,
     * porque branco sobre o vidro claro do tema de dia é invisível.
     *
     * As outras três cores ficam literais de propósito — são cores de MARCA, a
     * exceção documentada do projeto: elas significam algo, e seguir o tema
     * faria o LinkedIn deixar de ser azul. A do GitHub é a única que não pode
     * ser literal, porque a marca dele é monocromática por definição: a "cor"
     * dela é o primeiro plano de quem a exibe.
     */
    color: "var(--text-primary)"
  },
```

- [ ] **Step 2: verificar que o Terminal não mudou**

```powershell
cd frontend/visual; npm run build:frontend; npx playwright test rotas.spec.js
```
Esperado: 17 verdes. O Terminal não lê este campo, então nada muda lá.

- [ ] **Step 3: commit**

Mensagem: `fix: a marca do GitHub em contact.js precisa ser token, nao #fff`

---

## Task 7: o app

**Files:**
- Modify: `frontend/src/apps/AboutApp.jsx` (reescrita da árvore),
  `frontend/src/apps/AboutApp.css` (reescrita)

**Interfaces:**
- Consumes: `idadeEm`, `profile.{nome,local,nascimento,status,role,bio_highlight,bio_full,stats,maquina,skills_highlight}`,
  `getSistemaData(lang,{apps,presets})`, `getContactData(lang).items`,
  `os.about.*`, `APPS`, `PRESETS`, `--sup-*`, `--filete-secao`.

- [ ] **Step 1: o JSX**

Substituir o corpo do `AboutApp` (mantendo o cabeçalho de comentários do arquivo,
com o parágrafo sobre as portas atualizado para dizer que são quatro e que o
contato subiu para o herói):

```jsx
import React, { Suspense, lazy, useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { getProfileData, idadeEm } from '../content/profile'
import { getContactData } from '../content/contact'
import { getSistemaData } from '../content/sistema'
import { getOsData } from '../i18n/os'
import { getApp, APPS } from '../os/registry'
import { useAbrir } from '../os/NavegacaoContext'
import { useDeviceMode } from '../os/useDeviceMode'
import { CERIMONIA, PRESETS, acentoProfundo, corpoDoCristal } from '../config/system'
import { useTheme } from '../contexts/ThemeContext'
import './AboutApp.css'
```

Dentro do componente, depois dos hooks existentes:

```jsx
  const contato = getContactData(language)
  /**
   * OS DOIS NÚMEROS DERIVADOS DA FICHA DO SISTEMA. Eles são lidos aqui, e não
   * dentro de `content/sistema.js`, para aquele arquivo não passar a depender de
   * `os/` nem de `config/` — ele guarda dado de portfólio. E derivados em vez de
   * escritos porque assim não conseguem mentir: um app novo no registry ou um
   * preset novo no config aparecem nesta ficha sozinhos.
   */
  const sistema = getSistemaData(language, {
    apps: APPS.length,
    presets: PRESETS.noite.length + PRESETS.dia.length,
  })
  const idade = idadeEm(profile.nascimento)

  /**
   * A ORDEM É A DO INTERESSE: primeiro se ele sabe construir, depois há quanto
   * tempo, depois esta máquina, e por fim se dá para perguntar direto a ele.
   *
   * O TERMINAL SAIU DAQUI e virou a ação do topo — numa página de entrada o
   * contato não é uma pergunta a ser encontrada no meio de uma lista, é o alvo
   * que fica acima da dobra. E o MARCOS VIRTUAL entrou no lugar dele: é a prova
   * mais forte do portfólio e não era porta nenhuma.
   */
  const portas = ['projects', 'history', 'readme', 'assistant']
```

E o `return`:

```jsx
  return (
    <div className="about-app">
      {/* --- 1. HERÓI: identidade, e agora com nome --- */}
      <header className="about-heroi">
        {deviceMode === 'desktop' && montarCristal && (
          <div className="about-crystal" role="img" aria-label={os.about.crystalAlt}>
            <Suspense fallback={<div className="about-crystal-fallback" aria-hidden="true" />}>
              <Crystal
                size={190}
                className="crystal-3d-sem-halo"
                intensidade={0.5}
                animated={isAnimated}
                acento={preset.acento}
                acentoFundo={acentoProfundo(preset)}
                corpo={corpoDoCristal(preset)}
              />
            </Suspense>
          </div>
        )}

        <div className="about-heroi-texto">
          <p className="about-eyebrow">{profile.role}</p>
          <h2 className="about-nome">{profile.nome}</h2>
          <p className="about-destaque">{profile.bio_highlight}</p>
          <p className="about-meta">
            {/* O pulso respeita as DUAS chaves: o interruptor de Movimento por
                esta classe, e o prefers-reduced-motion pelo CSS. Foi exatamente
                aqui que o cristal deste app já errou uma vez. */}
            <span className={`about-status${isAnimated ? '' : ' about-status--parado'}`}>
              <span className="about-status-ponto" aria-hidden="true" />
              {profile.status}
            </span>
            <span className="about-meta-sep" aria-hidden="true">·</span>
            <span>{profile.local}</span>
            <span className="about-meta-sep" aria-hidden="true">·</span>
            <span>{os.about.idade.replace('%d', idade)}</span>
          </p>
        </div>
      </header>

      {/* --- 2. AÇÃO: um alvo, e o conteúdo continua no terminal --- */}
      <button
        type="button"
        className="about-acao"
        onClick={() => abrir?.('terminal')}
        disabled={!abrir}
      >
        <span className="about-acao-canais" aria-hidden="true">
          {contato.items.map((canal) => {
            const Icone = canal.icon
            return <Icone key={canal.id} size={16} style={{ color: canal.color }} />
          })}
        </span>
        <span className="about-acao-texto">
          <span className="about-acao-titulo">{os.about.acao.titulo}</span>
          <span className="about-acao-sub">{os.about.acao.sub}</span>
        </span>
        <ArrowRight size={18} className="about-acao-seta" aria-hidden="true" />
      </button>

      {/* --- 3. STACK: seis chips, legíveis no próprio ritmo ---
              Onde ficava o marquee. Ele saiu por ser decorativo e ilegível em
              movimento; volta como faixa de prova de uma linha, estática. O app
              de Stack continua sendo a porta que aprofunda. */}
      <ul className="about-stack" aria-label={os.about.stackLabel}>
        {profile.skills_highlight.slice(0, 6).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      {/* --- 4. BIO --- */}
      <section className="about-secao">
        <p className="about-eyebrow about-secao-eyebrow">{os.about.bioLabel}</p>
        <h3 className="about-headline">{os.about.bioHeadline}</h3>
        <p className="about-bio">{profile.bio_full}</p>
      </section>

      {/* --- 5. O GUIA: quatro perguntas, cada uma com a sua porta --- */}
      <section className="about-secao">
        <p className="about-eyebrow about-secao-eyebrow">{os.about.guideLabel}</p>
        <h3 className="about-headline">{os.about.guideHeadline}</h3>
        <ul className="about-guide">
          {portas.map((id) => {
            const app = getApp(id)
            const Icone = app?.icon
            const texto = os.about.guide[id]
            if (!texto) return null

            return (
              <li key={id}>
                <button
                  type="button"
                  className={`about-door${id === 'assistant' ? ' about-door--destaque' : ''}`}
                  onClick={() => abrir?.(id)}
                  disabled={!abrir}
                >
                  {Icone && <Icone size={18} className="about-door-icon" aria-hidden="true" />}
                  <span className="about-door-text">
                    <span className="about-door-question">{texto.question}</span>
                    <span className="about-door-answer">{texto.answer}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      {/* --- 6. ESPECIFICAÇÕES: os fatos, lidos como ficha técnica.
              Eyebrow sozinho, sem headline: ficha técnica não afirma, lista. */}
      <section className="about-secao">
        <p className="about-eyebrow about-secao-eyebrow">{os.about.specsLabel}</p>
        <div className="about-specs">
          {profile.stats.map((stat, index) => (
            <div className="about-spec-card" key={index}>
              <span className="about-spec-number">{stat.number}</span>
              <span className="about-spec-label">{stat.label}</span>
              <span className="about-spec-sublabel">{stat.sublabel}</span>
            </div>
          ))}
        </div>
      </section>

      {/* --- 7. AS DUAS FICHAS: o hardware e o sistema, lado a lado.
              É o "Sobre este PC" cumprindo o nome nos dois sentidos — a máquina
              do dono e a máquina que o visitante está usando agora. */}
      <div className="about-fichas">
        <section className="about-secao about-secao--interna">
          <p className="about-eyebrow about-secao-eyebrow">{os.about.machineLabel}</p>
          <dl className="about-ficha">
            {profile.maquina.map((item) => (
              <div className="about-ficha-row" key={item.rotulo}>
                <dt>{item.rotulo}</dt>
                <dd>{item.valor}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="about-secao about-secao--interna">
          <p className="about-eyebrow about-secao-eyebrow">{os.about.sistemaLabel}</p>
          <dl className="about-ficha">
            {sistema.map((item) => (
              <div className="about-ficha-row" key={item.rotulo}>
                <dt>{item.rotulo}</dt>
                <dd>{item.valor}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  )
```

- [ ] **Step 2: o CSS** — reescrever `frontend/src/apps/AboutApp.css` com o
conteúdo listado no Anexo A deste plano.

- [ ] **Step 3: verificar que carrega e que a rota funciona**

```powershell
cd frontend; npm run lint; npm run build
cd frontend/visual; npm run build:frontend; npx playwright test rotas.spec.js
```
Esperado: lint e build passam; `rotas.spec.js` verde — inclusive
`.about-door` = 4 (saiu o terminal, entrou o assistente) e o clique em "Ele sabe
construir?".

- [ ] **Step 4: commit**

Mensagem: `feat: o Sobre este PC como pagina de entrada`

---

## Task 8: o teste do botão, e a suíte inteira

**Files:**
- Modify: `frontend/visual/rotas.spec.js`

- [ ] **Step 1: acrescentar o teste**

Depois do teste `as portas do guia abrem os apps que prometem, em janela nova`:

```js
/**
 * O BOTÃO DE CONTATO DO "SOBRE" LEVA AO TERMINAL.
 *
 * Ele existe porque a janela do "Sobre" deliberadamente NÃO repete os canais de
 * contato: os quatro ícones dizem quais existem, e o conteúdo mora no terminal.
 * Se este botão quebrar, o site perde o único caminho de contato acima da dobra
 * e nada mais reclama — nenhuma outra asserção passa por ele.
 */
test('o botão de contato do Sobre abre o terminal', async ({ page, context }) => {
  await prepararSessao(context)
  await page.goto('/sobre', { waitUntil: 'networkidle' })

  await expect(page.locator('.about-app')).toBeVisible({ timeout: 8000 })
  await page.locator('.about-acao').click()

  await expect(page.locator('.terminal-app')).toBeVisible({ timeout: 8000 })
  // A janela do "Sobre" continua aberta: o contato abre AO LADO, não troca o
  // conteúdo — mesma regra das portas do guia.
  await expect(page.locator('.about-app')).toHaveCount(1)
})
```

Conferir o nome real do helper de sessão lendo o topo de `rotas.spec.js` e usar
o mesmo que o teste vizinho usa.

- [ ] **Step 2: ajustar o comentário da contagem de portas**

No teste `as portas do guia abrem os apps que prometem`, acima do
`toHaveCount(4)`:

```js
  // Quatro, e quais quatro importa: projetos, jornada, leia-me e o Marcos
  // Virtual. O terminal saiu do guia e virou o botão de ação do topo (ver o
  // teste seguinte), então o número continuar 4 é coincidência — não prova que o
  // conjunto está certo.
```

- [ ] **Step 3: a suíte inteira**

```powershell
cd frontend; npm test
cd frontend/visual; npm run build:frontend; npm test
```

Esperado: as cenas `sobre-escuro`, `sobre-claro`, `mobile-sobre` e as de
`menu-iniciar*` **reprovam** — é a mudança pretendida.

- [ ] **Step 4: conferir cada diferença ANTES de aceitar**

```powershell
cd frontend/visual; npm run report
```

Regra: só atualizar referência depois de olhar o diff e concluir que a mudança é
intencional. Nas cenas de `menu-iniciar*` o único pixel diferente permitido é o
que aparece por baixo do menu; o menu em si não pode ter mudado.

```powershell
cd frontend/visual; npm run test:update
```

- [ ] **Step 5: fixar o número de testes**

A suíte agora tem **18** funcionais (17 + o botão de contato) e 21 visuais = 39.
Atualizar `SISTEMA.testes` em `frontend/src/content/sistema.js` para `39`, e o
comentário de conferência para refletir 9 avulsos + 9 do laço.

```powershell
cd frontend; npm run build
cd frontend/visual; npm run build:frontend; npx playwright test visual.spec.js
```
As cenas do "Sobre" mudam de novo (o número na ficha) → conferir e reaceitar
essas três.

- [ ] **Step 6: verificar à mão o que a suíte não vê**

`npm run dev` no `frontend/` e conferir:
- `:hover` e `:focus-visible` nas quatro portas e no botão de ação;
- o pulso do status com **Movimento desligado** nas Configurações (tem de parar);
- o mesmo com `prefers-reduced-motion` forçado no DevTools;
- os presets **XP** e um **sóbrio**, e o **Brasa** (não roxo) — se algum pedaço
  do app continuar violeta, ficou literal em algum lugar;
- o tema claro inteiro, que era onde o contraste estava pior.

- [ ] **Step 7: commit**

Mensagem: `test: o botao de contato do Sobre, e as referencias visuais novas`

---

## Task 9: a skill acompanha o padrão

**Files:**
- Modify: `.claude/skills/marocos-os-frontend/SKILL.md`

- [ ] **Step 1: registrar os tokens novos**

Na seção "A linguagem visual", na tabela de camadas, acrescentar à linha do
chrome do SO que `os/tokens.css` agora também é dono de `--sup-*` e
`--filete-secao`. Depois do parágrafo sobre "Superfície de conteúdo", acrescentar:

```markdown
- **Duas superfícies de conteúdo, e elas não são intercambiáveis:**

  | quer | escreva | quando |
  |---|---|---|
  | superfície plana | `--card-bg` + `--card-border` | o bloco recua: chips, as três faixas do chrome de explorador |
  | superfície elevada | `--sup-fundo` + `--sup-borda` | o bloco tem de ler como bloco próprio |

  `--sup-fundo` é **opaca** e derivada de `--win-body-base` — não é `--card-bg`
  com mais alpha. O motivo está escrito em `os/tokens.css`, e o resumo é que
  translúcido sobre translúcido não separa: o card ficava a 1,05:1 do corpo da
  janela no escuro, e mais claro que o fundo no tema claro. `--sup-luz` (aresta
  de 1px) e `--sup-lavagem` (gradiente diagonal) são os acabamentos dela;
  `--filete-secao` é o divisor entre seções. **Nenhum deles pode ser declarado
  em `:root`** — a substituição acontece onde a propriedade é declarada, e
  `--win-body-base` só existe nos blocos de tema.
```

- [ ] **Step 2: atualizar a escala tipográfica**

Na lista de tamanhos, acrescentar `1,75rem nome no herói do "Sobre"` antes de
`1,6rem número de destaque`. E na explicação das duas vozes, acrescentar que o
par eyebrow (mono) + headline (Poppins) é a receita de `ui/AppHeader.css` e que o
"Sobre" a usa em nível de seção com uma **regra de corte**: só ganha headline a
seção que faz uma afirmação; ficha técnica fica com o eyebrow sozinho.

- [ ] **Step 3: atualizar a contagem da suíte**

Trocar as duas menções a "38 testes: 21 visuais + 17 funcionais" por
"39 testes: 21 visuais + 18 funcionais".

- [ ] **Step 4: commit**

Mensagem: `docs: a skill do frontend aprende a superficie elevada`

---

## Anexo A — `frontend/src/apps/AboutApp.css`

```css
/* src/apps/AboutApp.css
   "Sobre este PC" — winver e página de entrada ao mesmo tempo.

   O QUE MUDOU, E POR QUÊ (spec de 2026-08-12): este app tinha um nível de
   título só — `.about-section-title`, mono, cinza, igual nas três seções. Isso
   é rótulo de campo, não título, e com ele nada na janela distinguia a ideia
   principal de um detalhe. A hierarquia de três níveis já existia no projeto,
   em `ui/AppHeader.css`; este era o único app que não a usava.

   E os cards não separavam do fundo. `--card-bg` é translúcido sobre um corpo
   de janela translúcido quase igual — 1,05:1 no escuro, e no claro o card
   ficava MAIS claro que o fundo. Por isso as superfícies daqui usam
   `--sup-fundo`, que é opaca e derivada de `--win-body-base` (o raciocínio
   inteiro está em `os/tokens.css`).

   Sem `backdrop-filter` em lugar nenhum: o chrome da janela já borra o que está
   atrás, e filtro sobre filtro é o custo que `Window.css` documenta ter
   derrubado de 20px para 6px. */

.about-app {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ==================================================
   AS DUAS VOZES, E A REGRA DE CORTE

   eyebrow  mono, caixa alta, acento — o sistema rotulando a seção
   headline Poppins 900/700 — uma pessoa afirmando algo

   A receita é a de `ui/AppHeader.css` (o `--sm`), com o `// ` que este projeto
   assina. Não é componente compartilhado porque `AppHeader` emite <h2> e estas
   seções são <h3>: forçá-lo aqui torceria a semântica por três declarações. No
   dia em que um segundo app pedir o par em nível de seção, promove-se para
   `ui/`.

   SÓ GANHA HEADLINE A SEÇÃO QUE AFIRMA. Bio e guia ganham; "Especificações",
   "Este computador" e "Este sistema" ficam com o eyebrow sozinho — ficha técnica
   não afirma, lista. É a mesma decisão por VOZ que separa este arquivo do
   `start-menu-apps-heading`.
   ================================================== */
.about-eyebrow {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--accent-color);
}

.about-secao-eyebrow::before {
  content: '// ';
}

.about-headline {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.2px;
  color: var(--text-primary);
}

/* ==================================================
   SEÇÃO E FILETE
   O divisor esvanece antes da outra borda: separa sem desenhar tabela. As
   seções internas das duas fichas não o repetem — quem o traz ali é o wrapper.
   ================================================== */
.about-secao {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 16px;
}

.about-secao::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 1px;
  background: var(--filete-secao);
}

.about-secao--interna {
  padding-top: 0;
}

.about-secao--interna::before {
  content: none;
}

/* ==================================================
   1. HERÓI
   ================================================== */
.about-heroi {
  position: relative;
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  overflow: hidden;
  padding: 16px 18px;
  border-radius: 14px;
  /* SEPARADO EM COLOR + IMAGE, e não `background: var(--lavagem), var(--fundo)`.
     O shorthand com var() só é validado em computed-value time, e ali um único
     token inválido derruba a declaração INTEIRA — o bloco ficaria sem cor de
     fundo nenhuma. Separado, a lavagem pode falhar sem levar a superfície com
     ela. E é o que faz o override do XP (`--sup-lavagem: none`) funcionar sem
     precisar repetir a cor. */
  background-color: var(--sup-fundo);
  background-image: var(--sup-lavagem);
  border: 1px solid var(--sup-borda);
}

/* A ARESTA DE LUZ. Fica no ::before e não numa terceira camada de background
   porque precisa ter 1px exato independentemente da altura do bloco. Mesma
   leitura de --win-highlight, agora tingida pelo preset. */
.about-heroi::before,
.about-acao::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 1px;
  background: var(--sup-luz);
}

/**
 * SÓ O CRISTAL — o wrapper não pinta nada.
 *
 * Aqui já houve uma caixa inteira: raio de 22px, borda de acento, sombra e um
 * radial terminando em quase-preto. Depois virou um halo largo, depois estreito,
 * até ficar claro que o certo era zero: numa tela cheia o cristal é o assunto e
 * a atmosfera é o efeito; dentro de uma janela ele é um logotipo ao lado de um
 * texto, e qualquer mancha atrás vira um segundo elemento disputando atenção.
 *
 * O halo circular que ainda aparecia vinha de `.crystal-3d::before`, em
 * `os/tokens.css` — o COMPONENTE o traz consigo, e é por isso que mexer aqui não
 * adiantava. `crystal-3d-sem-halo` é a saída que o próprio token já previa.
 *
 * O wrapper fica porque é ele que reserva os 190px e centraliza.
 */
.about-crystal {
  position: relative;
  flex: 0 0 auto;
  width: 190px;
  height: 190px;
  display: grid;
  place-items: center;
}

.about-crystal-fallback {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 42%, rgb(var(--accent-rgb) / 0.25), transparent 70%);
  animation: aboutCrystalPulse 1.6s ease-in-out infinite;
}

@keyframes aboutCrystalPulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.9; }
}

.about-heroi-texto {
  flex: 1 1 260px;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* O NOME, que até agora não aparecia em pixel nenhum do conteúdo.
   O gradiente é a receita que `.about-spec-number` já usava — o gesto de
   "número de destaque" do projeto, aplicado ao maior destaque da janela. Poppins
   é carregado em 400/700/900 e o index.css tem `font-synthesis: none`, então 900
   é peso real e não sintetizado. */
.about-nome {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--text-primary) 30%, var(--accent-color) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Texto direto. O efeito de "decriptação" que embaralhava esta frase antes de
   revelá-la saiu do projeto: é a primeira coisa que o visitante lê, e atrasar a
   leitura da linha mais importante para exibir um truque é o custo errado. */
.about-destaque {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.35;
  color: var(--text-primary);
}

.about-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin: 4px 0 0;
  font-size: 0.72rem;
  color: var(--text-secondary);
}

.about-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-weight: 700;
  color: var(--text-primary);
}

.about-status-ponto {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--accent-color);
  animation: aboutPulso 2.4s ease-in-out infinite;
}

/* O interruptor de Movimento das Configurações chega aqui por esta classe (o
   JSX a aplica), e o prefers-reduced-motion pelo bloco no fim do arquivo. OS
   DOIS precisam funcionar: o cristal deste app já foi o único elemento do
   sistema a ignorar o próprio interruptor, e não se repete o erro. */
.about-status--parado .about-status-ponto {
  animation: none;
}

@keyframes aboutPulso {
  0%, 100% { box-shadow: 0 0 0 0 rgb(var(--accent-rgb) / 0.45); }
  50% { box-shadow: 0 0 0 5px rgb(var(--accent-rgb) / 0); }
}

.about-meta-sep {
  opacity: 0.45;
}

/* ==================================================
   2. AÇÃO — um alvo, e o conteúdo continua no terminal

   PARECE CARD E É BOTÃO, como as portas: superfície elevada, raio de controle,
   a coisa toda clicável. Os quatro ícones são CONTEXTO (aria-hidden): dizem
   quais canais existem, sem repetir endereço nenhum.
   ================================================== */
.about-acao {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  overflow: hidden;
  padding: 12px 14px;
  text-align: left;
  font-family: inherit;
  border: 1px solid var(--sup-borda);
  border-radius: var(--win-control-radius);
  background-color: var(--sup-fundo);
  background-image: var(--sup-lavagem);
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.16s ease, border-color 0.16s ease;
}

.about-acao:hover {
  background-color: color-mix(in srgb, rgb(var(--accent-rgb)) 22%, var(--sup-fundo));
  border-color: rgb(var(--accent-rgb) / 0.55);
}

.about-acao:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

/* Fora de um container de navegação (`useAbrir()` devolve null) o botão não leva
   a lugar nenhum — então para de se anunciar como clicável em vez de mentir com
   o cursor. Mesma regra das portas. */
.about-acao:disabled {
  cursor: default;
  opacity: 0.75;
}

.about-acao:disabled:hover {
  border-color: var(--sup-borda);
}

/* As cores de MARCA vivem aqui por estilo inline (vêm de content/contact.js) —
   é a exceção documentada do projeto: marca significa algo, e seguir o tema
   faria o LinkedIn deixar de ser azul. */
.about-acao-canais {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.about-acao-texto {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1 1 auto;
}

.about-acao-titulo {
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--text-primary);
}

.about-acao-sub {
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--text-secondary);
}

.about-acao-seta {
  flex: 0 0 auto;
  color: var(--accent-color);
  transition: transform 0.16s ease;
}

.about-acao:hover .about-acao-seta {
  transform: translateX(3px);
}

/* ==================================================
   3. STACK — faixa de prova, não decoração

   Onde ficava o marquee. Ele saiu por três razões: era decoração num app que
   precisava de navegação, não dava para ler no próprio ritmo (o texto fugia), e
   repetia o app de Stack. Chip estático conserta as duas primeiras; a terceira
   fica aceita de propósito — aqui é uma linha de prova, e o app de Stack segue
   sendo a porta que aprofunda.

   Pílula de 999px porque NÃO é interativo, que é a regra de raio do projeto.
   ================================================== */
.about-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.about-stack li {
  padding: 4px 11px;
  border-radius: 999px;
  border: 1px solid var(--sup-borda);
  background: rgb(var(--accent-rgb) / 0.08);
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-secondary);
}

/* ==================================================
   4. BIOGRAFIA
   ================================================== */
.about-bio {
  margin: 2px 0 0;
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--text-secondary);
  border-left: 2px solid rgb(var(--accent-rgb) / 0.25);
  padding-left: 14px;
}

/* ==================================================
   5. O GUIA — uma porta por pergunta

   AS PORTAS SÃO PERGUNTAS, não uma lista de janelas: quem abre um portfólio não
   quer "Projetos", quer saber se a pessoa sabe construir.

   A quarta é o Marcos Virtual, e ela é destacada por TINTA e não por largura —
   uma faixa de largura cheia embaixo de uma grade 2×2 quebraria o ritmo, e a
   grade com quatro células fica inteira.
   ================================================== */
.about-guide {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin: 2px 0 0;
  padding: 0;
  list-style: none;
}

.about-door {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  height: 100%;
  padding: 11px 12px;
  text-align: left;
  font-family: inherit;
  border: 1px solid var(--sup-borda);
  border-radius: var(--win-control-radius);
  background-color: var(--sup-fundo);
  color: var(--text-primary);
  cursor: pointer;
  transition: background-color 0.16s ease, border-color 0.16s ease;
}

.about-door--destaque {
  background-image: var(--sup-lavagem);
  border-color: rgb(var(--accent-rgb) / 0.45);
}

/* `color-mix` sobre a própria superfície, e não uma camada de acento
   translúcido: a superfície é OPACA de propósito (ver os/tokens.css), então
   empilhar alpha em cima dela devolveria a dependência do que está atrás que ela
   existe para eliminar. Misturar dá o mesmo realce sem reabrir esse buraco. */
.about-door:hover {
  background-color: color-mix(in srgb, rgb(var(--accent-rgb)) 18%, var(--sup-fundo));
  border-color: rgb(var(--accent-rgb) / 0.55);
}

.about-door:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

.about-door:disabled {
  cursor: default;
  opacity: 0.75;
}

.about-door:disabled:hover {
  background-color: var(--sup-fundo);
  border-color: var(--sup-borda);
}

.about-door-icon {
  flex: 0 0 auto;
  margin-top: 1px;
  color: var(--accent-color);
}

.about-door-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

/* A pergunta é Poppins: é uma pessoa perguntando, não o sistema se descrevendo. */
.about-door-question {
  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--text-primary);
}

.about-door-answer {
  font-size: 0.75rem;
  line-height: 1.45;
  color: var(--text-secondary);
}

/* ==================================================
   6. ESPECIFICAÇÕES — os stats como hardware
   ================================================== */
.about-specs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 2px 0 0;
}

.about-spec-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
  padding: 12px 8px;
  border-radius: 14px;
  background-color: var(--sup-fundo);
  background-image: var(--sup-lavagem);
  border: 1px solid var(--sup-borda);
}

.about-spec-number {
  font-size: 1.6rem;
  /* Poppins é carregado em 400/700/900 e o index.css tem font-synthesis: none.
     Este é o peso que o navegador já resolvia sozinho; a declaração antiga (800)
     não existia e caía aqui em silêncio. */
  font-weight: 900;
  line-height: 1.1;
  background: linear-gradient(135deg, var(--text-primary) 30%, var(--accent-color) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.about-spec-label {
  font-family: 'Courier New', monospace;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-primary);
}

.about-spec-sublabel {
  font-size: 0.65rem;
  font-weight: 400;
  color: var(--text-secondary);
}

/* ==================================================
   7. AS DUAS FICHAS TÉCNICAS

   Voz da máquina falando de si: rótulo em mono, caixa alta, com espaçamento —
   mesma receita de `.about-spec-label`. O valor volta para Poppins.

   Duas colunas porque são a mesma coisa dita sobre dois assuntos: o notebook do
   dono e o sistema que o visitante está usando agora. É o "Sobre este PC"
   cumprindo o nome nos dois sentidos.
   ================================================== */
.about-fichas {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  padding-top: 16px;
}

.about-fichas::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 1px;
  background: var(--filete-secao);
}

.about-ficha {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 2px 0 0;
  padding: 10px 12px;
  border-radius: 14px;
  background-color: var(--sup-fundo);
  border: 1px solid var(--sup-borda);
}

.about-ficha-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
  padding: 3px 0;
}

.about-ficha-row dt {
  flex: 0 0 auto;
  font-family: 'Courier New', monospace;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

/* A linha pontilhada sob o valor é o que faz duas colunas de larguras diferentes
   lerem como ficha técnica sem virar tabela — mesma ideia do
   `terminal-log-fill`, que preenche o vão entre o texto e o status. */
.about-ficha-row dd {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  text-align: right;
  font-size: 0.78rem;
  color: var(--text-primary);
  border-bottom: 1px dotted var(--sup-borda);
}

/* ==================================================
   RESPONSIVIDADE
   ================================================== */
@media (max-width: 620px) {
  .about-guide,
  .about-fichas {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .about-specs {
    grid-template-columns: 1fr;
  }
}

/* Respeita quem pede menos movimento. Sem isto o pulso do fallback do cristal e
   o do ponto de status rodariam sempre. O interruptor de Movimento das
   Configurações é a OUTRA chave, e chega pelo JSX. */
@media (prefers-reduced-motion: reduce) {
  .about-crystal-fallback,
  .about-status-ponto {
    animation: none;
  }
}
```

---

## Auto-revisão

**Cobertura da spec:** §1 diagnóstico → Tasks 1-7. §3.1 herói → Task 7. §3.2
ação + conserto do GitHub → Tasks 6 e 7. §3.3 stack → Task 7. §3.4 → Task 7.
§4.1 tokens → Task 3. §4.2 tipografia → Task 7 (Anexo A). §4.3 gradientes →
Tasks 3 e 7. §5.1 → Task 1. §5.2 → Task 2. §5.3 → Tasks 2 e 8. §5.4 → Task 5.
§6 arquivos → todas. §7 verificação → Task 8. §8 fora de escopo → respeitado
(nenhum outro app consome `--sup-*`).

**Sem placeholder:** todo passo traz o código ou o comando exato.

**Consistência de tipos:** `idadeEm(nascimentoISO, hoje)` é chamada com um
argumento no app (o default `new Date()` cobre) e com dois no teste.
`getSistemaData(lang, { apps, presets })` é chamada com o objeto nomeado nos dois
lugares. As classes CSS do Anexo A batem uma a uma com as do JSX da Task 7:
`about-heroi`, `about-heroi-texto`, `about-eyebrow`, `about-secao-eyebrow`,
`about-nome`, `about-destaque`, `about-meta`, `about-status`,
`about-status--parado`, `about-status-ponto`, `about-meta-sep`, `about-acao`,
`about-acao-canais`, `about-acao-texto`, `about-acao-titulo`, `about-acao-sub`,
`about-acao-seta`, `about-stack`, `about-secao`, `about-secao--interna`,
`about-headline`, `about-bio`, `about-guide`, `about-door`,
`about-door--destaque`, `about-door-icon`, `about-door-text`,
`about-door-question`, `about-door-answer`, `about-specs`, `about-spec-card`,
`about-spec-number`, `about-spec-label`, `about-spec-sublabel`, `about-fichas`,
`about-ficha`, `about-ficha-row`, `about-crystal`, `about-crystal-fallback`.

**Duas correções achadas na revisão, já aplicadas no Anexo A:**

1. `.about-door:hover` usava `background: rgb(var(--accent-rgb) / .12), var(--sup-fundo)`
   — **cor não é camada de imagem**, e a declaração inteira seria inválida. Virou
   `background-color: color-mix(in srgb, rgb(var(--accent-rgb)) 18%, var(--sup-fundo))`,
   que é o certo por um segundo motivo: a superfície é opaca de propósito, então
   empilhar acento translúcido em cima dela devolveria a dependência do fundo que
   ela existe para eliminar.
2. Todos os `background: var(--sup-lavagem), var(--sup-fundo)` viraram o par
   `background-color` + `background-image`. O shorthand com `var()` só é validado
   em computed-value time, e ali **um token inválido derruba a declaração
   inteira** — o bloco ficaria sem fundo nenhum. Separado, cada metade falha
   sozinha, e o `--sup-lavagem: none` do XP funciona sem repetir a cor.
