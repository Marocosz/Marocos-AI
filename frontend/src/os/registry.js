/**
 * REGISTRY DE APPS
 * --------------------------------------------------
 * Declaração única de cada app do Marocos OS. Quem quiser adicionar um app mexe
 * só aqui e no componente — nem o reducer nem o shell precisam saber.
 *
 * Campos:
 *   id           identidade estável, usada para casar localização de janela
 *   route        caminho na URL (`:slug` marca segmento dinâmico)
 *   titleKey     chave em getOsData(lang).windows; null = título vem do conteúdo
 *   icon         glifo lucide-react
 *   component    o app em si (agnóstico de container)
 *   defaultSize  tamanho inicial da janela em px
 *   singleton    true = uma instância só
 *   dynamic      true = uma instância por params.slug
 *   explorer     true = a janela ganha o chrome de explorador (lateral,
 *                breadcrumb, barra de status) e pode ser destino de navegação
 *                DENTRO de uma janela
 *   onDesktop    aparece na grade de ícones
 *   inStartMenu  aparece no menu Iniciar
 *   inDock       aparece no dock do mobile
 *
 * A ordem do array é a ordem dos ícones no desktop e no menu Iniciar.
 *
 * O CAMPO `parent` NÃO EXISTE MAIS, e o motivo é a navegação interna. Ele servia
 * a um caso só: `project` declarava `parent: 'projects'` e o reducer montava a
 * pasta atrás do detalhe num deep link. Agora o detalhe É a janela da pasta em
 * outra localização, e o breadcrumb dá o caminho de volta — não há pai para
 * montar. O branch de recursão saiu do reducer junto, porque caminho
 * inalcançável pelo app mas coberto por teste é a pior das três opções: parece
 * vivo e não é.
 */

import { lazy } from 'react'
import {
  MonitorCog, FolderGit2, Disc3, Cpu, Server,
  SquareTerminal, FileText, Bot, Settings, PackageOpen,
} from 'lucide-react'

/**
 * O COMPONENTE É LAZY; O RESTO DO REGISTRY NÃO.
 *
 * `id`, `route`, `titleKey`, `icon`, `defaultSize`, `explorer` e as flags são
 * resolvidos SINCRONAMENTE — o deriveInitial() do WindowManagerContext lê a URL
 * e monta o estado inicial antes do primeiro render, e as rotas, os títulos e
 * os ícones aparecem na taskbar e no menu Iniciar sem que o app tenha montado.
 * Só o `component` pode esperar.
 *
 * Antes, os onze apps e todo o CSS deles entravam no bundle inicial, mesmo para
 * quem abrisse um só.
 */
const AboutApp = lazy(() => import('../apps/AboutApp'))
const ProjectsApp = lazy(() => import('../apps/ProjectsApp'))
const ProjectDetailApp = lazy(() => import('../apps/ProjectDetailApp'))
const HistoryApp = lazy(() => import('../apps/HistoryApp'))
const DevicesApp = lazy(() => import('../apps/DevicesApp'))
const ServicesApp = lazy(() => import('../apps/ServicesApp'))
const TerminalApp = lazy(() => import('../apps/TerminalApp'))
const ReadmeApp = lazy(() => import('../apps/ReadmeApp'))
const AssistantApp = lazy(() => import('../apps/AssistantApp'))
const SettingsApp = lazy(() => import('../apps/SettingsApp'))
/* Este é o app cujo `lazy` mais se paga: abrir ele traz junto TODOS os módulos de
   conteúdo do portfólio, porque é isso que ele exporta num arquivo. Ninguém abre
   esta janela por acidente, então o chunk é buscado só por quem vai usar. */
const ContextoApp = lazy(() => import('../apps/ContextoApp'))

/**
 * O CHROME DE EXPLORADOR CUSTA ESPAÇO, E O `defaultSize` PAGOU.
 *
 * Lateral de 184px, e TRÊS faixas horizontais: navegação 40, comandos 40,
 * status 26. Os seis apps que já existiam quando o chrome entrou cresceram
 * exatamente isso (+184 na largura, +106 na altura) para o conteúdo continuar com
 * a mesma área útil de antes — sem isso o chrome comeria a janela em vez de
 * emoldurá-la.
 *
 * APP NOVO COM `explorer: true` JÁ NASCE COM A SOMA FEITA. O de Serviços é o
 * primeiro: os 884×626 dele são 700×520 de conteúdo mais o chrome. Declarar o
 * tamanho "que parece bom" numa janela com chrome é declarar um conteúdo menor do
 * que se imagina, e há teste em `config/system.test.js` guardando a conta.
 *
 * O painel de detalhes NÃO entra nesta conta: ele nasce fechado, e quem o abre
 * aceita o conteúdo estreitar. Somá-lo aqui deixaria seis janelas largas demais
 * para um painel que quase sempre está fechado.
 *
 * A maior fica em 884×626. Com os 16px de JANELAS.margem dos dois lados a
 * largura pede 916px, que cabe no breakpoint de 1024px onde o shell de desktop
 * começa.
 *
 * Terminal, Marcos Virtual e Configurações não recebem o chrome — decisão do
 * dono do projeto, "esses são diferentes" — e portanto não mudaram de tamanho.
 */
