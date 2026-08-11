/**
 * MOCKS DE REDE DO HARNESS
 * ==================================================
 * O backend do agente (`api.marocos.dev`) não faz parte do que estes specs
 * testam, e depender dele traz duas coisas ruins de uma vez: a suíte passa a
 * exigir o FastAPI no ar, e passa a fotografar um número que muda com tráfego
 * real.
 *
 * Um handler só, compartilhado, porque os dois specs precisam do mesmo endpoint
 * por motivos diferentes:
 *
 *   rotas.spec.js   precisa da RESPOSTA do agente (`POST /chat`, em SSE) para
 *                   provar que o chunk do react-markdown só é buscado depois
 *                   dela.
 *   visual.spec.js  precisa do STATUS de cota (`GET /chat/status`), porque o
 *                   rodapé que a cena `assistente` fotografa só existe se esse
 *                   endpoint responder (`AssistantApp.jsx` monta
 *                   `.assistant-footer` sob `usage &&`) — e o texto dele é a
 *                   cota diária GLOBAL do projeto, que sobe a cada conversa de
 *                   qualquer visitante. Sem mock, uma cena de tolerância zero
 *                   dependeria da rede de produção e do movimento do dia.
 *
 * Duas cópias quase iguais divergiriam no primeiro ajuste: o preflight CORS e o
 * formato exato do SSE são justamente o tipo de detalhe que se corrige num
 * arquivo e se esquece no outro.
 */

/**
 * Intercepta os dois endpoints do chat. Inclui o preflight CORS porque o
 * `apiBase` de produção é cross-origin em relação ao `vite preview` local.
 *
 * Seguro de aplicar em qualquer cena, inclusive nas que nunca falam com o
 * agente: o casamento é por `pathname` contendo `/chat`, e nenhuma rota do
 * registry nem nenhum asset do build cai nisso.
 */
export async function mockarChat(page) {
  await page.route((url) => url.pathname.includes('/chat'), async (route) => {
    const req = route.request()
    const corsHeaders = {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
    }

    if (req.method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: corsHeaders })
    }

    if (req.url().endsWith('/chat/status')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({ current: 1, limit: 100 }),
      })
    }

    // POST /chat — devolve um SSE de um evento de status + um resultado com
    // markdown de verdade (negrito + link), num corpo só (sem streaming real:
    // a leitura via reader() funciona igual).
    const sse = [
      'event: status',
      'data: {"message":"Pensando..."}',
      '',
      'event: result',
      'data: {"response":"**Bússola V2** é um projeto. Veja o [repositório](https://example.com/bussola).","usage":{"current":2,"limit":100}}',
      '',
      '',
    ].join('\n')

    return route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      headers: corsHeaders,
      body: sse,
    })
  })
}
