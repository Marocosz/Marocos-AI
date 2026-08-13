import React, { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useWindowActions } from '../os/WindowManagerContext'
import { getContactData } from '../content/contact'
import { getProfileData } from '../content/profile'
import { getServicosData } from '../content/servicos'
import { getOsData } from '../i18n/os'
import './TerminalApp.css'

/**
 * Terminal.jsx — o app de contato do Marocos OS.
 *
 * A seção de contato da página clássica (removida no refactor) já simulava
 * um terminal com boa linguagem visual (janela de semáforo, prompt roxo,
 * logs com status colorido, tabela de canais) — só que era 100% encenado
 * (motion anima o "digitar" de um comando fixo). Aqui o mesmo visual vira de
 * verdade interativo: quem abre a janela digita os comandos.
 *
 * A única dependência de `os/` é `useWindowActions`, usada só por três
 * comandos (`projetos`, `stack` e `servicos`) para abrir outras janelas — o
 * resto do app continua cego a janelas.
 */

// Contador simples para chaves React estáveis das linhas de saída. Vive no
// módulo (não no estado do componente) porque uma linha, uma vez impressa,
// nunca muda de conteúdo — só precisa de uma key que não colida.
let nextEntryId = 0
const uid = () => {
  nextEntryId += 1
  return nextEntryId
}

/**
 * Os comandos que o boot oferece de bandeja. Não são todos: `contato` já rodou,
 * `clear` não tem o que descobrir, e uma fileira com os oito viraria a mesma
 * parede de opções que a lista do `help` já é.
 */
const COMANDOS_SUGERIDOS = ['whoami', 'neofetch', 'projetos', 'stack', 'servicos', 'help']

/**
 * O QUE A JANELA MOSTRA ANTES DE ALGUÉM DIGITAR — e é aqui que estava o único
 * problema deste levantamento que custava uma oportunidade.
 *
 * O app de CONTATO de um portfólio exigia adivinhar uma palavra. Ele se chama
 * "Terminal" no atalho, abria com versão, copyright e três logs de ficção, nada
 * na tela mencionava `help`, e o input não nascia focado. O caminho até o
 * e-mail era digitar `contato` no escuro — e nenhum dos oito comandos era
 * descobrível sem essa aposta.
 *
 * Agora o boot termina EXECUTANDO `contato`, como um `.bashrc` faria: quem abre
 * já tem e-mail, LinkedIn e GitHub na tela. A metáfora sobrevive inteira —
 * prompt, histórico com as setas, comandos de verdade — mas o valor principal
 * deixa de depender de digitação. E a linha de comandos que vem depois é
 * clicável, então descobrir o resto também não depende.
 */
const buildBootEntries = (ctx) => {
  const t = ctx.content.terminal
  return [
    { id: uid(), kind: 'line', text: t.version },
    { id: uid(), kind: 'line', text: t.copyright },
    { id: uid(), kind: 'line', text: t.systemCheck, dim: true },
    ...t.logs.map((log) => ({ id: uid(), kind: 'log', text: log.text, status: log.status, color: log.color })),

    // O eco vem junto de propósito: sem ele a tabela apareceria sozinha e
    // pareceria decoração do boot, em vez do resultado de um comando que o
    // visitante pode repetir.
    { id: uid(), kind: 'echo', prompt: t.prompt, command: 'contato' },
    ...buildContatoEntries(ctx),

    {
      id: uid(),
      kind: 'cmds',
      text: ctx.strings.commandsHint,
      items: COMANDOS_SUGERIDOS.map((nome) => ({
        nome,
        rotulo: ctx.strings.helpNames?.[nome] ?? nome,
      })),
    },
  ]
}

/**
 * O NOME EXIBIDO PODE NÃO SER A CHAVE. As chaves do mapa de comandos são
 * portuguesas (`contato`, `projetos`), e quem lia a interface em inglês via
 * "contato — contact channels": nome numa língua, descrição na outra. Os
 * aliases ingleses que o app sempre aceitou não apareciam em lugar nenhum.
 */
