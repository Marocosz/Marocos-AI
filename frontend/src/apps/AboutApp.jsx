import React, { Suspense, lazy, useState, useEffect } from 'react'
import { ArrowRight, ChevronRight, FileText } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { getProfileData, idadeEm } from '../content/profile'
import { getContactData } from '../content/contact'
import { getSistemaData } from '../content/sistema'
/* Para CONTAR os projetos na porta correspondente e para resolver os três
   recomendados. A resposta dizia "Cinco projetos" em literal, e eram catorze. */
import { getProjectsData } from '../content/projects'
import { projectSlug } from './projectSlug'
import { getOsData } from '../i18n/os'
import { getApp, APPS } from '../os/registry'
import { useAbrir } from '../os/NavegacaoContext'
import { useDeviceMode } from '../os/useDeviceMode'
import { CERIMONIA, contarPresets, acentoProfundo, corpoDoCristal } from '../config/system'
import { useTheme } from '../contexts/ThemeContext'
import './AboutApp.css'

// three + @react-three/fiber + @react-three/drei são pesados demais pra
// entrar no bundle principal só por causa de um diálogo "Sobre". Carrega sob
// demanda e só em desktop (ver useDeviceMode mais abaixo).
const Crystal = lazy(() => import('../brand/Crystal'))

/**
 * "Sobre este PC" — o winver do Marocos OS, o GUIA do site, e a página de
 * entrada dele.
 *
 * ESTE APP ABRE SOZINHO para quem chega sem deep link (ver
 * `os/shell/BoasVindas.jsx`, que o monta em tempo ocioso durante a tela de
 * bloqueio). Ou seja: é a primeira coisa que quase todo visitante lê.
 *
 * E era um beco sem saída. Não tinha um único link, não mencionava nenhum outro
 * app, e não dizia o que existe nesta máquina — numa metáfora de sistema
 * operacional que ninguém explicou ao visitante. A parte "guia" existe para
 * resolver isso.
 *
 * AS PORTAS SÃO PERGUNTAS, não uma lista de janelas. Quem abre um portfólio não
 * quer "Projetos": quer saber se a pessoa sabe construir. Uma lista de nomes de
 * app obriga o visitante a adivinhar qual deles responde à pergunta que ele
 * trouxe — e sessenta segundos não dão para adivinhar duas vezes.
 *
 * AS PORTAS ABREM JANELA, E NÃO TROCAM ESTA — decisão do dono do projeto, e a
 * razão é boa: o guia é uma lista de perguntas, e quem foi ver os projetos
 * ainda pode querer as outras três. Trocar o conteúdo apagaria o mapa assim que
 * ele fosse usado pela primeira vez.
 *
 * É por isso que o app pede `useAbrir()` e não `useIrPara()`. A distinção entre
 * "entrar" (trocar o conteúdo, como a lateral do explorador) e "abrir ao lado"
 * é do sistema, não deste app — ver `os/NavegacaoContext.jsx`. Ele continua sem
 * saber que janelas existem; fora de um container o hook devolve `null` e as
 * portas viram texto, sem quebrar num teste isolado.
 *
 * O QUE MUDOU NA PASSADA DE PÁGINA DE ENTRADA (spec de 2026-08-12):
 *
 *   1. A janela passou a DIZER O NOME. Antes "Marcos Rodrigues" não aparecia em
 *      pixel nenhum do conteúdo — só no `<title>` da aba.
 *   2. O CONTATO SUBIU PARA O TOPO como ação, e saiu do guia. Numa página de
 *      entrada o contato não é uma pergunta a ser encontrada no meio de uma
 *      lista. E ele NÃO repete os canais: os quatro ícones dizem quais existem,
 *      o conteúdo continua no terminal.
 *   3. O MARCOS VIRTUAL entrou no guia, no lugar do terminal — é a prova mais
 *      forte do portfólio e não era porta nenhuma.
 *   4. Duas fichas técnicas em vez de uma: o notebook do dono E este sistema,
 *      que é o outro sentido de "Sobre este PC".
 */
