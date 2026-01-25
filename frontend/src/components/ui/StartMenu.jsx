import React, { useRef, useEffect, useState } from 'react';
import { Search, Power, Settings, Bot, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from '../../contexts/LanguageContext';
import { getStartMenuData } from '../../data/startMenu';
import './StartMenu.css';

const StartMenu = ({ isOpen, onClose, isDarkMode }) => {
  const { language } = useLanguage();
  const content = getStartMenuData(language);
  const menuRef = useRef(null);
  const chatEndRef = useRef(null);

  // States
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usage, setUsage] = useState(null);

  // Scroll to bottom effect
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Disable scroll when open (Robust Strategy: Fixed Body + Lenis Stop)
  useEffect(() => {
    if (isOpen) {
      // Fetch Usage Status
      fetch('http://localhost:8000/api/chat/status')
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

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Backend URL - Check if running in dev or prod logic later, hardcoded strictly for now as per user context
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          history: messages // Send previous context
        })
      });

      if (response.status === 429) {
         const errorData = await response.json();
         setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `⚠️ ${errorData.detail}`
         }]);
         return;
      }

      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      const botMsg = { role: 'assistant', content: data.response };
      
      if (data.usage) setUsage(data.usage);
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: language === 'pt' ? '⚠️ Erro ao conectar com o servidor. Tente novamente mais tarde.' : '⚠️ Error connecting to server. Please try again later.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

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
                      <div className="message-bubble loading">
                        <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
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
