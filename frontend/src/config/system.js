/**
 * CONFIGURAÇÃO CENTRAL DO MAROCOS OS
 * ==================================================
 * Os botões de ajuste do sistema, num lugar só. Mudar um valor aqui muda o
 * comportamento em todo lugar que o usa — nenhum destes números deve voltar a
 * aparecer literal dentro de componente.
 *
 * O QUE NÃO ESTÁ AQUI, E POR QUÊ. Os gradientes desenhados à mão da cerimônia
 * (--cer-ceu-boot, --cer-campo-lock, --cer-estrelas, --cer-nebulosa e a versão
 * forte) continuam em `src/os/tokens.css`. São de 6 a 18 camadas de
 * radial-gradient por variável, com a documentação dos seis eixos que separam a
 * cena de inicialização da de bloqueio escrita ao lado. Não são botões de
 * ajuste: são arte, com o histórico da decisão registrado junto.
 *
 * A REGRA: número e cor simples viram configuração; forma desenhada continua
 * sendo arte no CSS.
 */

/* --------------------------------------------------
   WALLPAPER — os dois shaders da área de trabalho
   -------------------------------------------------- */
export const WALLPAPER = {
  /**
   * Silk: o fundo do TEMA ESCURO. Padrão de seda/fumaça em movimento lento.
   *
   *   velocidade  quão rápido o padrão escorre. 12 é o atual; abaixo de ~4 lê
   *               como parado, acima de ~30 vira agitação e briga com o
   *               conteúdo em cima.
   *   escala      tamanho das dobras. Maior = padrão mais fino e mais repetido.
   *   rotacao     ÂNGULO do padrão, em radianos. 2.6 rad ≈ 149°. Uma volta
   *               inteira é 6.283 (2π).
   *   ruido       granulado por cima. 0 = liso e chapado.
   *   dpr         resolução de render, fração da tela. 0.6 = 60%, esticado por
   *               CSS. Como o efeito é difuso, a perda não aparece — e derruba
   *               muito o custo em monitor 4K ou 166Hz.
   *   fps         TETO de quadros por segundo. Este é o valor mais sensível de
   *               todo o arquivo: o custo do backdrop-filter das janelas é
   *               (custo do blur) × (fps do fundo), porque toda vez que o fundo
   *               redesenha o navegador refaz o blur de tudo que está por cima.
   *               20 é indistinguível de 60 aqui e custa um terço.
   */
  silk: {
    cor: '#4c1d95',
    velocidade: 10,
    escala: 1,
    rotacao: 10,
    ruido: 3,
    dpr: 0.6,
    fps: 20,
  },

  /**
   * Iridescence: o fundo do TEMA CLARO. Interferência colorida e suave.
   *
   *   cor              multiplicador RGB normalizado (0–1), não hex.
   *   amplitude        deslocamento pelo mouse. Só tem efeito com
   *                    reagirAoMouse: true.
   *   reagirAoMouse    desligado de propósito: o listener de mousemove sobre
   *                    a área de trabalho inteira não se paga num fundo.
   *   escalaResolucao  o mesmo papel do `dpr` do Silk.
   */
  iridescence: {
    cor: [0.9, 0.9, 0.95],
    amplitude: 0.1,
    velocidade: 1,
    reagirAoMouse: false,
    escalaResolucao: 0.6,
    fps: 20,
  },

  /**
   * A troca de tema é um crossfade, não um corte: a camada nova entra POR CIMA
   * da antiga e sobe de opacidade.
   *
   * `duracaoMs` é a animação de verdade (o CSS `sky-entra`).
   * `limiteSegurancaMs` é a rede: se o `animationend` não chegar (aba em
   * segundo plano, animação cancelada), este cronômetro tira a camada antiga.
   * TEM DE SER BEM MAIOR que a duração — montar o shader novo ocupa a main
   * thread, e numa máquina lenta a camada só pinta segundos depois. Com limite
   * curto o cronômetro vence a corrida e corta o crossfade pela metade.
   */
  crossfade: {
    duracaoMs: 700,
    limiteSegurancaMs: 4000,
  },

  /**
   * Cor de base atrás do shader: evita flash preto antes do WebGL iniciar e
   * cobre a falha caso ele não inicie.
   *
   * O DIA FOI CLAREADO, E O MOTIVO FOI MEDIDO. `light.topo` era `#6d28d9`, um
   * violeta saturado — e no mobile, onde este gradiente é o wallpaper inteiro,
   * ele caía exatamente onde ficam os ícones e o relógio. Contra o rótulo
   * `#2e1065` do tema claro isso dá razão de contraste de **2,13:1**, e a WCAG
   * AA pede 4,5:1 para texto de 11,5px. Não era questão de gosto: era
   * ilegível por medida. Com `#f5f3ff` no topo a razão vai para ~13:1.
   *
   * No desktop a mudança é quase invisível (isto fica ATRÁS do Iridescence),
   * mas melhora o instante antes de o WebGL pintar: o tema claro deixa de
   * piscar violeta escuro antes de virar pastel.
   *
   * O gradiente do mobile NÃO é mais só estes três tons — ver
   * `.marocos-sky-fallback.tema-light` em os/tokens.css, que virou arte em
   * camadas para ecoar o Iridescence. Estes três seguem sendo a base linear
   * dessa composição e a cor de base do desktop.
   */
  ceu: {
    dark: { topo: '#1e1b4b', meio: '#2e1065', baixo: '#4c1d95' },
    light: { topo: '#f5f3ff', meio: '#ebe5ff', baixo: '#d9ccfb' },
  },
}

