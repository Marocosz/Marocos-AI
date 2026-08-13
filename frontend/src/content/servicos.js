import { Server, LayoutTemplate, BrainCircuit, Workflow } from 'lucide-react';

/**
 * OS SERVIÇOS — a oferta, as etapas da entrega e a máquina onde tudo roda.
 *
 * DE ONDE ISTO VEIO. O bloco `hosting` morava em `content/contact.js` e só
 * aparecia se o visitante adivinhasse o comando `vps` no Terminal. O comentário
 * que ficou lá conta o resto: antes dele havia 55 palavras de anúncio com quatro
 * bullets de folheto, cortadas por estarem no meio de um app de CONTATO.
 *
 * O corte estava certo e a conclusão que faltava é esta: o texto não era ruim,
 * estava no lugar errado. Agora existe o lugar.
 *
 * ==================================================
 * A REGRA DESTE ARQUIVO: TODA AFIRMAÇÃO SAI COM RECIBO.
 *
 * Nenhum serviço aqui reconta o que outra janela já conta. Cada um tem uma
 * descrição curta e um campo `prova` — o id do app que sustenta a afirmação — e é
 * o `ServicesApp` que transforma isso numa porta.
 *
 * Instrução literal do dono do projeto: "fale de tudo isso, mas não seja
 * repetitivo em relação ao que já tem no projeto; dá um resumo e linka onde tem a
 * informação". Isso não é cuidado de redação, é a estrutura da página — e de
 * quebra é o que faz ela vender PROVANDO em vez de anunciar.
 *
 * ==================================================
 * A ESPINHA É SEPARADA DO TEXTO, e não é preciosismo.
 *
 * `content/tech.js` duplica o array inteiro por idioma, e ali funciona porque o
 * que se duplica é texto. Aqui um dos campos é um **id de app**: duplicá-lo
 * significaria que um `prova: 'projetcs'` errado em um dos idiomas dá uma porta
 * quebrada só naquele idioma — e a suíte funcional roda em pt, então o inglês
 * poderia ficar quebrado sem ninguém ver.
 *
 * Com a espinha única, ícone, ordem, tipo de inicialização e destino existem uma
 * vez só. O idioma só escolhe as palavras.
 */

/**
 * O QUE NÃO MUDA COM O IDIOMA.
 *
 * `inicializacao` é a chave do rótulo em `i18n/os.js`, não o rótulo — mesma
 * decisão que os níveis de `content/tech.js` ("traduz-se a exibição, nunca o
 * dado"), e pela mesma razão: é ela que o CSS usa como modificador de classe.
 *
 * `prova` é o id de um app do registry. `destaque` marca o item que recebe a
 * faixa — um só, senão destaque deixa de destacar.
 */
const espinha = [
  {
    id: 'hospedagem',
    icon: Server,
    inicializacao: 'automatico',
    /**
     * A PROVA É O LEIA-ME, e não a janela de projetos: o argumento aqui não é
     * "já hospedei coisas", é "o site que você está usando agora está na minha
     * VPS" — e é o leia-me que explica a máquina por dentro.
     */
    prova: 'readme',
    destaque: true,
  },
  {
    id: 'sistemas',
    icon: LayoutTemplate,
    inicializacao: 'sobDemanda',
    prova: 'projects',
  },
  {
    id: 'agentes',
    /**
     * `BrainCircuit` e não `Bot`: `Bot` é o ícone do Marcos Virtual no registry, e
     * repeti-lo aqui faria o card parecer um atalho para aquele app em vez de um
     * serviço que por acaso tem a demonstração dele como prova.
     */
    icon: BrainCircuit,
    inicializacao: 'sobDemanda',
    prova: 'assistant',
  },
  {
    id: 'automacao',
    icon: Workflow,
    inicializacao: 'sobDemanda',
    /**
     * A Jornada, porque a prova de automação não é um projeto de portfólio: é o
     * emprego. Ele faz isso na Finza — n8n e API do WhatsApp, todo dia — e a
     * trajetória é onde isso está registrado com data.
     *
     * (Este comentário dizia "área de inovação da Supporte Logística" e ficou oito
     * meses desatualizado, junto com todas as outras superfícies que citavam o
     * emprego. A prova em si não mudou: continua sendo a Jornada.)
     */
    prova: 'history',
  },
];

