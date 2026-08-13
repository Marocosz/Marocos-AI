/**
 * O PERFIL — alinhado a `backend/data/knowledge_base/profile.md`.
 *
 * Mesma regra da jornada: se este arquivo e o `profile.md` discordarem, o
 * `profile.md` está certo. Ele alimenta o RAG, então divergir daqui é o site
 * contradizendo o próprio assistente.
 *
 * HISTÓRICO DE DOIS CAMPOS QUE JÁ FORAM E VOLTARAM — leia antes de "consertar"
 * qualquer um dos dois, porque os dois parecem erro e não são:
 *
 * 1. FORMATURA. Este arquivo já disse "Formado em Gestão da Informação pela UFU",
 *    foi corrigido para "8º período" (a base dizia isso, e dizer-se formado antes
 *    de sê-lo é o tipo de detalhe que um recrutador confere), e voltou a dizer
 *    FORMADO em agosto de 2026 — porque agora é verdade. A conclusão é deste mês.
 *
 * 2. `stats`. Trazia "4+ Serviços Freelance", "4+ Anos de Experiência" e "20+
 *    Projetos Totais"; uma passada trocou os três por fatos com data, sob o
 *    argumento de que eram números que ninguém consegue verificar. Voltaram por
 *    DECISÃO EXPLÍCITA do dono do projeto, que é quem sabe a própria contagem.
 *
 *    O que fica registrado do argumento antigo, porque continua valendo como
 *    aviso: estes três números não estão no `profile.md`, então o Marcos Virtual
 *    não consegue corroborá-los se alguém perguntar. Se um deles for questionado,
 *    o conserto é acrescentar o fato à base — não apagar daqui.
 *
 * O objeto `hero` foi removido. Ele descrevia a landing page de rolagem que o
 * refactor apagou — `sectionLabel: "01. / PORTFÓLIO"`, um `title` com `<br />`
 * dentro, `cta`, `scroll` e um `f11` que virou o balão da área de trabalho.
 * Nenhum componente lia nada disso.
 */

/**
 * A IDADE, DERIVADA DA DATA DE NASCIMENTO.
 *
 * O `profile.md` diz "nasci em 14 de dezembro de 2003"; o site precisa dizer
 * quantos anos isso dá HOJE. Escrever o número no conteúdo é escrever um valor
 * com data de validade, e o dia em que ele vence é justamente o dia em que
 * ninguém está lendo este arquivo.
 *
 * A data de nascimento é quebrada à mão em vez de ir para o `Date`: um
 * `new Date('2003-12-14')` é meia-noite UTC, e comparado com uma data local a
 * oeste de Greenwich — que é onde este site roda — o aniversário chega um dia
 * antes. Comparando três inteiros não há fuso nenhum envolvido.
 */
export const idadeEm = (nascimentoISO, hoje = new Date()) => {
  const [ano, mes, dia] = nascimentoISO.split('-').map(Number);
  const mesAtual = hoje.getMonth() + 1;
  const aindaNaoFezAniversario =
    mesAtual < mes || (mesAtual === mes && hoje.getDate() < dia);
  return hoje.getFullYear() - ano - (aindaNaoFezAniversario ? 1 : 0);
};

/**
 * O `maquina` SAIU DAQUI (2026-08-12), e o fato não se perdeu.
 *
 * Eram sete linhas de hardware — notebook, processador, vídeo, memória, sistema,
 * editor e café — vindas da seção "Meu Setup de Desenvolvimento" do
 * `profile.md`, e o único consumidor era a ficha "Este computador" do "Sobre este
 * PC". O dono do projeto tirou essa ficha da janela: o setup fica para o Marcos
 * Virtual responder quando alguém perguntar.
 *
 * O `profile.md` continua com tudo, e é ele que alimenta o RAG — então o
 * assistente responde igual. O que saiu foi a duplicata que existia só para
 * desenhar uma tabela, e dado sem consumidor é o tipo de coisa que a próxima
 * pessoa tenta manter em sincronia sem saber que ninguém lê.
 */