/* --------------------------------------------------
   JANELAS — onde nascem, como se empilham, como se arrastam
   -------------------------------------------------- */
export const JANELAS = {
  /** Ponto de partida da cascata, e a posição usada quando não se sabe o
   *  tamanho da tela (nos testes puros do reducer). */
  baseX: 96,
  baseY: 64,

  /** Cada janela nova se desloca este tanto para não cobrir a anterior... */
  passoCascata: 24,
  /** ...e o deslocamento dá a volta ao chegar aqui, para a cascata não sair
   *  da tela depois de muitas janelas. */
  voltaCascata: 240,

  /**
   * QUANTO A JANELA CAMINHA DA LATERAL PARA O CENTRO.
   * 0 = nasce encostada em `baseX`. 1 = nasce centrada horizontalmente.
   * 0.5 é meio-termo de propósito: centrada ela cobre os ícones e tira o ar da
   * área de trabalho; encostada na esquerda parece ter escorregado pro canto.
   */
  viesHorizontal: 0.5,

  /**
   * FRAÇÃO DA ALTURA LIVRE em que a janela nasce.
   * 0.5 é o centro geométrico — e fica baixo demais, porque a barra de tarefas
   * já pesa embaixo. 0.42 põe a janela no meio ÓPTICO.
   */
  viesVertical: 0.42,

  /** Folga mínima até as bordas da tela. */
  margem: 16,
  /** Faixa que a barra de tarefas ocupa no rodapé. Precisa bater com
   *  VIDRO.alturaTaskbar — há teste garantindo. */
  alturaTaskbar: 52,

  /** Janelas começam acima disto; a escala de z reserva 100+ para elas. */
  zInicial: 100,

  /** Quanto da janela precisa continuar dentro da tela ao arrastar. */
  folgaArrastoX: 160,
  folgaArrastoY: 120,

  /**
   * Fade de abertura. SÓ OPACIDADE, e curto: animar `scale` numa janela grande
   * obriga o navegador a recompor a cada passo (e, com backdrop-filter, a
   * refazer o blur inteiro), o que trava a abertura.
   */
  aberturaMs: 120,
}

/* --------------------------------------------------
   CERIMÔNIA — inicialização e tela de bloqueio
   -------------------------------------------------- */
