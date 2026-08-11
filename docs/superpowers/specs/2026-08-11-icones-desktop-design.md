# Atalhos da área de trabalho: material, glifo e ritmo

**Data:** 2026-08-11
**Branch:** `feat/windowsmorphism`
**Escopo:** o tile de app (`ui/AppIconButton.*`), a coluna do desktop e a grade
do mobile. Nenhum app é tocado.

---

## 1. Diagnóstico (lido no código e nas duas capturas de referência)

Fonte: `frontend/visual/__screenshots__/wallpaper-escuro.png` e
`wallpaper-claro.png`, mais `ui/AppIconButton.css` e `os/desktop/Desktop.css`.

### 1.1 Os sete tiles são o mesmo tile

`AppIconButton.css:66-73` pinta **um** gradiente para todos:
`linear-gradient(160deg, rgba(168,85,247,.5), rgba(88,28,135,.6))`. A única
diferença entre "Terminal" e "Histórico de Versões" é um glifo lucide de 26px
com traço 1.75 dentro de uma caixa de 56px (`AppIconButton.jsx:22-34`). O
visitante lê o rótulo; não reconhece o ícone. Num SO é o contrário.

### 1.2 Roxo sobre roxo

O gradiente do tile é o mesmo roxo do wallpaper `Silk`. No tema escuro a moldura
quase desaparece; no claro o `Iridescence` é pastel e o tile vira um borrão
acinzentado — o pior dos dois casos.

### 1.3 O ritmo vertical não existe

Com `font-size: 0.72rem` e `line-height: 1.25`, cada linha de rótulo mede
14,4px. Daí:

| item | altura |
|---|---|
| rótulo de 1 linha | 1 + 8 + 56 + 6 + 14,4 + 8 + 1 = **94,4px** |
| rótulo de 2 linhas | **108,8px** |

Hoje são cinco itens de 94,4 e dois de 108,8 ("Histórico de Versões" e
"Gerenciador de Dispositivos"), mais 6 intervalos de 4px: **713,6px**. Alturas
diferentes com `gap` uniforme não produzem grade — produzem uma coluna torta.

### 1.4 O hover pinta o lugar errado

`AppIconButton.css:39-41`: `background: rgba(255,255,255,.12)` no botão de 88px
inteiro. O realce é um retângulo pálido atrás do tile **e do rótulo**, não em
cima do alvo.

### 1.5 A forma não é do projeto

Quadrado arredondado com glifo branco centralizado é o tile padrão de
iOS/Windows 11. O resto do sistema tem voz (a cerimônia, o cristal, o mono como
voz da máquina) e o atalho não participa dela.

---

## 2. Decisões tomadas com o dono do projeto

| pergunta | decisão |
|---|---|
| ambição | **refinar o tile** — mantém quadrado + rótulo |
| superfície | **vidro do sistema** — a matéria das janelas, não um gradiente próprio |
| como diferenciar os sete | **pelo glifo, sem cor nova** |
| rótulo | **legenda curta**, separada do título da janela |

