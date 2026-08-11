import { describe, it, expect } from 'vitest'
import { WALLPAPER, JANELAS, CERIMONIA, MOVIMENTO, VIDRO, LAYOUT, REDE } from './system'
// O registry entra aqui porque o contrato do chrome de explorador é ENTRE os
// dois arquivos: o config diz o tamanho do chrome, o registry diz o tamanho das
// janelas, e a soma é a asserção. Testar só um lado não pega a deriva.
import { APPS } from '../os/registry'

describe('config do sistema', () => {
  /**
   * OS AJUSTES ESTÉTICOS DO SILK DEIXARAM DE SER FIXADOS EM VALOR.
   *
   * Este teste nasceu para provar que trazer os números de Wallpaper.jsx para o
   * config não mudou nenhum deles. Função cumprida — a migração acabou. Manter
   * `velocidade`, `escala`, `rotacao` e `ruido` presos a literais passou a
   * atrapalhar em vez de proteger: são exatamente os quatro botões que o dono do
   * projeto gira a olho no wallpaper, e cada volta de botão derrubava um teste
   * que não guardava contrato nenhum.
   *
   * Ficou o que tem consequência fora do próprio shader: os dois valores de
   * CUSTO, que o comentário do config promete e o Silk.jsx consome. Para o
   * resto, faixa em vez de valor — fora dela o fundo para de funcionar como
   * fundo, e isso sim é regressão.
   */
  it('preserva os contratos de custo do Silk, não os ajustes esteticos', () => {
    expect(WALLPAPER.silk.dpr).toBe(0.6)
    expect(WALLPAPER.silk.fps).toBe(20)

    expect(WALLPAPER.silk.cor).toMatch(/^#[0-9a-f]{6}$/i)
    // Velocidade 0 e escala 0 nao sao "mais sutil": sao fundo parado e fundo
    // sem padrao. Ruido pode ser 0, que e o liso chapado descrito no config.
    expect(WALLPAPER.silk.velocidade).toBeGreaterThan(0)
    expect(WALLPAPER.silk.escala).toBeGreaterThan(0)
    expect(WALLPAPER.silk.ruido).toBeGreaterThanOrEqual(0)
  })

  it('preserva os valores do Iridescence', () => {
    expect(WALLPAPER.iridescence.cor).toEqual([0.9, 0.9, 0.95])
    expect(WALLPAPER.iridescence.amplitude).toBe(0.1)
    expect(WALLPAPER.iridescence.velocidade).toBe(1)
    expect(WALLPAPER.iridescence.reagirAoMouse).toBe(false)
    /**
     * ESTE É UM VALOR DE CUSTO, e por isso continua fixado em literal mesmo
     * depois de os ajustes estéticos do Silk terem virado faixa.
     *
     * `escalaResolucao` é a fração da tela em que o shader realmente desenha —
     * o mesmo papel do `dpr` do Silk. Foi de 0.6 para 1 por decisão do dono do
     * projeto: o tema claro passou a renderizar em resolução cheia, ou seja
     * ~2.8x os pixels de antes. Como o blur de toda janela é refeito a cada
     * quadro do wallpaper, esse número multiplica o custo de tudo que estiver
     * por cima. Se um dia for preciso ganhar performance no tema claro, é aqui
     * e no `fps` que se mexe primeiro.
     */
    expect(WALLPAPER.iridescence.escalaResolucao).toBe(1)
    expect(WALLPAPER.iridescence.fps).toBe(20)
  })

  /**
   * O TETO DE FPS FALHA EM SILÊNCIO QUANDO A CHAVE NÃO EXISTE.
   *
   * Os dois shaders calculam `1000 / WALLPAPER.<shader>.fps` e comparam
   * `t - ultimoDesenho < INTERVALO_MS` para decidir se pulam o frame. Com `fps`
   * ausente isso vira `1000 / undefined` = NaN, e QUALQUER comparação com NaN é
   * false — então o `return` antecipado nunca acontece e o shader desenha em
   * todo requestAnimationFrame. Foi exatamente o que aconteceu com o
   * Iridescence: o comentário no código prometia 20fps, o cap estava inerte, e
   * o tema claro rodava a 60fps+ pagando o re-blur das janelas em cada um.
   *
   * Nada quebra, nada avisa, e o custo é ~3x o documentado. Por isso este teste
   * checa a EXISTÊNCIA de um número finito, não só o valor.
   */
  it('os dois shaders declaram um teto de fps finito', () => {
    for (const shader of ['silk', 'iridescence']) {
      const fps = WALLPAPER[shader].fps
      expect(Number.isFinite(fps), `${shader}.fps precisa ser número`).toBe(true)
      expect(fps).toBeGreaterThan(0)
    }
  })

  it('a rede de seguranca do crossfade e mais longa que a animacao', () => {
    // Valores literais primeiro: sem eles, se os dois numeros mudassem juntos
    // (ex.: 700 -> 750 e 4000 -> 4200) a desigualdade abaixo continuaria valendo
    // e o teste passaria sem perceber a transcricao errada.
    expect(WALLPAPER.crossfade.duracaoMs).toBe(700)
    expect(WALLPAPER.crossfade.limiteSegurancaMs).toBe(4000)

    // Se o cronometro vencer a animacao, o crossfade e cortado pela metade.
    expect(WALLPAPER.crossfade.limiteSegurancaMs)
      .toBeGreaterThan(WALLPAPER.crossfade.duracaoMs)
  })

  it('preserva a geometria de nascimento das janelas', () => {
    expect(JANELAS.baseX).toBe(96)
    expect(JANELAS.baseY).toBe(64)
    expect(JANELAS.passoCascata).toBe(24)
    expect(JANELAS.voltaCascata).toBe(240)
    expect(JANELAS.viesHorizontal).toBe(0.5)
    expect(JANELAS.viesVertical).toBe(0.42)
    expect(JANELAS.margem).toBe(16)
    expect(JANELAS.alturaTaskbar).toBe(52)
  })

  it('os vieses ficam entre 0 e 1', () => {
    // Fora dessa faixa a janela nasce fora do quadro.
    expect(JANELAS.viesHorizontal).toBeGreaterThanOrEqual(0)
    expect(JANELAS.viesHorizontal).toBeLessThanOrEqual(1)
    expect(JANELAS.viesVertical).toBeGreaterThanOrEqual(0)
    expect(JANELAS.viesVertical).toBeLessThanOrEqual(1)
  })

  it('preserva os tempos da cerimonia', () => {
    expect(CERIMONIA.duracaoBootMs).toBe(4800)
    expect(CERIMONIA.duracaoBootReduzidaMs).toBe(2600)
    expect(CERIMONIA.spinBoot).toBe(3.2)
    expect(CERIMONIA.spinBloqueio).toBe(1.6)
    expect(CERIMONIA.tamanhoCristal).toBe(300)
    expect(CERIMONIA.tamanhoCristalPequeno).toBe(200)
    expect(CERIMONIA.larguraCristalPequeno).toBe(620)
    expect(CERIMONIA.seguraSaidaMs).toBe(1200)
  })

  it('o boot reduzido e mais curto que o normal, mas nao zero', () => {
    expect(CERIMONIA.duracaoBootReduzidaMs)
      .toBeLessThan(CERIMONIA.duracaoBootMs)
    expect(CERIMONIA.duracaoBootReduzidaMs).toBeGreaterThan(0)
  })

  it('preserva as transicoes nomeadas do movimento', () => {
    // toEqual no objeto inteiro: mais curto que campo por campo e nao deixa
    // nenhuma chave de fora por esquecimento.
    expect(MOVIMENTO.taskbarEntrada).toEqual({ delay: 0.4, duration: 0.5 })
    expect(MOVIMENTO.iconesDesktop).toEqual({
      delayPorItem: 0.05, duration: 0.3, deslocamentoY: 8,
    })
    expect(MOVIMENTO.iconesMobile).toEqual({
      delayPorItem: 0.03, duration: 0.25, deslocamentoY: 8,
    })
    expect(MOVIMENTO.maximizarJanela).toEqual({
      duration: 0.22, duracaoReduzida: 0, ease: 'easeOut',
    })
    expect(MOVIMENTO.menuIniciar).toEqual({ duration: 0.16, ease: 'easeOut' })
    expect(MOVIMENTO.quickSettings).toEqual({
      duration: 0.24, duracaoReduzida: 0.15, ease: 'easeOut',
    })
    expect(MOVIMENTO.quickSettingsFundo).toEqual({ duration: 0.2 })
    expect(MOVIMENTO.pushMobile).toEqual({ duration: 0.28, ease: 'easeOut' })
    expect(MOVIMENTO.acordeaoDispositivos).toEqual({ duration: 0.2, ease: 'easeInOut' })
    expect(MOVIMENTO.indicadorTaskbar).toEqual({ type: 'spring', stiffness: 300, damping: 30 })
    expect(MOVIMENTO.marqueeSkillsS).toBe(18)
  })

  it('a taskbar tem a mesma altura no JS e no CSS', () => {
    // windowManager reserva essa faixa; tokens.css desenha a barra nela.
    expect(JANELAS.alturaTaskbar).toBe(VIDRO.alturaTaskbar)
  })

  it('preserva o material de vidro do sistema', () => {
    expect(VIDRO).toEqual({
      blurJanela: 'blur(6px) saturate(125%)',
      blurMenuIniciar: 'blur(20px) saturate(150%)',
      blurMenuContexto: 'blur(16px) saturate(150%)',
      blurTaskbar: 'blur(12px)',
      raio: '10px',
      raioControle: '8px',
      alturaTitulo: '40px',
      alturaTaskbar: 52,
    })
  })

  it('preserva o breakpoint de desktop', () => {
    expect(LAYOUT.breakpointDesktop).toBe(1024)
  })

  it('preserva o layout de icones e assinatura', () => {
    expect(LAYOUT.icones).toEqual({
      origemX: '20px',
      origemY: '20px',
      larguraBotao: '88px',
      tamanhoTile: '56px',
      raioTile: '14px',
      // 3px desde que todo rótulo de ícone passou a ocupar uma linha só: o item
      // ficou fixo em 94,4px e 7 × 94,4 + 6 × 4 estouraria por 0,8px o espaço de
      // uma viewport de 768px. A justificativa está em config/system.js.
      intervalo: '3px',
      folgaInferior: '32px',
    })
    expect(LAYOUT.assinatura).toEqual({
      origemTopo: '40px',
      origemDireita: '40px',
      larguraMaxima: '460px',
    })
  })

  /**
   * O CHROME DE EXPLORADOR TEM CONTRATO COM O TAMANHO DAS JANELAS.
   *
   * Os seis apps com `explorer: true` cresceram exatamente a largura da lateral
   * e a soma das duas barras, para o conteúdo manter a área útil que tinha antes
   * do chrome. Mudar o config sem mudar o registry (ou o contrário) encolhe o
   * conteúdo de seis janelas sem nada avisar — é o tipo de deriva que só aparece
   * meses depois, quando alguém estranha que a tabela do Stack ficou apertada.
   */
  it('o chrome de explorador bate com o crescimento dos tamanhos de janela', () => {
    const px = (v) => Number.parseInt(v, 10)
    const lateral = px(LAYOUT.explorador.lateralLargura)
    // As TRÊS faixas horizontais. O painel de detalhes fica de fora: nasce
    // fechado, e somá-lo deixaria seis janelas largas por um painel que quase
    // sempre não está lá.
    const barras =
      px(LAYOUT.explorador.navAltura) +
      px(LAYOUT.explorador.comandosAltura) +
      px(LAYOUT.explorador.statusAltura)

    expect(lateral).toBe(184)
    expect(barras).toBe(106)

    // Tamanhos de antes do chrome, por app — a base da qual o crescimento saiu.
    const ANTES = {
      about: { w: 620, h: 520 },
      projects: { w: 640, h: 440 },
      project: { w: 560, h: 500 },
      history: { w: 700, h: 520 },
      devices: { w: 620, h: 520 },
      readme: { w: 520, h: 400 },
    }

    for (const app of APPS.filter((a) => a.explorer)) {
      const base = ANTES[app.id]
      expect(base, `falta a base de ${app.id} neste teste`).toBeDefined()
      expect(app.defaultSize.w, `largura de ${app.id}`).toBe(base.w + lateral)
      expect(app.defaultSize.h, `altura de ${app.id}`).toBe(base.h + barras)
    }

    // E quem NÃO tem chrome não pode ter crescido.
    expect(APPS.find((a) => a.id === 'terminal').defaultSize).toEqual({ w: 680, h: 440 })
    expect(APPS.find((a) => a.id === 'assistant').defaultSize).toEqual({ w: 460, h: 620 })
    expect(APPS.find((a) => a.id === 'settings').defaultSize).toEqual({ w: 520, h: 440 })
  })

  it('Terminal e Marcos Virtual ficam fora do chrome de explorador', () => {
    // Decisão explícita do dono do projeto: "esses sao diferentes".
    for (const id of ['terminal', 'assistant', 'settings']) {
      expect(APPS.find((a) => a.id === id).explorer, id).toBe(false)
    }
  })

  it('preserva o contrato de rede do chat', () => {
    expect(REDE.timeoutChatMs).toBe(60000)
    expect(REDE.apiBase).toMatch(/\/api$/)
    // Valor exato, nao so o formato: sob vitest, MODE e sempre 'test' (nunca
    // 'production'), entao import.meta.env.DEV resolve para true de forma
    // deterministica em qualquer maquina ou CI que rode `vitest run` sem
    // sobrescrever o modo — confirmado empiricamente antes de escrever esta
    // asserção. Se algum dia isso mudar, e porque o ambiente de teste mudou de
    // verdade, e este teste deve avisar.
    expect(REDE.apiBase).toBe('http://localhost:8000/api')
  })
})
