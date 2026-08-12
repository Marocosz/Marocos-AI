# A "Jornada" como player: a barra de progresso é a linha do tempo

**Data:** 2026-08-12
**Branch:** `feat/windowsmorphism`
**Escopo:** o conteúdo da janela `/jornada` (`apps/HistoryApp.*`), os dados que a
alimentam (`content/journey.js`), o ícone do app em `os/registry.js`, e duas
durações em `config/system.js`. O chrome de explorador da janela **não muda** — a
metáfora de player vive só dentro do conteúdo.

---

## 1. Por que trocar o design atual

O app de hoje é um `git log` vertical: seis cards empilhados, cada um com hash,
badge de tipo, data, título, organização, descrição e tags. Funciona, é honesto e
usa bem os dados. O problema não é o card — é **o que a lista vertical não consegue
dizer**.

Os anos das seis entradas são **2018 · 2019 · 2022 · 2024 · 2025 · PRÓXIMO**. Numa
lista de cards de altura igual, esses números são só texto: o visitante lê "2019" e
"2022" em cards vizinhos idênticos e não sente os três anos entre eles. A informação
mais interessante da trajetória — que ela **acelera** — está nos vãos, e a lista
apaga os vãos.

---

## 2. A ideia central, e ela não é a capa nem os botões

**A barra de progresso do player é a linha do tempo real da carreira.** Num player o
scrubber mapeia posição → tempo; aqui mapeia posição → ano, com cada marcador em
posição proporcional:

```
2018        2019            2022        2024   2025      PRÓXIMO
 ●───────────●───────────────●───────────●──────●──────────◌
 └─ 1 ano ──┘└──── 3 anos ───┘└─ 2 anos ─┘└1 ano┘
```

Os vãos passam a carregar informação. É o argumento inteiro da refatoração; todo o
resto do vocabulário de player existe para tornar essa barra legível — uma barra de
tempo sozinha, sem "agora tocando", sem controles e sem lista de faixas, seria um
gráfico, não uma interface.

