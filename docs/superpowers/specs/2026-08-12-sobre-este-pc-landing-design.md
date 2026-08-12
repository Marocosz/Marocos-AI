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

## 8. Mudanças durante a execução

Registradas aqui porque este documento é a única memória do *porquê*, e três delas
contradizem seções acima. **Onde houver conflito, esta seção está certa.**

### 8.1 O redesenho: preenchimento é ação

A primeira implementação seguiu §1.3 ao pé da letra — deu superfície visível a
todo bloco — e o resultado foi rejeitado pelo dono do projeto: *"o design dessa
tela está horrível, nada original, parece um site qualquer… fundos chapados dos
itens?"*.

Ele estava certo, e o diagnóstico da spec estava incompleto. Sete blocos com
mesma largura, mesmo raio, mesma borda e mesmo fundo produzem um empilhamento de
retângulos — a janela ficou o elemento mais fraco da tela num sistema cujo resto
tem voz (a assinatura enorme da área de trabalho, o mono da máquina, os filetes do
explorador, o cristal). **O problema não era o contraste do card. Era o card.**

A regra que substitui §1.3 e vale para o arquivo inteiro:

> **Preenchimento é ação.** Exatamente dois elementos têm fundo próprio — o botão
> de contato e a porta do Marcos Virtual. Os dois são ações. Todo o resto é
> estrutura: tipografia, filete, trilho, régua.

Os tokens `--sup-*` continuam existindo e valendo; passaram a marcar as duas ações
em vez de pintar tudo. O que mudou de forma:

| bloco | era | virou |
|---|---|---|
| herói | card com fundo, cristal à esquerda | sem caixa, nome em `clamp(2rem, 6.6cqi, 3.3rem)` com gradiente, cristal de 150px à direita |
| stack | 9 pílulas com fundo, em duas linhas | ticker de uma linha, mono micro, filete acima e abaixo, nomes separados por `·` |
| guia | grade 2×2 de cards | lista de linhas com ícone, chevron e filete — o padrão de lista do próprio explorador |
| números | 3 cards centralizados | registro: número grande à esquerda, rótulo à direita, filete por linha |
| ficha | card com fundo | registro puro, com linha pontilhada |

**Três tentativas erradas no herói, e cada uma errou diferente** — as três estão
documentadas em `.about-heroi` no CSS, porque a terceira é uma pegadinha de CSS
que vale a pena não repetir: `grid-row: 1 / -1` conta a partir do fim do grid
**explícito**, e sem `grid-template-rows` o explícito tem zero linhas — o span
colapsa e o cristal prende a linha 1 em 150px.

### 8.2 O carrossel de stack volta

Decisão do dono do projeto. Voltou com dois consertos sobre a versão que existia
antes de ser removida:

1. **O laço fecha sem salto.** A versão antiga triplicava a lista e animava até
   `translateX(-50%)` — com três cópias isso é uma cópia e meia, então a cada volta
   havia um pulo visível. O percurso certo é uma cópia: `-33.3333%`. E o vão entre
   os nomes teve de sair do `gap` para dentro do item (`margin-right`), senão a
   conta não fecha: 27 itens e 26 vãos, cujo terço é 9 itens + 8,67 vãos.
2. **Respeita o interruptor de Movimento**, não só `prefers-reduced-motion` — era
   o mesmo defeito que o cristal deste app já teve. Com movimento desligado a
   faixa não congela cortada: o JSX manda a lista uma vez e ela quebra linha.

A duração vive em `MOVIMENTO.marqueeStackS` e chega por `--cfg-marquee-stack`.

### 8.3 "Este computador" sai da janela

Decisão do dono do projeto: processador, vídeo, memória e café ficam para o Marcos
Virtual responder quando alguém perguntar. O `profile.md` continua com a seção
inteira, então o assistente responde igual — o fato não saiu do site, saiu desta
janela.

`profile.maquina` foi **removido** de `content/profile.js`: era duplicata do
`profile.md` cujo único consumidor era essa ficha. `machineLabel` saiu do `i18n`
pelo mesmo motivo.

### 8.4 A janela volta para 804

§3 cresceu esta janela para 884 **porque** ela ia ter duas fichas lado a lado. Com
a ficha do hardware fora, o motivo caiu, e o `ANTES.about` do `system.test.js`
volta a `{620, 520}`. Janela maior sem conteúdo que a peça é só mais vidro para o
sistema desfocar.

