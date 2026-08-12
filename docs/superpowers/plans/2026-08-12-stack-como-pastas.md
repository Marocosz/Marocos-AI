# A "Stack" como pastas que abrem na esteira — plano de implementação

> **Para trabalhadores agênticos:** SUB-SKILL OBRIGATÓRIA: use
> `superpowers:executing-plans`. Os passos usam `- [ ]` para rastreio.

**Objetivo:** trocar a árvore de acordeão do app `/stack` por uma grade de quatro
**pastas** — silhueta com aba, tile de ícone com gradiente, ícone fantasma, badge de
níveis, número grande e ação —, e ao clicar a pasta vira largura cheia e lista as
tecnologias numa grade de cartões pequenos, empurrando as outras na esteira.

**Arquitetura:** o mecanismo de expandir já existe (o app é um acordeão com
`MOVIMENTO.acordeaoDispositivos`); o trabalho é a forma do bloco, a grade e a lista
interna. Números e badges são DERIVADOS dos dados por função pura, testável no vitest.
O chrome de explorador da janela não muda.

**Referência visual:** o print enviado pelo dono do projeto — tile de ícone com
gradiente no canto superior esquerdo, ícone fantasma grande embaixo à direita, badge
de contagem no topo direito, título, número grande em cor de acento, rótulo pequeno e
link de ação com seta.

**Decisões tomadas (dono do projeto):** silhueta de pasta de verdade · expandir em
largura cheia empurrando o resto · tile de ícone no acento para todos · itens em grade
de cartões pequenos com ponto de marca.

## Restrições globais

- **Tudo em PT-BR**; commits com prefixo, **nunca** `Co-Authored-By:`.
- **Nenhuma cor, duração ou curva literal nova**: vem do config pela ponte ou de token.
  Medida de layout interno de componente pode ser literal, com o porquê ao lado.
- **Acento em duas formas** (`var(--accent-color)` / `rgb(var(--accent-rgb) / X)`).
- **Cores de MARCA das tecnologias são a exceção documentada** e ficam como estão.
- **Preenchimento é ação** — mas a pasta é a superfície do conteúdo aqui, e ela É o
  alvo de clique, então tem fundo por direito.
- **Breakpoint é `@container`**, prosa tem medida, raiz tem teto de largura.
- **Manter a classe `.devices-app`** — `rotas.spec.js` a usa como seletor de corpo.
- **Movimento respeita as duas chaves.**
- **Vitest só lógica pura.**

---

## Task 1: os números derivados e as strings

**Files:**
- Modify: `frontend/src/content/tech.js`, `frontend/src/i18n/os.js`
- Test: `frontend/src/content/tech.test.js` (criar)

**Interfaces:**
- Produces: `NIVEIS` (ordem fixa), `contarNiveis(items) => [{ nivel, total }]`;
  `os.devices.{niveis, tecnologias, abrir, fechar, itensLabel}`.

- [ ] **Step 1: o teste que falha**

