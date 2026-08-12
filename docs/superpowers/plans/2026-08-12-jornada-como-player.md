# A "Jornada" como player — plano de implementação

> **Para trabalhadores agênticos:** SUB-SKILL OBRIGATÓRIA: use
> `superpowers:executing-plans` para executar tarefa por tarefa. Os passos usam
> `- [ ]` para rastreio.

**Objetivo:** trocar a lista vertical de `git log` do app `/jornada` por um player,
cuja barra de progresso é a linha do tempo real da carreira — marcadores em posição
proporcional ao ano, para os vãos entre eles carregarem informação.

**Arquitetura:** os dados ganham `ano` (number) e `futuro` (boolean) e uma função
pura de posição, testável no vitest. O app vira quatro blocos — agora tocando, linha
do tempo, controles, lista de faixas — reaproveitando o vocabulário que o sistema já
tem (`--sup-faixa` para o item em destaque, a luz de hover na borda, o gradiente de
texto da capa, container queries para duas colunas no maximizado). O chrome de
explorador da janela não muda.

**Stack:** React 18 + Vite, CSS puro com custom properties, vitest
(`environment: 'node'`, só lógica pura), Playwright em `frontend/visual/`.

**Spec:** `docs/superpowers/specs/2026-08-12-jornada-como-player-design.md`

## Restrições globais

- **Tudo em PT-BR:** código, comentários, mensagens de commit. **Nunca**
  `Co-Authored-By:`.
- **Nenhum valor visual literal novo** de cor, duração ou curva: vem de
  `config/system.js` pela ponte, ou de token existente. Medida de layout INTERNO de
  componente pode ser literal, com o porquê ao lado (precedente: `.about-crystal`).
- **Acento em duas formas:** `var(--accent-color)` e `rgb(var(--accent-rgb) / X)`.
  Nenhum `rgba(168,85,247,X)`.
- **Cores de categoria são a exceção documentada** e têm variante por tema — o bloco
  `--history-accent` existente é preservado integralmente.
- **Superfície:** `--sup-fundo`/`--sup-borda` para bloco que é ação ou destaque;
  filete e tipografia para o resto. Preenchimento é ação.
- **Breakpoint é `@container`, não `@media`.** A janela é o container.
- **Prosa tem medida** em `ch`; a raiz tem teto de largura com `margin-inline: auto`.
- **Movimento respeita duas chaves:** o interruptor das Configurações e
  `prefers-reduced-motion`.
- **Nada de `<audio>` nem `role="slider"`.**
- **Vitest só lógica pura** (`src/**/*.test.js`, sem DOM).
- **Não acrescentar dependência** ao `frontend/package.json`.

---

## Estrutura de arquivos

| arquivo | responsabilidade |
|---|---|
| `frontend/src/content/journey.js` | dados + `posicaoNaLinha()` |
| `frontend/src/content/journey.test.js` | **novo** — posição e invariantes dos dados |
| `frontend/src/apps/HistoryApp.jsx` | o player |
| `frontend/src/apps/HistoryApp.css` | o CSS do player |
| `frontend/src/os/registry.js` | ícone `Disc3` |
| `frontend/src/config/system.js` | as duas durações |
| `frontend/src/config/cssBridge.js` | `--cfg-jornada-*` |
| `frontend/src/config/system.test.js` | asserções das durações |

---

## Task 1: os dados e a matemática da linha do tempo

**Files:**
- Modify: `frontend/src/content/journey.js`
- Test: `frontend/src/content/journey.test.js` (criar)

**Interfaces:**
- Produces: `posicaoNaLinha(entradas, entrada, anoAtual) => number` (0..100);
  cada entrada com `ano: number`; a entrada de roadmap com `futuro: true`;
  `subtitle` reescrito.

- [ ] **Step 1: escrever o teste que falha**

