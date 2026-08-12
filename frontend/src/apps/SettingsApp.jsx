import React from 'react'
import { Sparkles, Check } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import { getOsData } from '../i18n/os'
import { useSystemToggles } from '../ui/useSystemToggles'
import ToggleRow from '../ui/ToggleRow'
import Dica from '../ui/Dica'
import { PRESETS } from '../config/system'
import './SettingsApp.css'

/**
 * A AMOSTRA DE UM PRESET É DESENHADA COM O PRESET.
 *
 * Não é um quadradinho de cor arbitrário: o gradiente vem do `ceu` do próprio
 * preset, os mesmos três tons que o wallpaper vai usar. Uma amostra que não
 * fosse feita do valor real seria só uma legenda colorida — e mentiria no dia
 * em que alguém mudasse o preset e esquecesse a amostra.
 */
const Amostra = ({ preset }) => (
  <span
    className="settings-preset-amostra"
    aria-hidden="true"
    /* Nos sóbrios a amostra mostra o FUNDO REAL do preset, com trama e tudo —
       é o que diferencia um do outro, e um degradê de três tons não contaria
       essa diferença. */
    style={{
      background: preset.sobrio
        ? preset.fundo
        : `linear-gradient(140deg, ${preset.ceu.topo} 0%, ${preset.ceu.meio} 52%, ${preset.ceu.baixo} 100%)`,
    }}
  />
)

/**
 * CONFIGURAÇÕES DO MAROCOS OS
 * --------------------------------------------------
 * Casa definitiva dos três controles que antes viviam só na bandeja: tema,
 * idioma e animação. Eles continuam na taskbar como atalho rápido — o que
 * muda é que agora existe um lugar onde dá para ler o que cada um faz.
 *
 * Não sabe que janelas existem: o <Window> é quem envolve.
 */
const SettingsApp = () => {
  const { language } = useLanguage()
  const os = getOsData(language)
  const toggles = useSystemToggles()
  const { isDark, preset, escolherPreset } = useTheme()
  const t = os.settings.wallpaper

  /**
   * Mostra os presets do tema ATIVO, não os doze de uma vez.
   *
   * Escolher uma paleta de dia enquanto se olha para a tela de noite é escolher
   * às cegas: o visitante não vê o resultado. Alternar o tema já é um clique na
   * mesma janela, e aí a lista troca junto — a escolha acontece sempre com o
   * fundo à vista.
   */
  const lista = isDark ? PRESETS.noite : PRESETS.dia

  return (
    <div className="settings-app">
      <p className="settings-intro">{os.settings.intro}</p>

      <ul className="settings-list">
        {toggles.map((l) => (
          <ToggleRow key={l.id} linha={l} mostrarHint alvo="valor" className="toggle-row--settings" />
        ))}
      </ul>

      <section className="settings-wallpaper">
        <h3 className="settings-wallpaper-titulo">{t.label}</h3>
        <p className="settings-wallpaper-hint">{isDark ? t.hintNight : t.hintDay}</p>

        <ul className="settings-presets" role="radiogroup" aria-label={t.label}>
          {lista.map((p) => {
            const ativo = p.id === preset.id
            return (
              <li key={p.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={ativo}
                  className={`settings-preset${ativo ? ' settings-preset--ativo' : ''}`}
                  onClick={() => escolherPreset(p.id)}
                >
                  <Amostra preset={p} />
                  <span className="settings-preset-nome">{t.presets[p.id] ?? p.id}</span>
                  {/* Os sóbrios mudam o MODO, não só a paleta — quem escolhe
                      precisa saber que está desligando o movimento e o vidro.
                      Numa dica e não numa linha de texto: a grade existe para
                      ser escaneada de relance, e uma legenda por item embaixo
                      de cada nome dobrava a altura de cada cartão. */}
                  {p.sobrio && (
                    <Dica
                      texto={t.sober}
                      rotulo={t.soberLabel}
                      className="settings-preset-dica"
                    />
                  )}
                  {ativo && (
                    <span className="settings-preset-check" title={t.current}>
                      <Check size={13} strokeWidth={2.5} />
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <p className="settings-footer">
        <Sparkles size={13} />
        {os.settings.persistNote}
      </p>
    </div>
  )
}

export default SettingsApp