Criar `frontend/src/content/tech.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { getTechData, contarNiveis, NIVEIS } from './tech'

/**
 * O BADGE DE CADA PASTA É DERIVADO, não escrito.
 *
 * Ele diz "2 expert · 3 avançado" a partir dos próprios itens. Escrever essa
 * contagem à mão em `tech.js` seria criar um número que envelhece na primeira
 * tecnologia acrescentada — e este projeto já teve três desses (o "36 testes" do
 * leia-me, o "Doze papéis de parede" do balão e o "8º período").
 */
describe('contarNiveis', () => {
  it('conta por nível e ignora os que não aparecem', () => {
    const itens = [
      { level: 'Expert' }, { level: 'Expert' }, { level: 'Advanced' },
    ]
    expect(contarNiveis(itens)).toEqual([
      { nivel: 'expert', total: 2 },
      { nivel: 'advanced', total: 1 },
    ])
  })

  it('a ordem é sempre a mesma, do mais forte para o mais fraco', () => {
    // Sem ordem fixa o badge trocaria de ordem entre categorias, e duas pastas
    // lado a lado ficariam ilegíveis de comparar.
    const itens = [{ level: 'Intermediate' }, { level: 'Expert' }]
    expect(contarNiveis(itens).map((n) => n.nivel)).toEqual(['expert', 'intermediate'])
  })

  it('soma sempre o total de itens da categoria', () => {
    for (const lang of ['pt', 'en']) {
      for (const grupo of getTechData(lang).items) {
        const soma = contarNiveis(grupo.items).reduce((a, n) => a + n.total, 0)
        expect(soma, `${lang}/${grupo.id}`).toBe(grupo.items.length)
      }
    }
  })

  it('todo nível dos dados é um nível conhecido', () => {
    // Um `level` novo escrito com outro nome sairia do badge em silêncio e não
    // ganharia cor de chip — falha que só apareceria numa revisão visual.
    for (const lang of ['pt', 'en']) {
      for (const grupo of getTechData(lang).items) {
        for (const item of grupo.items) {
          expect(NIVEIS, `${lang}/${grupo.id}/${item.name}`).toContain(item.level.toLowerCase())
        }
      }
    }
  })
})

describe('dados da stack', () => {
  it('os dois idiomas têm as mesmas categorias e os mesmos tamanhos', () => {
    const pt = getTechData('pt').items
    const en = getTechData('en').items
    expect(en.map((g) => g.id)).toEqual(pt.map((g) => g.id))
    expect(en.map((g) => g.items.length)).toEqual(pt.map((g) => g.items.length))
  })

  it('toda tecnologia tem cor de marca', () => {
    // A cor é o que distingue os itens na grade; sem ela o ponto some.
    for (const grupo of getTechData('pt').items) {
      for (const item of grupo.items) {
        expect(item.color, `${grupo.id}/${item.name}`).toMatch(/^#[0-9a-f]{3,6}$/i)
      }
    }
  })
})
```

- [ ] **Step 2: rodar e ver falhar** — `cd frontend; npx vitest run src/content/tech.test.js`

- [ ] **Step 3: implementar em `tech.js`**

```js
/**
 * OS NÍVEIS, EM ORDEM FIXA — do mais forte para o mais fraco.
 *
 * A ordem existe porque o badge de cada pasta lista as contagens em sequência ("2
 * expert · 3 avançado"), e duas pastas lado a lado com ordens diferentes ficam
 * impossíveis de comparar. Também é a lista canônica: um `level` escrito com outro
 * nome não entra no badge nem ganha cor de chip, e há teste guardando isso.
 */
export const NIVEIS = ['expert', 'advanced', 'intermediate'];

/**
 * A distribuição de níveis de uma categoria, derivada dos itens.
 *
 * Derivada e não escrita: uma contagem à mão em `tech.js` envelheceria na primeira
 * tecnologia acrescentada. Este projeto já teve três números literais envelhecerem em
 * texto visível, e a regra que ficou é que quantidade na interface vem de fonte única.
 */
export const contarNiveis = (items) =>
  NIVEIS
    .map((nivel) => ({
      nivel,
      total: items.filter((i) => i.level.toLowerCase() === nivel).length,
    }))
    .filter((n) => n.total > 0);
```

- [ ] **Step 4: as strings em `i18n/os.js`**, no bloco `devices` dos dois idiomas

```js
  devices: {
    device: '…',   // já existem
    status: '…',
    /**
     * OS NÍVEIS SÃO ESCRITOS EM INGLÊS NOS DADOS (`level: "Expert"`), e é assim
     * desde a página clássica. Traduzir o dado quebraria as classes de chip
     * (`level-expert`) e a chave de contagem; traduzir só a EXIBIÇÃO resolve sem
     * mexer em nada disso. Em PT o badge fica "2 expert · 3 avançado".
     */
    niveis: { expert: 'expert', advanced: 'avançado', intermediate: 'intermediário' },
    tecnologias: 'tecnologias',
    abrir: 'Abrir',
    fechar: 'Fechar',
  },
```
(EN: `advanced: 'advanced'`, `intermediate: 'intermediate'`, `tecnologias: 'technologies'`,
`abrir: 'Open'`, `fechar: 'Close'`.)