/**
 * AS ETAPAS DA ENTREGA — o fluxograma.
 *
 * Cinco, e a quinta é a que vende: quase todo freelance termina na entrega. O
 * `id` vira classe e chave de teste; o número mostrado é derivado do índice, não
 * escrito.
 */
const ETAPAS = ['conversa', 'escopo', 'construcao', 'noAr', 'depois'];

/**
 * O QUE A VPS TEM HOJE — conferido em 2026-08-12 no painel do Coolify.
 *
 * NÚMERO NA INTERFACE NÃO SE ESCREVE À MÃO, e este é o pior tipo: ele muda sem
 * ninguém mexer no site. Fica numa constante única (os dois idiomas leem daqui),
 * com o procedimento de reconferência escrito ao lado.
 *
 * ESTE NÚMERO FICA, e vale dizer por que — a contagem de testes e a de shaders
 * saíram do site na mesma passada, por não interessarem a quem lê. A diferença é
 * que "10 aplicações no ar" é o argumento comercial desta janela: ele prova escala
 * de infraestrutura para alguém decidindo se contrata hospedagem. "46 testes" era
 * o site se elogiando.
 *
 * COMO RECONFERIR: painel do Coolify -> visão geral do servidor. `aplicacoes` é a
 * contagem de applications; `bancos`, a de databases.
 *
 * E O QUE NÃO ENTRA AQUI: os NOMES das aplicações. Boa parte é de cliente, e
 * nome de cliente numa página pública é decisão do dono do projeto, não do site.
 * A contagem prova a escala sem entregar quem é.
 */
const VPS = {
  aplicacoes: 10,
  bancos: 1,
};

