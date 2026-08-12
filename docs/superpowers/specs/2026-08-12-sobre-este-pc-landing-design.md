# "Sobre este PC": de diálogo winver a página de entrada

**Data:** 2026-08-12
**Branch:** `feat/windowsmorphism`
**Escopo:** o conteúdo da janela `/sobre` (`apps/AboutApp.*`), os dados que a
alimentam (`content/profile.js`, `content/sistema.js` novo, `content/contact.js`,
`i18n/os.js`), um par de tokens de superfície em `os/tokens.css`, e o tamanho da
janela em `os/registry.js`. Nenhum outro app muda de aparência.

---

## 1. Diagnóstico

Lido em `apps/AboutApp.jsx`, `apps/AboutApp.css`, `content/profile.js`,
`content/contact.js`, `i18n/os.js`, `ui/AppHeader.*`, `styles/index.css`,
`os/tokens.css`, `os/registry.js`, `config/system.test.js` e as cenas do
regressor.

### 1.1 Existe um nível de título só

As três `<section>` usam `.about-section-title`: `'Courier New'`, `0.75rem`,
caixa alta, `--text-secondary`, com `// ` em acento no `::before`. Isso é
**rótulo de campo**, não título — e é o mesmo para as três, então nada na janela
anuncia "esta é a ideia principal" contra "este é um detalhe".

E a hierarquia já existe no projeto: `ui/AppHeader.jsx` é exatamente
**eyebrow mono/acento + título Poppins 900 + subtítulo**. `DevicesApp` e
`HistoryApp` usam. O "Sobre este PC" é o único app que não usa — sendo o app que
**abre sozinho** para quem chega sem deep link (`os/shell/BoasVindas.jsx`), ou
seja, o único que quase todo visitante lê.

### 1.2 A janela nunca diz o nome

`Marcos Rodrigues` não aparece em pixel nenhum do conteúdo. Aparece em
`os.titles.*` (título da aba), no `copyright` do terminal e no menu Iniciar —
nunca no corpo do "Sobre". `profile.js` **não tem campo de nome**. Quem entra por
deep link em `/sobre` lê um cargo e uma frase, e sai sem saber de quem é o site.

### 1.3 O contraste, com a conta feita

| tema | corpo da janela | card | resultado |
|---|---|---|---|
| escuro | `--win-body-bg` = acento 10% em `#000`, a 60% ≈ `rgba(17,8,25,.6)` | `--card-bg` = `rgba(10,10,10,.6)` | duas camadas translúcidas quase idênticas; o card só existe pela borda em `rgba(255,255,255,.08)` |
| claro | `--win-body-base` = acento 4% em `#fff` ≈ `#fbf8ff`, a 55% | `rgba(255,255,255,.4)` | o card é **mais claro** que um fundo já quase branco |

