# Refatoração do frontend — Plano de Implementação

> **Para trabalhadores agênticos:** SUB-SKILL OBRIGATÓRIA: use
> `superpowers:subagent-driven-development` (recomendado) ou
> `superpowers:executing-plans` para implementar este plano tarefa a tarefa. Os
> passos usam checkbox (`- [ ]`) para rastreamento.

**Goal:** Reduzir o caminho crítico de 432 KB para ~200 KB gzip, eliminar
duplicação estrutural e criar um arquivo central de configuração — **sem alterar
um pixel do que o visitante vê**.

**Architecture:** Quatro fases sequenciais e independentemente mergeáveis:
faxina de código morto (1–4), configuração e componentes (5–11B), performance de
bundle (12–14), acabamento (15–16). Cada tarefa termina com build medido, lint
limpo e comparação visual contra a linha de base capturada na Tarefa 0.

**Sobre a numeração:** as tarefas 6B e 11B foram inseridas na auto-revisão, ao
conferir o plano contra o spec — a 6B porque o config precisava de consumidores
(sem ela o `system.js` existiria sem ninguém o consultar para posição de janela
e tempo de transição), e a 11B porque o `Chip`/`primitives.css` do spec §3 não
tinha tarefa. Mantidas com sufixo em vez de renumerar, para não invalidar as
referências cruzadas entre tarefas. **A ordem de execução é a ordem em que
aparecem no documento.**

**Tech Stack:** React 19, Vite 7, `motion` (Framer), `ogl`, `three` +
`@react-three/fiber` + `@react-three/drei`, `lucide-react`, `react-markdown`,
vitest (`environment: 'node'`).

**Spec:** `docs/superpowers/specs/2026-08-10-refatoracao-frontend-design.md`

---

## Global Constraints

Valem para **todas** as tarefas, sem exceção.

- **Design e arte não mudam.** Nenhuma tarefa pode alterar cor, espaçamento,
  tipografia renderizada, timing percebido ou posição de elemento. Se a
  comparação visual acusar diferença, a tarefa está errada — mesmo que o código
  esteja melhor.
- **Idioma:** código, comentários, nomes de variável e mensagens de commit em
  **PT-BR**. É a convenção do repositório.
- **Mensagens de commit:** prefixo `feat:` / `fix:` / `perf:` / `refactor:` /
  `docs:` / `chore:`. **NUNCA** adicionar o trailer `Co-Authored-By:` nem
  qualquer assinatura de ferramenta. O dono do repositório pediu isso
  explicitamente.
- **Sem dependências novas.** O `ogl` (1.0.11) já está no `package.json`. Nenhum
  `npm install` é necessário em nenhuma tarefa.
- **Sem TypeScript, sem prettier, sem router, sem lib de i18n, sem suíte de
  testes de componente.** Fora de escopo por decisão registrada no spec.
- **Testes automatizados só para lógica pura.** O vitest do projeto roda com
  `environment: 'node'` e `include: ['src/**/*.test.js']` — apenas `.test.js`,
  sem DOM. Não criar `.test.jsx`, não instalar jsdom.
- **Diretório de trabalho:** `frontend/`. Todos os caminhos deste plano são
  relativos a ele salvo indicação contrária.
- **Comandos de verificação:** `npm run build`, `npm run lint`, `npm test`.

### Como a verificação visual acontece nesta execução

**Duas camadas: captura automática por tarefa, e conferência humana por fase.**

#### Camada 1 — comparação pixel a pixel, em toda tarefa [VISUAL]

Existe um harness em `.superpowers/sdd/2026-08-10-refatoracao-frontend/captura/`
(fora do versionamento). Ele sobe o build de produção num Chromium headless e
fotografa **17 cenas fixas**: o wallpaper sozinho nos dois temas, a área de
trabalho com janela, os 9 apps, a tela de bloqueio, e o shell mobile.

```bash
cd .superpowers/sdd/2026-08-10-refatoracao-frontend/captura
node capturar.mjs ./nova            # depois de `npm run build` no frontend
node comparar.mjs ./base-v2 ./nova
```

**O que torna isso confiável — e por que não é só "tirar print":**

- **Congelamento.** O wallpaper é shader animado e o cristal é 3D. A captura
  desliga a animação pelo próprio controle do sistema (`isAnimationEnabled`),
  o que faz o Silk parar de invalidar o canvas e o cristal cair em
  `frameloop="demand"` — os dois desenham um frame e dormem.
- **Máscara nos relógios.** A taskbar e a tela de bloqueio mostram a hora. As
  regiões são cobertas antes de salvar, senão toda captura difere da anterior.
- **Limiar medido, e por cena.** Rodando a captura duas vezes no mesmo commit,
  as cenas com WebGL variam de 610 a 1099 px por arredondamento do
  rasterizador; **as cenas que são só UI variam ZERO px**. Por isso a
  tolerância é 3000 px nas primeiras e **zero** nas demais — nas telas de
  interface, um único pixel diferente num rótulo, num peso de fonte ou num
  espaçamento já é alarme.

A referência de máquina é `base-v2`, capturada no commit `94ab1c0`, cujo
estado foi verificado pelas revisões das tarefas 1 a 6.

**Isto NÃO substitui a conferência humana.** Comparação automática pega
regressão; não pega "ficou pior". E a referência de máquina não é a mesma coisa
que o navegador real do dono — resolução, fontes e GPU diferem.

#### Camada 2 — quatro paradas, uma por fase

- A **Tarefa 0 foi executada pelo dono do projeto**: três capturas do Chrome
  real dele, em `docs/superpowers/plans/baseline/`. São a verdade humana, e
  **não** servem para comparação automática justamente por virem de outra
  máquina.
- Onde uma tarefa mandar "comparar com a linha de base", o implementador roda o
  harness e **reporta o resultado numérico**. Se uma cena divergir, a imagem de
  diferença fica em `_diff/` e o implementador precisa explicar a causa — não
  basta declarar que era esperado.
- A conferência humana acontece nas quatro paradas:

| parada | depois da tarefa | o que foi mexido |
|---|---|---|
| 1 | 4 | faxina de CSS morto, `.about-block`, pesos de fonte |
| 2 | 11B | config, ponte CSS, hooks, os componentes de `ui/` |
| 3 | 14 | contexto de janelas, **Silk → ogl**, apps sob demanda |
| 4 | 16 | acessibilidade e reorganização de pastas |

Nenhuma fase começa antes de a parada anterior ter sido aprovada.

### Protocolo de verificação visual

O que o dono do projeto percorre em cada parada. Executar `npm run dev` e
comparar contra a linha de base da Tarefa 0, **nos dois temas** (claro e
escuro):

1. Boot → tela de bloqueio → desktop
2. Área de trabalho: ícones, assinatura, wallpaper em movimento
3. Abrir, arrastar, maximizar, restaurar, minimizar e fechar uma janela
4. Menu Iniciar, menu de contexto (botão direito no wallpaper), bandeja
5. Os 9 apps, um a um
6. Modo mobile (janela < 1024px): home, dock, um app, quick settings
7. Troca de tema (o crossfade do wallpaper)

**Se qualquer quadro diferir da linha de base, reverter a tarefa e reportar.**

---

## Estrutura de arquivos

**Criados:**

| arquivo | responsabilidade |
|---|---|
| `src/config/system.js` | fonte única dos valores de ajuste do sistema |
| `src/config/cssBridge.js` | escreve o config como custom properties `--cfg-*` |
| `src/config/system.test.js` | garante forma e faixas do config |
| `src/os/hooks/useIdleTask.js` | `requestIdleCallback` com fallback e cancelamento |
| `src/os/hooks/useMediaQuery.js` | base única de `matchMedia` |
| `src/ui/AppIconButton.jsx` + `.css` | o botão de app do registry, 2 variantes |
| `src/ui/Clock.jsx` | relógio, intervalo derivado do formato |
| `src/ui/ToggleRow.jsx` + `.css` | linha de toggle (Settings, QuickSettings) |
| `src/ui/useSystemToggles.js` | os 3 controles do sistema, resolvidos |
| `src/ui/AppHeader.jsx` + `.css` | eyebrow + título + subtítulo, 2 escalas |
| `src/os/shell/Shell.jsx`, `BoasVindas.jsx`, `TituloDaPagina.jsx` | quebra do `App.jsx` |

**Modificados (principais):** `src/index.css`, `src/apps/AboutApp.{jsx,css}`,
`src/os/tokens.css`, `src/os/windowManager.js`,
`src/os/WindowManagerContext.jsx`, `src/os/registry.js`,
`src/os/desktop/{Desktop,Window,Taskbar,StartMenu}.jsx`,
`src/os/mobile/{HomeScreen,Dock,QuickSettings,MobileApp}.jsx`,
`src/components/backgrounds/Silk.jsx`, `src/wallpapers/Hills.jsx`,
`src/apps/AssistantApp.jsx`, `vite.config.js`.

**Apagados:** `src/App.css`, `src/components/ui/StartMenu_ignore_this.txt`,
~400 linhas de `src/index.css`.

---

# FASE 1 — Faxina (Tarefas 0–4)

---

### Task 0: Linha de base

Nenhuma mudança de código. Sem esta tarefa, nenhuma das seguintes é verificável.

**Files:**
- Create: `docs/superpowers/plans/baseline.md`

**Interfaces:**
- Produces: `docs/superpowers/plans/baseline.md` com os tamanhos de chunk que
  todas as tarefas seguintes usam como referência.

- [ ] **Step 1: Build limpo e medição**

```bash
cd frontend
rm -rf dist
npm run build
for f in dist/assets/*.js dist/assets/*.css; do
  printf "%-40s raw %8s  gz %8s\n" "$(basename $f)" "$(stat -c%s "$f")" "$(gzip -c "$f" | wc -c)"
done
```

Esperado (linha de base conhecida desta branch):

```
index-*.js       raw  1497981  gz   432103
Crystal-*.js     raw    59581  gz    21135
index-*.css      raw    71817  gz    13416
```

- [ ] **Step 2: Lint e testes**

```bash
npm run lint
npm test
```

Esperado: lint sem erros; 2 arquivos de teste passando
(`routes.test.js`, `windowManager.test.js`).

- [ ] **Step 3: Capturar as telas de referência**

Rodar `npm run dev` e salvar capturas de tela em
`docs/superpowers/plans/baseline/`, seguindo os 7 itens do **Protocolo de
verificação visual** acima, nos dois temas. Nomear
`NN-descricao-{claro,escuro}.png`.

Estas imagens são o critério de aceite de toda tarefa **[VISUAL]**.

- [ ] **Step 4: Escrever o baseline.md**

Registrar em `docs/superpowers/plans/baseline.md`: a tabela de tamanhos do
Step 1, a saída de lint/test do Step 2, e a lista de capturas do Step 3.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/plans/
git commit -m "docs: linha de base de bundle e telas antes da refatoracao"
```

---

### Task 1: Faxina inerte

Apagar o que não é referenciado por ninguém. Risco zero: verificado por grep.

**Files:**
- Delete: `src/App.css`
- Delete: `src/components/ui/StartMenu_ignore_this.txt`
- Modify: `src/data/contact.js`, `content.js`, `journey.js`, `projects.js`, `tech.js`

**Interfaces:**
- Consumes: nada.
- Produces: nada. Remoção pura.

- [ ] **Step 1: Confirmar que nada referencia os alvos**

```bash
cd frontend/src
grep -rn "App.css" --include=*.jsx --include=*.js .
grep -rn "StartMenu_ignore_this" --include=*.jsx --include=*.js .
for e in contactData profileData journeyData projectsData techData; do
  echo "--- $e ---"
  grep -rn "\b$e\b" --include=*.jsx --include=*.js . | grep -v "^./data/"
done
```

Esperado: **saída vazia em todos**. `App.css` não é importado (o `App.jsx`
importa apenas `./os/tokens.css`), e os cinco exports de compatibilidade não têm
consumidor fora da própria pasta `data/`.

Se algum comando devolver linha, **parar e reportar** — a premissa mudou.

- [ ] **Step 2: Apagar os dois arquivos mortos**

```bash
git rm frontend/src/App.css
git rm frontend/src/components/ui/StartMenu_ignore_this.txt
```

- [ ] **Step 3: Remover os exports de compatibilidade**

Apagar estas linhas (e o comentário imediatamente acima de cada uma, quando
existir):

- `src/data/contact.js`: `export const contactData = contactDataItems;` e o
  comentário `// Backwards compatibility for raw list if needed`
- `src/data/content.js`: `export const profileData = profileDataStart;` e o
  comentário `// Backwards compatibility if needed, though we should update consumers`
- `src/data/journey.js`: `export const journeyData = journeyDataEn;`
- `src/data/projects.js`: `export const projectsData = projectsDataEn;`
- `src/data/tech.js`: `export const techData = techDataItemsEn;`

**Não** tocar nos `getXData(lang)` — são a API viva.

- [ ] **Step 4: Verificar**

```bash
cd frontend
npm run lint
npm test
npm run build
```

Esperado: lint limpo, testes passando, build sem erro. Os tamanhos devem ficar
praticamente iguais à linha de base (o CSS morto não era importado, então nem
entrava no bundle).

- [ ] **Step 5: Commit**

```bash
git add -A frontend/src
git commit -m "chore: remover App.css do boilerplate, txt de sobra e exports mortos de data/"
```

---

### Task 2: Colisão `.about-section` — corrigir [VISUAL]

**Esta tarefa MUDA o visual da janela "Sobre", de propósito e com aprovação
explícita do dono do projeto.** É a única exceção à seção 0 deste plano.

**Contexto:** `AboutApp.jsx` usa `className="about-section"` em duas
`<section>`. O `AboutApp.css` **não define** essa classe — só
`.about-section-title`. Quem a define é o bloco legado da landing page em
`index.css`:

```css
.about-section {
  position: relative;  width: 100%;  min-height: 70vh;
  padding: 5rem 2rem;  background-color: transparent;
  display: flex;  align-items: center;  justify-content: center;
  overflow: hidden;  border-top: none;
}
```

**As duas consequências, ambas confirmadas na captura da linha de base**
(`docs/superpowers/plans/baseline/01-area-de-trabalho-escuro.png`):

1. **`min-height: 70vh` + `padding: 5rem`, duas vezes.** Numa janela de 620×520
   isso empurra as seções "ESPECIFICAÇÕES" e "RECURSOS INSTALADOS" para o
   equivalente a duas viewports abaixo da dobra. Na captura elas **não
   aparecem** — só a barra de rolagem denuncia que existem.
2. **`display: flex` em direção LINHA.** Os filhos de cada seção são o
   `<h3 class="about-section-title">` e o bloco de conteúdo. Hoje eles ficam
   **lado a lado**, centralizados — e o `.about-specs`, que é
   `grid-template-columns: repeat(3, 1fr)`, vira item flex e encolhe para o
   conteúdo em vez de ocupar a largura.

**Por que isto é correção e não redesenho.** O `AboutApp.css` foi escrito para
fluxo em bloco e diz isso sozinho: `.about-app` já é uma coluna flex com
`gap: 22px` entre as seções; `.about-section-title` traz `margin: 0 0 10px`,
ou seja espera algo **abaixo** de si; e `.about-specs` é um grid de 3 colunas,
que só faz sentido ocupando a largura. Remover o override legado não inventa um
layout novo — deixa aparecer o que o CSS do próprio app já pedia.

**Files:**
- Modify: `src/apps/AboutApp.jsx:85`, `src/apps/AboutApp.jsx:99`
- Modify: `src/apps/AboutApp.css`
- Modify: `src/index.css` (só o bloco `.about-section`)

**Interfaces:**
- Consumes: nada.
- Produces: `AboutApp.jsx` sem a classe `about-section`. A Tarefa 3 depende
  desta ter passado para poder apagar o resto do `index.css` com segurança.

- [ ] **Step 1: Confirmar a premissa no código**

```bash
cd frontend/src
grep -n "about-section" apps/AboutApp.jsx apps/AboutApp.css index.css
```

Esperado, e a tarefa depende disso:
- `apps/AboutApp.jsx` — duas ocorrências de `className="about-section"`
- `apps/AboutApp.css` — **só** `.about-section-title` (e o `::before` dela);
  **nenhuma** regra `.about-section`
- `index.css` — a regra `.about-section` com as 10 declarações citadas acima

Se `AboutApp.css` definir `.about-section`, a premissa da tarefa está errada:
**PARE e reporte**, porque então a janela não está sendo estilizada por código
morto e a correção seria outra.

- [ ] **Step 2: Tirar a classe do JSX**

Em `src/apps/AboutApp.jsx`, linhas 85 e 99, trocar

```jsx
<section className="about-section">
```

por

```jsx
<section>
```

São exatamente duas ocorrências. **Não** tocar em `.about-section-title`, que é
outra classe, tem regra própria no `AboutApp.css` e continua como está.

Um `<section>` sem classe é `display: block` em fluxo normal — que é o que o
`AboutApp.css` já espera. Nenhuma classe nova é necessária, e criar uma vazia
só para ter onde pendurar um nome seria peso morto.

- [ ] **Step 3: Documentar a remoção no AboutApp.css**

Acrescentar, logo acima de `.about-section-title` em `src/apps/AboutApp.css`:

```css
/* As duas <section> deste app não têm classe, e isso é deliberado.
 *
 * Elas usavam `about-section`, que o AboutApp.css nunca definiu — quem definia
 * era o index.css da landing page que deixou de existir, com
 * `min-height: 70vh`, `padding: 5rem 2rem` e `display: flex` em direção linha.
 * O efeito, numa janela de 620x520: as seções de especificações e de recursos
 * ficavam duas viewports abaixo da dobra, e dentro de cada uma o título e o
 * conteúdo apareciam lado a lado, com o grid de 3 colunas encolhido.
 *
 * Em fluxo normal o CSS daqui funciona sozinho: `.about-app` é a coluna flex
 * com gap de 22px, `.about-section-title` traz a própria margem inferior, e
 * `.about-specs` ocupa a largura como o grid de 3 colunas pede.
 */
```

