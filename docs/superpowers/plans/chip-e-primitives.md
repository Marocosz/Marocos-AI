# `Chip` e `primitives.css` — medição e decisão de não extrair (Tarefa 11B)

O spec §3 registrava, desde antes de qualquer medição, que o `Chip` era o caso de
reuso mais fraco da lista de componentes extraíveis. A Tarefa 11B existe para medir
as cinco pílulas do sistema e só extrair um componente se a medição justificar —
critério de corte: **≥ 5 declarações idênticas nas cinco pílulas → extrai; < 5 → não
extrai.**

## Divergência do brief em relação aos arquivos reais

O Step 1 do brief pede um `grep -rn "chip\|-tag {" apps/DevicesApp.css`, que retorna
zero ocorrências — o arquivo não tem nenhuma classe chamada `chip` ou `*-tag`. A
pílula real do `DevicesApp` (rota `/stack`, a única cena do harness que cobre este
app) é `.devices-item-level` — o selo de nível de domínio (expert/advanced/
intermediate) na lista de tecnologias, comentado em `DevicesApp.jsx:22-26` como a
reencarnação do "chip de tecnologia" de `TechStack.jsx`. Usei essa classe como a
quinta pílula da medição.

## Step 1 — a tabela das cinco pílulas

Valores como estão hoje nos arquivos (depois da Tarefa 4, que trocou os
`font-weight` para o peso que o navegador realmente pinta).

| Propriedade | `.about-feature-chip`<br>(AboutApp.css) | `.project-detail-tech-item`<br>(ProjectDetailApp.css) | `.history-tag`<br>(HistoryApp.css) | `.terminal-tag`<br>(TerminalApp.css) | `.devices-item-level`<br>(DevicesApp.css, base) |
|---|---|---|---|---|---|
| `font-size` | `0.75rem` | `0.8rem` | `0.68rem` | `0.78rem` | `0.68rem` |
| `font-weight` | `700` | *não declarado* | `400` | *não declarado* | `700` |
| `letter-spacing` | `0.03em` | *não declarado* | *não declarado* | *não declarado* | `0.03em` |
| `text-transform` | `uppercase` | *não declarado* | *não declarado* | *não declarado* | `uppercase` |
| `padding` | `6px 12px` | `5px 10px` | `0.3rem 0.65rem` | `0.3rem 0.6rem` | `0.2rem 0.6rem` |
| `border-radius` | `8px` | `8px` | `6px` | `5px` | `999px` |
| `background` | `var(--card-bg)` | `var(--card-bg)` | `rgba(255,255,255,0.05)` | `rgba(255,255,255,0.05)` | varia por modificador (3 variantes: `level-expert`/`level-advanced`/`level-intermediate`) |
| `border` | `1px solid var(--card-border)` | `1px solid var(--card-border)` | `1px solid rgba(255,255,255,0.1)` | `1px solid rgba(255,255,255,0.12)` | varia por modificador (idem) |
| `color` | `var(--text-primary)` | `var(--text-secondary)` | `var(--text-secondary)` | `#ddd` | varia por modificador (idem) |

Nota sobre a quinta coluna: `.devices-item-level` já é, dentro do próprio arquivo,
uma base com **três modificadores** só para cobrir os três níveis de domínio — ela
sozinha já ilustra o padrão que o critério de corte deste plano quer evitar (uma
"pílula" que não tem um único visual, e sim um por variante).

## Step 2 — critério de corte

Contagem de declarações com o **mesmo valor nas cinco pílulas**, propriedade por
propriedade:

- `font-size`: 5 valores distintos (`0.75rem`, `0.8rem`, `0.68rem`, `0.78rem`,
  `0.68rem`) — **não** idêntico nas cinco (duas coincidem por acaso, não é caso de
  extração).
- `font-weight`: `700` / não declarado / `400` / não declarado / `700` — **não**.
- `letter-spacing`: `0.03em` / não declarado / não declarado / não declarado /
  `0.03em` — **não**.
- `text-transform`: `uppercase` / não declarado / não declarado / não declarado /
  `uppercase` — **não**.
- `padding`: cinco valores distintos — **não**.
- `border-radius`: `8px`, `8px`, `6px`, `5px`, `999px` — **não** (só duas
  coincidem).
- `background`: `var(--card-bg)` ×2, `rgba(...0.05)` ×2, variável por modificador
  na quinta — **não**.
