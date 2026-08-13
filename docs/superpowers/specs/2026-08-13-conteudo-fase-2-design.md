# Conteúdo, fase 2 — a atualização de março a agosto de 2026

Data: 2026-08-13
Estado: entregue

> **Esta spec foi reescrita DEPOIS da execução, e o registro disso importa.** Ela
> nasceu como plano e o plano mudou seis vezes durante o trabalho, sempre por
> correção do dono do projeto sobre algo que só apareceu quando estava na tela: os
> projetos passaram de quatorze para doze, a ordem deixou de ser por data, o
> Motor de Cobrança estava descrito errado, a ênfase em contagem de testes saiu, o
> bloco de capacidades entrou, e um app novo foi acrescentado. Manter o texto
> original seria arquivar uma intenção em vez de uma decisão. As seções abaixo
> descrevem o que EXISTE, com as correções nomeadas onde elas ensinam algo.

## O problema

O conteúdo do portfólio congelou em fevereiro de 2026. Desde então mudou o
emprego, apareceu uma disciplina nova (machine learning aplicado), a graduação
terminou com um TCC, e nove projetos foram entregues — nenhum deles está no
site. O que o site diz hoje sobre o presente é **falso**, não apenas incompleto:

| Onde | Diz hoje | Verdade |
|---|---|---|
| `profile.js:bio_full` (PT e EN) | "Trabalho na área de inovação da Supporte Logística" | Finza, desde março de 2026 |
| `journey.js` `step-now` | "2025 — hoje · Supporte Logística" | Supporte foi estágio, e fechou em 2026 |
| `i18n/os.js` `terminal.whoami` | "agora: área de inovação da Supporte Logística" | idem |
| `i18n/os.js` `assistant.betaNotice` | "Base atualizada até Jan/2026" | Ago/2026 |
| `content/servicos.js` (comentário) | a prova de automação é o emprego na Supporte | é a Finza |
| `about.guide.projects.answer` | "Cinco projetos" (literal) | doze |
| `journey` `subtitle` | "Sete anos em seis faixas" | oito anos, sete faixas |

Mentir sobre o emprego atual é o pior defeito possível num portfólio, porque é
o primeiro fato que um recrutador confere.

## A regra que guiou a seleção e a redação

**Toda afirmação técnica desta entrega foi lida no CÓDIGO, não no README.**

Instrução literal do dono do projeto: *"ver o codigo dos projetos e nao apenas
documentacoes ou readmes (eles podem estar desatualizados)"*. Ele estava certo,
e a verificação encontrou três divergências que teriam virado mentira no site:

1. **InTec-Access** — a cópia local do repositório é uma versão antiga com
   `ia_analise.py` VAZIO e os módulos `pessoas`/`acessos` como stubs. A versão
   deployada (repositório do GitHub) tem 20 arquivos a mais: relatórios PDF
   gerados por Gemini via APScheduler, fluxo de visitante com e-mail e expiração
   automática, WebSocket de monitoramento, log de auditoria e pytest.
   **Descrever a partir da pasta local teria subvendido o projeto pela metade.**

2. **InTec-Access, o outro lado** — `face-api.js` está no `package.json` do
   frontend Nuxt e **não é usado em nenhum arquivo**. Um levantamento por
   dependências teria anunciado reconhecimento facial que não existe.

3. **Pauta Certa / Tramita Fácil** — `app/utils/pdf_generator.py`,
   `app/api/v1/reports.py` e `app/services/report_service.py` têm **0 byte**. O
   documento de apresentação do projeto (`ContaGado/apresentacaoContaGado.md`)
   afirma "Geração de PDF oficial da sessão: documento formatado com brasão da
   câmara e numeração hierárquica". O PDF real sai de `window.print()` no
   frontend, e não há suíte de teste. O site descreve o que existe.

