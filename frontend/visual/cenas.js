/**
 * AS CENAS DO REGRESSOR VISUAL
 * ==================================================
 * Cada entrada descreve UM estado fotografável do Marocos OS: rota, tema, e
 * às vezes um passo extra (ficar na tela de bloqueio, abrir o menu Iniciar,
 * viewport mobile). `visual.spec.js` transforma cada uma num teste.
 *
 * O campo `cristal3d` decide a tolerância de diff (ver playwright.config.js e o
 * README). Ele fica AQUI, junto da cena, e não numa lista separada por nome —
 * na versão anterior deste harness (script solto, fora de versionamento) a
 * classificação vivia num `Set` de nomes em outro arquivo, e isso mordeu: uma
 * cena nova (`menu-iniciar`) foi adicionada às cenas mas esquecida no `Set`,
 * e a tolerância zero errada transformou ruído de rasterização do cristal 3D
 * em alarme falso. Colocar o campo na própria cena elimina essa classe de bug
 * — não tem como esquecer de marcar o que está bem na frente.
 *
 * O CAMPO SE CHAMAVA `webgl`, E ERA LARGO DEMAIS. Quando `playwright.config.js`
 * passou a usar `threshold: 0`, a medição do piso de ruído (duas execuções
 * sobre o mesmo commit, sem tolerância nenhuma — ver README) mostrou que o
 * ruído de rasterização não vem de "ter WebGL na tela": vem do CRISTAL 3D
 * (three/R3F). As cenas que só têm o wallpaper por shader (ogl) — incluindo
 * `wallpaper-escuro`, `wallpaper-claro`, `mobile-home` e `mobile-sobre` —
 * repetiram EXATAMENTE 0 px nas duas execuções, iguais às cenas de puro DOM.
 * Marcar essas quatro como tolerantes dava 2% de folga de graça justamente na
 * cena mais importante do conjunto. O campo agora nomeia a causa real, e só as
 * seis cenas que montam o cristal pagam tolerância.
 *
 * (`mobile-sobre` é `/sobre` no celular e mesmo assim fica em zero porque o
 * AboutApp não monta o cristal fora do desktop — ver `deviceMode` lá.)
 */

/** Viewports. Cenas `mobile: true` usam MOBILE; as demais, DESKTOP. */
export const DESKTOP = { width: 1440, height: 900 }
export const MOBILE = { width: 390, height: 844 }

/**
 * INSTANTE CONGELADO — e por que máscara não bastava.
 *
 * A primeira versão deste harness (ainda como script solto) mascarava as
 * regiões de relógio em vez de congelar o tempo. Funcionou até o dia virar: a
 * data da taskbar passou de 10/08 para 11/08, os glifos mudaram de largura (o
 * Poppins não tem algarismos tabulares), e como `.tray-clock` dimensiona pelo
 * conteúdo — `display: flex` com `padding: 0 8px`, sem largura fixa — a caixa
 * mudou de tamanho e a máscara deslocou junto, vazando uma fresta. Dez das 21
 * cenas acusaram diferença de uma vez, sem nenhuma mudança real de código.
 *
 * O erro de origem foi tratar máscara como solução para tempo. Máscara
 * resolve "esta região é imprevisível"; ela não resolve "esta região MUDA DE
 * TAMANHO", porque a própria máscara é derivada da caixa do elemento.
 *
 * Congelar o relógio ataca a causa: com o `Date` do navegador fixo (via
 * `page.clock.setFixedTime`, instalado ANTES de navegar — ver visual.spec.js),
 * os três relógios exibem sempre o mesmo texto, a caixa nunca muda de tamanho,
 * e a máscara deixa de ser necessária. De quebra, as regiões antes mascaradas
 * passam a ser comparadas de verdade — a cobertura aumenta em vez de diminuir.
 *
 * O instante é arbitrário mas fixo, escolhido para dar hora e data de dois
 * dígitos nos dois formatos exibidos pela UI.
 */
export const INSTANTE_FIXO = new Date('2026-08-10T14:23:00-03:00')