const buildHelpEntries = ({ strings }) => [
  { id: uid(), kind: 'line', text: strings.helpTitle, accent: true },
  {
    id: uid(),
    kind: 'kv',
    rows: Object.keys(COMMANDS).map((name) => ({
      label: strings.helpNames?.[name] ?? name,
      value: strings.helpCommands?.[name],
    })),
  },
]

/**
 * `whoami` responde com registro de identidade, não com headline. Antes ele
 * imprimia `profile.bio_highlight` — exatamente a mesma string que o topo do
 * guia mostra, e escrita em primeira pessoa de marketing. Duas superfícies
 * dizendo o mesmo, uma delas na voz errada.
 */
const buildWhoamiEntries = ({ strings }) =>
  (strings.whoami ?? []).map((text) => ({ id: uid(), kind: 'line', text }))

const buildNeofetchEntries = ({ profile, strings }) => [
  { id: uid(), kind: 'line', text: profile.role, accent: true },
  { id: uid(), kind: 'rule' },
  {
    id: uid(),
    kind: 'kv',
    rows: [
      ...profile.stats.map((s) => ({ label: s.label, value: s.number })),
      { label: strings.neofetchSkillsLabel, value: profile.skills_highlight.join(', ') },
    ],
  },
]

const buildContatoEntries = ({ content, strings }) => [
  {
    id: uid(),
    kind: 'table',
    headers: content.terminal.tableHeaders,
    rows: content.items,
    statusText: strings.contactStatus,
  },
]

/**
 * `vps` VIROU MANCHETE MAIS PONTEIRO, e essa é a mudança que impede o site de se
 * repetir.
 *
 * Ele imprimia a ficha da infraestrutura ("Docker, Traefik com HTTPS automático,
 * deploy contínuo a partir do git") e quatro tags. Isso é exatamente a seção "A
 * máquina" da janela de Serviços — dois lugares dizendo a mesma coisa, que é o
 * que aquela janela existe para não fazer. Aqui ficam duas linhas; a ficha inteira
 * mora lá.
 *
 * O PONTEIRO É UM `cmds`, e não um tipo de linha novo: aquele bloco já renderiza
 * chips que EXECUTAM um comando de verdade. Um "clique aqui" que roda `servicos`
 * é mais honesto que um link decorativo, e não custou nenhuma máquina nova.
 *
 * O texto vem de `content/servicos.js` — fonte única com a janela.
 */
const buildVpsEntries = ({ servicos, strings }) => {
  const t = servicos.terminal
  return [
    { id: uid(), kind: 'line', text: t.badge, accent: true },
    { id: uid(), kind: 'line', text: t.titulo, strong: true },
    { id: uid(), kind: 'line', text: t.descricao },
    {
      id: uid(),
      kind: 'cmds',
      text: t.ponteiro,
      items: [{ nome: 'servicos', rotulo: strings.helpNames?.servicos ?? 'servicos' }],
    },
  ]
}

// Os três únicos comandos que saem do terminal: abrem outra janela do
// Marocos OS via `open` (vindo de useWindows, injetado no ctx pelo componente)
// e imprimem uma linha de confirmação na própria transcrição.
const buildProjetosEntries = ({ strings, open }) => {
  open('projects')
  return [{ id: uid(), kind: 'line', text: strings.openingProjects }]
}

const buildStackEntries = ({ strings, open }) => {
  open('devices')
  return [{ id: uid(), kind: 'line', text: strings.openingStack }]
}

const buildServicosEntries = ({ strings, open }) => {
  open('services')
  return [{ id: uid(), kind: 'line', text: strings.openingServicos }]
}

// Sentinela devolvida pelo handler de `clear`: o comando não produz linhas
// de saída, ele apaga o histórico inteiro — tratado à parte de `push`.
const CLEAR_SIGNAL = Symbol('terminal-clear')

/**
 * Mapa de comandos: nome canônico -> handler(ctx) que devolve as entradas de
 * saída. `ctx` traz os dados já resolvidos para o idioma atual (content,
 * profile, strings). A ordem aqui também define a ordem do `help`.
 */