A lição que fica registrada para a próxima atualização de conteúdo: **README e
deck de apresentação são marketing com data de validade; o código é o fato.**
Quando os dois discordam, o código está certo.

## Decisões do dono do projeto

Tomadas explicitamente antes da execução:

1. **Nomes de cliente** — empregadores são nomeados (Finza, Supporte Logística);
   freelance é anonimizado por setor e domínio. É a mesma regra que
   `content/servicos.js` já documentava para a contagem da VPS: "nome de cliente
   numa página pública é decisão do dono do projeto, não do site".
2. **Repositório fechado** — projetos sem repositório público entram, com um selo
   `código fechado` no lugar do botão do GitHub. `links.github` passa a ser
   opcional.
3. **Sem quinto serviço** — machine learning fica na Stack e nos Projetos. A
   janela de Serviços continua com as quatro ofertas que ele de fato vende;
   anunciar o que não se vende esvazia a página.
4. **Números do bloco de especificações** — `7+` freelance, `4+` anos, `30+`
   projetos. O "4+ anos" conta a experiência como desenvolvedor, não o suporte
   técnico de 2018 — e é por isso que o `whoami` do terminal continua podendo
   dizer "na área desde 2018" sem contradizer a ficha.

## A ficha de projeto ganha estrutura

Hoje um projeto tem `description` — um parágrafo — e o detalhe renderiza
IDEIA + TECS + botão. Para documentar doze projetos com contexto e
profundidade técnica, isso é um parágrafo gigante ou uma descrição rasa; não há
terceira opção.

A ficha passa a ser:

```js
{
  id, title, category,
  contexto,      // chave: 'produto' | 'empresa' | 'freelance' | 'academico' | 'pessoal'
  description,   // o que é e para quem — 2 a 3 frases
  problema,      // o problema difícil, que é o que justifica o projeto existir
  solucao,       // como resolve, com o nome das técnicas
  destaques: [], // 3 a 5 marcadores concretos e verificáveis no código
  techs: [],
  links: { github?, live? }   // github OPCIONAL
}
```

`contexto` é **chave e não rótulo**, pela mesma razão que `inicializacao` em
`servicos.js` e `level` em `tech.js`: é ela que o CSS usa como modificador de
classe, e o rótulo traduzido vive no `i18n`. Traduzir o dado quebraria a classe.

`destaques` existe para separar o que é afirmação do que é prova. A descrição
pode dizer "sistema robusto"; o destaque tem de dizer "368 casos de teste em 70
arquivos". Só entra em `destaques` o que foi contado ou lido no código.

`ProjectDetailApp` ganha as seções **O PROBLEMA · COMO FUNCIONA · DESTAQUES**,
um chip de contexto no cabeçalho, e o selo de código fechado quando não há
`links.github`.

`FICHA` (data e bytes) continua tabela única chaveada por id — a razão original
não mudou: data e tamanho não têm tradução, e duplicá-los nas duas listas seria
criar mais duas chances de PT e EN discordarem.

## Os doze projetos

A ordem do array É a ordem da lista, e ela é a de **complexidade decrescente** — não
a cronológica. Como `bytes` já era a estimativa de complexidade, a coluna "Tamanho"
fica monotonicamente decrescente na tela e a lista se explica de cima para baixo.

A última coluna é o sinal CONTADO OU LIDO NO CÓDIGO que sustenta a posição. Nenhuma
delas é impressão.