- [ ] **Step 4: Remover o bloco `.about-section` do index.css**

Apagar **somente** esta regra de `src/index.css` (fica logo abaixo do comentário
`/* --- ESTILOS DA SEÇÃO SOBRE MIM --- */`):

```css
.about-section { ... }
```

Deixar o resto do `index.css` intacto nesta tarefa — é a Tarefa 3 que o limpa.

- [ ] **Step 5: Verificar que nada mais usa a classe**

```bash
cd frontend/src
grep -rn "about-section\b" --include=*.jsx --include=*.css .
```

Esperado: **apenas** ocorrências de `about-section-title`. Nenhuma de
`about-section` sozinha.

- [ ] **Step 6: Verificar build**

```bash
cd frontend && npm run lint && npm test && npm run build
```

- [ ] **Step 7: Registrar para a Parada 1**

Esta é a **única tarefa do plano que muda o visual de propósito**. Anotar no
relatório, para a conferência do dono do projeto na Parada 1, que a janela
"Sobre este PC" deve agora mostrar, sem rolagem longa:

1. o bloco de identidade (cristal + destaque) — inalterado
2. a bio — inalterada
3. **"// ESPECIFICAÇÕES"** com os cards de stat em **3 colunas ocupando a
   largura** da janela
4. **"// RECURSOS INSTALADOS"** com o marquee de skills correndo

Comparar com `docs/superpowers/plans/baseline/01-area-de-trabalho-escuro.png`,
onde os itens 3 e 4 **não aparecem**. Se depois da mudança eles continuarem
sem aparecer, ou aparecerem lado a lado com o título, a correção não pegou.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/apps/AboutApp.jsx frontend/src/apps/AboutApp.css frontend/src/index.css
git commit -m "fix: mostrar as secoes de especificacoes e skills na janela Sobre

O AboutApp usava a classe .about-section, que ele proprio nunca definiu -- quem
definia era o index.css da landing page que deixou de existir. As duas secoes
da janela herdavam min-height 70vh, padding 5rem e display:flex em direcao
linha.

Numa janela de 620x520 isso empurrava 'especificacoes' e 'recursos instalados'
para duas viewports abaixo da dobra, e dentro de cada secao punha o titulo e o
conteudo lado a lado, com o grid de 3 colunas encolhido. Na captura da linha de
base as duas secoes simplesmente nao aparecem.

Em fluxo normal o CSS do proprio app funciona sozinho: .about-app ja e a coluna
flex com gap, .about-section-title tem margem inferior, e .about-specs ocupa a
largura. Mudanca visual deliberada, aprovada pelo dono do projeto."
```

---

### Task 3: Apagar o resto do `index.css` morto [VISUAL]

Depende da Tarefa 2 ter passado.

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Consumes: `.about-block` da Tarefa 2.
- Produces: `index.css` reduzido de 540 para ~130 linhas.

- [ ] **Step 1: Reconfirmar as classes mortas**

```bash
cd frontend/src
for c in stop-scrolling main-content hero-section hero-background hero-content \
         hero-subtitle hero-f11-hint about-background about-content about-main \
         about-image about-text journey-section journey-background \
         journey-container journey-content-left journey-title \
         journey-description journey-content-right spline-canvas spline-loading \
         section-title-large section-label section-subtitle card-description \
         card-company contact-desc card-org project-tech; do
  n=$(grep -rn "className=\"[^\"]*\b$c\b" --include=*.jsx . | head -1)
  if [ -z "$n" ]; then echo "MORTO $c"; else echo "VIVO  $c -> $n"; fi
done
```

Esperado: **`MORTO` em todas as 29.**

Atenção ao falso positivo já identificado: `card-org` parece vivo num grep
frouxo porque o `HistoryApp` usa `history-card-org`. O seletor CSS `.card-org`
**não** casa com a classe `history-card-org` — são classes distintas. O grep
acima, ancorado em `className="`, já trata isso.

- [ ] **Step 2: Confirmar as três classes que FICAM**

```bash
grep -rn "theme-toggle-btn\|tray-divider" --include=*.jsx .
```

Esperado: ambas em `os/desktop/Taskbar.jsx`. **Estas duas regras não podem ser
apagadas.**

- [ ] **Step 3: Apagar os blocos mortos**

Remover de `src/index.css`:

- `.theme-light .section-label { ... }`
- `.theme-light .card-description, .card-company, .contact-desc,
  .section-subtitle, .card-org, .project-tech { ... }`
- `.main-content { ... }`
- todo o bloco `/* --- ESTILOS DA HERO SECTION --- */`: `.hero-section`,
  `.hero-background`, `.hero-content`, `.hero-content h1`,
  `.hero-content .hero-subtitle`, `.hero-f11-hint`, `@keyframes pulse`
  (usado só por `.hero-f11-hint`)
- do bloco `/* --- ESTILOS DA SEÇÃO SOBRE MIM --- */`: `.about-background`,
  `.about-content`, `.about-content .section-title`, `.about-main`,
  `.about-image`, `.about-image img`, `.about-text`, `.about-text p`,
  `.about-text p:not(:last-child)` — o `.about-section` já saiu na Tarefa 2
- todo o bloco `/* --- ESTILOS DA SEÇÃO JORNADA --- */`: `.journey-section`,
  `.journey-background`, `.journey-container`, `.journey-content-left`,
  `.journey-title`, `.theme-light .journey-title`, `.journey-description`,
  `.journey-content-right`, `.spline-canvas`, `.spline-loading`
- `html.stop-scrolling, body.stop-scrolling { ... }` — era do Lenis, que saiu
  do projeto
- dos `@media`: todas as regras cujo seletor esteja na lista morta acima.
  Nos blocos `max-width: 1024px`, `max-width: 480px` e
  `max-height: 500px and (orientation: landscape)` isso esvazia o bloco
  inteiro — apagar o `@media` junto. No bloco `max-width: 768px`, **preservar
  apenas** `body { font-size: 0.95rem; }`.

- **As duas `.about-section` órfãs dentro dos `@media`** — achadas na revisão da
  Tarefa 2, que corretamente as deixou para cá:

  ```css
  @media (max-width: 1024px) {
    .about-section { min-height: auto; padding: 4rem 2rem; }   /* ~linha 376 */
  }
  @media (max-width: 768px) {
    .about-section { padding: 3rem 1.5rem; }                   /* ~linha 428 */
  }
  ```

  A regra base `.about-section` saiu na Tarefa 2 e o `AboutApp.jsx` não usa mais
  a classe, então estes dois overrides não casam com elemento nenhum. **Remover
  os dois.** Conferir com `grep -n "about-section" frontend/src/index.css` antes
  e depois: depois não pode sobrar nenhuma ocorrência neste arquivo.

**FICAM, obrigatoriamente:** o `:root` inteiro (tipografia e as variáveis
`--bg-color`, `--text-primary`, `--text-secondary`, `--accent-color`,
`--card-bg`, `--card-border`, `--scrollbar-*`), o `.theme-light` com os
overrides de variável, o seletor amplo
`.theme-light h1, h2, h3, h4, p, span, li, div { color: ... }` (tratado na
Tarefa 16), `html { scrollbar-width... }`, `html::-webkit-scrollbar`,
`body::-webkit-scrollbar`, `body { ... }`, `* { box-sizing: border-box; }`,
`.theme-toggle-btn` (+ `:hover`), `.tray-divider`, e o
`html, body { height: 100%; overflow: hidden; }` do fim — **este último é
crítico**, é o que impede o scroll de página.

- [ ] **Step 4: Verificação visual completa**

Rodar `npm run dev` e percorrer os 7 itens do **Protocolo de verificação
visual**, nos dois temas. O risco concentrado aqui é o tema claro, por causa das
regras `.theme-light` removidas.

- [ ] **Step 5: Verificar build e medir o CSS**

```bash
cd frontend && npm run lint && npm test && npm run build
gzip -c dist/assets/*.css | wc -c
```

Esperado: o CSS encolhe em relação aos 13.416 B gzip da linha de base.
Registrar o novo valor.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/index.css
git commit -m "chore: remover o CSS morto da landing page antiga do index.css

Hero, jornada, spline e as variantes de about-* pertenciam a pagina de
secoes que deixou de existir quando o portfolio virou o Marocos OS. Nenhuma
das 29 classes removidas aparece em JSX algum. Preservados: as variaveis de
tema, .theme-toggle-btn e .tray-divider (usados pela Taskbar), e o
html,body{overflow:hidden} que impede o scroll de pagina."
```

---

### Task 4: Normalizar os pesos de fonte [VISUAL]

Vem **antes** da extração de componentes de propósito: se os pesos fossem
corrigidos depois, o `AppHeader` e os primitivos nasceriam com o valor errado e
a correção teria de ser feita duas vezes.

**Contexto:** o `index.html` importa Poppins em `wght@400;700;900` e o
`index.css` declara `font-synthesis: none`. Há 34 declarações usando pesos
200/300/500/600/800, que não existem e não podem ser sintetizados.

**Files:**
- Modify: os arquivos `.css` que a auditoria do Step 2 apontar (dos 13 abaixo)

**Interfaces:**
- Consumes: nada.
- Produces: CSS cujos `font-weight` descrevem o que realmente renderiza.
  As Tarefas 9 (AppHeader) e 8 (AppIconButton) copiam desses valores.

- [ ] **Step 1: Listar todas as declarações**

```bash
cd frontend/src
grep -rn "font-weight: *\(200\|300\|500\|600\|800\)" --include=*.css .
```

**Esperado, medido logo após a Tarefa 3: exatamente 34 linhas em 13 arquivos.**

Distribuição por valor — confira que bate, é a porta de segurança desta tarefa:

| peso | ocorrências |
|---|---|
| 600 | 20 |
| 500 | 7 |
| 300 | 3 |
| 800 | 3 |
| 200 | 1 |

Por arquivo:

| arquivo | ocorrências |
|---|---|
| `apps/DevicesApp.css` | 6 |
| `apps/HistoryApp.css` | 5 |
| `os/mobile/MobileShell.css` | 4 |
| `os/boot/boot.css` | 3 |
| `apps/AssistantApp.css` | 3 |
| `apps/AboutApp.css` | 3 |
| `apps/SettingsApp.css` | 2 |
| `apps/ProjectsApp.css` | 2 |
| `apps/ProjectDetailApp.css` | 2 |
| `os/desktop/Window.css` | 1 |
| `os/desktop/Taskbar.css` | 1 |
| `os/desktop/StartMenu.css` | 1 |
| `apps/TerminalApp.css` | 1 |

O `index.css` **não** está mais nesta lista: as declarações dele saíram junto
com o CSS da landing page na Tarefa 3. Se a contagem não bater com a tabela,
alguma tarefa anterior mexeu no que não devia — **pare e reporte**.

- [ ] **Step 2: Classificar cada declaração pela família efetiva**

Para cada linha do Step 1, determinar a `font-family` **efetiva** do seletor:
a que ele declara, ou — se não declarar — a herdada, que é o Poppins do `:root`.

| família efetiva | pesos disponíveis | ação |
|---|---|---|
| Poppins (herdada, sem `font-family` própria) | 400, 700, 900 | **trocar** pela tabela do Step 3 |
| `system-ui` (Windows: Segoe UI Variable, eixo de peso contínuo) | todos | **NÃO TOCAR** — já renderiza o peso declarado |
| `'Courier New'` | 400, 700 | **trocar** pela tabela do Step 3 |
| `ui-monospace` / Consolas / Cascadia Mono | varia por SO | **NÃO TOCAR** — o resultado depende da máquina, e mexer trocaria um comportamento correto em alguns sistemas por outro |
| **fonte de controle do UA** — `<button>`, `<input>`, `<select>` **sem** `font-family` nem `font: inherit` na própria regra | varia por navegador e SO | **NÃO TOCAR** — mesma razão do `system-ui` |

**A armadilha dos controles de formulário.** `<button>` e `<input>` **não
herdam** `font-family` por padrão: o navegador aplica a própria fonte de
controle, que no Windows costuma ser a fonte de sistema. Então um `<button>`
sem `font-family` na regra **não está sob Poppins**, por mais que todos os seus
ancestrais estejam — e cai na mesma categoria de "depende da máquina" do
`system-ui`.

Repare que vários botões deste projeto **declaram** `font: inherit` ou
`font-family: inherit` justamente para escapar disso (`DevicesApp.css`,
`ProjectsApp.css`, `SettingsApp.css`). Esses **voltam** a herdar do ancestral, e
aí a classificação é a do ancestral. A diferença entre os dois casos é uma
linha de CSS — confira a regra de cada `<button>`, não presuma.

Onde procurar família própria: `AboutApp.css` (Courier New),
`HistoryApp.css` (Courier New), `DevicesApp.css` (Courier New),
`SettingsApp.css` (system-ui), `TerminalApp.css` (ui-monospace),
`boot.css` (system-ui).

**Atenção à herança:** um seletor sem `font-family` pode ainda assim estar
dentro de um elemento que declara uma. Conferir o ancestral no JSX antes de
classificar — por exemplo, `.terminal-kv-label` herda o `ui-monospace` do
`.terminal-app`.

- [ ] **Step 3: Aplicar o mapeamento determinístico**

O algoritmo de font-matching do CSS é fechado, então o peso resultante **não
precisa ser medido** — é derivável. Para uma família com 400, 700 e 900
(Poppins) ou com 400 e 700 (Courier New):

| declarado | resolve para | regra do CSS Fonts |
|---|---|---|
| 200 | **400** | abaixo de 400: procura ≤ desejado em ordem decrescente; não achando, > desejado em ordem crescente |
| 300 | **400** | idem |
| 500 | **400** | entre 400 e 500: procura ≥ desejado e ≤ 500; não achando, < desejado decrescente |
| 600 | **700** | acima de 500: procura ≥ desejado em ordem crescente |
| 800 | **900** (Poppins) / **700** (Courier New) | idem — 900 não existe no Courier New |

Aplicar a troca e acrescentar, na primeira ocorrência de cada arquivo, o
comentário:

```css
/* Poppins e carregado em 400/700/900 e o index.css tem font-synthesis: none.
   Este valor e o peso que o navegador ja resolvia sozinho; a declaracao antiga
   (800) nao existia e caia aqui em silencio. */
font-weight: 900;
```

- [ ] **Step 3B: Registrar a tabela da migração**

Escrever em `docs/superpowers/plans/pesos-de-fonte.md` a tabela completa:
arquivo, linha, seletor, família efetiva, peso declarado, peso resolvido, ação
(trocado / mantido). É a prova de que a decisão foi por regra e não por chute, e
o que permite conferir depois se alguma classificação de família estava errada.

- [ ] **Step 4: Verificar que a auditoria ficou limpa**

```bash
cd frontend/src
grep -rn "font-weight: *\(200\|300\|500\|600\|800\)" --include=*.css .
```

Esperado: restam **apenas** as declarações sob `system-ui` / `ui-monospace`
que o Step 2 marcou como corretas. Toda linha remanescente deve ter o
comentário justificando.

- [ ] **Step 5: Marcar para a conferência de fase**

Esta tarefa fecha a Fase 1. Anotar no relatório os pontos que o dono do projeto
deve olhar na **Parada 1**: títulos e subtítulos de `DevicesApp` e `HistoryApp`,
os números de especificação do `AboutApp`, e qualquer seletor cuja classificação
de família tenha ficado em dúvida no Step 2.

Qualquer diferença de espessura de texto que ele encontrar significa que uma
classificação do Step 2 estava errada — a linha volta ao valor original e a
família é reclassificada.

- [ ] **Step 6: Verificar build**

```bash
cd frontend && npm run lint && npm test && npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src
git commit -m "fix: declarar os pesos de fonte que realmente renderizam

34 declaracoes usavam pesos 200/300/500/600/800 que o Poppins nao carrega
(importado em 400/700/900) com font-synthesis: none -- caiam silenciosamente
no vizinho mais proximo. O algoritmo de font-matching do CSS e fechado, entao
o peso resultante foi DERIVADO por regra, nao medido: 200/300/500 caem em 400,
600 sobe para 700, 800 sobe para 900. A renderizacao nao muda; o CSS passa a
dizer a verdade.

Ficaram intactas as declaracoes cuja familia efetiva nao e o Poppins --
system-ui, ui-monospace, e a fonte de controle do UA em <button> sem
font-family. Nelas a disponibilidade de pesos depende da maquina, entao
trocar seria justamente introduzir a mudanca visual que esta tarefa evita."
```

---

# FASE 2 — Configuração e componentes (Tarefas 5–11)

---

### Task 5: `config/system.js` — o arquivo central

Primeira tarefa com TDD real: o config é lógica pura e testável.

**Files:**
- Create: `src/config/system.js`
- Create: `src/config/system.test.js`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `export const WALLPAPER` — `{ silk: { cor, velocidade, escala, rotacao, ruido, dpr, fps }, iridescence: { cor, amplitude, velocidade, reagirAoMouse, escalaResolucao, fps }, crossfade: { duracaoMs, limiteSegurancaMs }, ceu: { dark: {topo, meio, baixo}, light: {...} } }`
  - `export const JANELAS` — `{ baseX, baseY, passoCascata, voltaCascata, viesHorizontal, viesVertical, margem, alturaTaskbar, zInicial, folgaArrastoX, folgaArrastoY, aberturaMs }`
  - `export const CERIMONIA` — `{ duracaoBootMs, duracaoBootReduzidaMs, spinBoot, spinBloqueio, tamanhoCristal, tamanhoCristalPequeno, larguraCristalPequeno, seguraSaidaMs, idle: { desmonteBloqueio, boasVindas, prefetchCristal, montarCristalAbout } }`
  - `export const MOVIMENTO` — objeto por nome de transição
  - `export const VIDRO` — `{ blurJanela, blurMenuIniciar, blurMenuContexto, blurTaskbar, raio, raioControle, alturaTitulo, alturaTaskbar }`
  - `export const LAYOUT` — `{ breakpointDesktop, icones: {...}, assinatura: {...} }`
  - `export const REDE` — `{ apiBase, timeoutChatMs }`

- [ ] **Step 1: Escrever o teste que falha**

Criar `src/config/system.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { WALLPAPER, JANELAS, CERIMONIA, VIDRO, LAYOUT, REDE } from './system'

