import { getProfileData, idadeEm } from './profile'
import { getJourneyData } from './journey'
import { getProjectsData } from './projects'
import { getTechData } from './tech'
import { getServicosData } from './servicos'
import { getContactData } from './contact'
import { SISTEMA } from './sistema'

/**
 * O CONTEXTO PARA LEVAR EMBORA.
 * ==================================================
 * Um arquivo único com tudo que este site diz sobre o Marcos, para o visitante
 * baixar e jogar na IA dele — e então perguntar do jeito que quiser, sem depender
 * do agente daqui.
 *
 * A ideia é do dono do projeto, e ela é melhor do que parece: o portfólio já tem um
 * agente (o Marcos Virtual), mas ele responde com a cota, o modelo e a persona
 * DAQUI. Quem prefere o próprio sistema — outro modelo, outro prompt, uma
 * comparação lado a lado com outros candidatos — hoje teria de copiar janela por
 * janela. Isto entrega o corpus inteiro de uma vez.
 *
 * ==================================================
 * ELE É GERADO NO NAVEGADOR, A PARTIR DOS MESMOS MÓDULOS QUE A INTERFACE RENDERIZA.
 *
 * Esta é a decisão central do arquivo, e ela existe para eliminar uma classe de
 * defeito inteira. As alternativas eram:
 *
 *   (a) escrever o .md à mão            → divergiria do site na primeira edição de
 *                                          conteúdo, e ninguém releria os dois
 *   (b) gerar num script de build        → precisaria de um Node que entenda os
 *                                          imports de ícone de `tech.js` e
 *                                          `servicos.js`, e viraria um passo de
 *                                          build a mais para esquecer de rodar
 *   (c) gerar aqui, em runtime           → impossível divergir, por construção
 *
 * A (c) ganha por um motivo que vale escrever: o arquivo baixado é literalmente uma
 * projeção do estado que o visitante está vendo na tela. Se um projeto entra na
 * janela de Projetos, ele entra no download no mesmo instante, sem ninguém lembrar.
 * É a mesma regra que este projeto aplica a toda contagem de interface — fonte
 * única —, levada ao extremo: aqui a fonte única é o site inteiro.
 *
 * Custo aceito: o app que oferece o download é `lazy`, e abrir ele traz junto os
 * módulos de conteúdo de que ele depende. Como ninguém abre esta janela por acidente,
 * o chunk só é buscado por quem vai usar.
 *
 * ==================================================
 * O QUE NÃO ENTRA — e a lista é curta de propósito, porque quase tudo aqui já é
 * público na tela.
 *
 *   `nascimento`  sai a IDADE, derivada. Data de nascimento é dado pessoal que o
 *                 site nunca exibiu (ele exibe "22 anos"), e não há motivo para o
 *                 download ser mais indiscreto que a janela.
 *   `bytes`       a estimativa de complexidade dos projetos é uma convenção INTERNA
 *                 vestida de tamanho de arquivo (ver `content/projects.js`). Fora do
 *                 explorador ela não significa nada, e num arquivo que uma IA vai
 *                 ler ela só convida a conclusão errada.
 *   `color`,      cor de marca, ícone e chave de CSS são detalhe de renderização.
 *   `icon`
 *
 * Os canais de contato ENTRAM: e-mail, LinkedIn, GitHub e Discord já estão no
 * terminal desta máquina, visíveis para qualquer visitante. Omitir aqui não
 * protegeria nada e tiraria do arquivo justamente a parte acionável.
 */

/** Um título de seção com o filete de markdown que separa blocos longos. */
const secao = (titulo) => `\n---\n\n## ${titulo}\n`

/**
 * A DATA DE GERAÇÃO ENTRA POR PARÂMETRO, e não de um `new Date()` aqui dentro.
 *
 * Mesma decisão de `idadeEm()` em `profile.js` e de `posicaoNaLinha()` em
 * `journey.js`: função que lê o relógio não tem teste determinístico. Quem chama
 * passa `hoje`, e o teste passa uma data fixa.
 */
const dataLegivel = (hoje, lang) =>
  new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : 'en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(hoje)