Consequência direta: **nenhuma cor nova entra no projeto.** O acento continua
sendo `--accent-color` (#a855f7).

---

## 3. Material: vidro do sistema, sem o `backdrop-filter`

O tile passa a usar cor semitransparente + `--win-border` + `--win-highlight`,
igual ao corpo de janela. O `backdrop-filter` **não** entra: são sete tiles
sempre visíveis sobre um canvas animado, e atrás de um quadrado de 56px o
gradiente do `Silk` quase não varia — o blur seria invisível e ainda assim
recomporia sete regiões por frame. Cor + borda + highlight é o que lê como
vidro; o wallpaper continua aparecendo por dentro, só sem desfoque.

### 3.1 O tile fica escuro nos dois temas — de propósito

Não pode herdar `--win-body-bg`: no tema claro esse token é vidro **branco**
(`tokens.css:174`). O wallpaper claro tem regiões quase brancas (o canto
inferior direito de `wallpaper-claro.png` é praticamente branco) e um tile
branco desaparece lá. Então o tile ganha tokens próprios em `os/tokens.css`
(camada de chrome do SO), escuros nos dois temas, com o matiz acompanhando o
tema:

| token | escuro | claro |
|---|---|---|
| `--icon-tile-bg` | `rgba(14,9,22,.6)` (= `--win-body-bg` do `.theme-dark`) | `rgba(46,16,101,.92)` (= `#2e1065`, o mesmo do rótulo claro) |
| `--icon-tile-bg-hover` | `rgba(30,20,44,.72)` | `rgba(60,24,120,.96)` |
| `--icon-tile-border` | `1px solid rgba(255,255,255,.22)` | `1px solid rgba(255,255,255,.28)` |

`--win-highlight` é reaproveitado: só existe em `:root`, o tema claro não o
inverte.

**Dois destes valores foram corrigidos depois de olhar a captura**, e os dois
erros valem registro porque são a mesma classe de engano:

1. **O alpha do tema claro começou em 0.62** — o mesmo do escuro — e falhou.
   Sobre o pastel do Iridescence (~`rgb(200,216,232)`) a mistura dá
   `0.62×(46,16,101) + 0.38×(200,216,232)` = **`rgb(105,92,151)`**: um
   cinza-violeta lavado, exatamente o borrão que a seção 1.2 diagnosticou. Alpha
   funciona quando o que está atrás é mais escuro que o tile; de dia ele mistura
   na direção errada. Em **0.92** a conta dá `rgb(58,32,112)`, violeta fundo, e o
   glifo branco recupera o contraste. O preço aceito é que de dia o tile é quase
   sólido, e quem sustenta a leitura de material passa a ser a borda + o
   `--win-highlight`, não a transparência.
2. **A borda do escuro subiu de 0.18 para 0.22.** O tile é pequeno e cai onde o
   `Silk` mandar; nas dobras escuras do shader o fundo do tile e o wallpaper
   chegam os dois perto de `rgb(19,9,32)`, e a única coisa que define a aresta é
   a borda. A janela não tem esse problema porque é grande e tem sombra própria.

A lição transversal: **herdar o alpha de um token de tema escuro para um tema
claro não é reaproveitar valor, é reaproveitar a premissa errada.**

### 3.2 A armadilha do tema claro

`AppIconButton.css:56-65` embrulha o seletor do glifo em `:where()` para **perder
de propósito** do hack global de `styles/index.css:49-58`
(`.theme-light span { color: var(--text-primary) }`). É esse hack — não uma regra
do arquivo — que hoje deixa o glifo escuro no tema claro.

Com o tile escuro em ambos os temas, o glifo precisa ser branco em ambos. Logo o
`:where()` sai (um seletor composto vence o hack por especificidade) e o
comentário de dez linhas que explica por que ele existia **fica falso**. Ele é
reescrito, não deletado: passa a registrar a inversão e o motivo.

---

## 4. Glifo: 26px/1.75 → 32px/2

Em `AppIconButton.jsx`, só as chaves `desktop` e `mobile` de `TAMANHO_ICONE` e
`ESPESSURA_ICONE`. As chaves `dock` e `lista` não mudam — são a variante plana,
que não tem o problema.

Sobra 12px de anel de cada lado no tile de 56px (hoje sobram 15px, e a silhueta
fica frágil). No mobile, 32px em 60px deixa 14px.

**Não vai para `config/system.js`.** O tamanho é prop JSX (`size={}`), não valor
CSS, então não passa pela ponte `--cfg-*`; e o cabeçalho de `AppIconButton.jsx`
documenta que o tamanho vem da variante, não de número livre. Mover
contradiria uma decisão já registrada.

---

## 5. Ritmo: legenda curta e pitch uniforme

### 5.1 A causa são dois rótulos, não o CSS

"Histórico de Versões" e "Gerenciador de Dispositivos" vêm de
`os.windows[titleKey]`, **compartilhado com a barra de título e a taskbar**.
Encurtar lá degradaria o título da janela, que está correto.

Entra um mapa novo em `i18n/os.js`, `iconLabels`, **parcial de propósito**: só
os títulos longos demais para uma linha. Os call sites usam
`os.iconLabels[app.titleKey] ?? os.windows[app.titleKey]`, e o fallback é
load-bearing — um app futuro na área de trabalho sem entrada aqui continua
mostrando o título da janela em vez de `undefined`.

| titleKey | título da janela (PT) | legenda | EN |
|---|---|---|---|
| `history` | Histórico de Versões | **Jornada** (= rota `/jornada`) | **Timeline** |
| `devices` | Gerenciador de Dispositivos | **Stack** (= rota `/stack`) | **Stack** |

Os outros cinco já cabem em uma linha e **não são tocados** — a mudança de copy
fica no mínimo necessário.

### 5.2 A conta, e o que ela realmente permite

Com os sete em uma linha, o pitch fica uniforme em 94,4px: 7 × 94,4 = 660,8px,
mais 6 intervalos.

`intervalo` cai de 4px para 3px em `config/system.js` → coluna de **678,8px**
contra 713,6px de hoje.

O espaço é `100vh − var(--taskbar-h) − folga` = `100vh − 84`. Então:

| | altura de viewport mínima |
|---|---|
| hoje | 797,6px |
| depois | **762,8px** |

**`100vh` é viewport, não tela.** Num 1366×768 real o viewport fica em ~660px
depois do chrome do navegador, e 7 ícones de 94px numa coluna **não caberão
nunca** ali — nem hoje, nem depois. O ganho não é "passa a caber": é baixar o
piso em 35px e, onde ainda quebrar, quebrar via `flex-wrap` em duas colunas de
itens uniformes em vez do 6+1 torto de hoje.

O comentário contado de `Desktop.css:17-24` fala em "sete ícones de 94px". Hoje
isso é verdade para cinco deles; depois passa a ser verdade para todos, e o
comentário é atualizado com os números novos.

---

## 6. Hover e foco

O `background` sai do botão e vai para o glifo: fundo em
`--icon-tile-bg-hover`, borda em `--accent-color`, um halo do mesmo matiz e
`translateY(-1px)`. O `focus-visible` do botão
(`outline: 2px solid var(--accent-color)`) fica como está — está correto para
teclado.

Só o mobile mantém `:active { scale(.94) }`, como hoje.

**O regressor visual não fotografa `:hover`, `:focus-visible` nem `:active`.**
Verificação é leitura de código e navegador, e o relato diz qual dos dois foi.

---

## 7. Camadas

| valor | onde | por quê |
|---|---|---|
| `--icon-tile-bg/-hover/-border` | `os/tokens.css` | chrome do SO |
| `intervalo` dos ícones | `config/system.js` | valor de ajuste, já mora lá |
| tamanho/espessura do glifo | `ui/AppIconButton.jsx` | prop JSX, não passa pela ponte `--cfg-*` (seção 4) |
| `iconLabels` | `i18n/os.js` | string de interface, nos dois idiomas |

Nada em `styles/index.css`.

---

## 8. Critério de aceite

1. `npm run build:frontend` e `npm test` em `frontend/visual/` rodam.
2. Rebaseline: **18 das 21 cenas**, porque a grade de ícones é chrome de quase
   toda captura. As 3 que passaram sem tocar são as duas de bloqueio e
   `mobile-sobre` — as únicas sem grade de ícones, o que é a confirmação de que
   o escopo não vazou.
3. **Conferido diff por diff antes de rebasear.** Em `jornada` o único vermelho
   é a coluna de ícones: janela, barra de título, taskbar e assinatura limpos,
   o que prova que os títulos de janela continuam vindo de `windows` e não de
   `iconLabels`. Em `menu-iniciar` o vermelho é a coluna **mais** o vazamento
   dela através do menu translúcido (as faixas seguem o pitch dos ícones,
   esfumadas pelo `backdrop-filter` do menu) **mais** ruído WebGL do cristal; as
   oito linhas do menu e seus ícones de 20px ficam cinza, coerente com só
   seletores `--tile` e `--desktop` terem sido editados.
4. `npm test` em `frontend/` (lógica pura): 53/53. Um teste precisou mudar —
   `system.test.js` fixa `LAYOUT.icones`, e `intervalo` é um dos valores fixados.
5. Suíte visual completa: **34/34**.
6. Hover e foco verificados no navegador com um spec temporário (apagado depois),
   nos dois temas: o tile aceso destaca-se dos vizinhos e o anel de foco envolve
   o alvo inteiro. De graça, isso também confirmou as legendas em inglês.
7. Skill `marocos-os-frontend` atualizada no mesmo commit, em três pontos: a
   tabela de camadas (`tokens.css` passa a ser dona de `--icon-tile-*`), a regra
   nova sobre alpha de tema escuro não se reaproveitar no claro, e a linha de
   `AppIconButton.css` — que mandava ler o `:where()` que esta mudança removeu.
   `frontend/visual/README.md` foi conferido e **não** precisou de mudança: o
   que ele afirma sobre ícones é o clique em "Meus Projetos", que continua
   valendo porque esse rótulo não entrou em `iconLabels`.

### Flake conhecido, não regressão

`rotas.spec.js › fallback nulo sob rede lenta` falhou **uma** vez, durante o
`test:update`, e passa isolado e na rodada completa seguinte. Ele simula rede
lenta, então é sensível a tempo, e ali competia com a reescrita de 18 PNGs em 4
workers. Registrado por honestidade: não foi investigado além disso.
