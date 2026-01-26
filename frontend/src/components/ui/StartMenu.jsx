import React, { useRef, useEffect, useState } from 'react';
import { Search, Power, Settings, Bot, Send, Loader2, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from '../../contexts/LanguageContext';
import { getStartMenuData } from '../../data/startMenu';
import './StartMenu.css';

// Determine API URL based on environment
// Dev: http://localhost:8000/api
// Prod: /api (Assumes Nginx/Reverse Proxy handles the route)
const API_BASE = import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://api.marocos.dev/api';

const StartMenu = ({ isOpen, onClose, isDarkMode }) => {
  const { language } = useLanguage();
  const content = getStartMenuData(language);
  const menuRef = useRef(null);
  const chatEndRef = useRef(null);

  const SUGGESTIONS = {
    pt: [
      "Quais são seus principais projetos?",
      "Tem experiência profissional?",
      "Qual sua stack de tecnologia?",
      "Me fale sobre você"
    ],
    en: [
      "What are your main projects?",
      "Do you have professional experience?",
      "What is your tech stack?",
      "Tell me about yourself"
    ]
  };

  // States
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(''); // New State for Status Text
  const [usage, setUsage] = useState(null);
  const [showBetaBanner, setShowBetaBanner] = useState(true);

  // Scroll to bottom effect
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, loadingStatus]);

  // Disable scroll when open (Robust Strategy: Fixed Body + Lenis Stop)
  useEffect(() => {
    if (isOpen) {
      // Fetch Usage Status
      fetch(`${API_BASE}/chat/status`)
        .then(res => res.json())
        .then(data => setUsage(data))
        .catch(console.error);

      const scrollY = window.scrollY;
      if (window.lenis?.stop) window.lenis.stop();

      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'hidden'; 

      return () => {
        const scrollYStored = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';

        if (scrollYStored) {
            window.scrollTo(0, parseInt(scrollYStored || '0') * -1);
        }

        if (window.lenis?.start) window.lenis.start();
      };
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setLoadingStatus(language === 'pt' ? 'Iniciando...' : 'Starting...');

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
          language: language
        })
      });

      if (response.status === 429) {
         const errorData = await response.json();
         setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `⚠️ ${errorData.detail}`
         }]);
         setIsLoading(false);
         return;
      }

      if (!response.ok) throw new Error('Network response was not ok');

      // READ STREAM
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process buffer for events (event: ... \n data: ... \n\n)
        const parts = buffer.split('\n\n');
        buffer = parts.pop(); // Keep incomplete part in buffer

        for (const part of parts) {
            const lines = part.split('\n');
            let eventType = null;
            let eventData = null;

            for (const line of lines) {
                if (line.startsWith('event: ')) {
                    eventType = line.substring(7).trim();
                } else if (line.startsWith('data: ')) {
                    try {
                        eventData = JSON.parse(line.substring(6));
                    } catch (e) {
                        console.error('JSON Parse Error', e);
                    }
                }
            }

            if (eventType && eventData) {
                if (eventType === 'status') {
                    setLoadingStatus(eventData.message);
                } else if (eventType === 'result') {
                    const botMsg = { role: 'assistant', content: eventData.response };
                    setMessages(prev => [...prev, botMsg]);
                    if (eventData.usage) setUsage(eventData.usage);
                } else if (eventType === 'error') {
                    const errorMsg = { role: 'assistant', content: `⚠️ Error: ${eventData.detail}` };
                    setMessages(prev => [...prev, errorMsg]);
                }
            }
        }
      }

    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: language === 'pt' ? '⚠️ Erro ao conectar com o servidor. Tente novamente mais tarde.' : '⚠️ Error connecting to server. Please try again later.'
      }]);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  const handleSendMessage = () => sendMessage(input);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="start-menu-backdrop" 
        onClick={onClose}
      />

      <div className={`start-menu-container ${!isDarkMode ? 'theme-light' : ''}`} ref={menuRef}>
        
        {/* Topo: Barra de Pesquisa */}
        <div className="start-menu-header">
          <div className="start-search-bar">
            {isLoading ? <Loader2 size={18} className="search-icon animate-spin" /> : <Search size={18} className="search-icon" />}
            <input 
              type="text" 
              placeholder={language === 'pt' ? "Pergunte algo sobre o Marcos..." : "Ask something about Marcos..."}
              className="search-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            {input.trim() && (
                <button 
                    className="send-btn-icon" 
                    onClick={handleSendMessage}
                    disabled={isLoading}
                >
                    <Send size={16} />
                </button>
            )}
          </div>
        </div>

        {/* Meio: Conteúdo do Chat */}
        <div className="start-menu-content">
          
          {/* Aviso Beta Discreto */}
          {showBetaBanner && (
            <div className="beta-notice-banner">
              <Bot size={14} className="beta-icon-alert" />
              <span style={{ lineHeight: '1.4', flex: 1 }}>
                {language === 'pt' 
                  ? "Este assistente utiliza IA Generativa para criar respostas dinâmicas. Embora otimizado, o modelo pode apresentar imprecisões inerentes à tecnologia. Base de conhecimento atualizada até Jan/2026." 
                  : "This assistant uses Generative AI to create dynamic responses. While optimized, the model may present inaccuracies inherent to the technology. Knowledge base updated as of Jan/2026."}
              </span>
              <button 
                onClick={() => setShowBetaBanner(false)}
                className="beta-close-btn"
                aria-label="Close notice"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="chat-scroll-area" data-lenis-prevent>
          {messages.length === 0 ? (
            // Placeholder State
            <div className="empty-state">
              <Bot size={48} className="construct-icon" />
              <div className="construct-text">
                {language === 'pt' ? 'Olá! Sou a IA do Marcos.' : 'Hi! I am Marcos AI.'}
              </div>
              <div className="construct-subtext">
                {language === 'pt' 
                 ? 'Pergunte sobre projetos, experiências, hobbies ou tecnologias. Estou aqui para responder!' 
                 : 'Ask about projects, experience, hobbies, or tech stack. I am here to answer!'}
              </div>
              
              <div className="suggestion-chips">
                {SUGGESTIONS[language] && SUGGESTIONS[language].map((suggestion, index) => (
                  <button 
                    key={index} 
                    className="suggestion-chip"
                    onClick={() => sendMessage(suggestion)}
                    disabled={isLoading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Messages List
            <div className="messages-list">
              {messages.map((msg, index) => (
                <div key={index} className={`message-row ${msg.role}`}>
                    {msg.role === 'assistant' && (
                        <div className="message-avatar bot">
                           <Bot size={16} />
                        </div>
                    )}
                    <div className="message-bubble">
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                                a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />
                            }}
                        >
                            {msg.content}
                        </ReactMarkdown>
                    </div>
                    {msg.role === 'user' && (
                        <div className="message-avatar user">
                           M
                        </div>
                    )}
                </div>
              ))}
              
              {isLoading && (
                  <div className="message-row assistant">
                      <div className="message-avatar bot"><Bot size={16} /></div>
                      <div className="message-bubble loading-status">
                        <span className="status-text">{loadingStatus || (language === 'pt' ? 'Processando...' : 'Processing...')}</span>
                      </div>
                  </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
          </div>
        </div>

        {/* Rodapé: Usuário e Power */}
        <div className="start-menu-footer">
          <div className="user-profile">
            <div className="user-avatar">V</div>
            <span className="user-name">{content.visitor}</span>
          </div>

          <div className="footer-actions">
            {usage && (
                <div className="usage-limit-container">
                    <span>{usage.current}/{usage.limit}</span>
                    <div className="usage-tooltip">
                        {language === 'pt' 
                            ? "Limite global diário do projeto por uso de APIs gratuitas."
                            : "Daily global project limit due to free API usage."}
                    </div>
                </div>
            )}
            <div className="footer-icon-btn">
              <Settings size={18} />
            </div>
            <div className="footer-icon-btn">
              <Power size={18} />
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default StartMenu;