- [ ] **Step 5: rodar, confirmar verde, commit**

`feat: a stack deriva a contagem de niveis em vez de escrever`

---

## Task 2: a ponte publica o acento profundo

**Files:** `frontend/src/config/cssBridge.js`

O tile de ícone é um gradiente do acento para um tom fundo dele. `acentoProfundo()` já
existe no config (o cristal o usa por prop); falta chegar ao CSS.

- [ ] **Step 1:**

```js
    /**
     * O TOM FUNDO DO ACENTO. Já existia como helper (`acentoProfundo`), consumido
     * pelo cristal via prop; agora o CSS também precisa dele — o tile de ícone das
     * pastas da Stack é um gradiente do acento para este tom. Publicar em vez de
     * recalcular no CSS mantém uma definição só.
     */
    '--cfg-accent-profundo': acentoProfundo(preset),
```
Acrescentar `acentoProfundo` ao import de `./system`.

- [ ] **Step 2:** asserção em `system.test.js` de que `acentoProfundo` devolve hex
válido para todo preset (se já não houver — conferir antes de duplicar).

- [ ] **Step 3: commit** — `feat: a ponte publica o tom fundo do acento`

---

## Task 3: o app

**Files:** `frontend/src/apps/DevicesApp.jsx`, `frontend/src/apps/DevicesApp.css`

### A anatomia da pasta

```
   ╭──────────╮                          <- a aba (pseudo-irmão, atrás)
┌──╯          ╰──────────────────────┐
│  ╭────╮              2 expert      │   <- tile de ícone (gradiente do acento)
│  │ ▣  │              3 avançado    │      badge de níveis, derivado
│  ╰────╯                            │
│                                    │
│  IA & Ciência de Dados             │   <- título
│  6                          ░░░    │   <- número grande, gradiente de texto
│  tecnologias             ░░░░░░    │      rótulo
│                        ░░░░░░░░    │      ícone fantasma, recortado pela borda
│  Abrir  →                          │   <- ação (span, não link: o card é o botão)
└────────────────────────────────────┘
```

### A silhueta, e por que não é `clip-path`

`clip-path: polygon()` desenharia a pasta com uma propriedade só, mas custa os cantos
arredondados (polígono só tem vértices) e mata a borda. `clip-path: path()` aceita
curvas mas exige coordenadas absolutas, e a largura da pasta varia com a grade.

A saída é a **aba como elemento irmão, atrás do corpo**: um retângulo arredondado no
topo à esquerda, com o mesmo preenchimento, sobreposto pelo corpo em ~8px. A emenda
desaparece porque as duas superfícies são a mesma cor, os cantos continuam
arredondados, e o corpo mantém `overflow: hidden` para recortar o ícone fantasma.

- [ ] **Step 1: o JSX** — estrutura (o corpo do card é `<button>`; a grade de itens é
  IRMÃ dele, nunca dentro, porque botão não pode conter conteúdo interativo)

