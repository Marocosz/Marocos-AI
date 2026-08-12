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
 *
 * --------------------------------------------------
 * ESTE ARQUIVO É O ÚNICO QUE DEFINE. O RESTO DO PROJETO LÊ.
 *
 * Nenhum componente e nenhum CSS pode escrever uma cor, uma medida ou uma
 * duração do sistema como literal. O caminho é sempre o mesmo:
 *
 *     system.js  ->  cssBridge.js  ->  --cfg-*  ->  o CSS lê com var()
 *
 * Para a cor de acento isso vai um passo além, porque ela precisa aparecer em
 * dezenas de opacidades diferentes: a ponte publica `--accent-rgb` como um
 * TRIO CRU ("168 85 247"), e o CSS escreve `rgb(var(--accent-rgb) / 0.16)`.
 * Um literal `rgba(168, 85, 247, 0.16)` perdido em qualquer arquivo é um lugar
 * onde a troca de preset não chega — e o sintoma é sempre o mesmo: um pedaço da
 * interface fica roxo quando todo o resto já mudou de cor.
 *
 * As três exceções, todas documentadas onde vivem:
 *   1. os gradientes da cerimônia em `os/tokens.css` — arte, não ajuste;
 *   2. as cores de CATEGORIA (tipos do histórico, status do terminal, marcas de
 *      tecnologia em content/tech.js) — significam algo, e seguir o tema faria
 *      "erro" e "sucesso" trocarem de cor;
 *   3. o âmbar da tela de BIOS — máquina desligada não tem tema.
 * --------------------------------------------------
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
  /**
   * SÓ OS VALORES DE CUSTO MORAM AQUI.
   *
   * Cor, velocidade, escala, rotação e ruído saíram para `PRESETS.noite`, porque
   * viraram escolha do visitante. `dpr` e `fps` ficaram, e a separação é a regra
   * inteira desta feature: **preset é gosto, isto é conta de performance.**
   * Trocar de preset não pode mudar quanto o site custa para rodar — senão o
   * visitante escolheria, sem saber, uma versão que engasga na máquina dele.
   */
  silk: {
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
  /** Idem: cor, amplitude e velocidade saíram para `PRESETS.dia`. */
  iridescence: {
    reagirAoMouse: false,
    escalaResolucao: 1,
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
   PRESETS DE WALLPAPER — as variações que o visitante escolhe
   -------------------------------------------------- */

/**
 * PRESET É GOSTO; CUSTO NÃO ENTRA AQUI.
 *
 * Cada preset carrega só o que muda a APARÊNCIA do shader, mais o `ceu` que
 * combina com ele. Os dois valores de custo — `dpr`/`escalaResolucao` e `fps` —
 * continuam em WALLPAPER, iguais para todos. Sem essa separação, escolher um
 * tema seria escolher, às cegas, quanto o site pesa na máquina de quem visita.
 *
 * O `ceu` de cada preset tem DOIS consumidores: a cor de base atrás do shader
 * no desktop (evita o flash antes do WebGL pintar) e o wallpaper INTEIRO no
 * mobile, onde não há WebGL. É por isso que ele acompanha o preset em vez de
 * ser fixo por tema — senão trocar de preset no celular não mudaria nada.
 *
 * `id` é o que vai para o localStorage: nome legível mudaria com o idioma e
 * quebraria a preferência salva de quem trocasse de língua. O rótulo vem de
 * `i18n/os.js`, chaveado por este id.
 *
 * O PRIMEIRO DE CADA LISTA É O PADRÃO — e é o visual que o projeto já tinha,
 * para quem nunca abrir as configurações não ver nada mudar.
 */
export const PRESETS = {
  /** Noite: shader Silk. Padrão de seda em movimento. */
  noite: [
    {
      id: 'ametista',
      acento: '#a855f7',
      cor: '#4c1d95',
      velocidade: 20,
      escala: 1,
      rotacao: 10,
      ruido: 3,
      ceu: { topo: '#1e1b4b', meio: '#2e1065', baixo: '#4c1d95' },
    },
    {
      // Frio e lento: as dobras ficam largas e quase paradas.
      id: 'meia-noite',
      acento: '#60a5fa',
      cor: '#1e3a8a',
      velocidade: 6,
      escala: 1.7,
      rotacao: 2.2,
      ruido: 1.4,
      ceu: { topo: '#0f172a', meio: '#152449', baixo: '#1e3a8a' },
    },
    {
      // Quente e agitado: dobras finas correndo, granulado alto.
      id: 'brasa',
      acento: '#fb923c',
      cor: '#7c2d12',
      velocidade: 26,
      escala: 0.7,
      rotacao: 4.6,
      ruido: 3.4,
      ceu: { topo: '#1c0a05', meio: '#3f1508', baixo: '#7c2d12' },
    },
    {
      id: 'esmeralda',
      acento: '#34d399',
      cor: '#065f46',
      velocidade: 12,
      escala: 1.35,
      rotacao: 5.8,
      ruido: 1.9,
      ceu: { topo: '#022c22', meio: '#04382c', baixo: '#065f46' },
    },
    {
      // Quase sem cor e muito granulado: lê como filme, não como seda.
      id: 'grafite',
      acento: '#a1a1aa',
      cor: '#3f3f46',
      velocidade: 5,
      escala: 2.3,
      rotacao: 1.1,
      ruido: 4.6,
      ceu: { topo: '#111113', meio: '#232326', baixo: '#3f3f46' },
    },
    {
      id: 'magenta',
      acento: '#f472b6',
      cor: '#831843',
      velocidade: 16,
      escala: 1.1,
      rotacao: 8.4,
      ruido: 2.4,
      ceu: { topo: '#240a17', meio: '#4a0f2a', baixo: '#831843' },
    },

    /* ----------------------------------------------------------------
       OS SÓBRIOS. Sem shader e sem vidro — ver a nota de `sobrio` acima
       do array. Fundo desenhado em CSS, uma composição por preset.
       ---------------------------------------------------------------- */
    {
      // Frio e retilíneo: linhas finas em diagonal sobre ardósia, com uma luz
      // fria entrando pelo canto superior esquerdo.
      id: 'ardosia',
      sobrio: true,
      acento: '#38bdf8',
      ceu: { topo: '#0f172a', meio: '#131c31', baixo: '#0b1120' },
      fundo: `
        radial-gradient(120% 80% at 18% 0%, rgba(56, 189, 248, 0.16) 0%, transparent 58%),
        repeating-linear-gradient(115deg, rgba(255, 255, 255, 0.035) 0 1px, transparent 1px 22px),
        linear-gradient(160deg, #0f172a 0%, #131c31 55%, #0b1120 100%)
      `,
    },
    {
      // Quente e curvo: arcos concêntricos nascendo abaixo da tela, como ondas
      // de calor. O oposto do Ardósia nos dois eixos — temperatura e forma.
      id: 'carvao',
      sobrio: true,
      acento: '#fbbf24',
      ceu: { topo: '#17161a', meio: '#101014', baixo: '#0a0a0d' },
      fundo: `
        radial-gradient(140% 90% at 50% 118%, rgba(251, 191, 36, 0.15) 0%, transparent 55%),
        repeating-radial-gradient(circle at 50% 118%, rgba(255, 255, 255, 0.038) 0 1px, transparent 1px 44px),
        linear-gradient(180deg, #17161a 0%, #101014 60%, #0a0a0d 100%)
      `,
    },
  ],

  /**
   * Dia: shader Iridescence. `cor` aqui é multiplicador RGB normalizado (0–1),
   * não hex — ele TINGE a interferência, então valores baixos num canal puxam a
   * paleta inteira para o complemento dele.
   */
  dia: [
    {
      id: 'perola',
      acento: '#7c3aed',
      cor: [0.9, 0.9, 0.95],
      amplitude: 0.1,
      velocidade: 1,
      ceu: { topo: '#f5f3ff', meio: '#ebe5ff', baixo: '#d9ccfb' },
    },
    {
      id: 'aurora',
      acento: '#0d9488',
      cor: [0.68, 0.96, 0.88],
      amplitude: 0.14,
      velocidade: 1.6,
      ceu: { topo: '#f0fdfa', meio: '#dcf7f1', baixo: '#bfead9' },
    },
    {
      id: 'algodao-doce',
      acento: '#db2777',
      cor: [1, 0.78, 0.92],
      amplitude: 0.08,
      velocidade: 0.7,
      ceu: { topo: '#fff5fa', meio: '#fde6f1', baixo: '#f8cfe2' },
    },
    {
      id: 'ceu-claro',
      acento: '#2563eb',
      cor: [0.72, 0.86, 1],
      amplitude: 0.12,
      velocidade: 1.2,
      ceu: { topo: '#f2f8ff', meio: '#e2eeff', baixo: '#c7dcf7' },
    },
    {
      id: 'citrino',
      acento: '#b45309',
      cor: [1, 0.95, 0.7],
      amplitude: 0.1,
      velocidade: 0.9,
      ceu: { topo: '#fffdf0', meio: '#fdf6d9', baixo: '#f5e6ae' },
    },
    {
      // O mais sóbrio: quase acromático, quase parado. Para quem quer o
      // conteúdo em primeiro plano e o fundo calado.
      id: 'neblina',
      acento: '#475569',
      cor: [0.86, 0.86, 0.89],
      amplitude: 0.05,
      velocidade: 0.45,
      ceu: { topo: '#f8fafc', meio: '#eef1f5', baixo: '#dbe0e8' },
    },

    /* ----------------------------------------------------------------
       OS SÓBRIOS DO DIA. Mesma ideia dos da noite: papel em vez de vidro.
       ---------------------------------------------------------------- */
    {
      // Papel quadriculado, quente. A grade é fina e larga o bastante para ler
      // como textura de caderno, não como tabela.
      id: 'papel',
      sobrio: true,
      acento: '#0f766e',
      ceu: { topo: '#fbfaf7', meio: '#f6f4ef', baixo: '#efece4' },
      fundo: `
        repeating-linear-gradient(0deg, rgba(15, 118, 110, 0.055) 0 1px, transparent 1px 30px),
        repeating-linear-gradient(90deg, rgba(15, 118, 110, 0.055) 0 1px, transparent 1px 30px),
        radial-gradient(110% 75% at 88% 6%, rgba(15, 118, 110, 0.1) 0%, transparent 62%),
        linear-gradient(165deg, #fbfaf7 0%, #f2efe8 100%)
      `,
    },
    {
      // Linho frio: faixas diagonais finas, como trama de tecido, com a luz
      // entrando por baixo à esquerda. O oposto do Papel na temperatura e na
      // direção — grade ortogonal contra trama diagonal.
      id: 'linho',
      sobrio: true,
      acento: '#4338ca',
      ceu: { topo: '#fafbff', meio: '#f2f4fb', baixo: '#e8ebf6' },
      fundo: `
        repeating-linear-gradient(135deg, rgba(67, 56, 202, 0.045) 0 2px, transparent 2px 26px),
        radial-gradient(120% 80% at 8% 100%, rgba(67, 56, 202, 0.11) 0%, transparent 62%),
        linear-gradient(155deg, #fafbff 0%, #eceff8 100%)
      `,
    },
  ],
}

/** O preset salvo, ou o primeiro da lista. Usado pela ponte e pelo wallpaper. */
export function getPreset(tema, id) {
  const lista = tema === 'dark' ? PRESETS.noite : PRESETS.dia
  return lista.find((p) => p.id === id) || lista[0]
}

/**
 * '#a855f7' -> '168 85 247'.
 *
 * A FORMA IMPORTA: é a sintaxe de `rgb(var(--accent-rgb) / 0.16)`, que é como
 * o CSS inteiro passou a escrever qualquer tom do acento. Sem isso, cada
 * opacidade do acento precisaria de um token próprio (`--accent-16`,
 * `--accent-12`...) ou voltaria a ser literal — que é exatamente o que esta
 * mudança existe para eliminar.
 *
 * Devolve null para entrada malformada em vez de lançar: um preset com hex
 * torto deve degradar para o acento padrão do CSS, não derrubar o boot.
 */
/**
 * O companheiro FUNDO do acento, para quem precisa de dois tons (o cristal 3D
 * usa dois realces laterais).
 *
 * Não é um campo novo no preset: ele já carrega o tom profundo. Na noite é a
 * `cor` do shader — que para o preset padrão é `#4c1d95`, exatamente o literal
 * que estava chumbado no cristal antes. No dia a `cor` é multiplicador RGB e
 * não serve como hex, então o tom fundo vem da última parada do céu.
 *
 * Acrescentar um `acentoFundo` a cada um dos doze presets seria doze valores a
 * manter em sincronia com os que já existem, para nenhuma informação nova.
 */
export function acentoProfundo(preset) {
  if (!preset) return '#4c1d95'
  return typeof preset.cor === 'string' ? preset.cor : preset.ceu.baixo
}

/**
 * QUANTOS GRAUS A ARTE DA CERIMÔNIA PRECISA GIRAR PARA CHEGAR NO ACENTO.
 *
 * A cerimônia é desenhada à mão: `--cer-ceu-boot`, `--cer-nebulosa` e as
 * estrelas somam mais de trinta paradas de gradiente, com a documentação dos
 * "seis eixos" que separam a inicialização do bloqueio escrita ao lado.
 * Reescrever cada parada em função do acento destruiria essa composição — as
 * relações de luminância entre as camadas são o desenho.
 *
 * Então em vez de trocar as cores, gira-se o MATIZ da camada inteira. E isso
 * funciona porque a arte já separa o que tem cor do que não tem: branco, preto
 * e cinza têm saturação zero, e `hue-rotate` não mexe em nenhum dos três. O
 * núcleo branco da nebulosa continua branco, o palco quase preto continua quase
 * preto, e só a família violeta gira para a cor do preset.
 *
 * A referência é o violeta do preset padrão (#a855f7, matiz ~271°): um preset
 * que use esse acento gira 0° e a cena fica idêntica ao que sempre foi.
 */
const MATIZ_REFERENCIA = 271

/**
 * Saturação HSL, 0–1. Existe por causa de um caso que o giro de matiz sozinho
 * não resolve: presets acromáticos.
 *
 * `hue-rotate` GIRA o matiz, mas não consegue tirá-lo. Um violeta saturado
 * girado por qualquer ângulo continua saturado — vira azul, verde, laranja,
 * nunca cinza. Com o preset Grafite (acento `#a1a1aa`, ~5% de saturação) a
 * cerimônia saía AZUL em vez de cinza, porque 329° de giro é só outra cor
 * viva. O que falta é encolher a saturação na mesma proporção do acento.
 */
export function saturacaoDoHex(hex) {
  const rgb = hexParaRgb(hex)
  if (!rgb) return null
  const [r, g, b] = rgb.split(' ').map((v) => Number(v) / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  if (d === 0) return 0
  const l = (max + min) / 2
  return d / (1 - Math.abs(2 * l - 1))
}

/**
 * Quanto a arte da cerimônia precisa encolher (ou crescer) de saturação para
 * chegar no preset. 1 = sem mudança, que é o caso do preset padrão.
 */
export function saturacaoDaCerimonia(preset) {
  const s = saturacaoDoHex(preset?.acento)
  if (s === null) return 1
  const ref = saturacaoDoHex('#a855f7')
  // Duas casas bastam, e evita publicar um número com dezessete dígitos no CSS.
  return Math.round((s / ref) * 100) / 100
}

export function hueDoHex(hex) {
  const rgb = hexParaRgb(hex)
  if (!rgb) return null
  const [r, g, b] = rgb.split(' ').map((v) => Number(v) / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  if (d === 0) return 0 // cinza puro: matiz não existe, e girar não faz nada

  let h
  if (max === r) h = ((g - b) / d) % 6
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4

  h *= 60
  return h < 0 ? h + 360 : h
}

/**
 * O CORPO DO CRISTAL — o ponto médio entre o realce claro e o profundo.
 *
 * Era `#6b24b7` chumbado no componente, e não é um valor arbitrário: ele fica
 * exatamente entre o acento (#a855f7) e o tom fundo (#4c1d95) do preset padrão.
 * Essa RELAÇÃO é o que dá ao cristal a leitura de quartzo — corpo mais fechado
 * que a luz que o atravessa. Derivar preserva a relação em qualquer preset, em
 * vez de pedir um décimo terceiro valor por paleta.
 */
export function corpoDoCristal(preset) {
  const a = hexParaRgb(preset?.acento)
  const b = hexParaRgb(acentoProfundo(preset))
  if (!a || !b) return '#6b24b7'

  const [ar, ag, ab] = a.split(' ').map(Number)
  const [br, bg, bb] = b.split(' ').map(Number)
  const meio = (x, y) => Math.round((x + y) / 2)
  const hex = (n) => n.toString(16).padStart(2, '0')
  return `#${hex(meio(ar, br))}${hex(meio(ag, bg))}${hex(meio(ab, bb))}`
}

/**
 * O giro a aplicar na arte da cerimônia, em graus, já normalizado.
 *
 * ARREDONDA A DIFERENÇA ANTES DE NORMALIZAR, e a ordem importa: o matiz real de
 * #a855f7 é 270,74°, não os 271 redondos da referência. Normalizando primeiro, a
 * diferença de -0,26° virava 359,74 e o arredondamento devolvia 360 — mesmo
 * ângulo na prática, mas um valor que faz o preset padrão parecer estar girando
 * a cena. Arredondando antes, ele dá 0 e diz a verdade.
 */
export function giroDaCerimonia(preset) {
  const h = hueDoHex(preset?.acento)
  if (h === null) return 0
  const delta = Math.round(h - MATIZ_REFERENCIA)
  return ((delta % 360) + 360) % 360
}

export function hexParaRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim())
  if (!m) return null
  const n = parseInt(m[1], 16)
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`
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

  /**
   * O VÉU DAS JANELAS SEM FOCO.
   *
   * Com várias janelas abertas, o z-order sozinho não diz onde está a atenção.
   * O corpo das que não têm foco recua para trás desta camada; a barra de
   * título fica de fora, porque é ela que identifica a janela e apagá-la
   * transformaria a pilha em retângulos iguais.
   *
   * Forte de propósito, a pedido do dono do projeto: o ponto é a janela ativa
   * ficar sozinha em plena luz, não um sombreado educado. Em 0.45 as janelas de
   * trás ainda competiam por olhar.
   *
   * De dia o valor é MENOR e violeta, não preto: sobre superfície clara, o
   * mesmo 0.78 de preto não recua, ele suja — vira fuligem em cima do conteúdo.
   * O que se quer nos dois casos é distância, e cada fundo pede uma dose.
   */
  /**
   * A OPACIDADE, e não a cor. A cor do véu é theme-aware e depende do acento
   * ativo, então ela mora em `os/tokens.css` (`--veu-base`), que é a camada
   * dona do chrome. Aqui fica o que é ajuste: quanto ele apaga.
   *
   * De noite a base é preto puro — recuo, sem cor. De dia é um tom FUNDO do
   * acento: um véu preto sobre painel claro vira fuligem cinza, e um violeta
   * fixo (que era o valor antigo) briga com qualquer preset que não seja roxo.
   * O dono do projeto pegou isso com o preset Papel.
   *
   * Percentual e não decimal: é o que `color-mix()` consome direto.
   */
  veuAlfa: '78%',
  veuAlfaClaro: '55%',
  /**
   * Quanto tempo o véu leva para entrar e sair. Trocar de foco entre janelas é
   * gesto frequente: rápido demais lê como piscada, lento demais atrasa a
   * resposta ao clique. 220ms é a mesma faixa das outras transições nomeadas do
   * sistema (o menu Iniciar em 160ms, o painel de ajustes em 240ms).
   */
  veuDuracaoMs: 220,
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
  /**
   * O balão de tela cheia da área de trabalho.
   *
   * `delay` grande de propósito: ele entra DEPOIS que a cortina da cerimônia
   * subiu e os ícones terminaram de cascatear. Aparecer junto com o resto
   * faria dele mais um elemento chegando ao mesmo tempo — e o ponto dele é ser
   * notado.
   */
  /**
   * Os balões da área de trabalho.
   *
   * `delay` grande de propósito: eles entram DEPOIS que a cortina da cerimônia
   * subiu e os ícones terminaram de cascatear. Chegar junto com o resto faria
   * deles mais um elemento no mesmo instante — e o ponto é serem notados.
   *
   * `intervalo` escalona o segundo: dois avisos aparecendo juntos no mesmo
   * canto lêem como erro; um depois do outro lê como sistema conversando.
   */
  avisoDesktop: {
    duration: 0.4,
    duracaoReduzida: 0.2,
    delay: 1.6,
    intervalo: 0.45,
    ease: 'easeOut',
  },
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
