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
import { VIDRO, LAYOUT, WALLPAPER, MOVIMENTO } from './system'

export function aplicarConfigNoCss(tema = 'dark') {
  if (typeof document === 'undefined') return

  const raiz = document.documentElement
  const ceu = WALLPAPER.ceu[tema] || WALLPAPER.ceu.dark

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

    // Layout
    '--cfg-icone-origem-x': LAYOUT.icones.origemX,
    '--cfg-icone-origem-y': LAYOUT.icones.origemY,
    '--cfg-icone-largura': LAYOUT.icones.larguraBotao,
    '--cfg-icone-tile': LAYOUT.icones.tamanhoTile,
    '--cfg-icone-raio': LAYOUT.icones.raioTile,
    '--cfg-icone-intervalo': LAYOUT.icones.intervalo,
    '--cfg-icone-folga': LAYOUT.icones.folgaInferior,
    '--cfg-assinatura-topo': LAYOUT.assinatura.origemTopo,
    '--cfg-assinatura-direita': LAYOUT.assinatura.origemDireita,
    '--cfg-assinatura-largura': LAYOUT.assinatura.larguraMaxima,

    // Wallpaper — o gradiente de base, que é também o fundo inteiro no mobile
    '--cfg-ceu-topo': ceu.topo,
    '--cfg-ceu-meio': ceu.meio,
    '--cfg-ceu-baixo': ceu.baixo,
    '--cfg-crossfade': `${WALLPAPER.crossfade.duracaoMs}ms`,

    // Movimento que vive em CSS
    '--cfg-marquee-skills': `${MOVIMENTO.marqueeSkillsS}s`,
  }

  for (const [nome, valor] of Object.entries(vars)) {
    raiz.style.setProperty(nome, valor)
  }
}
