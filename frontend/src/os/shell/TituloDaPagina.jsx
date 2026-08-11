import { useWindows } from '../WindowManagerContext'
import { useDocumentHead } from '../useDocumentHead'

/**
 * Sincroniza título e canonical com a janela em foco. Precisa viver dentro do
 * provider para saber qual app está focado. Não renderiza nada.
 */
const TituloDaPagina = () => {
  const { windows, focusedKey } = useWindows()
  const focada = windows.find((w) => w.key === focusedKey)
  useDocumentHead({ appId: focada?.appId ?? null, params: focada?.params ?? null })
  return null
}

export default TituloDaPagina
