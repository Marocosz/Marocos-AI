# Migração dos pesos de fonte — Tarefa 4

Auditoria completa das 34 declarações `font-weight: 200|300|500|600|800` encontradas em
`frontend/src/**/*.css` (medidas logo após a Tarefa 3), com a família efetiva de cada
seletor, o peso resolvido pela regra de font-matching do CSS e a ação aplicada.

Regra aplicada (fechada, não medida): para uma família com pesos 400/700/900 (Poppins) ou
400/700 (Courier New) — `200→400`, `300→400`, `500→400`, `600→700`, `800→900` (Poppins) /
`800→700` (Courier New, que não tem 900).

Seletores sob `system-ui` (Segoe UI Variable no Windows, eixo de peso contínuo) ou
`ui-monospace` (varia por SO) não são tocados: nessas famílias o peso declarado já é o que
renderiza. Pela mesma razão, um `<button>`/`<input>` sem `font-family`/`font: inherit`
próprio também não é tocado: controles de formulário não herdam a família dos ancestrais —
o navegador aplica a fonte de controle do UA, cuja disponibilidade de pesos também depende
da máquina (ver `#5`, corrigido após revisão).

| # | arquivo | linha* | seletor | família efetiva | peso declarado | peso resolvido | ação |
|---|---|---|---|---|---|---|---|
| 1 | apps/AboutApp.css | 140 | `.about-spec-number` | Poppins (herdada) | 800 | 900 | trocado |
| 2 | apps/AboutApp.css | 159 | `.about-spec-sublabel` | Poppins (herdada) | 300 | 400 | trocado |
| 3 | apps/AboutApp.css | 182 | `.about-feature-chip` | Poppins (herdada) | 600 | 700 | trocado |
| 4 | apps/AssistantApp.css | 121 | `.assistant-empty-title` | Poppins (herdada) | 500 | 400 | trocado |
| 5 | apps/AssistantApp.css | 149 | `.assistant-suggestion-chip` | fonte de controle do UA (é um `<button>`, `AssistantApp.jsx:215`, sem `font-family`/`font: inherit` própria — controles de formulário não herdam a família dos ancestrais) | 500 | — | mantido |
| 6 | apps/AssistantApp.css | 245 | `.assistant-bubble strong` | Poppins (herdada) | 600 | 700 | trocado |
| 7 | apps/DevicesApp.css | 33 | `.devices-eyebrow` | `'Courier New'` (própria) | 600 | 700 | trocado |
| 8 | apps/DevicesApp.css | 40 | `.devices-title` | Poppins (herdada) | 800 | 900 | trocado |
| 9 | apps/DevicesApp.css | 51 | `.devices-subtitle` | Poppins (herdada) | 300 | 400 | trocado |
| 10 | apps/DevicesApp.css | 119 | `.devices-category-title` | Poppins (herdada — pai `.devices-category-toggle` usa `font: inherit`, sem família própria) | 600 | 700 | trocado |
| 11 | apps/DevicesApp.css | 148 | `.devices-list-header` | Poppins (herdada) | 600 | 700 | trocado |
| 12 | apps/DevicesApp.css | 205 | `.devices-item-name` | Poppins (herdada) | 500 | 400 | trocado |
| 13 | apps/HistoryApp.css | 30 | `.history-label` | `'Courier New'` (própria) | 600 | 700 | trocado |
| 14 | apps/HistoryApp.css | 37 | `.history-title` | Poppins (herdada) | 800 | 900 | trocado |
| 15 | apps/HistoryApp.css | 49 | `.history-subtitle` | Poppins (herdada) | 300 | 400 | trocado |
| 16 | apps/HistoryApp.css | 119 | `.history-badge` | `'Courier New'` (herdada de `.history-card-header`, linha 101 — ver JSX: `.history-badge` é filho direto dela) | 600 | 700 | trocado |
| 17 | apps/HistoryApp.css | 173 | `.history-tag` | Poppins (herdada — `.history-tags`/`.history-card` não têm família própria; `.history-card-header` é irmã, não ancestral) | 500 | 400 | trocado |
| 18 | apps/ProjectDetailApp.css | 51 | `.project-detail-label` | Poppins (herdada) | 600 | 700 | trocado |
| 19 | apps/ProjectDetailApp.css | 90 | `.project-detail-github-btn` | Poppins (herdada) | 600 | 700 | trocado |
| 20 | apps/ProjectsApp.css | 67 | `.projects-app-item-title` | Poppins (herdada — pai `.projects-app-item` usa `font: inherit`, sem família própria) | 600 | 700 | trocado |
| 21 | apps/ProjectsApp.css | 76 | `.projects-app-item-category` | Poppins (herdada) | 600 | 700 | trocado |
| 22 | apps/SettingsApp.css | 60 | `.settings-label` | `system-ui` (herdada de `.settings-app`, linha 10) | 600 | — | mantido |
| 23 | apps/SettingsApp.css | 78 | `.settings-value` | `system-ui` (herdada via `font-family: inherit` → `.settings-app`) | 600 | — | mantido |
| 24 | apps/TerminalApp.css | 169 | `.terminal-col-type` | `ui-monospace` (herdada de `.terminal-app`, linha 24) | 600 | — | mantido |
| 25 | os/boot/boot.css | 407 | `.lock-user` | `system-ui` (própria, junto com `.porta-entrar`) | 500 | — | mantido |
| 26 | os/boot/boot.css | 417 | `.porta-entrar` | `system-ui` (própria, junto com `.lock-user`) | 600 | — | mantido |
| 27 | os/boot/boot.css | 702 | `.lock-time` | `system-ui` (própria) | 200 | — | mantido |
| 28 | os/desktop/StartMenu.css | 106 | `.start-menu-apps-heading` | Poppins (herdada) | 600 | 700 | trocado |
| 29 | os/desktop/Taskbar.css | 297 | `.tray-menu-label` | Poppins (herdada) | 500 | 400 | trocado |
| 30 | os/desktop/Window.css | 84 | `.marocos-titlebar-label` | `system-ui` (própria) | 500 | — | mantido |
| 31 | os/mobile/MobileShell.css | 60 | `.marocos-mobile-clock` | `system-ui` (própria) | 600 | — | mantido |
| 32 | os/mobile/MobileShell.css | 190 | `.marocos-mobile-app-title` | `system-ui` (própria) | 600 | — | mantido |
| 33 | os/mobile/MobileShell.css | 303 | `.marocos-mobile-qs-title` | `system-ui` (própria) | 600 | — | mantido |
| 34 | os/mobile/MobileShell.css | 364 | `.marocos-mobile-qs-value` | `system-ui` (própria) | 600 | — | mantido |