const profileDataEn = {
  /**
   * O NOME NÃO APARECIA EM PIXEL NENHUM DO CONTEÚDO. Estava no `<title>` da aba,
   * no copyright do terminal e no menu Iniciar — nunca no corpo do "Sobre este
   * PC", que é o app que abre sozinho para quem chega sem deep link. Quem entrava
   * por `/sobre` lia um cargo e uma frase e saía sem saber de quem é o site.
   *
   * `nascimento` é a data, não a idade — a idade sai de `idadeEm()` acima, porque
   * número escrito à mão envelhece errado.
   */
  nome: 'Marcos Rodrigues',
  local: 'Uberlândia – MG',
  nascimento: '2003-12-14',

  /**
   * FIEL À BASE, E NEUTRO. O `profile.md` diz "Aberto a propostas de projetos
   * Freelance ... estou empregado atualmente". "Disponível" sugeriria outra
   * coisa; "aberto a freelance" é o que está escrito lá, e é o que aparece com o
   * pontinho no herói do "Sobre este PC".
   */
  status: 'open to freelance',

  /**
   * `title` saiu junto do `hero`. Era `'>_ WHOAMI'`, e o único consumidor era o
   * kicker do "Sobre este PC" — que agora mostra o CARGO, porque num guia a
   * primeira linha tem de dizer o que a pessoa faz, não repetir o nome do app
   * que o visitante acabou de abrir.
   */
  /**
   * O CARGO MORA EM QUATRO SUPERFÍCIES e elas têm de dizer a mesma coisa: este
   * campo (o eyebrow do herói do "Sobre este PC"), `signature.role` em
   * `i18n/os.js` (a assinatura da área de trabalho), o `whoami` do Terminal e o
   * "Main Processor" do POST de BIOS. Já divergiram uma vez — a assinatura dizia
   * "AI Developer & Full-Stack Engineer" enquanto o guia dizia outra coisa.
   *
   * "AI Software Engineer" NÃO É TRADUZIDO no bloco português, e é decisão do dono
   * do projeto: é assim que o cargo é escrito no mercado, nos dois idiomas. O que
   * traduz é a segunda metade.
   */
  role: 'AI Software Engineer | Full-Stack Developer',

  /**
   * UMA FRASE, E ELA PROVA EM VEZ DE VENDER. A anterior — "I transform data
   * into actionable intelligence through AI Agents, scalable architectures and
   * strategic automation" — era headline de LinkedIn: verdadeira para umas
   * cinquenta mil pessoas e verificável por nenhuma.
   *
   * Esta aponta para o que o visitante já tem na tela. Aparece na assinatura da
   * área de trabalho e no topo do guia, então precisa caber nas duas.
   */
  bio_highlight: 'I build AI systems that reach production. This site is one of them.',

  /**
   * ESTE PARÁGRAFO REPETIA A PRÓPRIA HEADLINE, e era o defeito mais visível da
   * janela. A seção tem `bioHeadline: "I got here through hardware."` e o texto
   * abaixo dela terminava em "I got here through hardware: my first job was
   * technical support at 14" — a headline existe para dar a ideia, e o parágrafo
   * devia DESENVOLVÊ-LA, não dizê-la de novo com mais palavras.
   *
   * A versão nova assume que a headline já foi lida (ela está dois centímetros
   * acima) e conta o que aconteceu depois. Também conserta o fato desatualizado:
   * o emprego é a Finza desde março de 2026, e esta frase passou oito meses
   * dizendo Supporte Logística.
   */
  bio_full:
    "That first job was technical support, at 14 — someone else's machine in my hands and a problem that had to actually be solved. Electronics came next, then a degree in Information Management at UFU, which sits between Administration and Computer Science with data in the middle, finished in August 2026. Today I am an AI and automation developer at Finza, working on a collections engine with conversational agents in production — and doing requirements analysis, which turns out to be half the job: sitting in the meeting where a business pain becomes a technical scope. In parallel I keep freelancing, owning the whole cycle from the first conversation to the deploy and whatever breaks after it.",

  /**
   * O QUE ELE É CONTRATADO PARA FAZER — o bloco que faltava.
   * ==================================================
   * Pedido do dono do projeto, e o diagnóstico dele estava certo: o site mostrava
   * PROJETOS (o que ele fez) e STACK (as ferramentas que ele usa), e em nenhum lugar
   * dizia numa frase a CAPACIDADE. Quem lê um portfólio precisa dos três, e o do
   * meio é o que um recrutador procura primeiro — ele não contrata um repositório,
   * contrata alguém que resolve uma classe de problema.
   *
   * A ORDEM É A DO MERCADO. A primeira é a que o mercado mais disputa hoje e é onde
   * ele tem mais profundidade; a última é a que quase ninguém lista e por isso
   * diferencia. Nenhuma delas é uma tecnologia — tecnologia é a faixa logo abaixo
   * desta seção, e repetir a lista aqui seria dizer a mesma coisa duas vezes na mesma
   * tela.
   *
   * ==================================================
   * O BENEFÍCIO PRIMEIRO, E UMA ÂNCORA TÉCNICA — NÃO CINCO.
   *
   * A primeira versão destes quatro textos foi reprovada inteira pelo dono do
   * projeto, e o diagnóstico dele estava certo: os quatro descreviam COMO a coisa é
   * feita e nenhum dizia o que muda para quem lê. Eram listas de decisão de
   * implementação — "grafo de estados, não swarm", "tsvector e GIN antes de apelar
   * para um segundo banco", "sessão no servidor quando token não pode ser revogado" —
   * empilhadas em frases de cinco orações.
   *
   * O erro tem nome dentro deste próprio repositório. `content/servicos.js` declara
   * que "toda afirmação sai com recibo"; aqueles textos eram recibo SEM afirmação.
   * Detalhe de implementação é excelente no card de um projeto, onde já existe um
   * problema declarado que ele resolve. Numa lista de capacidades ele é ruído: o
   * leitor não tem contexto para saber por que "roteador barato antes do modelo caro"
   * deveria importar para ele.
   *
   * A forma que ficou, e que vale manter em qualquer reescrita futura:
   *
   *   1. abre com o que o leitor GANHA, ou com a objeção que ele já tem na cabeça
   *   2. UMA âncora técnica concreta, para provar que não é marketing
   *   3. fecha com a consequência
   *
   * ==================================================
   * E A SEGUNDA CORREÇÃO DO BLOCO DE AGENTES, que ensina outra coisa.
   *
   * A reescrita seguindo a forma acima acertou o formato e errou o ESCOPO: ela dizia
   * "agentes de IA que aguentam falar com cliente", com "cada conversa vira número"
   * no fecho. Ficou toda ancorada em agente conversacional — e conversacional é
   * MINORIA do que ele faz.
   *
   * O código diz isso com clareza: o hub da Supporte escreve SQL, o Scope
   * Intelligence agrupa chamados e explica o padrão sem trocar uma palavra com
   * ninguém, o de qualidade monta um DOCX com portas de aprovação humana entre cinco
   * agentes, os 18 da Bússola emitem sugestão tipada que o frontend desenha como
   * card, e o do InTec Access escreve relatório de segurança num agendador. Um único
   * é chat de verdade.
   *
   * A lição: **ao resumir uma capacidade, o exemplo mais vistoso rouba o escopo.**
   * Chatbot é o que todo mundo imagina quando ouve "agente", então escrever a partir
   * dele estreita a afirmação sem que o autor perceba. O texto novo abre justamente
   * negando esse padrão, porque é aí que está a diferença.
   *
   * O que saiu daqui não se perdeu: a métrificação de agente conversacional é o
   * argumento central do card do Motor de Cobrança, onde ela tem contexto.
   *
   * E são curtos. Eles vivem numa grade de duas colunas no "Sobre este PC": quatro
   * parágrafos de seis linhas ali não são densidade, são parede.
   *
   * CADA UMA TEM DE SER SUSTENTADA POR ALGO QUE EXISTE NO SITE. É a regra que
   * impede a seção de virar anúncio: se uma capacidade não tem projeto, jornada ou
   * janela que a comprove, ela sai. O mapa hoje:
   *
   *   agentes    → Hub de Agentes, Bússola V2, e o próprio Marcos Virtual
   *   ml         → Fraud Sentinel, o TCC, o Scope Intelligence dentro do Hub
   *   produto    → Portal Acadêmico, Diário Oficial, Portal do Cidadão
   *   automacao  → Portal de Controle de Acesso, e a entrada da Finza na jornada
   *   harness    → o leia-me deste site, e o faculdAIde nos projetos
   *
   * `id` é chave e não rótulo, como no resto do projeto: ele vira modificador de
   * classe no CSS. O texto é que traduz.
   */
  capacidades: [
    {
      id: 'agentes',
      titulo: 'AI agents that produce work, not conversation',
      texto:
        'A chatbot is the easiest shape and almost never the most useful one. Most of my agents talk to nobody: they write the query the analyst could not write, assemble the document, cluster a thousand support tickets and explain the pattern, or emit the action another system executes — which means the output has to be valid for a machine, not merely readable by a person. Where the decision matters there is a human approval gate in the middle, and where the model does not know, it says so instead of inventing.',
    },
    {
      id: 'produto',
      titulo: 'One person from the first requirement to production',
      texto:
        'You talk to one person from the first conversation to the system running, and after it. There is no handoff for the project to fall through: I scope it, build the backend and the front end, deploy it on infrastructure I run myself, and stay responsible for whatever breaks. That last part is where most freelance work quietly ends.',
    },
    {
      id: 'automacao',
      titulo: 'Automation where the software will not cooperate',
      texto:
        'The repetitive work is rarely sitting in a system that helps you remove it. I automate over closed third-party software too: I map what it stores from the outside, and write back through the channel the vendor itself provides, never into its tables. You stop doing it by hand without having to replace the system you already paid for.',
    },
    {
      id: 'harness',
      titulo: 'AI speed without the technical debt that usually comes with it',
      texto:
        'AI makes everyone faster; what separates people is how much it knows about your codebase. I build a harness per project — the conventions, the mistakes already paid for in debugging, and a verification step the agent is not allowed to skip before claiming something works. Fast stops meaning fragile, and that transfers to your repository, not just mine.',
    },
  ],

  /**
   * Ver o histórico no cabeçalho do arquivo antes de mexer: estes três já saíram
   * uma vez e voltaram por decisão do dono do projeto.
   *
   * O QUE MUDOU AQUI FOI O `sublabel`, e é o outro conserto de texto desta passada.
   * Eram "delivered with excellence", "continuous learning" e "innovative
   * solutions" — três frases que não dizem nada verificável, ocupando o lugar mais
   * nobre do trilho técnico da janela. Um número grande seguido de elogio genérico
   * lê como banner; seguido de um FATO, lê como ficha.
   *
   * Os números são os que o dono do projeto confirmou: 7+ freelance (quatro
   * antigos mais três desde a última atualização), 4+ anos contando a experiência
   * como DESENVOLVEDOR — e é por isso que o `whoami` do terminal pode dizer "na
   * área desde 2018" sem contradizer esta ficha: são duas contagens diferentes de
   * duas coisas diferentes.
   */
  stats: [
    { number: '7+', label: 'Freelance services', sublabel: 'requirements to deploy' },
    { number: '4+', label: 'Years of experience', sublabel: 'employed since 2025' },
    { number: '30+', label: 'Projects in total', sublabel: 'across 40 repositories' },
  ],

  /**
   * DOIS CONSUMIDORES, e é bom saber disso antes de mexer na ordem: o carrossel
   * de stack do "Sobre este PC" e o `neofetch` do Terminal, que junta tudo numa
   * linha só. Nove itens era o PISO — é o que faz uma cópia da faixa ser mais larga
   * que a janela, que é o que o laço do carrossel precisa para não abrir buraco.
   * Onze continua acima do piso, então a faixa segue fechando o laço.
   *
   * Entraram três, e cada um por um motivo: `Machine Learning` porque virou
   * trabalho de verdade (ver a entrada da Supporte na jornada e o Fraud Sentinel
   * nos projetos), `Supabase` e `n8n` porque são o dia a dia na Finza e não
   * apareciam em superfície nenhuma do site.
   */
  skills_highlight: [
    'Python',
    'FastAPI',
    'LangGraph',
    'GenAI & RAG',
    'Machine Learning',
    'PostgreSQL',
    'Supabase',
    'React',
    'n8n',
    'Docker',
    'DevOps',
  ],
};