describe('config do sistema', () => {
  it('preserva os valores do Silk que estavam em Hills.jsx', () => {
    expect(WALLPAPER.silk.cor).toBe('#4c1d95')
    expect(WALLPAPER.silk.velocidade).toBe(12)
    expect(WALLPAPER.silk.escala).toBe(1.4)
    expect(WALLPAPER.silk.rotacao).toBe(2.6)
    expect(WALLPAPER.silk.ruido).toBe(1.2)
    expect(WALLPAPER.silk.dpr).toBe(0.6)
    expect(WALLPAPER.silk.fps).toBe(20)
  })

  it('preserva os valores do Iridescence', () => {
    expect(WALLPAPER.iridescence.cor).toEqual([0.9, 0.9, 0.95])
    expect(WALLPAPER.iridescence.amplitude).toBe(0.1)
    expect(WALLPAPER.iridescence.velocidade).toBe(1)
    expect(WALLPAPER.iridescence.reagirAoMouse).toBe(false)
    expect(WALLPAPER.iridescence.escalaResolucao).toBe(0.6)
  })

  it('a rede de seguranca do crossfade e mais longa que a animacao', () => {
    // Se o cronometro vencer a animacao, o crossfade e cortado pela metade.
    expect(WALLPAPER.crossfade.limiteSegurancaMs)
      .toBeGreaterThan(WALLPAPER.crossfade.duracaoMs)
  })

  it('preserva a geometria de nascimento das janelas', () => {
    expect(JANELAS.baseX).toBe(96)
    expect(JANELAS.baseY).toBe(64)
    expect(JANELAS.passoCascata).toBe(24)
    expect(JANELAS.voltaCascata).toBe(240)
    expect(JANELAS.viesHorizontal).toBe(0.5)
    expect(JANELAS.viesVertical).toBe(0.42)
    expect(JANELAS.margem).toBe(16)
    expect(JANELAS.alturaTaskbar).toBe(52)
  })

  it('os vieses ficam entre 0 e 1', () => {
    // Fora dessa faixa a janela nasce fora do quadro.
    expect(JANELAS.viesHorizontal).toBeGreaterThanOrEqual(0)
    expect(JANELAS.viesHorizontal).toBeLessThanOrEqual(1)
    expect(JANELAS.viesVertical).toBeGreaterThanOrEqual(0)
    expect(JANELAS.viesVertical).toBeLessThanOrEqual(1)
  })

  it('preserva os tempos da cerimonia', () => {
    expect(CERIMONIA.duracaoBootMs).toBe(4800)
    expect(CERIMONIA.duracaoBootReduzidaMs).toBe(2600)
    expect(CERIMONIA.spinBoot).toBe(3.2)
    expect(CERIMONIA.spinBloqueio).toBe(1.6)
    expect(CERIMONIA.tamanhoCristal).toBe(300)
    expect(CERIMONIA.tamanhoCristalPequeno).toBe(200)
    expect(CERIMONIA.larguraCristalPequeno).toBe(620)
  })

  it('o boot reduzido e mais curto que o normal, mas nao zero', () => {
    expect(CERIMONIA.duracaoBootReduzidaMs)
      .toBeLessThan(CERIMONIA.duracaoBootMs)
    expect(CERIMONIA.duracaoBootReduzidaMs).toBeGreaterThan(0)
  })

  it('a taskbar tem a mesma altura no JS e no CSS', () => {
    // windowManager reserva essa faixa; tokens.css desenha a barra nela.
    expect(JANELAS.alturaTaskbar).toBe(VIDRO.alturaTaskbar)
  })

  it('preserva o breakpoint de desktop', () => {
    expect(LAYOUT.breakpointDesktop).toBe(1024)
  })

  it('preserva o contrato de rede do chat', () => {
    expect(REDE.timeoutChatMs).toBe(60000)
    expect(REDE.apiBase).toMatch(/\/api$/)
  })
})
```

- [ ] **Step 2: Rodar e ver falhar**

```bash
cd frontend && npm test
```

Esperado: FALHA com `Failed to resolve import "./system"`.

- [ ] **Step 3: Escrever o config**

Criar `src/config/system.js`. Cada bloco leva o comentário explicando o efeito e
a faixa segura. Estrutura (valores exatamente os de hoje):

```js
/**
 * CONFIGURAÇÃO CENTRAL DO MAROCOS OS
 * ==================================================
 * Os botões de ajuste do sistema, num lugar só. Mudar um valor aqui muda o
 * comportamento em todo lugar que o usa — nenhum destes números deve voltar a
 * aparecer literal dentro de componente.
 *
 * O QUE NÃO ESTÁ AQUI, E POR QUÊ. Os gradientes desenhados à mão da cerimônia
 * (--cer-ceu-boot, --cer-campo-lock, --cer-estrelas, --cer-nebulosa e a versão
 * forte) continuam em `src/os/tokens.css`. São de 6 a 18 camadas de
 * radial-gradient por variável, com a documentação dos seis eixos que separam a
 * cena de inicialização da de bloqueio escrita ao lado. Não são botões de
 * ajuste: são arte, com o histórico da decisão registrado junto.
 *
 * A REGRA: número e cor simples viram configuração; forma desenhada continua
 * sendo arte no CSS.
 */

/* --------------------------------------------------
   WALLPAPER — os dois shaders da área de trabalho
   -------------------------------------------------- */
export const WALLPAPER = {
  /**
   * Silk: o fundo do TEMA ESCURO. Padrão de seda/fumaça em movimento lento.
   *
   *   velocidade  quão rápido o padrão escorre. 12 é o atual; abaixo de ~4 lê
   *               como parado, acima de ~30 vira agitação e briga com o
   *               conteúdo em cima.
   *   escala      tamanho das dobras. Maior = padrão mais fino e mais repetido.
   *   rotacao     ÂNGULO do padrão, em radianos. 2.6 rad ≈ 149°. Uma volta
   *               inteira é 6.283 (2π).
   *   ruido       granulado por cima. 0 = liso e chapado.
   *   dpr         resolução de render, fração da tela. 0.6 = 60%, esticado por
   *               CSS. Como o efeito é difuso, a perda não aparece — e derruba
   *               muito o custo em monitor 4K ou 166Hz.
   *   fps         TETO de quadros por segundo. Este é o valor mais sensível de
   *               todo o arquivo: o custo do backdrop-filter das janelas é
   *               (custo do blur) × (fps do fundo), porque toda vez que o fundo
   *               redesenha o navegador refaz o blur de tudo que está por cima.
   *               20 é indistinguível de 60 aqui e custa um terço.
   */
  silk: {
    cor: '#4c1d95',
    velocidade: 12,
    escala: 1.4,
    rotacao: 2.6,
    ruido: 1.2,
    dpr: 0.6,
    fps: 20,
  },

  /**
   * Iridescence: o fundo do TEMA CLARO. Interferência colorida e suave.
   *
   *   cor              multiplicador RGB normalizado (0–1), não hex.
   *   amplitude        deslocamento pelo mouse. Só tem efeito com
   *                    reagirAoMouse: true.
   *   reagirAoMouse    desligado de propósito: o listener de mousemove sobre
   *                    a área de trabalho inteira não se paga num fundo.
   *   escalaResolucao  o mesmo papel do `dpr` do Silk.
   */
  iridescence: {
    cor: [0.9, 0.9, 0.95],
    amplitude: 0.1,
    velocidade: 1,
    reagirAoMouse: false,
    escalaResolucao: 0.6,
    fps: 20,
  },

  /**
   * A troca de tema é um crossfade, não um corte: a camada nova entra POR CIMA
   * da antiga e sobe de opacidade.
   *
   * `duracaoMs` é a animação de verdade (o CSS `sky-entra`).
   * `limiteSegurancaMs` é a rede: se o `animationend` não chegar (aba em
   * segundo plano, animação cancelada), este cronômetro tira a camada antiga.
   * TEM DE SER BEM MAIOR que a duração — montar o shader novo ocupa a main
   * thread, e numa máquina lenta a camada só pinta segundos depois. Com limite
   * curto o cronômetro vence a corrida e corta o crossfade pela metade.
   */
  crossfade: {
    duracaoMs: 700,
    limiteSegurancaMs: 4000,
  },

  /**
   * Cor de base atrás do shader: evita flash preto antes do WebGL iniciar e
   * cobre a falha caso ele não inicie. É também o wallpaper inteiro no mobile,
   * onde WebGL de tela cheia não vale a bateria.
   */
  ceu: {
    dark: { topo: '#1e1b4b', meio: '#2e1065', baixo: '#4c1d95' },
    light: { topo: '#6d28d9', meio: '#a78bfa', baixo: '#ddd6fe' },
  },
}

/* --------------------------------------------------
   JANELAS — onde nascem, como se empilham, como se arrastam
   -------------------------------------------------- */
export const JANELAS = {
  /** Ponto de partida da cascata, e a posição usada quando não se sabe o
   *  tamanho da tela (nos testes puros do reducer). */
  baseX: 96,
  baseY: 64,

  /** Cada janela nova se desloca este tanto para não cobrir a anterior... */
  passoCascata: 24,
  /** ...e o deslocamento dá a volta ao chegar aqui, para a cascata não sair
   *  da tela depois de muitas janelas. */
  voltaCascata: 240,

  /**
   * QUANTO A JANELA CAMINHA DA LATERAL PARA O CENTRO.
   * 0 = nasce encostada em `baseX`. 1 = nasce centrada horizontalmente.
   * 0.5 é meio-termo de propósito: centrada ela cobre os ícones e tira o ar da
   * área de trabalho; encostada na esquerda parece ter escorregado pro canto.
   */
  viesHorizontal: 0.5,

  /**
   * FRAÇÃO DA ALTURA LIVRE em que a janela nasce.
   * 0.5 é o centro geométrico — e fica baixo demais, porque a barra de tarefas
   * já pesa embaixo. 0.42 põe a janela no meio ÓPTICO.
   */
  viesVertical: 0.42,

  /** Folga mínima até as bordas da tela. */
  margem: 16,
  /** Faixa que a barra de tarefas ocupa no rodapé. Precisa bater com
   *  VIDRO.alturaTaskbar — há teste garantindo. */
  alturaTaskbar: 52,

  /** Janelas começam acima disto; a escala de z reserva 100+ para elas. */
  zInicial: 100,

  /** Quanto da janela precisa continuar dentro da tela ao arrastar. */
  folgaArrastoX: 160,
  folgaArrastoY: 120,

  /**
   * Fade de abertura. SÓ OPACIDADE, e curto: animar `scale` numa janela grande
   * obriga o navegador a recompor a cada passo (e, com backdrop-filter, a
   * refazer o blur inteiro), o que trava a abertura.
   */
  aberturaMs: 120,
}

/* --------------------------------------------------
   CERIMÔNIA — inicialização e tela de bloqueio
   -------------------------------------------------- */
export const CERIMONIA = {
  /**
   * Duração da inicialização. Longa de propósito: o cristal gira e flutua, e a
   * graça é ter tempo de ver. Pulável a qualquer momento.
   *
   * CUIDADO AO AUMENTAR: duração não é movimento percebido. Uma versão de 4.2s
   * lia como "não animou nada" porque a última entrada era aos 2.6s — sobravam
   * dois segundos de tela parada, e tela parada durante boot lê como travamento.
   * Se aumentar aqui, tem de haver conteúdo ocupando o tempo novo.
   */
  duracaoBootMs: 4800,

  /**
   * Com movimento reduzido. Mais curta, mas NÃO zero: quem tem efeitos
   * desligados no sistema chegava direto no bloqueio e concluía, com razão, que
   * a inicialização não existia. Movimento reduzido pede menos movimento, não
   * menos conteúdo.
   */
  duracaoBootReduzidaMs: 2600,

  /** Velocidade de rotação do cristal em cada cena. A queda é o sistema
   *  assentando — a transição entre as duas é suavizada, não cortada. */
  spinBoot: 3.2,
  spinBloqueio: 1.6,

  tamanhoCristal: 300,
  tamanhoCristalPequeno: 200,
  /** Abaixo desta largura de tela, usa o cristal pequeno. */
  larguraCristalPequeno: 620,

  /** Rede de segurança: se o `animationend` da cortina não disparar, o desmonte
   *  acontece assim mesmo. No caso normal quem manda é o evento. */
  seguraSaidaMs: 1200,

  /**
   * TRABALHO ADIADO PARA A OCIOSIDADE. Cada par é (timeout do
   * requestIdleCallback, fallback em setTimeout para quem não o tem).
   *
   * Não são atrasos cosméticos: cada um move um custo real de main thread para
   * fora de um momento em que ele apareceria como engasgo.
   */
  idle: {
    /** Desmontar o cristal destrói o contexto WebGL e descarta geometria e
     *  material: ~580ms de main thread travada. Fazer isso no instante em que o
     *  desktop aparece ERA o engasgo percebido como "animação travada". */
    desmonteBloqueio: { timeout: 2500, fallback: 800 },
    /** A janela de boas-vindas monta durante a TELA DE BLOQUEIO PARADA, que é
     *  ócio de verdade. Montá-la durante a cortina custava metade da suavidade
     *  da transição (pior frame: 85ms contra 42ms). */
    boasVindas: { timeout: 1500, fallback: 400 },
    /** Busca o chunk 3D antes de alguém clicar, senão o download e o parse
     *  acontecem no meio da interação. */
    prefetchCristal: { timeout: 4000, fallback: 2500 },
  },

  /** O cristal do "Sobre" monta depois que a janela pintou: criar o contexto
   *  WebGL no mesmo frame da abertura travava a janela inteira. */
  montarCristalAboutMs: 450,
}

/* --------------------------------------------------
   MOVIMENTO — durações e curvas, por transição nomeada
   -------------------------------------------------- */
export const MOVIMENTO = {
  taskbarEntrada: { delay: 0.4, duration: 0.5 },
  /** `delayPorItem` é multiplicado pelo índice: os ícones entram em cascata. */
  iconesDesktop: { delayPorItem: 0.05, duration: 0.3, deslocamentoY: 8 },
  iconesMobile: { delayPorItem: 0.03, duration: 0.25, deslocamentoY: 8 },
  menuIniciar: { duration: 0.16, ease: 'easeOut' },
  popupTray: { duration: 0.2 },
  quickSettings: { duration: 0.24, duracaoReduzida: 0.15, ease: 'easeOut' },
  quickSettingsFundo: { duration: 0.2 },
  pushMobile: { duration: 0.28, ease: 'easeOut' },
  acordeaoDispositivos: { duration: 0.2, ease: 'easeInOut' },
  indicadorTaskbar: { type: 'spring', stiffness: 300, damping: 30 },
  /** Marquee de skills do "Sobre". Em segundos, porque vira CSS. */
  marqueeSkillsS: 18,
}

/* --------------------------------------------------
   VIDRO — o material das superfícies do sistema
   -------------------------------------------------- */
export const VIDRO = {
  /**
   * O blur da janela é o mais caro do sistema, porque é o maior e o mais
   * numeroso, e ele é refeito a cada quadro que o wallpaper desenha. Se for
   * preciso ganhar performance, este número e WALLPAPER.silk.fps são os dois
   * lugares para mexer.
   */
  blurJanela: 'blur(6px) saturate(125%)',
  /** Superfícies pequenas podem pagar mais blur sem custo perceptível. */
  blurMenuIniciar: 'blur(20px) saturate(150%)',
  blurMenuContexto: 'blur(16px) saturate(150%)',
  blurTaskbar: 'blur(12px)',

  raio: '10px',
  raioControle: '8px',
  alturaTitulo: '40px',
  alturaTaskbar: 52,
}

/* --------------------------------------------------
   LAYOUT
   -------------------------------------------------- */
export const LAYOUT = {
  /**
   * 1024px porque tablet em retrato não tem espaço para janelas flutuantes.
   * iPad em paisagem (>= 1024) cai em desktop e arrasta por toque de graça, já
   * que o motion usa pointer events.
   */
  breakpointDesktop: 1024,

  icones: {
    origemX: '20px',
    origemY: '20px',
    larguraBotao: '88px',
    tamanhoTile: '56px',
    raioTile: '14px',
    intervalo: '4px',
    /** Folga entre o fim da coluna de ícones e a barra de tarefas. */
    folgaInferior: '32px',
  },

  assinatura: {
    origemTopo: '40px',
    origemDireita: '40px',
    larguraMaxima: '460px',
  },
}

/* --------------------------------------------------
   REDE
   -------------------------------------------------- */
