/**
 * A FICHA TÉCNICA DO PRÓPRIO SITE — a outra metade do que "Sobre este PC"
 * promete.
 *
 * Uma janela com esse nome que só descreve o notebook do dono cumpre metade da
 * piada: a máquina que o visitante está usando neste instante é ESTE sistema, e
 * ela também tem especificações.
 *
 * DOIS CAMPOS SÃO DERIVADOS E NÃO CONSEGUEM MENTIR — o número de apps sai de
 * `APPS.length` e o de presets de `PRESETS`, os dois lidos em runtime. Eles
 * entram por parâmetro em vez de serem importados aqui de propósito: `content/`
 * guarda dado de portfólio e não deve passar a depender de `os/` nem de
 * `config/`. Quem injeta é o `AboutApp`.
 */

export const SISTEMA = {
  /** O mesmo do banner do terminal, em `content/contact.js`. */
  versao: '3.0.1',

  /**
   * CONFERIDO EM 2026-08-12 — e é um número que envelhece, então aqui está como
   * reconferir:
   *   cenas visuais  contar `{ nome:` em `frontend/visual/cenas.js`        → 21
   *   funcionais     os `test(` avulsos de `frontend/visual/rotas.spec.js`
   *                  + uma entrada por rota no laço sobre `ROTAS`          → 20
   *
   * O texto do Leia-me dizia 36 e tinha ficado para trás — a suíte cresceu e
   * ninguém releu a frase. É por isso que o número mora AQUI, numa fonte só: a
   * partir desta mudança as duas janelas que o exibem leem a mesma constante e
   * não têm como discordar de novo.
   */
  testes: 41,

  /** Silk no tema escuro, Iridescence no claro — os dois sobre `ogl`. */
  shaders: 2,
};

const rotulosEn = {
  apps: 'Apps',
  testes: 'Tests',
  shaders: 'Shaders',
  presets: 'Presets',
  versao: 'Version',
};

const rotulosPt = {
  apps: 'Apps',
  testes: 'Testes',
  shaders: 'Shaders',
  presets: 'Presets',
  versao: 'Versão',
};

/**
 * A forma é `{ rotulo, valor }`, a mesma que a ficha de hardware usava antes de
 * sair da janela (o setup ficou só para o Marcos Virtual responder). Ela sobrevive
 * porque é a forma que o CSS de ficha técnica do "Sobre este PC" espera — rótulo
 * em mono à esquerda, valor à direita sobre uma linha pontilhada.
 */
export const getSistemaData = (lang, { apps, presets }) => {
  const r = lang === 'pt' ? rotulosPt : rotulosEn;
  return [
    { rotulo: r.apps, valor: String(apps) },
    { rotulo: r.testes, valor: String(SISTEMA.testes) },
    { rotulo: r.shaders, valor: String(SISTEMA.shaders) },
    { rotulo: r.presets, valor: String(presets) },
    { rotulo: r.versao, valor: SISTEMA.versao },
  ];
};