export const CERIMONIA = {
  /**
   * Duração da inicialização. Longa de propósito: o cristal gira e flutua, e a
   * graça é ter tempo de ver. Pulável a qualquer momento.
   *
   * CUIDADO AO AUMENTAR: duração não é movimento percebido. Uma versão de 4.2s
   * lia como "não animou nada" porque a última entrada era aos 2.6s e a barra
   * usava uma curva ease-out que chegava a ~94% já no primeiro terço — sobravam
   * dois segundos de tela parada, e tela parada durante boot lê como travamento.
   * O que consertou foi OCUPAR esse tempo (etapas de texto + barra linear), não
   * esticá-lo. Se aumentar aqui, tem de haver conteúdo ocupando o tempo novo.
   */
  duracaoBootMs: 4800,

  /**
   * Com movimento reduzido. Mais curta, mas NÃO zero: quem tem efeitos de
   * animação desligados no sistema — comum em máquina ajustada para performance
   * — chegava direto no bloqueio e concluía, com razão, que a inicialização não
   * existia. Movimento reduzido pede menos movimento, não menos conteúdo.
   */
  duracaoBootReduzidaMs: 2600,

  /** Velocidade de rotação do cristal em cada cena. A queda é o sistema
   *  assentando — a transição entre as duas é suavizada, não cortada. */
  spinBoot: 3.2,
  spinBloqueio: 1.6,

  tamanhoCristal: 300,
  tamanhoCristalPequeno: 200,
  /** Abaixo desta largura de tela, usa o cristal pequeno. */
  larguraCristalPequeno: 620,

  /** Rede de segurança: se o `animationend` da cortina não disparar, o desmonte
   *  acontece assim mesmo. No caso normal quem manda é o evento. */
  seguraSaidaMs: 1200,

  /**
   * TRABALHO ADIADO PARA A OCIOSIDADE. Cada par é (timeout do
   * requestIdleCallback, fallback em setTimeout para quem não o tem).
   *
   * Não são atrasos cosméticos: cada um move um custo real de main thread para
   * fora de um momento em que ele apareceria como engasgo.
   */
  idle: {
    /** Desmontar o cristal destrói o contexto WebGL e descarta geometria e
     *  material: ~580ms de main thread travada. Fazer isso no instante em que o
     *  desktop aparece ERA o engasgo percebido como "animação travada". */
    desmonteBloqueio: { timeout: 2500, fallback: 800 },
    /** A janela de boas-vindas monta durante a TELA DE BLOQUEIO PARADA, que é
     *  ócio de verdade. Montá-la durante a cortina custava metade da suavidade
     *  da transição (pior frame: 85ms contra 42ms). */
    boasVindas: { timeout: 1500, fallback: 400 },
    /** Busca o chunk 3D antes de alguém clicar, senão o download e o parse
     *  acontecem no meio da interação. */
    prefetchCristal: { timeout: 4000, fallback: 2500 },
  },

  /** O cristal do "Sobre" monta depois que a janela pintou: criar o contexto
   *  WebGL no mesmo frame da abertura travava a janela inteira. */
  montarCristalAboutMs: 450,
}

/* --------------------------------------------------
   MOVIMENTO — durações e curvas, por transição nomeada
   -------------------------------------------------- */
export const MOVIMENTO = {
  taskbarEntrada: { delay: 0.4, duration: 0.5 },
  /** `delayPorItem` é multiplicado pelo índice: os ícones entram em cascata. */
  iconesDesktop: { delayPorItem: 0.05, duration: 0.3, deslocamentoY: 8 },
  iconesMobile: { delayPorItem: 0.03, duration: 0.25, deslocamentoY: 8 },
  /**
   * MAXIMIZAR E RESTAURAR JANELA — a geometria interpolada, não o `scale`.
   *
   * Curta de propósito. Isto anima largura, altura e posição, e cada quadro
   * refaz o layout do conteúdo da janela — é a animação mais cara do sistema
   * depois do wallpaper. 0.22s é o suficiente para o olho seguir de onde para
   * onde a janela foi, que é a única função dela; esticar isso multiplica o
   * custo sem comunicar nada a mais.
   *
   * `duracaoReduzida` é ZERO, e diverge do 0.15 do quickSettings de propósito:
   * ali o painel só desliza, aqui a janela varre a tela inteira. Com movimento
   * reduzido, o certo é a troca ser instantânea, não rápida.
   */
  maximizarJanela: { duration: 0.22, duracaoReduzida: 0, ease: 'easeOut' },
  menuIniciar: { duration: 0.16, ease: 'easeOut' },
  quickSettings: { duration: 0.24, duracaoReduzida: 0.15, ease: 'easeOut' },
  quickSettingsFundo: { duration: 0.2 },
  pushMobile: { duration: 0.28, ease: 'easeOut' },
  acordeaoDispositivos: { duration: 0.2, ease: 'easeInOut' },
  indicadorTaskbar: { type: 'spring', stiffness: 300, damping: 30 },
  /** Marquee de skills do "Sobre". Em segundos, porque vira CSS. */
  marqueeSkillsS: 18,
}

