import React, { useState } from 'react'
import { Bot, FileJson, FileText, ArrowRight, Check } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { getOsData } from '../i18n/os'
import { useAbrir } from '../os/NavegacaoContext'
import {
  contextoEmJson,
  contextoEmMarkdown,
  montarContexto,
  nomeDoArquivo,
} from '../content/contexto'
import './ContextoApp.css'

/**
 * BAIXAR O CONTEXTO — o portfólio inteiro num arquivo, para a IA de quem visita.
 * ==================================================
 * Ideia do dono do projeto, e o desenho dela tem uma ordem que não é negociável:
 * esta janela oferece o download, mas ela OFERECE O AGENTE PRIMEIRO.
 *
 * O motivo não é modéstia. O Marcos Virtual responde com a persona, com as fontes
 * citadas e com uma guarda que prefere dizer "não sei" — ou seja, ele é a melhor
 * resposta para 90% de quem chega aqui, e é também a demonstração técnica mais
 * forte do portfólio. Empurrar o arquivo primeiro seria trocar a prova viva por um
 * anexo. Então: um caminho recomendado em cima, o download logo abaixo, sem
 * fricção nenhuma para quem já sabe que quer o arquivo.
 *
 * O DOWNLOAD FICA ATRÁS DE UMA ESCOLHA, E É UM PASSO SÓ.
 *
 * A primeira versão desta janela mostrava os dois botões de download já na abertura,
 * abaixo da porta do agente, e o dono do projeto corrigiu: *"só quero que
 * disponibilize para ele baixar quando ele clicar em quero baixar e não usar o
 * Marocos Virtual"*. A correção está certa e vale entender por quê — não é sobre
 * esconder o arquivo.
 *
 * Com os dois caminhos abertos ao mesmo tempo, eles competem, e o botão de download
 * ganha sempre: baixar é barato e conversar exige formular uma pergunta. Uma ESCOLHA
 * explícita muda a natureza do momento — o visitante decide qual ferramenta quer, em
 * vez de pegar a que estava mais perto. E quem decide o arquivo chega nele em UM
 * clique, sem formulário, sem e-mail e sem cadastro: o portão é uma pergunta, não um
 * pedágio. Portfólio que cobra dado por um arquivo é exatamente o gênero de site que
 * este projeto não quer ser.
 *
 * O ESTADO NÃO PERSISTE, de propósito: é a mesma regra dos avisos da área de
 * trabalho. Fechar e reabrir a janela devolve a escolha, porque ela é o conteúdo da
 * janela e não uma preferência do visitante.
 *
 * SEM CHROME DE EXPLORADOR, por decisão explícita: esta janela não é um LUGAR na
 * máquina, é uma ação. Lateral de navegação e breadcrumb sugeririam que há algo
 * para percorrer aqui dentro.
 *
 * O ARQUIVO É GERADO NA HORA, no navegador, a partir dos mesmos módulos de conteúdo
 * que desenham as outras janelas — ver o cabeçalho de `content/contexto.js`. É o que
 * torna impossível o download divergir do site.
 */