const COMMANDS = {
  help: buildHelpEntries,
  whoami: buildWhoamiEntries,
  neofetch: buildNeofetchEntries,
  contato: buildContatoEntries,
  vps: buildVpsEntries,
  clear: () => CLEAR_SIGNAL,
  projetos: buildProjetosEntries,
  stack: buildStackEntries,
  servicos: buildServicosEntries,
}

// Aliases em inglês, só reconhecidos quando a UI está em 'en' — o app é
// bilíngue, mas os nomes de comando "reais" (contato, vps) são fixos como
// qualquer nome de comando de shell; o alias é só uma conveniência para
// quem está lendo a interface em inglês.
const EN_ALIASES = {
  contact: 'contato', who: 'whoami', projects: 'projetos', devices: 'stack',
  services: 'servicos',
}

const resolveCommandName = (typed, language) => {
  const name = typed.toLowerCase()
  if (name in COMMANDS) return name
  if (language === 'en' && name in EN_ALIASES) return EN_ALIASES[name]
  return null
}

/** Uma linha (ou bloco) de saída já resolvida em JSX. Separado do componente
 * para não misturar "o que uma entrada é" com "como o terminal se comporta".
 *
 * `executar` só é usado pelo bloco de comandos clicáveis; as outras entradas
 * ignoram. Vem por parâmetro em vez de import porque rodar um comando é
 * comportamento do terminal, e esta função só sabe desenhar. */
const renderEntry = (entry, executar) => {
  switch (entry.kind) {
    case 'echo':
      return (
        <div className="terminal-echo" key={entry.id}>
          <b className="terminal-prompt">{entry.prompt}</b>
          <span className="terminal-command">{entry.command}</span>
        </div>
      )

    case 'error':
      return (
        <pre className="terminal-line terminal-error" key={entry.id}>{entry.text}</pre>
      )

    case 'line': {
      const classNames = ['terminal-line']
      if (entry.dim) classNames.push('terminal-dim')
      if (entry.accent) classNames.push('terminal-accent')
      if (entry.strong) classNames.push('terminal-strong')
      return (
        <pre className={classNames.join(' ')} key={entry.id}>{entry.text}</pre>
      )
    }

    case 'rule':
      return <hr className="terminal-rule" key={entry.id} />

    case 'log':
      return (
        <div className="terminal-log" key={entry.id}>
          <span className="terminal-log-text">{entry.text}</span>
          <span className="terminal-log-fill" aria-hidden="true" />
          <b className="terminal-log-status" style={{ color: entry.color }}>[{entry.status}]</b>
        </div>
      )

    case 'kv':
      return (
        <div className="terminal-kv" key={entry.id}>
          {entry.rows.map((row, i) => (
            <div className="terminal-kv-row" key={i}>
              <b className="terminal-kv-label">{row.label}</b>
              <span className="terminal-kv-value">{row.value}</span>
            </div>
          ))}
        </div>
      )

    /* O `case 'tags'` SAIU JUNTO com as quatro tags do `vps` (Docker, Traefik,
       CI/CD, Linux), que viraram linhas da ficha "A máquina" na janela de
       Serviços. Ele era o único consumidor deste tipo de entrada, e um `case`
       inalcançável é pior que nenhum: parece vivo, e a próxima pessoa tenta
       mantê-lo funcionando sem saber que ninguém o alcança. */

    // Clicáveis porque digitar não pode ser o pedágio para descobrir o que
    // existe. Quem prefere digitar continua digitando — o clique só roda o
    // mesmo `runCommand`, ecoando o comando como se tivesse vindo do teclado.
    case 'cmds':
      return (
        <div className="terminal-cmds" key={entry.id}>
          <span className="terminal-dim">{entry.text}</span>
          {entry.items.map((cmd) => (
            <button
              type="button"
              className="terminal-cmd-chip"
              key={cmd.nome}
              onClick={() => executar?.(cmd.nome)}
            >
              {cmd.rotulo}
            </button>
          ))}
        </div>
      )

    case 'table':
      return (
        <div className="terminal-table" key={entry.id}>
          <div className="terminal-table-header">
            {entry.headers.map((h, i) => <span key={i}>{h}</span>)}
          </div>
          {entry.rows.map((item) => {
            const Icon = item.icon
            return (
              <div className="terminal-row" key={item.id}>
                <span className="terminal-col-type">
                  <Icon size={14} className="terminal-row-icon" />
                  {item.label}
                </span>
                <span className="terminal-col-dest">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="terminal-link"
                  >
                    {item.value}
                  </a>
                </span>
                <b className="terminal-col-status">{entry.statusText}</b>
              </div>
            )
          })}
        </div>
      )

    default:
      return null
  }
}