const CABECALHO = {
  pt: {
    titulo: '# Contexto profissional de Marcos Rodrigues',
    comoUsar: [
      '> **Como usar este arquivo.** Ele é o conteúdo integral do portfólio',
      '> marocos.dev num arquivo só, para você jogar no seu assistente de IA e',
      '> perguntar o que quiser — comparar com uma vaga, checar se uma habilidade',
      '> específica aparece, ou pedir um resumo do jeito que você prefere ler.',
      '>',
      '> Nada aqui foi escrito para o download: é a mesma fonte que desenha as',
      '> janelas do site, exportada no momento em que você clicou. Então se o site',
      '> mudar, este arquivo muda junto.',
      '>',
      '> Existe também um agente treinado nesta trajetória em marocos.dev — ele',
      '> responde com a persona do Marcos e cita as fontes. Este arquivo é para',
      '> quando você prefere o seu próprio sistema.',
    ].join('\n'),
    geradoEm: (d) => `Gerado em ${d} · versão do sistema ${SISTEMA.versao} · https://marocos.dev`,
    identidade: 'Identidade',
    resumo: 'O que eu sou contratado para fazer',
    trajetoria: 'Trajetória profissional',
    projetos: 'Projetos',
    stack: 'Stack técnica',
    servicos: 'Serviços e infraestrutura',
    contato: 'Contato',
    numeros: 'Números',
    rotulos: {
      cargo: 'Cargo',
      local: 'Localização',
      idade: 'Idade',
      status: 'Status',
      anos: 'anos',
      resumoCurto: 'Em uma frase',
      bio: 'Biografia',
      diaADia: 'No dia a dia',
      contexto: 'Contexto',
      categoria: 'Categoria',
      ultimoTrabalho: 'Último trabalho',
      problema: 'O problema',
      solucao: 'Como funciona',
      destaques: 'No código',
      techs: 'Tecnologias',
      repo: 'Repositório',
      fechado: 'Código fechado (cliente ou empresa) — descrito aqui, não publicado',
      etapas: 'Como a entrega funciona',
      maquina: 'A máquina',
      prova: 'Onde isso é provado no site',
      nivel: 'nível',
    },
  },
  en: {
    titulo: '# Professional context for Marcos Rodrigues',
    comoUsar: [
      '> **How to use this file.** It is the entire content of the marocos.dev',
      '> portfolio in a single file, so you can drop it into your own AI assistant',
      '> and ask whatever you want — match it against a job description, check',
      '> whether a specific skill shows up, or get a summary shaped the way you',
      '> prefer to read.',
      '>',
      '> None of this was written for the download: it is the same source that draws',
      '> the windows on the site, exported the moment you clicked. So if the site',
      '> changes, this file changes with it.',
      '>',
      '> There is also an agent trained on this career at marocos.dev — it answers',
      '> in Marcos\'s own voice and cites its sources. This file is for when you',
      '> would rather use your own system.',
    ].join('\n'),
    geradoEm: (d) => `Generated on ${d} · system version ${SISTEMA.versao} · https://marocos.dev`,
    identidade: 'Identity',
    resumo: 'What I get hired for',
    trajetoria: 'Professional journey',
    projetos: 'Projects',
    stack: 'Tech stack',
    servicos: 'Services and infrastructure',
    contato: 'Contact',
    numeros: 'Numbers',
    rotulos: {
      cargo: 'Role',
      local: 'Location',
      idade: 'Age',
      status: 'Status',
      anos: 'years old',
      resumoCurto: 'In one sentence',
      bio: 'Biography',
      diaADia: 'Day to day',
      contexto: 'Context',
      categoria: 'Category',
      ultimoTrabalho: 'Last worked on',
      problema: 'The hard part',
      solucao: 'How it works',
      destaques: 'In the code',
      techs: 'Technologies',
      repo: 'Repository',
      fechado: 'Closed source (client or employer) — described here, not published',
      etapas: 'How delivery works',
      maquina: 'The machine',
      prova: 'Where the site proves this',
      nivel: 'level',
    },
  },
}

