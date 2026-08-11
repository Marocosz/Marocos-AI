import React, { useCallback, useEffect, useState } from 'react'
import Silk from './Silk'
import Iridescence from './Iridescence'
import { useDeviceMode } from '../os/useDeviceMode'
import { useTheme } from '../contexts/ThemeContext'
import { WALLPAPER } from '../config/system'

/**
 * WALLPAPER
 * --------------------------------------------------
 * Só o shader que o projeto já usava: Silk no tema escuro, Iridescence no
 * claro. Sem as cristas SVG que existiam antes — elas competiam com o fundo
 * em vez de compor com ele.
 *
 * Os dois shaders rodam com teto de 20fps (ver o teto de fps em Silk.jsx e o
 * intervalo em Iridescence.jsx). Isso não é sobre o shader em si, que é
 * barato: é sobre o backdrop-filter das janelas, que refaz o blur toda vez
 * que o fundo redesenha. Menos frames no fundo, menos re-blur por cima.
 *
 * No mobile os dois cedem lugar a gradiente CSS, como o projeto já fazia:
 * WebGL de tela cheia não vale o custo de bateria num celular.
 */

/**
 * Cor e demais parâmetros dos dois shaders vêm de `WALLPAPER.silk` /
 * `WALLPAPER.iridescence` (config/system.js) — nenhum número literal aqui. O
 * Silk é o tema escuro e o Iridescence o claro: manter esse par preserva a
 * identidade dos dois temas em vez de forçar o mesmo shader nos dois.
 *
 * A rede de segurança do crossfade (ver `WALLPAPER.crossfade.limiteSegurancaMs`)
 * é folgada de propósito. Quem manda no caso normal é o `animationend` da
 * camada que entra — medido em 816ms no Chrome real; isto só existe para o
 * caso de o evento não chegar (aba em segundo plano, animação cancelada). O
 * timer é armado quando o estado muda, não quando a animação começa, e os dois
 * podem estar longe um do outro: montar o shader novo ocupa a main thread, e
 * numa máquina lenta a camada só pinta segundos depois. Com um limite curto o
 * cronômetro vencia a corrida e cortava o crossfade pela metade — vi isso
 * acontecer num renderizador de software, onde a camada nova era revelada em
 * 4% de opacidade. Aqui ele só age quando algo deu errado de fato.
 */

/**
 * Uma camada de céu, para o tema pedido.
 *
 * `preset` chega por prop, e não de `useTheme()` aqui dentro, porque a camada
 * que está SAINDO durante o crossfade precisa dos valores do tema ANTIGO — ler o
 * contexto daqui entregaria os do tema novo às duas camadas.
 */
const Ceu = ({ tema, preset, isMobile, isAnimated }) => {
  /**
   * Celular não paga o custo de WebGL de tela cheia: só o gradiente.
   *
   * As cores vêm por ESTILO INLINE, e não mais só da classe `tema-*`. A classe
   * continua (ela carrega a composição em camadas do tema claro), mas as três
   * paradas do gradiente base agora acompanham o preset — senão trocar de preset
   * no celular, onde não há shader nenhum, não mudaria absolutamente nada.
   *
   * Isto NÃO reintroduz o bug que tokens.css documenta. Lá o problema era
   * `var(--cfg-ceu-*)`: uma variável GLOBAL, reescrita pela ponte antes do
   * primeiro quadro, que as duas camadas liam ao mesmo tempo e pintavam igual.
   * Aqui cada camada recebe o seu próprio literal, calculado do seu próprio
   * preset — a que sai continua com a paleta antiga, que é o que o crossfade
   * precisa revelar.
   */
  if (isMobile) {
    return (
      <div
        className={`marocos-sky-fallback tema-${tema}`}
        style={{
          '--ceu-topo': preset.ceu.topo,
          '--ceu-meio': preset.ceu.meio,
          '--ceu-baixo': preset.ceu.baixo,
        }}
      />
    )
  }

  return tema === 'dark' ? (
    <Silk
      color={preset.cor}
      speed={preset.velocidade}
      scale={preset.escala}
      rotation={preset.rotacao}
      noiseIntensity={preset.ruido}
      isAnimated={isAnimated}
    />
  ) : (
    <Iridescence
      color={preset.cor}
      mouseReact={WALLPAPER.iridescence.reagirAoMouse}
      amplitude={preset.amplitude}
      speed={preset.velocidade}
      isAnimated={isAnimated}
    />
  )
}