\* Linha no arquivo **antes** da edição (a mesma numeração do grep do Step 1/Brief). Depois
de inserir os comentários de justificativa os números de linha deslocam; use o seletor como
referência estável.

## Resumo

- **34** declarações auditadas, **13** arquivos — bate com a porta de segurança do Step 1
  (distribuição por peso: 600×20, 500×7, 300×3, 800×3, 200×1; por arquivo: DevicesApp 6,
  HistoryApp 5, MobileShell 4, boot.css 3, AssistantApp 3, AboutApp 3, SettingsApp 2,
  ProjectsApp 2, ProjectDetailApp 2, Window.css 1, Taskbar.css 1, StartMenu.css 1,
  TerminalApp.css 1).
- **22 trocadas** (19 efetivamente Poppins herdada, 3 efetivamente `'Courier New'` própria/
  herdada — `.devices-eyebrow`, `.history-label`, `.history-badge`).
- **12 mantidas** (10 `system-ui`, 1 `ui-monospace`, 1 fonte de controle do UA em `<button>`
  sem `font-family` própria — `.assistant-suggestion-chip`, #5) — todas com comentário de
  justificativa adicionado na linha, explicando a família herdada/própria (ou a ausência
  dela) e por que o peso declarado já é o que renderiza.
- Nenhuma linha ficou sem classificação ou sem justificativa.

## Pontos de atenção herdados na classificação

- `.devices-category-title` (#10) e `.projects-app-item-title`/`.projects-app-item-category`
  (#20/#21) — os pais (`.devices-category-toggle`, `.projects-app-item`) usam `font: inherit`
  (shorthand), que reseta todas as subpropriedades de fonte para o valor herdado do próprio
  pai deles. Como nenhum ancestral acima declara família própria, a cadeia termina no Poppins
  do `:root`.
- `.history-badge` (#16) é o único caso em que a família efetiva **não** é a intuitiva pelo
  nome do arquivo: herda `'Courier New'` de `.history-card-header` (mesmo bloco `<div>` no
  JSX), enquanto `.history-tag` (#17), no mesmo arquivo, é irmã de `.history-card-header` (não
  descendente) e por isso fica com Poppins.
- `.assistant-suggestion-chip` (#5) — **corrigido em revisão**: a versão original desta
  tabela classificou como "Poppins (herdada)", olhando só a cadeia de ancestrais no CSS.
  O elemento é um `<button>` (`AssistantApp.jsx:215-222`) e a regra não declara
  `font-family` nem `font: inherit` própria. Controles de formulário (`<button>`, `<input>`,
  `<select>`, `<textarea>`) **não herdam** `font-family` dos ancestrais por padrão — o
  navegador aplica a fonte de controle do UA, que no Windows tende a ser a fonte de sistema.
  Isso põe o seletor na mesma categoria de `system-ui`/`ui-monospace`: a disponibilidade de
  pesos depende da máquina, então a troca original (500→400) teria introduzido a própria
  mudança visual que esta tarefa existe para evitar. Revertido para 500 e reclassificado
  como mantido. Os demais `<button>` entre as trocadas (`.devices-category-toggle`,
  `.projects-app-item`) foram conferidos e têm `font: inherit` própria — herdam de verdade,
  então continuam corretos como Poppins trocada.