export const REDE = {
  apiBase: import.meta.env.DEV
    ? 'http://localhost:8000/api'
    : 'https://api.marocos.dev/api',
  /**
   * Um pipeline completo do agente (gateway + guard + rag + tradutor) pode
   * encostar neste teto. Reduzir causa timeout em pergunta legítima.
   */
  timeoutChatMs: 60000,
}
```

- [ ] **Step 4: Rodar e ver passar**

```bash
cd frontend && npm test
```

Esperado: PASSA, incluindo os 2 arquivos de teste que já existiam.

**Nota:** `system.test.js` importa `import.meta.env.DEV`, que o vitest resolve.
Se der erro nesse ponto, mover `REDE.apiBase` para uma função
`export const apiBase = () => ...` e ajustar o teste — mas testar primeiro,
porque o vite/vitest normalmente já provê `import.meta.env`.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/config/
git commit -m "feat: criar src/config/system.js como fonte unica dos ajustes do sistema

Seis blocos -- wallpaper, janelas, cerimonia, movimento, vidro, layout, rede --
com os valores que hoje estao literais em 20+ arquivos. Nenhum valor muda:
esta tarefa so cria o arquivo e o teste que trava os valores atuais. A
migracao dos consumidores vem nas tarefas seguintes.

Os gradientes desenhados a mao da cerimonia ficam em tokens.css de proposito,
e o cabecalho do system.js explica o criterio: numero e cor simples viram
configuracao, forma desenhada continua sendo arte no CSS."
```

---

### Task 6: `config/cssBridge.js` — config para CSS vars [VISUAL]

**Files:**
- Create: `src/config/cssBridge.js`
- Modify: `src/os/tokens.css`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `VIDRO`, `LAYOUT`, `WALLPAPER`, `MOVIMENTO` de `config/system.js`.
- Produces: `export function aplicarConfigNoCss(tema)` — escreve as custom
  properties `--cfg-*` em `document.documentElement`. Chamada no boot e a cada
  troca de tema.

- [ ] **Step 1: Escrever a ponte**

Criar `src/config/cssBridge.js`:

```js
/**
 * PONTE CONFIG -> CSS
 * ==================================================
 * O `system.js` é a fonte única, mas metade dos valores que ele guarda só têm
 * efeito dentro do CSS. Esta função escreve esses valores como custom
 * properties `--cfg-*` no elemento raiz, e o `tokens.css` os consome.
 *
 * Roda no boot e de novo a cada troca de tema, porque as cores do céu dependem
 * dele.
 *
 * CADA CONSUMO NO CSS TEM FALLBACK. `var(--cfg-raio, 10px)` pinta 10px se esta
 * função ainda não rodou ou falhou. Não pode existir um frame sem raio de
 * janela — e um `var()` sem fallback resolve para nada, não para o valor
 * anterior.
 */
import { VIDRO, LAYOUT, WALLPAPER, MOVIMENTO } from './system'

export function aplicarConfigNoCss(tema = 'dark') {
  if (typeof document === 'undefined') return

  const raiz = document.documentElement
  const ceu = WALLPAPER.ceu[tema] || WALLPAPER.ceu.dark

  const vars = {
    // Vidro
    '--cfg-blur-janela': VIDRO.blurJanela,
    '--cfg-blur-menu-iniciar': VIDRO.blurMenuIniciar,
    '--cfg-blur-menu-contexto': VIDRO.blurMenuContexto,
    '--cfg-blur-taskbar': VIDRO.blurTaskbar,
    '--cfg-raio': VIDRO.raio,
    '--cfg-raio-controle': VIDRO.raioControle,
    '--cfg-altura-titulo': VIDRO.alturaTitulo,
    '--cfg-altura-taskbar': `${VIDRO.alturaTaskbar}px`,

    // Layout
    '--cfg-icone-origem-x': LAYOUT.icones.origemX,
    '--cfg-icone-origem-y': LAYOUT.icones.origemY,
    '--cfg-icone-largura': LAYOUT.icones.larguraBotao,
    '--cfg-icone-tile': LAYOUT.icones.tamanhoTile,
    '--cfg-icone-raio': LAYOUT.icones.raioTile,
    '--cfg-icone-intervalo': LAYOUT.icones.intervalo,
    '--cfg-icone-folga': LAYOUT.icones.folgaInferior,
    '--cfg-assinatura-topo': LAYOUT.assinatura.origemTopo,
    '--cfg-assinatura-direita': LAYOUT.assinatura.origemDireita,
    '--cfg-assinatura-largura': LAYOUT.assinatura.larguraMaxima,

    // Wallpaper — o gradiente de base, que é também o fundo inteiro no mobile
    '--cfg-ceu-topo': ceu.topo,
    '--cfg-ceu-meio': ceu.meio,
    '--cfg-ceu-baixo': ceu.baixo,
    '--cfg-crossfade': `${WALLPAPER.crossfade.duracaoMs}ms`,

    // Movimento que vive em CSS
    '--cfg-marquee-skills': `${MOVIMENTO.marqueeSkillsS}s`,
  }

  for (const [nome, valor] of Object.entries(vars)) {
    raiz.style.setProperty(nome, valor)
  }
}
```

- [ ] **Step 2: Consumir no tokens.css, com fallback**

Em `src/os/tokens.css`, trocar as declarações do `:root` pelas versões com
`var(--cfg-*, <valor atual>)`. O segundo argumento é **exatamente** o valor que
está lá hoje:

```css
:root {
  --win-glass-blur: var(--cfg-blur-janela, blur(6px) saturate(125%));
  --win-radius: var(--cfg-raio, 10px);
  --win-control-radius: var(--cfg-raio-controle, 8px);
  --win-titlebar-h: var(--cfg-altura-titulo, 40px);
  --taskbar-h: var(--cfg-altura-taskbar, 52px);
  /* ...o resto do :root fica como está... */
}
```

Fazer o mesmo em:

- `.marocos-wallpaper` (o `linear-gradient` de base) → `var(--cfg-ceu-topo, ...)`,
  `--cfg-ceu-meio`, `--cfg-ceu-baixo`. **Isto também remove a duplicação
  literal** dos hexes em `.marocos-sky-fallback.tema-dark` / `.tema-light`:
  como a ponte reescreve `--cfg-ceu-*` na troca de tema, essas duas regras
  passam a poder usar as mesmas variáveis. Fazer essa unificação aqui.
- `.marocos-sky--entrando` → `animation: sky-entra var(--cfg-crossfade, 700ms) ease-out both;`
- `src/os/desktop/StartMenu.css`, `ContextMenu.css`, `Taskbar.css` → os
  respectivos `--cfg-blur-*`
- `src/os/desktop/Desktop.css` → as variáveis de ícone e assinatura
- `src/apps/AboutApp.css` → `animation: aboutFeaturesScroll var(--cfg-marquee-skills, 18s) linear infinite;`

**Atenção:** o crossfade do mobile depende de as duas camadas terem cores
DIFERENTES simultaneamente. Como a ponte escreve uma cor só por vez, a camada
que está saindo perderia a sua paleta. Manter as duas regras
`.marocos-sky-fallback.tema-dark` e `.tema-light` com hexes literais **se** a
verificação do Step 4 mostrar que o crossfade mobile quebrou — e nesse caso
registrar o motivo em comentário. Testar antes de decidir.

- [ ] **Step 3: Chamar a ponte no App**

Em `src/App.jsx`, dentro de `Shell`, acrescentar:

```jsx
import { aplicarConfigNoCss } from './config/cssBridge'
// ...
const { isDark, isAnimated } = useTheme()

// A ponte roda antes da pintura: com useEffect haveria um frame com os
// fallbacks do CSS em vez dos valores do config.
useLayoutEffect(() => {
  aplicarConfigNoCss(isDark ? 'dark' : 'light')
}, [isDark])
```

Importar `useLayoutEffect` de `react`.

- [ ] **Step 4: Verificação visual completa**

Percorrer os 7 itens do **Protocolo de verificação visual**. O risco aqui está
concentrado em dois pontos: a **troca de tema** (crossfade do wallpaper, nos
dois modos) e o **primeiro frame** do carregamento (se aparecer janela sem raio
ou sem blur por um instante, algum `var()` ficou sem fallback).

- [ ] **Step 5: Verificar build**

```bash
cd frontend && npm run lint && npm test && npm run build
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/config/cssBridge.js frontend/src/os/tokens.css frontend/src/App.jsx frontend/src/os/desktop/ frontend/src/apps/AboutApp.css
git commit -m "feat: ponte que aplica o config como CSS vars

O system.js passa a mandar tambem no CSS: blur, raios, alturas, grade de
icones, assinatura, gradiente do ceu e duracao do crossfade. Todo consumo usa
var(--cfg-*, <valor atual>) para que um frame antes da ponte rodar pinte o
valor certo em vez de nada.

De quebra, os hexes do gradiente do ceu deixam de estar duplicados entre os
tokens e o fallback mobile."
```

---

### Task 6B: Migrar `JANELAS` e `MOVIMENTO` para o config [VISUAL]

Sem esta tarefa o `system.js` existe mas ninguém o consulta para posição de
janela e tempo de transição — os literais continuariam espalhados, que é
exatamente o problema que ele resolve.

**Files:**
- Modify: `src/os/windowManager.js`, `src/os/windowManager.test.js`
- Modify: `src/os/desktop/Window.jsx`, `Taskbar.jsx`, `StartMenu.jsx`, `Desktop.jsx`
- Modify: `src/os/mobile/HomeScreen.jsx`, `MobileApp.jsx`, `QuickSettings.jsx`
- Modify: `src/apps/DevicesApp.jsx`

**Interfaces:**
- Consumes: `JANELAS` e `MOVIMENTO` de `config/system.js` (Tarefa 5).
- Produces: nenhum símbolo novo. Os literais somem dos componentes.

- [ ] **Step 1: Migrar o `windowManager.js`**

Substituir as constantes do topo por leituras do config, preservando os nomes
locais para o resto do arquivo não mudar:

```js
import { JANELAS } from '../config/system'

const BASE_X = JANELAS.baseX
const BASE_Y = JANELAS.baseY
const CASCADE_STEP = JANELAS.passoCascata
const CASCADE_WRAP = JANELAS.voltaCascata
const TASKBAR_H = JANELAS.alturaTaskbar
const MARGEM = JANELAS.margem
const VIES_VERTICAL = JANELAS.viesVertical
const VIES_HORIZONTAL = JANELAS.viesHorizontal
```

Trocar `zTop: 100` em `initialState` por `zTop: JANELAS.zInicial`.

**Preservar os blocos de comentário que explicam cada constante** — eles agora
vivem no `system.js`, mas os que explicam o *algoritmo* (a cascata, o clamp, por
que `viewport` e `size` são opcionais) pertencem a este arquivo e ficam.

- [ ] **Step 2: Rodar os testes existentes**

```bash
cd frontend && npm test
```

Esperado: **`windowManager.test.js` passa sem alteração.** Os valores do config
são idênticos aos literais que estavam ali, então nenhuma asserção muda.

Se algum teste falhar, um valor foi transcrito errado na Tarefa 5 — corrigir no
`system.js`, não no teste.

- [ ] **Step 3: Migrar as transições dos componentes**

Trocar cada literal pela entrada nomeada de `MOVIMENTO`:

| arquivo | o que trocar | por |
|---|---|---|
| `desktop/Taskbar.jsx` | `transition={{ delay: 0.4, duration: 0.5 }}` | `transition={MOVIMENTO.taskbarEntrada}` |
| `desktop/Taskbar.jsx` | o `transition={{ type: 'spring', stiffness: 300, damping: 30 }}` do indicador | `transition={MOVIMENTO.indicadorTaskbar}` |
| `desktop/Taskbar.jsx` | `transition={{ duration: 0.2 }}` do popup | `transition={MOVIMENTO.popupTray}` |
| `desktop/Desktop.jsx` | `transition={{ delay: 0.05 * i, duration: 0.3 }}` | `transition={{ delay: MOVIMENTO.iconesDesktop.delayPorItem * i, duration: MOVIMENTO.iconesDesktop.duration }}`; e o `y: 8` do `initial` por `y: MOVIMENTO.iconesDesktop.deslocamentoY` |
| `desktop/StartMenu.jsx` | `transition={{ duration: 0.16, ease: 'easeOut' }}` | `transition={MOVIMENTO.menuIniciar}` |
| `desktop/Window.jsx` | `transition={{ duration: 0.12, ease: 'linear' }}` | `transition={{ duration: JANELAS.aberturaMs / 1000, ease: 'linear' }}` |
| `mobile/HomeScreen.jsx` | `transition={{ delay: 0.03 * i, duration: 0.25 }}` e `y: 8` | análogo, de `MOVIMENTO.iconesMobile` |
| `mobile/MobileApp.jsx` | `duration: prefersReducedMotion ? 0 : 0.28` | `duration: prefersReducedMotion ? 0 : MOVIMENTO.pushMobile.duration`, `ease: MOVIMENTO.pushMobile.ease` |
| `mobile/QuickSettings.jsx` | `duration: prefersReducedMotion ? 0.15 : 0.24` | `MOVIMENTO.quickSettings.duracaoReduzida` / `.duration`; e o `0.2` do backdrop por `MOVIMENTO.quickSettingsFundo.duration` |
| `apps/DevicesApp.jsx` | `transition={{ duration: 0.2, ease: 'easeInOut' }}` | `transition={MOVIMENTO.acordeaoDispositivos}` |

**Atenção:** `JANELAS.aberturaMs` está em milissegundos (120) porque é assim que
os outros tempos do config estão; o `motion` espera segundos. Daí a divisão por
1000 — não trocar o valor do config para 0.12.

- [ ] **Step 4: Confirmar que não sobrou literal**

```bash
cd frontend/src
grep -rn "duration: 0\.\|delay: 0\.\|stiffness:" --include=*.jsx os/ apps/
```

Esperado: só as ocorrências que vêm de `MOVIMENTO.*`. Qualquer número solto
restante é uma transição que escapou — migrar ou justificar em comentário.

- [ ] **Step 5: Verificação visual**

O risco aqui é de **timing**, não de aparência estática. Percorrer os 7 itens do
protocolo prestando atenção à *velocidade* de cada transição: entrada da
taskbar, cascata dos ícones, abertura do menu Iniciar, abertura de janela,
push do app no mobile, painel de ajustes rápidos, acordeão do Gerenciador de
Dispositivos, e o deslize do indicador entre botões da taskbar.

- [ ] **Step 6: Verificar build**

```bash
cd frontend && npm run lint && npm test && npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/os/ frontend/src/apps/DevicesApp.jsx
git commit -m "refactor: ler posicao de janela e tempos de transicao do config

O windowManager e as dez transicoes nomeadas dos componentes passam a ler do
system.js. Nenhum valor muda -- o windowManager.test.js passa sem alteracao,
o que e a prova de que a transcricao dos valores esteve correta."
```

---

### Task 7: Hooks `useIdleTask` e `useMediaQuery`

**Files:**
- Create: `src/os/hooks/useIdleTask.js`
- Create: `src/os/hooks/useMediaQuery.js`
- Modify: `src/os/useDeviceMode.js`
- Modify: `src/App.jsx`, `src/os/desktop/Desktop.jsx`
- Modify: `src/contexts/ThemeContext.jsx`, `src/os/boot/Ceremony.jsx`

**Interfaces:**
- Consumes: `CERIMONIA.idle`, `LAYOUT.breakpointDesktop` de `config/system.js`.
- Produces:
  - `export function useIdleTask(fn, { timeout, fallback, ativo = true })` — roda
    `fn` na primeira folga do navegador. Cancela na desmontagem.
  - `export function useMediaQuery(query)` → `boolean`
  - `export function usaMovimentoReduzido()` → `boolean` (atalho para
    `useMediaQuery('(prefers-reduced-motion: reduce)')`)

- [ ] **Step 1: Escrever `useIdleTask`**

Criar `src/os/hooks/useIdleTask.js`:

```js
import { useEffect } from 'react'

/**
 * TRABALHO NA PRIMEIRA FOLGA DO NAVEGADOR
 * --------------------------------------------------
 * O par `requestIdleCallback` + fallback em `setTimeout` estava copiado em três
 * lugares (App.jsx duas vezes, Desktop.jsx uma), cada um com o seu
 * cancelamento. Aqui ele existe uma vez.
 *
 * `ativo: false` adia sem cancelar nada — é o que permite esperar uma fase do
 * sistema antes de agendar.
 *
 * O cancelamento importa: sem ele, uma tarefa agendada roda depois da
 * desmontagem e mexe em estado que não existe mais.
 */
export function useIdleTask(fn, { timeout = 2000, fallback = 500, ativo = true } = {}) {
  useEffect(() => {
    if (!ativo) return

    let cancelado = false
    const rodar = () => {
      if (!cancelado) fn()
    }

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(rodar, { timeout })
      return () => {
        cancelado = true
        window.cancelIdleCallback(id)
      }
    }

    const id = setTimeout(rodar, fallback)
    return () => {
      cancelado = true
      clearTimeout(id)
    }
    // `fn` fica fora das dependências de propósito: quem chama costuma passar
    // uma arrow inline, e incluí-la reagendaria a cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativo, timeout, fallback])
}
```

- [ ] **Step 2: Escrever `useMediaQuery`**

Criar `src/os/hooks/useMediaQuery.js`:

```js
import { useState, useEffect } from 'react'

/**
 * BASE ÚNICA DE MEDIA QUERY
 * --------------------------------------------------
 * `matchMedia` em vez de listener de `resize`: dispara só na travessia da
 * condição, não a cada pixel arrastado na borda da janela.
 */
export function useMediaQuery(query) {
  const [casa, setCasa] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mq = window.matchMedia(query)
    const aoMudar = (e) => setCasa(e.matches)

    // Sincronia defensiva: cobre a travessia que aconteça entre o primeiro
    // render e o anexo do listener. Sem custo quando o valor não muda, porque o
    // React descarta setState com valor idêntico.
    setCasa(mq.matches)
    mq.addEventListener('change', aoMudar)
    return () => mq.removeEventListener('change', aoMudar)
  }, [query])

  return casa
}

/** Preferência de sistema por menos movimento. Era lida de três formas
 *  diferentes no projeto; agora vem daqui. */
export function usaMovimentoReduzido() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}
```

- [ ] **Step 3: Reescrever `useDeviceMode` sobre a base**