```jsx
<ul className="devices-grade">
  {content.items.map((cat) => {
    const Icone = cat.icon
    const aberta = abertas.has(cat.id)
    const niveis = contarNiveis(cat.items)
    const corpoId = `devices-corpo-${cat.id}`

    return (
      <li key={cat.id} className={`devices-pasta${aberta ? ' devices-pasta--aberta' : ''}`}>
        <span className="devices-aba" aria-hidden="true" />

        <div className="devices-corpo">
          <button
            type="button"
            className="devices-cabeca"
            aria-expanded={aberta}
            aria-controls={corpoId}
            onClick={() => alternar(cat.id)}
          >
            <span className="devices-tile" aria-hidden="true">
              <Icone size={20} strokeWidth={1.75} />
            </span>

            <span className="devices-badge">
              {niveis.map((n) => `${n.total} ${os.devices.niveis[n.nivel]}`).join(' · ')}
            </span>

            <span className="devices-titulo">{cat.title}</span>
            <span className="devices-numero">{cat.items.length}</span>
            <span className="devices-rotulo">{os.devices.tecnologias}</span>

            <span className="devices-acao">
              {aberta ? os.devices.fechar : os.devices.abrir}
              <ChevronRight size={14} aria-hidden="true" />
            </span>

            {/* O FANTASMA vive na CABEÇA, e não na pasta: ancorado na pasta, ele
                ficaria no rodapé de uma caixa alta quando ela abrisse, atrás da
                grade de itens. Aqui ele fica sempre no canto do cabeçalho. */}
            <Icone className="devices-fantasma" aria-hidden="true" />
          </button>

          <AnimatePresence initial={false}>
            {aberta && (
              <motion.div
                id={corpoId}
                className="devices-itens-caixa"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={MOVIMENTO.acordeaoDispositivos}
              >
                <p className="devices-desc">{cat.description}</p>

                <ul className="devices-itens">
                  {cat.items.map((tech) => (
                    <li key={tech.name} className="devices-item">
                      <span
                        className="devices-ponto"
                        style={{ backgroundColor: tech.color, color: tech.color }}
                        aria-hidden="true"
                      />
                      <span className="devices-item-nome">{tech.name}</span>
                      <span className={`devices-item-nivel level-${tech.level.toLowerCase()}`}>
                        {os.devices.niveis[tech.level.toLowerCase()]}
                      </span>
                      <span className="devices-item-desc">{tech.tooltip}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </li>
    )
  })}
</ul>
```

O estado inicial muda: hoje a primeira categoria nasce ABERTA para a janela não parecer
vazia. Com pastas isso deixa de ser necessário — quatro pastas fechadas já preenchem a
janela e mostram do que se trata. **Todas nascem fechadas**, e a nota antiga sobre
"nem vazia nem gigante" é substituída pela nova razão.

- [ ] **Step 2: o CSS** — blocos, na ordem:

1. `.devices-app` — coluna, `container-type: inline-size`, teto de largura.
2. `.devices-grade` — `grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))`,
   gap. Uma coluna abaixo de ~520px de conteúdo.
3. `.devices-pasta` — `position: relative`, `padding-top` para a aba.
   `.devices-pasta--aberta { grid-column: 1 / -1 }` — é o que faz a esteira empurrar.
4. `.devices-aba` — retângulo arredondado no topo à esquerda, mesmo
   `background-color: var(--sup-fundo)`, sobreposto pelo corpo.
5. `.devices-corpo` — `overflow: hidden`, raio, `--sup-fundo` + lavagem RADIAL ancorada
   embaixo à direita (atrás do fantasma). Radial e não a `--sup-lavagem` diagonal
   porque a diagonal escurece o topo esquerdo e criaria um degrau visível na emenda com
   a aba, que é lisa.
6. `.devices-cabeca` — grade de duas colunas (tile | badge) e o resto empilhado;
   `position: relative` + `overflow: hidden` para o fantasma.
7. `.devices-tile` — 44px, raio, `linear-gradient(160deg, var(--accent-color),
   var(--cfg-accent-profundo))`, glifo branco.
8. `.devices-badge` — pílula 999px (não interativo), mono micro, `--sup-borda`.
9. `.devices-numero` — grande, peso 900, gradiente de texto do projeto.
10. `.devices-fantasma` — absoluto, canto inferior direito, ~46% da largura, opacidade
    baixa, parcialmente fora da caixa para o recorte acontecer.