Criar `frontend/src/content/journey.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { getJourneyData, posicaoNaLinha } from './journey'

/**
 * A POSIÇÃO NA BARRA É O ARGUMENTO INTEIRO DA REFATORAÇÃO.
 *
 * A barra do player é a linha do tempo real da carreira: os marcadores ficam em
 * posição proporcional ao ANO, e é isso que faz os vãos entre eles carregarem
 * informação (três anos entre 2019 e 2022; um ano entre 2024 e 2025). Se esta conta
 * estiver errada, a barra mente sobre o tempo — e mentir sobre o tempo é o único
 * jeito de este design não valer nada.
 *
 * `anoAtual` entra por PARÂMETRO, e não de um `new Date()` dentro da função: é a
 * mesma decisão de `idadeEm()` em `profile.js`, e é o que torna o teste
 * determinístico em qualquer máquina e em qualquer dia.
 */
describe('posicaoNaLinha', () => {
  const entradas = getJourneyData('pt').items

  it('a primeira entrada abre a barra e a futura fecha', () => {
    const primeira = entradas.find((e) => e.ano === 2018)
    const futura = entradas.find((e) => e.futuro)
    expect(posicaoNaLinha(entradas, primeira, 2026)).toBe(0)
    expect(posicaoNaLinha(entradas, futura, 2026)).toBe(100)
  })

  it('as posições são proporcionais ao ano, não ao índice', () => {
    const pos = (ano) => posicaoNaLinha(entradas, entradas.find((e) => e.ano === ano), 2026)
    // 2018..2026 é a extensão; cada ano vale 12,5%.
    expect(pos(2018)).toBe(0)
    expect(pos(2019)).toBe(12.5)
    expect(pos(2022)).toBe(50)
    expect(pos(2024)).toBe(75)
    expect(pos(2025)).toBe(87.5)
  })

  it('os vãos entre marcadores refletem os vãos entre os anos', () => {
    const pos = (ano) => posicaoNaLinha(entradas, entradas.find((e) => e.ano === ano), 2026)
    // O salto de 2019 para 2022 é TRÊS vezes o de 2024 para 2025. É a única coisa
    // que este design mostra e a lista vertical não mostrava.
    expect(pos(2022) - pos(2019)).toBeCloseTo(3 * (pos(2025) - pos(2024)), 5)
  })

  it('a barra cresce com o ano atual em vez de encostar no fim', () => {
    const ultima = entradas.find((e) => e.ano === 2025)
    // Em 2026 a última entrada real não está no fim da barra: sobra o vão até hoje.
    expect(posicaoNaLinha(entradas, ultima, 2026)).toBeLessThan(100)
    // E em 2030 ela recua mais ainda — a linha do tempo é viva.
    expect(posicaoNaLinha(entradas, ultima, 2030)).toBeLessThan(
      posicaoNaLinha(entradas, ultima, 2026),
    )
  })

  it('nunca sai de 0..100, nem com ano atual no passado', () => {
    for (const e of entradas) {
      for (const ano of [2018, 2026, 2050]) {
        const p = posicaoNaLinha(entradas, e, ano)
        expect(p, `${e.id} em ${ano}`).toBeGreaterThanOrEqual(0)
        expect(p, `${e.id} em ${ano}`).toBeLessThanOrEqual(100)
      }
    }
  })
})

describe('dados da jornada', () => {
  for (const lang of ['pt', 'en']) {
    it(`${lang}: toda entrada tem ano, e existe exatamente uma futura`, () => {
      const itens = getJourneyData(lang).items
      expect(itens.length).toBeGreaterThan(1)

      const futuras = itens.filter((e) => e.futuro)
      expect(futuras.length, 'a barra tem UM marcador vazado, no fim').toBe(1)

      for (const e of itens) {
        if (e.futuro) continue
        expect(typeof e.ano, `${e.id}.ano`).toBe('number')
        expect(e.ano, `${e.id}.ano`).toBeGreaterThan(2000)
      }
    })

    it(`${lang}: os dois idiomas descrevem a mesma trajetória`, () => {
      // Os ids e os anos têm de bater entre PT e EN, senão a barra muda de forma
      // quando o visitante troca de idioma.
      const pt = getJourneyData('pt').items
      const outros = getJourneyData(lang).items
      expect(outros.map((e) => e.id)).toEqual(pt.map((e) => e.id))
      expect(outros.map((e) => e.ano ?? null)).toEqual(pt.map((e) => e.ano ?? null))
    })
  }
})
```