Substituir o corpo de `src/os/useDeviceMode.js`, preservando as exportações
`DESKTOP_BREAKPOINT` e `useDeviceMode` (há consumidores):

```js
import { LAYOUT } from '../config/system'
import { useMediaQuery } from './hooks/useMediaQuery'

export const DESKTOP_BREAKPOINT = LAYOUT.breakpointDesktop

const CONSULTA_DESKTOP = `(min-width: ${DESKTOP_BREAKPOINT}px)`

export function useDeviceMode() {
  return useMediaQuery(CONSULTA_DESKTOP) ? 'desktop' : 'mobile'
}
```

Preservar o bloco de comentário do topo do arquivo original, que explica a
escolha de 1024px.

- [ ] **Step 4: Migrar os três consumidores de idle**

- `src/App.jsx`, em `BoasVindas`: trocar o `agendar` manual por
  `useIdleTask(..., { ...CERIMONIA.idle.boasVindas, ativo })`
- `src/App.jsx`, em `destrancar`: este **não** vira hook — está dentro de um
  `useCallback`, não do corpo do componente. Manter o agendamento manual, mas
  ler os números de `CERIMONIA.idle.desmonteBloqueio`
- `src/os/desktop/Desktop.jsx`: trocar o `useEffect` de prefetch por
  `useIdleTask(() => import('../../components/Crystal'), { ...CERIMONIA.idle.prefetchCristal, ativo: isDesktop })`
- `src/apps/AboutApp.jsx`: o `setTimeout(() => setMontarCristal(true), 450)`
  **não** vira `useIdleTask` — é uma espera deliberada por "a janela já pintou",
  não uma folga do navegador. Só trocar o `450` por
  `CERIMONIA.montarCristalAboutMs`.

- [ ] **Step 5: Migrar os leitores de movimento reduzido**

- `src/contexts/ThemeContext.jsx`: o `useEffect` com `matchMedia` passa a usar
  `usaMovimentoReduzido()`. **Preservar o comportamento exato:** hoje ele só
  desliga a animação uma vez, na montagem, e não a religa se a preferência
  mudar. Manter assim — religar seria mudança de comportamento.
- `src/os/boot/Ceremony.jsx`: o `useState` com `matchMedia` vira
  `usaMovimentoReduzido()`.

- [ ] **Step 6: Verificar**

```bash
cd frontend && npm run lint && npm test && npm run build
```

Depois, no navegador: boot completo, prefetch do cristal (o "Sobre" deve abrir
sem travar), redimensionar a janela cruzando 1024px, e ligar
`prefers-reduced-motion` no SO para conferir o boot curto.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/os/hooks/ frontend/src/os/useDeviceMode.js frontend/src/App.jsx frontend/src/os/desktop/Desktop.jsx frontend/src/contexts/ThemeContext.jsx frontend/src/os/boot/Ceremony.jsx
git commit -m "refactor: extrair useIdleTask e useMediaQuery

O par requestIdleCallback+setTimeout estava copiado em tres lugares e
prefers-reduced-motion era lido de tres formas diferentes. useDeviceMode passa
a ser uma chamada de useMediaQuery e le o breakpoint do config."
```

---

### Task 8: `AppIconButton` [VISUAL]

O componente de maior retorno: o tile roxo é a identidade do sistema e está
copiado em 4 lugares.

**Files:**
- Create: `src/ui/AppIconButton.jsx`, `src/ui/AppIconButton.css`
- Modify: `src/os/desktop/Desktop.jsx`, `src/os/mobile/HomeScreen.jsx`,
  `src/os/mobile/Dock.jsx`, `src/os/desktop/StartMenu.jsx`
- Modify: `src/os/desktop/Desktop.css`, `src/os/mobile/MobileShell.css`,
  `src/os/desktop/StartMenu.css`

**Interfaces:**
- Consumes: itens de `APPS` (`os/registry.js`) — campos `id`, `icon`,
  `titleKey`.
- Produces: `<AppIconButton app={app} titulo={string} variante={'tile'|'plana'}
  tamanho={'desktop'|'mobile'|'dock'|'lista'} onClick={fn} ref={fn} />`

- [ ] **Step 1: Registrar os valores atuais**

Confirmar que estas declarações são idênticas entre
`.marocos-icon-tile` (Desktop.css) e `.marocos-mobile-tile` (MobileShell.css):

```bash
cd frontend/src
grep -A10 "^\.marocos-icon-tile {" os/desktop/Desktop.css
grep -A10 "^\.marocos-mobile-tile {" os/mobile/MobileShell.css
grep -A8 "^\.marocos-icon-label {" os/desktop/Desktop.css
grep -A8 "^\.marocos-mobile-label {" os/mobile/MobileShell.css
```

Esperado: `background`, `border`, `box-shadow`, `color`, `display`,
`place-items` idênticos; divergem só `width`/`height` (56 vs 60) e
`border-radius` (14 vs 16). Os dois labels são iguais em todas as declarações.

**Se divergir de mais coisa, parar e reportar** — a premissa do componente muda.

- [ ] **Step 2: Escrever o componente**

Criar `src/ui/AppIconButton.jsx`:

```jsx
import React, { forwardRef } from 'react'
import './AppIconButton.css'

/**
 * BOTÃO DE APP
 * --------------------------------------------------
 * O ícone do registry, com a moldura de identidade do sistema. Antes existia em
 * quatro markups diferentes — área de trabalho, tela inicial do mobile, dock e
 * menu Iniciar — com as mesmas declarações de gradiente, borda, sombra e cor
 * copiadas entre eles.
 *
 * Duas variantes:
 *   tile   moldura roxa quadrada + label embaixo (área de trabalho, tela inicial)
 *   plana  ícone solto, sem moldura (dock, menu Iniciar)
 *
 * O tamanho vem da variante de tamanho, não de prop numérica: os quatro usos
 * têm medidas fixas e conhecidas, e um número livre convidaria a inventar um
 * quinto tamanho sem motivo.
 *
 * Não conhece o gerenciador de janelas: quem abre é quem passa `onClick`.
 */
const TAMANHO_ICONE = {
  desktop: 26,
  mobile: 26,
  dock: 22,
  lista: 20,
}

const ESPESSURA_ICONE = {
  desktop: 1.75,
  mobile: 1.75,
  dock: 1.9,
  lista: 1.75,
}

const AppIconButton = forwardRef(function AppIconButton(
  { app, titulo, variante = 'tile', tamanho = 'desktop', onClick, ...resto },
  ref,
) {
  const Icon = app.icon

  return (
    <button
      ref={ref}
      type="button"
      className={`app-icon-btn app-icon-btn--${variante} app-icon-btn--${tamanho}`}
      onClick={onClick}
      {...resto}
    >
      <span className="app-icon-btn-glifo">
        {Icon ? (
          <Icon size={TAMANHO_ICONE[tamanho]} strokeWidth={ESPESSURA_ICONE[tamanho]} />
        ) : null}
      </span>
      {variante === 'tile' && <span className="app-icon-btn-label">{titulo}</span>}
      {variante === 'plana' && tamanho === 'lista' && <span>{titulo}</span>}
    </button>
  )
})

export default AppIconButton
```

- [ ] **Step 3: Escrever o CSS, copiando os valores atuais**

Criar `src/ui/AppIconButton.css` movendo — **sem alterar nenhum valor** — as
regras que hoje estão em `Desktop.css` (`.marocos-icons button`,
`.marocos-icon-tile`, `.marocos-icon-label` e o override `.theme-light`),
`MobileShell.css` (`.marocos-mobile-tile`, `.marocos-mobile-label`, o
`:active { transform: scale(0.94) }` e a transição) e `StartMenu.css`
(`.start-menu-app-btn` + estados) / `MobileShell.css`
(`.marocos-mobile-dock-btn` + estados).

Regra de organização: o que é comum vai em `.app-icon-btn--tile` /
`.app-icon-btn--plana`; o que diverge vai no modificador de tamanho:

```css
/* Comum às duas superfícies com moldura. Gradiente, borda, sombra e cor são
   idênticos entre a área de trabalho e a tela inicial — só tamanho e raio
   mudavam, e é isso que os modificadores abaixo carregam. */
.app-icon-btn--tile .app-icon-btn-glifo {
  display: grid;
  place-items: center;
  border: var(--win-border);
  background: linear-gradient(160deg, rgba(168, 85, 247, 0.5), rgba(88, 28, 135, 0.6));
  box-shadow: var(--win-highlight);
  color: #fff;
}

.app-icon-btn--desktop .app-icon-btn-glifo {
  width: var(--cfg-icone-tile, 56px);
  height: var(--cfg-icone-tile, 56px);
  border-radius: var(--cfg-icone-raio, 14px);
}

.app-icon-btn--mobile .app-icon-btn-glifo {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  transition: transform 0.1s ease;
}

/* Só o mobile tem resposta ao toque — preservado como estava. */
.app-icon-btn--mobile:active .app-icon-btn-glifo {
  transform: scale(0.94);
}
```

Seguir esse padrão para label, variante plana, dock e lista. **Cada valor tem
de ser exatamente o que estava no arquivo de origem.**

- [ ] **Step 4: Migrar os 4 consumidores**

Em cada um, substituir o markup inline pelo componente, **preservando o que é
específico de cada lugar**:

- `Desktop.jsx`: mantém o `<motion.li>` com a animação de entrada
  (`MOVIMENTO.iconesDesktop`); o `<button>` interno vira
  `<AppIconButton app={app} titulo={os.windows[app.titleKey]} variante="tile"
  tamanho="desktop" onClick={() => open(app.id)} />`
- `HomeScreen.jsx`: idem, com `tamanho="mobile"` e `MOVIMENTO.iconesMobile`
- `Dock.jsx`: `variante="plana" tamanho="dock"`, preservando `aria-label` e
  `title`
- `StartMenu.jsx`: `variante="plana" tamanho="lista"`, preservando
  `role="option"` e o `ref` que alimenta `itemRefs` (por isso o componente usa
  `forwardRef`)

Remover das folhas de origem as regras que foram movidas. **Não** remover as
regras de container (`.marocos-icons`, `.marocos-mobile-grid`,
`.marocos-mobile-dock`, `.start-menu-apps`), que continuam onde estão.

- [ ] **Step 5: Verificação visual — comparar os 4 lugares**

Além do protocolo padrão, conferir especificamente:

1. Ícones da área de trabalho: tamanho, raio, gradiente, sombra do label,
   hover, foco por teclado — e o tema claro, que inverte a cor do label
2. Tela inicial mobile: o mesmo, mais o `scale(0.94)` ao tocar
3. Dock: tamanho 48, sem moldura, estados de toque nos dois temas
4. Menu Iniciar: alinhamento da linha, hover, e **navegação por ↑/↓**, que
   depende do `ref` ter sido preservado

- [ ] **Step 6: Verificar build**

```bash
cd frontend && npm run lint && npm test && npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/ui/ frontend/src/os/
git commit -m "refactor: extrair AppIconButton, usado nos 4 lugares que o copiavam

Area de trabalho, tela inicial do mobile, dock e menu Iniciar renderizavam
'icone do registry + label' com markup proprio, e as declaracoes de gradiente,
borda, sombra e cor do tile eram identicas entre desktop e mobile -- so
divergiam tamanho e raio. Agora e um componente com duas variantes; mudar a
aparencia do icone do sistema passa de quatro arquivos para um."
```

---

### Task 9: `AppHeader` [VISUAL]

**Files:**
- Create: `src/ui/AppHeader.jsx`, `src/ui/AppHeader.css`
- Modify: `src/apps/DevicesApp.jsx`, `src/apps/HistoryApp.jsx`
- Modify: `src/apps/DevicesApp.css`, `src/apps/HistoryApp.css`

**Interfaces:**
- Consumes: nada de tarefas anteriores.
- Produces: `<AppHeader eyebrow={string} titulo={string} subtitulo={string}
  escala={'sm'|'md'} />`

- [ ] **Step 1: Escrever o componente**

Criar `src/ui/AppHeader.jsx`:

```jsx
import React from 'react'
import './AppHeader.css'

/**
 * CABEÇALHO DE APP
 * --------------------------------------------------
 * Eyebrow monoespaçada + título + subtítulo. `DevicesApp` e `HistoryApp` tinham
 * este bloco copiado, com a mesma receita (Courier New na eyebrow, cor de
 * destaque, caixa alta, letter-spacing 2px; título em --text-primary com
 * letter-spacing -0.5px; subtítulo em --text-secondary).
 *
 * OS TAMANHOS NÃO FORAM UNIFICADOS. Os dois apps diferem por 0.02–0.1rem em
 * cada linha — quase certamente ruído de copiar e ajustar no olho, e não
 * decisão. Mas unificar é mudança visual, então a diferença virou uma variante
 * de escala e continua exatamente onde estava. Colapsar as duas é decisão de
 * design, para ser tomada de propósito.
 *
 *   sm  DevicesApp   0.68 / 1.3 / 0.82rem
 *   md  HistoryApp   0.72 / 1.4 / 0.85rem
 */
const AppHeader = ({ eyebrow, titulo, subtitulo, escala = 'md' }) => (
  <header className={`app-header app-header--${escala}`}>
    {eyebrow && <span className="app-header-eyebrow">{eyebrow}</span>}
    <h2 className="app-header-titulo">{titulo}</h2>
    {subtitulo && <p className="app-header-subtitulo">{subtitulo}</p>}
  </header>
)

export default AppHeader
```

- [ ] **Step 2: Escrever o CSS com os dois conjuntos preservados**

Criar `src/ui/AppHeader.css`. A receita comum sai das regras atuais; os
tamanhos entram por escala. Usar o peso **já corrigido na Tarefa 4** — conferir
o valor atual em `DevicesApp.css` antes de copiar, não os 800/300 originais.

```css
/* Receita comum, idêntica nos dois apps de origem. */
.app-header-eyebrow {
  font-family: 'Courier New', monospace;
  color: var(--accent-color);
  font-weight: 600;          /* conferir o valor pós-Tarefa 4 */
  letter-spacing: 2px;
  text-transform: uppercase;
}

.app-header-titulo {
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.5px;
  font-weight: 700;          /* conferir o valor pós-Tarefa 4 */
}

.app-header-subtitulo {
  color: var(--text-secondary);
  margin: 0;
  font-weight: 400;          /* conferir o valor pós-Tarefa 4 */
}

/* DevicesApp */
.app-header--sm .app-header-eyebrow   { font-size: 0.68rem; }
.app-header--sm .app-header-titulo    { font-size: 1.3rem; }
.app-header--sm .app-header-subtitulo { font-size: 0.82rem; line-height: 1.5; }

/* HistoryApp */
.app-header--md .app-header-eyebrow   { font-size: 0.72rem; }
.app-header--md .app-header-titulo    { font-size: 1.4rem; line-height: 1.15; }
.app-header--md .app-header-subtitulo { font-size: 0.85rem; line-height: 1.55; }
```

**Atenção:** conferir se as regras de container originais
(`.devices-header`, `.history-header`) trazem `display`, `gap` ou `margin` — se
sim, preservar no `.app-header` ou manter a regra de container no app de origem.

- [ ] **Step 3: Migrar os dois apps**

`DevicesApp.jsx`, substituir o `<header className="devices-header">` inteiro por:

```jsx
<AppHeader
  eyebrow={content.sectionLabel}
  titulo={content.title}
  subtitulo={content.subtitle}
  escala="sm"
/>
```

`HistoryApp.jsx`, o `<header className="history-header">` por o mesmo com
`escala="md"`.

Remover de `DevicesApp.css` e `HistoryApp.css` as regras que foram movidas
(`.devices-eyebrow`, `.devices-title`, `.devices-subtitle`, `.history-label`,
`.history-title`, `.history-subtitle`), preservando as de container se
necessário.

- [ ] **Step 4: Verificação visual**

Abrir "Gerenciador de Dispositivos" e "Histórico de Versões" nos dois temas e
comparar com a linha de base. A verificação aqui é de tipografia: tamanho,
espessura, espaçamento entre letras e a distância entre as três linhas.

- [ ] **Step 5: Verificar build**

```bash
cd frontend && npm run lint && npm test && npm run build
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/ui/AppHeader.jsx frontend/src/ui/AppHeader.css frontend/src/apps/
git commit -m "refactor: extrair AppHeader de DevicesApp e HistoryApp

Mesmo markup e mesma receita tipografica copiados nos dois. Os tamanhos NAO
foram unificados: diferem por 0.02-0.1rem e unificar seria mudanca visual --
viraram variante de escala (sm/md) e continuam exatamente onde estavam."
```

---

### Task 10: `useSystemToggles` + `ToggleRow` [VISUAL]

**Files:**
- Create: `src/ui/useSystemToggles.js`, `src/ui/ToggleRow.jsx`, `src/ui/ToggleRow.css`
- Modify: `src/apps/SettingsApp.jsx`, `src/os/mobile/QuickSettings.jsx`,
  `src/os/desktop/Taskbar.jsx`

**Interfaces:**
- Consumes: `useTheme`, `useLanguage`, `getOsData`.
- Produces:
  - `export function useSystemToggles()` → array de 3 objetos
    `{ id: 'theme'|'language'|'animation', icon, label, hint, valor, valorCurto, alternar }`
  - `<ToggleRow linha={objeto} className={string} />`

- [ ] **Step 1: Escrever o hook**

Criar `src/ui/useSystemToggles.js`:

```js
import { Sun, Moon, Play, Pause, Languages } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import { getOsData } from '../data/os'