const servicosPt = {
  sectionLabel: '07. / SERVIÇOS',

  /**
   * O HERÓI É UMA PERGUNTA, e não um rótulo de seção. Esta janela é a única do
   * portfólio cujo trabalho é converter, e quem chega aqui não quer saber o nome
   * do app — quer saber se o problema dele cabe.
   */
  title: 'Precisando de um serviço?',
  subtitle:
    'Eu construo, coloco no ar e cuido do que quebra depois. Do site que precisa existir ao agente de IA que ninguém sabe fazer — e a hospedagem é minha, então o seu projeto não fica preso ao plano de ninguém.',
  /** `%d` vem de `servicos.length` — número na interface não se escreve à mão. */
  statusLinha: '%d serviços · todos em execução',

  servicos: {
    hospedagem: {
      nome: 'Hospedagem gerenciada',
      descricao:
        'Sua aplicação na minha VPS, com deploy, banco, certificado e monitoramento por minha conta. Você não abre terminal nenhum.',
      provaRotulo: 'este site roda nela',
    },
    sistemas: {
      nome: 'Sistemas e sites sob medida',
      descricao:
        'Do problema ao ar. React na frente, Python atrás, e o ciclo inteiro comigo — inclusive o que quebra depois da entrega.',
      provaRotulo: 'os projetos, por dentro',
    },
    agentes: {
      nome: 'Agentes de IA e RAG',
      descricao:
        'Não é plugar uma API de chat. É grafo de decisão, recuperação sobre os seus dados e uma guarda que prefere dizer "não sei" a inventar.',
      provaRotulo: 'a demonstração está a um clique',
    },
    automacao: {
      nome: 'Automação e integrações',
      descricao:
        'O trabalho repetitivo que hoje é feito à mão vira integração entre os sistemas que você já usa — n8n, WhatsApp, APIs e rotinas que rodam sem ninguém apertar nada. Inclusive sobre sistema fechado, lendo por fora o que ele não exporta.',
      provaRotulo: 'é o que faço no dia a dia',
    },
  },

  /**
   * O TEXTO DA ETAPA CRESCEU quando o fluxograma virou vertical alternado.
   *
   * Na versão horizontal cada etapa tinha ~130px de coluna, ou seja ~22
   * caracteres por linha, e o texto precisava caber em duas linhas. Em zigue-zague
   * cada uma tem quase METADE da largura da janela — e aí o limite deixa de ser
   * geométrico e passa a ser de leitura. É onde a venda de verdade cabe: cada
   * etapa responde a um medo específico de quem contrata freelance.
   */
  etapas: {
    conversa: {
      titulo: 'Conversa',
      texto:
        'Você me manda o problema, não um documento de requisitos. Na primeira conversa eu digo se dá para fazer, quanto tempo pensa levar — e digo também quando o trabalho não for para mim.',
    },
    escopo: {
      titulo: 'Escopo e proposta',
      texto:
        'Volto com o que entra, o que fica de fora, o prazo e o preço. Por escrito, antes de qualquer linha de código, para ninguém descobrir surpresa no meio do caminho.',
    },
    construcao: {
      titulo: 'Construção',
      texto:
        'Repositório aberto desde o primeiro commit e uma versão de teste no ar bem antes do fim. Você acompanha o progresso em vez de esperar uma entrega no escuro.',
    },
    noAr: {
      titulo: 'No ar',
      texto:
        'Deploy na infraestrutura, HTTPS, domínio apontado e monitoramento ligado. Entregar é o projeto rodando na internet, não um arquivo compactado no seu e-mail.',
    },
    depois: {
      titulo: 'Depois',
      texto:
        'O que quebrar continua sendo meu. Você fala comigo direto — sem abrir chamado, sem fila de atendimento e sem alguém que nunca leu o código tentando adivinhar o que houve.',
    },
  },

  /**
   * A FICHA QUE APARECE DENTRO DO MONITOR.
   *
   * Duas linhas vêm de `VPS` e mudam sozinhas no mundo real — são as únicas com
   * número, e por isso são as únicas interpoladas.
   */
  maquina: {
    janela: 'vps · marocos.dev',
    status: 'ONLINE',
    linhas: [
      { rotulo: 'Aplicações no ar', valor: String(VPS.aplicacoes) },
      { rotulo: 'Banco', valor: 'PostgreSQL gerenciado' },
      { rotulo: 'Orquestração', valor: 'Docker + Coolify' },
      { rotulo: 'Proxy', valor: 'Traefik · HTTPS automático' },
      { rotulo: 'Deploy', valor: 'Contínuo, a partir do git' },
      { rotulo: 'Backup', valor: 'Automático, com retenção' },
      { rotulo: 'Suporte', valor: 'Direto comigo' },
    ],
  },

  /**
   * A MANCHETE QUE O TERMINAL IMPRIME no comando `vps`.
   *
   * Duas linhas, e só. A ficha completa é a seção "A máquina" desta janela — se o
   * terminal repetisse a lista, o site diria a mesma coisa em dois lugares, que é
   * exatamente o que esta página existe para não fazer.
   */
  terminal: {
    badge: 'INFRAESTRUTURA',
    titulo: 'Rodo minha própria VPS — este site está nela.',
    descricao: 'Também hospedo e mantenho projetos de clientes lá.',
    ponteiro: 'abrir a janela de Serviços',
  },
};