/**
 * O CORPUS EM FORMA DE DADO, antes de virar texto.
 *
 * Existe separado do markdown porque os dois formatos oferecidos (`.md` e `.json`)
 * têm de carregar exatamente a mesma informação. Com o JSON derivado do markdown —
 * ou vice-versa — o segundo formato viraria uma tradução incompleta do primeiro na
 * terceira edição.
 */
export const montarContexto = (lang, hoje = new Date()) => {
  const perfil = getProfileData(lang)
  const jornada = getJourneyData(lang)
  const projetos = getProjectsData(lang)
  const stack = getTechData(lang)
  const servicos = getServicosData(lang)
  const contato = getContactData(lang)

  return {
    geradoEm: hoje.toISOString().slice(0, 10),
    versaoDoSistema: SISTEMA.versao,
    fonte: 'https://marocos.dev',
    identidade: {
      nome: perfil.nome,
      cargo: perfil.role,
      local: perfil.local,
      // Idade derivada, e não a data de nascimento — ver a nota no topo do arquivo.
      idade: idadeEm(perfil.nascimento, hoje),
      status: perfil.status,
      resumoCurto: perfil.bio_highlight,
      biografia: perfil.bio_full,
      diaADia: perfil.skills_highlight,
    },
    capacidades: perfil.capacidades.map(({ titulo, texto }) => ({ titulo, texto })),
    numeros: perfil.stats.map(({ number, label, sublabel }) => ({
      valor: number,
      rotulo: label,
      detalhe: sublabel,
    })),
    trajetoria: jornada.items.map(({ date, title, org, description, tags, futuro }) => ({
      periodo: date,
      titulo: title,
      organizacao: org,
      descricao: description,
      tags,
      ...(futuro ? { ehRoadmap: true } : {}),
    })),
    projetos: projetos.items.map((p) => ({
      titulo: p.title,
      categoria: p.category,
      contexto: projetos.contextos[p.contexto],
      ultimoTrabalho: p.data,
      resumo: p.description,
      problema: p.problema,
      solucao: p.solucao,
      destaques: p.destaques,
      tecnologias: p.techs,
      repositorio: p.links?.github ?? null,
    })),
    stack: stack.items.map((cat) => ({
      area: cat.title,
      descricao: cat.description,
      tecnologias: cat.items.map(({ name, level }) => ({ nome: name, nivel: level })),
    })),
    servicos: {
      oferta: servicos.servicos.map(({ nome, descricao, provaRotulo }) => ({
        nome,
        descricao,
        prova: provaRotulo,
      })),
      etapas: servicos.etapas.map(({ numero, titulo, texto }) => ({ numero, titulo, texto })),
      maquina: servicos.maquina.linhas.map(({ rotulo, valor }) => ({ item: rotulo, valor })),
    },
    contato: contato.items.map(({ label, value, link }) => ({
      canal: label,
      valor: value,
      link,
    })),
  }
}