/**
 * OS TRÊS CONTROLES DO SISTEMA, NUM LUGAR SÓ
 * --------------------------------------------------
 * Tema, idioma e movimento apareciam em três telas — o app Configurações, os
 * ajustes rápidos do mobile e o popup da bandeja — cada uma montando a própria
 * lista. Acrescentar um quarto controle custava três arquivos.
 *
 * O hook devolve os dados; quem desenha é cada tela, porque os três formatos
 * são diferentes de verdade:
 *   Configurações   ícone + rótulo + dica + valor por extenso
 *   Ajustes rápidos ícone + rótulo + valor curto
 *   Bandeja         só o ícone, que já É o valor
 *
 * `label` vem de os.tray.* e `hint`/`valor` de os.settings.*, que é como as
 * chaves de i18n já estavam divididas — sem duplicar tradução.
 */
export function useSystemToggles() {
  const { language, toggleLanguage } = useLanguage()
  const { isDark, isAnimated, toggleTheme, toggleAnimation } = useTheme()
  const os = getOsData(language)
  const t = os.settings

  return [
    {
      id: 'theme',
      icon: isDark ? Moon : Sun,
      label: t.theme.label,
      labelCurto: os.tray.theme,
      hint: t.theme.hint,
      valor: isDark ? t.theme.dark : t.theme.light,
      valorCurto: isDark ? t.theme.dark : t.theme.light,
      alternar: toggleTheme,
    },
    {
      id: 'language',
      icon: Languages,
      label: t.language.label,
      labelCurto: os.tray.language,
      hint: t.language.hint,
      valor: language === 'pt' ? 'Português (BR)' : 'English (US)',
      valorCurto: language === 'pt' ? 'PT' : 'EN',
      alternar: toggleLanguage,
    },
    {
      id: 'animation',
      icon: isAnimated ? Pause : Play,
      label: t.animation.label,
      labelCurto: os.tray.animation,
      hint: t.animation.hint,
      valor: isAnimated ? t.animation.on : t.animation.off,
      valorCurto: isAnimated ? t.animation.on : t.animation.off,
      alternar: toggleAnimation,
    },
  ]
}
```

**Atenção ao contrato de texto atual, que precisa ser preservado:** hoje o
`SettingsApp` usa `t.theme.label`/`t.theme.hint`; o `QuickSettings` usa
`os.tray.theme` como rótulo e `os.settings.theme.dark|light` como valor; e o
popup da bandeja usa `os.tray.*` e mostra `'EN'`/`'PT'` no idioma, enquanto o
botão da bandeja no desktop mostra `'BR'`/`'EN'`. **Não unificar esses textos** —
são o que está na tela hoje. Conferir cada um antes de migrar.

- [ ] **Step 2: Escrever `ToggleRow`**

Criar `src/ui/ToggleRow.jsx` cobrindo apenas Configurações e Ajustes rápidos:

```jsx
import React from 'react'
import './ToggleRow.css'

/**
 * Uma linha de controle do sistema. Cobre o app Configurações e os ajustes
 * rápidos do mobile, que têm a mesma estrutura (ícone + texto + valor).
 *
 * O popup da bandeja NÃO usa este componente: lá o ícone é o próprio valor, sem
 * coluna separada, e forçar os três no mesmo componente pediria um leque de
 * props que valeria menos que a duplicação removida. A bandeja consome só o
 * hook.
 */
/* O corpo do componente está logo abaixo, na nota sobre estrutura de
   elemento — ele tem duas formas, e a nota explica por quê. */
```

**Estrutura de elemento — DECIDIDO ANTES DA EXECUÇÃO, não reabrir.**

Hoje o `SettingsApp` tem `<li>` com `<span>`s e um `<button>` só na etiqueta de
valor, enquanto o `QuickSettings` tem o `<button>` envolvendo a linha inteira.
Unificar num `<button>` externo faria o **alvo de clique do Settings crescer**
da etiqueta para a linha toda — mudança de comportamento, ainda que não de
aparência, e a seção 0 deste plano proíbe.

Portanto o `ToggleRow` recebe uma prop `alvo`:

```jsx
const ToggleRow = ({ linha, alvo = 'linha', mostrarHint = false, className = '' }) => {
  const Icon = linha.icon
  const conteudo = (
    <>
      <span className="toggle-row-icone">
        <Icon size={mostrarHint ? 18 : 20} strokeWidth={1.8} />
      </span>
      <span className="toggle-row-texto">
        <span className="toggle-row-label">
          {mostrarHint ? linha.label : linha.labelCurto}
        </span>
        {mostrarHint && <span className="toggle-row-hint">{linha.hint}</span>}
      </span>
    </>
  )

  const valor = mostrarHint ? linha.valor : linha.valorCurto

  // alvo="valor": só a etiqueta é clicável, como no app Configurações hoje.
  // alvo="linha": a linha inteira, como nos ajustes rápidos hoje.
  // Os dois existem porque os dois comportamentos existem hoje, e mudar
  // qualquer um deles seria mudança de comportamento sem pedido.
  if (alvo === 'valor') {
    return (
      <li className={`toggle-row ${className}`.trim()}>
        {conteudo}
        <button type="button" className="toggle-row-valor" onClick={linha.alternar}>
          {valor}
        </button>
      </li>
    )
  }

  return (
    <button
      type="button"
      className={`toggle-row ${className}`.trim()}
      onClick={linha.alternar}
    >
      {conteudo}
      <span className="toggle-row-valor">{valor}</span>
    </button>
  )
}
```

`SettingsApp` usa `alvo="valor" mostrarHint`; `QuickSettings` usa o padrão.
**Conferir também o elemento externo:** o Settings renderiza uma `<ul>` de
`<li>`, e o QuickSettings uma `<ul>` de `<li>` com o `<button>` dentro — por
isso a variante `alvo="valor"` devolve `<li>` e a outra devolve `<button>`, que
o consumidor envolve em `<li>`. Conferir no CSS de origem qual estrutura cada um
espera antes de escrever.

- [ ] **Step 3: CSS**

Criar `src/ui/ToggleRow.css` copiando as regras de `.settings-row`,
`.settings-icon`, `.settings-text`, `.settings-label`, `.settings-hint`,
`.settings-value` (de `SettingsApp.css`) e `.marocos-mobile-qs-row`,
`-label`, `-value` (de `MobileShell.css`), sob os nomes novos e com um
modificador por container. **Nenhum valor muda.**

- [ ] **Step 4: Migrar os três consumidores**

- `SettingsApp.jsx`: apaga o array `rows` local, chama `useSystemToggles()`,
  renderiza `<ToggleRow linha={l} mostrarHint />`
- `QuickSettings.jsx`: apaga o array `rows` local, chama `useSystemToggles()`,
  renderiza `<ToggleRow linha={l} />`
- `Taskbar.jsx`: o popup da bandeja mantém o markup próprio, mas o array local
  sai e os dados vêm do hook

- [ ] **Step 5: Verificação visual**

App Configurações (nos dois temas e nos dois idiomas), Ajustes rápidos no mobile,
popup da bandeja em tela estreita. Conferir que os **textos** são os mesmos —
este é o risco desta tarefa, mais do que o layout.

- [ ] **Step 6: Verificar build**

```bash
cd frontend && npm run lint && npm test && npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/ui/ frontend/src/apps/SettingsApp.jsx frontend/src/os/
git commit -m "refactor: centralizar os tres controles do sistema em useSystemToggles

Tema, idioma e movimento estavam montados em tres telas diferentes, cada uma
com o proprio array. Agora ha uma fonte; o ToggleRow cobre Configuracoes e
ajustes rapidos, e o popup da bandeja mantem markup proprio porque la o icone
e o proprio valor."
```

---

### Task 11: `Clock` [VISUAL]

**Files:**
- Create: `src/ui/Clock.jsx`
- Modify: `src/os/desktop/Taskbar.jsx`, `src/os/mobile/HomeScreen.jsx`,
  `src/os/boot/Ceremony.jsx`

**Interfaces:**
- Consumes: nada.
- Produces: `<Clock formato={'hm'|'hm-data'|'extenso'} locale={string}
  className={string} />`

- [ ] **Step 1: Escrever o componente**

Criar `src/ui/Clock.jsx`:

```jsx
import React, { useState, useEffect } from 'react'

/**
 * RELÓGIO
 * --------------------------------------------------
 * Havia três implementações com três intervalos: a taskbar tiquetaqueava a cada
 * segundo, a barra de status do mobile a cada 30s, e o da tela de bloqueio
 * alinhava o primeiro tique à virada do minuto.
 *
 * O ALINHAMENTO ERA A ÚNICA IMPLEMENTAÇÃO CORRETA, e agora vale para todas.
 * Um `setInterval(60_000)` disparado na montagem erra o minuto exibido por até
 * meio intervalo: se a página carrega aos 40 segundos, o relógio só troca aos
 * 40 do minuto seguinte. Alinhar à virada custa um `setTimeout` a mais e
 * elimina o erro.
 *
 * NENHUM DOS TRÊS FORMATOS MOSTRA SEGUNDOS, então nenhum precisa de tique de
 * um segundo — repintar 60x por minuto para trocar um dígito por minuto era
 * desperdício. O intervalo é derivado do formato.
 */
const FORMATADORES = {
  hm: (d, locale) => ({
    principal: d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
    secundario: null,
  }),
  'hm-data': (d, locale) => ({
    principal: d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
    secundario: d.toLocaleDateString(locale, {
      day: '2-digit', month: '2-digit', year: 'numeric',
    }),
  }),
  extenso: (d, locale) => ({
    principal: d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
    secundario: d.toLocaleDateString(locale, {
      weekday: 'long', day: 'numeric', month: 'long',
    }),
  }),
}

const Clock = ({
  formato = 'hm',
  locale = undefined,
  classePrincipal = '',
  classeSecundaria = '',
}) => {
  const [agora, setAgora] = useState(() => new Date())

  useEffect(() => {
    let intervalo
    // Alinha o primeiro tique à virada do minuto.
    const msAteVirar = (60 - new Date().getSeconds()) * 1000
    const inicio = setTimeout(() => {
      setAgora(new Date())
      intervalo = setInterval(() => setAgora(new Date()), 60_000)
    }, msAteVirar)

    return () => {
      clearTimeout(inicio)
      clearInterval(intervalo)
    }
  }, [])

  const { principal, secundario } = FORMATADORES[formato](agora, locale)

  return (
    <>
      <div className={classePrincipal}>{principal}</div>
      {secundario && <div className={classeSecundaria}>{secundario}</div>}
    </>
  )
}

export default React.memo(Clock)
```

- [ ] **Step 2: Migrar a Taskbar**

Em `src/os/desktop/Taskbar.jsx`, apagar o componente `Clock` local (o
`React.memo` no fim do arquivo) e usar:

```jsx
<div className="tray-clock">
  <Clock formato="hm-data" classePrincipal="time" classeSecundaria="date" />
</div>
```

**Mudança de comportamento consciente:** a taskbar deixa de tiquetaquear a cada
segundo. Como ela nunca mostrou segundos, a tela é a mesma — e passa a acertar o
minuto, que hoje erra por até 59 segundos. Registrar em comentário.

- [ ] **Step 3: Migrar a HomeScreen**

Em `src/os/mobile/HomeScreen.jsx`, apagar o `useState`/`useEffect` do relógio e
usar `<Clock formato="hm" classePrincipal="marocos-mobile-clock" />`.

Cuidado: hoje o markup é um `<span className="marocos-mobile-clock">` e o
`Clock` emite `<div>`. Conferir se o CSS de `.marocos-mobile-clock` depende de
`display: inline` — se depender, ajustar a classe no CSS ou dar `display` ao
`div`. Verificar visualmente.

- [ ] **Step 4: Migrar a Cerimônia**

Em `src/os/boot/Ceremony.jsx`, apagar o componente `Relogio` local e usar:

```jsx
<div className="lock-clock">
  <Clock
    formato="extenso"
    locale={language === 'pt' ? 'pt-BR' : 'en-US'}
    classePrincipal="lock-time"
    classeSecundaria="lock-date"
  />
</div>
```

- [ ] **Step 5: Verificação visual**

Relógio da taskbar (hora + data), da barra de status mobile, e da tela de
bloqueio (hora + data por extenso, nos dois idiomas). Conferir alinhamento e
tamanho — a troca de `<span>` por `<div>` na HomeScreen é o ponto de risco.

Verificar também que **os três acertam a virada do minuto**: deixar aberto até
o minuto trocar.

- [ ] **Step 6: Verificar build**

```bash
cd frontend && npm run lint && npm test && npm run build
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/ui/Clock.jsx frontend/src/os/
git commit -m "refactor: um relogio so, alinhado a virada do minuto

Havia tres implementacoes com tres intervalos (1s, 30s, minuto alinhado).
Nenhum dos formatos mostra segundos, entao o tique de um segundo da taskbar
era repintura a toa; e os dois que nao alinhavam erravam o minuto exibido por
ate meio intervalo. O alinhamento, que so a tela de bloqueio tinha, passa a
valer para os tres."
```

---

### Task 11B: `Chip` e `primitives.css` — com critério de corte [VISUAL]

**Esta tarefa pode terminar em "não fazer", e isso é um resultado válido.**
O spec (§3) já registra que o `Chip` é o caso de reuso mais fraco da lista: as
5 pílulas têm valores visuais genuinamente diferentes. A tarefa começa medindo,
e só extrai se a medição justificar.

**Files:**
- Create (condicional): `src/ui/Chip.jsx`, `src/ui/Chip.css`
- Create (condicional): `src/os/primitives.css`
- Modify (condicional): os `App.css` que compartilharem base

**Interfaces:**
- Consumes: nada.
- Produces (se a extração acontecer): `<Chip variante={string}>texto</Chip>`.
  Nenhuma tarefa posterior depende disto — por isso pode ser cortada.

- [ ] **Step 1: Medir as 5 pílulas**

```bash
cd frontend/src
grep -A10 "^\.about-feature-chip {" apps/AboutApp.css
grep -A10 "^\.project-detail-tech-item {" apps/ProjectDetailApp.css
grep -A10 "^\.history-tag {" apps/HistoryApp.css
grep -A10 "^\.terminal-tag {" apps/TerminalApp.css
grep -rn "chip\|-tag {" apps/DevicesApp.css
```

Montar uma tabela: para cada pílula, `font-size`, `font-weight`,
`letter-spacing`, `text-transform`, `padding`, `border-radius`, `background`,
`border`, `color`.

- [ ] **Step 2: Aplicar o critério de corte**

Contar quantas declarações são **idênticas nas cinco**.

- **Se ≥ 5 declarações forem comuns:** extrair. O `Chip` carrega a base comum,
  cada uso ganha um modificador com o que diverge.
- **Se < 5:** **não extrair.** Registrar a decisão e a tabela do Step 1 num
  comentário no topo de `src/ui/` (ou em `docs/superpowers/plans/`), pular para
  o Step 4 e commitar só essa nota. Uma abstração que precisa de 5 modificadores
  para 5 usos não remove duplicação — ela adiciona indireção.

- [ ] **Step 3: Se extraiu — criar o componente e migrar**

`src/ui/Chip.jsx`:

```jsx
import React from 'react'
import './Chip.css'

/**
 * PÍLULA
 * --------------------------------------------------
 * A base comum às pílulas do sistema. Cada uso mantém o que tem de próprio via
 * `variante` — os cinco lugares que a usavam divergem de verdade em tamanho e
 * cor, e forçar um visual só seria mudança de design.
 */
const Chip = ({ variante = 'padrao', children, ...resto }) => (
  <span className={`chip chip--${variante}`} {...resto}>
    {children}
  </span>
)

export default Chip
```

`src/ui/Chip.css` recebe a base comum medida no Step 1, e um modificador por
uso com **exatamente** os valores que divergem.

Migrar os consumidores um a um, verificando visualmente cada janela antes de
passar para a próxima.

- [ ] **Step 4: `primitives.css` — mesmo critério**

Comparar as regras de superfície de card entre `AboutApp.css`
(`.about-spec-card`), `ProjectsApp.css`, `HistoryApp.css` (`.history-card`),
`ProjectDetailApp.css` e `SettingsApp.css`. Todas usam `var(--card-bg)` e
`var(--card-border)`, então boa parte já está centralizada nos tokens.

Extrair para `src/os/primitives.css` **apenas** o conjunto de declarações que
for literalmente idêntico em três ou mais arquivos. Se não houver tal conjunto,
não criar o arquivo — os tokens `--card-*` já fazem o trabalho.

- [ ] **Step 5: Verificação visual**

Se houve extração: abrir os apps tocados nos dois temas e comparar com a linha
de base, com atenção a padding, raio e espessura de borda das pílulas.

Se não houve: nada a verificar.

- [ ] **Step 6: Verificar build**

```bash
cd frontend && npm run lint && npm test && npm run build
```

- [ ] **Step 7: Commit**

Se extraiu:

```bash
git add frontend/src/ui/ frontend/src/apps/ frontend/src/os/
git commit -m "refactor: extrair a base comum das pilulas do sistema"
```

Se não extraiu:

```bash
git add docs/superpowers/plans/
git commit -m "docs: registrar por que Chip e primitives.css nao foram extraidos