- [ ] **Step 2: rodar e confirmar que falha**

```powershell
cd frontend; npx vitest run src/content/journey.test.js
```
Esperado: FAIL — `posicaoNaLinha is not a function`.

- [ ] **Step 3: implementar**

Em `frontend/src/content/journey.js`, acrescentar `ano` a cada entrada nos DOIS
idiomas (2018 · 2019 · 2022 · 2024 · 2025) e `futuro: true` no `step-next`; e no fim
do arquivo, antes dos objetos de conteúdo:

```js
/**
 * A POSIÇÃO DE UMA ENTRADA NA BARRA DO PLAYER, em 0..100.
 *
 * É a peça que faz o design valer: a barra é a linha do tempo REAL, então o
 * marcador de 2022 fica a meio caminho porque 2022 é o meio de 2018..2026 — não
 * porque é a terceira de seis. É o que faz os vãos entre marcadores dizerem
 * "três anos aqui, um ano ali", coisa que uma lista de cards de altura igual não
 * consegue dizer.
 *
 * `anoAtual` VEM POR PARÂMETRO, e não de um `new Date()` aqui dentro: é a mesma
 * decisão de `idadeEm()` em `profile.js` — função que lê o relógio não tem teste
 * determinístico, e esta é a conta que não pode estar errada.
 *
 * O FIM DA BARRA É O ANO ATUAL, não o ano da última entrada. Assim a última
 * posição real recua um pouco a cada ano que passa e sobra o vão até hoje, que é
 * a leitura honesta: a trajetória continua acontecendo. Se o fim fosse a última
 * entrada, ela ficaria colada em 100% e a barra pareceria terminada.
 *
 * LIMITE ACEITO: duas entradas no mesmo ano se sobrepõem. Não acontece hoje, e
 * forçar espaçamento mínimo faria a barra mentir sobre o tempo — que é a única
 * coisa que ela existe para dizer.
 */
export const posicaoNaLinha = (entradas, entrada, anoAtual) => {
  // A entrada de roadmap não tem ano: ela é o fim da barra por definição.
  if (entrada.futuro) return 100;

  const anos = entradas.filter((e) => !e.futuro).map((e) => e.ano);
  const inicio = Math.min(...anos);
  const fim = Math.max(anoAtual, ...anos);

  // Uma entrada só, ou todas no mesmo ano: sem extensão para dividir.
  if (fim === inicio) return 0;

  const bruto = ((entrada.ano - inicio) / (fim - inicio)) * 100;
  return Math.min(100, Math.max(0, bruto));
};
```

E o `subtitle` dos dois idiomas:

```js
  // O anterior dizia "Do mais recente para o mais antigo, como todo log que se
  // preze" — virou FALSO quando a barra passou a ser cronológica. O novo aponta
  // para o que a barra faz de diferente.
  subtitle: 'Sete anos em seis faixas. Os vãos entre elas também contam.',
```
(EN: `'Seven years in six tracks. The gaps between them count too.'`)

Atualizar também a nota de ORDEM no cabeçalho do arquivo: a ordem do array continua
a mais-recente-primeiro, mas agora quem a consome ordena por `ano`; o que a ordem
preserva é qual entrada nasce SELECIONADA.

- [ ] **Step 4: rodar e confirmar que passa**

```powershell
cd frontend; npx vitest run src/content/journey.test.js
```
Esperado: PASS.

- [ ] **Step 5: commit**

`feat: a jornada ganha ano e a conta da posição na linha do tempo`

---

## Task 2: as durações no config

