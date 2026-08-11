import React from 'react'
import { motion } from 'motion/react'
import { Signal, BatteryFull } from 'lucide-react'
import { useWindowActions } from '../WindowManagerContext'
import AppIconButton from '../../ui/AppIconButton'
import Clock from '../../ui/Clock'
import { APPS } from '../registry'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../i18n/os'
import { MOVIMENTO } from '../../config/system'

/**
 * TELA INICIAL (springboard)
 * --------------------------------------------------
 * Substitui a metáfora de desktop por uma de home screen de celular: grade
 * fixa de 3 colunas sobre o wallpaper, sem janela nenhuma. Mesma fonte de
 * apps do desktop (`APPS.filter(onDesktop)`), só que o toque abre em tela
 * cheia em vez de numa janela flutuante.
 *
 * A barra de status no topo é o gatilho do QuickSettings: toque ou arrasto
 * para baixo abrem o painel (a barra em si não sabe renderizá-lo — só avisa
 * o MobileShell via `onOpenQuickSettings`).
 */
const HomeScreen = ({ onOpenQuickSettings }) => {
  const { open } = useWindowActions()
  const { language } = useLanguage()
  const os = getOsData(language)
  const icons = APPS.filter((a) => a.onDesktop)

  return (
    <div className="marocos-mobile-home">
      <motion.div
        className="marocos-mobile-statusbar"
        role="button"
        tabIndex={0}
        aria-label={os.mobile.quickSettings.open}
        onClick={onOpenQuickSettings}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onOpenQuickSettings()
        }}
        // Arrastar a barra de status para baixo é o gesto de "puxar" o painel,
        // igual ao centro de notificações de um celular de verdade.
        onPanEnd={(_e, info) => {
          if (info.offset.y > 20) onOpenQuickSettings()
        }}
      >
        {/* Clock emite <div>, não <span> como antes: seguro porque o pai
            (.marocos-mobile-statusbar) é flex, que blockifica o filho
            independente do display declarado -- sem CSS novo a escrever. */}
        <Clock formato="hm" classePrincipal="marocos-mobile-clock" />
        <span className="marocos-mobile-statusicons" aria-hidden="true">
          <Signal size={14} strokeWidth={2.2} />
          <BatteryFull size={17} strokeWidth={2.2} />
        </span>
      </motion.div>

      <ul className="marocos-mobile-grid">
        {icons.map((app, i) => (
          <motion.li
            key={app.id}
            initial={{ opacity: 0, y: MOVIMENTO.iconesMobile.deslocamentoY }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: MOVIMENTO.iconesMobile.delayPorItem * i,
              duration: MOVIMENTO.iconesMobile.duration,
            }}
          >
            {/* Mesma legenda curta da área de trabalho: um app tem um nome só,
                e aqui ela também iguala a altura das fileiras da grade —
                "Gerenciador de Dispositivos" era o único rótulo de duas linhas
                e deixava a segunda fileira mais alta que a primeira. */}
            <AppIconButton
              app={app}
              titulo={os.iconLabels[app.titleKey] ?? os.windows[app.titleKey]}
              variante="tile"
              tamanho="mobile"
              onClick={() => open(app.id)}
            />
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

export default HomeScreen