/**
 * A TROCA DE TEMA É UM CROSSFADE, NÃO UM CORTE.
 *
 * Antes o shader antigo desmontava no mesmo frame em que o novo montava, e a área
 * de trabalho piscava de um fundo para o outro. Não dava para resolver com
 * `transition`: os dois lados são shaders WebGL diferentes, e no mobile são
 * gradientes CSS — e `background-image` não interpola.
 *
 * Então a camada nova entra POR CIMA da antiga e sobe de opacidade; a antiga sai
 * da árvore quando o crossfade acaba. Dois contextos WebGL ficam vivos durante a
 * troca, o que é aceitável porque é uma ação deliberada do visitante e porque a
 * camada que sai é CONGELADA — ela já está sendo coberta, e desenhar frames que
 * ninguém vai ver seria pagar duas vezes pelo mesmo momento.
 */
const Wallpaper = ({ isAnimated = true }) => {
  const isMobile = useDeviceMode() === 'mobile'
  // `presets` (os dois), e não `preset` (o ativo): a camada que sai durante o
  // crossfade precisa dos valores do tema antigo. Ver a nota no ThemeContext.
  const { isDark, presets } = useTheme()
  const atual = isDark ? 'dark' : 'light'

  /**
   * O TEMA QUE ESTÁ SAINDO É DERIVADO DURANTE O RENDER, NÃO NUM EFEITO.
   *
   * A primeira versão descobria a troca num `useEffect` e não podia funcionar: o
   * efeito roda DEPOIS do render em que o tema já mudou, e nesse render a camada
   * antiga já saiu da árvore. Medi 250ms após a troca e havia uma camada só, em
   * opacidade 0.55 — o shader novo aparecendo sobre a cor de base do wallpaper, e
   * não sobre o anterior. Pior que o corte que eu queria consertar.
   *
   * Ajustar estado durante o render é o padrão previsto do React para exatamente
   * este caso: ele descarta este render e refaz na hora, com as duas camadas
   * presentes já no primeiro frame da troca.
   */
  const [temaAnterior, setTemaAnterior] = useState(atual)
  const [saindo, setSaindo] = useState(null)

  if (temaAnterior !== atual) {
    setTemaAnterior(atual)
    setSaindo(temaAnterior)
  }

  /**
   * QUEM ENCERRA O CROSSFADE É O FIM DA ANIMAÇÃO, NÃO UM CRONÔMETRO.
   *
   * A versão com `setTimeout(700)` media 5830ms na prática: montar o shader novo
   * ocupa a main thread, e um timer nessa fila espera a vez. A camada antiga
   * ficava pendurada por segundos com um contexto WebGL vivo à toa. O evento
   * dispara quando a animação REALMENTE termina, e é imune a isso.
   */
  const encerrar = useCallback((e) => {
    if (e.animationName === 'sky-entra') setSaindo(null)
  }, [])

  useEffect(() => {
    if (!saindo) return
    const id = setTimeout(() => setSaindo(null), WALLPAPER.crossfade.limiteSegurancaMs)
    return () => clearTimeout(id)
  }, [saindo])

  /**
   * UMA LISTA, E NÃO DOIS FILHOS FIXOS.
   *
   * Com dois filhos em posições fixas, React reconcilia por POSIÇÃO antes da
   * chave: a camada antiga trocaria de slot e seria destruída e recriada, dois
   * contextos WebGL por toque em vez de um — e a camada "que está saindo" nasceria
   * em branco, compilando shader, justamente enquanto devia estar sendo revelada.
   * Numa lista a chave manda: a camada antiga é literalmente a mesma que já estava
   * pintada, e só a nova monta.
   *
   * A que está saindo vem primeiro, portanto embaixo.
   */
  const camadas = saindo ? [saindo, atual] : [atual]

  return (
    <div className="marocos-wallpaper" aria-hidden="true">
      {camadas.map((tema) => (
        <div
          key={tema}
          className={`marocos-sky${tema === atual ? ' marocos-sky--entrando' : ''}`}
          onAnimationEnd={tema === atual ? encerrar : undefined}
        >
          <Ceu
            tema={tema}
            preset={presets[tema]}
            isMobile={isMobile}
            isAnimated={tema === atual && isAnimated}
          />
        </div>
      ))}
    </div>
  )
}

export default Wallpaper