**Files:**
- Modify: `frontend/src/config/system.js`, `frontend/src/config/cssBridge.js`,
  `frontend/src/config/system.test.js`

- [ ] **Step 1: `MOVIMENTO`**

```js
  /**
   * O PASSEIO AUTOMÁTICO DA JORNADA — quanto cada entrada fica na tela.
   *
   * 6s é PASSEIO, não leitura: a descrição de cada entrada tem 50-70 palavras, e
   * dar os ~20s que ela pede faria a volta durar dois minutos. Quem quer ler para
   * o passeio e lê; o passeio existe para mostrar a FORMA da trajetória.
   */
  jornadaPasseioS: 6,

  /** A troca entre entradas: o painel de "agora tocando" e o playhead. */
  jornadaTrocaS: 0.32,
```

- [ ] **Step 2: a ponte**

```js
    '--cfg-jornada-passeio': `${MOVIMENTO.jornadaPasseioS}s`,
    '--cfg-jornada-troca': `${MOVIMENTO.jornadaTrocaS}s`,
```

- [ ] **Step 3: as asserções**

No teste `preserva as transicoes nomeadas do movimento`:

```js
    expect(MOVIMENTO.jornadaPasseioS).toBe(6)
    expect(MOVIMENTO.jornadaTrocaS).toBe(0.32)
    // O passeio tem de ser MUITO mais longo que a troca, senão a entrada nova
    // aparece já saindo.
    expect(MOVIMENTO.jornadaPasseioS).toBeGreaterThan(MOVIMENTO.jornadaTrocaS * 10)
```

- [ ] **Step 4: rodar** — `cd frontend; npm run lint; npm test`

- [ ] **Step 5: commit** — `feat: as duas duracoes do player da jornada no config`

---

## Task 3: o app

**Files:**
- Modify: `frontend/src/apps/HistoryApp.jsx`, `frontend/src/apps/HistoryApp.css`

**Interfaces:**
- Consumes: `posicaoNaLinha`, `getJourneyData`, `MOVIMENTO.jornada*`, `useTheme`
  (`isAnimated`), `useReducedMotion`, `--sup-*`, `--history-accent`.

- [ ] **Step 1: o JSX**

Estrutura, com o estado e as regras:

```jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { Disc3, Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import { getJourneyData, posicaoNaLinha } from '../content/journey'
import { MOVIMENTO } from '../config/system'
import AppHeader from '../ui/AppHeader'
import './HistoryApp.css'
```

Dentro do componente:

```jsx
  const { language } = useLanguage()
  const { isAnimated } = useTheme()
  const prefereMenosMovimento = useReducedMotion()
  const content = getJourneyData(language)

  /**
   * A ORDEM DA TELA É CRONOLÓGICA, e a do array não.
   *
   * `journey.js` guarda do mais recente para o mais antigo, por uma razão que
   * continua boa (registrada lá). Mas uma linha do tempo da esquerda para a
   * direita TEM de ser cronológica, ou os vãos entre marcadores não significam
   * nada. Ordenar aqui, por `ano`, mantém as duas decisões: a estrutura é
   * cronológica e a ATENÇÃO continua na entrada mais recente, que é a que nasce
   * selecionada logo abaixo.
   *
   * Ordena por `ano` e não por índice invertido: assim continua certo se alguém
   * reordenar o array ou acrescentar uma entrada no meio.
   */
  const faixas = useMemo(
    () =>
      [...content.items].sort((a, b) => {
        if (Boolean(a.futuro) !== Boolean(b.futuro)) return a.futuro ? 1 : -1
        return a.ano - b.ano
      }),
    [content.items],
  )

  /** A última entrada que JÁ ACONTECEU — o cargo atual, que é o que o visitante
   *  veio saber. O roadmap fica visível na barra, mas não é o que abre. */
  const indiceInicial = useMemo(
    () => faixas.reduce((acc, f, i) => (f.futuro ? acc : i), 0),
    [faixas],
  )

  const [indice, setIndice] = useState(indiceInicial)
  const [passeando, setPasseando] = useState(false)

  /** O ano atual entra no cálculo da barra. Lido aqui e não dentro da função pura
   *  — ver a nota em `posicaoNaLinha`. */
  const anoAtual = new Date().getFullYear()

  /**
   * O PASSEIO SÓ EXISTE SE HOUVER MOVIMENTO, e aqui ele SOME em vez de parar.
   *
   * É uma divergência consciente em relação à luz de hover do "Sobre este PC", que
   * continua acendendo parada. A distinção: a luz é RETORNO — sem ela o visitante
   * perde o único sinal de que o alvo é clicável. O passeio é o próprio MOVIMENTO;
   * sem ele o botão não tem função, e botão que não faz nada é pior que nenhum.
   */
  const mostrarPasseio = isAnimated && !prefereMenosMovimento

  /** Qualquer navegação manual pausa o passeio: conteúdo se mexendo enquanto a
   *  pessoa escolheu outra coisa é hostil. */
  const irPara = (i) => {
    setIndice(Math.min(faixas.length - 1, Math.max(0, i)))
    setPasseando(false)
  }

  /** "Percorrer do início": salta para a primeira e caminha. Não dá laço — uma
   *  carreira não repete. */
  const alternarPasseio = () => {
    if (passeando) return setPasseando(false)
    setIndice(0)
    setPasseando(true)
  }

  useEffect(() => {
    if (!passeando || !mostrarPasseio) return
    if (indice >= faixas.length - 1) {
      setPasseando(false)
      return
    }
    const id = setTimeout(() => setIndice((i) => i + 1), MOVIMENTO.jornadaPasseioS * 1000)
    return () => clearTimeout(id)
  }, [passeando, mostrarPasseio, indice, faixas.length])

  const atual = faixas[indice]
  const posicaoAtual = posicaoNaLinha(faixas, atual, anoAtual)

  const aoTeclar = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); irPara(indice - 1) }
    if (e.key === 'ArrowRight') { e.preventDefault(); irPara(indice + 1) }
  }
```

O `return`, em quatro blocos:

```jsx
  return (
    <div className="history-app">
      <AppHeader
        eyebrow={content.sectionLabel}
        titulo={content.title}
        subtitulo={content.subtitle}
        escala="md"
      />

      {/* --- 1. AGORA TOCANDO --- */}
      <section className={`history-agora history-agora--${atual.type}`}>
        <div className="history-capa" aria-hidden="true">
          <span className="history-capa-ano">{atual.futuro ? content.proximoCurto : atual.ano}</span>
        </div>

        <div className="history-agora-texto">
          <p className="history-meta">
            <span className="history-tipo">{atual.type}</span>
            <span className="history-meta-sep" aria-hidden="true">·</span>
            <span>{atual.org}</span>
          </p>
          {/* `aria-live` no título: quem navega por teclado precisa saber que a
              troca aconteceu. */}
          <h3 className="history-titulo" aria-live="polite">{atual.title}</h3>
          <p className="history-data">{atual.date}</p>
          <p className="history-desc">{atual.description}</p>

          <ul className="history-tags">
            {atual.tags.map((tag) => (
              <li key={tag} className="history-tag">{tag}</li>
            ))}
          </ul>

          {/* O MOSTRADOR TÉCNICO — é aqui que o `git log` do design anterior
              sobrevive. Player mostra bitrate e codec; este mostra o commit. */}
          <p className="history-readout">
            commit {atual.hash} · {atual.type} · {atual.tags.length} tags
          </p>
        </div>
      </section>

      {/* --- 2. A LINHA DO TEMPO ---
              Lista de saltos, não slider: seis destinos, sem valor contínuo. */}
      <div
        className="history-linha"
        role="group"
        aria-label={content.linhaLabel}
        tabIndex={0}
        onKeyDown={aoTeclar}
      >
        <div className="history-trilho" aria-hidden="true">
          <div className="history-trilho-feito" style={{ width: `${posicaoAtual}%` }} />
        </div>

        <ul className="history-marcos">
          {faixas.map((f, i) => (
            <li
              key={f.id}
              className={`history-marco-item history-marco-item--${f.type}`}
              style={{ left: `${posicaoNaLinha(faixas, f, anoAtual)}%` }}
            >
              <button
                type="button"
                className={`history-marco${f.futuro ? ' history-marco--futuro' : ''}${i === indice ? ' history-marco--ativo' : ''}`}
                aria-label={`${f.date} — ${f.title}`}
                aria-current={i === indice ? 'true' : undefined}
                onClick={() => irPara(i)}
              />
            </li>
          ))}
        </ul>

        <div className="history-linha-pontas" aria-hidden="true">
          <span>{faixas[0]?.ano}</span>
          <span>{content.proximoCurto}</span>
        </div>
      </div>

      {/* --- 3. CONTROLES --- */}
      <div className="history-controles">
        <button type="button" className="history-btn" aria-label={content.controles.primeira}
          onClick={() => irPara(0)} disabled={indice === 0}>
          <SkipBack size={16} aria-hidden="true" />
        </button>
        <button type="button" className="history-btn" aria-label={content.controles.anterior}
          onClick={() => irPara(indice - 1)} disabled={indice === 0}>
          <ChevronLeft size={18} aria-hidden="true" />
        </button>

        {mostrarPasseio && (
          <button
            type="button"
            className="history-btn history-btn--passeio"
            aria-label={passeando ? content.controles.pausar : content.controles.passear}
            aria-pressed={passeando}
            onClick={alternarPasseio}
          >
            {passeando ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          </button>
        )}

        <button type="button" className="history-btn" aria-label={content.controles.proxima}
          onClick={() => irPara(indice + 1)} disabled={indice === faixas.length - 1}>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
        <button type="button" className="history-btn" aria-label={content.controles.ultima}
          onClick={() => irPara(faixas.length - 1)} disabled={indice === faixas.length - 1}>
          <SkipForward size={16} aria-hidden="true" />
        </button>

        <span className="history-contador">
          {content.contador.replace('%a', indice + 1).replace('%b', faixas.length)}
        </span>
      </div>

      {/* --- 4. LISTA DE FAIXAS --- */}
      <section className="history-faixas-secao">
        <p className="history-eyebrow">{content.faixasLabel}</p>
        <ul className="history-faixas">
          {faixas.map((f, i) => (
            <li key={f.id} className={`history-faixa-item history-faixa-item--${f.type}`}>
              <button
                type="button"
                className={`history-faixa${i === indice ? ' history-faixa--ativa' : ''}`}
                aria-current={i === indice ? 'true' : undefined}
                onClick={() => irPara(i)}
              >
                <span className="history-faixa-num">{i + 1}</span>
                <span className={`history-faixa-ponto${f.futuro ? ' history-faixa-ponto--futuro' : ''}`} aria-hidden="true" />
                <span className="history-faixa-data">{f.date}</span>
                <span className="history-faixa-titulo">{f.title}</span>
                {i === indice && <Disc3 size={14} className="history-faixa-agora" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
```

- [ ] **Step 2: as strings novas em `journey.js`**

`proximoCurto`, `linhaLabel`, `faixasLabel`, `contador` (com `%a`/`%b`) e
`controles: { primeira, anterior, passear, pausar, proxima, ultima }`, nos dois
idiomas. Elas são de INTERFACE e não de portfólio — mas ficam junto do resto do
conteúdo da jornada, como `dateLabel` e `authorLabel` já ficam.

`dateLabel` e `authorLabel` perdem o consumidor (o card antigo os usava): **remover**,
com nota de que a data agora tem lugar próprio e a organização entra na linha de meta.

- [ ] **Step 3: o CSS, primeira passada**

Reescrever `HistoryApp.css` preservando integralmente o bloco de `--history-accent`
(com as variantes de tema claro) e o comentário do prefixo `history-`. Blocos:

