import { useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../i18n/os'
import './boot.css'

/**
 * TELA DE DESLIGADO — um POST de BIOS parado no meio.
 *
 * Antes era um parágrafo centralizado herdado do "é seguro desligar o
 * computador" do Windows 9x. O markup existia, mas **nenhuma das classes dele
 * tinha CSS em lugar nenhum** — o JSDoc antigo prometia "fundo preto, texto
 * âmbar monoespaçado" e nada disso estava escrito. A tela também não tem cena no
 * regressor visual, então ninguém a fotografava e o descompasso não aparecia.
 *
 * POR QUE BIOS, e não uma variação do chrome do sistema: uma máquina desligada
 * não mostra o sistema operacional, mostra o firmware. Então aqui não entra
 * vidro, nem roxo, nem Poppins — nada do vocabulário do Marocos OS. É a camada
 * de baixo do computador, e ela fala em mono âmbar sobre preto. É o mesmo
 * princípio que faz o Terminal ser diferente dos outros apps, levado ao extremo.
 *
 * O inventário é conteúdo, não enfeite: cada linha aponta para algo que existe
 * de verdade no portfólio. POST que lista hardware inventado é cenário, e o
 * resto deste projeto não faz isso.
 */
const ShutdownScreen = ({ onPowerOn }) => {
  const { language } = useLanguage()
  const os = getOsData(language)
  const s = os.shutdown || {}

  // Numa BIOS, qualquer tecla liga. O botão continua existindo para toque e
  // para leitor de tela — o listener é um atalho, não a única porta.
  useEffect(() => {
    const aoTeclar = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onPowerOn()
      }
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [onPowerOn])

  return (
    <div className="shutdown-screen" role="status" aria-label={s.ariaLabel}>
      <div className="shutdown-post">
        <header className="shutdown-firmware">
          <span className="shutdown-firmware-nome">{s.firmware}</span>
          <span className="shutdown-firmware-versao">{s.firmwareVersion}</span>
          <span className="shutdown-firmware-copy">{s.copyright}</span>
        </header>

        <p className="shutdown-post-label">{s.postLabel}</p>

        <dl className="shutdown-inventario">
          {(s.inventory || []).map((linha) => (
            <div className="shutdown-linha" key={linha.chave}>
              <dt>{linha.chave}</dt>
              <dd>{linha.valor}</dd>
            </div>
          ))}
        </dl>

        <p className="shutdown-halted">
          {s.halted}
          {/* O cursor piscando é o que diz "parado, esperando", e é a única
              coisa em movimento na tela inteira. */}
          <span className="shutdown-cursor" aria-hidden="true" />
        </p>
        <p className="shutdown-hint">{s.haltedHint}</p>

        <button type="button" className="shutdown-power-btn" onClick={onPowerOn}>
          <span className="shutdown-power-tecla">{s.powerKey}</span>
          {s.powerOnLabel}
        </button>
      </div>
    </div>
  )
}

export default ShutdownScreen
