import React, { useEffect, useMemo, useRef, Suspense } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ChevronLeft } from 'lucide-react'
import { useWindowActions } from '../WindowManagerContext'
import { NavegacaoProvider } from '../NavegacaoContext'
import { getApp } from '../registry'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../i18n/os'
import { MOVIMENTO } from '../../config/system'

/**
 * APP EM TELA CHEIA
 * --------------------------------------------------
 * Equivalente mobile da <Window> do desktop: mesma ideia de header fixo +
 * corpo rolável, só que sem chrome de arrastar/minimizar/maximizar — no
 * celular o app ocupa a tela inteira e "voltar" é a única ação de janela que
 * sobra, mapeada direto para `close(win.key)`.
 *
 * `win` é sempre a última entrada de `windows[]` (a pilha) — quem decide isso
 * é o MobileShell, este componente só recebe e desenha.
 */
const MobileApp = ({ win }) => {
  const { close, open } = useWindowActions()
  const { language } = useLanguage()
  const os = getOsData(language)
  const app = getApp(win.appId)
  const AppComponent = app?.component
  const bodyRef = useRef(null)

  // Respeita prefers-reduced-motion: sem a preferência, o app entra deslizando
  // da direita; com ela, aparece direto, sem o deslocamento em `x`.
  const prefersReducedMotion = useReducedMotion()

  const title = app?.titleKey ? os.windows[app.titleKey] : win.params?.slug || ''

  // As duas intenções apontam para o mesmo lugar neste shell — ver a nota no
  // provider, mais abaixo.
  const navegacao = useMemo(() => ({ irPara: open, abrir: open }), [open])

  // Cada app novo começa com o scroll no topo. Sem isto, abrir um projeto
  // herdaria a posição de rolagem de quem estava aberto antes na pilha.
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0
  }, [win.key])

  return (
    <motion.div
      className="marocos-mobile-app"
      /* Mesmo gancho do desktop: alguns apps precisam pintar o container, e não
         só o próprio miolo. Ver a nota em `desktop/Window.jsx`. */
      data-app={win.appId}
      initial={prefersReducedMotion ? false : { x: '100%' }}
      animate={{ x: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0 : MOVIMENTO.pushMobile.duration,
        ease: MOVIMENTO.pushMobile.ease,
      }}
    >
      <header className="marocos-mobile-app-header">
        <button type="button" className="marocos-mobile-back" onClick={() => close(win.key)}>
          <ChevronLeft size={20} strokeWidth={2.25} />
          <span>{os.mobile.back}</span>
        </button>

        <span className="marocos-mobile-app-title">{title}</span>

        {/* Espaçador simétrico ao botão Voltar, para o título ficar
            visualmente centralizado mesmo com Voltar só de um lado. */}
        <span className="marocos-mobile-app-spacer" aria-hidden="true" />
      </header>

      <div className="marocos-mobile-app-body" ref={bodyRef}>
        {/* No mobile, ir a um destino é EMPILHAR uma tela, não trocar o conteúdo
            desta: a metáfora daqui é pilha com botão voltar, e o chrome de
            explorador não existe neste shell. Por isso `open` — ver
            os/NavegacaoContext.jsx.

            AS DUAS INTENÇÕES COLAPSAM AQUI. No desktop "entrar" e "abrir ao
            lado" são coisas diferentes; num shell de tela cheia as duas viram a
            mesma — empilhar. O app não precisa saber disso. */}
        <NavegacaoProvider value={navegacao}>
          {/* fallback nulo de propósito: com o prefetch em ociosidade o chunk já
              chegou, e um spinner que pisca por 20ms é pior que nada. */}
          {AppComponent ? (
            <Suspense fallback={null}>
              <AppComponent params={win.params} />
            </Suspense>
          ) : null}
        </NavegacaoProvider>
      </div>
    </motion.div>
  )
}

export default MobileApp