11. `.devices-itens` — `repeat(auto-fill, minmax(190px, 1fr))`; cada item com o ponto na
    cor da marca, nome, chip de nível e a frase do `tooltip`.
12. Hover da pasta: a **luz que percorre a borda** já no sistema (`--sup-faixa`,
    `--sup-luz-nucleo`, `@property --giro-da-luz`) — reaproveitar em vez de inventar.
    **Se for reaproveitar o `@property`, ele precisa sair do `AboutApp.css` para
    `os/tokens.css`**, porque registro global escondido no CSS de um app é armadilha
    para o segundo consumidor. Fazer a mudança JUNTO, não depois.
13. `@media (prefers-reduced-motion: reduce)` — transições e o giro da luz.

- [ ] **Step 3: OLHAR O RENDER ANTES DE POLIR** — obrigatório

```powershell
cd frontend; npm run lint
cd frontend/visual; npm run build:frontend
npx playwright test visual.spec.js -g "stack"
```

Abrir `test-results/visual-stack-stack/stack-actual.png` e conferir:

- a aba lê como pasta, ou como retângulo solto acima do card?
- a emenda entre aba e corpo aparece?
- o fantasma lê como marca d'água, ou como sujeira?
- as quatro pastas cabem na dobra?
- o número e o badge competem, ou se hierarquizam?

Ajustar e repetir. **Não seguir para a Task 4 antes disso.**

- [ ] **Step 4: e olhar o estado ABERTO**, que a foto não pega — captura descartável
  que clica numa pasta e fotografa a grade de itens, em duas larguras.

- [ ] **Step 5: commit** — `feat: a stack vira pastas que abrem na esteira`

---

## Task 4: o teste funcional do estado aberto

**Files:** `frontend/visual/rotas.spec.js`

O próprio `rotas.spec.js` documenta a lição que se aplica aqui: *"grupo colapsado,
painel fechado e campo de busca vazio são código que só existe depois de um clique, e o
harness de fotos é estruturalmente cego a todos eles"*. Com **todas as pastas nascendo
fechadas**, a grade de itens passa a ser exatamente esse tipo de código — o regressor
fotografa o repouso e nunca a renderiza.

- [ ] **Step 1: o teste**

```js
/**
 * ABRIR UMA PASTA DA STACK RENDERIZA A GRADE DE ITENS.
 *
 * Com as quatro pastas nascendo fechadas, a grade de tecnologias só existe depois de um
 * clique — e o regressor visual fotografa o estado de repouso. É a mesma classe de
 * defeito que este arquivo já documenta no chrome de explorador: subárvore que só
 * monta sob interação não tem quem a cubra além daqui.
 *
 * Também fixa a promessa da ESTEIRA: a pasta aberta ocupa a linha inteira da grade, e é
 * isso que empurra as outras para baixo.
 */
test('abrir uma pasta da stack lista as tecnologias', async ({ page, context }) => {
  await definirPreferencias(context)
  const erros = []
  page.on('pageerror', (e) => erros.push(e.message))

  await page.goto('/stack', { waitUntil: 'networkidle' })
  await passarDaCerimonia(page)
  await expect(page.locator('.devices-app')).toBeVisible({ timeout: 8000 })

  // Em repouso: quatro pastas, nenhum item.
  await expect(page.locator('.devices-pasta')).toHaveCount(4)
  await expect(page.locator('.devices-item')).toHaveCount(0)

  const primeira = page.locator('.devices-pasta').first()
  await primeira.locator('.devices-cabeca').click()

  // A categoria de IA tem seis tecnologias, e o badge tem de somar o mesmo.
  await expect(primeira.locator('.devices-item')).toHaveCount(6)
  await expect(primeira).toHaveClass(/devices-pasta--aberta/)

  // A esteira: a pasta aberta é mais larga que uma fechada.
  const largaAberta = (await primeira.boundingBox()).width
  const largaFechada = (await page.locator('.devices-pasta').nth(2).boundingBox()).width
  expect(largaAberta).toBeGreaterThan(largaFechada * 1.5)

  // E fechar devolve a grade ao repouso.
  await primeira.locator('.devices-cabeca').click()
  await expect(primeira.locator('.devices-item')).toHaveCount(0)

  expect(erros, `erro de página não capturado: ${erros.join('; ')}`).toHaveLength(0)
})
```