| ordem | projeto | contexto | repo | sinal verificado no código |
|---|---|---|---|---|
| 1 | Diário Oficial Eletrônico | freelance | fechado | 368 casos em 70 arquivos; assinatura ICP-Brasil PAdES via pyHanko; PDF por Chromium com guarda de SSRF |
| 2 | Portal Acadêmico | freelance | fechado | 170 casos de teste; fronteira de módulos por import-linter na CI; 2FA TOTP; chat SSE sobre Redis; construtor de formulário com lógica condicional |
| 3 | Motor de Cobrança | produto | fechado | produto em produção: agendamento, filtragem e geração de ação sobre integrações, agentes métricados, CI/CD |
| 4 | Hub de Agentes de IA | empresa | fechado | 4 backends + gateway; orquestrador FSM; guarda de SQL por AST com sqlglot; UMAP+HDBSCAN recursivo |
| 5 | Bússola V2 | pessoal | público | 18 agentes em 5 domínios; contrato universal com camada de saneamento; 3 providers atrás de fábrica |
| 6 | Auditoria Algorítmica do Spotify | acadêmico | público | 28 scripts; 4 personas em contas reais; cinco métricas de diversidade e quatro procedimentos inferenciais |
| 7 | Portal de Controle de Acesso | freelance | fechado | integração assimétrica com legado (leitura direta, escrita pela fila do fornecedor); 5 jobs no APScheduler; relatório por LLM |
| 8 | Fraud Sentinel | acadêmico | público | 8 treinadores; ensemble por stacking; limiar em split retido para não vazar |
| 9 | Portal do Cidadão | freelance | fechado | multi-tenant com 4 papéis; feature flag com teste de FECHAMENTO da API |
| 10 | DataChat BI | empresa | público | master chain em LCEL com roteador, desvio, memória e último SQL por sessão |
| 11 | Marocos Bot 2.0 | pessoal | público | modelo de rating ajustado com K-factor em 5 faixas; snake draft; 10 cogs |
| 12 | faculdAIde | pessoal | fechado | grafo derivado; prefiltro de deduplicação; validação por schema que reprova |

**O Hub de Agentes tem repositório público hoje e entra sem link**, por decisão do
dono do projeto: é código da empresa e vai ser fechado. Link que morre é pior que
link nenhum.

### Saem da lista

- **Code Doc Generator** — foi absorvido pelo `backend-doc-robos` do Hub de
  Agentes. Mantê-lo é exibir a versão antiga da mesma ideia ao lado da nova.
- **Contract Analyzer** — Flask com um prompt de extração. Era o desafio técnico
  da Biofy e hoje é o item mais simples da lista, num conjunto onde o menor tem
  suíte de teste.

Não entram, e o motivo: `Hephaest` (um commit, só a especificação), `CafePuro`
(frontend sem API — `cafepuro_api/` está vazio), `legi_path` (virou o projeto de
gestão legislativa), `webdashtv`, `eSports-Team-Connect` (trabalho de
disciplina), `BotWPPVoga` (oito commits), `ContaGado` (só documento de
requisitos), e os repositórios de estudo e jogos antigos.

## Jornada

Sete faixas. A entrada nova é a Finza; a da Supporte fecha em 2026 e passa a
dizer o que ela foi de verdade — um estágio que terminou com machine learning
aplicado e um hub de agentes em produção.

**Um defeito de desenho aparece junto com a entrada nova, e tem de ser
consertado no mesmo commit:** `posicaoNaLinha` calcula
`fim = max(anoAtual, ...anos)`. Com uma entrada de 2026 e o ano atual em 2026, a
entrada da Finza cai em **100** — exatamente onde fica o marcador vazado do
roadmap. Os dois se sobrepõem, e o desenho perde a única coisa que ele existe
para dizer.

