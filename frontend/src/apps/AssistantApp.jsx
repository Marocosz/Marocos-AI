import React, { useRef, useEffect, useState, lazy, Suspense } from 'react'
import { Search, Bot, Send, Loader2, X } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { getOsData } from '../data/os'
import { REDE } from '../config/system'
import './AssistantApp.css'

/**
 * react-markdown + remark-gfm + micromark somam dezenas de KB e só servem
 * depois da primeira resposta do agente — o estado vazio é texto puro. Isolado
 * em módulo próprio (`AssistantMarkdown.jsx`) e carregado sob demanda.
 */
const AssistantMarkdown = lazy(() => import('./AssistantMarkdown'))

/**
 * Marcos Virtual — chat com o agente RAG, dentro de uma janela do Marocos OS.
 *
 * A lógica de rede (status de cota, streaming SSE manual, timeout de 60s,
 * tratamento de 429) veio de StartMenu.jsx. O invólucro mudou: sem backdrop,
 * sem isOpen/onClose, sem travar o scroll do body — quem monta e desmonta o
 * componente agora é o gerenciador de janelas, e o Lenis não existe mais
 * no projeto. Além disso, dois bugs herdados do componente antigo (histórico
 * lido de uma closure velha e uma string de erro cravada em inglês) foram
 * corrigidos nesta migração — ver comentários em `sendMessage`.
 *
 * O app não sabe que janelas existem: não importa nada de `os/`.
 */