- [ ] **Step 2:** o total de testes muda — atualizar `SISTEMA.testes` em
  `content/sistema.js` **por último**, depois de a suíte estar verde, e conferir a
  contagem contando de novo (é o número que as duas janelas exibem).

- [ ] **Step 3: commit** — `test: abrir uma pasta da stack lista as tecnologias`

---

## Task 5: rebaseline e o que a suíte não vê

- [ ] **Step 1: a suíte inteira, com o diff conferido**

Esperado: `stack` e `stack-claro` mudam por completo. Nenhuma outra cena deve mudar —
este trabalho não troca ícone de app nem token global. **Se outra cena mudar, é sinal:
provavelmente o `@property` que saiu do `AboutApp.css` para `tokens.css`.**

- [ ] **Step 2: verificar no navegador** o que a foto não pega:

- abrir e fechar cada pasta, e a esteira empurrando;
- abrir uma pasta da coluna DIREITA — é o caso que deixa o vão ao lado do par, e é o
  custo aceito da decisão de largura cheia;
- `:hover` e `:focus-visible` das pastas e dos itens, e a luz na borda;
- navegação por teclado: Tab entre as quatro cabeças, Enter/Espaço abrindo;
- Movimento desligado e `prefers-reduced-motion`;
- janela maximizada em tela grande (a grade ganha colunas, medida limitada);
- presets XP, sóbrio e Brasa — se algum tile continuar violeta com Brasa, o gradiente
  não está vindo do acento;
- tema claro inteiro, e em especial as cores de marca dos pontos.

- [ ] **Step 3: atualizar a skill** com o que virou padrão: a silhueta por aba-irmã, o
  `@property` promovido a `tokens.css`, e a nota de que estado sob interação precisa de
  teste funcional.

- [ ] **Step 4: commit**

---

## Auto-revisão

**Cobertura:** silhueta de pasta → Task 3 Step 2 (4-5). Largura cheia empurrando →
Task 3 (`--aberta`) + Task 4 (asserção). Tile no acento → Task 2 + Task 3 (7). Grade de
itens com ponto de marca → Task 3 (11). Anatomia do print (tile, fantasma, badge,
número, ação) → Task 3. Números derivados → Task 1.

**Sem placeholder:** o CSS é descrito bloco a bloco de propósito — o Step 3 existe para
ajustá-lo olhando o render, e escrever CSS "final" no plano foi o que custou três
refações no "Sobre este PC".

**Três achados da revisão, já incorporados:**

1. **A grade de itens não pode ficar dentro do `<button>`.** O card inteiro é o alvo de
   clique, mas botão não pode conter conteúdo interativo nem listas complexas. A cabeça
   é o botão; a caixa de itens é irmã dela, dentro da pasta.
2. **O fantasma tem de viver na CABEÇA, não na pasta.** Ancorado na pasta, ele iria
   para o rodapé quando ela abrisse — atrás da grade de itens.
3. **A lavagem do corpo precisa ser RADIAL ancorada embaixo à direita.** A
   `--sup-lavagem` do sistema é diagonal a 160° e escurece o topo esquerdo, o que criaria
   um degrau visível exatamente na emenda com a aba, que é lisa.

**Uma dívida que este trabalho paga:** o `@property --giro-da-luz` está registrado dentro
de `apps/AboutApp.css`. Era certo com um consumidor; com dois vira armadilha (registro
global escondido no CSS de um app, e o segundo app depende de o primeiro ter carregado).
Sobe para `os/tokens.css` **no mesmo commit** que o segundo consumidor.