A correção é `fim = max(anoAtual + 1, ...anos)`: a barra passa a esticar um ano
além de hoje, então sempre sobra vão até o futuro e nenhuma entrada real
consegue alcançar a posição do roadmap. É a mesma intenção que o comentário
antigo já declarava ("sobra o vão até hoje — a trajetória continua
acontecendo"), agora com uma folga que a entrada do ano corrente não consome.
`journey.test.js` muda de números junto, e ganha um caso guardando que nenhuma
entrada real chega a 100.

## Stack

De quatro pastas para sete. As três novas existem porque descrevem trabalho que
o site não registra em lugar nenhum:

- **Machine Learning & Dados** — a disciplina que ele passou a exercer: sklearn,
  gradient boosting, clustering por densidade, estatística inferencial, banco
  vetorial.
- **Automação & Integrações** — n8n e WhatsApp Cloud API são o dia a dia na
  Finza, e não aparecem em nenhuma pasta existente.
- **Desenvolvimento com IA** — a habilidade que ele pediu explicitamente para
  registrar: harness próprio por projeto, skills, subagentes, hooks, camadas de
  teste. É diferencial real e não tinha onde morar.

A grade do `DevicesApp` é `repeat(auto-fill, minmax(240px, 1fr))` — absorve
qualquer número de pastas sem tocar em CSS.

## Sobre este PC

Três consertos de texto, e um deles é o que o dono do projeto chamou de "ruim ou
sem sentido":

1. **`bio_full` repete a própria headline.** A seção tem
   `bioHeadline: "Cheguei aqui pelo hardware."` e o parágrafo abaixo termina em
   "Cheguei aqui pelo hardware: meu primeiro emprego foi suporte técnico, aos 14
   anos". A headline existe para dar a ideia; o parágrafo devia desenvolvê-la, e
   estava repetindo-a.
2. **Os três `sublabel` das especificações são enchimento** — "entregues com
   excelência", "aprendizado contínuo", "soluções inovadoras". Nenhum deles diz
   nada verificável. Viram fatos.
3. **Quinta porta.** O guia tem quatro perguntas e o app de Serviços — a única
   janela cujo trabalho é converter — não é porta nenhuma. Entra, e a contagem
   da headline passa a ser derivada de `portas.length` em vez de escrita
   ("Quatro perguntas, quatro janelas" é exatamente o tipo de número que este
   projeto já viu envelhecer quatro vezes).

## Leia-me

Ganha uma quinta seção sobre como o site é construído — spec, plano, skills
próprias e o regressor visual. É a prova da habilidade de harness aplicada ao
próprio artefato que o visitante está usando, e este app já é o único lugar do
portfólio onde marocos.dev pode falar de si (decisão registrada na spec da fase
1: o site ficou deliberadamente fora da janela de Projetos).

## Versão do sistema

`3.0.1` → `3.1.0`, e a duplicação morre no caminho. Hoje a string existe em
quatro lugares: `SISTEMA.versao`, o banner do terminal em `content/contact.js`
(duas vezes, PT e EN) e `shutdown.firmwareVersion` em `i18n/os.js` (duas vezes).
O comentário de `sistema.js` já avisava "o mesmo do banner do terminal" — que é
a descrição de um defeito, não de um contrato. Os três passam a ler
`SISTEMA.versao`.

## Base de conhecimento do RAG

`backend/data/knowledge_base/profile.md` é a fonte da verdade do Marcos Virtual,
e a regra do repositório é que quando ele e `content/` discordam, **ele está
certo**. Então ele é atualizado no mesmo commit, no padrão que já tem: Finza como
seção de experiência atual, Supporte reescrita como estágio concluído, seção nova
do TCC, hard skills com ML e estatística, seção nova de engenharia de
desenvolvimento com IA, a habilidade de análise de requisitos, os doze
projetos, e as respostas de Q&A que ainda dizem "no estágio".

**Reingestão é necessária** para o agente responder com isso: subir com
`FORCE_REINGEST=true`. `RagService.ingest_data` manda um chunk por request com
`sleep(4)`, então o `profile.md` leva vários minutos.

## O que mudou de rota durante a execução

Cada item aqui foi uma correção do dono do projeto sobre algo que só ficou visível
quando estava montado. Registrados porque a lição sobrevive à tarefa:

1. **Quatorze projetos viraram doze.** Saíram Cine Sessão e Gestão Legislativa. Os
   ids em `FICHA` NÃO foram renumerados — id é identidade, ordem é o array, e
   renumerar ao reordenar trocaria a data e o `bytes` de dono em silêncio. Os
   buracos (11 e 12) documentam a remoção melhor do que a renumeração faria.

2. **A ordem deixou de ser cronológica e passou a ser por complexidade.** Como
   `bytes` já era a estimativa de complexidade, a coluna "Tamanho" ficou
   monotonicamente decrescente e a lista passou a se explicar de cima para baixo. A
   coluna de data ficou fora de ordem, e é o preço aceito: data é fato, não ranking.

3. **O Motor de Cobrança estava descrito errado, e o erro era de ênfase.** A primeira
   versão o apresentava como "produto com agentes conversacionais". Correção do dono
   do projeto: ele é um **scheduler, organizador, filtrador e gerador de ações** a
   partir de integrações, mais serviços específicos do time — os agentes são um dos
   canais de execução, não o objetivo. Descrever pela parte mais vistosa é o mesmo
   erro que um README desatualizado comete.

4. **A parte técnica de todos os projetos foi reescrita depois de uma segunda leitura
   do código.** A primeira passada leu estrutura (módulos, contagens); a segunda leu
   DECISÕES. O que a segunda encontrou e a primeira não:

   - o balanceamento do Marocos Bot **não faz permutação** — é um modelo de rating
     ajustado (elo + LP, peso de fila, bônus de winrate com K-factor decrescente em
     cinco faixas) seguido de snake draft. A descrição antiga, herdada, apontava para
     o lugar errado do projeto;
   - o Diário Oficial renderiza PDF com **Playwright**, não WeasyPrint, e tem uma
     **guarda de SSRF** porque o Chromium do servidor busca toda imagem do documento;
   - o Scope Intelligence usa **UMAP antes do HDBSCAN**, com auto-tuning por volume e
     refinamento recursivo — não "HDBSCAN sobre embeddings";
   - o SQLGuard do hub parseia com **sqlglot** e caminha a árvore sintática, o que é
     categoricamente diferente de bloquear strings;
   - o Fraud Sentinel tem um módulo de limiar que existe para **consertar um
     vazamento de dados** (o corte era calculado no próprio treino);
   - o InTec Access escreve na **fila de integração do fornecedor**, nunca nas tabelas
     dele — a assimetria é a decisão inteira do projeto.

   A regra que ficou: **ler estrutura diz o tamanho; ler decisão diz a habilidade.**

5. **A ênfase em contagem de testes e em shaders saiu.** `SISTEMA.testes`,
   `SISTEMA.cenas` e `SISTEMA.shaders` foram removidos, com eles duas seções do
   leia-me e duas linhas da ficha "Este sistema". Nos projetos, as contagens saíram
   da posição de manchete e viraram mecanismo ("a suíte aponta para um banco próprio,
   truncado antes de cada teste" no lugar de "170 casos de teste"). O argumento do
   dono do projeto: contagem é medida de ESFORÇO, e quem lê quer medida de
   JULGAMENTO.

6. **Entrou um bloco de capacidades no "Sobre este PC"**, como segundo bloco de
   informação. O diagnóstico foi certeiro: o site mostrava PROJETOS (o que ele fez) e
   STACK (as ferramentas), e nunca dizia a CAPACIDADE — que é o que um recrutador
   procura primeiro. São quatro, cada uma obrigada a ter no site algo que a comprove.

7. **Entrou um app novo: "Baixar meu contexto"** (`/contexto`). Ele exporta o
   portfólio inteiro como `.md` ou `.json` para o visitante jogar na IA dele. Três
   decisões:

   - **gerado no navegador**, a partir dos mesmos módulos que desenham as janelas, o
     que torna impossível o arquivo divergir do site;
   - **o download fica atrás de uma escolha** ("prefiro usar a minha própria IA"),
     porque com os dois caminhos abertos ao mesmo tempo eles competem e o download
     ganha sempre — ele é mais barato que formular uma pergunta. O portão é uma
     pergunta, não um pedágio: um clique, sem formulário e sem e-mail;
   - **sem data de nascimento e sem o `bytes` interno**, com teste guardando as duas
     ausências.

8. **Três defeitos de infraestrutura apareceram como efeito colateral**, e os três
   estão registrados na skill porque nenhum deles era visível em desenvolvimento:

   - o CSS do balão morava em `Dica.css`, e o Vite divide CSS por chunk — o balão do
     texto cortado montava **sem estilo nenhum** em toda rota que não carregasse a
     `Dica`. Hoje mora em `DicaBalao.css`, importado por quem EMITE a classe;
   - `AppIconButton` prometia num comentário um fallback do ícone XP que o código não
     fazia. O app novo apareceu **sem ícone** no preset XP;
   - `TextoCortado` punha `tabIndex` em texto que está dentro de `<button>` na maioria
     dos usos — controle aninhado. Resolvido com `focavel={false}`.

## Verificação

Resultado final, com o comando que produziu cada número:

| suíte | comando | resultado |
|---|---|---|
| lógica pura | `npm test` no `frontend/` | **140 passando** (eram 126; entraram os 14 de `contexto.test.js`) |
| lint | `npm run lint` | limpo |
| build | `npm run build` | limpo |
| visual + funcional | `npx playwright test` no `frontend/visual/` | **50 testes** — 24 cenas + 26 funcionais |

**22 das 24 cenas foram rebaselinadas**, e cada uma tem motivo: o app novo põe um
ícone na grade da área de trabalho, uma linha no menu Iniciar, uma linha na lateral
do explorador e um terceiro balão de aviso — chrome que aparece em quase toda cena.
Somado ao conteúdo (doze projetos, sete pastas na Stack, quinta porta, bloco de
capacidades, leia-me com três seções, versão 3.1.0 no banner do terminal), sobra
pouca cena intacta. O diff de `config` foi conferido imagem a imagem: só o ícone novo
e o balão novo, e o rótulo da taskbar — que passou a ser um `TextoCortado` — **não
moveu um pixel**.

**Quatro cenas continuaram reprovando depois do rebaseline, e não foram
rebaselinadas de novo:** `projetos` (36px), `servicos` (1px), `stack` (1px) e
`stack-claro` (67px). Todas passaram rodadas isoladamente, e `stack` passou três
vezes seguidas sobre o mesmo código. É o ruído do harness que a skill documenta —
sem GPU, SwiftShader, `workers: 1` — e a resposta certa a ele é nenhuma: rebaselinar
sobre um diff de 1 pixel troca uma referência boa por outra igualmente arbitrária, e
subir tolerância cega o eixo inteiro.

Dois testes funcionais NOVOS cobrem o que a foto não vê:

- **o balão do texto cortado** — é o primeiro teste do repositório a exercitar
  `:hover`, e ele afirma `position: fixed` no balão, que é a propriedade que só existe
  se o CSS certo entrou no bundle. É o teste que pega o bug de CSS por chunk;
- **o download do contexto** — clica, espera o evento de download, lê o arquivo do
  disco e confere nome, tamanho, cabeçalho e a ausência da data de nascimento. É o
  único artefato que sai deste projeto para a máquina de outra pessoa.

## O que falta, e é decisão do dono do projeto

**A reingestão do RAG.** `backend/data/knowledge_base/profile.md` foi reescrito, mas
o Marcos Virtual só passa a responder com isso depois de subir com
`FORCE_REINGEST=true`. E o `assistant.betaNotice` já anuncia "base atualizada até
Ago/2026" — ou seja, **enquanto a reingestão não rodar, essa frase é uma promessa que
o agente não cumpre.** É o único lugar desta entrega onde o site afirma algo que
ainda não é verdade, e é de propósito: a alternativa era deixar a data velha e
esquecer dela.
