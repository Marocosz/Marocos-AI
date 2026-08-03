# NoiseOS Fase 1 — O Sistema (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Colocar de pé o window manager, o shell de desktop e o wallpaper do NoiseOS, validados com um único app trivial (`ReadmeApp`), sem migrar nenhum outro conteúdo.

**Architecture:** Um reducer puro (`os/windowManager.js`) é a fonte única de verdade sobre janelas abertas, foco e z-order — sem React, testável em Node. Um registry declarativo (`os/registry.js`) descreve cada app. Um par de funções puras (`os/routes.js`) traduz `pathname ⇄ appId`. O `WindowManagerContext` costura os três e expõe ações. `<Window>` é chrome genérico que recebe qualquer app como children — apps nunca sabem que janelas existem.

**Tech Stack:** React 19, Vite 7, `motion/react` (Framer Motion 12) para drag, `lucide-react` para ícones, Vitest para os testes puros. Nenhuma dependência nova de runtime.

## Global Constraints

- Projeto é **JavaScript puro com JSX** — sem TypeScript, sem anotações de tipo. Extensão `.jsx` para componentes, `.js` para lógica pura.
- Comentários e strings de UI em **PT-BR**, seguindo o resto do repositório.
- Texto de UI **nunca** hardcoded em componente: vai para `src/data/os.js` seguindo a convenção `getOsData(lang)` já usada pelos outros seis arquivos de `src/data/`.
- **Nenhuma alteração em `backend/`** e nenhuma alteração nos arquivos de conteúdo existentes em `src/data/` (`content.js`, `projects.js`, `journey.js`, `tech.js`, `contact.js`, `startMenu.js`).
- Escala de z-index fixa: wallpaper `0` · ícones `10` · janelas `100+` · taskbar `1000` · menu Iniciar `1100` · boot/screensaver `2000`.
- Breakpoint desktop/mobile: **1024px** (`>= 1024` é desktop).
- Cor de acento: `--accent-color: #a855f7` (já existe em `index.css`, não trocar).
- `MOVE` do reducer é despachado **somente** em `onDragEnd`, nunca durante o arrasto.
- Todo teste roda em `environment: 'node'` — Fase 1 não testa DOM.
- Commits em PT-BR, prefixo `feat:` / `test:` / `chore:` / `style:`.
- **O lint já falha no baseline.** Medido no commit `07681b3`: `npm run lint` sai com código 1 por
  **9 erros pré-existentes** em arquivos legados (`DecryptedText.jsx`, `Contact.jsx`,
  `Journey.jsx`, `PortfolioMeta.jsx`, `Profile.jsx`, `Projects.jsx`, `TechStack.jsx`,
  `Navbar.jsx`, `LanguageContext.jsx` — oito `no-unused-vars` e um
  `react-refresh/only-export-components`). Nenhuma task da Fase 1 deve corrigi-los: eles somem na
  Fase 4, quando esses arquivos forem deletados. Por isso **cada task roda o lint apenas nos
  próprios arquivos**, com `npx eslint <caminhos que a task criou ou alterou>`, e não `npm run
  lint`. Corrigir arquivo legado é scope creep e será marcado no review.

## Ordem de execução e paralelismo

A Task 1 instala e configura o Vitest, então tudo que roda teste depende dela. Fora isso, o
paralelismo real é este:

| Onda | Tasks | Paralelas? | Por quê |
|---|---|---|---|
| 1 | 1 | não | instala o Vitest — bloqueia toda task que roda teste |
| 2 | **2, 4, 5, 6** | **sim, 4 trilhas** | arquivos disjuntos; nenhuma lê o resultado da outra |
| 3 | 3 | não | continua `windowManager.js`, que a Task 2 está editando |
| 4 | 7 | não | precisa do reducer completo (3) e do registry (4) |
| 5 | 8 | não | precisa do context (7) |
| 6 | **9, 10** | **sim, 2 trilhas** | ambas consomem 7 e 8; nenhuma depende da outra |
| 7 | 11 | não | monta tudo e mexe em CSS global |

```
Onda 1    Onda 2                Onda 3   Onda 4   Onda 5   Onda 6      Onda 7
Task 1 ─┬─ Task 2 ──────────────  Task 3 ─┐
        ├─ Task 4 ───────────────────────┴─ Task 7 ─ Task 8 ─┬─ Task 9 ─┐
        ├─ Task 5 (hook) ─────────────────────────────────────┤          ├─ Task 11
        └─ Task 6 (wallpaper) ───────────────────────────────┴─ Task 10 ─┘
```

Mapa de arquivos da Onda 2, confirmando que não há colisão:

| Task | Arquivos que escreve |
|---|---|
| 2 | `os/windowManager.js`, `os/windowManager.test.js` |
| 4 | `os/registry.js`, `os/routes.js`, `os/routes.test.js`, `data/os.js`, `apps/ReadmeApp.jsx` |
| 5 | `os/useDeviceMode.js` |
| 6 | `wallpapers/Hills.jsx`, `os/tokens.css` |

**Commits em execução paralela:** agentes concorrentes no mesmo working tree disputam o
`index.lock` do git. Em paralelo, os agentes **implementam e testam sem commitar**, e quem
orquestra faz um commit por onda. Os passos de commit de cada task valem para execução serial.
- Todo o resto é serial.
- **Nenhuma task fora da 6 e da 11 toca CSS global**, e só a Task 4 toca `registry.js` — sem
  colisão de arquivos entre trilhas paralelas. As Tasks 6 e 11 nunca rodam juntas (11 é a última).

## Desvio consciente em relação ao spec

O spec (§8) lista um arquivo `os/useUrlSync.js`. Este plano divide essa responsabilidade em dois:
`os/routes.js` com as funções **puras** (`resolveRoute`, `buildRoute`, testáveis sem navegador) e
o efeito de sincronização **dentro** do `WindowManagerContext`, que é quem tem acesso ao
`dispatch`. Um hook separado precisaria receber o dispatch por parâmetro e não ganharia nada.
O comportamento descrito no spec é idêntico; só a fronteira dos arquivos muda.

---

### Task 1: Reducer — estado inicial, OPEN e CLOSE

**Files:**
- Create: `frontend/src/os/windowManager.js`
- Create: `frontend/src/os/windowManager.test.js`
- Modify: `frontend/vite.config.js`
- Modify: `frontend/package.json`

**Interfaces:**
- Consumes: nada
- Produces:
  - `initialState` → `{ windows: [], zTop: 100, focusedKey: null }`
  - `makeKey(appId, params)` → `string`
  - `cascadePosition(n)` → `{ x: number, y: number }`
  - `windowReducer(state, action)` → novo state
  - Ações desta task: `{type:'OPEN', appId, params?, parent?}`, `{type:'CLOSE', key}`
  - Forma da janela: `{ key, appId, params, x, y, z, minimized, maximized, prevPos }`
  - O reducer **não** guarda tamanho de janela — tamanho vem do registry em tempo de render.

- [ ] **Step 1: Instalar o Vitest**

```bash
cd frontend && npm install -D vitest@^3.2.4
```

- [ ] **Step 2: Configurar o Vitest no Vite**

Substituir todo o conteúdo de `frontend/vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Fase 1 testa apenas lógica pura — sem DOM, sem jsdom.
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
```

- [ ] **Step 3: Adicionar os scripts de teste**

Em `frontend/package.json`, dentro de `"scripts"`, adicionar as duas linhas abaixo (manter `dev`, `build`, `lint`, `preview` como estão):

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Escrever os testes que falham**

Criar `frontend/src/os/windowManager.test.js`:

```js
import { describe, it, expect } from 'vitest'
import {
  initialState,
  makeKey,
  cascadePosition,
  windowReducer,
} from './windowManager'

describe('makeKey', () => {
  it('usa o appId puro quando não há params', () => {
    expect(makeKey('about', null)).toBe('about')
  })

  it('concatena o slug quando há params', () => {
    expect(makeKey('project', { slug: 'bussola-v2' })).toBe('project:bussola-v2')
  })
})

describe('cascadePosition', () => {
  it('começa na posição base', () => {
    expect(cascadePosition(0)).toEqual({ x: 96, y: 64 })
  })

  it('desloca 24px por janela', () => {
    expect(cascadePosition(2)).toEqual({ x: 144, y: 112 })
  })

  it('dá a volta depois de 240px para não sair da tela', () => {
    expect(cascadePosition(10)).toEqual({ x: 96, y: 64 })
  })
})

describe('OPEN', () => {
  it('abre uma janela, foca nela e sobe o zTop', () => {
    const s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })

    expect(s.windows).toHaveLength(1)
    expect(s.windows[0]).toMatchObject({
      key: 'readme',
      appId: 'readme',
      params: null,
      minimized: false,
      maximized: false,
      prevPos: null,
      z: 101,
    })
    expect(s.focusedKey).toBe('readme')
    expect(s.zTop).toBe(101)
  })

  it('não duplica: abrir app já aberto apenas foca e sobe o z', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'OPEN', appId: 'about' })
    s = windowReducer(s, { type: 'OPEN', appId: 'readme' })

    expect(s.windows).toHaveLength(2)
    expect(s.focusedKey).toBe('readme')
    expect(s.windows.find((w) => w.key === 'readme').z).toBe(103)
  })

  it('trata instâncias dinâmicas como janelas distintas', () => {
    let s = windowReducer(initialState, {
      type: 'OPEN', appId: 'project', params: { slug: 'bussola-v2' },
    })
    s = windowReducer(s, {
      type: 'OPEN', appId: 'project', params: { slug: 'datachat-bi' },
    })

    expect(s.windows.map((w) => w.key)).toEqual([
      'project:bussola-v2',
      'project:datachat-bi',
    ])
  })

  it('posiciona em cascata conforme a contagem de janelas', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'OPEN', appId: 'about' })

    expect(s.windows[0]).toMatchObject({ x: 96, y: 64 })
    expect(s.windows[1]).toMatchObject({ x: 120, y: 88 })
  })
})

describe('CLOSE', () => {
  it('remove a janela', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'CLOSE', key: 'readme' })

    expect(s.windows).toEqual([])
    expect(s.focusedKey).toBe(null)
  })

  it('passa o foco para a janela de maior z ao fechar a focada', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'OPEN', appId: 'about' })
    s = windowReducer(s, { type: 'CLOSE', key: 'about' })

    expect(s.focusedKey).toBe('readme')
  })

  it('ignora key inexistente sem quebrar', () => {
    const s = windowReducer(initialState, { type: 'CLOSE', key: 'fantasma' })
    expect(s).toEqual(initialState)
  })
})
```