export const APPS = [
  {
    id: 'about',
    route: '/sobre',
    titleKey: 'about',
    icon: MonitorCog,
    component: AboutApp,
    /**
     * FICOU EM 804, e isso foi decidido duas vezes. A passada de página de entrada
     * (spec de 2026-08-12) cresceu esta janela para 884 porque ela ia ter duas
     * fichas técnicas lado a lado — a do hardware e a do sistema — e em 620px de
     * área útil "Processador / AMD Ryzen 7 7735HS" quebrava em duas linhas.
     *
     * Depois o dono do projeto tirou a ficha do hardware da janela (ela fica só
     * para o Marcos Virtual responder quando alguém perguntar), e com ela caiu o
     * motivo de crescer. Voltar é o certo: janela maior sem conteúdo que a peça é
     * só mais vidro para o sistema desfocar.
     */
    defaultSize: { w: 804, h: 626 },
    singleton: true,
    dynamic: false,
    explorer: true,
    onDesktop: true,
    inStartMenu: true,
    inDock: true,
  },
  {
    id: 'projects',
    route: '/projetos',
    titleKey: 'projects',
    icon: FolderGit2,
    component: ProjectsApp,
    defaultSize: { w: 824, h: 546 },
    singleton: true,
    dynamic: false,
    explorer: true,
    onDesktop: true,
    inStartMenu: true,
    inDock: true,
  },
  {
    // Alcançado por navegação de dentro da pasta ou por deep link. Não abre
    // janela nova a partir do card: troca o conteúdo da janela da pasta, como
    // entrar numa pasta num explorador de verdade.
    id: 'project',
    route: '/projetos/:slug',
    titleKey: null, // título vem do nome do projeto, em projects.js
    icon: FileText,
    component: ProjectDetailApp,
    defaultSize: { w: 744, h: 606 },
    singleton: false,
    dynamic: true,
    explorer: true,
    onDesktop: false,
    inStartMenu: false,
    inDock: false,
  },
  {
    id: 'history',
    route: '/jornada',
    titleKey: 'history',
    /**
     * `Disc3` e não `GitCommitVertical`: o conteúdo virou um player (spec de
     * 2026-08-12), e um vinil lê como player na hora. "Disco" também é REGISTRO de
     * algo, que é exatamente o que um log de carreira é — o duplo sentido é o motivo
     * de ser este e não `AudioLines` ou `ListMusic` (o segundo, a 26px, ficava
     * parecido com o ícone de Projetos).
     *
     * O ÍCONE DO XP NÃO ACOMPANHA: `ui/xpIcons.jsx` mantém `history: PastaRelogio`.
     * Pasta com relógio era o idioma de "documentos recentes" daquela época, e aquele
     * preset cita o período em vez do design atual.
     */
    icon: Disc3,
    component: HistoryApp,
    defaultSize: { w: 884, h: 626 },
    singleton: true,
    dynamic: false,
    explorer: true,
    onDesktop: true,
    inStartMenu: true,
    inDock: false,
  },
  {
    id: 'devices',
    route: '/stack',
    titleKey: 'devices',
    icon: Cpu,
    component: DevicesApp,
    defaultSize: { w: 804, h: 626 },
    singleton: true,
    dynamic: false,
    explorer: true,
    onDesktop: true,
    inStartMenu: true,
    inDock: false,
  },
  {
    /**
     * O `services.msc` desta máquina — e o trocadilho é o desenho todo: serviço do
     * sistema e serviço profissional são a mesma palavra, e os dois têm status e
     * tipo de inicialização. Era o app que faltava na família (`winver`,
     * `explorer`, `devmgmt.msc`, `cmd`, `notepad` já estão citados).
     *
     * O ÍCONE É `Server`, E NÃO `ServerCog`. A escolha óbvia para "serviços" seria
     * uma engrenagem, mas `Settings` já é a engrenagem do sistema e o "Sobre este
     * PC" já usa `MonitorCog` — duas engrenagens a 26px na mesma grade se
     * confundem. Sobra o glifo de silhueta mais distinta (barras empilhadas com um
     * LED), e ele diz "hospedagem" de imediato; a amplitude ("também faço
     * software") é carregada pelo TÍTULO da janela, não pelo glifo.
     *
     * Descartado `BriefcaseBusiness`: maleta numa grade de ícones de sistema
     * operacional lê como clip-art, não como app.
     *
     * A POSIÇÃO NO ARRAY É NARRATIVA, porque a ordem daqui é a ordem dos ícones no
     * desktop e no menu Iniciar. Entre a Stack e o Terminal a grade passa a ler:
     * quem sou -> o que fiz -> há quanto tempo -> com o quê -> O QUE EU VENDO ->
     * como falar comigo. O contato vem logo depois da oferta, que é onde ele
     * converte.
     *
     * `inDock: false` porque o dock do mobile tem quatro apps e um quinto muda o
     * layout de lá. É um `true` de uma linha se algum dia isso valer a pena.
     */
    id: 'services',
    route: '/servicos',
    titleKey: 'services',
    icon: Server,
    component: ServicesApp,
    /* O teto que o sistema já pratica, e aqui ele é pedido pelo fluxograma: cinco
       etapas lado a lado precisam da largura, senão a esteira vira uma coluna. */
    defaultSize: { w: 884, h: 626 },
    singleton: true,
    dynamic: false,
    explorer: true,
    onDesktop: true,
    inStartMenu: true,
    inDock: false,
  },
  {
    // Sem chrome de explorador: um terminal com lateral de navegação de arquivos
    // seria duas metáforas brigando na mesma janela.
    id: 'terminal',
    route: '/contato',
    titleKey: 'terminal',
    icon: SquareTerminal,
    component: TerminalApp,
    defaultSize: { w: 680, h: 440 },
    singleton: true,
    dynamic: false,
    explorer: false,
    onDesktop: true,
    inStartMenu: true,
    inDock: false,
  },
  {
    // Sem chrome de explorador: é uma conversa, não um lugar.
    id: 'assistant',
    route: '/assistente',
    titleKey: 'assistant',
    icon: Bot,
    component: AssistantApp,
    defaultSize: { w: 460, h: 620 },
    singleton: true,
    dynamic: false,
    explorer: false,
    onDesktop: true,
    inStartMenu: true,
    inDock: true,
  },
  {
    id: 'readme',
    route: '/leia-me',
    titleKey: 'readme',
    icon: FileText,
    component: ReadmeApp,
    defaultSize: { w: 704, h: 506 },
    singleton: true,
    dynamic: false,
    explorer: true,
    onDesktop: true,
    inStartMenu: true,
    inDock: false,
  },
  {
    // Fora da grade do desktop de propósito: os três controles dele já estão
    // como atalho na bandeja da taskbar, então o ícone seria redundante. E sem
    // chrome de explorador — é painel de preferências, e uma lateral de
    // navegação para três linhas ficaria maior que o conteúdo.
    /**
     * BAIXAR O CONTEXTO — o portfólio inteiro num arquivo, para a IA de quem visita.
     *
     * SEM CHROME DE EXPLORADOR, por decisão explícita do dono do projeto ("uma
     * janela bem simples, não precisa ter o morphism de explorer"): esta janela não
     * é um LUGAR na máquina, é uma AÇÃO. Lateral de navegação e breadcrumb
     * sugeririam que há algo para percorrer aqui dentro, e não há.
     *
     * COM ÍCONE NA ÁREA DE TRABALHO, por decisão do dono do projeto — e a primeira
     * versão errou nisso. Ela deixou o app fora da grade com o argumento de que o
     * balão de aviso e o menu Iniciar bastavam, e o argumento estava errado por um
     * motivo simples: balão se fecha e menu Iniciar não se abre por acidente. Um app
     * cuja única porta desaparece no primeiro clique de dispensar não tem porta.
     *
     * O TÍTULO É LONGO PARA A LEGENDA, então ele tem entrada em `iconLabels` — sem
     * isso "Baixar meu contexto" quebra em duas linhas, o item cresce, e uma coluna
     * com alturas diferentes e `gap` uniforme deixa de ser grade. Ver a nota daquele
     * bloco em `i18n/os.js`.
     */
    id: 'contexto',
    route: '/contexto',
    titleKey: 'contexto',
    icon: PackageOpen,
    component: ContextoApp,
    defaultSize: { w: 620, h: 640 },
    singleton: true,
    dynamic: false,
    explorer: false,
    onDesktop: true,
    inStartMenu: true,
    inDock: false,
  },
  {
    // Fora da grade do desktop de propósito: os três controles dele já estão
    // como atalho na bandeja da taskbar, então o ícone seria redundante. E sem
    // chrome de explorador — é painel de preferências, e uma lateral de
    // navegação para três linhas ficaria maior que o conteúdo.
    id: 'settings',
    route: '/config',
    titleKey: 'settings',
    icon: Settings,
    // Cresceu com o seletor de papel de parede: seis amostras em grade não
    // cabiam nos 440px de antes e nasciam abaixo da dobra, o que fazia a
    // feature parecer inexistente para quem não rolasse.
    component: SettingsApp,
    defaultSize: { w: 560, h: 660 },
    singleton: true,
    dynamic: false,
    explorer: false,
    onDesktop: false,
    inStartMenu: true,
    inDock: true,
  },
]

export function getApp(appId) {
  return APPS.find((a) => a.id === appId)
}

/**
 * Busca em segundo plano os apps que estão a um clique de distância — os que
 * têm ícone na área de trabalho. Sem isto, o primeiro clique pagaria o download
 * do chunk no meio da interação, que é exatamente o engasgo que o prefetch do
 * cristal já resolvia para o 3D.
 */
export function prefetchAppsDoDesktop() {
  import('../apps/AboutApp')
  import('../apps/ProjectsApp')
  import('../apps/HistoryApp')
  import('../apps/DevicesApp')
  import('../apps/ServicesApp')
  import('../apps/TerminalApp')
  import('../apps/ReadmeApp')
  import('../apps/AssistantApp')
}