1. `.history-app` — coluna flex, `container-type: inline-size`, teto de largura com
   `margin-inline: auto`.
2. `.history-agora` — grade capa + texto; `--history-accent` vindo do modificador de
   tipo.
3. `.history-capa` — quadrada, `--sup-fundo` + `--sup-borda`, lavagem tingida pela
   COR DE CATEGORIA (a única superfície do app que foge do acento, pelo motivo já
   documentado), o ano em `clamp(..., cqi, ...)` peso 900 com o gradiente de texto do
   projeto.
4. `.history-linha` — trilho de 2px, `.history-trilho-feito` em gradiente do acento,
   marcadores posicionados por `left: N%` com `transform: translateX(-50%)`, o futuro
   vazado, o ativo maior e com halo.
5. `.history-controles` — botões com `--win-control-radius`, hover pela luz da borda
   do sistema.
6. `.history-faixas` — linhas compactas, a ativa com `--sup-faixa` +
   `--sup-faixa-borda`.
7. `@container (min-width: 760px)` — duas colunas.
8. `@media (prefers-reduced-motion: reduce)` — sem transição de troca.

- [ ] **Step 4: OLHAR O RENDER ANTES DE POLIR** — este passo é obrigatório

A lição da refatoração do "Sobre este PC": CSS desenhado às cegas foi refeito três
vezes. Capturar e olhar ANTES de considerar o CSS pronto.

```powershell
cd frontend; npm run lint
cd frontend/visual; npm run build:frontend
npx playwright test visual.spec.js -g "jornada"
```

As duas cenas vão reprovar (é a mudança pretendida). Abrir
`test-results/visual-jornada-jornada/jornada-actual.png` e conferir, nesta ordem:

- os marcadores estão em posição proporcional, e os vãos são visíveis?
- a capa lê como capa, ou como caixa vazia com número?
- o painel de agora tocando cabe sem a descrição estourar?
- a lista de faixas cabe na dobra ou empurra tudo?
- alguma coisa alinhada fora da espinha esquerda?

Ajustar e repetir até o render estar certo. **Não seguir para a Task 4 antes disso.**

- [ ] **Step 5: commit** — `feat: a jornada vira um player, e a barra e a linha do tempo`

---

## Task 4: o ícone

**Files:**
- Modify: `frontend/src/os/registry.js`

- [ ] **Step 1: trocar**

`GitCommitVertical` → `Disc3` no import e no app `history`, com nota:

```js
    // Disc3 e não GitCommitVertical: o conteúdo virou um player (spec de
    // 2026-08-12), e um vinil lê como player na hora. "Disco" também é registro de
    // algo, que é o que um log de carreira é.
    // O ícone do XP NÃO acompanha: `ui/xpIcons.jsx` mantém `PastaRelogio`, porque
    // aquele preset cita a época e pasta-com-relógio era o idioma de "documentos
    // recentes" dela.
    icon: Disc3,
```

Conferir se `GitCommitVertical` continua usado por outro app; se não, remover do
import.

- [ ] **Step 2: a suíte inteira, e o rebaseline conferido**

```powershell
cd frontend; npm test
cd frontend/visual; npm run build:frontend; npm test
```

Esperado: quase toda cena reprova — o ícone está na grade do desktop, no menu
Iniciar, na lateral do explorador (seis apps), na porta do guia do "Sobre" e na
taskbar.

**Conferir diff por diff, e a distinção importa:**

| cena | o que pode ter mudado |
|---|---|
| `jornada`, `jornada-claro` | o app inteiro (design novo) |
| todas as outras | **só o glifo.** Nenhum ícone pode ter mudado de POSIÇÃO |

```powershell
cd frontend/visual; npm run report
cd frontend/visual; npm run test:update
```

- [ ] **Step 3: confirmar verde** — rodar `npm test` de novo depois do update.

- [ ] **Step 4: commit** — `feat: o icone da jornada vira um disco`

---

