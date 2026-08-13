import React, { forwardRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import IconeXp from './xpIcons'
import './AppIconButton.css'

/**
 * BOTÃO DE APP
 * --------------------------------------------------
 * O ícone do registry, com a moldura de identidade do sistema. Antes existia em
 * quatro markups diferentes — área de trabalho, tela inicial do mobile, dock e
 * menu Iniciar — com as mesmas declarações de gradiente, borda, sombra e cor
 * copiadas entre eles.
 *
 * Duas variantes:
 *   tile   quadrado de vidro + label embaixo (área de trabalho, tela inicial)
 *   plana  ícone solto, sem moldura (dock, menu Iniciar)
 *
 * O tamanho vem da variante de tamanho, não de prop numérica: os quatro usos
 * têm medidas fixas e conhecidas, e um número livre convidaria a inventar um
 * quinto tamanho sem motivo.
 *
 * Não conhece o gerenciador de janelas: quem abre é quem passa `onClick`.
 */
/**
 * O GLIFO CARREGA A IDENTIDADE DO APP, ENTÃO ELE PRECISA DE PRESENÇA.
 *
 * Os sete tiles da área de trabalho compartilham fundo, borda e raio — a única
 * coisa que distingue "Terminal" de "Gerenciador de Dispositivos" é a silhueta
 * do glifo. Em 26px com traço 1.75 dentro de um tile de 56px sobravam 15px de
 * anel de cada lado e a forma ficava pequena e fina demais para ser reconhecida
 * sem ler o rótulo. Em 32px com traço 2 sobram 12px, e o traço mais grosso
 * sobrevive à escala do wallpaper por trás.
 *
 * Só `tile` muda: `dock` e `lista` são a variante plana, que nunca teve esse
 * problema porque ali o ícone vem acompanhado de texto na mesma linha.
 */
const TAMANHO_ICONE = {
  desktop: 32,
  mobile: 32,
  dock: 22,
  lista: 20,
}

const ESPESSURA_ICONE = {
  desktop: 2,
  mobile: 2,
  dock: 1.9,
  lista: 1.75,
}

const AppIconButton = forwardRef(function AppIconButton(
  { app, titulo, variante = 'tile', tamanho = 'desktop', onClick, ...resto },
  ref,
) {
  /**
   * O PRESET PODE TROCAR O GLIFO INTEIRO, e hoje só o XP troca.
   *
   * Os ícones do XP não são variações de cor do glifo lucide: são desenhos com
   * volume, contorno e degradê, de outra família visual — um traço de 2px não
   * vira um monitor de tubo com ajuste de token. Por isso a substituição é do
   * COMPONENTE, e não do estilo.
   *
   * A leitura do preset acontece aqui, e não em cada um dos quatro lugares que
   * montam este botão (área de trabalho, tela inicial do mobile, dock e menu
   * Iniciar). Passar por prop obrigaria os quatro a conhecer a regra, e o
   * primeiro que esquecesse ficaria com um ícone fora do conjunto.
   *
   * App sem ícone XP CAI NO LUCIDE DE SEMPRE, e isto era uma promessa que o código
   * não cumpria.
   *
   * O comentário aqui já dizia "`IconeXp` devolve `null` nesse caso, e o `??` abaixo
   * cobre" — mas não havia `??` nenhum: era um ternário `usaXp ? <IconeXp/> : ...`,
   * então no preset XP um app sem entrada no mapa renderizava NADA. O defeito ficou
   * latente porque todos os nove apps daquele momento tinham ícone desenhado; ele
   * apareceu no décimo, e apareceu do pior jeito possível — um ícone invisível na
   * área de trabalho, que ninguém procura porque não há nada ali para ver.
   *
   * Agora o fallback é real: `IconeXp` continua devolvendo `null`, e quando devolve,
   * o lucide entra. É o comportamento certo — app novo aparece com o ícone padrão até
   * alguém desenhar o dele, em vez de sumir.
   */
  const { preset } = useTheme()
  const usaXp = !!preset?.xp
  const Icon = app.icon

  return (
    <button
      ref={ref}
      type="button"
      className={`app-icon-btn app-icon-btn--${variante} app-icon-btn--${tamanho}`}
      onClick={onClick}
      {...resto}
    >
      {/* Os ícones do XP são desenhos com volume, não traços: eles pedem mais
          área que o glifo lucide para a silhueta ficar legível no mesmo tile. */}
      <span className="app-icon-btn-glifo">
        {/* O FALLBACK VIAJA JUNTO: é `IconeXp` quem sabe se existe desenho para este
            app, então é ele quem decide. Passar o lucide por prop é o que permite a
            decisão acontecer lá dentro sem este arquivo consultar o mapa. */}
        {usaXp ? (
          <IconeXp
            appId={app.id}
            size={TAMANHO_ICONE[tamanho] + 8}
            Fallback={Icon}
            espessuraFallback={ESPESSURA_ICONE[tamanho]}
          />
        ) : Icon ? (
          <Icon size={TAMANHO_ICONE[tamanho]} strokeWidth={ESPESSURA_ICONE[tamanho]} />
        ) : null}
      </span>
      {variante === 'tile' && <span className="app-icon-btn-label">{titulo}</span>}
      {variante === 'plana' && tamanho === 'lista' && <span>{titulo}</span>}
    </button>
  )
})

export default AppIconButton
