import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import { useMovimentoReduzido } from '../os/hooks/useMediaQuery'
import { PRESETS, getPreset } from '../config/system'

const ThemeContext = createContext(null)

function readBool(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved !== null ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

/**
 * O preset salvo é lido como STRING crua, não por JSON.parse.
 *
 * Diferente das outras preferências daqui: `isDarkMode` e `isAnimationEnabled`
 * são booleanos e precisam do parse. Um id é texto, e `JSON.parse('ametista')`
 * lança. Guardar cru também deixa o valor legível no DevTools, que é onde
 * alguém vai olhar quando uma preferência não voltar.
 */
function readId(key) {
  try {
    return localStorage.getItem(key) || null
  } catch {
    return null
  }
}

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => readBool('isDarkMode', true))
  const [isAnimated, setIsAnimated] = useState(() => readBool('isAnimationEnabled', true))
  const movimentoReduzido = useMovimentoReduzido()

  /**
   * UM PRESET SALVO POR TEMA, e não um só.
   *
   * Quem escolheu "Brasa" para a noite e "Aurora" para o dia espera as duas
   * escolhas de volta ao alternar o tema. Com uma chave única, trocar de tema
   * apagaria a preferência do outro — e o visitante teria de reescolher toda vez.
   */
  const [idNoite, setIdNoite] = useState(() => readId('wallpaperPresetNoite'))
  const [idDia, setIdDia] = useState(() => readId('wallpaperPresetDia'))

  /**
   * OS DOIS PRESETS FICAM DISPONÍVEIS, não só o do tema atual — e isso é
   * exigência do crossfade, não conveniência.
   *
   * Na troca de tema o Wallpaper mantém DUAS camadas vivas por alguns
   * quadros: a que entra, com o tema novo, e a que sai, com o antigo. Se o
   * contexto só entregasse o preset ativo, a camada que está saindo pintaria
   * com os valores do tema que está chegando — e o crossfade viraria um fade
   * sobre uma cópia de si mesmo, que é exatamente o bug que tokens.css
   * documenta ter acontecido com os gradientes do céu.
   *
   * `getPreset` já cai no primeiro da lista quando o id não existe, o que cobre
   * um localStorage com preset removido numa versão futura.
   */
  const presets = useMemo(
    () => ({ dark: getPreset('dark', idNoite), light: getPreset('light', idDia) }),
    [idNoite, idDia],
  )
  const preset = isDark ? presets.dark : presets.light

  const escolherPreset = useCallback(
    (id) => {
      const paraNoite = isDark
      const lista = paraNoite ? PRESETS.noite : PRESETS.dia
      if (!lista.some((p) => p.id === id)) return

      localStorage.setItem(paraNoite ? 'wallpaperPresetNoite' : 'wallpaperPresetDia', id)
      if (paraNoite) setIdNoite(id)
      else setIdDia(id)
    },
    [isDark],
  )

  // Respeitar a preferência do sistema não existia no projeto e é
  // requisito do spec: sem isto o wallpaper e o boot animam à força.
  //
  // Só na montagem, de propósito: religar a animação se a preferência mudar
  // no meio do uso seria comportamento novo, não pedido. Por isso o efeito
  // roda uma única vez e ignora mudanças posteriores de `movimentoReduzido`.
  useEffect(() => {
    if (movimentoReduzido) setIsAnimated(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      localStorage.setItem('isDarkMode', JSON.stringify(!prev))
      return !prev
    })
  }, [])

  const toggleAnimation = useCallback(() => {
    setIsAnimated((prev) => {
      localStorage.setItem('isAnimationEnabled', JSON.stringify(!prev))
      return !prev
    })
  }, [])

  return (
    <ThemeContext.Provider
      value={{
        isDark, isAnimated, toggleTheme, toggleAnimation, preset, presets, escolherPreset,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme precisa estar dentro de ThemeProvider')
  return ctx
}
