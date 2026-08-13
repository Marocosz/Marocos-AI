import React, { useEffect, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { useReducedMotion } from 'motion/react'
import { Expand, Palette, PackageOpen } from 'lucide-react'
import Balao from '../../ui/Balao'
import { useWindowActions } from '../WindowManagerContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../i18n/os'
import { MOVIMENTO, contarPresets } from '../../config/system'
import './AvisosDesktop.css'

/**
 * OS AVISOS DA ÁREA DE TRABALHO
 * --------------------------------------------------
 * Três balões no canto inferior direito, empilhados. Cada um existe porque há
 * algo neste projeto que o visitante não descobre sozinho:
 *
 *   TELA CHEIA  isto é um sistema operacional dentro de uma aba, e a barra do
 *               navegador em volta é a única coisa que denuncia a moldura.
 *   TEMAS       o seletor de papel de parede muda o sistema inteiro, e vive
 *               dentro de um app que ninguém abre sem motivo.
 *   CONTEXTO    dá para levar o portfólio inteiro embora num arquivo, e esse app
 *               NÃO tem ícone na área de trabalho — sem este balão, a única porta
 *               para ele seria o menu Iniciar.
 *
 * A ORDEM DA PILHA É INTENCIONAL, e o de contexto entra por último: os dois
 * primeiros ensinam a máquina, e quem chegou agora precisa entendê-la antes de ser
 * convidado a levá-la embora. Como o `movimento(indice)` escalona a entrada, "por
 * último na pilha" também significa "por último no tempo".
 *
 * NÃO PERSISTEM. Voltam a cada recarga, por decisão do dono do projeto: são
 * convites, não alertas, e um portfólio é visitado uma vez — quem fechou nesta
 * sessão já viu, e quem chegou agora precisa ver. O estado é só de componente.
 *
 * CADA UM TEM A SUA SAÍDA NATURAL, além do X:
 *   tela cheia  some quando o visitante ENTRA em tela cheia, por F11 ou por
 *               qualquer outro caminho — dizer a alguém para fazer o que já fez
 *               é ruído;
 *   temas       some ao levar às Configurações, que é onde ele queria chegar.
 */
/**
 * Tela cheia pelos DOIS caminhos: a da API (que a página pede) e a do
 * navegador (F11), que a API não enxerga — ver a nota no efeito abaixo.
 *
 * A folga de 2px absorve arredondamento de zoom: em 110% o `innerHeight` chega
 * a ficar um pixel abaixo do `screen.height` mesmo em tela cheia.
 */
function estaEmTelaCheia() {
  if (typeof window === 'undefined') return false
  if (document.fullscreenElement) return true

  // AS DUAS DIMENSÕES, e não só a altura: uma janela alta e estreita encostada
  // na lateral tem `innerHeight` igual ao da tela sem estar em tela cheia
  // nenhuma, e o aviso sumia para quem mais precisava dele. Em F11 as duas
  // batem.
  //
  // A folga de 2px absorve arredondamento de zoom — em 110% o `innerHeight`
  // fica um pixel abaixo do `screen.height` mesmo em tela cheia.
  const { innerWidth: l, innerHeight: a, screen: tela } = window
  return a >= tela.height - 2 && l >= tela.width - 2
}

const AvisosDesktop = () => {
  const { language } = useLanguage()
  const os = getOsData(language)
  const t = os.desktop?.avisos
  const { open } = useWindowActions()
  const prefereMovimentoReduzido = useReducedMotion()

  const [fechados, setFechados] = useState({ telaCheia: false, temas: false, contexto: false })
  const fechar = (qual) => setFechados((f) => ({ ...f, [qual]: true }))

  const [emTelaCheia, setEmTelaCheia] = useState(estaEmTelaCheia)

  /**
   * F11 NÃO DISPARA `fullscreenchange`, e é por isso que a primeira versão
   * deste aviso nunca sumia.
   *
   * A Fullscreen API só conhece a tela cheia que a PÁGINA pediu por
   * `requestFullscreen()`. F11 é tela cheia do NAVEGADOR: o documento não entra
   * em `document.fullscreenElement`, e o evento não acontece. Para a API, nada
   * mudou.
   *
   * O que muda de verdade é o tamanho da viewport — em F11 ela passa a ocupar a
   * tela inteira. Então quem avisa é o `resize`, e a checagem é uma medida. O
   * `fullscreenchange` continua ouvido porque cobre o outro caminho, o da API.
   */
  useEffect(() => {
    const conferir = () => setEmTelaCheia(estaEmTelaCheia())
    window.addEventListener('resize', conferir)
    document.addEventListener('fullscreenchange', conferir)
    return () => {
      window.removeEventListener('resize', conferir)
      document.removeEventListener('fullscreenchange', conferir)
    }
  }, [])

  if (!t) return null

  /**
   * O segundo balão entra depois do primeiro. Dois avisos chegando juntos no
   * mesmo canto lêem como erro; escalonados, lêem como sistema conversando.
   */
  const movimento = (indice) => ({
    inicial: prefereMovimentoReduzido ? { opacity: 0 } : { opacity: 0, y: 14 },
    animar: { opacity: 1, y: 0 },
    /**
     * A SAÍDA TEM TRANSIÇÃO PRÓPRIA, e não é detalhe: o `transition` de baixo
     * carrega o `delay` que segura a ENTRADA até a cerimônia acabar (1.6s+), e
     * o motion aplicaria esse mesmo atraso ao sair — clicar no X parecia não
     * fazer nada por quase dois segundos. Declarada dentro do `exit`, ela
     * ganha do `transition` do componente.
     *
     * Mais curta que a entrada, também de propósito: entrar é um convite e pode
     * ter tempo; sair é resposta a um clique e tem de ser imediata.
     */
    sair: prefereMovimentoReduzido
      ? { opacity: 0, transition: { duration: 0.12, delay: 0 } }
      : { opacity: 0, y: 8, transition: { duration: 0.16, delay: 0, ease: 'easeIn' } },
    transition: {
      duration: prefereMovimentoReduzido
        ? MOVIMENTO.avisoDesktop.duracaoReduzida
        : MOVIMENTO.avisoDesktop.duration,
      delay: MOVIMENTO.avisoDesktop.delay + indice * MOVIMENTO.avisoDesktop.intervalo,
      ease: MOVIMENTO.avisoDesktop.ease,
    },
  })

  return (
    <div className="avisos-desktop">
      <AnimatePresence>
        {/* O de CONTEXTO é o único que leva a um app sem ícone na área de trabalho,
            então ele não é só um convite: é a porta principal daquela janela. Como os
            outros, ele some ao levar o visitante onde ele queria chegar. */}
        {!fechados.contexto && t.contexto && (
          <Balao
            key="contexto"
            Icone={PackageOpen}
            titulo={t.contexto.titulo}
            corpo={t.contexto.corpo}
            rotuloFechar={t.fechar}
            onFechar={() => fechar('contexto')}
            acao={() => {
              open('contexto')
              fechar('contexto')
            }}
            transicao={movimento(2)}
          />
        )}

        {/* O `%d` do balão de temas é o número de papéis de parede, e vem de
            `contarPresets()` — a mesma função que a ficha "Este sistema" do
            "Sobre este PC" usa. O texto era literal no i18n, dizia "Doze", e a
            lista já tinha crescido: dois lugares contando a mesma coisa à mão
            sempre acabam discordando. */}
        {!fechados.temas && (
          <Balao
            key="temas"
            Icone={Palette}
            titulo={t.temas.titulo}
            corpo={t.temas.corpo.replace('%d', contarPresets())}
            rotuloFechar={t.fechar}
            onFechar={() => fechar('temas')}
            acao={() => {
              open('settings')
              fechar('temas')
            }}
            transicao={movimento(1)}
          />
        )}

        {!fechados.telaCheia && !emTelaCheia && (
          <Balao
            key="telaCheia"
            Icone={Expand}
            titulo={t.telaCheia.titulo}
            corpo={t.telaCheia.corpo}
            rotuloFechar={t.fechar}
            onFechar={() => fechar('telaCheia')}
            transicao={movimento(0)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default AvisosDesktop