- [ ] **Step 5: Rodar os testes e confirmar que falham**

Run: `cd frontend && npm test`
Expected: FAIL — `Failed to resolve import "./windowManager"`

- [ ] **Step 6: Implementar o mínimo para passar**

Criar `frontend/src/os/windowManager.js`:

```js
/**
 * REDUCER DO GERENCIADOR DE JANELAS
 * --------------------------------------------------
 * Fonte única de verdade sobre quais janelas estão abertas, qual tem foco
 * e em que ordem elas se sobrepõem.
 *
 * Deliberadamente puro (zero React, zero DOM) porque é aqui que os bugs
 * moram: herança de foco ao fechar, z-order após N cliques, instância
 * dupla. Lógica pura é lógica testável.
 *
 * NÃO guarda tamanho de janela — tamanho vem do registry em tempo de
 * render, então mudar um defaultSize não invalida estado salvo.
 */

// Posição da primeira janela e passo da cascata.
const BASE_X = 96
const BASE_Y = 64
const CASCADE_STEP = 24
const CASCADE_WRAP = 240

// Janelas começam em 101 (a escala reserva 100+ para elas).
export const initialState = {
  windows: [],
  zTop: 100,
  focusedKey: null,
}

/**
 * Identidade de uma janela. Singletons usam o próprio appId; instâncias
 * dinâmicas ganham sufixo, o que torna "já está aberto?" uma comparação
 * de string.
 */
export function makeKey(appId, params) {
  if (params && params.slug) return `${appId}:${params.slug}`
  return appId
}

/** Desloca cada janela nova para que a anterior não fique escondida. */
export function cascadePosition(n) {
  const offset = (CASCADE_STEP * n) % CASCADE_WRAP
  return { x: BASE_X + offset, y: BASE_Y + offset }
}

/** Janela visível de maior z — quem herda o foco. */
function topmostVisible(windows) {
  const visible = windows.filter((w) => !w.minimized)
  if (visible.length === 0) return null
  return visible.reduce((top, w) => (w.z > top.z ? w : top)).key
}

function raise(state, key) {
  const z = state.zTop + 1
  return {
    ...state,
    windows: state.windows.map((w) => (w.key === key ? { ...w, z, minimized: false } : w)),
    zTop: z,
    focusedKey: key,
  }
}

export function windowReducer(state, action) {
  switch (action.type) {
    case 'OPEN': {
      const { appId, params = null } = action
      const key = makeKey(appId, params)

      // Já aberto: foca em vez de duplicar.
      if (state.windows.some((w) => w.key === key)) return raise(state, key)

      const z = state.zTop + 1
      const { x, y } = cascadePosition(state.windows.length)

      return {
        ...state,
        windows: [
          ...state.windows,
          { key, appId, params, x, y, z, minimized: false, maximized: false, prevPos: null },
        ],
        zTop: z,
        focusedKey: key,
      }
    }

    case 'CLOSE': {
      if (!state.windows.some((w) => w.key === action.key)) return state

      const windows = state.windows.filter((w) => w.key !== action.key)
      const focusedKey =
        state.focusedKey === action.key ? topmostVisible(windows) : state.focusedKey

      return { ...state, windows, focusedKey }
    }

    default:
      return state
  }
}
```

- [ ] **Step 7: Rodar os testes e confirmar que passam**

Run: `cd frontend && npx vitest run src/os/windowManager.test.js`
Expected: PASS — 12 testes

> Rodar o arquivo específico, não `npm test`. Tasks paralelas adicionam testes em outros
> arquivos, e uma contagem global tornaria esta verificação dependente da ordem de execução.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/os/windowManager.js frontend/src/os/windowManager.test.js frontend/vite.config.js frontend/package.json frontend/package-lock.json
git commit -m "feat: reducer de janelas com OPEN/CLOSE e herança de foco"
```

---

### Task 2: Reducer — FOCUS, MINIMIZE, TOGGLE_MAXIMIZE, MOVE

**Files:**
- Modify: `frontend/src/os/windowManager.js`
- Modify: `frontend/src/os/windowManager.test.js`

**Interfaces:**
- Consumes: `windowReducer`, `initialState` da Task 1
- Produces: ações `{type:'FOCUS', key}`, `{type:'MINIMIZE', key}`, `{type:'TOGGLE_MAXIMIZE', key}`, `{type:'MOVE', key, x, y}`

- [ ] **Step 1: Escrever os testes que falham**

Adicionar ao final de `frontend/src/os/windowManager.test.js`:

```js
describe('FOCUS', () => {
  it('traz a janela para o topo do z', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'OPEN', appId: 'about' })
    s = windowReducer(s, { type: 'FOCUS', key: 'readme' })

    expect(s.focusedKey).toBe('readme')
    expect(s.windows.find((w) => w.key === 'readme').z).toBeGreaterThan(
      s.windows.find((w) => w.key === 'about').z,
    )
  })

  it('restaura janela minimizada', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'MINIMIZE', key: 'readme' })
    s = windowReducer(s, { type: 'FOCUS', key: 'readme' })

    expect(s.windows[0].minimized).toBe(false)
    expect(s.focusedKey).toBe('readme')
  })
})

describe('MINIMIZE', () => {
  it('marca como minimizada e passa o foco adiante', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'OPEN', appId: 'about' })
    s = windowReducer(s, { type: 'MINIMIZE', key: 'about' })

    expect(s.windows.find((w) => w.key === 'about').minimized).toBe(true)
    expect(s.focusedKey).toBe('readme')
  })

  it('deixa focusedKey nulo quando não há mais janela visível', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'MINIMIZE', key: 'readme' })

    expect(s.focusedKey).toBe(null)
  })
})

describe('TOGGLE_MAXIMIZE', () => {
  it('guarda a posição anterior ao maximizar', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'MOVE', key: 'readme', x: 300, y: 200 })
    s = windowReducer(s, { type: 'TOGGLE_MAXIMIZE', key: 'readme' })

    const w = s.windows[0]
    expect(w.maximized).toBe(true)
    expect(w.prevPos).toEqual({ x: 300, y: 200 })
  })

  it('devolve a posição guardada ao restaurar', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'MOVE', key: 'readme', x: 300, y: 200 })
    s = windowReducer(s, { type: 'TOGGLE_MAXIMIZE', key: 'readme' })
    s = windowReducer(s, { type: 'TOGGLE_MAXIMIZE', key: 'readme' })

    expect(s.windows[0]).toMatchObject({
      maximized: false, x: 300, y: 200, prevPos: null,
    })
  })
})

describe('MOVE', () => {
  it('atualiza a posição', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'MOVE', key: 'readme', x: 42, y: 43 })

    expect(s.windows[0]).toMatchObject({ x: 42, y: 43 })
  })

  it('não move janela maximizada', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'TOGGLE_MAXIMIZE', key: 'readme' })
    s = windowReducer(s, { type: 'MOVE', key: 'readme', x: 500, y: 500 })

    expect(s.windows[0]).toMatchObject({ x: 96, y: 64 })
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falham**

Run: `cd frontend && npm test`
Expected: FAIL — os novos testes falham porque o `default` do switch devolve o state intacto

- [ ] **Step 3: Implementar os quatro casos**

Em `frontend/src/os/windowManager.js`, inserir os casos abaixo dentro do `switch`, entre `case 'CLOSE'` e `default`:

```js
    case 'FOCUS': {
      if (!state.windows.some((w) => w.key === action.key)) return state
      return raise(state, action.key)
    }

    case 'MINIMIZE': {
      if (!state.windows.some((w) => w.key === action.key)) return state

      const windows = state.windows.map((w) =>
        w.key === action.key ? { ...w, minimized: true } : w,
      )
      const focusedKey =
        state.focusedKey === action.key ? topmostVisible(windows) : state.focusedKey

      return { ...state, windows, focusedKey }
    }

    case 'TOGGLE_MAXIMIZE': {
      return {
        ...state,
        windows: state.windows.map((w) => {
          if (w.key !== action.key) return w
          // Guarda x/y ao maximizar porque o CSS passa a mandar via inset:0,
          // e sem isso a janela restaurada volta na posição errada.
          if (w.maximized) {
            const { x, y } = w.prevPos || { x: w.x, y: w.y }
            return { ...w, maximized: false, x, y, prevPos: null }
          }
          return { ...w, maximized: true, prevPos: { x: w.x, y: w.y } }
        }),
      }
    }

    case 'MOVE': {
      return {
        ...state,
        windows: state.windows.map((w) =>
          // Maximizada não tem posição própria; ignora para não guardar
          // coordenada suja que reapareceria ao restaurar.
          w.key === action.key && !w.maximized ? { ...w, x: action.x, y: action.y } : w,
        ),
      }
    }
```