**Consequência de projeto:** se a barra não for cronológica da esquerda para a
direita, ela não significa nada. Isso conflita com uma decisão documentada em
`journey.js` (*"ordem: do mais recente para o mais antigo… é o que responde primeiro
à pergunta que o visitante traz"*). A saída é separar **estrutura** de **atenção**:

- a barra e a lista de faixas são **cronológicas**;
- a entrada **selecionada ao abrir** é a mais recente.

O recrutador lê "Desenvolvedor Full Stack & IA · 2025—hoje" de imediato, com o
playhead perto da ponta direita, e vê que existe uma trajetória inteira atrás. As
duas decisões sobrevivem.

---

## 3. Onde o `git log` sobrevive

O design atual tem uma identidade que não se joga fora: hash monoespaçado, `[tipo]`,
"Autor:". **Players têm mostrador técnico** — bitrate, codec, formato —, e é
exatamente ali que esses dados cabem:

```
commit f4c1a09 · release · 5 tags
```

Uma linha em mono no rodapé do painel de "agora tocando". A voz da máquina do projeto
continua, e `hash` e `type` não viram dado órfão.

---

## 4. O layout

Área útil: **700 × 520** (a janela é 884×626, a maior dos apps de explorador).

```
┌ conteúdo 700×520 ──────────────────────────────────┐
│ // 04. / JORNADA PROFISSIONAL                      │  cabeçalho (AppHeader md)
│ Histórico de Versões                               │
│ Sete anos em seis faixas. Os vãos entre elas…      │
│                                                     │
│ ┌────────┐  RELEASE · Supporte Logística · Inovação│  1 AGORA TOCANDO
│ │        │  Desenvolvedor Full Stack & IA          │
│ │  2025  │                                          │
│ │  hoje  │  Desde agosto de 2025 estou na área de  │
│ │        │  inovação, construindo soluções full…   │
│ └────────┘  (FastAPI)(React)(Docker)(LangChain)     │
│  a capa     commit f4c1a09 · release · 5 tags       │
│                                                     │
│ 2018 ●────●──────●────●──●──────◌ PRÓXIMO          │  2 A LINHA DO TEMPO
│                                                     │
│      ⏮   ‹   ▶   ›   ⏭              5 de 6         │  3 CONTROLES
│                                                     │
│ // FAIXAS                                           │  4 LISTA DE FAIXAS
│ 1 ● 2018       Primeiro emprego                     │
│ 2 ● 2019—2021  Técnico em Eletrônica                │
│ 3 ● 2022—2026  Gestão da Informação na UFU          │
│ 4 ● 2024       Virada: IA Generativa                │
│ 5 ● 2025—hoje  Desenvolvedor Full Stack & IA    ◀── │
│ 6 ◌ PRÓXIMO    O que vem depois                     │
└─────────────────────────────────────────────────────┘
```

**Duas colunas quando maximizado**, pelo mesmo mecanismo do "Sobre este PC":
`container-type: inline-size` na raiz do app e `@container` nos descendentes — a
pergunta é sobre a largura da JANELA, não da tela. A partir de ~760px de conteúdo o
"agora tocando" + barra + controles ficam à esquerda e a lista de faixas vira trilho
à direita. E como no "Sobre", a raiz leva teto de largura com `margin-inline: auto`,
para maximizar em 2560px **reorganizar** em vez de esticar.

### 4.1 A capa

**O ano em tipo gigante com gradiente** — `clamp()` em `cqi`, peso 900, com o mesmo
`linear-gradient(135deg, --text-primary 30%, --accent-color)` e `background-clip:
text` que o nome do herói do "Sobre" e os números de destaque já usam. É a voz do
projeto, é honesto (o ano É a identidade da entrada) e não precisa de asset novo.

A caixa da capa é quadrada, com `--sup-fundo` + `--sup-borda` e a `--sup-lavagem`
tingida pela **cor da categoria** em vez do acento — é a única superfície do app que
foge do acento, e pelo motivo já documentado no projeto: cor de categoria significa
algo, e seguir o tema faria `init` e `release` trocarem de cor.

### 4.2 A linha do tempo

- Trilho de 2px com `--sup-borda`; a parte já percorrida (até o marcador ativo) em
  gradiente do acento.
- Um `<button>` por entrada, posicionado por `left: N%`. **Não é um slider
  arrastável** — é uma lista de saltos, e é isso que ela anuncia para leitor de tela
  (`aria-label` com ano + título, `aria-current` no ativo). Um `role="slider"` aqui
  mentiria: não há valor contínuo, há seis destinos.
- O marcador do `futuro` é **vazado** (só contorno): é o único que não aconteceu.
- Setas ← e → no container movem entre entradas, para quem navega por teclado.
- O playhead desliza entre marcadores com transição; no passeio automático essa
  transição é o que dá a sensação de "tocando".

### 4.3 Controles

`⏮` primeiro · `‹` anterior · `▶/⏸` passeio · `›` próxima · `⏭` último, mais um
contador "5 de 6".

**O passeio automático é "percorrer do início"**, e o rótulo diz isso: ele salta para
2018 e caminha para frente, uma entrada a cada `MOVIMENTO.jornadaPasseioS`. Não dá
laço — uma carreira não repete. Qualquer interação pausa.

**Ele desaparece com o Movimento desligado**, e essa é uma divergência consciente em
relação à luz de hover do "Sobre este PC" (que *para* em vez de sumir). A distinção:
a luz é **retorno** — sem ela o visitante perde o único sinal de que o alvo é
clicável, então ela precisa continuar acendendo. O passeio é **o próprio movimento**;
sem ele o botão não tem função nenhuma, e um botão que não faz nada é pior que
nenhum botão.

### 4.4 Lista de faixas

Linhas compactas (~32px): número, marcador na cor da categoria, data em mono,
título. A ativa fica com a faixa de destaque do sistema (`--sup-faixa` +
`--sup-faixa-borda`) — a mesma marca de "este é o item em destaque" que a lateral do
explorador e as ações do "Sobre" usam. Hover: a luz que percorre a borda, também já
no sistema.

Reaproveitar as duas coisas é o ponto: **o app novo não inventa vocabulário**, ele
consome o que os dois últimos trabalhos deixaram no sistema.

---

## 5. Os dados

### 5.1 Dois campos novos em `journey.js`

A posição na barra precisa de número. Hoje só existe `date`, que é string de exibição
("2019 — 2021", "PRÓXIMO") — derivar posição de string de exibição é frágil e quebra
na primeira tradução.

| campo | o quê |
|---|---|
| `ano` | number. O ano de **início** da entrada — é ele que responde "quando isso começou", que é o que a posição na linha significa |
| `futuro` | boolean, só na entrada de roadmap. Marcador vazado, posição 100% |

Valores: 2018, 2019, 2022, 2024, 2025, e `futuro: true` no `step-next`.

### 5.2 A função de posição, e ela é lógica pura

```js
posicaoNaLinha(entradas, entrada, anoAtual) => 0..100
```

- `inicio` = menor `ano` entre as entradas não-futuras
- `fim` = o maior entre `anoAtual` e o maior `ano`
- `futuro` → 100
- resto → `((ano - inicio) / (fim - inicio)) * 100`

Com 2018..2026: **0 · 12,5 · 50 · 75 · 87,5 · 100**. `anoAtual` entra por parâmetro
(não por `new Date()` dentro da função) para o teste ser determinístico — mesma
decisão de `idadeEm()` em `profile.js`.

Vai para `content/journey.test.js` (novo), com os casos: as seis posições, o
`futuro` em 100, o clamp, e o invariante de que existe **exatamente uma** entrada
futura. Vitest é `environment: 'node'` e só lógica pura — é exatamente o tipo de
coisa que cabe lá.

**Limite aceito e documentado:** duas entradas no mesmo ano se sobrepõem na barra. Não
acontece hoje, e forçar espaçamento mínimo faria a barra mentir sobre o tempo — que é
a única coisa que ela existe para dizer.

### 5.3 O `subtitle` está falso

Hoje: *"Do mais recente para o mais antigo, como todo log que se preze."* Com a
estrutura cronológica isso deixa de ser verdade. Vira uma linha que aponta para o que
a barra faz — algo como *"Sete anos em seis faixas. Os vãos entre elas também
contam."*, nos dois idiomas.

### 5.4 O que NÃO muda

`sectionLabel` continua `"04. / JORNADA PROFISSIONAL"`. O prefixo numerado é resto da
landing page de rolagem e aparece em vários `content/*.js` (`contact.js` tem `"06. /
CONECTAR"`); trocar a convenção é decisão de projeto inteiro, não desta refatoração.

O `title` (`"Histórico de Versões"`) **fica**, mesmo sendo redundante com a barra de
título da janela. Removê-lo exigiria deixar de usar `ui/AppHeader`, e isso mataria a
variante de escala `--md`, cujo único consumidor é este app — o cabeçalho de
`AppHeader.css` diz explicitamente que colapsar as escalas é "decisão de design, a ser
tomada de propósito". Fica para essa decisão, não para esta.

---

## 6. O ícone

`GitCommitVertical` → **`Disc3`** (lucide, verificado presente). Um vinil lê como
player na hora, e "disco" também é *registro de algo* — duplo sentido que casa com um
log de carreira.

**O ícone do XP não muda.** `ui/xpIcons.jsx` tem `history: PastaRelogio`, e pasta com
relógio é o idioma de "documentos recentes" daquela época. O preset XP cita o
período, não o design atual — trocar por um Windows Media Player desenhado à mão é
trabalho de SVG que não serve à refatoração.

**Custo:** o ícone de `history` aparece na grade do desktop, no menu Iniciar, na
lateral do explorador (que todos os seis apps de explorador mostram), na porta do
guia do "Sobre este PC" e na taskbar quando aberto. Isso rebaselina quase toda cena
— é o aviso que a skill do frontend já dá para app novo, e vale igual para ícone
trocado. **Conferir diff por diff: o único pixel diferente deve ser o glifo, e
nenhum ícone pode ter mudado de posição.**

---

## 7. Configuração

Duas durações em `MOVIMENTO`, publicadas pela ponte:

| chave | valor | o quê |
|---|---|---|
| `jornadaPasseioS` | 6 | quanto cada entrada fica na tela no passeio automático |
| `jornadaTrocaS` | 0.32 | a transição entre entradas (painel e playhead) |

6s é passeio, não leitura: a descrição tem 50-70 palavras e pedir ~20s por entrada
faria o passeio durar dois minutos. Quem quer ler para o passeio e lê.

Medidas internas (tamanho da capa, altura do trilho, tamanho do marcador) ficam
literais no CSS com o porquê ao lado, como `.about-crystal` já faz — a camada de
config é dona de blur, raio, altura de chrome e duração, não de layout interno de
componente.

---

## 8. Acessibilidade

- **Nada de `<audio>` nem `role="slider"`.** Não há áudio e não há valor contínuo;
  anunciar qualquer um dos dois seria mentir para tecnologia assistiva.
- Marcadores e faixas são `<button>` de verdade, com `aria-label` de ano + título e
  `aria-current` no ativo.
- Os controles têm rótulo dizendo **a ação** ("ver entrada anterior"), não "faixa
  anterior" — visualmente é um player, semanticamente é uma trajetória.
- O título do "agora tocando" leva `aria-live="polite"`, para quem navega por teclado
  saber que a troca aconteceu.

---

## 9. Arquivos

| arquivo | mudança |
|---|---|
| `content/journey.js` | `ano` + `futuro` por entrada; `subtitle` reescrito nos dois idiomas; `posicaoNaLinha()` |
| `content/journey.test.js` | **novo** — posições, clamp, invariantes dos dados |
| `apps/HistoryApp.jsx` | reescrito como player |
| `apps/HistoryApp.css` | reescrito |
| `os/registry.js` | ícone `Disc3` |
| `config/system.js` | `MOVIMENTO.jornadaPasseioS`, `jornadaTrocaS` |
| `config/cssBridge.js` | `--cfg-jornada-*` |
| `config/system.test.js` | asserções das duas durações |
| `.claude/skills/marocos-os-frontend/SKILL.md` | o que este trabalho deixar de padrão novo |

`rotas.spec.js` continua válido: a rota, o título da taskbar (que vem do `i18n`, não
do `journey.js`) e o seletor `.history-app` não mudam.

---

## 10. Verificação

```powershell
cd frontend;         npm run lint; npm test
cd frontend/visual;  npm run build:frontend; npm test
```

**Rebaseline esperado:** `jornada` e `jornada-claro` (o app inteiro), mais quase toda
cena por causa do ícone. Conferir diff por diff — e cuidado com a diferença entre as
duas causas: no app é mudança de design, nas outras cenas o único pixel diferente
deve ser o glifo.

**O que a suíte não vê, e tem de ser conferido no navegador:**

- o passeio automático rodando e pausando em interação;
- o passeio **ausente** com o Movimento desligado e com `prefers-reduced-motion`;
- `:hover` e `:focus-visible` dos marcadores, das faixas e dos controles;
- navegação por ← → na barra;
- a janela maximizada em tela grande (duas colunas, medida limitada);
- os presets XP e sóbrio, e um não roxo (Brasa) — se algo continuar violeta, ficou
  literal em algum lugar;
- o tema claro inteiro.

---

## 11. Fora de escopo, de propósito

- **Arrastar a barra.** Os marcadores já são destinos clicáveis, e um scrubber
  arrastável que salta para seis posições fixas é mais mecanismo que informação.
  Fica como possível continuação.
- **Equalizador, waveform, capa animada.** Decoração sem informação.
- **Tocar áudio de verdade.**
- **Mexer no chrome de explorador da janela** — a metáfora é do conteúdo.
- **Trocar o `sectionLabel` numerado** e **colapsar as escalas do `AppHeader`** —
  as duas são decisões de projeto inteiro (§5.4).