### 8.5 As doses da superfície moram no config

A pedido do dono do projeto (*"todas cores variáveis e etc devem ser setadas no
arquivo de config global e apenas alterada por lá, o resto só usa elas"*), as
porcentagens e alphas da superfície saíram do `tokens.css` e viraram
`VIDRO.superficie.{noite,dia}` em `config/system.js`, publicadas pela ponte como
`--cfg-sup-*`. O `tokens.css` só monta a cor a partir delas; os literais que
sobraram lá são os fallbacks de `var()`, obrigatórios por convenção do projeto.

Os dois temas vão juntos, com sufixo `-claro` para o dia — mesmo padrão de
`--cfg-veu-alfa`. Publicar um valor só, do tema atual, faria os dois blocos de
tema lerem a mesma dose (as duas regras coexistem na folha), que é o acoplamento à
ordem da ponte que já quebrou o crossfade do wallpaper.

Um teste novo em `system.test.js` guarda que as duas listas de doses têm as mesmas
chaves, e que porcentagem é string e alpha é número — trocar um pelo outro
invalida a cor em silêncio.

### 8.6 Medida e tela cheia

Apontado pelo dono do projeto: *"quando em tela cheia, se for uma tela grande, os
textos ficam muito horizontais, o que é ruim de ler"*. Três mudanças, e as três
eram necessárias:

1. **`@container` em vez de `@media`.** O que estava escrito era um bug latente num
   sistema de janelas: os breakpoints respondiam à VIEWPORT, então janela estreita
   em tela grande nunca colapsava a grade e janela maximizada em tela pequena
   colapsava sem precisar. `container-type: inline-size` no `.about-app` faz a
   pergunta ser sobre a largura real do conteúdo.
2. **Teto de medida.** `.about-app` para em 1040px e centraliza; a prosa tem
   `max-width` em `ch`. Sem isso, maximizar em 1920 dava ~1700px de conteúdo e mais
   de 160 caracteres por linha — maximizar *piorava* a leitura.
3. **Duas colunas a partir de 720px de conteúdo**, e a divisão significa algo: a
   coluna larga é a voz humana (bio, guia) e o trilho estreito é a voz da máquina
   (números, registro do sistema). São as duas vozes tipográficas que o projeto já
   separa, agora também no espaço — e o trilho ecoa o painel de detalhes do chrome
   de explorador, que é onde este sistema já põe metadado.

Medido em janela maximizada a 1920: app 1040px centralizado, bio 553px, nome
52,8px, corpo em `744px 268px`. Um teste funcional novo em `rotas.spec.js` fixa
essas promessas — asserção numérica e não captura, porque o que importa é a
geometria.

### 8.7 A faixa de destaque, e uma deduplicação

Pedido do dono do projeto: as duas ações do app devem usar *"o fundo igual quando o
item da lateral bar da janela (mas sem a linha lateral esquerda), ou seja, um
gradiente, mas com uma borda da mesma cor do fundo"*.

Esse gradiente já existia — é o `.explorer-lugar--aqui`, o item onde a janela está,
e o comentário dele explica por que é gradiente e não retângulo chapado: o fundo
nasce da borda esquerda e se apaga para a direita, lendo como luz entrando pela
quina. **Chapado empataria com o hover**, e "destacado" deixaria de ser
distinguível de "o mouse está aqui" — que é, aliás, a mesma crítica que derrubou a
primeira versão desta tela.

Virou `--sup-faixa` + `--sup-faixa-borda` em `tokens.css`, com as paradas em
`VIDRO.superficie.*.alfaFaixa`, e **o `ExplorerChrome.css` passou a consumir o
token** — os alphas eram literais lá e passariam a existir em dois arquivos. A
regra `.theme-light .explorer-lugar--aqui` foi removida junto: o token já é
redefinido por tema. As sete cenas que fotografam a lateral do explorador
continuaram verdes, o que confirma que a troca foi byte-idêntica.

Duas diferenças em relação ao explorador, as duas deliberadas:

- **sem o traço de 3px na borda esquerda** — lá ele marca "a janela está NESTE
  lugar", que é informação de navegação; aqui não há lugar sendo marcado;
- **a borda é a cor mais forte da própria faixa**, e é o que dá o efeito: como o
  fundo desaparece para a direita, a borda continua fechando o contorno onde o
  gradiente já sumiu, e o bloco parece recortado da luz em vez de pintado.

Um bug que apareceu no caminho e vale registrar: declarar só `background-image`
num `<button>` deixa a cor de fundo padrão do navegador (`buttonface`, um cinza
claro) aparecendo por baixo do gradiente — o texto do botão ficou ilegível.
`background-color: transparent` explícito é obrigatório. O `.about-door` não sofria
disso porque usa `background: none`, que zera as duas camadas.

### 8.8 Os três números voltaram

Decisão explícita do dono do projeto: o conteúdo de "Especificações do sistema"
volta a ser **4+ serviços freelance**, **4+ anos de experiência** e **20+ projetos
totais**.

São exatamente os três que uma passada anterior removeu — o cabeçalho de
`content/profile.js` documentava a remoção sob o argumento de que eram "números que
ninguém consegue verificar, sob rótulos que não dizem nada". O dono é quem sabe a
própria contagem, e a chamada é dele; o cabeçalho do arquivo foi reescrito para
registrar a ida **e** a volta, para a próxima pessoa não "consertar" de novo.

**O aviso que fica:** os três números não estão no `profile.md`, então o Marcos
Virtual não consegue corroborá-los se alguém perguntar. Não é contradição — é
ausência —, mas se um deles for questionado o conserto é acrescentar o fato à base,
não apagar do site.

### 8.9 Formado, e em todos os lugares

O dono concluiu a graduação em **agosto de 2026**. Trocado em cinco lugares:

| arquivo | era | virou |
|---|---|---|
| `backend/data/knowledge_base/profile.md` | "Atualmente, encontro-me no 8º período" | "Concluí a graduação em agosto de 2026" |
| `backend/data/resumo_marcos.md` | "no último período da graduação, no 8º período" | "Concluí a graduação em agosto de 2026" |
| `content/profile.js` · `bio_full` (EN e PT) | "Estou no 8º período de Gestão da Informação" | "Sou formado em Gestão da Informação pela UFU" |
| `content/profile.js` · `stats` | "8º / Período na UFU" | substituído pelos três números de §8.8 |
| `content/journey.js` | `date: "2022"` | `date: "2022 — 2026"`, com a formatura na descrição |

Este arquivo já disse "formado" uma vez, foi corrigido para "8º período" — porque
na época era o que a base dizia — e agora volta a dizer formado porque é verdade. O
cabeçalho do `profile.js` registra o vaivém, e é o tipo de campo em que um
comentário vale mais que o valor.

**O `profile.md` mudou, então o assistente só passa a responder certo depois de um
deploy com `FORCE_REINGEST=true`** — o site e o RAG divergem até lá.

### 8.10 O hover é uma luz que percorre a borda, e é o hover inteiro

Pedido do dono do projeto: *"muda pouco a cor de fundo e afins (bem pouco), e o
maior efeito vai ser uma borda brilhante que percorre em loop"* — e, na revisão
seguinte, *"tirar no hover apenas o efeito da luz na borda, sem mudar a cor de
fundo e afins"*.

**Fundo, borda e cor de texto não mudam no hover.** O efeito é um gradiente cônico
girando dentro de uma máscara em forma de anel, em duas camadas: núcleo fino e
nítido (`::after`), halo largo e desfocado (`::before`). Cônico porque o ângulo é o
que faz a luz acompanhar os cantos arredondados — com linear ela deslizaria reto e
sumiria nas quinas. Duas camadas porque só o núcleo lê como contorno tracejado e só
o halo lê como borrão sem direção.

Três coisas que valem registro:

1. **`@property` é obrigatório.** Uma custom property comum é string para o motor
   de animação: interpolar `0turn → 1turn` seria trocar texto, e o gradiente
   pularia em vez de girar. Verificado empiricamente — o ângulo saiu de 41,5° para
   ~118° em 500ms, que é o que prova a interpolação numérica.
2. **A luz é mais clara que a superfície, e isso inverte por tema.** Acento puro lê
   como borda colorida, não como luz. De noite `--sup-luz-nucleo` puxa o acento
   para o branco (dose em `VIDRO.luzDaBorda.brilho`); de dia é o acento CHEIO,
   porque sobre campo pálido o brilho lê por saturação e não por luminância — a
   mesma lição que `--cer-nebulosa` já pagou.
3. **`--sup-realce` foi removido do sistema.** Ele era o realce de fundo do hover e
   perdeu o único consumidor: saíram o token (nos três blocos de tema) e a dose
   `VIDRO.superficie.*.realce`. Token órfão é o que a próxima pessoa tenta manter
   em sincronia sem saber que ninguém lê.

**Sem movimento a luz não desaparece — ela para.** O anel continua acendendo no
hover, parado no ângulo inicial, tanto com o interruptor de Movimento desligado
como com `prefers-reduced-motion`. Apagar o único sinal de hover para respeitar uma
preferência de *movimento* seria tirar informação de quem só pediu menos animação.
O interruptor passou a chegar por uma classe única na raiz do app
(`about-app--sem-movimento`), porque este app já tinha três coisas que se movem e
cada uma havia inventado o próprio jeito de obedecer.

**O custo medido, e a decisão consciente:** o anel vive em `inset: -1px` para cobrir
a borda, o que exigiu tirar o `overflow: hidden` do botão de contato. Isso mudou o
caminho de rasterização do subtree e deslocou **88 subpixels** nas arestas dos
quatro ícones de canal, só na cena `mobile-sobre`. Determinístico (88 exatos em três
execuções) e isolado por eliminação: com os pseudo-elementos desligados o diff
continuava 88; com o `overflow` de volta ia a zero. Rebaselinada com a causa escrita
em `cenas.js`, ao lado da cena, para não custar uma segunda investigação.

### 8.11 Ajustes finais, e um terceiro número envelhecido

**A borda fininha no hover.** Pedida junto com o feixe: ele é um arco curto girando,
então em qualquer instante três quartos do contorno estão apagados. A borda fecha a
forma e diz "o item inteiro é o alvo" enquanto a luz diz "e ele está aceso". Entra e
sai com as mesmas durações assimétricas da luz — se apagasse antes, o bloco piscaria.

**O padrão dos presets virou declarado.** `PRESET_PADRAO = { dark: 'ametista',
light: 'ceu-claro' }`, a pedido do dono do projeto (o dia era `perola` por ser o
primeiro do array). O padrão deixou de ser consequência da ordem da grade das
Configurações: reordenar amostras não pode trocar em silêncio a primeira impressão do
site. Há teste guardando que o id declarado existe na lista do tema.

Custo: **as sete cenas claras rebaselinaram inteiras** — trocar o preset repinta
wallpaper, acento, chrome e cristal. Verificado que a repintura é coerente, não
quebrada.

**O divisor do guia e a ficha.** Os divisores entre as quatro perguntas recuaram nas
pontas (pseudo-elemento com `inset` no lugar de `border-top`, que vai sempre de ponta
a ponta), com o recuo amarrado ao padding da porta por uma variável local. E a ficha
"Este sistema" perdeu o divisor entre linhas: com ele havia dois traços horizontais
por linha e o bloco lia como planilha; o pontilhado que liga rótulo e valor já
conduz o olho.

**O terceiro número que envelheceu.** A ficha exibiu "PRESETS 18" e o balão da área
de trabalho dizia "Doze papéis de parede" — dois números para o mesmo fato, e nenhum
certo: `noite.length + dia.length` conta o XP duas vezes (ele é o mesmo objeto nas
duas listas). Virou `contarPresets()`, que conta por identidade, e os dois lugares
passaram a ler dela — o balão com `%d`, igual ao que já foi feito com o "36 testes"
do leia-me.

São três agora, no mesmo padrão: 36 testes, Doze papéis, 8º período. **Quantidade na
interface não se escreve à mão** — a regra entrou na skill.

### 8.12 Dois fatos que a spec errou

- **§1.6 disse que `profile.skills_highlight` perdeu o consumidor.** Falso:
  `TerminalApp.jsx` usa a lista no `neofetch`. O que de fato não tinha consumidor
  era o campo `color` de `contact.js` — esse ponto de §1.6 continua válido.
- **§1.8 e §5.3 falam em 38 testes.** Eram 38 quando a spec foi escrita; a entrega
  acrescentou dois (o botão de contato e o Sobre maximizado), então o valor final
  de `SISTEMA.testes` é **40** — 21 visuais + 19 funcionais.

---

## 9. Fora de escopo, de propósito

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