const servicosEn = {
  sectionLabel: '07. / SERVICES',

  /** Ver a nota no bloco em português: o herói é uma pergunta, não um rótulo. */
  title: 'Need something built?',
  subtitle:
    'I build it, put it live, and look after whatever breaks later. From the site that simply has to exist to the AI agent nobody knows how to build — and the hosting is mine, so your project is not locked into anyone else’s plan.',
  statusLinha: '%d services · all running',

  servicos: {
    hospedagem: {
      nome: 'Managed hosting',
      descricao:
        'Your application on my VPS, with deploy, database, certificate and monitoring on me. You never open a terminal.',
      provaRotulo: 'this site runs on it',
    },
    sistemas: {
      nome: 'Custom systems and sites',
      descricao:
        'From the problem to production. React in front, Python behind, and the whole cycle mine — including what breaks after delivery.',
      provaRotulo: 'the projects, from the inside',
    },
    agentes: {
      nome: 'AI agents and RAG',
      descricao:
        'Not a chat API bolted on. A decision graph, retrieval over your own data, and a guard that would rather say "I do not know" than invent.',
      provaRotulo: 'the demo is one click away',
    },
    automacao: {
      nome: 'Automation and integrations',
      descricao:
        'The repetitive work done by hand today becomes an integration between the systems you already use — n8n, WhatsApp, APIs and routines that run without anyone pressing anything. Including over closed systems, reading from the outside what they will not export.',
      provaRotulo: 'it is what I do day to day',
    },
  },

  /** Ver a nota no bloco em português: o texto cresceu com o zigue-zague. */
  etapas: {
    conversa: {
      titulo: 'Talk',
      texto:
        'You send me the problem, not a requirements document. In the first conversation I tell you whether it can be done and roughly how long — and I also tell you when the job is not for me.',
    },
    escopo: {
      titulo: 'Scope and quote',
      texto:
        'I come back with what is in, what is out, the timeline and the price. In writing, before a single line of code, so nobody finds a surprise halfway through.',
    },
    construcao: {
      titulo: 'Build',
      texto:
        'Repository open from the first commit and a staging version live well before the end. You follow the progress instead of waiting for a delivery in the dark.',
    },
    noAr: {
      titulo: 'Live',
      texto:
        'Deploy on the infrastructure, HTTPS, domain pointed and monitoring switched on. Delivering means the project running on the internet, not a zip file in your inbox.',
    },
    depois: {
      titulo: 'After',
      texto:
        'Whatever breaks is still mine. You talk to me directly — no ticket to open, no support queue, and nobody who has never read the code guessing what went wrong.',
    },
  },

  maquina: {
    janela: 'vps · marocos.dev',
    status: 'ONLINE',
    linhas: [
      { rotulo: 'Apps running', valor: String(VPS.aplicacoes) },
      { rotulo: 'Database', valor: 'Managed PostgreSQL' },
      { rotulo: 'Orchestration', valor: 'Docker + Coolify' },
      { rotulo: 'Proxy', valor: 'Traefik · automatic HTTPS' },
      { rotulo: 'Deploy', valor: 'Continuous, from git' },
      { rotulo: 'Backup', valor: 'Automatic, with retention' },
      { rotulo: 'Support', valor: 'Straight from me' },
    ],
  },

  terminal: {
    badge: 'INFRASTRUCTURE',
    titulo: 'I run my own VPS — this site is on it.',
    descricao: 'I also host and maintain client projects there.',
    ponteiro: 'open the Services window',
  },
};

/**
 * Junta a espinha com as palavras do idioma. A ORDEM é sempre a da espinha —
 * reordenar a lista é mexer num lugar só, e os dois idiomas acompanham.
 *
 * OS NOMES DE CAMPO NÃO PODEM COLIDIR, e é uma armadilha real deste formato: o
 * texto entra DEPOIS no spread, então uma chave repetida em `dados.servicos[id]`
 * sobrescreve em silêncio a da espinha. Foi por isso que o rótulo da prova se
 * chama `provaRotulo` e não `prova` — com os dois iguais, o appId de destino
 * virava a frase e todas as portas paravam de abrir, sem erro nenhum no console.
 */
const montar = (dados) => ({
  ...dados,
  servicos: espinha.map((s) => ({ ...s, ...dados.servicos[s.id] })),
  etapas: ETAPAS.map((id, i) => ({ id, numero: i + 1, ...dados.etapas[id] })),
});

export const getServicosData = (lang) =>
  montar(lang === 'pt' ? servicosPt : servicosEn);
