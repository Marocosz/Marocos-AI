import { Sun, Moon, Play, Pause, Languages } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import { getOsData } from '../i18n/os'

/**
 * OS TRÊS CONTROLES DO SISTEMA, NUM LUGAR SÓ
 * --------------------------------------------------
 * Tema, idioma e movimento apareciam em três telas — o app Configurações, os
 * ajustes rápidos do mobile e o popup da bandeja — cada uma montando a própria
 * lista. Acrescentar um quarto controle custava três arquivos.
 *
 * O hook devolve os dados; quem desenha é cada tela, porque os três formatos
 * são diferentes de verdade:
 *   Configurações   ícone + rótulo + dica + valor por extenso
 *   Ajustes rápidos ícone + rótulo + valor curto
 *   Bandeja         só o ícone, que já É o valor (não usa nem hook nem
 *                   ToggleRow para desenhar, só consome os campos abaixo)
 *
 * `label`/`hint`/`valor` vêm de os.settings.*, e `labelCurto`/`valorCurto` de
 * os.tray.* (rótulo) e os.settings.*.dark|light|on|off (valor curto) — como
 * as chaves de i18n já estavam divididas entre as telas, sem duplicar
 * tradução nem mudar texto nenhum.
 */
export function useSystemToggles() {
  const { language, toggleLanguage } = useLanguage()
  const { isDark, isAnimated, toggleTheme, toggleAnimation } = useTheme()
  const os = getOsData(language)
  const t = os.settings

  return [
    {
      id: 'theme',
      icon: isDark ? Moon : Sun,
      label: t.theme.label,
      labelCurto: os.tray.theme,
      hint: t.theme.hint,
      valor: isDark ? t.theme.dark : t.theme.light,
      valorCurto: isDark ? t.theme.dark : t.theme.light,
      alternar: toggleTheme,
    },
    {
      id: 'language',
      icon: Languages,
      label: t.language.label,
      labelCurto: os.tray.language,
      hint: t.language.hint,
      valor: language === 'pt' ? 'Português (BR)' : 'English (US)',
      valorCurto: language === 'pt' ? 'PT' : 'EN',
      alternar: toggleLanguage,
    },
    {
      id: 'animation',
      icon: isAnimated ? Pause : Play,
      label: t.animation.label,
      labelCurto: os.tray.animation,
      hint: t.animation.hint,
      valor: isAnimated ? t.animation.on : t.animation.off,
      valorCurto: isAnimated ? t.animation.on : t.animation.off,
      alternar: toggleAnimation,
    },
  ]
}