- `border`: mesmo padrão do background — **não**.
- `color`: `var(--text-primary)`, `var(--text-secondary)` ×2, `#ddd`, variável por
  modificador — **não**.

**Contagem final: 0 de 9 propriedades são idênticas nas cinco pílulas.** Muito
abaixo do corte de 5. Mesmo ignorando a ambiguidade da quinta pílula (que já é,
sozinha, uma família de 3 variantes) e comparando só as quatro primeiras, a
contagem ainda seria 0 — nenhuma propriedade bate nas quatro.

**Decisão: NÃO EXTRAIR.** As cinco pílulas têm valores visuais genuinamente
diferentes, confirmando o que o spec §3 já registrava antes de qualquer medição.
Um `Chip` que precisasse de um modificador por uso para `font-size`,
`border-radius`, `padding`, `background`, `border` e `color` simultaneamente não
removeria duplicação nenhuma — manteria a mesma quantidade de CSS, agora
espalhada entre `Chip.jsx`/`Chip.css` e os cinco `App.css`, com uma camada de
indireção (import do componente, prop `variante`) por cima.

## Step 4 — `primitives.css` com o mesmo critério

Comparação das superfícies de "card" nos cinco arquivos citados no brief:

| Arquivo | Seletor | `background` | `border` | `border-radius` | `padding` |
|---|---|---|---|---|---|
| `AboutApp.css` | `.about-spec-card` | `var(--card-bg)` | `1px solid var(--card-border)` | `14px` | `12px 8px` |
| `ProjectsApp.css` | `.projects-app-item-icon` | `var(--card-bg)` | `1px solid var(--card-border)` | `8px` | — (dimensão fixa 36×36) |
| `HistoryApp.css` | `.history-card` | `rgba(255,255,255,0.04)` | `1px solid rgba(255,255,255,0.08)` + `border-left: 3px solid var(--history-accent)` | `12px` | `1.1rem 1.25rem` |
| `ProjectDetailApp.css` | `.project-detail-header` | `var(--card-bg)` | `1px solid var(--card-border)` | `10px` | `14px 16px` |
| `SettingsApp.css` | — | *nenhuma classe de superfície de card existe neste arquivo* | — | — | — |

**Duas divergências do brief em relação aos arquivos reais:**

1. `SettingsApp.css` não tem nenhuma classe com `background`/`border`/
   `border-radius` de card — o brief afirma que "todas usam `var(--card-bg)` e
   `var(--card-border)`", o que não se sustenta para este arquivo.
2. `.history-card` **não** usa os tokens `--card-*` — usa valores `rgba` fixos
   próprios (`rgba(255,255,255,0.04)`/`rgba(255,255,255,0.08)`), diferente dos
   outros três.

O único conjunto literalmente idêntico é `background: var(--card-bg); border: 1px
solid var(--card-border);`, presente em exatamente 3 dos 5 arquivos nominados
(`AboutApp.css`, `ProjectsApp.css`, `ProjectDetailApp.css`) — tecnicamente bate o
"3 ou mais arquivos" do brief. Mas esse conjunto **não é duplicação de valor**: são
duas referências a variáveis CSS que já são a própria centralização — o token é a
fonte da verdade, não o CSS que o consome. `border-radius` (`14px`/`8px`/`10px`) e
`padding` (três valores diferentes) — as propriedades que de fato variam entre
essas superfícies — não coincidem em nenhum par.

Criar `src/os/primitives.css` com uma classe `.card-surface { background:
var(--card-bg); border: 1px solid var(--card-border); }` trocaria duas linhas por
um import + uma classe em três arquivos, sem eliminar nenhuma duplicação real
(o valor já vem de um único lugar, `index.css:20-21` e `:35-36`) e sem tocar no que
de fato diverge entre as superfícies (raio e padding, que continuariam declarados
um a um). É exatamente o "não sobra nada que valha" que o próprio brief antecipa.

**Decisão: NÃO CRIAR `primitives.css`.** Os tokens `--card-bg`/`--card-border` já
fazem o trabalho de centralização; não há um segundo conjunto de declarações
literalmente idêntico e substancial em três ou mais arquivos.

## Resultado

Nenhum arquivo em `frontend/src` foi alterado. Esta tarefa termina apenas com este
registro, como o brief prevê como resultado válido.
