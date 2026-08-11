import React, { useState, useEffect } from 'react'

/**
 * RELÓGIO
 * --------------------------------------------------
 * Havia três implementações com três intervalos: a taskbar tiquetaqueava a cada
 * segundo, a barra de status do mobile a cada 30s, e o da tela de bloqueio
 * alinhava o primeiro tique à virada do minuto.
 *
 * O ALINHAMENTO ERA A ÚNICA IMPLEMENTAÇÃO CORRETA, e agora vale para todas.
 * Um `setInterval(60_000)` disparado na montagem erra o minuto exibido por até
 * meio intervalo: se a página carrega aos 40 segundos, o relógio só troca aos
 * 40 do minuto seguinte. Alinhar à virada custa um `setTimeout` a mais e
 * elimina o erro. É a mudança de comportamento consciente deste componente
 * único: a taskbar deixa de tiquetaquear a cada segundo (nunca mostrou
 * segundos, então a tela é a mesma) e ganha o mesmo acerto de virada que só
 * o bloqueio tinha.
 *
 * NENHUM DOS TRÊS FORMATOS MOSTRA SEGUNDOS, então nenhum precisa de tique de
 * um segundo — repintar 60x por minuto para trocar um dígito por minuto era
 * desperdício. O intervalo é derivado do formato.
 */
const FORMATADORES = {
  hm: (d, locale) => ({
    principal: d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
    secundario: null,
  }),
  'hm-data': (d, locale) => ({
    principal: d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
    secundario: d.toLocaleDateString(locale, {
      day: '2-digit', month: '2-digit', year: 'numeric',
    }),
  }),
  extenso: (d, locale) => ({
    principal: d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
    secundario: d.toLocaleDateString(locale, {
      weekday: 'long', day: 'numeric', month: 'long',
    }),
  }),
}

const Clock = ({
  formato = 'hm',
  locale = undefined,
  classePrincipal = '',
  classeSecundaria = '',
}) => {
  const [agora, setAgora] = useState(() => new Date())

  useEffect(() => {
    let intervalo
    // Alinha o primeiro tique à virada do minuto.
    const msAteVirar = (60 - new Date().getSeconds()) * 1000
    const inicio = setTimeout(() => {
      setAgora(new Date())
      intervalo = setInterval(() => setAgora(new Date()), 60_000)
    }, msAteVirar)

    return () => {
      clearTimeout(inicio)
      clearInterval(intervalo)
    }
  }, [])

  const { principal, secundario } = FORMATADORES[formato](agora, locale)

  return (
    <>
      <div className={classePrincipal}>{principal}</div>
      {secundario && <div className={classeSecundaria}>{secundario}</div>}
    </>
  )
}

export default React.memo(Clock)
