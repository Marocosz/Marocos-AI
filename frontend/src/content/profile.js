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
  role: 'Full Stack Developer & AI',

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

  bio_full:
    "I hold a degree in Information Management from UFU — a course that sits between Administration and Computer Science with data in the middle — completed in August 2026. I work on the innovation team at Supporte Logística building full stack solutions with AI, and I freelance on the side — owning the whole cycle, from understanding the problem to the deploy and whatever breaks after it. I got here through hardware: my first job was technical support at 14.",

  /** Ver o histórico no cabeçalho do arquivo antes de mexer: estes três já saíram
   *  uma vez e voltaram por decisão do dono do projeto. */
  stats: [
    { number: '4+', label: 'Freelance services', sublabel: 'delivered with excellence' },
    { number: '4+', label: 'Years of experience', sublabel: 'continuous learning' },
    { number: '20+', label: 'Projects in total', sublabel: 'innovative solutions' },
  ],

  /**
   * DOIS CONSUMIDORES, e é bom saber disso antes de mexer na ordem: o carrossel
   * de stack do "Sobre este PC" e o `neofetch` do Terminal, que junta tudo numa
   * linha só. Nove itens é o que faz uma cópia da faixa ser mais larga que a
   * janela, que é o que o laço do carrossel precisa para não abrir buraco.
   */
  skills_highlight: [
    'Python',
    'FastAPI',
    'LangChain',
    'GenAI & RAG',
    'Docker',
    'PostgreSQL',
    'React',
    'Data Science',
    'DevOps',
  ],
};

const profileDataPt = {
  /** Ver as notas no bloco em inglês, acima. */
  nome: 'Marcos Rodrigues',
  local: 'Uberlândia – MG',
  nascimento: '2003-12-14',
  status: 'aberto a freelance',

  role: 'Desenvolvedor Full Stack & IA',

  bio_highlight: 'Construo sistemas com IA que chegam em produção. Este site é um deles.',

  bio_full:
    'Sou formado em Gestão da Informação pela UFU — uma graduação que fica entre Administração e Ciência da Computação com dados no meio — concluída em agosto de 2026. Trabalho na área de inovação da Supporte Logística construindo soluções full stack com IA, e sigo com freelance em paralelo — assumindo o ciclo inteiro, de entender o problema ao deploy e ao que quebra depois dele. Cheguei aqui pelo hardware: meu primeiro emprego foi suporte técnico, aos 14 anos.',

  /** Ver o histórico no cabeçalho do arquivo antes de mexer. */
  stats: [
    { number: '4+', label: 'Serviços freelance', sublabel: 'entregues com excelência' },
    { number: '4+', label: 'Anos de experiência', sublabel: 'aprendizado contínuo' },
    { number: '20+', label: 'Projetos totais', sublabel: 'soluções inovadoras' },
  ],

  /** Ver a nota no bloco em inglês: dois consumidores, e nove itens por motivo. */
  skills_highlight: [
    'Python',
    'FastAPI',
    'LangChain',
    'GenAI & RAG',
    'Docker',
    'PostgreSQL',
    'React',
    'Ciência de Dados',
    'DevOps',
  ],
};

export const getProfileData = (lang) => (lang === 'pt' ? profileDataPt : profileDataEn);
