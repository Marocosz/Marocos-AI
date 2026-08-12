/**
 * PONTE CONFIG -> CSS
 * ==================================================
 * O `system.js` é a fonte única, mas metade dos valores que ele guarda só têm
 * efeito dentro do CSS. Esta função escreve esses valores como custom
 * properties `--cfg-*` no elemento raiz, e o `tokens.css` os consome.
 *
 * Roda no boot e de novo a cada troca de tema, porque as cores do céu dependem
 * dele.
 *
 * CADA CONSUMO NO CSS TEM FALLBACK. `var(--cfg-raio, 10px)` pinta 10px se esta
 * função ainda não rodou ou falhou. Não pode existir um frame sem raio de
 * janela — e um `var()` sem fallback resolve para nada, não para o valor
 * anterior.
 */
import {
  VIDRO, LAYOUT, WALLPAPER, MOVIMENTO, JANELAS, hexParaRgb, giroDaCerimonia,
  saturacaoDaCerimonia,
} from './system'

export function aplicarConfigNoCss(tema = 'dark', preset = null) {
  if (typeof document === 'undefined') return

  const raiz = document.documentElement
  // O céu vem do PRESET ativo, não mais de WALLPAPER.ceu fixo por tema — é ele
  // que o visitante escolhe. O fallback cobre a chamada sem preset (nenhuma
  // hoje, mas a assinatura antiga tinha um argumento só).
  const ceu = preset?.ceu || WALLPAPER.ceu[tema] || WALLPAPER.ceu.dark

  const vars = {
    // Vidro
    '--cfg-blur-janela': VIDRO.blurJanela,
    '--cfg-blur-menu-iniciar': VIDRO.blurMenuIniciar,
    '--cfg-blur-menu-contexto': VIDRO.blurMenuContexto,
    '--cfg-blur-taskbar': VIDRO.blurTaskbar,
    '--cfg-raio': VIDRO.raio,
    '--cfg-raio-controle': VIDRO.raioControle,
    '--cfg-altura-titulo': VIDRO.alturaTitulo,
    '--cfg-altura-taskbar': `${VIDRO.alturaTaskbar}px`,

    /**
     * AS DOSES DA SUPERFÍCIE ELEVADA — ver `VIDRO.superficie` no config para o
     * que cada uma faz e por que noite e dia divergem.
     *
     * OS DOIS TEMAS VÃO JUNTOS, com o sufixo `-claro` para o dia. É o mesmo
     * padrão de `--cfg-veu-alfa` / `--cfg-veu-alfa-claro`, e por um motivo
     * concreto: o `tokens.css` declara `--sup-*` dentro de `.theme-dark` E de
     * `.theme-light` (porque `--win-body-base` difere entre os dois), e as duas
     * regras existem na folha ao mesmo tempo. Publicar um valor só, do tema
     * atual, faria as duas lerem a mesma dose — o mesmo tipo de acoplamento à
     * ordem da ponte que já quebrou o crossfade do wallpaper.
     *
     * São porcentagens e alphas sobre o acento, nunca cores: é isso que faz a
     * superfície repintar junto com o preset.
     */
    '--cfg-sup-acento': VIDRO.superficie.noite.acento,
    '--cfg-sup-borda': VIDRO.superficie.noite.borda,
    '--cfg-sup-realce': VIDRO.superficie.noite.realce,
    '--cfg-sup-luz': String(VIDRO.superficie.noite.alfaLuz),
    '--cfg-sup-lavagem': String(VIDRO.superficie.noite.alfaLavagem),
    '--cfg-sup-filete': String(VIDRO.superficie.noite.alfaFilete),
    '--cfg-sup-faixa': String(VIDRO.superficie.noite.alfaFaixa),
    '--cfg-sup-faixa-meio': String(VIDRO.superficie.noite.alfaFaixaMeio),
    '--cfg-sup-acento-claro': VIDRO.superficie.dia.acento,
    '--cfg-sup-borda-claro': VIDRO.superficie.dia.borda,
    '--cfg-sup-realce-claro': VIDRO.superficie.dia.realce,
    '--cfg-sup-luz-claro': String(VIDRO.superficie.dia.alfaLuz),
    '--cfg-sup-lavagem-claro': String(VIDRO.superficie.dia.alfaLavagem),
    '--cfg-sup-filete-claro': String(VIDRO.superficie.dia.alfaFilete),
    '--cfg-sup-faixa-claro': String(VIDRO.superficie.dia.alfaFaixa),
    '--cfg-sup-faixa-meio-claro': String(VIDRO.superficie.dia.alfaFaixaMeio),

    // Layout
    '--cfg-icone-origem-x': LAYOUT.icones.origemX,
    '--cfg-icone-origem-y': LAYOUT.icones.origemY,
    '--cfg-icone-largura': LAYOUT.icones.larguraBotao,
    '--cfg-icone-tile': LAYOUT.icones.tamanhoTile,
    '--cfg-icone-raio': LAYOUT.icones.raioTile,
    '--cfg-icone-intervalo': LAYOUT.icones.intervalo,
    '--cfg-icone-folga': LAYOUT.icones.folgaInferior,
    /**
     * O ACENTO, NAS DUAS FORMAS QUE O CSS PRECISA.
     *
     * `--cfg-accent` é o hex, para quem quer a cor cheia.
     * `--cfg-accent-rgb` é o trio cru ("168 85 247"), para `rgb(var(...) / X)`
     * — é ele que permite qualquer opacidade do acento sem um token por passo.
     *
     * Vem do PRESET: é isto que faz a escolha do visitante alcançar borda,
     * ícone, foco e realce, e não só o wallpaper.
     */
    '--cfg-accent': preset?.acento || null,
    '--cfg-accent-rgb': hexParaRgb(preset?.acento),
    /**
     * O giro de matiz da arte da cerimônia. Ver `giroDaCerimonia` no config: a
     * cena tem mais de trinta paradas de gradiente desenhadas à mão, e girar o
     * matiz da camada é o que leva o preset até lá sem desmontar a composição.
     */
    '--cfg-cerimonia-giro': `${giroDaCerimonia(preset)}deg`,
    /**
     * O giro sozinho não cobre preset acromático: `hue-rotate` gira o matiz mas
     * não o remove, então o Grafite saía azul em vez de cinza. Este fator
     * encolhe a saturação na mesma proporção do acento.
     */
    '--cfg-cerimonia-sat': String(saturacaoDaCerimonia(preset)),
    '--cfg-veu-alfa': JANELAS.veuAlfa,
    '--cfg-veu-alfa-claro': JANELAS.veuAlfaClaro,
    '--cfg-veu-duracao': `${JANELAS.veuDuracaoMs}ms`,
    '--cfg-explorer-lateral': LAYOUT.explorador.lateralLargura,
    '--cfg-explorer-nav': LAYOUT.explorador.navAltura,
    '--cfg-explorer-comandos': LAYOUT.explorador.comandosAltura,
    '--cfg-explorer-status': LAYOUT.explorador.statusAltura,
    '--cfg-explorer-busca': LAYOUT.explorador.buscaLargura,
    '--cfg-explorer-detalhes': LAYOUT.explorador.detalhesLargura,
    '--cfg-assinatura-topo': LAYOUT.assinatura.origemTopo,
    '--cfg-assinatura-direita': LAYOUT.assinatura.origemDireita,
    '--cfg-assinatura-largura': LAYOUT.assinatura.larguraMaxima,

    // Wallpaper — o gradiente de base, que é também o fundo inteiro no mobile
    '--cfg-ceu-topo': ceu.topo,
    '--cfg-ceu-meio': ceu.meio,
    '--cfg-ceu-baixo': ceu.baixo,
    '--cfg-crossfade': `${WALLPAPER.crossfade.duracaoMs}ms`,

    /**
     * A FONTE, quando o preset traz uma. Só o XP traz hoje (Tahoma, a fonte de
     * interface daquele sistema), e é o mesmo caminho de todo o resto: o preset
     * declara, a ponte publica, o CSS lê. Sem isto o `.modo-xp` teria a pilha de
     * fontes escrita à mão no CSS, e passariam a existir dois lugares para
     * trocá-la.
     */
    '--cfg-fonte-preset': preset?.fonte || null,

    /** Quanto o chrome leva para repintar ao trocar de preset — ver a nota em
     *  `MOVIMENTO.trocaPresetMs` e o bloco que a consome em `tokens.css`. */
    '--cfg-troca-preset': `${MOVIMENTO.trocaPresetMs}ms`,

    /** A volta completa do carrossel de stack do "Sobre" — ver
     *  `MOVIMENTO.marqueeStackS`. Em segundos porque é o que o `animation` lê. */
    '--cfg-marquee-stack': `${MOVIMENTO.marqueeStackS}s`,
  }

  for (const [nome, valor] of Object.entries(vars)) {
    raiz.style.setProperty(nome, valor)
  }
}