Não falta sombra: falta **superfície**. E o tema claro é o pior dos dois casos,
que é a lição que `--icon-tile-bg` já pagou em `os/tokens.css` ("alpha de tema
escuro não se reaproveita no tema claro").

### 1.4 Zero links de saída

Nenhum. O contato existe como **porta para o Terminal** — dois cliques e
entender a metáfora antes de achar o LinkedIn.

### 1.5 O feature mais forte não está no guia

As quatro portas são `projects`, `history`, `readme`, `terminal`. O **Marcos
Virtual** — grafo LangGraph com RAG, guarda de responsabilidade, SSE nó a nó — é
o que de fato separa este portfólio de um template, e não é porta nenhuma.

### 1.6 Conteúdo morto

`profile.skills_highlight` (9 itens) perdeu o consumidor quando o marquee saiu, e
continua exportado. `contact.js` tem um campo `color` por canal que **nenhum
componente lê** — o Terminal renderiza `<Icon size={14} />` sem cor (o
`entry.color` que ele usa vem de `terminal.logs`, não de `items`).

### 1.7 Ritmo plano

Cinco blocos empilhados com o mesmo `gap: 22px` e o mesmo peso visual. Página de
entrada tem cadência: bloco grande, faixa fina, grade, faixa fina.

### 1.8 Um número errado, de passagem

`i18n/os.js` diz "E 36 testes olham para tudo isso" (e "And 36 tests…"). O real é
**38**: 21 cenas em `visual/cenas.js` + 17 funcionais em `visual/rotas.spec.js`
(9 gerados pelo laço sobre `ROTAS` + 8 avulsos). A skill do frontend já diz 38; o
texto que o visitante lê ficou para trás. Como esta entrega vai **exibir esse
número numa segunda janela**, ele passa a ter uma fonte única.

---

## 2. Decisões tomadas (dono do projeto, 2026-08-12)

1. **Página de entrada completa**, e a janela cresce `804 → 884` de largura.
2. **Fatos novos que entram:** nome + local + idade; status "aberto a
   freelance"; "este sistema em números".
3. **Marcos Virtual entra no guia**, em destaque.
4. **Superfície elevada nasce no sistema, mas só o "Sobre" consome** nesta
   entrega.
5. **Sem links externos na janela** — correção explícita à proposta original:
   > "é só ter um link que abre a janela do terminal que tem os links… não quero
   > repetir informação, quero que ele use elas mandando a pessoa ir até a
   > determinada janela com elas (mas que a landing page dê um mínimo de contexto
   > e seja bonita a forma que ela mostra, o botão etc)."

   Consequência de projeto: o contato **sai do guia e sobe para o herói** como
   ação. Nenhum handle, nenhuma URL, nenhum `mailto:` no "Sobre" — um alvo só,
   com os quatro ícones de canal como *contexto*, abrindo o Terminal. É o que
   evita a repetição sem esconder o contato abaixo de duas dobras.

---

## 3. A janela, bloco a bloco

Área útil: **700 × 520** (884 − 184 de lateral do explorador; 626 − 106 das três
faixas).

```
┌ Sobre este PC ─────────────── 884 × 626 ──────────────────┐
│ ╔═══════════════════════════════════════════════════════╗ │  1 HERÓI
│ ║ [cristal]   DESENVOLVEDOR FULL STACK & IA             ║ │    superfície
│ ║   190px     Marcos Rodrigues                          ║ │    elevada +
│ ║             Construo sistemas com IA que chegam em     ║ │    aresta de luz
│ ║             produção. Este site é um deles.           ║ │
│ ║             ● aberto a freelance · Uberlândia – MG    ║ │
│ ╚═══════════════════════════════════════════════════════╝ │
│ ┌───────────────────────────────────────────────────────┐ │  2 AÇÃO
│ │ ✉  in  ⌥  ✱   Falar comigo                        →  │ │    um alvo,
│ │               E-mail, LinkedIn, GitHub e Discord —    │ │    abre o
│ │               no terminal                            │ │    Terminal
│ └───────────────────────────────────────────────────────┘ │
│ (Python)(FastAPI)(LangChain)(Docker)(React)(PostgreSQL)   │  3 STACK
│ ─────────────────────────────────────────────── (filete)  │
│ // QUEM ESCREVE ISTO                                      │  4 BIO
│ Cheguei aqui pelo hardware.                               │    eyebrow +
│ │ corpo da bio, 0,85rem secundário…                       │    headline +
│ ─────────────────────────────────────────────── (filete)  │    corpo
│ // POR ONDE COMEÇAR                                       │  5 GUIA
│ Quatro perguntas, quatro janelas.                         │    grade 2×2
│ [ Ele sabe construir? ][ Há quanto tempo?      ]          │
│ [ E este site aqui?   ][ Consigo perguntar…  ★ ]          │  ★ destacado
│ ─────────────────────────────────────────────── (filete)  │
│ // ESPECIFICAÇÕES                                         │  6 NÚMEROS
│ [  2018  ][   8º   ][    2    ]                           │
│ ─────────────────────────────────────────────── (filete)  │
│ // ESTA MÁQUINA          │ // ESTE SISTEMA                │  7 DUAS FICHAS
│ Notebook  Acer Nitro V15 │ Apps              9            │
│ Processador  Ryzen 7…    │ Testes           38            │
│ Vídeo  RTX 4050 · 6 GB   │ Shaders           2            │
│ …                        │ Presets           N            │
│                          │ Versão        3.0.1            │
└───────────────────────────────────────────────────────────┘
```

### 3.1 Herói

Superfície elevada, aresta de luz de 1px no topo, cristal à esquerda (desktop
só, mesmo adiamento de `CERIMONIA.montarCristalAboutMs` de hoje).

| linha | conteúdo | voz |
|---|---|---|
| eyebrow | `profile.role` | mono, acento, caixa alta |
| nome | `Marcos Rodrigues` | Poppins 900, 1,75rem, **gradiente** |
| destaque | `profile.bio_highlight` | Poppins 700, 1,05rem, primário |
| meta | `● aberto a freelance · Uberlândia – MG · 22 anos` | 0,72rem, secundário |

O gradiente do nome é **a receita que já existe** em `.about-spec-number`
(`linear-gradient(135deg, var(--text-primary) 30%, var(--accent-color) 100%)`
com `background-clip: text`). Não é gradiente novo: é o gesto de "número de
destaque" do projeto aplicado ao nome, que aqui é o destaque.

O pontinho de status pulsa, e respeita **as duas** chaves: `prefers-reduced-motion`
no CSS **e** o interruptor de Movimento (`isAnimated` do `ThemeContext`) no JSX.
É a lição registrada no cabeçalho do `AboutApp.jsx` — o cristal era o único
elemento do sistema que ignorava o próprio interruptor, e não se repete o erro.

### 3.2 Ação — um alvo, zero informação repetida

Um `<button>` de largura cheia que chama `abrir('terminal')`. Dentro dele:

- os quatro ícones de `contact.js` (`Mail`, `Linkedin`, `Github`,
  `MessageSquare`), `aria-hidden`, tingidos com a cor de **marca** — a exceção já
  documentada na skill (cores de categoria/marca não seguem o tema, porque
  significam algo);
- rótulo Poppins 700: "Falar comigo";
- sub 0,75rem: "E-mail, LinkedIn, GitHub e Discord — no terminal";
- `→` à direita.

Nenhum endereço, nenhum handle, nenhuma URL. O contexto é *quais* canais existem;
o conteúdo continua morando no Terminal.

**Correção necessária em `contact.js`:** o GitHub tem `color: "#fff"`. O campo
nunca teve consumidor, então isso não é bug hoje — passa a ser no instante em que
este botão o usar, porque branco literal desaparece no tema claro. Vira
`'var(--text-primary)'`, com o porquê ao lado: a marca do GitHub é monocromática
por definição, e uma marca monocromática num sistema com dois temas tem de ser
token, não literal.

### 3.3 Faixa de stack

Seis chips de `profile.skills_highlight` — pílula de 999px (não interativo, é a
regra de raio da skill), estáticos, legíveis no próprio ritmo.

**Tensão registrada:** o marquee saiu por três razões — decorativo, ilegível em
movimento, e repetia o app de Stack. Chip estático conserta as duas primeiras,
não a terceira. Entra assim mesmo, como **faixa de prova de uma linha** entre o
herói e a bio, e o app de Stack continua sendo a porta que aprofunda. Se depois
parecer redundante, o corte é uma linha de JSX.

### 3.4 Bio, guia, especificações, fichas

- **Bio:** eyebrow + headline ("Cheguei aqui pelo hardware." / "I got here
  through hardware.") + `bio_full`. A borda esquerda de acento de hoje fica.
- **Guia:** eyebrow + headline + grade **2×2**. Portas: `projects`, `history`,
  `readme`, `assistant`. O `terminal` sai (subiu para o herói).
  A quarta porta — o Marcos Virtual — é destacada por **tinta**, não por
  largura: borda de acento a 40% + lavagem tingida. Grade limpa, sem célula
  vazia, e o destaque não distorce o ritmo.
  A pergunta dele: "Consigo perguntar direto a ele?" / "Can I just ask him?".
- **Especificações:** eyebrow **sem headline** — é ficha técnica, e a regra de
  corte (§4.2) manda. Três cards em superfície elevada com lavagem tingida; o
  gradiente do número fica como está.
- **Duas fichas lado a lado:** `// ESTA MÁQUINA` (o `profile.maquina` de hoje,
  com os *dotted leaders*) e `// ESTE SISTEMA`, novo. Abaixo de 620px viram uma
  coluna, como as outras grades do app já fazem.

---

## 4. Sistema

### 4.1 Tokens novos — e a armadilha que eles evitam

Em `os/tokens.css`, **dentro de `.theme-dark` e de `.theme-light`**, ao lado de
`--win-body-base`:

```css
--sup-fundo:    color-mix(in srgb, rgb(var(--accent-rgb)) 16%, var(--win-body-base));
--sup-borda:    color-mix(in srgb, rgb(var(--accent-rgb)) 26%, transparent);
--sup-luz:      linear-gradient(90deg, rgb(var(--accent-rgb) / 0.55), transparent 72%);
--sup-lavagem:  linear-gradient(160deg, rgb(var(--accent-rgb) / 0.14), transparent 70%);
--filete-secao: linear-gradient(90deg, rgb(var(--accent-rgb) / 0.45), transparent);
```

(no tema claro `--sup-fundo` usa 8%: sobre base branca, 16% empastelaria.)

Três propriedades desta escolha, e todas são o motivo dela:

1. **Deriva do que já inverte por tema.** `--win-body-base` é o único token que
   cada tema, cada preset sóbrio e o XP já definem para si. Uma superfície
   derivada dele acerta em todos eles de graça.
2. **É opaca de propósito.** Card opaco dentro de janela translúcida é a mesma
   lógica que `--icon-tile-bg` já paga: o contraste deixa de depender de qual
   região do wallpaper caiu atrás. E custa zero — sem `backdrop-filter`, que é o
   que `Window.css` documenta ter derrubado de 20px para 6px.
3. **Segue o preset.** Tudo sai de `--accent-rgb`, então Brasa, Papel e o resto
   repintam junto. Nenhum literal.

**A armadilha:** estes tokens **não podem ser declarados em `:root`**. A
substituição de uma custom property acontece no elemento onde ela é *declarada*,
não onde é usada — e `--win-body-base` só existe em `.theme-dark`/`.theme-light`.
Declarado em `:root`, o `color-mix` receberia um `var()` inválido, viraria
guaranteed-invalid, e a superfície simplesmente não pintaria. É o mesmo motivo
por que `--win-body-bg` e `--win-body-solid` já são declarados duas vezes lá.

**Os dois modos especiais:**

| modo | o que precisa |
|---|---|
| `.modo-sobrio` | **nada.** Ele só troca o alpha de `--win-body-bg`, não a base — a superfície derivada continua correta |
| `.theme-light.modo-xp` | **uma linha:** `--sup-fundo: #fff`, `--sup-borda: #b7b7a4`, `--sup-luz: none`, `--sup-lavagem: none`, `--filete-secao` em `#b7b7a4`. Lá o card é branco por citação, e lavagem violeta sobre bege quebraria o Luna |

Os valores de partida (16% / 8% / 26%) são **para calibrar** olhando as capturas
dos dois temas. O critério: o card tem de ler como superfície própria sem virar
um retângulo escuro colado no vidro.

### 4.2 Tipografia — três níveis e uma regra de corte

| nível | receita | de onde vem |
|---|---|---|
| eyebrow | mono 700, 0,68rem, caixa alta, `letter-spacing: 2px`, **`--accent-color`**, `// ` no `::before` | `.app-header--sm .app-header-eyebrow`, com o `// ` que o projeto já assina |
| headline | Poppins 700, 1,05rem, `--text-primary` | faixa "título de card" da escala |
| nome (herói) | Poppins 900, 1,75rem, gradiente | **estende a escala** — hoje o topo é 1,6rem |
| corpo | 0,85rem, `--text-secondary` | escala |
| meta | 0,72rem | escala |

Mudança em relação a hoje: o eyebrow passa a ser **todo em acento** (hoje o texto
é `--text-secondary` e só o `// ` é acento). É a receita do `AppHeader`, ou seja o
padrão do sistema — e é o que faz título e texto pararem de se parecer.

**A regra de corte, que é o que impede isto de virar enfeite:** só ganha headline
a seção que faz uma **afirmação**. Bio e guia ganham. "Especificações", "Esta
máquina" e "Este sistema" ficam **só com eyebrow** — são ficha técnica, e a skill
é explícita: decida pela voz. O "Sobre este PC" continua sendo um winver; ele só
deixou de ser *apenas* isso.

**Sem componente novo em `ui/`.** As classes ficam locais no `AboutApp.css`, com
um comentário apontando que a receita é a do `ui/AppHeader.css`. `AppHeader`
emite `<h2>` e estas seções são `<h3>`; forçar o componente aqui torceria a
semântica por um ganho de três declarações. No dia em que um segundo app pedir o
par eyebrow+headline em nível de seção, promove-se para `ui/`.

### 4.3 Gradiente e cor, e por que cada um está ali

| onde | valor | por quê |
|---|---|---|
| nome | gradiente de texto 135° | receita já existente (`.about-spec-number`), aplicada ao maior destaque da janela |
| número da spec | inalterado | já era |
| filete entre seções | `--filete-secao`, 1px | divisor que esvanece — o gesto mais "página de entrada" e o mais barato do repertório |
| aresta de luz | `--sup-luz`, `::before` de 1px | a mesma leitura de `--win-highlight`, agora tingida: luz batendo na quina de uma superfície |
| lavagem do card | `--sup-lavagem` | resolve contraste e "cor" no mesmo movimento, e segue o preset |
| ícones do botão de ação | cor de marca de `contact.js` | exceção documentada: marca significa algo |

---

## 5. Conteúdo — o que entra, de onde vem, e o que é derivado

Fonte da verdade: `backend/data/knowledge_base/profile.md`. Se este documento e
ele discordarem, ele está certo — divergir é o site contradizendo o próprio
assistente.

### 5.1 Campos novos em `content/profile.js`

| campo | valor | linha no `profile.md` |
|---|---|---|
| `nome` | `Marcos Rodrigues` | 5 |
| `local` | `Uberlândia – MG` | 5 ("atualmente moro sozinho em Uberlândia – MG") |
| `nascimento` | `'2003-12-14'` | 5 |
| `status` | "aberto a freelance" / "open to freelance" | 329 ("Aberto a propostas de projetos Freelance… estou empregado atualmente") |

**A idade é derivada, não escrita.** `idadeEm(nascimento, hoje)` — função pura
em `content/profile.js`, com teste em `content/profile.test.js` (o vitest roda
`environment: 'node'` e só lógica pura, então é exatamente o tipo de coisa que
cabe lá). Escrever "22 anos" é escrever um número que fica errado em 14/12/2026.

O texto de `status` é **neutro e fiel à base**: ele está empregado e aberto a
proposta. Não diz "disponível", que sugeriria outra coisa.

### 5.2 `content/sistema.js` — novo

A ficha técnica do próprio site, que é a outra metade do que "Sobre este PC"
promete.

| linha | valor | origem |
|---|---|---|
| Apps | 9 | **derivado** de `APPS.length` |
| Presets | N | **derivado** de `Object.keys(PRESETS).length` |
| Testes | 38 | literal **conferido** |
| Shaders | 2 | literal (Silk + Iridescence) |
| Versão | 3.0.1 | literal, o mesmo do banner do terminal |

Os dois derivados não conseguem mentir: saem do registry e do config em runtime.
Os literais levam, no comentário do arquivo, **como reconferir**: contar
`{ nome:` em `visual/cenas.js` (cenas visuais) e os `test(` avulsos + as entradas
de `ROTAS` em `visual/rotas.spec.js` (funcionais).

O número de apps é injetado pelo `AboutApp`, não importado dentro de
`content/` — `content/` guarda dados de portfólio e não deve passar a depender de
`os/`.

### 5.3 O 36 → 38, com fonte única

`SISTEMA.testes` passa a ser a **única** origem do número. O título da seção do
Leia-me vira template (`'E %d testes olham para tudo isso'` /
`'And %d tests watch all of it'`) e o `ReadmeApp` interpola. As duas janelas
deixam de poder discordar.

**Este número se fixa por último.** A entrega acrescenta um teste de rota
(§7), então o total muda durante o trabalho. Acertar antes é garantir que ele
volte a estar errado; é uma linha, no fim, com a suíte verde.

### 5.4 Texto novo, nos dois idiomas

Todas as chaves novas de `os.about.*` entram em EN e PT — a convenção do
`i18n/`. As perguntas do guia mudam de conjunto (sai `terminal`, entra
`assistant`), então o bloco `guide` é reescrito nos dois.

---

## 6. Arquivos

| arquivo | mudança |
|---|---|
| `frontend/src/apps/AboutApp.jsx` | árvore reescrita: herói, ação, stack, bio, guia 2×2, specs, duas fichas |
| `frontend/src/apps/AboutApp.css` | reescrito sobre os tokens novos + os três níveis tipográficos |
| `frontend/src/os/tokens.css` | 5 tokens × 2 temas + o bloco de override do XP |
| `frontend/src/content/profile.js` | `nome`, `local`, `nascimento`, `status`, `idadeEm()` |
| `frontend/src/content/profile.test.js` | **novo** — `idadeEm()` (véspera, dia, dia seguinte, ano bissexto) |
| `frontend/src/content/sistema.js` | **novo** — ficha do sistema, derivados + literais conferidos |
| `frontend/src/content/contact.js` | GitHub `#fff` → `var(--text-primary)`, com o porquê |
| `frontend/src/i18n/os.js` | `about.*` novo/reescrito; título do Leia-me vira template `%d` |
| `frontend/src/apps/ReadmeApp.jsx` | interpola `SISTEMA.testes` no título |
| `frontend/src/os/registry.js` | `about.defaultSize.w` 804 → 884 |
| `frontend/src/config/system.test.js` | `ANTES.about.w` 620 → 700, com o motivo escrito |
| `frontend/visual/rotas.spec.js` | teste do botão de contato; comentário sobre a contagem de portas |
| `.claude/skills/marocos-os-frontend/SKILL.md` | tokens de superfície na "linguagem visual"; a escala tipográfica agora vai a 1,75rem |

O `profile.md` **não muda**: nome, local, nascimento e status já estão lá. O
trabalho é espelhar, não acrescentar.

---

## 7. Verificação

```powershell
cd frontend;         npm test        # lógica pura: idadeEm() + o contrato do explorador
cd frontend/visual;  npm run build:frontend; npm test
```

**Rebaseline esperado, e cada um conferido no `npm run report` antes de aceitar:**
`sobre-escuro`, `sobre-claro`, `mobile-sobre`, e as cenas de `menu-iniciar*` —
que são fotografadas com a janela "Sobre" aberta por baixo.

**`rotas.spec.js` continua afirmando `.about-door` = 4, e isso é coincidência:**
saiu o `terminal`, entrou o `assistant`. A asserção segue válida e o teste que
clica "Ele sabe construir?" também, mas o comentário dele precisa dizer *quais*
quatro, senão a próxima pessoa lê um número que não prova o que parece provar.

**O que a suíte é estruturalmente incapaz de ver** (a foto não vê tempo, e nada
cobre estado interativo) — verificar à mão no navegador:

- `:hover` e `:focus-visible` das quatro portas e do botão de ação;
- o pulso do status com o interruptor de **Movimento desligado** (tem de parar) e
  com `prefers-reduced-motion` (idem);
- os presets **XP** e **sóbrio**, e um preset **não roxo** (Brasa) — é o teste que
  pega literal esquecido: se algum pedaço continuar violeta depois da troca,
  ficou literal em algum lugar;
- o tema claro inteiro, que é onde o contraste era pior.

---

## 8. Fora de escopo, de propósito

- **Migrar os outros cinco apps de explorador** para a superfície elevada —
  decisão do dono: o token nasce no sistema, o consumo espalha depois de ver
  funcionando.
- **Links externos na janela** — decisão do dono: um alvo levando ao Terminal.
- **CV em PDF** — não existe arquivo no repositório; seria inventar um link.
- **Componente novo em `ui/`** para eyebrow+headline de seção — um consumidor só
  (§4.2).
- **Abas dentro da janela** — brigaria com o chrome de explorador, que já é a
  navegação da janela.
- **Mexer em `--card-bg`** — é a superfície de conteúdo do projeto inteiro,
  inclusive as três faixas do chrome de explorador, que dependem de ela ser igual
  à do miolo.
