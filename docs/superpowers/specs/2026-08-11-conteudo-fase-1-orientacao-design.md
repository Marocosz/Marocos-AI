# Conteúdo, fase 1: verdade e orientação

**Data:** 2026-08-11
**Branch:** `feat/windowsmorphism`
**Escopo:** o que o visitante lê dentro das janelas — começando pela porta de
entrada. Não toca no chrome do SO, que está pronto.

---

## 0. O diagnóstico, em uma frase

A forma está terminada e é boa. A substância é rascunho. E o defeito se repete
de um jeito específico:

> **O site não usa a própria melhor prova.**

Quatro instâncias verificadas:

1. O `backend/data/knowledge_base/profile.md` — que alimenta o RAG — conta a
   história muito melhor que a janela da Jornada. Ele diz *"aos 14 anos, em
   2018... formatava máquinas, realizava backups, trocava componentes,
   **consertava impressoras**"*. A Jornada transformou isso em *"construí a base
   que conecta o mundo físico ao digital"*. **O Marcos Virtual sabe; a janela ao
   lado não.**
2. `content/tech.js` marca **Streamlit como Expert e React como Advanced** —
   enquanto o visitante está dentro de um sistema operacional feito à mão em
   React + WebGL. A evidência na tela desmente a autoavaliação.
3. LangGraph, ChromaDB, Three.js, Playwright, SSE e Traefik estão no
   repositório e ausentes do arsenal.
4. O `profile.md` guarda material forte que **nenhuma janela mostra**: o curso
   de eletrônica publicado no YouTube, o trabalho voluntário no Sal da Terra, o
   blog de tecnologia de 2015, os 8º período de Gestão da Informação na UFU, e
   ~40 respostas de perfil comportamental.

### As "contradições" eram deriva, não erro de fato

Uma primeira leitura acusou contradições factuais. Com o `profile.md` em mãos,
a acusação se inverte: **a fonte da verdade está coerente; quem derivou dela
foram as janelas.** `content/journey.js` inventou:

| o que a janela diz | o que a base diz |
|---|---|
| `org: "Supporte Logística"` na entrada de **2024** | o estágio começou em **agosto de 2025** |
| cargo "Estagiário de TI" | *"atuo como desenvolvedor full stack, com foco em soluções envolvendo IA, dentro da área de inovação"* |
| tags PyTorch, Kubernetes, MLOps, Fine-Tuning | nenhuma das quatro aparece no `profile.md`, e três foram copiadas da entrada "FUTURO" |
| aparente buraco em 2023 | 2023 é o meio da graduação — não é lacuna, só não é marco |

Isso muda a natureza do trabalho: não é *descobrir* fatos, é **reconciliar as
janelas com a base de conhecimento**. Mais barato e mais seguro.

---

## 1. Decisões tomadas com o dono do projeto

| pergunta | decisão |
|---|---|
| para quem o portfólio fala | **recrutador técnico / tech lead** |
| forma do guia | **guia por intenção** — mapeia perguntas, não lista seções |
| o app de contato | **o boot já imprime os canais**; o terminal continua terminal |
| marocos.dev na lista de projetos | **não** — fica no `leia-me.txt` |
| o comando `vps` | **fica, mas encurta muito** |
| a arquitetura desatualizada no `profile.md` | **corrigir nesta fase** |
| "Especificações do Sistema" | **os dois blocos** — fatos humanos + a máquina real |

### O leitor decide tudo

"Recrutador técnico" não é um detalhe de tom. Ele estabelece o critério de
aceite de cada decisão desta spec: **o visitante dá ~60 segundos ao site e
desiste rápido.** Toda escolha aqui responde a "isso encurta o caminho até a
prova?".

É também de onde vem o diagnóstico do texto atual. *"Entregues com Excelência"*,
*"Aprendizado Contínuo"*, *"Soluções Inovadoras"*, *"a resposta definitiva para
a fragmentação da vida moderna"* e *"banco de dados robusto"* não são apenas
fracos: são o custo de tentar falar com todo mundo ao mesmo tempo.

---

## 2. Sobre este PC vira o guia

### 2.1 Por que este app, e por que é urgente

`os/shell/BoasVindas.jsx` **já abre esta janela automaticamente** para quem
chega sem deep link — ela monta durante a tela de bloqueio, em tempo ocioso,
justamente para estar pronta quando a cortina sobe.

Ou seja: o problema nunca foi "falta um guia". É que **a porta de entrada é um
beco sem saída**. O app não tem um único link, não menciona nenhum outro app, e
não diz o que existe nesta máquina. É a primeira coisa que o visitante vê e não
leva a lugar nenhum.

### 2.2 A estrutura

Quatro blocos, nesta ordem:

**Identidade.** Cristal, nome, papel, e **uma** frase.

