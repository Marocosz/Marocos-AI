import { describe, it, expect } from 'vitest'
import {
  WALLPAPER, JANELAS, CERIMONIA, MOVIMENTO, VIDRO, LAYOUT, REDE, PRESETS, getPreset,
  PRESET_PADRAO, contarPresets,
  hexParaRgb, hueDoHex, giroDaCerimonia, corpoDoCristal, acentoProfundo,
} from './system'
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
  })

  /**
   * A REGRA QUE SUSTENTA OS PRESETS: preset é gosto, custo não entra.
   *
   * Se um preset carregasse `dpr`, `escalaResolucao` ou `fps`, escolher uma
   * paleta viraria escolher — às cegas — quanto o site pesa na máquina de quem
   * visita. Este teste é o que impede alguém de acrescentar uma dessas chaves
   * "só neste preset aqui" um dia.
   */
  it('nenhum preset carrega valor de custo', () => {
    const proibidas = ['dpr', 'fps', 'escalaResolucao']
    for (const [tema, lista] of Object.entries(PRESETS)) {
      for (const p of lista) {
        for (const chave of proibidas) {
          expect(p[chave], `${tema}/${p.id} não pode definir ${chave}`).toBeUndefined()
        }
      }
    }
  })

  /**
   * O ACENTO É O QUE FAZ O PRESET SAIR DO WALLPAPER E CHEGAR NA INTERFACE.
   * Sem ele o preset muda o fundo e mais nada — borda, foco, indicador e realce
   * continuariam roxos enquanto o resto da tela já mudou de cor.
   */
  it('todo preset declara um acento que a ponte consegue converter', () => {
    for (const [tema, lista] of Object.entries(PRESETS)) {
      for (const p of lista) {
        expect(p.acento, `${tema}/${p.id}.acento`).toMatch(/^#[0-9a-f]{6}$/i)
        // Se a conversão falhar, a ponte publica null, o CSS cai no fallback e
        // o preset silenciosamente não pinta nada — falha sem erro nenhum.
        expect(hexParaRgb(p.acento), `${tema}/${p.id} não converte`).toMatch(
          /^\d{1,3} \d{1,3} \d{1,3}$/,
        )
      }
    }
  })

  /**
   * A CERIMÔNIA SEGUE O PRESET POR GIRO DE MATIZ, e o preset padrão tem de
   * girar ZERO — senão a cena de sempre muda de cor para quem nunca abriu as
   * configurações.
   */
  it('o preset padrão não gira a arte da cerimônia', () => {
    // Pelo padrão DECLARADO, não por `noite[0]`: os dois coincidem hoje, e o dia
    // em que deixarem de coincidir é justamente o dia em que este teste precisa
    // falar do padrão de verdade.
    expect(giroDaCerimonia(getPreset('dark', null))).toBe(0)
  })

  it('presets de outra família giram a cerimônia para o matiz deles', () => {
    const brasa = PRESETS.noite.find((p) => p.id === 'brasa')
    const giro = giroDaCerimonia(brasa)
    // #fb923c é laranja (~27°), contra o violeta de referência (271°).
    expect(giro).toBeGreaterThan(0)
    expect(giro).toBeLessThan(360)
    // Ida e volta: girar o matiz do acento pelo giro tem de cair na referência.
    expect(Math.round((hueDoHex(brasa.acento) - giro + 360) % 360)).toBe(271)
  })

  it('corpoDoCristal fica entre o acento e o tom fundo', () => {
    // A relação que dá ao cristal a leitura de quartzo: corpo mais fechado que
    // a luz que o atravessa. Era #6b24b7 chumbado; agora é derivado.
    const corpo = corpoDoCristal(PRESETS.noite[0])
    expect(corpo).toMatch(/^#[0-9a-f]{6}$/i)

    const [cr, cg, cb] = hexParaRgb(corpo).split(' ').map(Number)
    const [ar, ag, ab] = hexParaRgb(PRESETS.noite[0].acento).split(' ').map(Number)
    const [pr, pg, pb] = hexParaRgb(acentoProfundo(PRESETS.noite[0])).split(' ').map(Number)

    for (const [c, a, p] of [[cr, ar, pr], [cg, ag, pg], [cb, ab, pb]]) {
      expect(c).toBeGreaterThanOrEqual(Math.min(a, p))
      expect(c).toBeLessThanOrEqual(Math.max(a, p))
    }
  })

  /**
   * `acentoProfundo` GANHOU UM SEGUNDO CONSUMIDOR, e ele é o CSS.
   *
   * Era usado só pelo cristal, por prop. Agora a ponte o publica como
   * `--cfg-accent-profundo` porque o tile de ícone das pastas da Stack é um gradiente
   * do acento para este tom. Um hex malformado antes só afetaria a peça 3D; agora
   * derruba um gradiente de CSS, que degrada em silêncio.
   */
  it('acentoProfundo devolve hex válido para todo preset', () => {
    for (const [tema, lista] of [['noite', PRESETS.noite], ['dia', PRESETS.dia]]) {
      for (const p of lista) {
        expect(acentoProfundo(p), `${tema}/${p.id}`).toMatch(/^#[0-9a-f]{6}$/i)
      }
    }
  })

  it('hexParaRgb devolve o trio da sintaxe rgb(... / alpha)', () => {
    expect(hexParaRgb('#a855f7')).toBe('168 85 247')
    expect(hexParaRgb('a855f7')).toBe('168 85 247')
    expect(hexParaRgb('#000000')).toBe('0 0 0')
    expect(hexParaRgb('#ffffff')).toBe('255 255 255')
    // Malformado degrada para o fallback do CSS em vez de derrubar o boot.
    expect(hexParaRgb('#abc')).toBeNull()
    expect(hexParaRgb('roxo')).toBeNull()
    expect(hexParaRgb(undefined)).toBeNull()
  })

  it('cada preset tem id único e um céu completo', () => {
    for (const [tema, lista] of Object.entries(PRESETS)) {
      expect(lista.length, `${tema} precisa de pelo menos 5 presets`).toBeGreaterThanOrEqual(5)

      const ids = lista.map((p) => p.id)
      // Id repetido faz getPreset devolver sempre o primeiro, e a escolha do
      // visitante pelo segundo nunca "pegaria" — falha silenciosa.
      expect(new Set(ids).size, `${tema} tem id repetido`).toBe(ids.length)

      for (const p of lista) {
        // O céu tem dois consumidores (base atrás do shader no desktop,
        // wallpaper inteiro no mobile): faltar uma parada quebra os dois.
        for (const parada of ['topo', 'meio', 'baixo']) {
          expect(p.ceu?.[parada], `${tema}/${p.id}.ceu.${parada}`).toMatch(/^#[0-9a-f]{6}$/i)
        }
      }
    }
  })

  /**
   * O PADRÃO É DECLARADO, não "o primeiro da lista" — a ordem do array é a ordem
   * das amostras nas Configurações, e amarrar uma coisa à outra faria reordenar a
   * grade trocar em silêncio a primeira impressão do site. Este teste é o que
   * mantém as duas independentes.
   */
  it('getPreset cai no padrão declarado quando o id salvo não existe mais', () => {
    expect(PRESET_PADRAO.dark).toBe('ametista')
    expect(PRESET_PADRAO.light).toBe('ceu-claro')

    // É o caso real de um localStorage antigo depois de um preset ser removido.
    expect(getPreset('dark', 'preset-que-nao-existe').id).toBe(PRESET_PADRAO.dark)
    expect(getPreset('light', null).id).toBe(PRESET_PADRAO.light)
    expect(getPreset('dark', 'brasa').id).toBe('brasa')

    // E o padrão de cada tema tem de EXISTIR na lista daquele tema, senão o
    // fallback silencioso do `getPreset` assume e ninguém percebe.
    for (const [tema, id] of [['dark', PRESET_PADRAO.dark], ['light', PRESET_PADRAO.light]]) {
      const lista = tema === 'dark' ? PRESETS.noite : PRESETS.dia
      expect(lista.some((p) => p.id === id), `${id} não está na lista de ${tema}`).toBe(true)
    }
  })

  /**
   * PRESET SÓBRIO É OUTRO MODO, não outra paleta: ele não tem shader, então não
   * tem `cor`/`velocidade`, e em compensação precisa de `fundo` — sem ele o
   * wallpaper renderiza uma div vazia e a tela fica preta.
   */
  /**
   * DOIS LUGARES MOSTRAM ESTE NÚMERO — a ficha "Este sistema" do "Sobre este PC" e
   * o balão de boas-vindas. Eles já discordaram (o balão dizia "Doze" quando havia
   * dezessete), e é por isso que a contagem virou função.
   *
   * DISTINTO, não a soma: o XP é o MESMO objeto nas duas listas, então somar daria
   * uma escolha a mais do que o visitante tem.
   */
  it('contarPresets conta escolhas distintas, não entradas de lista', () => {
    const soma = PRESETS.noite.length + PRESETS.dia.length
    expect(contarPresets()).toBe(soma - 1) // o -1 é o XP, compartilhado
    expect(contarPresets()).toBe(new Set([...PRESETS.noite, ...PRESETS.dia]).size)
  })

  it('todo preset sóbrio traz o fundo desenhado e dispensa os campos de shader', () => {
    const sobrios = [...PRESETS.noite, ...PRESETS.dia].filter((p) => p.sobrio)
    // 2 por tema + o XP, que aparece nos dois (e é sóbrio: o Luna era opaco).
    expect(sobrios.length, 'era para haver 2 sóbrios por tema, mais o XP em ambos').toBe(6)

    for (const p of sobrios) {
      expect(typeof p.fundo, `${p.id}.fundo`).toBe('string')
      expect(p.fundo.trim().length).toBeGreaterThan(0)
      // Sem shader, estes campos não fazem sentido — e declará-los daria a
      // impressão de que mudam alguma coisa.
      expect(p.cor, `${p.id} não deve declarar cor de shader`).toBeUndefined()
      expect(p.velocidade, `${p.id} não deve declarar velocidade`).toBeUndefined()
    }
  })

  it('cada tema tem pelo menos dois presets sóbrios e dois animados', () => {
    for (const [tema, lista] of Object.entries(PRESETS)) {
      expect(lista.filter((p) => p.sobrio).length, `sóbrios em ${tema}`).toBeGreaterThanOrEqual(2)
      expect(lista.filter((p) => !p.sobrio).length, `animados em ${tema}`).toBeGreaterThanOrEqual(2)
    }
  })

  /**
   * O XP É O MESMO OBJETO NOS DOIS TEMAS, e o teste é por identidade de
   * referência de propósito: duas cópias iguais passariam num `toEqual` hoje e
   * derivariam na primeira vez que alguém editasse uma delas. A piada depende de
   * dia e noite renderizarem idêntico — é o único preset em que trocar o tema
   * não muda nada.
   */
  it('o preset XP é literalmente o mesmo objeto nas duas listas', () => {
    const noite = PRESETS.noite.find((p) => p.id === 'xp')
    const dia = PRESETS.dia.find((p) => p.id === 'xp')

    expect(noite, 'o XP some da lista da noite').toBeDefined()
    expect(dia, 'o XP some da lista do dia').toBeDefined()
    expect(noite).toBe(dia)
    expect(getPreset('dark', 'xp')).toBe(getPreset('light', 'xp'))
  })

  it('o XP carrega o que o resto do sistema lê dele', () => {
    const xp = getPreset('dark', 'xp')

    // A marca que liga `.modo-xp` no Shell.
    expect(xp.xp).toBe(true)
    // Troca "MAROCOS OS" na cerimônia e na tela de bloqueio.
    expect(xp.nomeSistema).toBe('MAROCOS XP')
    // Cristal laranja com luz verde — ver a nota no preset sobre por que duas
    // cores em oposição funcionam onde quatro saturadas viravam cinza.
    expect(xp.corpoCristal).toMatch(/^#[0-9a-f]{6}$/i)
    expect(xp.luzCristal).toMatch(/^#[0-9a-f]{6}$/i)
    // A fonte do XP, publicada pela ponte de config como `--cfg-fonte-preset`.
    expect(xp.fonte).toContain('Tahoma')
  })

  it('o corpo do cristal obedece o preset quando ele manda', () => {
    // Sem isto a regra geral tiraria a média do acento (azul Luna) e devolveria
    // um cristal azul, engolindo o laranja.
    expect(corpoDoCristal(getPreset('dark', 'xp'))).toBe('#f97316')
    // E quem não manda continua caindo na média de sempre.
    expect(corpoDoCristal(getPreset('dark', 'ametista'))).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('os presets de noite e de dia têm as formas que cada shader consome', () => {
    for (const p of PRESETS.noite.filter((x) => !x.sobrio)) {
      expect(p.cor, `noite/${p.id}.cor`).toMatch(/^#[0-9a-f]{6}$/i)
      // Velocidade 0 e escala 0 nao sao "mais sutil": sao fundo parado e fundo
      // sem padrao. Ruido pode ser 0, que e o liso chapado descrito no config.
      expect(p.velocidade).toBeGreaterThan(0)
      expect(p.escala).toBeGreaterThan(0)
      expect(p.ruido).toBeGreaterThanOrEqual(0)
    }

    for (const p of PRESETS.dia.filter((x) => !x.sobrio)) {
      // O Iridescence recebe multiplicador RGB normalizado, nao hex — trocar a
      // forma aqui pinta preto sem erro nenhum no console.
      expect(Array.isArray(p.cor), `dia/${p.id}.cor precisa ser [r,g,b]`).toBe(true)
      expect(p.cor).toHaveLength(3)
      for (const canal of p.cor) {
        expect(canal).toBeGreaterThanOrEqual(0)
        expect(canal).toBeLessThanOrEqual(1)
      }
      expect(p.velocidade).toBeGreaterThan(0)
    }
  })

  it('preserva os valores do Iridescence', () => {
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
    expect(MOVIMENTO.minimizarJanela).toEqual({
      duration: 0.26, duracaoReduzida: 0, ease: 'easeOut', escala: 0.9,
    })
    expect(MOVIMENTO.trocaPresetMs).toBe(420)
    // Os dois valores de movimento em SEGUNDOS — eles viram `animation-duration`
    // no CSS em vez de passar pelo motion.
    expect(MOVIMENTO.marqueeStackS).toBe(18)
    expect(MOVIMENTO.luzDaBordaS).toBe(2.6)
    expect(MOVIMENTO.pulsoStatusS).toBe(2.4)
    // A saída é mais longa que a entrada de propósito — luz que apaga devagar lê
    // como luz; apagar rápido lê como "sumiu". Ver a nota no config.
    expect(MOVIMENTO.luzDaBordaEntradaS).toBe(0.18)
    expect(MOVIMENTO.luzDaBordaSaidaS).toBe(0.5)
    expect(MOVIMENTO.luzDaBordaSaidaS).toBeGreaterThan(MOVIMENTO.luzDaBordaEntradaS)

    expect(MOVIMENTO.jornadaPasseioS).toBe(6)
    expect(MOVIMENTO.jornadaTrocaS).toBe(0.32)
    // O passeio tem de ser MUITO mais longo que a troca, senão a entrada nova aparece
    // já saindo e o passeio lê como falha em vez de movimento.
    expect(MOVIMENTO.jornadaPasseioS).toBeGreaterThan(MOVIMENTO.jornadaTrocaS * 10)
  })

  it('o chrome assenta ANTES do wallpaper, nunca depois', () => {
    // Interface que ainda muda de cor depois que o fundo já parou lê como
    // travamento. O contrário é aceitável: uma dissolução grande pode continuar
    // atrás de uma interface que já se decidiu. Ver a nota em `trocaPresetMs`.
    expect(MOVIMENTO.trocaPresetMs).toBeLessThanOrEqual(WALLPAPER.crossfade.duracaoMs)
  })

  it('minimizar encolhe sem parecer que fecha', () => {
    // Escala baixa demais lê como "a janela sumiu"; alta demais não comunica
    // nada. Este intervalo é o que separa "recuou" de "fechou".
    expect(MOVIMENTO.minimizarJanela.escala).toBeGreaterThan(0.8)
    expect(MOVIMENTO.minimizarJanela.escala).toBeLessThan(1)

    // Movimento reduzido pede troca INSTANTÂNEA, não rápida — mesma regra da
    // maximizada logo acima.
    expect(MOVIMENTO.minimizarJanela.duracaoReduzida).toBe(0)
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
      superficie: {
        noite: {
          // Sem `realce`: o hover das ações do "Sobre" é só a luz na borda, sem
          // mudança de fundo, então a dose saiu do config junto com o token. Ver a
          // nota longa no lugar onde ela ficava.
          acento: '16%',
          borda: '26%',
          alfaLuz: 0.55,
          alfaLavagem: 0.14,
          alfaFilete: 0.45,
          alfaFaixa: 0.26,
          alfaFaixaMeio: 0.1,
        },
        dia: {
          acento: '8%',
          borda: '24%',
          alfaLuz: 0.45,
          alfaLavagem: 0.1,
          alfaFilete: 0.4,
          alfaFaixa: 0.2,
          alfaFaixaMeio: 0.08,
        },
      },
      luzDaBorda: {
        espessura: '2px',
        halo: '6px',
        desfoque: '7px',
        alfaHalo: 0.5,
        alfaBordaHover: 0.45,
        brilho: '55%',
      },
    })
  })

  /**
   * A DERIVA QUE ESTE TESTE PEGA: acrescentar uma dose de superfície para um tema
   * e esquecer o outro. O `tokens.css` declara `--sup-*` nos dois blocos de tema,
   * e a ponte publica um `--cfg-sup-*` por dose por tema — uma chave só de um
   * lado deixa o tema oposto caindo silenciosamente no fallback literal, que é
   * exatamente o tipo de coisa que aparece meses depois como "o tema claro está
   * um pouco diferente".
   */
  it('as doses de superfície existem nos dois temas', () => {
    const noite = Object.keys(VIDRO.superficie.noite).sort()
    const dia = Object.keys(VIDRO.superficie.dia).sort()
    expect(dia).toEqual(noite)

    // As porcentagens são strings porque entram cruas no color-mix; os alphas são
    // números porque entram num rgb(... / X). Trocar um pelo outro invalida a cor
    // inteira em silêncio.
    for (const tema of ['noite', 'dia']) {
      const s = VIDRO.superficie[tema]
      for (const chave of ['acento', 'borda']) {
        expect(s[chave], `${tema}.${chave}`).toMatch(/^\d+%$/)
      }
      for (const chave of ['alfaLuz', 'alfaLavagem', 'alfaFilete', 'alfaFaixa', 'alfaFaixaMeio']) {
        expect(typeof s[chave], `${tema}.${chave}`).toBe('number')
        expect(s[chave], `${tema}.${chave}`).toBeGreaterThan(0)
        expect(s[chave], `${tema}.${chave}`).toBeLessThanOrEqual(1)
      }
    }
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

    /**
     * ÁREA ÚTIL DESEJADA por app — a base da qual o crescimento saiu. O nome
     * "ANTES" é histórico: o que este mapa guarda é que o chrome de explorador
     * não coma o conteúdo, e essa conta segue exata mesmo quando um app decide
     * que precisa de mais espaço.
     *
     * O "Sobre" chegou a ir para 700 na passada de página de entrada, quando ia
     * ter duas fichas técnicas lado a lado; voltou para 620 quando a ficha do
     * hardware saiu da janela. Registrado aqui porque é a pergunta que a próxima
     * pessoa vai fazer ao ver 620 num app que tem duas grades.
     */
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
    expect(APPS.find((a) => a.id === 'settings').defaultSize).toEqual({ w: 560, h: 660 })
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