- [ ] **Step 4: Rodar e confirmar que passam**

Run: `cd frontend && npx vitest run src/os/windowManager.test.js`
Expected: PASS — 20 testes

- [ ] **Step 5: Commit**

```bash
git add frontend/src/os/windowManager.js frontend/src/os/windowManager.test.js
git commit -m "feat: FOCUS, MINIMIZE, TOGGLE_MAXIMIZE e MOVE no reducer"
```

---

### Task 3: Reducer — abertura com pai, MINIMIZE_ALL e CLOSE_ALL

**Files:**
- Modify: `frontend/src/os/windowManager.js`
- Modify: `frontend/src/os/windowManager.test.js`

**Interfaces:**
- Consumes: tudo das Tasks 1 e 2
- Produces: `{type:'OPEN', appId, params?, parent?}` passa a resolver o pai; ações `{type:'MINIMIZE_ALL'}` e `{type:'CLOSE_ALL'}`

- [ ] **Step 1: Escrever os testes que falham**

Adicionar ao final de `frontend/src/os/windowManager.test.js`:

```js
describe('OPEN com pai', () => {
  it('abre o pai antes do filho e mantém o foco no filho', () => {
    const s = windowReducer(initialState, {
      type: 'OPEN', appId: 'project', params: { slug: 'bussola-v2' }, parent: 'projects',
    })

    expect(s.windows.map((w) => w.key)).toEqual(['projects', 'project:bussola-v2'])
    expect(s.focusedKey).toBe('project:bussola-v2')
    expect(s.windows.find((w) => w.key === 'project:bussola-v2').z).toBeGreaterThan(
      s.windows.find((w) => w.key === 'projects').z,
    )
  })

  it('não reabre o pai se ele já estiver aberto', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'projects' })
    s = windowReducer(s, {
      type: 'OPEN', appId: 'project', params: { slug: 'bussola-v2' }, parent: 'projects',
    })

    expect(s.windows.filter((w) => w.key === 'projects')).toHaveLength(1)
    expect(s.windows).toHaveLength(2)
  })
})

describe('MINIMIZE_ALL', () => {
  it('minimiza todas e zera o foco', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'OPEN', appId: 'about' })
    s = windowReducer(s, { type: 'MINIMIZE_ALL' })

    expect(s.windows.every((w) => w.minimized)).toBe(true)
    expect(s.focusedKey).toBe(null)
  })
})

describe('CLOSE_ALL', () => {
  it('volta ao estado inicial preservando o zTop', () => {
    let s = windowReducer(initialState, { type: 'OPEN', appId: 'readme' })
    s = windowReducer(s, { type: 'CLOSE_ALL' })

    expect(s.windows).toEqual([])
    expect(s.focusedKey).toBe(null)
    expect(s.zTop).toBe(101)
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falham**

Run: `cd frontend && npm test`
Expected: FAIL — o pai não é aberto; `MINIMIZE_ALL` e `CLOSE_ALL` caem no `default`

- [ ] **Step 3: Resolver o pai dentro do OPEN**

Em `frontend/src/os/windowManager.js`, substituir o `case 'OPEN'` inteiro por:

```js
    case 'OPEN': {
      const { appId, params = null, parent = null } = action
      const key = makeKey(appId, params)

      // Já aberto: foca em vez de duplicar.
      if (state.windows.some((w) => w.key === key)) return raise(state, key)

      // Deep link para janela filha precisa do pai atrás dela. Recursão de
      // um nível só — o registry não define netos.
      let base = state
      if (parent && !state.windows.some((w) => w.key === parent)) {
        base = windowReducer(state, { type: 'OPEN', appId: parent })
      }

      const z = base.zTop + 1
      const { x, y } = cascadePosition(base.windows.length)

      return {
        ...base,
        windows: [
          ...base.windows,
          { key, appId, params, x, y, z, minimized: false, maximized: false, prevPos: null },
        ],
        zTop: z,
        focusedKey: key,
      }
    }
```

- [ ] **Step 4: Adicionar MINIMIZE_ALL e CLOSE_ALL**

No mesmo `switch`, inserir antes de `default`:

```js
    case 'MINIMIZE_ALL': {
      return {
        ...state,
        windows: state.windows.map((w) => ({ ...w, minimized: true })),
        focusedKey: null,
      }
    }

    case 'CLOSE_ALL': {
      return { ...state, windows: [], focusedKey: null }
    }
```

- [ ] **Step 5: Rodar e confirmar que passam**

Run: `cd frontend && npx vitest run src/os/windowManager.test.js`
Expected: PASS — 24 testes

- [ ] **Step 6: Commit**

```bash
git add frontend/src/os/windowManager.js frontend/src/os/windowManager.test.js
git commit -m "feat: abertura com pai, MINIMIZE_ALL e CLOSE_ALL"
```

---

### Task 4: Registry dos apps e parser de rotas

**Files:**
- Create: `frontend/src/os/registry.js`
- Create: `frontend/src/os/routes.js`
- Create: `frontend/src/os/routes.test.js`
- Create: `frontend/src/data/os.js`
- Create: `frontend/src/apps/ReadmeApp.jsx`

**Interfaces:**
- Consumes: nada do reducer (o registry é declarativo e independente)
- Produces:
  - `APPS` → array de entradas do registry
  - `getApp(appId)` → entrada ou `undefined`
  - `resolveRoute(pathname)` → `{ appId, params }` ou `null`
  - `buildRoute(appId, params)` → `string`
  - `getOsData(lang)` → objeto de textos do SO
  - `ReadmeApp` → componente sem props

**Nota:** nesta fase o registry declara **somente** os apps que já existem (`readme`) mais as entradas de `projects`/`project`, necessárias para testar resolução de pai e rota aninhada. Os outros 6 apps entram na Fase 2.

- [ ] **Step 1: Escrever os testes que falham**

Criar `frontend/src/os/routes.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { resolveRoute, buildRoute } from './routes'
import { getApp } from './registry'

describe('getApp', () => {
  it('encontra app declarado', () => {
    expect(getApp('readme').route).toBe('/leia-me')
  })

  it('devolve undefined para app inexistente', () => {
    expect(getApp('nao-existe')).toBeUndefined()
  })
})

describe('resolveRoute', () => {
  it('resolve a raiz como nenhuma janela', () => {
    expect(resolveRoute('/')).toBe(null)
  })

  it('resolve rota estática', () => {
    expect(resolveRoute('/leia-me')).toEqual({ appId: 'readme', params: null })
  })

  it('resolve rota estática com barra final', () => {
    expect(resolveRoute('/leia-me/')).toEqual({ appId: 'readme', params: null })
  })

  it('resolve rota dinâmica extraindo o slug', () => {
    expect(resolveRoute('/projetos/bussola-v2')).toEqual({
      appId: 'project',
      params: { slug: 'bussola-v2' },
    })
  })

  it('prefere a rota estática do pai quando não há slug', () => {
    expect(resolveRoute('/projetos')).toEqual({ appId: 'projects', params: null })
  })

  it('devolve null para rota desconhecida', () => {
    expect(resolveRoute('/nao-existe')).toBe(null)
  })
})

describe('buildRoute', () => {
  it('constrói rota estática', () => {
    expect(buildRoute('readme', null)).toBe('/leia-me')
  })

  it('constrói rota dinâmica substituindo o parâmetro', () => {
    expect(buildRoute('project', { slug: 'datachat-bi' })).toBe('/projetos/datachat-bi')
  })

  it('devolve a raiz para app inexistente', () => {
    expect(buildRoute('nao-existe', null)).toBe('/')
  })
})

