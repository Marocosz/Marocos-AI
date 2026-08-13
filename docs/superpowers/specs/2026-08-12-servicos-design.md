# Serviços — o `services.msc` do Marocos OS

**Data:** 2026-08-12
**Estado:** aprovado pelo dono do projeto

---

## O problema

O portfólio não vende nada. Ele prova muito — cinco projetos, uma stack, uma
trajetória, um agente de IA funcionando — e em nenhum pixel diz que o Marcos
aceita trabalho.

O fato de que ele aceita já está declarado em **três** lugares, e os três são
becos sem saída:

| onde | o que diz | para onde leva |
|---|---|---|
| `content/profile.js` | `status: 'aberto a freelance'`, com o pulso verde no herói do "Sobre este PC" | lugar nenhum |
| `i18n/os.js`, `terminal.whoami` | "agora: área de inovação da Supporte Logística + freelance" | lugar nenhum |
| `content/profile.js`, `stats[0]` | "4+ Serviços freelance" | lugar nenhum |

E existe um quarto fato, mais forte que os três, **escondido dentro de um app de
contato**: o bloco `hosting` de `content/contact.js`, que só aparece se o
visitante adivinhar o comando `vps` no Terminal.

O comentário que vive acima daquele bloco conta a história inteira:

> `vps` PROVA DEVOPS EM VEZ DE VENDER HOSPEDAGEM.
> Eram 55 palavras de anúncio ("Perfect for small to medium projects that need
> reliable, custom hosting...") no meio de um app de CONTATO, com quatro bullets
> de folheto.

Aquele corte estava certo — e a conclusão que ele não tirou é a desta spec: o
texto não era ruim, estava no **lugar errado**. Um portfólio que aceita trabalho
precisa de uma janela que diga isso.

## A decisão

Uma janela nova, `Serviços`, na metáfora do `services.msc` do Windows.

É o app que **falta na família**. O sistema já cita `winver` (Sobre este PC),
`explorer` (Meus Projetos), `devmgmt.msc` (Gerenciador de Dispositivos), `cmd`
(Terminal), `notepad` (leia-me.txt) e o painel de Configurações. O gerenciador de
serviços é o buraco óbvio — e o trocadilho fecha sozinho: **serviço do sistema =
serviço profissional**, e cada um deles tem um status e um tipo de inicialização.

Hospedagem é literalmente um serviço em execução numa máquina. A metáfora não é
enfeite: ela é o fato.

### As alternativas descartadas

- **Vitrine de produto** (cards lado a lado, preço, botão "Contratar"). Lê como
  landing de agência dentro da janela. É o "parece um site qualquer, fundos
  chapados dos itens" que o dono do projeto já reprovou no "Sobre este PC" — e
  aquele veredito custou um redesenho inteiro.
- **Proposta comercial** (a janela é um documento). Elegante, mas fecha o tom:
  documento não convida a explorar, e o fluxograma vira ilustração de anexo em
  vez de peça central.

## A regra estrutural: toda afirmação sai com recibo

Instrução literal do dono do projeto:

> fale de tudo isso, mas não seja repetitivo em relação ao que já tem no
> projeto; dá um resumo e linka onde tem a informação caso seja necessário

Isso não é um cuidado de redação — é o **mecanismo central da página**. Cada
serviço tem uma descrição curta e termina numa porta para a janela que o prova:

| serviço | inicialização | a prova | abre |
|---|---|---|---|
| Hospedagem gerenciada | `Automático` | este site roda nela | `readme` |
| Sistemas web sob medida | `Sob demanda` | cinco projetos | `projects` |
| Agentes de IA e RAG | `Sob demanda` | o demo está a um clique | `assistant` |
| Automação e integrações | `Sob demanda` | é o que ele faz no emprego fixo | `history` |

Duas coisas ao mesmo tempo: mata a repetição **e** é o que faz a janela vender
provando em vez de anunciar. Quatro destinos diferentes também espalham o
visitante pelo site em vez de deixá-lo num beco — o mesmo defeito que o guia do
"Sobre este PC" existiu para corrigir.

As portas usam `useAbrir()` (janela nova ao lado), não `useIrPara()`. Mesma
decisão das quatro portas do guia, e pela mesma razão: quem foi ver os projetos
ainda pode querer os outros três serviços. Trocar o conteúdo apagaria a lista no
instante em que ela fosse usada pela primeira vez.

## A identidade

| campo | valor | por quê |
|---|---|---|
| `id` | `services` | |
| `route` | `/servicos` | PT-BR, como as outras sete rotas nomeadas |
| `titleKey` | `services` | "Serviços" / "Services" |
| `icon` | `Server` | ver abaixo |
| `defaultSize` | `884 × 626` | |
| `explorer` | `true` | é um **lugar**, não um programa |
| `singleton` | `true` | |
| `onDesktop` / `inStartMenu` | `true` | |
| `inDock` | `false` | ver abaixo |
| posição no array | entre `devices` e `terminal` | |

**O ícone é `Server`, e não `ServerCog`.** A escolha óbvia para "serviços" seria
uma engrenagem — mas `Settings` já é a engrenagem do sistema e o "Sobre este PC"
já usa `MonitorCog`. Duas engrenagens a 26px na mesma grade de ícones se
confundem, e o glifo com a silhueta mais distinta (três barras empilhadas com um
LED) é o que sobra. Ele diz "hospedagem" de imediato; a amplitude ("também faço
software") é carregada pelo **título da janela**, não pelo glifo.

Descartado `BriefcaseBusiness`: maleta numa grade de ícones de sistema
operacional lê como clip-art, não como app.

**`defaultSize` é 884×626**, o teto que o sistema já pratica (`history` e
`devices`). O contrato do chrome de explorador se aplica: `700×520` de conteúdo +
`184` de lateral + `106` das duas barras. Com os `16px` de `JANELAS.margem` dos
dois lados a largura pede 916px, que cabe no breakpoint de 1024px onde o shell de
desktop começa. O fluxograma de cinco etapas é o que pede essa largura.

**A posição no array é narrativa**, porque a ordem do array é a ordem dos ícones
no desktop e no menu Iniciar. Entre `devices` e `terminal` a grade passa a ler:
quem sou → o que fiz → há quanto tempo → com o quê → **o que eu vendo** → como
falar comigo. Contato imediatamente depois da oferta.

**`inDock: false`** porque o dock do mobile tem quatro apps e um quinto muda o
layout de lá. É um `true` de uma linha se o dono do projeto quiser depois.

`ui/xpIcons.jsx` ganha uma entrada `services` — um servidor desenhado no estilo
do XP, como os outros nove. App sem entrada lá cai no glifo lucide, o que
funcionaria, mas deixaria um ícone fora do idioma no único preset que troca todos.

## As seções

```
┌─ Serviços ────────────────────────────────────────────────┐
│  SERVIÇOS DO SISTEMA                          ← eyebrow    │
│  Quatro serviços. Todos em execução.          ← headline   │
│  Freelance em paralelo ao trabalho fixo.      ← subtítulo  │
│ ══════════════════════════════════════════════════════════ │
│  ▍Hospedagem gerenciada        ● Em execução · Automático  │ ← faixa de
│  ▍Sua aplicação na minha VPS…            este site  ›      │    destaque
│  ─────────────────────────────────────────────────────     │
│   Sistemas web sob medida      ● Em execução · Sob demanda │
│   Do problema ao ar…                    5 projetos  ›      │
│  ─────────────────────────────────────────────────────     │
│   Agentes de IA e RAG          ● Em execução · Sob demanda │
│   …                              o demo está aqui  ›       │
│  ─────────────────────────────────────────────────────     │
│   Automação e integrações      ● Em execução · Sob demanda │
│ ══════════════════════════════════════════════════════════ │
│  COMO FUNCIONA                                             │
│   ①━━━━━━━②━━━━━━━③━━━━━━━④━━━━━━━⑤    ← o pulso viaja     │
│  conversa  escopo  build   no ar   depois                  │
│ ══════════════════════════════════════════════════════════ │
│  A MÁQUINA                        ← ficha técnica, mono    │
│  Orquestração ........................ Docker + Coolify    │
│  Proxy .................. Traefik, HTTPS automático        │
│ ══════════════════════════════════════════════════════════ │
│  ┃ Me manda o problema                            →  ┃     │ ← a única
│  ┃ Os canais estão no terminal                       ┃     │   superfície
└────────────────────────────────────────────────────────────┘   preenchida
```

### 1. Cabeçalho

Eyebrow em mono (`SERVIÇOS DO SISTEMA`) + headline. É a receita de
`ui/AppHeader.css`, e a seção **afirma**, então ganha headline — a regra de corte
que o projeto já aplica.

**A contagem é derivada** (`servicos.length`), interpolada por `%d` no i18n.
Este projeto já teve três números literais envelhecerem em texto visível ("36
testes", "Doze papéis de parede", "8º período"); acrescentar um quarto num arquivo
novo seria repetir o erro sabendo dele.

### 2. Os quatro serviços

**Lista de linhas, não grade de cards.** É o padrão que o "Sobre este PC" já
usa nas portas do guia, e a razão é a mesma: quatro cards idênticos numa grade é
o que faz uma janela parecer qualquer site.

Cada linha: ícone, nome, descrição curta, a coluna de status (`● Em execução` +
tipo de inicialização, em mono — é a voz da máquina), e a porta de prova com
chevron. Filete entre as linhas.

A hospedagem é o item em destaque e recebe `--sup-faixa` + `--sup-faixa-borda` —
o gradiente que nasce na borda esquerda e se apaga para a direita, a marca de
"este é o item em destaque" que a lateral do explorador e as duas ações do
"Sobre" já compartilham. **Não** um retângulo tingido, que empataria com o hover.

### 3. Como funciona — o fluxograma

A peça nova do projeto, e **é um pipeline, não uma timeline**. A distinção
importa: a Jornada já é uma linha do tempo com playhead, e repetir aquela forma
faria duas janelas parecerem a mesma. Aqui são cinco nós numerados ligados por um
trilho, com um **pulso viajando de ponta a ponta** — o eco visual de um deploy
atravessando estágios, que é literalmente o diferencial que a página vende.

As cinco etapas:

1. **Conversa** — você me manda o problema, não o escopo
2. **Escopo** — volto com o que dá para fazer, prazo e preço, por escrito
3. **Construção** — repositório desde o primeiro commit, não um relatório
4. **No ar** — deploy, HTTPS, domínio e monitoramento
5. **Depois** — o que quebrar é meu também

Horizontal quando o container é largo, vertical quando é estreito — por
`@container`, nunca `@media`: a janela é o container, e a viewport não diz nada
sobre a largura que o app recebeu.

O pulso obedece **às duas chaves** (interruptor de Movimento das Configurações +
`prefers-reduced-motion`) e, sem movimento, **para** — não some. Mesma regra da
luz da borda do "Sobre": quem pediu menos animação não pode perder o sinal.

### 4. A máquina

Ficha técnica em mono, no formato `{ rotulo, valor }` com linha pontilhada — a
mesma forma de `about-ficha`. É a **voz da máquina** falando de si: orquestração,
proxy, deploy, backup, monitoramento.

A separação com a seção 2 é deliberada e é a mesma que o "Sobre este PC" faz
entre a coluna larga e o trilho estreito: a **linha de serviço** é a OFERTA (o que
o cliente recebe), a **ficha** é o SPEC (em que ela roda). Não são o mesmo texto
dito duas vezes.

É aqui que moram os quatro chips do card original (`✓ Configuração
Personalizada`, `✓ Monitoramento 24/7`, `✓ Suporte Direto`, `✓ SSL & Segurança`)
— convertidos em linhas de ficha, sem pílula preenchida. **Preenchimento é ação**:
quatro pílulas somadas a quatro linhas de serviço seriam exatamente os "fundos
chapados dos itens" que o dono do projeto reprovou no "Sobre este PC".

### 5. A ação

Uma superfície preenchida na janela inteira, e ela é a única — porque é a única
coisa clicável e prioritária. Anatomia de `.about-acao`, com o anel de luz
girando na borda no hover.

Abre o Terminal (`useAbrir('terminal')`). **Não repete canal nenhum**: é a
decisão que o dono do projeto já tomou no "Sobre este PC" — *"não quero repetir
informação, quero que ele use elas mandando a pessoa ir até a determinada janela
com elas"*.

O texto diverge do botão do "Sobre" de propósito (lá é "Falar comigo"; aqui é o
problema, não a apresentação), senão a mesma frase apareceria em duas janelas.

## O que fica fora, de propósito

- **Nenhum preço.** Decisão do dono do projeto: tudo sob orçamento, o CTA é
  conversa. Nenhum número para envelhecer.
- **Nenhum chip preenchido** — ver a seção 4.
- **Nenhuma cor nova.** Tudo sai de `--accent-rgb`, `--sup-*` e
  `--filete-secao`. O config novo é **uma** duração
  (`MOVIMENTO.pipelineServicosS`), publicada como `--cfg-pipeline-servicos`.

  A spec previa duas. A segunda seria o pulso do ponto de "em execução" de cada
  serviço — e ela não existe porque `MOVIMENTO.pulsoStatusS` já é exatamente esse
  pulso, no "aberto a freelance" do "Sobre este PC". É o mesmo significado
  ("isto está vivo") e o mesmo fato dito de outro jeito; um valor próprio seria
  dois números para a mesma ideia.
- **Nada no Marcos Virtual.** A base vetorial (`backend/data/knowledge_base/`)
  **não** recebe um `servicos.md`, por decisão explícita do dono do projeto.

  Fica registrado o custo, porque ele é real e o `content/profile.js` já o
  documenta para outro caso: se alguém perguntar ao agente "você faz freelance?",
  ele responde a partir do que a base tem hoje — e a base não fala de serviços.
  O conserto, se e quando isso incomodar, é acrescentar o fato à base, não apagar
  a janela.

## A duplicação que morre junto

O comando `vps` do Terminal imprime hoje *"Docker, Traefik com HTTPS automático,
deploy contínuo a partir do git"* — que é **exatamente** a ficha "A máquina".
Criar a janela sem mexer nele faria o site dizer a mesma coisa em dois lugares,
que é o oposto do que esta spec existe para resolver.

1. O bloco `hosting` sai de `content/contact.js` e vira `content/servicos.js`.
   Fonte única.
2. O `vps` fica com a manchete e um **ponteiro clicável** para a janela nova —
   mesmo mecanismo dos comandos `projetos` e `stack`, que já abrem janela pelo
   `open` injetado no contexto.
3. Nasce o comando `servicos`, com alias `services` no bloco inglês.

## Os arquivos

**Novos**

```
frontend/src/content/servicos.js     os 4 serviços, as 5 etapas, a ficha
frontend/src/apps/ServicesApp.jsx
frontend/src/apps/ServicesApp.css
```

**Alterados**

```
frontend/src/os/registry.js          entrada + lazy + prefetch + "9 apps"
frontend/src/ui/xpIcons.jsx          ícone XP `services`
frontend/src/i18n/os.js              windows, head, bloco `services`, terminal
frontend/src/content/contact.js      `hosting` sai
frontend/src/apps/TerminalApp.jsx    `vps` vira ponteiro, nasce `servicos`
frontend/src/config/system.js        MOVIMENTO.pipelineServicosS
frontend/src/config/cssBridge.js     publica o `--cfg-*` novo
frontend/src/content/sistema.js      testes 41 -> 46, e nasce o campo `cenas`
frontend/src/apps/ReadmeApp.jsx      interpola o segundo número derivado
```

**Verificação**

```
frontend/visual/cenas.js             +2 cenas (servicos, servicos-claro)
frontend/visual/rotas.spec.js        +1 rota, +2 testes, +1 teste estendido
frontend/visual/visual.spec.js       o ponteiro sai de cima do conteúdo
frontend/visual/README.md            "nove rotas" -> "dez", 21 -> 23 cenas
frontend/src/config/system.test.js   a base do `services` no mapa `ANTES`
.claude/skills/marocos-os-frontend/SKILL.md   mapa, contagens e rebaseline
frontend/src/os/windowManager.js     "oito dos dez apps"
frontend/src/os/desktop/ExplorerChrome.jsx    "sete dos dez apps"
frontend/src/apps/AssistantMarkdown.jsx       "dos dez apps"
```

### Três coisas que a spec não previu e a implementação encontrou

1. **`config/system.test.js` reprovava antes de existir CSS.** O laço do contrato
   do explorador exige uma base declarada por app, e um app novo com
   `explorer: true` falha até alguém dizer qual área útil ele quer. Isso é bom, e
   virou nota na skill.

2. **Havia um segundo número envelhecido no leia-me.** O TÍTULO "E %d testes" já
   era derivado; o CORPO logo abaixo dizia "21 cenas visuais" em literal. Nasceu
   `SISTEMA.cenas` e o `ReadmeApp` passou a interpolar os dois. A lição que ficou:
   derivar metade de uma frase é pior que não derivar nenhuma, porque a metade
   protegida faz a outra parecer protegida.

3. **O regressor fotografava um `:hover` acidental.** `page.click('.porta')`
   destranca o sistema e deixa o ponteiro no CENTRO da tela, que é onde a janela
   nasce — e o Playwright desliga transições, então o hover aparecia no valor
   final, sem fade que o denunciasse. A segunda linha da lista de Serviços saía
   com borda de acento a 45% (exatamente `--cfg-luz-borda-hover`), parecendo
   decisão de design.

   `visual.spec.js` agora move o ponteiro para (0, 0) antes de fotografar. Isso
   entrou no mesmo rebaseline de propósito: o diff da cena `stack` mostra o card
   "Engenharia Backend" inteiro vermelho, que é a prova de que aquele card estava
   aceso na referência antiga pelo mesmo motivo.

## O custo que ninguém vê vindo

A lateral do explorador é **derivada do registry**
(`APPS.filter(a => a.explorer && !a.dynamic)`). Um app com `explorer: true`
aparece sozinho na lateral dos outros seis — mais a grade de ícones do desktop, o
menu Iniciar e a home mobile.

Ou seja: **quase toda captura do regressor visual muda**, ~18 delas.

Isso é esperado, e a regra vale: conferir **diff por diff** antes de aceitar. O
único pixel novo deve ser o ícone e a linha nova na lateral; nenhum ícone
existente pode ter mudado de posição. Rebaselinar em bloco para calar vermelho
apagaria a única evidência de que algo mais quebrou.

## Como saber que funcionou

Executado em 2026-08-12, com estes resultados:

- `npm test` no `frontend/`: **125 testes**, verde. Inclui o contrato de
  `defaultSize` do chrome de explorador.
- `npm run lint`: limpo, zero avisos.
- `npm run build`: passa, e gera `ServicesApp` como chunk próprio — prova de que
  o `lazy()` está certo.
- `frontend/visual`: **46 testes**, verde (23 cenas + 23 funcionais), com as 16
  referências alteradas conferidas uma a uma antes do rebaseline.

O que os diffs mostraram, e por que cada um é esperado:

| diff | causa |
|---|---|
| os quatro primeiros ícones intactos, do 5º para baixo tudo vermelho | "Serviços" entra na 5ª posição e empurra Terminal, Marcos Virtual e leia-me.txt uma casa |
| a lateral do explorador só ganha uma linha | ela é derivada do registry |
| o menu Iniciar sobe e cobre mais um ícone | cresceu uma linha |
| o card "Engenharia Backend" da Stack inteiro vermelho | o `:hover` acidental saiu da referência (item 3 acima) |
| pontos soltos perto do cristal 3D | ruído de rasterização já documentado, dentro da tolerância |

**Uma ressalva sobre o rebaseline:** a árvore já tinha edições não commitadas em
cinco arquivos de CSS (`AboutApp`, `DevicesApp`, `HistoryApp`,
`ProjectDetailApp`, `ReadmeApp`) quando esta tarefa começou. As referências novas
capturam o estado ATUAL do código, então elas incorporam também aquelas edições —
o que é o comportamento certo, mas quem for ler o diff das imagens precisa saber
que nem tudo ali veio desta mudança.

---

## Segunda passada — o redesenho de marketing

Feedback do dono do projeto sobre a primeira entrega: *"ficou mais ou menos bom"*.
Cinco correções, todas aplicadas.

### 1. O herói virou uma pergunta

Era o cabeçalho padrão de app ("4 serviços. Todos em execução."), que é **rótulo de
janela**. Virou `Precisando de um serviço?` na escala de destaque do projeto, com um
glifo grande à direita.

O glifo é um **"?" tipográfico**, não um SVG desenhado — e a escolha tem
consequência: ele usa o gradiente clipado que o `.about-nome`, o `.devices-numero` e
a capa da Jornada já usam, escala com a JANELA por `cqi`, e **herda a fonte do
preset** (o XP troca para Tahoma e o "?" acompanha). Um SVG teria de decidir curvas
à mão, ficaria preso a uma fonte que o preset pode trocar, e seria mais um arquivo
de arte para envelhecer.

### 2. Os serviços viraram grade 2×2

Era uma lista de linhas — a forma que o guia do "Sobre este PC" usa. A anatomia dos
cards é a das **pastas da Stack** (tile com gradiente do acento, badge no topo
direito, fantasma recortado, lavagem radial ancorada no canto), porque aquele
desenho já foi aprovado e já é linguagem do sistema. Sem a **aba** das pastas: lá
ela promete "isto abre"; aqui o card leva a outra janela.

Isso obrigou uma mudança estrutural: o fantasma precisa de recorte, mas
`overflow: hidden` no botão mata o anel de luz do hover (que vive em `inset: -1px`).
A saída foi uma **camada de recorte própria** — `.services-card-recorte`, absoluta,
com `border-radius: inherit`. A Stack não precisa dela porque o hover de lá é uma
luz de rodapé.

### 3. O fluxograma virou timeline vertical alternada

Trilho no meio, marcador no centro, conteúdo alternando esquerda/direita. Isso
resolve um problema real da versão horizontal: cada etapa tinha ~130px de coluna
— duas linhas de texto — para explicar um processo de contratação. Em zigue-zague
cada uma tem quase metade da janela, e **os textos foram reescritos como venda**:
cada etapa agora responde a um medo específico de quem contrata freelance.

Detalhes que valem: a alternância é `nth-child(even)` e não uma classe no dado
(acrescentar uma etapa no meio reordena os lados sozinho), e a coluna central é
`1fr auto 1fr`, o que centraliza o marcador sem nenhuma conta de largura.

### 4. A ficha virou um monitor

Chassi, tela, pé, base e LED de energia, desenhados em CSS — arte, a mesma
categoria dos gradientes da cerimônia. O detalhe que faz a silhueta funcionar é o
**queixo**: a moldura de baixo é mais grossa que as outras três. Com padding
uniforme (a primeira tentativa) o resultado é um card com borda larga, e o pé fica
pendurado numa forma que não parece um aparelho.

O conteúdo veio do **painel real do Coolify**, via MCP: 1 servidor, 10 aplicações,
1 PostgreSQL. Os **nomes** das aplicações ficaram de fora por decisão minha e está
registrado em `content/servicos.js` — boa parte é de cliente, e nome de cliente
numa página pública é decisão do dono do projeto, não do site. A contagem prova a
escala sem entregar quem é.

A seção ganhou headline porque passou a **afirmar**: "É uma máquina, não um plano"
— o argumento que o dono pediu para destacar (uma VPS própria não tem catálogo de
recursos; o teto é o hardware).

### 5. O ar

`gap` da raiz 20 → 30, padding de seção 14 → 26, gap interno 6 → 10, e os paddings
de linha subiram junto. **A mesma correção foi aplicada ao `AboutApp.css` no mesmo
commit** — os dois apps tinham os mesmos números, e consertar um de cada vez faz o
segundo virar dívida esquecida.

### O cargo, em toda parte

Pedido separado: `AI Software Engineer | Full-Stack Developer` (EN) e
`AI Software Engineer | Desenvolvedor Full-Stack` (PT). "AI Software Engineer" não
traduz — é como o cargo se escreve nos dois idiomas.

Trocado em **dez superfícies**: `profile.role`, `signature.role`, o `whoami` do
Terminal, o "Main Processor" do POST de BIOS e o título da entrada de 2025 da
Jornada (os cinco × dois idiomas). E mais quatro no `frontend/index.html`, que
ninguém teria revisado: `<title>`, `og:title`, `twitter:title` e o **`jobTitle` do
JSON-LD schema.org** — este ainda dizia "AI Developer & Full-Stack Engineer", uma
versão que já estava divergente antes desta tarefa.

### Terceira passada — o acabamento

Mais uma rodada de feedback, e três dela viraram consertos de bug de verdade.

**O glifo perdeu o disco.** Dentro de um círculo com fundo e borda, ele lia como
**botão desabilitado** — ícone dentro de pílula é vocabulário de controle. Sozinho
e grande (`clamp(4rem, 14cqi, 7.5rem)`), vira tipografia. O halo ficou, sutil:
sem nada atrás, um glifo em gradiente sobre o vidro perde peso.

**As doses de acento caíram.** A lavagem dos cards foi de `0.13` para `0.05` e o
brilho da tela do monitor de `0.16` para `0.06`. O card destacado deixou de somar
faixa **e** lavagem — empilhadas, davam a ele quase o dobro de acento dos outros
três, o que é o oposto de destacar.

**As etapas ganharam bordinha** — só contorno, sem preenchimento. A regra de que
preenchimento é ação continua valendo: a etapa não é clicável.

**O alinhamento tinha uma causa exata, e não era cosmética.** Os itens ímpares
nasciam 30px abaixo dos pares — exatamente a altura do marcador. É o
**auto-placement do grid**: o marcador vem antes no DOM e ocupa a coluna 2; quando
o corpo pede a coluna 1, que fica *atrás* dele, o algoritmo `sparse` nunca
retrocede e desce para a linha 2. Nos pares o corpo pede a coluna 3, que ainda
está livre à frente — por isso só metade estava errada. `grid-row: 1` nos dois
resolve; medido antes (`30, 0, 30, 0, 30`) e depois (`0, 0, 0, 0, 0`).

**O feixe tinha dois defeitos encadeados**, e o segundo era aritmético:

1. *Sem fade.* Trazer o feixe para dentro do fio (correção anterior) tirou a
   entrada e a saída, que antes eram consequência de ele vir de fora. A opacidade
   passou a ser animada explicitamente.
2. *Dessincronizado.* O delay do último marcador era `duração × 4/4` — a duração
   inteira. Numa animação `infinite`, **atrasar exatamente um ciclo é o mesmo que
   não atrasar**: o círculo 5 piscava junto com o 1, no instante em que a luz
   estava no topo.

   O conserto dos dois é o mesmo: o percurso ocupa **80% do ciclo** e os 20%
   finais são silêncio. Assim o último acende em `0,8` do ciclo e ninguém colide —
   e a pausa ainda vale por si, porque um pulso de deploy tem intervalo entre
   passagens. O `0.8` aparece no keyframe e no `animation-delay`, e os dois têm de
   ser iguais.

   O percurso também passou a medir o **centro** do feixe, não a ponta: o primeiro
   círculo fica a ~5% da altura e o último a ~97%, e um feixe indo de 6% a 94% pela
   ponta tem o centro viajando de 17% a 83% — nunca alcançava nenhum dos dois.

`MOVIMENTO.pipelineServicosS` subiu de `3.4` para `4.8`. O percurso ficou muito
mais longo (cinco cards empilhados contra cinco colunas) e só 80% do ciclo é
travessia: a velocidade efetiva tinha aumentado sem o número mudar.

### Verificação da segunda passada

`npm test` 125 ✓ · `lint` limpo ✓ · `build` ✓ · funcionais 23 ✓ · 19 cenas
rebaselinadas após conferência.

**Duas falhas foram investigadas e descartadas como ruído**, não rebaselinadas: o
conjunto de cenas que reprova muda a cada execução da suíte cheia, e o `stack`
oscilou de 336 para 1 pixel entre tentativas do mesmo código. O critério e a
medição foram acrescentados à `SKILL.md`.