const AssistantApp = () => {
  const { language } = useLanguage()
  const content = getOsData(language).assistant
  const chatEndRef = useRef(null)

  // Estados — idênticos aos de StartMenu.jsx.
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState('') // Texto de status ("Pensando...", etc.)
  const [usage, setUsage] = useState(null)
  const [showBetaBanner, setShowBetaBanner] = useState(true)

  /**
   * Mensagem nova rola suave; troca de texto de status ajusta a posição direto.
   *
   * Antes os dois casos caíam no mesmo `behavior: 'smooth'`, e como o status
   * muda a cada evento SSE do agente, cada evento reiniciava uma animação de
   * scroll que a anterior ainda não tinha terminado — numa resposta com quatro
   * ou cinco passos de status, a área de mensagens ficava tremendo.
   */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (!loadingStatus) return
    chatEndRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [loadingStatus])

  // Busca o contador de cota uma vez, quando a janela é montada.
  // Equivalente ao efeito de abertura de StartMenu.jsx (que rodava a cada
  // `isOpen` virar true) — aqui a montagem do componente já É a abertura,
  // então não há mais a condicional nem o cleanup de scroll-lock.
  useEffect(() => {
    fetch(`${REDE.apiBase}/chat/status`)
      .then((res) => res.json())
      .then((data) => setUsage(data))
      .catch(console.error)
  }, [])

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return

    const userMsg = { role: 'user', content: text }

    // Bug herdado do porte original: o corpo da requisição usava `messages`
    // lido direto do escopo do render em que esta função foi criada. Se o
    // envio ocorresse rápido (ou logo após outro setMessages ainda não
    // "commitado"), esse `messages` podia estar defasado e o backend recebia
    // um histórico sem a troca mais recente. Correção: usar a forma
    // funcional de setMessages para capturar o array mais atual garantido
    // pelo React (que aplica updates em fila, sempre a partir do estado
    // pendente mais recente) — sem depender de quando o render acontece.
    // `historyForRequest` fica com o histórico ANTES desta mensagem, que é
    // exatamente o que o backend espera em `history` (a mensagem atual vai
    // separada, no campo `message`).
    let historyForRequest = []
    setMessages((prev) => {
      historyForRequest = prev
      return [...prev, userMsg]
    })

    setInput('')
    setIsLoading(true)
    setLoadingStatus(content.startingStatus)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REDE.timeoutChatMs)

    try {
      const response = await fetch(`${REDE.apiBase}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          // `historyForRequest` (não `messages`) — ver comentário acima.
          history: historyForRequest,
          language: language,
        }),
        signal: controller.signal,
      })

      if (response.status === 429) {
        const errorData = await response.json()
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: `⚠️ ${errorData.detail}`,
        }])
        setIsLoading(false)
        return
      }

      if (!response.ok) throw new Error('Network response was not ok')

      // LEITURA DO STREAM (SSE manual)
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Processa o buffer em busca de eventos (event: ... \n data: ... \n\n)
        const parts = buffer.split('\n\n')
        buffer = parts.pop() // Mantém a parte incompleta no buffer

        for (const part of parts) {
          const lines = part.split('\n')
          let eventType = null
          let eventData = null

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.substring(7).trim()
            } else if (line.startsWith('data: ')) {
              try {
                eventData = JSON.parse(line.substring(6))
              } catch (e) {
                console.error('JSON Parse Error', e)
              }
            }
          }

          if (eventType && eventData) {
            if (eventType === 'status') {
              setLoadingStatus(eventData.message)
            } else if (eventType === 'result') {
              const botMsg = { role: 'assistant', content: eventData.response }
              setMessages((prev) => [...prev, botMsg])
              if (eventData.usage) setUsage(eventData.usage)
            } else if (eventType === 'error') {
              // Bug herdado do porte original: "Error:" ficava cravado em
              // inglês aqui, aparecendo mesmo com a interface em português.
              // Agora vem de os.assistant.errorPrefix, traduzido por idioma.
              const errorMsg = {
                role: 'assistant',
                content: `⚠️ ${content.errorPrefix} ${eventData.detail}`,
              }
              setMessages((prev) => [...prev, errorMsg])
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat Error:', error)
      const isTimeout = error.name === 'AbortError'
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: isTimeout ? content.timeoutError : content.connectionError,
      }])
    } finally {
      clearTimeout(timeoutId)
      setIsLoading(false)
      setLoadingStatus('')
    }
  }

  const handleSendMessage = () => sendMessage(input)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSendMessage()
  }

  return (
    <div className="assistant-app">

      {/* Aviso Beta discreto */}
      {showBetaBanner && (
        <div className="assistant-beta-banner">
          <Bot size={14} className="assistant-beta-icon" />
          <span style={{ lineHeight: '1.4', flex: 1 }}>{content.betaNotice}</span>
          <button
            onClick={() => setShowBetaBanner(false)}
            className="assistant-beta-close"
            aria-label={content.closeNotice}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Área de mensagens: a que rola. O input fica fixo abaixo dela. */}
      <div className="assistant-chat-scroll">
        {messages.length === 0 ? (
          // Estado vazio com sugestões de pergunta
          <div className="assistant-empty-state">
            <Bot size={48} className="assistant-empty-icon" />
            <div className="assistant-empty-title">{content.emptyTitle}</div>
            <div className="assistant-empty-subtitle">{content.emptySubtitle}</div>

            <div className="assistant-suggestions">
              {content.suggestions && content.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="assistant-suggestion-chip"
                  onClick={() => sendMessage(suggestion)}
                  disabled={isLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Lista de mensagens
          <div className="assistant-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`assistant-message-row ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="assistant-avatar bot">
                    <Bot size={16} />
                  </div>
                )}
                <div className="assistant-bubble">
                  {/* Fallback com o texto cru: se o chunk atrasar, o visitante
                      lê a resposta sem formatação em vez de ver um vazio. */}
                  <Suspense fallback={<span>{msg.content}</span>}>
                    <AssistantMarkdown>{msg.content}</AssistantMarkdown>
                  </Suspense>
                </div>
                {msg.role === 'user' && (
                  <div className="assistant-avatar user">M</div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="assistant-message-row assistant">
                <div className="assistant-avatar bot"><Bot size={16} /></div>
                <div className="assistant-bubble assistant-loading-bubble">
                  <span className="assistant-status-text">{loadingStatus || content.processingStatus}</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Contador de uso (limite diário global da API) */}
      {usage && (
        <div className="assistant-footer">
          <div className="assistant-usage">
            <span>{usage.current}/{usage.limit}</span>
            <div className="assistant-usage-tooltip">{content.usageTooltip}</div>
          </div>
        </div>
      )}

      {/* Input fixo embaixo */}
      <div className="assistant-input-bar">
        <div className="assistant-search-bar">
          {isLoading
            ? <Loader2 size={18} className="assistant-search-icon assistant-spin" />
            : <Search size={18} className="assistant-search-icon" />}
          <input
            type="text"
            placeholder={content.searchPlaceholder}
            className="assistant-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          {input.trim() && (
            <button
              className="assistant-send-btn"
              onClick={handleSendMessage}
              disabled={isLoading}
            >
              <Send size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AssistantApp