## Task 5: o que a suíte não vê

- [ ] **Step 1: verificar no navegador** (`npm run dev` no `frontend/`)

- o passeio automático caminhando, e **pausando** ao clicar num marcador/faixa;
- o passeio **ausente** com Movimento desligado nas Configurações;
- idem com `prefers-reduced-motion` forçado no DevTools;
- `:hover` e `:focus-visible` dos marcadores, das faixas e dos cinco controles;
- ← e → com foco na barra;
- a janela **maximizada** em tela grande: duas colunas, medida da descrição limitada;
- presets **XP**, um **sóbrio** e o **Brasa** (não roxo) — se algo continuar violeta,
  ficou literal;
- o **tema claro** inteiro, e em especial as cores de categoria (elas têm variantes
  próprias de dia).

- [ ] **Step 2: atualizar a skill do frontend**

O que este trabalho deixar de padrão novo, e a nota de que **trocar ícone de app
rebaselina quase toda cena**, igual a acrescentar app.

- [ ] **Step 3: commit** — `docs: a skill aprende o player da jornada`

---

## Auto-revisão

**Cobertura da spec:** §2 a barra → Task 1 (a conta) + Task 3 (o desenho). §3
mostrador técnico → Task 3 Step 1. §4 layout, capa, linha, controles, faixas → Task 3.
§5 dados → Task 1. §5.3 subtitle → Task 1 Step 3. §5.4 o que não muda → respeitado
(AppHeader fica, `sectionLabel` fica). §6 ícone → Task 4. §7 config → Task 2. §8
acessibilidade → Task 3 Step 1 (`aria-label`, `aria-current`, `aria-live`, sem
`role="slider"`). §10 verificação → Tasks 3-5.

**Sem placeholder:** todo passo traz código ou comando exato, menos o CSS da Task 3
Step 3 — que é descrito bloco a bloco de propósito, porque o Step 4 existe para
ajustá-lo olhando o render. Escrever CSS "final" no plano foi exatamente o que
custou três refações no trabalho anterior.

**Consistência de tipos:** `posicaoNaLinha(entradas, entrada, anoAtual)` é chamada com
os três argumentos no app e no teste. `faixas` é sempre o array ORDENADO — todos os
`indice` do componente indexam ele, nunca `content.items`. As classes do JSX que o
CSS precisa cobrir: `history-app`, `history-agora`, `history-agora--{type}`,
`history-capa`, `history-capa-ano`, `history-agora-texto`, `history-meta`,
`history-tipo`, `history-meta-sep`, `history-titulo`, `history-data`, `history-desc`,
`history-tags`, `history-tag`, `history-readout`, `history-linha`, `history-trilho`,
`history-trilho-feito`, `history-marcos`, `history-marco-item`,
`history-marco-item--{type}`, `history-marco`, `history-marco--futuro`,
`history-marco--ativo`, `history-linha-pontas`, `history-controles`, `history-btn`,
`history-btn--passeio`, `history-contador`, `history-faixas-secao`,
`history-eyebrow`, `history-faixas`, `history-faixa-item`,
`history-faixa-item--{type}`, `history-faixa`, `history-faixa--ativa`,
`history-faixa-num`, `history-faixa-ponto`, `history-faixa-ponto--futuro`,
`history-faixa-data`, `history-faixa-titulo`, `history-faixa-agora`.

**Uma correção achada na revisão:** o `useEffect` do passeio não pode chamar
`setPasseando` de dentro do updater de `setIndice` — em StrictMode o updater roda duas
vezes e o efeito colateral duplica. O código acima já checa `indice >= length - 1`
ANTES de agendar, o que resolve sem efeito dentro de updater.

**Segunda correção:** `faixas` sai de `content.items` com `[...]` antes do `sort`.
`Array.prototype.sort` muta, e mutar o array do módulo de conteúdo faria a ordem
documentada em `journey.js` mudar em tempo de execução — inclusive para o próximo
consumidor daqueles dados.