export const CENAS = [
  /**
   * A cena mais importante do conjunto: o wallpaper sozinho, sem janela por
   * cima. É a referência do porte do Silk para ogl.
   *
   * `fecharJanelaAutomatica` existe porque `BoasVindas.jsx` abre "Sobre este
   * PC" sozinha (via `requestIdleCallback`) sempre que a rota é `/` e não há
   * nenhuma janela ainda — exatamente o caso destas duas cenas. Torcer para
   * fotografar ANTES desse callback disparar seria apostar em timing, a
   * mesma classe de erro que a máscara do relógio cometia (ver INSTANTE_FIXO
   * acima): o harness espera a janela abrir de verdade e a FECHA de volta,
   * em vez de tentar vencer uma corrida. Ver visual.spec.js.
   */
  { nome: 'wallpaper-escuro', rota: '/', tema: 'dark', fecharJanelaAutomatica: true },
  { nome: 'wallpaper-claro', rota: '/', tema: 'light', fecharJanelaAutomatica: true },

  // Área de trabalho com janela, ícones, assinatura e taskbar — a janela
  // "Sobre" carrega o cristal 3D, que é a única fonte de ruído medida.
  { nome: 'sobre-escuro', rota: '/sobre', tema: 'dark', cristal3d: true },
  { nome: 'sobre-claro', rota: '/sobre', tema: 'light', cristal3d: true },

  // Os outros oito apps, no tema escuro — nenhum tem canvas, só DOM.
  { nome: 'projetos', rota: '/projetos', tema: 'dark' },
  { nome: 'projeto-detalhe', rota: '/projetos/bussola-v2', tema: 'dark' },
  { nome: 'jornada', rota: '/jornada', tema: 'dark' },
  { nome: 'stack', rota: '/stack', tema: 'dark' },
  { nome: 'contato', rota: '/contato', tema: 'dark' },
  { nome: 'assistente', rota: '/assistente', tema: 'dark' },
  { nome: 'leia-me', rota: '/leia-me', tema: 'dark' },
  { nome: 'config', rota: '/config', tema: 'dark' },

  // Tema claro nos dois apps de tipografia mais densa — é onde uma regressão
  // de peso de fonte ou de cor herdada apareceria primeiro.
  { nome: 'stack-claro', rota: '/stack', tema: 'light' },
  { nome: 'jornada-claro', rota: '/jornada', tema: 'light' },

  // A tela de bloqueio, sem destrancar — o cristal aparece atrás dela.
  { nome: 'bloqueio', rota: '/', tema: 'dark', ficarNoBloqueio: true, cristal3d: true },
  { nome: 'bloqueio-claro', rota: '/', tema: 'light', ficarNoBloqueio: true, cristal3d: true },

  /**
   * Mobile: shell inteiro diferente (sem janelas, com dock). O wallpaper mobile
   * É o shader (mesmo componente do desktop, só que em viewport menor) — e
   * mesmo assim as duas ficam em tolerância ZERO, medida: shader não é cristal.
   * `mobile-sobre` também, porque o AboutApp não monta o cristal no mobile.
   *
   * (No tema claro a home mobile nem shader tem: o fundo é gradiente CSS. Só o
   * tema escuro e o desktop usam Silk/Iridescence nessa superfície.)
   */
  { nome: 'mobile-home', rota: '/', tema: 'dark', mobile: true },
  { nome: 'mobile-sobre', rota: '/sobre', tema: 'dark', mobile: true },
  { nome: 'mobile-home-claro', rota: '/', tema: 'light', mobile: true },

  /**
   * O DOCK E O MENU INICIAR NO TEMA CLARO — cenas acrescentadas depois que um
   * refactor anterior mostrou que faltavam.
   *
   * Naquele refactor, um seletor novo venceu por especificidade o hack global
   * `.theme-light span, li, div { color: ... }` do index.css e pintou o ícone
   * de branco no tema claro. O harness pegou o caso nas cenas de app — mas o
   * implementador encontrou um SEGUNDO caso, no dock e na lista do menu
   * Iniciar, que nenhuma cena cobria. Ele achou lendo o código; poderia não
   * ter achado. Esta cena fecha esse buraco.
   *
   * `menu-iniciar*` são fotografadas sobre a área de trabalho, com a janela
   * "Sobre" (e o cristal dentro dela) aberta por baixo — por isso levam
   * `cristal3d: true` (ver o comentário no topo do arquivo sobre o bug que a
   * classificação por cena corrigiu).
   */
  { nome: 'menu-iniciar-claro', rota: '/', tema: 'light', abrirMenuIniciar: true, cristal3d: true },
  { nome: 'menu-iniciar', rota: '/', tema: 'dark', abrirMenuIniciar: true, cristal3d: true },
]