/* --------------------------------------------------
   VIDRO — o material das superfícies do sistema
   -------------------------------------------------- */
export const VIDRO = {
  /**
   * O blur da janela é o mais caro do sistema, porque é o maior e o mais
   * numeroso, e ele é refeito a cada quadro que o wallpaper desenha. Se for
   * preciso ganhar performance, este número e WALLPAPER.silk.fps são os dois
   * lugares para mexer.
   */
  blurJanela: 'blur(6px) saturate(125%)',
  /** Superfícies pequenas podem pagar mais blur sem custo perceptível. */
  blurMenuIniciar: 'blur(20px) saturate(150%)',
  blurMenuContexto: 'blur(16px) saturate(150%)',
  blurTaskbar: 'blur(12px)',

  raio: '10px',
  raioControle: '8px',
  alturaTitulo: '40px',
  alturaTaskbar: 52,
}

/* --------------------------------------------------
   LAYOUT
   -------------------------------------------------- */
export const LAYOUT = {
  /**
   * 1024px porque tablet em retrato não tem espaço para janelas flutuantes.
   * iPad em paisagem (>= 1024) cai em desktop e arrasta por toque de graça, já
   * que o motion usa pointer events.
   */
  breakpointDesktop: 1024,

  icones: {
    origemX: '20px',
    origemY: '20px',
    larguraBotao: '88px',
    tamanhoTile: '56px',
    raioTile: '14px',
    /**
     * 3px, não 4: com todos os rótulos em uma linha o item tem 94,4px fixos, e
     * 7 × 94,4 + 6 × 3 = 678,8px de coluna. Em 4px daria 684,8px, que estoura
     * por 0,8px o espaço de uma viewport de 768px — exatamente o tipo de
     * quebra por dois pixels que o comentário de Desktop.css descreve.
     */
    intervalo: '3px',
    /** Folga entre o fim da coluna de ícones e a barra de tarefas. */
    folgaInferior: '32px',
  },

  assinatura: {
    origemTopo: '40px',
    origemDireita: '40px',
    larguraMaxima: '460px',
  },

  /**
   * CHROME DE EXPLORADOR. Estes três números têm um contrato com o
   * `defaultSize` de registry.js: os seis apps com `explorer: true` cresceram
   * exatamente `lateralLargura` na largura e `navAltura + statusAltura` na
   * altura, para o conteúdo manter a área útil que tinha antes do chrome.
   *
   * Mexer aqui sem mexer lá encolhe (ou infla) o conteúdo de seis janelas em
   * silêncio — há teste guardando a soma.
   */
  explorador: {
    /**
     * 184 e não 168: "Este Computador" com chevron, ícone e recuo não cabia em
     * 168 e truncava. Encolher a fonte do cabeçalho de grupo resolvia no limite
     * e quebrava de novo a cada 1px que qualquer borda mudasse — largura é o
     * conserto estável. O inglês ("This Computer") já cabia; quem manda aqui é
     * o idioma mais longo.
     */
    lateralLargura: '184px',
    navAltura: '40px',
    comandosAltura: '40px',
    statusAltura: '26px',
    /** Campo de busca da linha de navegação. */
    buscaLargura: '190px',
    /** Painel de detalhes. Fechado por padrão, então não entra na conta do
     *  `defaultSize` — quem o abre aceita o conteúdo estreitar. */
    detalhesLargura: '176px',
  },
}

/* --------------------------------------------------
   REDE
   -------------------------------------------------- */
export const REDE = {
  apiBase: import.meta.env.DEV
    ? 'http://localhost:8000/api'
    : 'https://api.marocos.dev/api',
  /**
   * Um pipeline completo do agente (gateway + guard + rag + tradutor) pode
   * encostar neste teto. Reduzir causa timeout em pergunta legítima.
   */
  timeoutChatMs: 60000,
}