describe('ida e volta', () => {
  it('buildRoute e resolveRoute são inversos', () => {
    const cases = [
      ['readme', null],
      ['projects', null],
      ['project', { slug: 'bussola-v2' }],
    ]
    for (const [appId, params] of cases) {
      expect(resolveRoute(buildRoute(appId, params))).toEqual({ appId, params })
    }
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falham**

Run: `cd frontend && npm test`
Expected: FAIL — `Failed to resolve import "./routes"`

- [ ] **Step 3: Criar os textos do SO**

Criar `frontend/src/data/os.js`:

```js
const osContentEn = {
  windows: {
    readme: 'readme.txt',
    projects: 'My Projects',
  },
  controls: {
    minimize: 'Minimize',
    maximize: 'Maximize',
    restore: 'Restore',
    close: 'Close',
  },
  taskbar: {
    start: 'Start',
    showDesktop: 'Show desktop',
  },
  signature: {
    role: 'AI Developer & Full-Stack Engineer',
  },
}

const osContentPt = {
  windows: {
    readme: 'leia-me.txt',
    projects: 'Meus Projetos',
  },
  controls: {
    minimize: 'Minimizar',
    maximize: 'Maximizar',
    restore: 'Restaurar',
    close: 'Fechar',
  },
  taskbar: {
    start: 'Iniciar',
    showDesktop: 'Mostrar área de trabalho',
  },
  signature: {
    role: 'Desenvolvedor de IA & Full-Stack',
  },
}

export const getOsData = (lang) => (lang === 'pt' ? osContentPt : osContentEn)
```

- [ ] **Step 4: Criar o app trivial de validação**

Criar `frontend/src/apps/ReadmeApp.jsx` — porta o texto de `PortfolioMeta.jsx` sem a moldura de seção:

```jsx
import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'

/**
 * leia-me.txt — o portfólio como case técnico.
 *
 * Primeiro app do NoiseOS de propósito: é só texto, então serve para validar
 * o chrome de janela sem que bug de conteúdo se confunda com bug de sistema.
 * Não sabe que janelas existem.
 */
const ReadmeApp = () => {
  const { language } = useLanguage()

  const content = {
    pt: (
      <>
        <p>
          Além dos projetos listados, <strong>este próprio portfólio</strong> é um case
          técnico que demonstra competências em <strong>UX Design</strong>,{' '}
          <strong>Engenharia de Software</strong> e <strong>IA Generativa</strong>.
        </p>
        <p>
          O sistema opera sobre um backend em <strong>FastAPI</strong> que usa{' '}
          <strong>LangGraph</strong> para orquestrar agentes e uma arquitetura{' '}
          <strong>RAG</strong>, permitindo que o site responda perguntas com base em
          dados reais.
        </p>
        <p>
          Código aberto e documentado no{' '}
          <a href="https://github.com/Marocosz/Marocos-AI" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          .
        </p>
      </>
    ),
    en: (
      <>
        <p>
          Beyond the projects listed, <strong>this portfolio itself</strong> is a
          technical case study demonstrating skills in <strong>UX Design</strong>,{' '}
          <strong>Software Engineering</strong> and <strong>Generative AI</strong>.
        </p>
        <p>
          It runs on a <strong>FastAPI</strong> backend using <strong>LangGraph</strong>{' '}
          to orchestrate agents and a <strong>RAG</strong> architecture, letting the site
          answer questions from real data.
        </p>
        <p>
          Open source and documented on{' '}
          <a href="https://github.com/Marocosz/Marocos-AI" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          .
        </p>
      </>
    ),
  }

  return <div className="app-prose">{content[language] || content.en}</div>
}

export default ReadmeApp
```

- [ ] **Step 5: Criar o registry**

Criar `frontend/src/os/registry.js`:

```js
/**
 * REGISTRY DE APPS
 * --------------------------------------------------
 * Declaração única de cada app do NoiseOS. Quem quiser adicionar um app
 * mexe só aqui e no componente — nem o reducer nem o shell precisam saber.
 *
 * Campos:
 *   id           identidade estável, usada como chave de janela
 *   route        caminho na URL (`:slug` marca segmento dinâmico)
 *   titleKey     chave em getOsData(lang).windows; null = título vem do conteúdo
 *   icon         glifo lucide-react
 *   component    o app em si (agnóstico de container)
 *   defaultSize  tamanho inicial da janela em px
 *   singleton    true = uma instância só
 *   dynamic      true = uma instância por params.slug
 *   parent       appId que precisa estar aberto atrás desta janela
 *   onDesktop    aparece na grade de ícones
 *   inStartMenu  aparece no menu Iniciar
 *   inDock       aparece no dock do mobile
 */

import { FileText, FolderGit2 } from 'lucide-react'
import ReadmeApp from '../apps/ReadmeApp'

export const APPS = [
  {
    id: 'readme',
    route: '/leia-me',
    titleKey: 'readme',
    icon: FileText,
    component: ReadmeApp,
    defaultSize: { w: 520, h: 400 },
    singleton: true,
    dynamic: false,
    parent: null,
    onDesktop: true,
    inStartMenu: true,
    inDock: false,
  },
  // Fase 2 substitui o placeholder de conteúdo destes dois. As entradas
  // existem desde já porque são elas que exercitam resolução de pai e
  // rota aninhada no reducer e no parser.
  {
    id: 'projects',
    route: '/projetos',
    titleKey: 'projects',
    icon: FolderGit2,
    component: null,
    defaultSize: { w: 640, h: 440 },
    singleton: true,
    dynamic: false,
    parent: null,
    onDesktop: false,
    inStartMenu: false,
    inDock: false,
  },
  {
    id: 'project',
    route: '/projetos/:slug',
    titleKey: null,
    icon: FileText,
    component: null,
    defaultSize: { w: 520, h: 480 },
    singleton: false,
    dynamic: true,
    parent: 'projects',
    onDesktop: false,
    inStartMenu: false,
    inDock: false,
  },
]

export function getApp(appId) {
  return APPS.find((a) => a.id === appId)
}
```

- [ ] **Step 6: Criar o parser de rotas**

Criar `frontend/src/os/routes.js`:

```js
/**
 * TRADUÇÃO ENTRE URL E APP
 * --------------------------------------------------
 * Puro de propósito: deep link errado é bug silencioso, e função pura é
 * testável sem navegador.
 *
 * Rotas estáticas ganham prioridade sobre dinâmicas para que `/projetos`
 * abra a pasta em vez de ser lido como slug vazio.
 */

import { APPS } from './registry'

function normalize(pathname) {
  if (!pathname) return '/'
  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed === '' ? '/' : trimmed
}

export function resolveRoute(pathname) {
  const path = normalize(pathname)
  if (path === '/') return null

  const staticMatch = APPS.find((a) => !a.dynamic && a.route === path)
  if (staticMatch) return { appId: staticMatch.id, params: null }

  for (const app of APPS.filter((a) => a.dynamic)) {
    const prefix = app.route.replace('/:slug', '')
    if (path.startsWith(`${prefix}/`)) {
      const slug = path.slice(prefix.length + 1)
      if (slug && !slug.includes('/')) return { appId: app.id, params: { slug } }
    }
  }

  return null
}

export function buildRoute(appId, params) {
  const app = APPS.find((a) => a.id === appId)
  if (!app) return '/'
  if (app.dynamic && params && params.slug) {
    return app.route.replace(':slug', params.slug)
  }
  return app.route
}
```

- [ ] **Step 7: Rodar e confirmar que passam**

Run: `cd frontend && npx vitest run src/os/routes.test.js`
Expected: PASS — 12 testes

- [ ] **Step 8: Commit**

```bash
git add frontend/src/os/registry.js frontend/src/os/routes.js frontend/src/os/routes.test.js frontend/src/data/os.js frontend/src/apps/ReadmeApp.jsx
git commit -m "feat: registry de apps, parser de rotas e ReadmeApp"
```

---

### Task 5: Hook useDeviceMode — INDEPENDENTE, pode rodar em paralelo

**Files:**
- Create: `frontend/src/os/useDeviceMode.js`

**Interfaces:**
- Consumes: nada
- Produces: `useDeviceMode()` → `'desktop' | 'mobile'`; `DESKTOP_BREAKPOINT` → `1024`

Esta task consolida a duplicação atual: `HomePage.jsx` usa `< 768`, enquanto `Navbar.jsx`, `Projects.jsx` e `Journey.jsx` usam `< 1024` — três `useEffect` idênticos decidindo a mesma coisa com valores diferentes.

- [ ] **Step 1: Implementar o hook**

Criar `frontend/src/os/useDeviceMode.js`:

```js
/**
 * MODO DE DISPOSITIVO
 * --------------------------------------------------
 * Fonte única de verdade sobre desktop vs mobile, substituindo os três
 * useEffect duplicados que o projeto tinha com dois breakpoints diferentes.
 *
 * 1024px porque tablet em retrato não tem espaço para janelas flutuantes.
 * iPad em paisagem (>= 1024) cai em desktop e arrasta por toque de graça,
 * já que o Framer Motion usa pointer events.
 */

import { useState, useEffect } from 'react'

export const DESKTOP_BREAKPOINT = 1024

// A media query é a única forma de ler o breakpoint, tanto no valor inicial
// quanto no listener. Ler innerWidth aqui e matchMedia lá divergiria pela
// largura da barra de rolagem em navegadores que a contam na viewport.
const DESKTOP_QUERY = `(min-width: ${DESKTOP_BREAKPOINT}px)`

function currentMode() {
  if (typeof window === 'undefined') return 'desktop'
  return window.matchMedia(DESKTOP_QUERY).matches ? 'desktop' : 'mobile'
}

export function useDeviceMode() {
  const [mode, setMode] = useState(currentMode)

  useEffect(() => {
    // matchMedia em vez de listener de resize: dispara só na travessia do
    // breakpoint, não a cada pixel arrastado na borda da janela.
    const mq = window.matchMedia(DESKTOP_QUERY)
    const onChange = (e) => setMode(e.matches ? 'desktop' : 'mobile')

    // Sincronia defensiva: cobre a travessia que aconteça entre o primeiro
    // render e o anexo do listener. Sem custo de render quando o valor não
    // muda, porque o React descarta setState com valor idêntico.
    setMode(mq.matches ? 'desktop' : 'mobile')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return mode
}
```

- [ ] **Step 2: Verificar que o lint passa**

Run: `cd frontend && npx eslint <os arquivos que esta task criou/alterou>`
Expected: sem erros **nos arquivos desta task**. Não rode `npm run lint`: o baseline já tem 9
erros em arquivos legados (ver Global Constraints) e eles não são para consertar aqui.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/os/useDeviceMode.js
git commit -m "feat: hook useDeviceMode com breakpoint unico em 1024px"
```

---

### Task 6: Wallpaper Hills e tokens — INDEPENDENTE, pode rodar em paralelo

**Files:**
- Create: `frontend/src/wallpapers/Hills.jsx`
- Create: `frontend/src/os/tokens.css`

**Interfaces:**
- Consumes: nada
- Produces: `<Hills isDark isAnimated />`; classes CSS `.noiseos-*` e as variáveis `--win-*`

Esta é a única task da Fase 1 que escreve CSS global, o que a torna segura para rodar em paralelo com as outras.

**Nota legal:** o Bliss do Windows XP é fotografia de Charles O'Rear cujos direitos pertencem à Microsoft. Este componente é recriação original em SVG na paleta roxa do projeto — **não** embarcar o arquivo original.

- [ ] **Step 1: Criar os tokens**

Criar `frontend/src/os/tokens.css`:

```css
/* --------------------------------------------------
   TOKENS DO NOISEOS
   Chrome de janela, escala de z-index e paleta do wallpaper.
   Convive com index.css, que segue dono das variáveis de conteúdo.
   -------------------------------------------------- */

:root {
  /* Chrome de janela */
  --win-glass-blur: blur(20px) saturate(140%);
  --win-border: 1px solid rgba(255, 255, 255, 0.18);
  --win-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.25);
  --win-shadow: 0 16px 48px rgba(0, 0, 0, 0.45);
  --win-radius: 10px;
  --win-control-radius: 8px;
  --win-titlebar-h: 40px;
  --win-titlebar-bg: rgba(88, 28, 135, 0.55);
  --win-body-bg: rgba(20, 12, 32, 0.72);

  /* Legibilidade de label sobre wallpaper */
  --icon-label-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);

  /* Escala de z-index — única fonte de verdade */
  --z-wallpaper: 0;
  --z-icons: 10;
  --z-windows: 100;
  --z-taskbar: 1000;
  --z-startmenu: 1100;
  --z-boot: 2000;

  /* Wallpaper — dia */
  --hill-sky-top: #6d28d9;
  --hill-sky-mid: #a78bfa;
  --hill-sky-low: #ddd6fe;
  --hill-front: #7c3aed;
  --hill-mid: #6b21a8;
  --hill-back: #581c87;
  --hill-cloud: #ffffff;
  --hill-cloud-opacity: 0.5;
}

/* Wallpaper — noite */
.theme-dark {
  --hill-sky-top: #1e1b4b;
  --hill-sky-mid: #2e1065;
  --hill-sky-low: #4c1d95;
  --hill-front: #2e1065;
  --hill-mid: #1e1b4b;
  --hill-back: #0f0a1f;
  --hill-cloud: #c4b5fd;
  --hill-cloud-opacity: 0.18;

  --win-titlebar-bg: rgba(76, 29, 149, 0.5);
  --win-body-bg: rgba(12, 8, 20, 0.78);
}

.theme-light {
  --win-titlebar-bg: rgba(168, 85, 247, 0.28);
  --win-body-bg: rgba(255, 255, 255, 0.7);
  --win-border: 1px solid rgba(255, 255, 255, 0.6);
  --win-shadow: 0 16px 48px rgba(88, 28, 135, 0.2);
}

/* Deriva das nuvens — desligada por preferência do sistema */
@keyframes noiseos-cloud-drift {
  from { transform: translateX(0); }
  to   { transform: translateX(60px); }
}

@media (prefers-reduced-motion: reduce) {
  .noiseos-cloud { animation: none !important; }
}
```

- [ ] **Step 2: Criar o wallpaper**

Criar `frontend/src/wallpapers/Hills.jsx`:

```jsx
import React from 'react'

/**
 * WALLPAPER "COLINAS"
 * --------------------------------------------------
 * Homenagem original ao Bliss do Windows XP, repintada na paleta roxa.
 * SVG em vez de shader por três motivos: nítido em qualquer resolução,
 * ~2KB, e deixa o orçamento de GPU livre para o cristal 3D.
 *
 * Dia e noite compartilham a geometria e trocam só os tokens de cor.
 */

const Hills = ({ isAnimated = true }) => (
  <div className="noiseos-wallpaper" aria-hidden="true">
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      className="noiseos-wallpaper-svg"
    >
      <defs>
        <linearGradient id="noiseos-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--hill-sky-top)" />
          <stop offset="55%" stopColor="var(--hill-sky-mid)" />
          <stop offset="100%" stopColor="var(--hill-sky-low)" />
        </linearGradient>

        <filter id="noiseos-cloud-blur">
          <feGaussianBlur stdDeviation="18" />
        </filter>

        {/* Grão de filme: o projeto se chama noiseportfolio, então o ruído
            na textura do sistema é literal, não decorativo. */}
        <filter id="noiseos-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      <rect width="1440" height="900" fill="url(#noiseos-sky)" />

      <g filter="url(#noiseos-cloud-blur)" opacity="var(--hill-cloud-opacity)">
        {[
          { cx: 240, cy: 150, rx: 120, ry: 34, dur: 90 },
          { cx: 700, cy: 100, rx: 90, ry: 26, dur: 120 },
          { cx: 1130, cy: 190, rx: 150, ry: 40, dur: 105 },
          { cx: 950, cy: 300, rx: 70, ry: 20, dur: 140 },
        ].map((c, i) => (
          <ellipse
            key={i}
            className="noiseos-cloud"
            cx={c.cx}
            cy={c.cy}
            rx={c.rx}
            ry={c.ry}
            fill="var(--hill-cloud)"
            style={
              isAnimated
                ? {
                    animation: `noiseos-cloud-drift ${c.dur}s ease-in-out ${i * -20}s infinite alternate`,
                  }
                : undefined
            }
          />
        ))}
      </g>

      {/* Três camadas de colina — a da frente é a crista do Bliss,
          subindo suave da esquerda para a direita. */}
      <path d="M0,760 C260,690 420,742 700,660 C980,578 1180,626 1440,560 L1440,900 L0,900 Z"
            fill="var(--hill-back)" opacity="0.55" />
      <path d="M0,820 C300,742 520,790 820,706 C1080,634 1260,676 1440,640 L1440,900 L0,900 Z"
            fill="var(--hill-mid)" opacity="0.8" />
      <path d="M0,900 C240,820 480,862 780,784 C1060,712 1260,748 1440,714 L1440,900 Z"
            fill="var(--hill-front)" />

      <rect width="1440" height="900" filter="url(#noiseos-grain)" opacity="0.05" />
    </svg>
  </div>
)

export default Hills
```

- [ ] **Step 3: Estilizar o container do wallpaper**

Adicionar ao final de `frontend/src/os/tokens.css`:

```css
.noiseos-wallpaper {
  position: fixed;
  inset: 0;
  z-index: var(--z-wallpaper);
  pointer-events: none;
  overflow: hidden;
}

.noiseos-wallpaper-svg {
  width: 100%;
  height: 100%;
  display: block;
}
```

- [ ] **Step 4: Verificar que o lint passa**

Run: `cd frontend && npx eslint <os arquivos que esta task criou/alterou>`
Expected: sem erros **nos arquivos desta task**. Não rode `npm run lint`: o baseline já tem 9
erros em arquivos legados (ver Global Constraints) e eles não são para consertar aqui.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/wallpapers/Hills.jsx frontend/src/os/tokens.css
git commit -m "feat: wallpaper Colinas em SVG e tokens do NoiseOS"
```

---

### Task 7: WindowManagerContext com sincronia de URL

**Files:**
- Create: `frontend/src/os/WindowManagerContext.jsx`

**Interfaces:**
- Consumes: `windowReducer`, `initialState` (Task 1-3); `getApp` (Task 4); `resolveRoute`, `buildRoute` (Task 4)
- Produces: `<WindowManagerProvider>`; `useWindows()` → `{ windows, focusedKey, open, close, focus, minimize, toggleMaximize, move, minimizeAll, closeAll }`
  - `open(appId, params?)` resolve `parent` pelo registry automaticamente
  - `move(key, x, y)` deve ser chamado **apenas** no fim do arrasto

- [ ] **Step 1: Implementar o provider**

Criar `frontend/src/os/WindowManagerContext.jsx`:

```jsx
import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react'
import { windowReducer, initialState } from './windowManager'
import { getApp } from './registry'
import { resolveRoute, buildRoute } from './routes'

const WindowContext = createContext(null)

export const WindowManagerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(windowReducer, initialState)

  // Evita empurrar no histórico a mesma URL que acabamos de ler dele.
  const lastPath = useRef(null)

  const open = useCallback((appId, params = null) => {
    const app = getApp(appId)
    if (!app) return
    dispatch({ type: 'OPEN', appId, params, parent: app.parent })
  }, [])

  const close = useCallback((key) => dispatch({ type: 'CLOSE', key }), [])
  const focus = useCallback((key) => dispatch({ type: 'FOCUS', key }), [])
  const minimize = useCallback((key) => dispatch({ type: 'MINIMIZE', key }), [])
  const toggleMaximize = useCallback((key) => dispatch({ type: 'TOGGLE_MAXIMIZE', key }), [])
  const move = useCallback((key, x, y) => dispatch({ type: 'MOVE', key, x, y }), [])
  const minimizeAll = useCallback(() => dispatch({ type: 'MINIMIZE_ALL' }), [])
  const closeAll = useCallback(() => dispatch({ type: 'CLOSE_ALL' }), [])

  // URL -> estado, na carga e no voltar/avançar do navegador.
  useEffect(() => {
    const applyUrl = () => {
      const path = window.location.pathname
      lastPath.current = path
      const match = resolveRoute(path)
      if (match) {
        const app = getApp(match.appId)
        dispatch({ type: 'OPEN', appId: match.appId, params: match.params, parent: app?.parent })
      } else {
        dispatch({ type: 'CLOSE_ALL' })
      }
    }

    applyUrl()
    window.addEventListener('popstate', applyUrl)
    return () => window.removeEventListener('popstate', applyUrl)
  }, [])

  // Estado -> URL. A janela com foco define a rota; sem foco, volta à raiz.
  useEffect(() => {
    const focused = state.windows.find((w) => w.key === state.focusedKey)
    const path = focused ? buildRoute(focused.appId, focused.params) : '/'

    if (path !== lastPath.current) {
      lastPath.current = path
      window.history.pushState({}, '', path)
    }
  }, [state.focusedKey, state.windows])

  const value = {
    windows: state.windows,
    focusedKey: state.focusedKey,
    open, close, focus, minimize, toggleMaximize, move, minimizeAll, closeAll,
  }

  return <WindowContext.Provider value={value}>{children}</WindowContext.Provider>
}

export function useWindows() {
  const ctx = useContext(WindowContext)
  if (!ctx) throw new Error('useWindows precisa estar dentro de WindowManagerProvider')
  return ctx
}
```

- [ ] **Step 2: Verificar que o lint passa**

Run: `cd frontend && npx eslint <os arquivos que esta task criou/alterou>`
Expected: sem erros **nos arquivos desta task**. Não rode `npm run lint`: o baseline já tem 9
erros em arquivos legados (ver Global Constraints) e eles não são para consertar aqui.

- [ ] **Step 3: Confirmar que os testes puros continuam verdes**

Run: `cd frontend && npm test`
Expected: PASS — 36 testes

- [ ] **Step 4: Commit**

```bash
git add frontend/src/os/WindowManagerContext.jsx
git commit -m "feat: WindowManagerContext com sincronia bidirecional de URL"
```

---

### Task 8: Chrome da janela

**Files:**
- Create: `frontend/src/os/desktop/Window.jsx`
- Create: `frontend/src/os/desktop/Window.css`

**Interfaces:**
- Consumes: `useWindows` (Task 7); `getApp` (Task 4); `getOsData` (Task 4)
- Produces: `<Window win={windowEntry} />` — lê `defaultSize` e `component` do registry pelo `win.appId`

**Duas armadilhas que esta task tem que evitar** (ambas descobertas na revisão do plano):

1. **Arrasto restrito ao handle** precisa de `useDragControls` + `dragListener={false}`. Sintetizar
   um `PointerEvent` da barra para o `motion.div` "funciona" em teste manual e falha em toque.
2. **Posição não pode viver em `animate`.** Se `x`/`y` saem de `animate`, ao desmaximizar o
   Framer não recebe mais os valores e a janela salta para o canto superior esquerdo em vez de
   voltar ao `prevPos`. A posição tem que ser `useMotionValue` em `style`, sincronizada do estado
   por efeito — assim o drag é dono dos valores durante o gesto e o estado é dono fora dele.
3. **`inert` é booleano no React 19** (o projeto está em `react@^19.1.1`). Escreva
   `inert={win.minimized}` — a forma antiga `inert=""` do React 18 gera warning. Note que a
   janela minimizada já sai da árvore de acessibilidade pelo `display: none`; o `inert` é a
   garantia adicional que o spec pede para janela escondida.

- [ ] **Step 1: Implementar o componente**

Criar `frontend/src/os/desktop/Window.jsx`:

```jsx
import React, { useRef, useEffect } from 'react'
import { motion, useMotionValue, useDragControls } from 'motion/react'
import { Minus, Square, X } from 'lucide-react'
import { useWindows } from '../WindowManagerContext'
import { getApp } from '../registry'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../data/os'
import './Window.css'

const Window = ({ win }) => {
  const { focusedKey, focus, close, minimize, toggleMaximize, move } = useWindows()
  const { language } = useLanguage()
  const os = getOsData(language)
  const app = getApp(win.appId)
  const ref = useRef(null)
  const dragControls = useDragControls()

  const isFocused = focusedKey === win.key
  const title = app?.titleKey ? os.windows[app.titleKey] : win.params?.slug || ''
  const AppComponent = app?.component

  // Posição vive em motion values, não em `animate`: durante o gesto o drag
  // é dono deles (sem re-render), e fora do gesto o efeito abaixo devolve o
  // controle ao estado. Sem isto, desmaximizar joga a janela no canto.
  const x = useMotionValue(win.x)
  const y = useMotionValue(win.y)

  useEffect(() => {
    if (win.maximized) {
      x.set(0)
      y.set(0)
    } else {
      x.set(win.x)
      y.set(win.y)
    }
  }, [win.x, win.y, win.maximized, x, y])

  // Abrir move o foco para dentro da janela, senão o teclado continua preso
  // onde estava e a janela nova é invisível para leitor de tela.
  useEffect(() => {
    ref.current?.focus()
  }, [])

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      close(win.key)
    }
  }

  return (
    <motion.div
      ref={ref}
      className={`noiseos-window${win.maximized ? ' maximized' : ''}${isFocused ? ' focused' : ''}`}
      role="dialog"
      aria-labelledby={`win-title-${win.key}`}
      tabIndex={-1}
      inert={win.minimized}
      onKeyDown={onKeyDown}
      onPointerDownCapture={() => !isFocused && focus(win.key)}
      style={{
        x,
        y,
        zIndex: win.z,
        width: win.maximized ? undefined : app?.defaultSize.w,
        height: win.maximized ? undefined : app?.defaultSize.h,
        display: win.minimized ? 'none' : undefined,
      }}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      drag={!win.maximized}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{
        left: 0,
        top: 0,
        right: Math.max(0, window.innerWidth - 160),
        bottom: Math.max(0, window.innerHeight - 120),
      }}
      // MOVE só no fim do gesto: despachar a cada pointermove re-renderizaria
      // a árvore inteira de janelas a 60fps.
      onDragEnd={() => move(win.key, x.get(), y.get())}
    >
      <TitleBar
        title={title}
        titleId={`win-title-${win.key}`}
        Icon={app?.icon}
        maximized={win.maximized}
        labels={os.controls}
        onDragStart={(e) => dragControls.start(e)}
        onMinimize={() => minimize(win.key)}
        onToggleMaximize={() => toggleMaximize(win.key)}
        onClose={() => close(win.key)}
      />

      <div className="noiseos-window-body">
        {AppComponent ? <AppComponent params={win.params} /> : null}
      </div>
    </motion.div>
  )
}

/**
 * Barra de título. Separada porque é ela que inicia o arrasto — o corpo da
 * janela precisa continuar selecionável e scrollável.
 */
const TitleBar = ({
  title, titleId, Icon, maximized, labels, onDragStart,
  onMinimize, onToggleMaximize, onClose,
}) => (
  <div className="noiseos-titlebar" onPointerDown={onDragStart}>
    <div className="noiseos-titlebar-label">
      {Icon ? <Icon size={15} strokeWidth={2} /> : null}
      <span id={titleId}>{title}</span>
    </div>

    <div className="noiseos-titlebar-controls">
      <button type="button" aria-label={labels.minimize} onClick={onMinimize}>
        <Minus size={14} />
      </button>
      <button
        type="button"
        aria-label={maximized ? labels.restore : labels.maximize}
        onClick={onToggleMaximize}
      >
        <Square size={12} />
      </button>
      <button type="button" aria-label={labels.close} className="close" onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  </div>
)

export default Window
```

- [ ] **Step 2: Estilizar a janela**

Criar `frontend/src/os/desktop/Window.css`:

```css
.noiseos-window {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  border: var(--win-border);
  border-radius: var(--win-radius);
  box-shadow: var(--win-shadow);
  background: var(--win-body-bg);
  -webkit-backdrop-filter: var(--win-glass-blur);
  backdrop-filter: var(--win-glass-blur);
  overflow: hidden;
  outline: none;
}

.noiseos-window.focused {
  box-shadow: var(--win-shadow), 0 0 0 1px var(--accent-color);
}

.noiseos-window.maximized {
  inset: 0 0 var(--win-titlebar-h) 0;
  width: 100vw !important;
  height: auto !important;
  border-radius: 0;
}

.noiseos-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--win-titlebar-h);
  padding: 0 6px 0 12px;
  background: var(--win-titlebar-bg);
  box-shadow: var(--win-highlight);
  cursor: grab;
  user-select: none;
  touch-action: none;
  flex: 0 0 auto;
}

.noiseos-titlebar:active { cursor: grabbing; }

.noiseos-titlebar-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: system-ui, sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.noiseos-titlebar-controls { display: flex; gap: 2px; }

.noiseos-titlebar-controls button {
  display: grid;
  place-items: center;
  width: 32px;
  height: 26px;
  border: none;
  border-radius: var(--win-control-radius);
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.15s;
}

.noiseos-titlebar-controls button:hover { background: rgba(255, 255, 255, 0.16); }
.noiseos-titlebar-controls button.close:hover { background: #e81123; color: #fff; }
.noiseos-titlebar-controls button:focus-visible { outline: 2px solid var(--accent-color); }

/* Blur fica só no chrome. Repetir backdrop-filter aqui dentro derruba
   o Safari do iOS — ver riscos do spec. */
.noiseos-window-body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 20px 22px;
  color: var(--text-primary);
}

.app-prose { font-size: 0.92rem; line-height: 1.7; }
.app-prose p { margin: 0 0 1rem; }
.app-prose a { color: var(--accent-color); }
```

- [ ] **Step 3: Verificar que o lint passa**

Run: `cd frontend && npx eslint <os arquivos que esta task criou/alterou>`
Expected: sem erros **nos arquivos desta task**. Não rode `npm run lint`: o baseline já tem 9
erros em arquivos legados (ver Global Constraints) e eles não são para consertar aqui.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/os/desktop/Window.jsx frontend/src/os/desktop/Window.css
git commit -m "feat: chrome de janela com arrasto pela barra de titulo"
```

---

### Task 9: Desktop e grade de ícones — paralela com a Task 10

**Files:**
- Create: `frontend/src/os/desktop/Desktop.jsx`
- Create: `frontend/src/os/desktop/Desktop.css`

**Interfaces:**
- Consumes: `useWindows` (Task 7); `Window` (Task 8); `Hills` (Task 6); `APPS` (Task 4); `getOsData` (Task 4); `getProfileData` de `../../data/content`
- Produces: `<Desktop />`

- [ ] **Step 1: Implementar o desktop**

Criar `frontend/src/os/desktop/Desktop.jsx`:

```jsx
import React from 'react'
import { motion } from 'motion/react'
import Hills from '../../wallpapers/Hills'
import Window from './Window'
import { APPS } from '../registry'
import { useWindows } from '../WindowManagerContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../data/os'
import { getProfileData } from '../../data/content'
import './Desktop.css'

const Desktop = ({ isAnimated = true }) => {
  const { windows, open } = useWindows()
  const { language } = useLanguage()
  const os = getOsData(language)
  const profile = getProfileData(language)

  const icons = APPS.filter((a) => a.onDesktop)

  return (
    <div className="noiseos-desktop">
      <Hills isAnimated={isAnimated} />

      {/* Assinatura: é aqui que vive o <h1> da página. A Hero deixou de
          existir, e sem isto o site perde o cabeçalho principal. */}
      <div className="noiseos-signature">
        <h1>Marcos Rodrigues</h1>
        <p>{os.signature.role}</p>
        <span className="noiseos-signature-bio">{profile.bio_highlight}</span>
      </div>

      <ul className="noiseos-icons">
        {icons.map((app, i) => {
          const Icon = app.icon
          return (
            <motion.li
              key={app.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
            >
              {/* Clique único abre: desvio deliberado da metáfora, porque
                  estes ícones são a navegação principal do site. */}
              <button type="button" onClick={() => open(app.id)}>
                <span className="noiseos-icon-tile">
                  <Icon size={26} strokeWidth={1.75} />
                </span>
                <span className="noiseos-icon-label">{os.windows[app.titleKey]}</span>
              </button>
            </motion.li>
          )
        })}
      </ul>

      {windows.map((win) => (
        <Window key={win.key} win={win} />
      ))}
    </div>
  )
}

export default Desktop
```

- [ ] **Step 2: Estilizar o desktop**

Criar `frontend/src/os/desktop/Desktop.css`:

```css
.noiseos-desktop {
  position: fixed;
  inset: 0;
  overflow: hidden;
}

.noiseos-icons {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: var(--z-icons);
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 4px;
  max-height: calc(100vh - 120px);
  margin: 0;
  padding: 0;
  list-style: none;
}

.noiseos-icons button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 88px;
  padding: 8px 4px;
  border: 1px solid transparent;
  border-radius: var(--win-control-radius);
  background: transparent;
  cursor: pointer;
}

.noiseos-icons button:hover { background: rgba(255, 255, 255, 0.12); }
.noiseos-icons button:focus-visible { outline: 2px solid var(--accent-color); }

.noiseos-icon-tile {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border: var(--win-border);
  border-radius: 14px;
  background: linear-gradient(160deg, rgba(168, 85, 247, 0.5), rgba(88, 28, 135, 0.6));
  box-shadow: var(--win-highlight);
  color: #fff;
}

.noiseos-icon-label {
  font-family: system-ui, sans-serif;
  font-size: 0.72rem;
  line-height: 1.25;
  text-align: center;
  color: #fff;
  text-shadow: var(--icon-label-shadow);
}

/* Assinatura tratada como marca d'água: integrada ao wallpaper, sem card.
   Baixo contraste no tratamento, mas o h1 continua grande de propósito. */
.noiseos-signature {
  position: absolute;
  top: 50%;
  left: 148px;
  z-index: var(--z-icons);
  transform: translateY(-50%);
  max-width: 460px;
  pointer-events: none;
}

.noiseos-signature h1 {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  font-size: clamp(2.4rem, 4vw, 3.6rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -1px;
  color: #fff;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
  opacity: 0.92;
}

.noiseos-signature p {
  margin: 10px 0 0;
  font-family: system-ui, sans-serif;
  font-size: 0.95rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #fff;
  opacity: 0.7;
}

.noiseos-signature-bio {
  display: block;
  margin-top: 14px;
  font-size: 0.86rem;
  line-height: 1.6;
  color: #fff;
  opacity: 0.52;
}

.theme-light .noiseos-signature h1,
.theme-light .noiseos-signature p,
.theme-light .noiseos-signature-bio {
  color: #2e1065;
  text-shadow: none;
}

@media (max-width: 1200px) {
  .noiseos-signature { display: none; }
}
```

- [ ] **Step 3: Verificar que o lint passa**

Run: `cd frontend && npx eslint <os arquivos que esta task criou/alterou>`
Expected: sem erros **nos arquivos desta task**. Não rode `npm run lint`: o baseline já tem 9
erros em arquivos legados (ver Global Constraints) e eles não são para consertar aqui.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/os/desktop/Desktop.jsx frontend/src/os/desktop/Desktop.css
git commit -m "feat: desktop com grade de icones e assinatura com o h1"
```

---

### Task 10: Taskbar — paralela com a Task 9

**Files:**
- Create: `frontend/src/os/desktop/Taskbar.jsx`
- Create: `frontend/src/os/desktop/Taskbar.css`

**Interfaces:**
- Consumes: `useWindows` (Task 7); `getApp`, `APPS` (Task 4); `getOsData` (Task 4)
- Produces: `<Taskbar />`

Nesta fase a taskbar tem botão Iniciar **inerte** (o menu chega na Fase 4), botões de janela funcionais, tray falso, relógio e "mostrar área de trabalho".

- [ ] **Step 1: Implementar a taskbar**

Criar `frontend/src/os/desktop/Taskbar.jsx`:

```jsx
import React, { useState, useEffect } from 'react'
import { LayoutGrid, Wifi, Volume2, BatteryMedium } from 'lucide-react'
import { useWindows } from '../WindowManagerContext'
import { getApp } from '../registry'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../data/os'
import './Taskbar.css'

const Taskbar = () => {
  const { windows, focusedKey, focus, minimize, minimizeAll } = useWindows()
  const { language } = useLanguage()
  const os = getOsData(language)

  return (
    <div className="noiseos-taskbar">
      <button type="button" className="noiseos-start" aria-label={os.taskbar.start}>
        <LayoutGrid size={20} />
      </button>

      <div className="noiseos-taskbar-divider" />

      <ul className="noiseos-taskbar-windows">
        {windows.map((win) => {
          const app = getApp(win.appId)
          const Icon = app?.icon
          const title = app?.titleKey ? os.windows[app.titleKey] : win.params?.slug || ''
          const isFocused = focusedKey === win.key

          return (
            <li key={win.key}>
              {/* Clicar no botão da janela em foco minimiza — comportamento
                  Windows, e é o que faz a barra parecer viva. */}
              <button
                type="button"
                className={`${isFocused ? 'focused' : ''}${win.minimized ? ' minimized' : ''}`}
                onClick={() => (isFocused ? minimize(win.key) : focus(win.key))}
                title={title}
              >
                {Icon ? <Icon size={16} /> : null}
                <span>{title}</span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="noiseos-taskbar-right">
        <div className="noiseos-tray" aria-hidden="true">
          <Wifi size={15} />
          <Volume2 size={15} />
          <BatteryMedium size={15} />
        </div>
        <Clock />
        <button
          type="button"
          className="noiseos-show-desktop"
          aria-label={os.taskbar.showDesktop}
          onClick={minimizeAll}
        />
      </div>
    </div>
  )
}

/** Isolado em memo para o tick de 1s não re-renderizar a taskbar toda. */
const Clock = React.memo(function Clock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="noiseos-clock">
      <span>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      <span>{now.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
    </div>
  )
})

export default Taskbar
```

- [ ] **Step 2: Estilizar a taskbar**

Criar `frontend/src/os/desktop/Taskbar.css`:

```css
.noiseos-taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-taskbar);
  display: flex;
  align-items: center;
  gap: 8px;
  height: var(--win-titlebar-h);
  padding: 0 0 0 8px;
  border-top: var(--win-border);
  background: var(--win-titlebar-bg);
  -webkit-backdrop-filter: var(--win-glass-blur);
  backdrop-filter: var(--win-glass-blur);
  font-family: system-ui, sans-serif;
}

.noiseos-start {
  display: grid;
  place-items: center;
  width: 40px;
  height: 30px;
  border: none;
  border-radius: var(--win-control-radius);
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
}

.noiseos-start:hover { background: rgba(255, 255, 255, 0.16); }

.noiseos-taskbar-divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.22);
}

/* Ancorada à esquerda: botões de janela entram e saem, e num grupo
   centralizado cada janela nova empurraria os alvos de lugar. */
.noiseos-taskbar-windows {
  display: flex;
  gap: 4px;
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow: hidden;
}

.noiseos-taskbar-windows button {
  display: flex;
  align-items: center;
  gap: 7px;
  max-width: 180px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid transparent;
  border-radius: var(--win-control-radius);
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  font-size: 0.78rem;
  cursor: pointer;
}

.noiseos-taskbar-windows button span {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.noiseos-taskbar-windows button:hover { background: rgba(255, 255, 255, 0.18); }
.noiseos-taskbar-windows button.minimized { opacity: 0.55; }
.noiseos-taskbar-windows button.focused {
  background: rgba(255, 255, 255, 0.22);
  border-color: var(--accent-color);
}

.noiseos-taskbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
}

.noiseos-tray { display: flex; gap: 10px; color: var(--text-secondary); }

.noiseos-clock {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.15;
  font-size: 0.72rem;
  color: var(--text-primary);
}

.noiseos-show-desktop {
  width: 8px;
  height: 100%;
  border: none;
  border-left: 1px solid rgba(255, 255, 255, 0.22);
  background: transparent;
  cursor: pointer;
}

.noiseos-show-desktop:hover { background: rgba(255, 255, 255, 0.14); }
```

- [ ] **Step 3: Verificar que o lint passa**

Run: `cd frontend && npx eslint <os arquivos que esta task criou/alterou>`
Expected: sem erros **nos arquivos desta task**. Não rode `npm run lint`: o baseline já tem 9
erros em arquivos legados (ver Global Constraints) e eles não são para consertar aqui.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/os/desktop/Taskbar.jsx frontend/src/os/desktop/Taskbar.css
git commit -m "feat: taskbar ancorada a esquerda com botoes de janela"
```

---

### Task 11: Montar o shell e aposentar a página linear

**Files:**
- Modify: `frontend/src/App.jsx`
- Create: `frontend/src/contexts/ThemeContext.jsx`
- Modify: `frontend/src/index.css:91-110` (remover o bloco de estilos do Lenis)
- Modify: `frontend/src/index.css:74` (remover `scroll-behavior: auto !important;` de dentro do `html`)
- Modify: `frontend/src/index.css:129-140` (remover `.mouse-light-overlay`)
- Modify: `frontend/src/index.css:456-459` (remover a regra mobile de `.mouse-light-overlay`)

**Interfaces:**
- Consumes: `WindowManagerProvider` (Task 7); `Desktop` (Task 9); `Taskbar` (Task 10); `useDeviceMode` (Task 5)
- Produces: `<ThemeProvider>`; `useTheme()` → `{ isDark, isAnimated, toggleTheme, toggleAnimation }`

Nesta fase o mobile mostra o mesmo desktop (o shell mobile é a Fase 3). `pages/HomePage.jsx` e as seções antigas **não** são deletados ainda — a Fase 2 os consome um por um, e apagar agora perderia o conteúdo de referência.

- [ ] **Step 1: Extrair tema e animação para um contexto**

Criar `frontend/src/contexts/ThemeContext.jsx`:

```jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ThemeContext = createContext(null)

function readBool(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved !== null ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => readBool('isDarkMode', true))
  const [isAnimated, setIsAnimated] = useState(() => readBool('isAnimationEnabled', true))

  // Respeitar a preferência do sistema não existia no projeto e é
  // requisito do spec: sem isto o wallpaper e o boot animam à força.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) setIsAnimated(false)
  }, [])

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      localStorage.setItem('isDarkMode', JSON.stringify(!prev))
      return !prev
    })
  }, [])

  const toggleAnimation = useCallback(() => {
    setIsAnimated((prev) => {
      localStorage.setItem('isAnimationEnabled', JSON.stringify(!prev))
      return !prev
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ isDark, isAnimated, toggleTheme, toggleAnimation }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme precisa estar dentro de ThemeProvider')
  return ctx
}
```

- [ ] **Step 2: Substituir o App**

Substituir todo o conteúdo de `frontend/src/App.jsx`:

```jsx
import React from 'react'
import { LanguageProvider } from './contexts/LanguageContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { WindowManagerProvider } from './os/WindowManagerContext'
import Desktop from './os/desktop/Desktop'
import Taskbar from './os/desktop/Taskbar'
import './os/tokens.css'

/**
 * Shell do NoiseOS.
 *
 * O Lenis saiu junto com o scroll de página: não há mais o que suavizar,
 * porque todo scroll agora acontece dentro de janelas.
 *
 * O shell mobile chega na Fase 3; até lá o mobile recebe o mesmo desktop.
 */
const Shell = () => {
  const { isDark, isAnimated } = useTheme()

  return (
    <div className={isDark ? 'theme-dark' : 'theme-light'}>
      <WindowManagerProvider>
        <Desktop isAnimated={isAnimated} />
        <Taskbar />
      </WindowManagerProvider>
    </div>
  )
}

const App = () => (
  <LanguageProvider>
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  </LanguageProvider>
)

export default App
```

- [ ] **Step 3: Limpar o CSS morto do index.css**

Em `frontend/src/index.css`, remover três coisas:

1. O bloco de estilos do Lenis (linhas 91-110): de `/* LENIS RECOMMENDED STYLES */` até o fim de
   `.lenis.lenis-scrolling iframe { ... }`. **Manter** a regra `html { ... }` da linha 72, que
   sincroniza o `background-color` — dela, remover apenas `scroll-behavior: auto !important;`.
2. O bloco `.mouse-light-overlay { ... }` (linhas 129-140) — CSS morto, zero uso em JSX.
3. A regra `.mouse-light-overlay { display: none; }` de dentro do `@media (max-width: 768px)`
   (linhas 456-459).

Adicionar ao final do arquivo, para travar o scroll de página:

```css
/* Desktop-SO não rola: todo scroll acontece dentro de janelas. */
html, body {
  height: 100%;
  overflow: hidden;
}
```

- [ ] **Step 4: Remover a dependência do Lenis**

```bash
cd frontend && npm uninstall lenis
```

- [ ] **Step 5: Verificar que lint e testes passam**

Run: `cd frontend && npx eslint src/App.jsx src/contexts/ThemeContext.jsx && npm test`
Expected: eslint sem erros nesses dois arquivos; 36 testes PASS

**Sobre o lint global:** ele continua saindo com código 1 por causa dos 9 erros de baseline em
arquivos legados (ver Global Constraints), e `pages/HomePage.jsx` some da árvore de render nesta
task mas continua existindo como referência para a Fase 2. Nada disso é para consertar agora — a
Fase 4 deleta esses arquivos e o lint global fica verde sozinho. **Não** adicione exceções ao
`eslint.config.js` para escondê-los.

- [ ] **Step 6: Verificação manual**

Run: `cd frontend && npm run dev`

Confirmar no navegador:
1. O wallpaper de colinas roxas aparece e a assinatura com "Marcos Rodrigues" está visível
2. Clicar uma vez no ícone `leia-me.txt` abre a janela
3. Arrastar pela barra de título move a janela; arrastar pelo corpo **não** move
4. Minimizar esconde a janela e o botão na taskbar fica opaco
5. Clicar no botão da taskbar restaura; clicar de novo minimiza
6. Maximizar cobre a tela sem deslocamento; restaurar volta à posição de antes
7. A URL vira `/leia-me` ao abrir e `/` ao fechar
8. Recarregar em `/leia-me` reabre a janela
9. Voltar do navegador fecha a janela
10. `Esc` fecha a janela focada
11. Abrir `/projetos/bussola-v2` direto abre duas janelas, com a do projeto na frente
12. O relógio da taskbar avança

- [ ] **Step 7: Commit**

```bash
git add frontend/src/App.jsx frontend/src/contexts/ThemeContext.jsx frontend/src/index.css frontend/package.json frontend/package-lock.json frontend/eslint.config.js
git commit -m "feat: montar shell do NoiseOS e remover Lenis e CSS morto"
```

---

## Definition of Done da Fase 1

- [ ] `npm test` passa com 36 testes (12 + 8 + 4 no reducer, 12 nas rotas)
- [ ] `npm run lint` sem erros
- [ ] Os 12 itens da verificação manual da Task 11 conferidos
- [ ] `lenis` fora do `package.json`
- [ ] Nenhum arquivo em `backend/` alterado
- [ ] Nenhum arquivo de conteúdo em `src/data/` alterado (só o `os.js` novo)

## O que a Fase 1 deliberadamente não faz

Cada item abaixo tem fase própria; nenhum é esquecimento:

- Menu Iniciar, menu de contexto, boot, screensaver, easter egg de desligar → **Fase 4**
- Shell mobile, dock, ajustes rápidos → **Fase 3**
- Os outros 8 apps e o conteúdo real de `projects`/`project` → **Fase 2**
- Toggles de tema/idioma/animação na taskbar → **Fase 2**, junto do `SettingsApp`
- Deletar `pages/HomePage.jsx`, `sections/*` e o CSS de seção → **Fase 4**, depois que a Fase 2 migrar o conteúdo
- `canonical` dinâmico e `sitemap.xml` → **Fase 4**
- `React.lazy` no `CrystalScene` → **Fase 2**, junto do `AboutApp`