Hoje essa frase é `profile.bio_highlight` — e ela tem dois problemas. É headline
de LinkedIn (*"Transformo dados em inteligência acionável através de Agentes de
IA, arquiteturas escaláveis e automação estratégica"*), e é **a mesma string que
o comando `whoami` do terminal imprime**. Duas superfícies dizendo exatamente o
mesmo, uma delas na voz errada: `whoami` é a voz da máquina e recebe marketing
em primeira pessoa.

A frase do guia passa a provar em vez de vender, e o `whoami` passa a imprimir
outra coisa.

**Por onde começar.** Quatro portas por intenção:

| pergunta | destino | o que promete |
|---|---|---|
| "Ele sabe construir?" | `projects` | os projetos, com o problema difícil de cada um |
| "Há quanto tempo?" | `history` | de suporte técnico aos 14 a dev full stack |
| "E este site aqui?" | `readme` | o SO, o shader e o agente RAG por trás |
| "Como falo com ele?" | `terminal` | e-mail, LinkedIn, GitHub |

A quarta porta existe porque o marocos.dev ficou fora da lista de projetos: sem
ela, a melhor prova não tem entrada.

Cada porta chama `useIrPara()` — a plumbing existe e funciona nos dois shells
(`os/NavegacaoContext.jsx`). Numa janela com chrome de explorador isso **troca o
conteúdo da própria janela**; no mobile empilha uma tela. As duas leituras estão
certas para um guia.

Os textos vão para `i18n/os.js`, **chaveados por app id** — mesmo padrão do
`iconLabels`. Reordenar as portas não pode trocar o rótulo de ninguém.

**Especificações do sistema + Este computador.** Dois blocos, como o winver de
verdade, que mostra especificações do dispositivo *e* do Windows.

O primeiro traz os fatos humanos: desde 2018 na área, 8º período de Gestão da
Informação na UFU, empregado e aberto a freela. O segundo traz a máquina real do
`profile.md` — Acer Nitro V15, Ryzen 7735HS, RTX 4050 6GB, 32GB, VSCode +
Antigravity, **café com açúcar**.

A piada que o app tentava fazer com "4+ / Entregues com Excelência" já existia
pronta na base de conhecimento, e é verdadeira. As duas metades são fatos.

### 2.3 O que sai

**O marquee de skills.** É decorativo, não dá para ler no próprio ritmo, e
duplica o Stack — que agora é uma das portas. O espaço vai para o guia.

**O objeto `hero` de `content/profile.js`.** Morto desde o refactor que removeu a
landing page de rolagem: `sectionLabel: "01. / PORTFÓLIO"`, `title:
"Marcos<br />Rodrigues"`, `cta`, `scroll` e um `f11` que ninguém renderiza.

---

## 3. leia-me.txt promovido a case técnico

Com o marocos.dev fora da lista de projetos, **este app passa a ser o único
lugar onde a melhor prova aparece** — e hoje ele são três parágrafos curtos.

Vira o case: o gerenciador de janelas com identidade de instância separada da
localização, o wallpaper por shader com teto de fps, o agente LangGraph + Chroma
com guarda de responsabilidade, a suíte de 36 cenas visuais com tolerância zero.

**Sai do JSX.** `ReadmeApp.jsx` é hoje o único arquivo do projeto que chumba
conteúdo em JSX por idioma, contra a convenção de que texto vive em `i18n/` ou
`content/`. O componente passa a ler de `i18n/`, como todos os outros.

---

## 4. Terminal: valor sem digitação

### 4.1 O problema

O app de contato de um portfólio hoje **exige adivinhar uma palavra**. Ele se
chama "Terminal" na área de trabalho, abre com versão + copyright + três logs de
ficção, **nada na tela menciona `help`**, e o input **não nasce focado**. O
caminho até o e-mail é digitar `contato` no escuro.

Nenhum dos oito comandos é descobrível sem essa aposta. É o único problema deste
levantamento que custa uma oportunidade.

### 4.2 A solução

O boot termina **executando `contato`**, como um `.bashrc` faria. Quem abre já
tem e-mail e LinkedIn na tela. A metáfora sobrevive inteira — histórico com
↑/↓, comandos, prompt — e o valor principal deixa de depender de digitação.

A linha de comandos disponíveis passa a ser impressa e **clicável**:
`renderEntry` (`TerminalApp.jsx`) já renderiza JSX arbitrário, então isso não
pede arquitetura nova.

`autoFocus` no input, como o assistente já faz.

`vps` encurta de 55 palavras de venda para uma linha que prova DevOps — *rodo
minha própria VPS; este site está nela* — em vez de anunciar hospedagem no meio
dos canais de contato.

### 4.3 Três correções de i18n

- `backend/app/api/routes.py` — a mensagem de 429 está em **português cravado**
  e aparece assim para quem lê em inglês.
- Mesmo arquivo — `"No response generated."` está em **inglês cravado** e
  aparece dentro da interface em português.
- Os aliases em inglês (`contact`, `who`, `projects`, `devices`) existem no
  `TerminalApp.jsx` e **nunca aparecem no `help`**, porque a lista é montada a
  partir dos nomes canônicos em PT. Um visitante em inglês vê "contato — contact
  channels": nome em português com descrição em inglês.

---

## 5. Reconciliar a Jornada com a base

**Alinhamento, não reescrita.** A reescrita narrativa é fase 2.

- **Ordem invertida**: mais recente primeiro. `git log` e o Histórico de
  Atualizações do Windows mostram assim, e hoje o emprego atual é o 4º de 5 —
  abaixo da dobra numa janela de 626px.
- A entrada de 2024 corrigida para agosto de **2025**, com o cargo real.
- As quatro tags inventadas trocadas por tecnologias que existem em `tech.js`.
- E puxar da base o que está sendo jogado fora: **as impressoras aos 14 anos**,
  **o curso de eletrônica publicado no YouTube**, **o Sal da Terra**, **Gestão
  da Informação na UFU**.

---

## 6. `profile.md`: o sistema descreve a si mesmo errado

A base do RAG documenta o pipeline com `contextualize_input` e `router_node` —
que o `CLAUDE.md` registra terem sido fundidos no `semantic_gateway_node`. E
afirma que o frontend usa **TailwindCSS** e **Framer Motion**: ele não usa
nenhum dos dois (é CSS com tokens `--cfg-*`, e `motion/react`).

**É o pior lugar possível para errar.** Um tech lead que pergunte "como você
construiu isso?" recebe uma stack que não é a real — do agente que roda dentro
dessa stack.

Corrigir exige reingestão (`FORCE_REINGEST=true`), e o `RagService.ingest_data`
manda 1 chunk por request com `sleep(4)` para respeitar o RPM do Google: são
vários minutos para 42KB.

---

## 7. Descompasso aceito, de olhos abertos

O `profile.md` lista **"Meu Portfolio (Este Projeto)" como projeto nº 6**, com
descrição completa. A decisão foi manter o marocos.dev fora da janela de
Projetos e apresentá-lo no `leia-me.txt`.

Consequência: o Marcos Virtual vai citá-lo como projeto quando perguntado,
enquanto a janela de Projetos não o lista. **É deliberado** — a base do RAG
responde perguntas, a janela cura uma vitrine, e não precisam ter o mesmo
recorte. Fica registrado para que ninguém "conserte" isso por engano.

---

## 8. Fora do escopo desta fase

| fica para | o quê |
|---|---|
| fase 2 | reescrever as descrições dos 5 projetos; os campos que faltam (ano, papel, resultado); as 21 descrições de tecnologia em `tech.js`; reconciliar `tech.js` com o que o repositório prova; a narrativa profunda da Jornada |
| fase 3 | a dívida de CSS — `AssistantApp.css` é o pior caso (acento `#a855f7` congelado no avatar, família índigo inteira sem token, nove raios diferentes, `!important` contra o hack de tema claro); o botão do GitHub que ignora o preset; as 36 linhas de `.theme-light` do `HistoryApp.css` que existem só por não usar tokens |
| fase 3 | levar as metáforas até o fim: hashes hexadecimais válidos, árvore de verdade no Stack, legenda dos dots |

Ordem deliberada: **conteúdo antes de layout**, porque o formato do conteúdo
decide o layout.

---

## 9. Verificação

1. `npm run lint` e `npm test` em `frontend/` (lógica pura).
2. `rotas.spec.js` — ancora em `.about-app`, `.terminal-app` e `.history-app`;
   os seletores permanecem.
3. **Dois testes funcionais novos**, porque são os comportamentos que estamos
   comprando e nenhuma foto os pega:
   - as quatro portas do guia abrem a janela certa;
   - o terminal mostra os canais de contato **sem nenhuma digitação**.
4. Suíte visual: rebaseiam `sobre-escuro`, `sobre-claro`, `contato`, `jornada` e
   `jornada-claro`. Conferir diff por diff.
5. Backend: depois da reingestão, perguntar ao agente como o site foi construído
   e confirmar que ele descreve `semantic_gateway_node` e a stack real.

### Ressalva que continua valendo

O regressor visual está **intermitente** desde que o `ruido` do Silk subiu para
3: cenas de piso zero com wallpaper WebGL variam entre execuções, sempre cenas
diferentes (logo ruído, não layout). Re-medir os limiares com `MEDIR_RUIDO`
segue pendente e é o que devolveria confiança à suíte.
