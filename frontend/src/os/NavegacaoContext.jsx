import { createContext, useContext } from 'react'

/**
 * COMO ESTE APP NAVEGA — decidido pelo container, não pelo app.
 * --------------------------------------------------
 * `ProjectsApp` precisa levar o visitante ao detalhe de um projeto. Antes ele
 * chamava `open` direto, e era a exceção declarada à regra de apps não
 * conhecerem o gerenciador de janelas.
 *
 * Com o chrome de explorador a resposta certa passou a DEPENDER de onde o app
 * está montado, e o app não pode saber isso:
 *
 *   janela com chrome de explorador  -> `navigate`, troca o conteúdo da própria
 *                                       janela (entrar numa pasta)
 *   janela sem chrome                -> `open`, abre janela nova
 *   app em tela cheia no mobile      -> `open`, empilha uma tela com botão
 *                                       voltar, que é a metáfora de lá
 *
 * Então quem fornece a função é o container: `desktop/Window.jsx` e
 * `mobile/MobileApp.jsx`. O app só pede "me leve a este destino" e continua
 * agnóstico — que é a promessa do cabeçalho de registry.js.
 *
 * Fora de um container o hook devolve `null`, e o app decide o que fazer com
 * isso. Não lança: um app renderizado num teste ou numa página isolada não
 * deve quebrar por causa de navegação que ninguém pediu.
 */
const NavegacaoContext = createContext(null)

export const NavegacaoProvider = NavegacaoContext.Provider

/** `(appId, params) => void`, ou `null` fora de um container. */
export function useIrPara() {
  return useContext(NavegacaoContext)
}
