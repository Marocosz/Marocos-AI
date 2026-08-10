import { describe, it, expect } from 'vitest'
import { WALLPAPER, JANELAS, CERIMONIA, MOVIMENTO, VIDRO, LAYOUT, REDE } from './system'

describe('config do sistema', () => {
  it('preserva os valores do Silk que estavam em Hills.jsx', () => {
    expect(WALLPAPER.silk.cor).toBe('#4c1d95')
    expect(WALLPAPER.silk.velocidade).toBe(12)
    expect(WALLPAPER.silk.escala).toBe(1.4)
    expect(WALLPAPER.silk.rotacao).toBe(2.6)
    expect(WALLPAPER.silk.ruido).toBe(1.2)
    expect(WALLPAPER.silk.dpr).toBe(0.6)
    expect(WALLPAPER.silk.fps).toBe(20)
  })

  it('preserva os valores do Iridescence', () => {
    expect(WALLPAPER.iridescence.cor).toEqual([0.9, 0.9, 0.95])
    expect(WALLPAPER.iridescence.amplitude).toBe(0.1)
    expect(WALLPAPER.iridescence.velocidade).toBe(1)
    expect(WALLPAPER.iridescence.reagirAoMouse).toBe(false)
    expect(WALLPAPER.iridescence.escalaResolucao).toBe(0.6)
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
    expect(MOVIMENTO.menuIniciar).toEqual({ duration: 0.16, ease: 'easeOut' })
    expect(MOVIMENTO.popupTray).toEqual({ duration: 0.2 })
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
      intervalo: '4px',
      folgaInferior: '32px',
    })
    expect(LAYOUT.assinatura).toEqual({
      origemTopo: '40px',
      origemDireita: '40px',
      larguraMaxima: '460px',
    })
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