const TerminalApp = () => {
  const { language } = useLanguage()
  const { open } = useWindowActions()
  const content = getContactData(language)
  const profile = getProfileData(language)
  // Só a manchete do `vps` sai daqui — a ficha inteira da infraestrutura mora na
  // janela de Serviços, e este arquivo lê a mesma fonte que ela.
  const servicos = getServicosData(language)
  const os = getOsData(language)
  const strings = os.terminal || {}

  // Estado inicial "preguiçoso": o boot só roda uma vez, na primeira
  // renderização, capturando o idioma que estava ativo quando a janela abriu
  // — não precisa de useEffect nem entra em conflito com exhaustive-deps.
  const [output, setOutput] = useState(
    () => buildBootEntries({ content, profile, servicos, strings, open }),
  )
  const [commandHistory, setCommandHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [draft, setDraft] = useState('')

  const outputRef = useRef(null)
  const inputRef = useRef(null)

  // A saída rola sozinha para o fim sempre que uma linha nova entra.
  useEffect(() => {
    const el = outputRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [output])

  const focusInput = () => inputRef.current?.focus()

  const push = (entries) => {
    setOutput((prev) => [...prev, ...(Array.isArray(entries) ? entries : [entries])])
  }

  const runCommand = (raw) => {
    const typed = raw.trim()

    // Ecoa o prompt + o que foi digitado, exatamente como um shell faz antes
    // de processar a linha (inclusive quando está vazia).
    push({ id: uid(), kind: 'echo', prompt: content.terminal.prompt, command: raw })
    if (!typed) return

    const name = resolveCommandName(typed, language)
    if (!name) {
      push([
        { id: uid(), kind: 'error', text: `${strings.commandNotFound}: ${typed}` },
        { id: uid(), kind: 'line', text: strings.tryHelp, dim: true },
      ])
      return
    }

    const result = COMMANDS[name]({ content, profile, servicos, strings, open })
    if (result === CLEAR_SIGNAL) {
      setOutput([])
      return
    }
    push(result)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const value = draft
    if (value.trim()) {
      setCommandHistory((prev) => [...prev, value])
    }
    setHistoryIndex(-1)
    setDraft('')
    runCommand(value)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length === 0) return
      const nextIndex = historyIndex === -1
        ? commandHistory.length - 1
        : Math.max(0, historyIndex - 1)
      setHistoryIndex(nextIndex)
      setDraft(commandHistory[nextIndex])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === -1) return
      const nextIndex = historyIndex + 1
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(-1)
        setDraft('')
      } else {
        setHistoryIndex(nextIndex)
        setDraft(commandHistory[nextIndex])
      }
    }
  }

  return (
    <div className="terminal-app" onClick={focusInput}>
      <div className="terminal-output" ref={outputRef} role="log" aria-label={strings.outputLabel}>
        {output.map((entry) => renderEntry(entry, runCommand))}
      </div>

      <form className="terminal-input-line" onSubmit={onSubmit}>
        <b className="terminal-prompt">{content.terminal.prompt}</b>
        <input
          ref={inputRef}
          type="text"
          className="terminal-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label={strings.inputLabel}
          /* Nasce focado: num terminal, digitar É a interação — obrigar um
             clique antes da primeira tecla é atrito sem contrapartida. O app
             carrega por lazy() dentro de um Suspense, então este foco acontece
             DEPOIS do `ref.current?.focus()` que a janela dá em si mesma na
             montagem, e ganha dele sem disputa. */
          autoFocus
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        />
      </form>
    </div>
  )
}

export default TerminalApp