const ContextoApp = () => {
  const { language } = useLanguage()
  const os = getOsData(language)
  const t = os.contexto
  const abrir = useAbrir()

  /**
   * O ÚLTIMO FORMATO BAIXADO, só para dar retorno ao clique.
   *
   * Um download não muda nada na tela: em navegador com a barra de downloads
   * escondida, clicar parece não fazer efeito, e o visitante clica de novo. A marca
   * de confirmação é a única coisa que este app tem para dizer "aconteceu".
   */
  const [baixado, setBaixado] = useState(null)

  /**
   * O PORTÃO. Falso até o visitante dizer que prefere o próprio sistema — ver a nota
   * no cabeçalho: com os dois caminhos abertos ao mesmo tempo eles competem, e o
   * download ganha sempre porque é mais barato que formular uma pergunta.
   */
  const [liberado, setLiberado] = useState(false)

  /**
   * O tamanho aproximado de cada formato, calculado na montagem para o botão poder
   * anunciá-lo. Vale a conta: quem vai colar isto numa IA quer saber se cabe na
   * janela de contexto dele antes de baixar.
   */
  const tamanhos = React.useMemo(() => {
    const md = contextoEmMarkdown(language)
    const json = contextoEmJson(language)
    const kb = (s) => Math.max(1, Math.round(new Blob([s]).size / 1024))
    return {
      md: kb(md),
      json: kb(json),
      // A contagem de projetos e de faixas da trajetória, derivada — é o que
      // transforma "um arquivo" em "este arquivo tem o quê".
      projetos: montarContexto(language).projetos.length,
    }
  }, [language])

  /**
   * O DOWNLOAD, sem biblioteca: `Blob` + `createObjectURL` + um `<a download>`
   * sintético.
   *
   * `revokeObjectURL` no fim não é higiene opcional — sem ele o blob fica retido
   * enquanto a aba viver, e o corpus tem dezenas de KB. Numa janela que o visitante
   * pode abrir e fechar várias vezes, isso vaza de verdade.
   */
  const baixar = (formato) => {
    const conteudo = formato === 'json' ? contextoEmJson(language) : contextoEmMarkdown(language)
    const tipo = formato === 'json' ? 'application/json' : 'text/markdown'

    const url = URL.createObjectURL(new Blob([conteudo], { type: `${tipo};charset=utf-8` }))
    const ancora = document.createElement('a')
    ancora.href = url
    ancora.download = nomeDoArquivo(language, formato === 'json' ? 'json' : 'md')
    document.body.appendChild(ancora)
    ancora.click()
    document.body.removeChild(ancora)
    URL.revokeObjectURL(url)

    setBaixado(formato)
  }

  return (
    <div className="contexto-app">
      <header className="contexto-cabeca">
        <p className="contexto-eyebrow">{t.eyebrow}</p>
        <h2 className="contexto-titulo">{t.titulo}</h2>
        <p className="contexto-lead">{t.lead}</p>
      </header>

      {/* --- O CAMINHO RECOMENDADO, e ele vem primeiro ---
              Superfície preenchida porque é AÇÃO — a regra do projeto. É a mesma
              receita da porta em destaque do "Sobre este PC": faixa de acento
              nascendo na borda esquerda, não retângulo chapado. */}
      <button
        type="button"
        className="contexto-porta"
        onClick={() => abrir?.('assistant')}
        disabled={!abrir}
      >
        <Bot size={20} className="contexto-porta-icone" aria-hidden="true" />
        <span className="contexto-porta-texto">
          <span className="contexto-porta-titulo">{t.agente.titulo}</span>
          <span className="contexto-porta-sub">{t.agente.sub}</span>
        </span>
        <ArrowRight size={17} className="contexto-porta-seta" aria-hidden="true" />
      </button>

      {/* --- A ESCOLHA, e ela é o portão do download ---
              Enquanto ninguém escolheu, este botão é a única outra saída da janela.
              Ele é DELIBERADAMENTE mais discreto que a porta do agente — sem
              superfície preenchida, só filete e texto: as duas opções são legítimas,
              mas uma é a recomendada, e hierarquia visual é como isso se diz sem
              escrever "recomendado" em nenhum lugar. */}
      {!liberado && (
        <button type="button" className="contexto-prefiro" onClick={() => setLiberado(true)}>
          <span className="contexto-prefiro-titulo">{t.prefiro.titulo}</span>
          <span className="contexto-prefiro-sub">{t.prefiro.sub}</span>
        </button>
      )}

      {/* --- O DOWNLOAD, liberado pela escolha ---
              `%d` no corpo é o número de projetos do arquivo, derivado. Escrever
              "12 projetos" aqui envelheceria na primeira vez que a lista mudasse —
              e ela mudou duas vezes só nesta passada de conteúdo. */}
      {liberado && (
      <section className="contexto-secao">
        <p className="contexto-eyebrow contexto-secao-eyebrow">{t.baixarLabel}</p>
        <h3 className="contexto-headline">{t.baixarHeadline}</h3>
        <p className="contexto-texto">
          {t.baixarCorpo.replace('%d', String(tamanhos.projetos))}
        </p>

        <div className="contexto-botoes">
          <button type="button" className="contexto-baixar" onClick={() => baixar('md')}>
            {baixado === 'md' ? (
              <Check size={17} aria-hidden="true" />
            ) : (
              <FileText size={17} aria-hidden="true" />
            )}
            <span className="contexto-baixar-texto">
              <span className="contexto-baixar-nome">{t.formatos.md.nome}</span>
              <span className="contexto-baixar-sub">
                {t.formatos.md.sub.replace('%d', String(tamanhos.md))}
              </span>
            </span>
          </button>

          <button type="button" className="contexto-baixar" onClick={() => baixar('json')}>
            {baixado === 'json' ? (
              <Check size={17} aria-hidden="true" />
            ) : (
              <FileJson size={17} aria-hidden="true" />
            )}
            <span className="contexto-baixar-texto">
              <span className="contexto-baixar-nome">{t.formatos.json.nome}</span>
              <span className="contexto-baixar-sub">
                {t.formatos.json.sub.replace('%d', String(tamanhos.json))}
              </span>
            </span>
          </button>
        </div>

        {/* `aria-live` porque a única confirmação de um download é esta frase: sem
            isso, quem usa leitor de tela não recebe retorno nenhum do clique. */}
        <p className="contexto-confirmado" aria-live="polite">
          {baixado ? t.confirmado : ''}
        </p>
      </section>
      )}

      {/* --- O QUE TEM DENTRO, e a nota de privacidade ---
              Sem superfície: é informação, não ação. Filete e tipografia.

              APARECE SEMPRE, inclusive antes da escolha — e é de propósito. Quem
              ainda não decidiu precisa saber o que o arquivo tem para poder decidir;
              esconder isto junto com os botões transformaria a escolha num chute. O
              que o portão guarda é o DOWNLOAD, não a informação sobre ele. */}
      <section className="contexto-secao">
        <p className="contexto-eyebrow contexto-secao-eyebrow">{t.dentroLabel}</p>
        <ul className="contexto-dentro">
          {t.dentro.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="contexto-nota">{t.nota}</p>
      </section>
    </div>
  )
}

export default ContextoApp
