import React, { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useWindowActions } from '../os/WindowManagerContext'
import { getContactData } from '../content/contact'
import { getProfileData } from '../content/profile'
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
 * A única dependência de `os/` é `useWindowActions`, usada só por dois
 * comandos (`projetos` e `stack`) para abrir outras janelas — o resto do app
 * continua cego a janelas.
 */

// Contador simples para chaves React estáveis das linhas de saída. Vive no
// módulo (não no estado do componente) porque uma linha, uma vez impressa,
// nunca muda de conteúdo — só precisa de uma key que não colida.
let nextEntryId = 0
const uid = () => {
  nextEntryId += 1
  return nextEntryId
}

/** Linhas impressas assim que a janela abre: versão, copyright, logs de
 * handshake (com status colorido) e o system check — tudo de
 * getContactData(lang).terminal. */
const buildBootEntries = (content) => {
  const t = content.terminal
  return [
    { id: uid(), kind: 'line', text: t.version },
    { id: uid(), kind: 'line', text: t.copyright },
    { id: uid(), kind: 'line', text: t.systemCheck, dim: true },
    ...t.logs.map((log) => ({ id: uid(), kind: 'log', text: log.text, status: log.status, color: log.color })),
  ]
}

const buildHelpEntries = ({ strings }) => [
  { id: uid(), kind: 'line', text: strings.helpTitle, accent: true },
  {
    id: uid(),
    kind: 'kv',
    rows: Object.keys(COMMANDS).map((name) => ({ label: name, value: strings.helpCommands?.[name] })),
  },
]

const buildWhoamiEntries = ({ profile }) => [
  { id: uid(), kind: 'line', text: profile.bio_highlight },
]

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

const buildVpsEntries = ({ content }) => {
  const { hosting } = content
  return [
    { id: uid(), kind: 'line', text: hosting.badge, accent: true },
    { id: uid(), kind: 'line', text: hosting.title, strong: true },
    { id: uid(), kind: 'line', text: hosting.description },
    { id: uid(), kind: 'tags', items: hosting.features },
  ]
}

// Os dois únicos comandos que saem do terminal: abrem outra janela do
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
}

// Aliases em inglês, só reconhecidos quando a UI está em 'en' — o app é
// bilíngue, mas os nomes de comando "reais" (contato, vps) são fixos como
// qualquer nome de comando de shell; o alias é só uma conveniência para
// quem está lendo a interface em inglês.
const EN_ALIASES = {
  contact: 'contato', who: 'whoami', projects: 'projetos', devices: 'stack',
}

const resolveCommandName = (typed, language) => {
  const name = typed.toLowerCase()
  if (name in COMMANDS) return name
  if (language === 'en' && name in EN_ALIASES) return EN_ALIASES[name]
  return null
}

/** Uma linha (ou bloco) de saída já resolvida em JSX. Separado do componente
 * para não misturar "o que uma entrada é" com "como o terminal se comporta". */
const renderEntry = (entry) => {
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

    case 'tags':
      return (
        <div className="terminal-tags" key={entry.id}>
          {entry.items.map((tag, i) => (
            <span className="terminal-tag" key={i}>{tag}</span>
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
  const os = getOsData(language)
  const strings = os.terminal || {}

  // Estado inicial "preguiçoso": o boot só roda uma vez, na primeira
  // renderização, capturando o idioma que estava ativo quando a janela abriu
  // — não precisa de useEffect nem entra em conflito com exhaustive-deps.
  const [output, setOutput] = useState(() => buildBootEntries(content))
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

    const result = COMMANDS[name]({ content, profile, strings, open })
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
        {output.map(renderEntry)}
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