const profileDataPt = {
  /** Ver as notas no bloco em inglês, acima. */
  nome: 'Marcos Rodrigues',
  local: 'Uberlândia – MG',
  nascimento: '2003-12-14',
  status: 'aberto a freelance',

  /** Ver a nota no bloco em inglês: quatro superfícies, e "AI Software Engineer"
   *  não traduz de propósito. */
  role: 'AI Software Engineer | Desenvolvedor Full-Stack',

  bio_highlight: 'Construo sistemas com IA que chegam em produção. Este site é um deles.',

  /** Ver a nota no bloco em inglês: o parágrafo anterior repetia a headline da
   *  própria seção, e dizia Supporte quando já era Finza. */
  bio_full:
    'Esse primeiro emprego foi suporte técnico, aos 14 anos — equipamento dos outros na minha mão e um problema que precisava ser resolvido de verdade. Depois veio a eletrônica, e depois a graduação em Gestão da Informação na UFU, que fica entre Administração e Ciência da Computação com dados no meio, concluída em agosto de 2026. Hoje sou desenvolvedor de IA e automações na Finza, num motor de cobrança com agentes conversacionais em produção — e fazendo análise de requisitos, que acabou sendo metade do trabalho: estar na reunião onde uma dor de negócio vira escopo técnico. Em paralelo sigo com freelance, assumindo o ciclo inteiro, da primeira conversa ao deploy e ao que quebra depois dele.',

  /** Ver a nota longa no bloco em inglês: cinco capacidades, na ordem do mercado, e
   *  cada uma tem de ter no site algo que a comprove. */
  capacidades: [
    {
      id: 'agentes',
      titulo: 'Agentes de IA que produzem trabalho, não conversa',
      texto:
        'Chatbot é o formato mais fácil e quase nunca o mais útil. A maior parte dos meus agentes não fala com ninguém: eles escrevem a consulta que o analista não sabia escrever, montam o documento, agrupam mil chamados e explicam o padrão, ou emitem a ação que outro sistema executa — e para isso a saída tem de ser válida para uma máquina, não só legível para uma pessoa. Onde a decisão é séria existe aprovação humana no meio, e onde o modelo não sabe, ele diz que não sabe em vez de inventar.',
    },
    {
      id: 'produto',
      titulo: 'Uma pessoa do primeiro requisito até a produção',
      texto:
        'Você fala com uma pessoa da primeira conversa até o sistema no ar, e depois dele. Não existe a passagem de bastão onde o projeto cai: eu levanto o escopo, construo o backend e o frontend, publico em infraestrutura que eu mesmo administro, e continuo respondendo pelo que quebrar. É justamente essa última parte que a maioria dos freelances não faz.',
    },
    {
      id: 'automacao',
      titulo: 'Automação onde o software não colabora',
      texto:
        'O trabalho repetitivo quase nunca está num sistema que ajuda você a tirá-lo de lá. Eu automatizo também sobre software fechado de terceiro: mapeio o que ele guarda por fora e devolvo pelo canal que o próprio fornecedor oferece, nunca escrevendo nas tabelas dele. Você para de fazer à mão sem ter que trocar o sistema que já pagou.',
    },
    {
      id: 'harness',
      titulo: 'Velocidade com IA sem a dívida técnica que ela costuma trazer',
      texto:
        'IA deixa qualquer um mais rápido; o que separa as pessoas é quanto ela sabe do seu código. Eu monto um harness por projeto — as convenções, os erros que já custaram depuração, e uma verificação que o agente não tem permissão de pular antes de afirmar que algo funciona. Rápido deixa de significar frágil, e isso vale para o seu repositório, não só para os meus.',
    },
  ],

  /** Ver o histórico no cabeçalho do arquivo e a nota no bloco em inglês: os três
   *  `sublabel` eram elogio genérico e viraram fato. */
  stats: [
    { number: '7+', label: 'Serviços freelance', sublabel: 'do requisito ao deploy' },
    { number: '4+', label: 'Anos de experiência', sublabel: 'empregado desde 2025' },
    { number: '30+', label: 'Projetos totais', sublabel: 'em 40 repositórios' },
  ],

  /** Ver a nota no bloco em inglês: dois consumidores, nove é o piso do laço, e os
   *  três que entraram têm cada um o seu motivo. */
  skills_highlight: [
    'Python',
    'FastAPI',
    'LangGraph',
    'GenAI & RAG',
    'Machine Learning',
    'PostgreSQL',
    'Supabase',
    'React',
    'n8n',
    'Docker',
    'DevOps',
  ],
};

export const getProfileData = (lang) => (lang === 'pt' ? profileDataPt : profileDataEn);
