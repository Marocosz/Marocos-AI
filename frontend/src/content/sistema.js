/**
 * A FICHA TÉCNICA DO PRÓPRIO SITE — a outra metade do que "Sobre este PC"
 * promete.
 *
 * Uma janela com esse nome que só descreve o notebook do dono cumpre metade da
 * piada: a máquina que o visitante está usando neste instante é ESTE sistema, e
 * ela também tem especificações.
 *
 * UM CAMPO É DERIVADO E NÃO CONSEGUE MENTIR — o número de apps sai de
 * `APPS.length`, e o de presets de `PRESETS`, os dois lidos em runtime. Eles
 * entram por parâmetro em vez de serem importados aqui de propósito: `content/`
 * guarda dado de portfólio e não deve passar a depender de `os/` nem de
 * `config/`. Quem injeta é o `AboutApp`.
 *
 * ==================================================
 * `testes`, `cenas` E `shaders` SAÍRAM DAQUI (2026-08-13), e a remoção é uma
 * decisão de CONTEÚDO, não uma limpeza técnica.
 *
 * Os três existiam e eram derivados com cuidado — havia comentário explicando
 * como reconferir cada um, porque cada um já tinha envelhecido errado numa frase
 * visível. Toda essa engenharia estava protegendo a exibição de números que não
 * interessam a quem lê o site.
 *
 * Instrução do dono do projeto: *"em vários lugares do projeto você dá ênfase à
 * quantidade de testes, a esse lance de shaders... sendo que isso não é algo
 * importante"*. E está certo: "46 testes" e "2 shaders" são orgulho de quem
 * escreveu, não informação para quem contrata. Um recrutador não decide nada com
 * a contagem de cenas do regressor visual do portfólio — no máximo entende que o
 * autor gosta de medir a si mesmo.
 *
 * A SUÍTE CONTINUA EXISTINDO E CONTINUA OBRIGATÓRIA. O que saiu foi o troféu na
 * parede, não o teste. A diferença entre as duas coisas é o que este comentário
 * existe para registrar, para a próxima passada não "consertar" a ausência.
 */

export const SISTEMA = {
  /**
   * A VERSÃO, E ELA É FONTE ÚNICA DE VERDADE.
   *
   * O comentário anterior aqui dizia "o mesmo do banner do terminal, em
   * `content/contact.js`" — que é a descrição de um DEFEITO, não de um contrato. A
   * string existia em cinco lugares: aqui, no banner do terminal (duas vezes, PT e
   * EN) e no `firmwareVersion` da tela de BIOS (duas vezes). Cinco cópias de um
   * número que muda a cada release é cinco chances de a aba, o terminal e o
   * desligamento anunciarem versões diferentes do mesmo sistema.
   *
   * Agora os outros quatro importam daqui. `3.1.0` e não `3.0.2`: esta passada
   * reescreveu o conteúdo inteiro do portfólio e acrescentou seções à interface —
   * é release de recurso, não correção.
   */
  versao: '3.1.0',
};

const rotulosEn = {
  apps: 'Apps',
  presets: 'Presets',
  versao: 'Version',
};

const rotulosPt = {
  apps: 'Apps',
  presets: 'Presets',
  versao: 'Versão',
};

/**
 * A forma é `{ rotulo, valor }`, a mesma que a ficha de hardware usava antes de
 * sair da janela (o setup ficou só para o Marcos Virtual responder). Ela sobrevive
 * porque é a forma que o CSS de ficha técnica do "Sobre este PC" espera — rótulo
 * em mono à esquerda, valor à direita sobre uma linha pontilhada.
 *
 * TRÊS LINHAS, e as três são sobre o que o visitante PODE FAZER aqui: quantos apps
 * existem, quantas aparências ele pode escolher, e qual versão está no ar. As
 * linhas de teste e de shader saíram — ver a nota no topo do arquivo.
 */
export const getSistemaData = (lang, { apps, presets }) => {
  const r = lang === 'pt' ? rotulosPt : rotulosEn;
  return [
    { rotulo: r.apps, valor: String(apps) },
    { rotulo: r.presets, valor: String(presets) },
    { rotulo: r.versao, valor: SISTEMA.versao },
  ];
};
