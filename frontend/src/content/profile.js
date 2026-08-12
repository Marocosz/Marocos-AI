/**
 * O PERFIL — alinhado a `backend/data/knowledge_base/profile.md`.
 *
 * Mesma regra da jornada: se este arquivo e o `profile.md` discordarem, o
 * `profile.md` está certo. Ele alimenta o RAG, então divergir daqui é o site
 * contradizendo o próprio assistente.
 *
 * DUAS CORREÇÕES DE FATO nesta passada:
 *
 * 1. `bio_full` dizia "Formado em Gestão da Informação pela UFU". Não é: a base
 *    diz 8º período. Dizer-se formado antes de sê-lo é o tipo de detalhe que um
 *    recrutador confere.
 * 2. `stats` trazia "4+ Serviços Freelance / Entregues com Excelência",
 *    "4+ Anos de Experiência / Aprendizado Contínuo" e "20+ Projetos Totais /
 *    Soluções Inovadoras" — números que ninguém consegue verificar, sob rótulos
 *    que não dizem nada. Viraram fatos com data.
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
 * A MÁQUINA, de verdade. Vem da seção "Meu Setup de Desenvolvimento" do
 * `profile.md`, e é a única parte deste arquivo que descreve hardware em vez de
 * pessoa — que é exatamente o que um "Sobre este PC" promete.
 *
 * O café está na base de conhecimento e fica. Uma ficha técnica que só tem
 * número é ficha técnica de qualquer um.
 */
const maquinaItens = [
  { rotulo: 'Notebook', valor: 'Acer Nitro V15' },
  { rotulo: 'Processador', valor: 'AMD Ryzen 7 7735HS' },
  { rotulo: 'Vídeo', valor: 'NVIDIA RTX 4050 · 6 GB' },
  { rotulo: 'Memória', valor: '32 GB' },
  { rotulo: 'Sistema', valor: 'Windows 11' },
];

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
    "I am in the 8th semester of Information Management at UFU, a degree that sits between Administration and Computer Science with data in the middle. I work on the innovation team at Supporte Logística building full stack solutions with AI, and I freelance on the side — owning the whole cycle, from understanding the problem to the deploy and whatever breaks after it. I got here through hardware: my first job was technical support at 14.",

  stats: [
    { number: '2018', label: 'In the field since', sublabel: 'first job at 14' },
    { number: '8th', label: 'Semester at UFU', sublabel: 'Information Management' },
    { number: '2', label: 'Active fronts', sublabel: 'innovation team + freelance' },
  ],

  maquina: [
    ...maquinaItens,
    { rotulo: 'Editor', valor: 'VS Code + Antigravity' },
    { rotulo: 'Coffee', valor: 'with sugar' },
  ],

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
    'Estou no 8º período de Gestão da Informação na UFU, uma graduação que fica entre Administração e Ciência da Computação com dados no meio. Trabalho na área de inovação da Supporte Logística construindo soluções full stack com IA, e sigo com freelance em paralelo — assumindo o ciclo inteiro, de entender o problema ao deploy e ao que quebra depois dele. Cheguei aqui pelo hardware: meu primeiro emprego foi suporte técnico, aos 14 anos.',

  stats: [
    { number: '2018', label: 'Na área desde', sublabel: 'primeiro emprego aos 14' },
    { number: '8º', label: 'Período na UFU', sublabel: 'Gestão da Informação' },
    { number: '2', label: 'Frentes ativas', sublabel: 'área de inovação + freelance' },
  ],

  maquina: [
    ...maquinaItens,
    { rotulo: 'Editor', valor: 'VS Code + Antigravity' },
    { rotulo: 'Café', valor: 'com açúcar' },
  ],

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