A medicao das cinco pilulas mostrou menos declaracoes comuns do que o
criterio de corte exigia. Um componente com cinco modificadores para cinco
usos nao remove duplicacao, so acrescenta indirecao -- a tabela da medicao
fica registrada para quem quiser rever a decisao."
```

---

# FASE 3 — Performance de bundle (Tarefas 12–14)

---

### Task 12: Dividir o contexto de janelas

**Files:**
- Modify: `src/os/WindowManagerContext.jsx`
- Modify: `src/os/desktop/Desktop.jsx`, `src/os/desktop/Window.jsx`
- Modify: `src/apps/ProjectsApp.jsx`, `src/apps/TerminalApp.jsx`,
  `src/os/mobile/Dock.jsx`, `src/os/mobile/HomeScreen.jsx`,
  `src/os/mobile/MobileApp.jsx`

**Interfaces:**
- Consumes: nada de tarefas anteriores.
- Produces:
  - `export function useWindowActions()` → `{ open, close, focus, minimize,
    toggleMaximize, move, minimizeAll, closeAll }` — referência **estável para
    sempre**
  - `export function useWindowState()` → `{ windows, focusedKey }`
  - `export function useWindows()` → os dois juntos (compatibilidade)

- [ ] **Step 1: Dividir o provider**

Em `src/os/WindowManagerContext.jsx`, trocar o `value` único por dois contextos:

```jsx
const WindowStateContext = createContext(null)
const WindowActionsContext = createContext(null)
```

E, no provider:

```jsx
/**
 * DOIS CONTEXTOS, NÃO UM.
 *
 * O `value` era montado inline a cada render, então qualquer mudança de estado
 * — focar, arrastar, minimizar — criava um objeto novo e re-renderizava TODOS
 * os consumidores: o Desktop, a Taskbar, cada Window e, por dentro delas, cada
 * app montado. Abrir uma janela re-renderizava todos os apps já abertos.
 *
 * As ações são `useCallback` sem dependências, portanto estáveis para sempre.
 * Separadas, os consumidores que só disparam ações (ProjectsApp, TerminalApp,
 * Dock, HomeScreen, MobileApp) param de re-renderizar por completo quando uma
 * janela se mexe.
 */
const acoes = useMemo(
  () => ({ open, close, focus, minimize, toggleMaximize, move, minimizeAll, closeAll }),
  [open, close, focus, minimize, toggleMaximize, move, minimizeAll, closeAll],
)

const estado = useMemo(
  () => ({ windows: state.windows, focusedKey: state.focusedKey }),
  [state.windows, state.focusedKey],
)

return (
  <WindowActionsContext.Provider value={acoes}>
    <WindowStateContext.Provider value={estado}>
      {children}
    </WindowStateContext.Provider>
  </WindowActionsContext.Provider>
)
```

E os três hooks:

```jsx
export function useWindowActions() {
  const ctx = useContext(WindowActionsContext)
  if (!ctx) throw new Error('useWindowActions precisa estar dentro de WindowManagerProvider')
  return ctx
}

export function useWindowState() {
  const ctx = useContext(WindowStateContext)
  if (!ctx) throw new Error('useWindowState precisa estar dentro de WindowManagerProvider')
  return ctx
}

/** Compatibilidade: quem precisa dos dois. Re-renderiza com o estado, como
 *  antes — use os hooks específicos quando só um lado for necessário. */
export function useWindows() {
  return { ...useWindowState(), ...useWindowActions() }
}
```

- [ ] **Step 2: Migrar os 5 consumidores que só usam ações**

Trocar `useWindows()` por `useWindowActions()` em: `ProjectsApp.jsx`
(`{ open }`), `TerminalApp.jsx` (`{ open }`), `Dock.jsx` (`{ open }`),
`HomeScreen.jsx` (`{ open }`), `MobileApp.jsx` (`{ close }`).

- [ ] **Step 3: Tirar `focusedKey` da Window e passar por prop**

Em `src/os/desktop/Window.jsx`:

- trocar `const { focusedKey, focus, close, ... } = useWindows()` por
  `const { focus, close, minimize, toggleMaximize, move } = useWindowActions()`
- receber `isFocused` como prop em vez de derivar de `focusedKey`
- envolver o export em `React.memo`

Em `src/os/desktop/Desktop.jsx`, que já lê `windows`, passar a ler também
`focusedKey` e repassar:

```jsx
{windows.map((win) => (
  <Window key={win.key} win={win} isFocused={win.key === focusedKey} />
))}
```

/* Comentário a incluir no Window.jsx:
   `isFocused` vem por prop, e não do contexto: assim uma troca de foco
   re-renderiza apenas as duas janelas cujo estado de foco realmente mudou, em
   vez de todas. Com o React.memo abaixo, as demais nem entram no render. */

- [ ] **Step 3B: `dragConstraints` reativo**

Ainda em `src/os/desktop/Window.jsx`, o `dragConstraints` lê
`window.innerWidth` / `window.innerHeight` no corpo do render:

```jsx
dragConstraints={{
  left: 0, top: 0,
  right: Math.max(0, window.innerWidth - 160),
  bottom: Math.max(0, window.innerHeight - 120),
}}
```

Isso não reage a redimensionamento — quem encolhe a janela do navegador com
uma janela do sistema aberta continua podendo arrastá-la para fora do quadro.

Trocar por um valor derivado de estado, medido num listener de `resize`:

```jsx
/**
 * O limite de arrasto acompanha a janela do navegador. Lendo `window.innerWidth`
 * direto no render, o valor congelava no primeiro render e redimensionar
 * deixava arrastar a janela para fora do quadro.
 */
const [viewport, setViewport] = useState(() => ({
  w: typeof window === 'undefined' ? 0 : window.innerWidth,
  h: typeof window === 'undefined' ? 0 : window.innerHeight,
}))

useEffect(() => {
  const aoRedimensionar = () =>
    setViewport({ w: window.innerWidth, h: window.innerHeight })
  window.addEventListener('resize', aoRedimensionar)
  return () => window.removeEventListener('resize', aoRedimensionar)
}, [])
```

E no JSX:

```jsx
dragConstraints={{
  left: 0, top: 0,
  right: Math.max(0, viewport.w - JANELAS.folgaArrastoX),
  bottom: Math.max(0, viewport.h - JANELAS.folgaArrastoY),
}}
```

Isto também elimina os literais 160 e 120, migrando-os para o config.

- [ ] **Step 4: Verificar que nenhum consumidor quebrou**

```bash
cd frontend/src
grep -rn "useWindows()" --include=*.jsx .
```

Esperado: restam apenas `Desktop.jsx`, `Taskbar.jsx`, `MobileShell.jsx`,
`App.jsx` (`BoasVindas`, `TituloDaPagina`) — todos legitimamente precisam dos
dois lados.

- [ ] **Step 5: Verificar o ganho no navegador**

Com o React DevTools (aba Profiler, "Highlight updates when components render"):

1. Abrir 3 janelas, entre elas o Terminal e o Assistente
2. Arrastar uma janela e soltar
3. **Antes:** todas as janelas e apps piscavam. **Depois:** apenas a janela
   arrastada e a Taskbar

Se os apps ainda re-renderizarem, um consumidor não foi migrado.

- [ ] **Step 6: Verificação funcional completa**

Este é o ponto de maior risco de regressão **funcional** (não visual): abrir,
focar, minimizar, restaurar pela taskbar, maximizar, arrastar, fechar,
"mostrar área de trabalho", abrir projeto pela pasta (janela filha), deep link
direto em `/projetos/bussola-v2`, e voltar/avançar do navegador.

- [ ] **Step 7: Verificar build**

```bash
cd frontend && npm run lint && npm test && npm run build
```

- [ ] **Step 8: Commit**

```bash
git add frontend/src/os/ frontend/src/apps/
git commit -m "perf: dividir o contexto de janelas em estado e acoes

O value do provider era montado inline, entao focar ou arrastar uma janela
re-renderizava todos os consumidores -- inclusive cada app montado dentro de
cada janela. As acoes sao estaveis para sempre e agora vivem num contexto
proprio; cinco consumidores que so disparam acoes pararam de re-renderizar.
A Window recebe isFocused por prop e ganhou memo, entao trocar o foco toca so
as duas janelas envolvidas."
```

---

### Task 13: Portar o `Silk` de `@react-three/fiber` para `ogl` [VISUAL]

**A tarefa de maior ganho e maior risco.** Isolada de propósito.

**Contexto:** `Silk.jsx` importa `three` e `@react-three/fiber`
estaticamente, e a cadeia `App → Desktop → Hills → Silk` é toda estática. Isso
põe o `three` inteiro no caminho crítico e anula o `React.lazy` do `Crystal` —
verificado por grep no bundle: `IcosahedronGeometry` e `MeshPhysicalMaterial`
estão no `index.js`, não no chunk lazy.

O Silk é um quad de tela cheia com um shader. Não usa câmera, cena, luz nem
nada que justifique o `three`. O `ogl` já é dependência (o `Iridescence` usa) e
faz exatamente isto.

**Files:**
- Modify: `src/components/backgrounds/Silk.jsx` (reescrita)
- Modify: `src/wallpapers/Hills.jsx` (passa a ler do config)

**Interfaces:**
- Consumes: `WALLPAPER.silk` de `config/system.js`.
- Produces: `<Silk color speed scale rotation noiseIntensity isAnimated />` —
  **mesma assinatura de props de hoje**, para o `Hills` não mudar de contrato.

- [ ] **Step 1: Reescrever o Silk sobre ogl**

Substituir `src/components/backgrounds/Silk.jsx` inteiro:

```jsx
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl'
import { useEffect, useRef } from 'react'
import { WALLPAPER } from '../../config/system'

/**
 * SILK — o wallpaper do tema escuro.
 *
 * PORTADO DE @react-three/fiber PARA ogl. O shader é o mesmo, byte a byte; o
 * que mudou foi o runtime. Motivo: este componente é importado estaticamente
 * pela cadeia App -> Desktop -> Hills, então o `three` inteiro entrava no
 * caminho crítico e anulava o React.lazy do Crystal — o `three` estava no
 * bundle principal, e o chunk "lazy" só carregava a cola do drei.
 *
 * O Silk não usa câmera, cena, luz nem material: é um quad de tela cheia com um
 * fragment shader. O ogl faz exatamente isso, já era dependência do projeto (o
 * Iridescence usa) e é uma fração do tamanho.
 *
 * MESMA ESTRUTURA DO Iridescence.jsx, de propósito — inclusive a pausa por ref,
 * que existe porque pôr `isAnimated` nas dependências do efeito destruía e
 * reconstruía o contexto WebGL a cada alternância, bem no instante em que a
 * cortina da tela de bloqueio começa a subir.
 */

const hexParaRgbNormalizado = (hex) => {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ]
}

/**
 * O vertex shader mudou de forma, não de efeito. No three, `position` era vec3
 * (vindo de um planeGeometry 2x2); no ogl, o Triangle fornece `position` e `uv`
 * como vec2. O Triangle é um triângulo de tela cheia cujo uv vai de 0 a 1 ao
 * longo da região visível — exatamente o que o plano 2x2 dava.
 */
const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

/**
 * Fragment shader IDÊNTICO ao da versão three. A única linha acrescentada é a
 * de precisão, que o three injetava sozinho e o ogl exige explícita.
 */
const fragmentShader = `
precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`

export default function Silk({
  speed = WALLPAPER.silk.velocidade,
  scale = WALLPAPER.silk.escala,
  color = WALLPAPER.silk.cor,
  noiseIntensity = WALLPAPER.silk.ruido,
  rotation = WALLPAPER.silk.rotacao,
  isAnimated = true,
}) {
  const containerRef = useRef(null)

  // Ver o cabeçalho: a pausa vive numa ref, não nas dependências do efeito.
  const animandoRef = useRef(isAnimated)
  useEffect(() => {
    animandoRef.current = isAnimated
  }, [isAnimated])

  useEffect(() => {
    if (!containerRef.current) return
    const ctn = containerRef.current

    const renderer = new Renderer({
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: false,
    })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)

    let program
    let mesh

    function redimensionar() {
      // Renderiza a uma fração da resolução e estica por CSS. Como o efeito é
      // de fumaça, a perda de nitidez é imperceptível — e derruba muito o custo
      // em monitor 4K ou de alta taxa de atualização.
      const f = WALLPAPER.silk.dpr
      renderer.setSize(ctn.offsetWidth * f, ctn.offsetHeight * f)
      gl.canvas.style.width = '100%'
      gl.canvas.style.height = '100%'
      if (mesh) renderer.render({ scene: mesh })
    }

    window.addEventListener('resize', redimensionar, false)
    redimensionar()

    const geometry = new Triangle(gl)
    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uSpeed: { value: speed },
        uScale: { value: scale },
        uNoiseIntensity: { value: noiseIntensity },
        uColor: { value: new Color(...hexParaRgbNormalizado(color)) },
        uRotation: { value: rotation },
        uTime: { value: 0 },
      },
    })

    mesh = new Mesh(gl, { geometry, program })

    /**
     * TETO DE FPS. O custo do backdrop-filter das janelas é (custo do blur) ×
     * (quadros por segundo do fundo): toda vez que este canvas redesenha, o
     * navegador refaz o blur de tudo que estiver por cima. Como isto é um
     * gradiente lento, 20fps é indistinguível de 60 e custa um terço.
     */
    const intervaloMs = 1000 / WALLPAPER.silk.fps
    let ultimoDesenho = 0
    let ultimoTempo = 0
    let idAnimacao

    function atualizar(t) {
      idAnimacao = requestAnimationFrame(atualizar)
      if (!animandoRef.current) {
        // Pausado: não desenha nada, 0% de GPU. E zera a referência de tempo,
        // senão o primeiro quadro após despausar receberia um delta enorme e o
        // padrão daria um salto.
        ultimoTempo = t
        return
      }

      if (t - ultimoDesenho < intervaloMs) return
      ultimoDesenho = t

      /**
       * O TEMPO É ACUMULADO, NÃO LIDO DO RELÓGIO ABSOLUTO. A versão r3f fazia
       * `uTime += 0.1 * delta` dentro do useFrame, e com o loop sob demanda a
       * 20fps isso dava 0.1 unidade por segundo de tempo real. Reproduzir com
       * `uTime = t * 0.0001` daria a mesma velocidade, mas o padrão saltaria ao
       * despausar — porque o relógio andou enquanto o shader estava parado.
       * Acumulando, pausar congela de verdade.
       */
      const dt = Math.min((t - ultimoTempo) / 1000, 0.05)
      ultimoTempo = t
      program.uniforms.uTime.value += 0.1 * dt

      renderer.render({ scene: mesh })
    }

    ultimoTempo = performance.now()
    idAnimacao = requestAnimationFrame(atualizar)
    renderer.render({ scene: mesh })
    ctn.appendChild(gl.canvas)

    return () => {
      cancelAnimationFrame(idAnimacao)
      window.removeEventListener('resize', redimensionar)
      if (ctn.contains(gl.canvas)) ctn.removeChild(gl.canvas)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [color, speed, scale, noiseIntensity, rotation])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
```

- [ ] **Step 2: Fazer o Hills ler do config**

Em `src/wallpapers/Hills.jsx`, trocar a constante `SILK_DARK` e os literais por
`WALLPAPER.silk` / `WALLPAPER.iridescence`, e `CROSSFADE_LIMITE_MS` por
`WALLPAPER.crossfade.limiteSegurancaMs`.

O `<Silk>` passa a poder ser chamado sem props (os defaults já vêm do config),
mas manter as props explícitas se isso deixar o `Ceu` mais legível — o que
importa é não haver mais número literal.

- [ ] **Step 3: Verificar que o three saiu do caminho crítico**

```bash
cd frontend && rm -rf dist && npm run build
for f in dist/assets/*.js; do
  printf "%-40s gz %8s\n" "$(basename $f)" "$(gzip -c "$f" | wc -c)"
done
grep -c "IcosahedronGeometry" dist/assets/index-*.js
grep -c "IcosahedronGeometry" dist/assets/Crystal-*.js
```

Esperado:
- `index.js` cai de 432 KB gzip para algo perto de **230 KB**
- `Crystal.js` **cresce muito** (de 21 KB para ~180–200 KB gzip): é onde o
  `three` foi parar, e agora ele é de fato lazy
- `IcosahedronGeometry`: **0** no index, **≥1** no Crystal

Se o `IcosahedronGeometry` continuar no index, sobrou algum import estático de
`three` — procurar com
`grep -rn "from 'three'\|@react-three" src/ --include=*.jsx`.

- [ ] **Step 4: VERIFICAÇÃO VISUAL CRÍTICA — o wallpaper escuro**

Esta é a verificação mais importante do plano inteiro.

1. Rodar `npm run dev` no tema **escuro**
2. Comparar lado a lado com `baseline/` — cor, escala das dobras, ângulo do
   padrão, granulado
3. **Observar em movimento por pelo menos 30 segundos:** a velocidade do
   escorrimento tem de ser a mesma
4. Desligar e religar a animação pelo botão da bandeja: o padrão deve **congelar
   e retomar do mesmo ponto**, sem salto
5. Redimensionar a janela: o padrão deve reagir como antes
6. Trocar para o tema claro e voltar: o crossfade deve funcionar nos dois
   sentidos
7. Fazer boot completo: o wallpaper religa quando a cortina começa a subir

**Se a imagem diferir em qualquer aspecto, reverter a tarefa e reportar o que
diferiu.** É preferível manter os 432 KB a mudar o wallpaper.

- [ ] **Step 5: Verificar build e lint**

```bash
cd frontend && npm run lint && npm test && npm run build
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/backgrounds/Silk.jsx frontend/src/wallpapers/Hills.jsx
git commit -m "perf: portar o Silk de @react-three/fiber para ogl

O Silk e um quad de tela cheia com um shader -- nao usa camera, cena, luz nem
material. Mas era importado estaticamente pela cadeia App->Desktop->Hills, o
que punha o three inteiro no caminho critico e anulava o React.lazy do
Crystal: IcosahedronGeometry e MeshPhysicalMaterial estavam no bundle
principal, e o chunk 'lazy' so carregava a cola do drei.

O ogl ja era dependencia (o Iridescence usa) e faz exatamente isso. Shader
identico byte a byte; mudou o runtime e a forma do vertex shader (o Triangle
do ogl da position/uv como vec2). O tempo continua acumulado por quadro, e nao
lido do relogio absoluto, para pausar congelar de verdade em vez de saltar ao
despausar.

O three agora vive so no chunk do Crystal, que ja era lazy."
```

---

### Task 14: `React.lazy` por app + `react-markdown` lazy + `manualChunks`

**Files:**
- Modify: `src/os/registry.js`
- Modify: `src/os/desktop/Window.jsx`, `src/os/mobile/MobileApp.jsx`
- Modify: `src/apps/AssistantApp.jsx`
- Create: `src/apps/AssistantMarkdown.jsx`
- Modify: `vite.config.js`
- Modify: `src/App.jsx` — a quebra em `os/shell/` só acontece na Tarefa 16, que
  vem depois desta

**Interfaces:**
- Consumes: `useIdleTask` (Tarefa 7), `CERIMONIA.idle` (Tarefa 5).
- Produces: `export function prefetchAppsDoDesktop()` em `os/registry.js`.

- [ ] **Step 1: Tornar `component` lazy no registry**

Em `src/os/registry.js`, trocar os 9 imports estáticos por `lazy()`:

```jsx
import { lazy } from 'react'

/**
 * O COMPONENTE É LAZY; O RESTO DO REGISTRY NÃO.
 *
 * `id`, `route`, `titleKey`, `icon`, `defaultSize`, `parent` e as flags são
 * resolvidos SINCRONAMENTE — o deriveInitial() do WindowManagerContext lê a URL
 * e monta o estado inicial antes do primeiro render, e as rotas, os títulos e
 * os ícones aparecem na taskbar e no menu Iniciar sem que o app tenha montado.
 * Só o `component` pode esperar.
 *
 * Antes, os 9 apps e todo o CSS deles entravam no bundle inicial, mesmo para
 * quem abrisse um só.
 */