/** O corpus em markdown — o formato que uma IA lê melhor colado numa conversa. */
export const contextoEmMarkdown = (lang, hoje = new Date()) => {
  const c = montarContexto(lang, hoje)
  const t = CABECALHO[lang === 'pt' ? 'pt' : 'en']
  const r = t.rotulos
  const linhas = []

  linhas.push(t.titulo, '')
  linhas.push(t.comoUsar, '')
  linhas.push(`*${t.geradoEm(dataLegivel(hoje, lang))}*`)

  linhas.push(secao(t.identidade))
  linhas.push(`- **${r.cargo}:** ${c.identidade.cargo}`)
  linhas.push(`- **${r.local}:** ${c.identidade.local}`)
  linhas.push(`- **${r.idade}:** ${c.identidade.idade} ${r.anos}`)
  linhas.push(`- **${r.status}:** ${c.identidade.status}`)
  linhas.push(`- **${r.resumoCurto}:** ${c.identidade.resumoCurto}`)
  linhas.push('', `### ${r.bio}`, '', c.identidade.biografia)
  linhas.push('', `### ${r.diaADia}`, '', c.identidade.diaADia.join(' · '))

  linhas.push(secao(t.resumo))
  for (const cap of c.capacidades) {
    linhas.push(`### ${cap.titulo}`, '', cap.texto, '')
  }

  linhas.push(secao(t.numeros))
  for (const n of c.numeros) {
    linhas.push(`- **${n.valor}** ${n.rotulo} — ${n.detalhe}`)
  }

  linhas.push(secao(t.trajetoria))
  for (const e of c.trajetoria) {
    linhas.push(`### ${e.periodo} — ${e.titulo}`, '', `*${e.organizacao}*`, '', e.descricao, '')
    /* Backtick por concatenação, e não escapado dentro do template: `\`` é escape
       inútil num template literal e o eslint reprova — mas o caractere É necessário,
       porque é ele que faz cada tag virar código inline no markdown. */
    const cerca = '`'
    linhas.push(cerca + e.tags.join(`${cerca} · ${cerca}`) + cerca, '')
  }

  linhas.push(secao(t.projetos))
  /* A ORDEM É A DA LISTA DO SITE, que é a de complexidade decrescente (ver
     `content/projects.js`). Preservá-la importa: quem joga isto numa IA e pede "o
     projeto mais complexo" recebe a resposta certa de graça, porque a ordem já
     carrega o julgamento. */
  for (const p of c.projetos) {
    linhas.push(`### ${p.titulo}`, '')
    linhas.push(`**${r.categoria}:** ${p.categoria} · **${r.contexto}:** ${p.contexto} · **${r.ultimoTrabalho}:** ${p.ultimoTrabalho}`, '')
    linhas.push(p.resumo, '')
    if (p.problema) linhas.push(`**${r.problema}.** ${p.problema}`, '')
    if (p.solucao) linhas.push(`**${r.solucao}.** ${p.solucao}`, '')
    if (p.destaques?.length) {
      linhas.push(`**${r.destaques}:**`, '')
      for (const d of p.destaques) linhas.push(`- ${d}`)
      linhas.push('')
    }
    linhas.push(`**${r.techs}:** ${p.tecnologias.join(', ')}`, '')
    linhas.push(p.repositorio ? `**${r.repo}:** ${p.repositorio}` : `*${r.fechado}*`, '')
  }

  linhas.push(secao(t.stack))
  for (const cat of c.stack) {
    linhas.push(`### ${cat.area}`, '', cat.descricao, '')
    for (const tec of cat.tecnologias) {
      linhas.push(`- ${tec.nome} — ${tec.nivel.toLowerCase()} ${r.nivel}`)
    }
    linhas.push('')
  }

  linhas.push(secao(t.servicos))
  for (const s of c.servicos.oferta) {
    linhas.push(`### ${s.nome}`, '', s.descricao, '', `*${r.prova}: ${s.prova}*`, '')
  }
  linhas.push(`### ${r.etapas}`, '')
  for (const e of c.servicos.etapas) {
    linhas.push(`${e.numero}. **${e.titulo}** — ${e.texto}`)
  }
  linhas.push('', `### ${r.maquina}`, '')
  for (const m of c.servicos.maquina) {
    linhas.push(`- **${m.item}:** ${m.valor}`)
  }

  linhas.push(secao(t.contato))
  for (const canal of c.contato) {
    linhas.push(`- **${canal.canal}:** ${canal.valor} — ${canal.link}`)
  }
  linhas.push('')

  return linhas.join('\n')
}

/** O mesmo corpus em JSON, para quem vai processar em vez de conversar. */
export const contextoEmJson = (lang, hoje = new Date()) =>
  JSON.stringify(montarContexto(lang, hoje), null, 2)

/**
 * O NOME DO ARQUIVO, com a data dentro.
 *
 * Sem a data, dois downloads feitos em meses diferentes ficariam
 * indistinguíveis na pasta de Downloads de quem baixou — e o conteúdo MUDA, porque
 * é projeção do site. O idioma também entra: são dois corpora diferentes, não duas
 * traduções do mesmo arquivo.
 */
export const nomeDoArquivo = (lang, extensao, hoje = new Date()) =>
  `marcos-rodrigues-contexto-${lang}-${hoje.toISOString().slice(0, 10)}.${extensao}`
