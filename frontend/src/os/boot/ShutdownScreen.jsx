import { useLanguage } from '../../contexts/LanguageContext'
import { getOsData } from '../../i18n/os'
import './boot.css'

/**
 * ShutdownScreen — homenagem à tela de "é seguro desligar o computador" do
 * Windows 9x: fundo preto, texto âmbar monoespaçado centralizado. Um botão
 * "ligar novamente" devolve o controle ao sistema via onPowerOn().
 */
const ShutdownScreen = ({ onPowerOn }) => {
  const { language } = useLanguage()
  const os = getOsData(language)
  const strings = os.shutdown || {}

  return (
    <div className="shutdown-screen" role="status" aria-label={strings.ariaLabel}>
      <div className="shutdown-content">
        <p className="shutdown-message">{strings.message}</p>
        {strings.subMessage && <p className="shutdown-submessage">{strings.subMessage}</p>}

        <button type="button" className="shutdown-power-btn" onClick={onPowerOn}>
          {strings.powerOnLabel}
        </button>
      </div>
    </div>
  )
}

export default ShutdownScreen