const AboutApp = lazy(() => import('../apps/AboutApp'))
const ProjectsApp = lazy(() => import('../apps/ProjectsApp'))
const ProjectDetailApp = lazy(() => import('../apps/ProjectDetailApp'))
const HistoryApp = lazy(() => import('../apps/HistoryApp'))
const DevicesApp = lazy(() => import('../apps/DevicesApp'))
const TerminalApp = lazy(() => import('../apps/TerminalApp'))
const ReadmeApp = lazy(() => import('../apps/ReadmeApp'))
const AssistantApp = lazy(() => import('../apps/AssistantApp'))
const SettingsApp = lazy(() => import('../apps/SettingsApp'))
```

O array `APPS` e `getApp()` ficam como estão.

- [ ] **Step 2: Acrescentar o prefetch**

No fim de `src/os/registry.js`:

```jsx
/**
 * Busca em segundo plano os apps que estão a um clique de distância — os que
 * têm ícone na área de trabalho. Sem isto, o primeiro clique pagaria o download
 * do chunk no meio da interação, que é exatamente o engasgo que o prefetch do
 * cristal já resolvia para o 3D.
 */
export function prefetchAppsDoDesktop() {
  import('../apps/AboutApp')
  import('../apps/ProjectsApp')
  import('../apps/HistoryApp')
  import('../apps/DevicesApp')
  import('../apps/TerminalApp')
  import('../apps/ReadmeApp')
  import('../apps/AssistantApp')
}
```

- [ ] **Step 3: Chamar o prefetch quando o boot terminar**

No `Shell` (ou `App.jsx`), junto do prefetch do cristal:

```jsx
useIdleTask(prefetchAppsDoDesktop, {
  ...CERIMONIA.idle.prefetchCristal,
  ativo: fase !== 'boot',
})
```

- [ ] **Step 4: Envolver em Suspense**

Em `src/os/desktop/Window.jsx`:

```jsx
<div className="marocos-window-body">
  {/* fallback nulo de propósito: com o prefetch em idle o chunk já chegou, e
      um spinner que pisca por 20ms é pior que nada. */}
  {AppComponent ? (
    <Suspense fallback={null}>
      <AppComponent params={win.params} />
    </Suspense>
  ) : null}
</div>
```

Mesma coisa em `src/os/mobile/MobileApp.jsx`, no `.marocos-mobile-app-body`.
Importar `Suspense` de `react` nos dois.

- [ ] **Step 5: Isolar o react-markdown**

Criar `src/apps/AssistantMarkdown.jsx`:

```jsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * O renderizador de markdown das respostas do agente, isolado num módulo
 * próprio para poder ser carregado sob demanda.
 *
 * react-markdown + remark-gfm + micromark somam dezenas de KB e serviam a UM
 * dos nove apps — e, dentro dele, só depois da primeira resposta. O estado
 * vazio do assistente é texto puro e não precisa de nada disso.
 */
const AssistantMarkdown = ({ children }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
    }}
  >
    {children}
  </ReactMarkdown>
)

export default AssistantMarkdown
```

Em `src/apps/AssistantApp.jsx`: remover os imports de `react-markdown` e
`remark-gfm`, acrescentar
`const AssistantMarkdown = lazy(() => import('./AssistantMarkdown'))`, e trocar
o `<ReactMarkdown ...>` da bolha por:

```jsx
<Suspense fallback={<span>{msg.content}</span>}>
  <AssistantMarkdown>{msg.content}</AssistantMarkdown>
</Suspense>
```

O fallback mostra o texto cru: se o chunk atrasar, o visitante lê a resposta
sem formatação em vez de ver um vazio.

Aproveitar e trocar `API_BASE` e o `60000` por `REDE.apiBase` e
`REDE.timeoutChatMs`.

- [ ] **Step 5B: Corrigir o auto-scroll do assistente**

Ainda em `src/apps/AssistantApp.jsx`, o efeito de rolagem é:

```jsx
useEffect(() => {
  if (chatEndRef.current) {
    chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }
}, [messages, isLoading, loadingStatus])
```

`loadingStatus` muda a cada evento SSE de status vindo do agente — e cada
mudança **reinicia uma animação de scroll suave** que a anterior nem terminou.
Numa resposta com quatro ou cinco passos de status, a área de mensagens fica
tremendo.

Separar os dois casos:

```jsx
/**
 * Mensagem nova rola suave; troca de texto de status ajusta a posição direto.
 *
 * Antes os dois casos caíam no mesmo `behavior: 'smooth'`, e como o status muda
 * a cada evento SSE do agente, cada evento reiniciava uma animação de scroll
 * que a anterior ainda não tinha terminado.
 */
useEffect(() => {
  chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}, [messages, isLoading])

useEffect(() => {
  if (!loadingStatus) return
  chatEndRef.current?.scrollIntoView({ behavior: 'auto' })
}, [loadingStatus])
```

Verificar no navegador enviando uma pergunta ao assistente (exige o backend no
ar em `localhost:8000`; se não estiver disponível, verificar ao menos que a
lista de mensagens rola normalmente com as sugestões do estado vazio).

- [ ] **Step 6: `manualChunks`**

Em `vite.config.js`:

```js
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor estável: muda com upgrade de dependência, não com código de
          // app. Separado para que editar um componente não invalide o cache
          // dele no navegador do visitante.
          vendor: ['react', 'react-dom', 'motion'],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
})
```

- [ ] **Step 7: Medir**

```bash
cd frontend && rm -rf dist && npm run build
for f in dist/assets/*.js dist/assets/*.css; do
  printf "%-40s gz %8s\n" "$(basename $f)" "$(gzip -c "$f" | wc -c)"
done
```

Esperado: um chunk por app, um `vendor`, um `Crystal` grande, e o `index`
abaixo de ~200 KB gzip. Registrar a tabela.

- [ ] **Step 8: Verificação funcional e visual**

1. Abrir cada um dos 9 apps — nenhum pode piscar em branco perceptivelmente
2. **Deep link:** `/sobre`, `/projetos`, `/projetos/bussola-v2`, `/contato`,
   `/assistente`, `/config`, `/leia-me`, `/jornada`, `/stack` — todos têm de
   abrir a janela certa, com o título certo na taskbar
3. Voltar/avançar do navegador
4. **Aba de rede com throttling "Slow 3G":** abrir um app e confirmar que o
   fallback nulo não deixa a janela quebrada
5. Assistente: enviar uma mensagem e conferir que o markdown renderiza; e que o
   estado vazio aparece sem baixar o chunk de markdown

- [ ] **Step 9: Commit**

```bash
git add frontend/src frontend/vite.config.js
git commit -m "perf: carregar cada app sob demanda e isolar o react-markdown

Os 9 apps eram importados estaticamente pelo registry, entao todo componente
de app e todo CSS de app entrava no bundle inicial mesmo para quem abrisse um
so. Agora so o campo component e lazy -- rota, titulo, icone e tamanho padrao
continuam sincronos, porque o deriveInitial le a URL antes do primeiro render.

O prefetch em ociosidade busca os apps que tem icone na area de trabalho, para
o primeiro clique nao pagar o download no meio da interacao.

react-markdown + remark-gfm + micromark serviam a um app e, dentro dele, so
depois da primeira resposta: foram para um modulo proprio, carregado sob
demanda, com o texto cru como fallback."
```

---

# FASE 4 — Acabamento (Tarefas 15–16)

---

### Task 15: Correções pontuais de acessibilidade e seletor [VISUAL]

**Files:**
- Modify: `src/os/desktop/Taskbar.jsx`, `src/os/desktop/Taskbar.css`
- Modify: `src/index.css`

- [ ] **Step 1: Popup da bandeja — de `<div onClick>` para `<button>`**

Em `src/os/desktop/Taskbar.jsx`, os três `.tray-menu-item` são `<div onClick>`
sem `role`, `tabIndex` nem handler de teclado — inalcançáveis por teclado.
Trocar por `<button type="button">`, preservando classes e conteúdo.

Em `src/os/desktop/Taskbar.css`, acrescentar à regra `.tray-menu-item` o reset
que um `<button>` precisa para ficar **visualmente idêntico**:

```css
.tray-menu-item {
  /* ...as declarações que já existem... */
  /* Reset de botão: o elemento virou <button> para ficar alcançável por
     teclado, e sem isto o navegador aplicaria fundo, borda e fonte próprios. */
  width: 100%;
  background: none;
  border: none;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
```

- [ ] **Step 2: `.show-desktop-line`**

O `<div onClick={minimizeAll}>` ganha `role="button"`, `tabIndex={0}`,
`aria-label={os.taskbar.showDesktop}` e handler de teclado para Enter e Espaço.
Não virar `<button>`: é uma faixa decorativa de 1px e o reset mudaria a
aparência.

- [ ] **Step 3: NÃO mexer no seletor amplo do index.css — cortado do plano**

O plano previa trocar

```css
.theme-light h1, .theme-light h2, .theme-light h3, .theme-light h4,
.theme-light p, .theme-light span, .theme-light li, .theme-light div {
  color: var(--text-primary);
}
```

por `.theme-light { color: var(--text-primary); }`, deixando a cor descer por
herança.

**Cortado por decisão do dono do projeto, antes da execução.** O seletor é caro
e feio, mas funciona e não quebra nada hoje; o ganho é de elegância. O risco é
o oposto: o seletor antigo **vence a herança** em qualquer elemento cujo
ancestral declare outra cor, então a troca pode espalhar texto com cor errada
pelo tema claro inteiro — e, sem automação de navegador nesta execução, não há
como verificar isso de forma confiável.

Fica registrado como dívida técnica conhecida. Acrescentar ao `index.css`, sobre
a regra:

```css
/* DÍVIDA CONHECIDA: esta lista de oito seletores casa com quase toda a árvore
   e reaplica cor em cada nó. O certo seria declarar a cor no container e deixar
   herdar -- mas esta regra vence a herança onde um ancestral declara outra cor,
   entao a troca precisa de uma varredura visual do tema claro inteiro para nao
   espalhar texto com a cor errada. Trocar so com essa verificacao em maos. */
```

Os Steps 1 e 2 (acessibilidade de teclado) continuam valendo — são ganho real e
verificável sem navegador.

- [ ] **Step 4: Verificação por teclado**

Com `Tab` e `Enter`, sem mouse: alcançar e acionar os três itens do popup da
bandeja (em tela estreita) e o "mostrar área de trabalho".

- [ ] **Step 5: Verificar build**

```bash
cd frontend && npm run lint && npm test && npm run build
```

- [ ] **Step 6: Commit**

```bash
git add frontend/src
git commit -m "fix: tornar o popup da bandeja alcancavel por teclado

Os tres itens do popup eram <div onClick> sem role nem tabIndex -- invisiveis
para quem navega por teclado. Viraram <button> com reset de estilo para a
aparencia nao mudar. O mesmo para o 'mostrar area de trabalho', que continua
<div> por ser uma faixa de 1px, mas ganhou role, tabIndex e handler.

O seletor amplo .theme-light h1,...,div fica como esta, com um comentario
registrando a divida: troca-lo por heranca precisa de varredura visual do tema
claro inteiro, que esta execucao nao tem como fazer."
```

---

### Task 16: Reorganizar as pastas

Por último de propósito: é churn de diff puro e não deve se misturar com
mudança de comportamento no histórico.

**Files:** movimentações (ver Step 1) + `src/App.jsx` quebrado em `os/shell/`.

- [ ] **Step 1: Mover os arquivos com `git mv`**

```bash
cd frontend/src

mkdir -p wallpaper brand effects content i18n os/shell styles

git mv wallpapers/Hills.jsx wallpaper/Wallpaper.jsx
git mv components/backgrounds/Silk.jsx wallpaper/Silk.jsx
git mv components/backgrounds/Iridescence.jsx wallpaper/Iridescence.jsx
git mv components/backgrounds/Iridescence.css wallpaper/Iridescence.css
git mv components/Crystal.jsx brand/Crystal.jsx
git mv components/effects/DecryptedText.jsx effects/DecryptedText.jsx

git mv data/projects.js content/projects.js
git mv data/journey.js content/journey.js
git mv data/tech.js content/tech.js
git mv data/contact.js content/contact.js
git mv data/content.js content/profile.js
git mv data/os.js i18n/os.js
git mv data/startMenu.js i18n/startMenu.js

git mv index.css styles/index.css
```

Remover os diretórios vazios: `wallpapers/`, `components/`, `data/`.

- [ ] **Step 2: Renomear o componente Hills para Wallpaper**

Em `wallpaper/Wallpaper.jsx`, renomear o componente `Hills` para `Wallpaper` e
ajustar o export. Atualizar o comentário do topo — o nome descrevia cristas SVG
que o próprio cabeçalho diz terem sido removidas.

- [ ] **Step 3: Corrigir todos os imports**

```bash
cd frontend/src
grep -rn "from '.*wallpapers/Hills'\|from '.*components/backgrounds\|from '.*components/Crystal'\|from '.*components/effects\|from '.*data/" --include=*.jsx --include=*.js .
```

Atualizar cada um. Atenção aos que usam `import()` dinâmico — o prefetch do
cristal em `Shell`/`Desktop.jsx` e o `lazy()` em `Ceremony.jsx` e `AboutApp.jsx`
apontam para `components/Crystal`.

Atualizar também `main.jsx` (`./index.css` → `./styles/index.css`).

- [ ] **Step 4: Quebrar o App.jsx**

Mover para `src/os/shell/`:

- `Shell.jsx` — o componente `Shell`, com os comentários de performance
  preservados na íntegra
- `BoasVindas.jsx` — o componente `BoasVindas` e o bloco de comentário que
  explica por que a decisão é travada na primeira execução válida
- `TituloDaPagina.jsx` — o componente `TituloDaPagina`

`src/App.jsx` fica só com:

```jsx
import { LanguageProvider } from './contexts/LanguageContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Shell from './os/shell/Shell'

const App = () => (
  <LanguageProvider>
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  </LanguageProvider>
)

export default App
```

**Preservar integralmente todos os blocos de comentário.** Eles registram
medições reais (85ms contra 42ms, ~580ms de main thread) que não podem ser
reconstituídas se forem perdidas.

- [ ] **Step 5: Verificar**

```bash
cd frontend && npm run lint && npm test && npm run build
```

Esperado: build sem erro de resolução e tamanhos praticamente idênticos aos da
Tarefa 14 — mover arquivo não muda bytes.

- [ ] **Step 6: Verificação visual completa**

Percorrer os 7 itens do **Protocolo de verificação visual**. Um import
dinâmico apontando para caminho antigo não quebra o build, mas quebra em
runtime — testar especificamente o boot (cristal), o "Sobre" (cristal) e os 9
apps.

- [ ] **Step 7: Commit**

```bash
git add -A frontend/src
git commit -m "refactor: reorganizar as pastas do frontend

Hills vira Wallpaper -- o nome descrevia cristas SVG removidas ha tempo.
components/backgrounds e wallpapers viram wallpaper/, porque a divisao nao
correspondia a diferenca nenhuma. data/ se separa em content/ (portfolio) e
i18n/ (as 325 linhas de string de interface do os.js, que nao sao 'data').
App.jsx, que tinha 211 linhas e tres componentes, vira os/shell/.

Movimentacao pura: nenhum byte de bundle muda."
```

---

## Encerramento

- [ ] **Comparar com a linha de base**

```bash
cd frontend && rm -rf dist && npm run build
for f in dist/assets/*.js dist/assets/*.css; do
  printf "%-40s raw %8s  gz %8s\n" "$(basename $f)" "$(stat -c%s "$f")" "$(gzip -c "$f" | wc -c)"
done
```

Acrescentar a tabela final a `docs/superpowers/plans/baseline.md`, ao lado da
inicial. Alvo: `index.js` de 432 KB para ~200 KB gzip.

- [ ] **Atualizar o CLAUDE.md**

A seção "Frontend" do `CLAUDE.md` na raiz descreve a arquitetura antiga
(`HomePage`, `Navbar`, sections, Lenis, `StartMenu.jsx` como chat, URL da API
hardcoded). Está desatualizada desde antes desta refatoração. Atualizar para a
estrutura real: shells desktop/mobile, registry, `config/system.js`, e a nova
árvore de pastas.

- [ ] **Commit final**

```bash
git add -A
git commit -m "docs: atualizar CLAUDE.md e registrar o ganho de bundle medido"
```
