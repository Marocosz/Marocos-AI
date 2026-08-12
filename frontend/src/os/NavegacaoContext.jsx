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
/**
 * DUAS INTENÇÕES, NÃO UMA.
 *
 * `irPara` é "entrar": trocar o conteúdo desta janela, como a lateral do
 * explorador faz. `abrir` é "trazer para o lado": uma janela nova, como um
 * atalho da área de trabalho.
 *
 * A distinção é do DONO DO PROJETO e vale como regra do sistema. Ela apareceu
 * de novo no guia do "Sobre este PC": as quatro portas abrem janela, para o
 * guia continuar aberto atrás — quem foi ver os projetos ainda quer voltar às
 * outras perguntas. A lateral do explorador segue trocando o conteúdo, porque
 * ali a metáfora é navegar por pastas.
 *
 * O app continua sem saber que janelas existem: ele declara qual das duas
 * intenções tem, e o container decide o que isso significa no shell dele. No
 * mobile, por exemplo, as duas empilham uma tela — é a metáfora de lá.
 */
const NavegacaoContext = createContext(null)

export const NavegacaoProvider = NavegacaoContext.Provider

/** Entrar: `(appId, params) => void`, ou `null` fora de um container. */
export function useIrPara() {
  return useContext(NavegacaoContext)?.irPara ?? null
}

/** Abrir ao lado: `(appId, params) => void`, ou `null` fora de um container. */
export function useAbrir() {
  return useContext(NavegacaoContext)?.abrir ?? null
}