const AboutApp = () => {
  const { language } = useLanguage()
  const deviceMode = useDeviceMode()
  const { preset, isAnimated } = useTheme()
  const profile = getProfileData(language)
  const contato = getContactData(language)
  const os = getOsData(language)
  const abrir = useAbrir()

  /**
   * OS DOIS NÚMEROS DERIVADOS DA FICHA DO SISTEMA são lidos aqui, e não dentro de
   * `content/sistema.js`, para aquele arquivo não passar a depender de `os/` nem
   * de `config/` — ele guarda dado de portfólio.
   *
   * E derivados em vez de escritos porque assim não conseguem mentir: um app novo
   * no registry ou um preset novo no config aparecem nesta ficha sozinhos. O
   * número de testes, que não dá para derivar de dentro do app, é o único literal
   * — e mora numa fonte única justamente porque a versão anterior dele envelheceu
   * errado (ver `content/sistema.js`).
   */
  const sistema = getSistemaData(language, {
    apps: APPS.length,
    /* `contarPresets()` e não a soma dos dois arrays: o XP é o MESMO objeto nas
       duas listas, e somar daria uma escolha a mais do que o visitante tem. É a
       mesma função que o balão de boas-vindas usa, para os dois números não
       divergirem — eles já divergiram. */
    presets: contarPresets(),
  })

  const idade = idadeEm(profile.nascimento)

  /* Derivado, e não escrito: a resposta da porta de projetos dizia "Cinco projetos"
     e eram catorze. O idioma não altera a contagem, mas os dados são por idioma —
     então lê do mesmo lugar que a janela de Projetos vai ler. */
  const projetos = getProjectsData(language)
  const totalDeProjetos = projetos.items.length

  /**
   * OS TRÊS RECOMENDADOS, resolvidos de id para projeto.
   *
   * `profile.recomendados` guarda só a decisão editorial (quais três, e o porquê de
   * cada um); título, categoria e slug vêm de `content/projects.js`. Ver a nota longa
   * lá — a curta é que escrever o título aqui criaria a quinta cópia dele.
   *
   * `filter(Boolean)` porque id que não resolve deve SUMIR da seção, não renderizar
   * uma linha quebrada: se alguém remover um projeto recomendado, a janela continua
   * correta enquanto o teste aponta o problema. */
  const recomendados = profile.recomendados
    .map(({ id, porque }) => {
      const projeto = projetos.items.find((p) => p.id === id)
      return projeto ? { projeto, porque } : null
    })
    .filter(Boolean)

  /**
   * A LISTA DA FAIXA — triplicada quando ela anda, única quando ela para.
   *
   * O laço só fecha sem salto se o percurso da animação for exatamente UMA cópia
   * da lista (ver `@keyframes aboutStackScroll` no CSS). Três cópias dão a folga
   * necessária para nunca haver buraco visível na largura do container, e uma só
   * é o que a variante parada precisa para ser legível em vez de cortada.
   */
  const listaDaFaixa = isAnimated
    ? [...profile.skills_highlight, ...profile.skills_highlight, ...profile.skills_highlight]
    : profile.skills_highlight

  /**
   * PERFORMANCE: o cristal só monta depois que a janela pintou.
   *
   * Criar o contexto WebGL e montar o ambiente do material custa centenas de
   * milissegundos, e fazer isso no mesmo frame da abertura travava a janela
   * inteira. Adiando, a janela aparece na hora e o cristal preenche em seguida.
   *
   * É a mesma solução que o Profile.jsx da página clássica (removida no
   * refactor) já usava, com o comentário "Delay 3D Scene load to prevent
   * startup freeze" — só que aqui o gatilho é a abertura da janela, não a
   * carga da página.
   */
  const [montarCristal, setMontarCristal] = useState(false)

  useEffect(() => {
    if (deviceMode !== 'desktop') return
    const id = setTimeout(() => setMontarCristal(true), CERIMONIA.montarCristalAboutMs)
    return () => clearTimeout(id)
  }, [deviceMode])

  /**
   * A ORDEM É A DO INTERESSE, não a do menu: primeiro se ele sabe construir,
   * depois há quanto tempo, depois esta máquina, depois se dá para perguntar
   * direto a ele — e por último se dá para contratá-lo.
   *
   * O TERMINAL SAIU DAQUI e virou a ação do topo; o MARCOS VIRTUAL entrou no
   * lugar dele. Depois entrou SERVIÇOS, que é a única janela do portfólio cujo
   * trabalho é converter e não era porta nenhuma — o visitante só a achava pelo
   * ícone da área de trabalho ou adivinhando um comando no terminal. Fica em
   * último de propósito: contratar é a pergunta de quem já se convenceu.
   *
   * ESTA LISTA É A FONTE DA CONTAGEM na headline da seção. Ela dizia "Quatro
   * perguntas, quatro janelas" em literal, que é exatamente o tipo de número que
   * este projeto já viu envelhecer cinco vezes — e envelheceria aqui no mesmo
   * commit que acrescentou a quinta.
   *
   * O ícone vem do `registry` em vez de ser escolhido aqui — ele é a fonte
   * única do ícone de cada app, e uma segunda escolha aqui sairia do lugar na
   * primeira vez que alguém trocasse o do desktop.
   */
  const portas = ['projects', 'history', 'readme', 'assistant', 'services']

  return (
    /**
     * O INTERRUPTOR DE MOVIMENTO CHEGA NUMA CLASSE SÓ, na raiz.
     *
     * Este app tem três coisas que se movem — o ponto de status, o carrossel de
     * stack e a luz no hover das ações — e cada uma nasceu com o próprio jeito de
     * obedecer ao interruptor. Um marcador na raiz é o que impede a quarta de
     * inventar um quarto jeito.
     *
     * A faixa de stack ainda tem o marcador `--anima` PRÓPRIO, e não é
     * duplicação: aquele diz "esta faixa está no modo que anda", que é uma
     * variante de LAYOUT (linha única contra quebra de linha, lista triplicada
     * contra lista única) decidida no JSX. Este diz "movimento desligado".
     */
    <div className={`about-app${isAnimated ? '' : ' about-app--sem-movimento'}`}>
      {/* --- 1. HERÓI ---
              O NOME OCUPA A LARGURA INTEIRA e começa na mesma margem esquerda que
              o resto da janela. A primeira versão punha o cristal à esquerda e o
              texto todo à direita dele, o que empurrava o herói ~210px para
              dentro: o nome não alinhava com o botão, nem com a faixa, nem com as
              seções abaixo, e a espinha à esquerda da página simplesmente não
              existia. Além disso o texto ficava preso a ~360px numa janela de 574,
              e o nome não podia crescer.
              Agora o cristal divide a linha com o parágrafo de destaque — o
              elemento que pode estreitar sem perder nada, porque a medida dele já
              é limitada de propósito. */}
      <header className="about-heroi">
        {/* O TEXTO NUM BLOCO SÓ, e o cristal como irmão dele — não dentro de uma
            das linhas. É o que mantém o cristal medido contra o herói inteiro sem
            nenhuma linha de texto herdar a altura de 150px dele. */}
        <div className="about-heroi-texto">
          <p className="about-eyebrow">{profile.role}</p>
          <h2 className="about-nome">{profile.nome}</h2>

          {/* Texto direto. O efeito de "decriptação" que embaralhava esta frase
              antes de revelá-la saiu do projeto: ela é a primeira coisa que o
              visitante lê no guia, e atrasar a leitura da linha mais importante
              da janela para exibir um truque é o custo errado. */}
          <p className="about-destaque">{profile.bio_highlight}</p>

          <p className="about-meta">
            {/* O pulso respeita AS DUAS chaves: o interruptor de Movimento das
                Configurações pela classe na raiz do app, e o
                `prefers-reduced-motion` pelo bloco no fim do CSS. Foi exatamente
                aqui que o cristal deste app já errou uma vez — era o único
                elemento do sistema a ignorar o próprio interruptor. */}
            <span className="about-status">
              <span className="about-status-ponto" aria-hidden="true" />
              {profile.status}
            </span>
            <span className="about-meta-sep" aria-hidden="true">·</span>
            <span>{profile.local}</span>
            <span className="about-meta-sep" aria-hidden="true">·</span>
            <span>{os.about.idade.replace('%d', idade)}</span>
          </p>
        </div>

        {deviceMode === 'desktop' && montarCristal && (
          <div className="about-crystal" role="img" aria-label={os.about.crystalAlt}>
            <Suspense fallback={<div className="about-crystal-fallback" aria-hidden="true" />}>
              {/* O acento atravessa por prop: o cristal monta dentro de um
                  <Canvas> do react-three-fiber, que reconcilia numa árvore
                  própria — contexto do React de fora não chega lá sozinho. */}
              {/* `animated` ERA FIXO AQUI, e o controle "Movimento" das
                  Configurações não alcançava este cristal — o único do sistema
                  que ignorava o próprio interruptor. Quem pausava o papel de
                  parede para poupar bateria continuava com um objeto 3D girando
                  numa janela aberta.
                  O README do harness visual já descrevia o mundo certo
                  ("`isAnimationEnabled = false` ... o cristal cai em
                  frameloop=demand"); era a promessa que este arquivo não
                  cumpria. */}
              {/**
                * SEM O HALO CIRCULAR — e ele nunca esteve no CSS deste app.
                *
                * A mancha redonda em volta da peça é `.crystal-3d::before`, em
                * `os/tokens.css`: um radial com `border-radius: 50%` e
                * `inset: -18%` que o COMPONENTE traz consigo. Por isso mexer no
                * `.about-crystal` daqui não adiantava — eu estava apagando um
                * gradiente diferente, atrás do que realmente aparecia.
                *
                * O halo existe por um motivo real, explicado lá: o material tem
                * `transmission: 1.0` e mostra o que está ATRÁS dele, então sobre
                * fundo escuro o cristal simplesmente sumiria sem algo para
                * transmitir. Na cerimônia isso é indispensável.
                *
                * Aqui não: a janela já é uma superfície clara o bastante para o
                * cristal ter o que transmitir, e o halo vira uma mancha de cor
                * disputando atenção com o texto ao lado. `crystal-3d-sem-halo`
                * é a saída que o próprio token já previa.
                *
                * As partículas FICAM: são pontuais e leem como faceta captando
                * luz, não como brilho em volta.
                */}
              {/* 150, e o `.about-crystal` do CSS reserva exatamente isto — os
                  dois valores têm de bater. O porquê de não ser 190 está lá. */}
              <Crystal
                size={150}
                className="crystal-3d-sem-halo"
                intensidade={0.5}
                animated={isAnimated}
                acento={preset.acento}
                acentoFundo={acentoProfundo(preset)}
                corpo={corpoDoCristal(preset)}
              />
            </Suspense>
          </div>
        )}
      </header>

      {/* --- 2. AÇÃO: um alvo só, e o conteúdo continua no terminal ---
              Os quatro ícones são CONTEXTO (`aria-hidden`): dizem quais canais
              existem, sem repetir endereço nenhum. Quem quer o endereço clica e
              o terminal abre com os quatro na tela. */}
      <button
        type="button"
        className="about-acao"
        onClick={() => abrir?.('terminal')}
        disabled={!abrir}
      >
        <span className="about-acao-canais" aria-hidden="true">
          {contato.items.map((canal) => {
            const Icone = canal.icon
            // A cor de MARCA vem de content/contact.js — a exceção documentada do
            // projeto: marca significa algo, e seguir o tema faria o LinkedIn
            // deixar de ser azul.
            return <Icone key={canal.id} size={16} style={{ color: canal.color }} />
          })}
        </span>
        <span className="about-acao-texto">
          <span className="about-acao-titulo">{os.about.acao.titulo}</span>
          <span className="about-acao-sub">{os.about.acao.sub}</span>
        </span>
        <ArrowRight size={18} className="about-acao-seta" aria-hidden="true" />
      </button>

      {/* --- 3. O QUE ELE FAZ: o bloco de capacidades ---
              SEGUNDO BLOCO DE INFORMAÇÃO DA JANELA, e a posição é o argumento. A
              ordem em que esta janela apresenta as três coisas passou a ser QUEM ele
              é (o herói), O QUE ele resolve (aqui) e só então COM O QUE (a faixa
              logo abaixo). Antes ela ia direto do nome para a lista de tecnologias,
              o que obriga o leitor a inferir a capacidade a partir de logotipos.

              SEM SUPERFÍCIE PREENCHIDA, e isto não é economia de estilo: são cinco
              itens de mesma largura, e cinco retângulos com fundo e borda em
              sequência é exatamente o desenho que esta janela pagou um redesenho
              inteiro para desaprender ("parece um site qualquer, fundos chapados dos
              itens"). Quem estrutura aqui é o filete, o contraste de tamanho e o
              marcador de acento — as duas únicas superfícies preenchidas da janela
              continuam sendo as duas AÇÕES. */}
      <section className="about-secao about-forte">
        <p className="about-eyebrow about-secao-eyebrow">{os.about.forteLabel}</p>
        {/* A contagem sai da própria lista — ver a nota em `i18n/os.js`. */}
        <h3 className="about-headline">
          {os.about.forteHeadline.replace('%d', String(profile.capacidades.length))}
        </h3>
        <ul className="about-fortes">
          {profile.capacidades.map((cap) => (
            <li key={cap.id} className={`about-forte-item about-forte-item--${cap.id}`}>
              <h4 className="about-forte-titulo">{cap.titulo}</h4>
              <p className="about-forte-texto">{cap.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* --- 4. OS TRÊS PARA COMEÇAR: a prova, logo depois da afirmação ---
              Vem imediatamente abaixo das capacidades de propósito. Aquele bloco
              AFIRMA, e uma afirmação sem alvo clicável obriga o visitante a ir procurar
              a prova numa lista de doze — o que é justamente a fricção que faz alguém
              fechar a aba.

              REUSA A LINHA DAS PORTAS DO GUIA (`.about-guide` / `.about-door`), e não é
              economia: é a mesma interação. Ícone, texto em duas alturas, chevron,
              filete entre as linhas, e clicar abre uma janela. Inventar um card aqui
              faria a mesma ação parecer duas coisas diferentes na mesma tela.

              A ESCOLHA DE QUAIS TRÊS mora em `content/profile.js`, com o porquê de cada
              um e o de cada ausente. Aqui só se resolve id -> projeto. */}
      {recomendados.length > 0 && (
        <section className="about-secao">
          <p className="about-eyebrow about-secao-eyebrow">{os.about.recLabel}</p>
          {/* `%d` vem de `recomendados.length` — ver a nota em `i18n/os.js`. */}
          <h3 className="about-headline">
            {os.about.recHeadline.replace('%d', String(recomendados.length))}
          </h3>
          {/* MODIFICADOR OBRIGATÓRIO, e ele nasceu de um teste reprovando.
                  Esta lista reusa `.about-guide` e `.about-door` do guia — reuso certo,
                  é a mesma interação. Mas com as DUAS listas usando as duas classes,
                  nenhuma das duas fica endereçável: o teste funcional que afirmava
                  "cinco portas no guia" passou a contar oito, e não havia seletor capaz
                  de separá-las. O modificador é o que devolve essa capacidade — para o
                  teste hoje, e para o CSS no dia em que uma das duas precisar divergir. */}
          <ul className="about-guide about-guide--rec">
            {recomendados.map(({ projeto, porque }) => (
              <li key={projeto.id}>
                <button
                  type="button"
                  className="about-door"
                  onClick={() => abrir?.('project', { slug: projectSlug(projeto.title) })}
                  disabled={!abrir}
                >
                  <FileText size={17} className="about-door-icon" aria-hidden="true" />
                  <span className="about-door-text">
                    {/* O NOME NA LINHA DE CIMA e o motivo embaixo — a mesma hierarquia
                        da porta do guia, onde a pergunta fica em cima e a resposta
                        embaixo. A categoria entra junto do nome porque ela diz de que
                        TIPO é o projeto, o que é metade da recomendação. */}
                    <span className="about-door-question">
                      {projeto.title}
                      <span className="about-rec-cat">{projeto.category}</span>
                    </span>
                    <span className="about-door-answer">{porque}</span>
                  </span>
                  <ChevronRight size={16} className="about-door-seta" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* --- 5. STACK: o carrossel, de volta por decisão do dono do projeto ---
              Ele já existiu aqui e saiu numa passada anterior. Voltou, e com dois
              consertos: o laço fecha sem salto (ver o CSS) e ele obedece ao
              interruptor de Movimento, que a versão antiga ignorava.

              COM MOVIMENTO DESLIGADO A FAIXA NÃO SÓ PARA — ela vira uma grade que
              quebra linha, com a lista UMA vez. Uma faixa parada no meio do laço
              mostraria a lista cortada nas duas pontas, e "parado" não pode
              significar "ilegível". É também o que torna a captura do regressor
              determinística: o harness desliga a animação antes do primeiro
              render, então é sempre esta variante que ele fotografa. */}
      <div className={`about-stack${isAnimated ? ' about-stack--anima' : ''}`}>
        <ul className="about-stack-track" aria-label={os.about.stackLabel}>
          {listaDaFaixa.map((item, index) => (
            // `aria-hidden` nas cópias: o leitor de tela anuncia a lista uma vez,
            // não três. A chave usa o índice porque as cópias repetem o nome.
            <li key={index} aria-hidden={index >= profile.skills_highlight.length}>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* --- 6. O CORPO, EM DUAS COLUNAS QUANDO HÁ LARGURA ---
              E a divisão tem significado, não é só simetria quebrada: a coluna
              larga é a VOZ HUMANA (o que ele escreveu, as perguntas que ele
              imagina) e o trilho estreito é a VOZ DA MÁQUINA (números e registro
              do sistema, em mono). São as duas vozes tipográficas que o projeto
              já separa, agora também no espaço.

              O trilho ecoa o painel de detalhes do chrome de explorador, que é
              onde este sistema já põe metadado. E em janela maximizada numa tela
              grande é ele que impede o texto de esticar: o corpo vira duas
              colunas em vez de uma linha de 200 caracteres. */}
      <div className="about-corpo">
        <div className="about-coluna">
          {/* --- BIOGRAFIA --- */}
          <section className="about-secao">
            <p className="about-eyebrow about-secao-eyebrow">{os.about.bioLabel}</p>
            <h3 className="about-headline">{os.about.bioHeadline}</h3>
            <p className="about-bio">{profile.bio_full}</p>
          </section>

          {/* --- O GUIA: quatro perguntas, cada uma com a sua porta ---
                  LISTA DE LINHAS, não grade de cards. É o padrão de lista que o
                  próprio explorador deste sistema usa: ícone, texto, chevron, um
                  filete entre as linhas. Quatro cards idênticos numa grade era o
                  que fazia esta janela parecer qualquer site. */}
          <section className="about-secao">
            <p className="about-eyebrow about-secao-eyebrow">{os.about.guideLabel}</p>
            {/* AS DUAS CONTAGENS SAEM DA MESMA LISTA que desenha as portas logo
                abaixo — `replaceAll` porque a frase usa o número duas vezes ("N
                perguntas, N janelas") e são sempre o mesmo N: uma pergunta que não
                abre janela não é porta. */}
            <h3 className="about-headline">
              {os.about.guideHeadline.replaceAll('%d', String(portas.length))}
            </h3>
            <ul className="about-guide">
              {portas.map((id) => {
                const app = getApp(id)
                const Icone = app?.icon
                const texto = os.about.guide[id]
                if (!texto) return null

                return (
                  <li key={id}>
                    <button
                      type="button"
                      className={`about-door${id === 'assistant' ? ' about-door--destaque' : ''}`}
                      onClick={() => abrir?.(id)}
                      disabled={!abrir}
                    >
                      {Icone && <Icone size={17} className="about-door-icon" aria-hidden="true" />}
                      <span className="about-door-text">
                        <span className="about-door-question">{texto.question}</span>
                        {/* A resposta da porta de projetos traz `%d` e as outras
                            não; o `replace` é inofensivo numa frase sem marcador,
                            então não há caso especial por porta aqui. */}
                        <span className="about-door-answer">
                          {texto.answer.replace('%d', String(totalDeProjetos))}
                        </span>
                      </span>
                      <ChevronRight size={16} className="about-door-seta" aria-hidden="true" />
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>

        {/* --- O TRILHO: a voz da máquina --- */}
        <aside className="about-trilho">
          {/* NÚMEROS COMO REGISTRO, não como três cards centralizados. O número
              fica grande à esquerda e o rótulo à direita, com filete acima de cada
              linha — a mesma forma do registro logo abaixo, e é o que faz os dois
              blocos do trilho lerem como um instrumento só. */}
          <section className="about-secao">
            <p className="about-eyebrow about-secao-eyebrow">{os.about.specsLabel}</p>
            <div className="about-specs">
              {profile.stats.map((stat, index) => (
                <div className="about-spec" key={index}>
                  <span className="about-spec-number">{stat.number}</span>
                  <span className="about-spec-label">{stat.label}</span>
                  <span className="about-spec-sub">{stat.sublabel}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ESTE SISTEMA: a ficha técnica do próprio site — a metade que faltava
              num app que prometia hardware e falava só de pessoa.

              A FICHA DO NOTEBOOK NÃO ESTÁ MAIS AQUI, por decisão do dono do
              projeto: processador, vídeo, memória e café ficam para o Marcos
              Virtual responder quando alguém perguntar. A base de conhecimento
              (`backend/data/knowledge_base/profile.md`, seção "Meu Setup de
              Desenvolvimento") continua com tudo — o fato não saiu do site, saiu
              desta janela. */}
          <section className="about-secao">
            <p className="about-eyebrow about-secao-eyebrow">{os.about.sistemaLabel}</p>
            <dl className="about-ficha">
              {sistema.map((item) => (
                <div className="about-ficha-row" key={item.rotulo}>
                  <dt>{item.rotulo}</dt>
                  <dd>{item.valor}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default AboutApp
