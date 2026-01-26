import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, User, FolderGit2, Map, Cpu, MessageSquare, 
  Wifi, Volume2, BatteryMedium, Sun, Moon, Play, Pause,
  LayoutGrid, MoreVertical
} from 'lucide-react';
import './Navbar.css';
import StartMenu from './StartMenu';

const getNavItems = (lang) => [
  { id: 'hero', icon: Home, label: lang === 'pt' ? 'Início' : 'Home' },
  { id: 'profile', icon: User, label: lang === 'pt' ? 'Perfil' : 'Profile' },
  { id: 'projects', icon: FolderGit2, label: lang === 'pt' ? 'Projetos' : 'Projects' },
  { id: 'journey', icon: Map, label: lang === 'pt' ? 'Jornada' : 'Journey' },
  { id: 'tech', icon: Cpu, label: lang === 'pt' ? 'Tecnologias' : 'Stack' },
  { id: 'contact', icon: MessageSquare, label: lang === 'pt' ? 'Contato' : 'Contact' },
];

import { useLanguage } from '../../contexts/LanguageContext';

const Navbar = ({ isDarkMode, toggleTheme, isAnimationEnabled, toggleAnimation }) => {
  const { language, toggleLanguage } = useLanguage();
  const navItems = React.useMemo(() => getNavItems(language), [language]); // Get translated items (Memoized)
  const [activeId, setActiveId] = useState('hero');
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isTrayMenuOpen, setIsTrayMenuOpen] = useState(false); // Mobile Tray Menu
  const [isCompact, setIsCompact] = useState(false);
  const visibleSections = useRef({});

  // Interaction State (Bubble)
  const [hasInteractedWithStart, setHasInteractedWithStart] = useState(false); // Default false for debugging

  // Detect Compact Mode (Mobile/Tablet)
  useEffect(() => {
    const checkCompact = () => {
      setIsCompact(window.innerWidth < 1024);
    };
    checkCompact();
    window.addEventListener('resize', checkCompact);
    return () => window.removeEventListener('resize', checkCompact);
  }, []);

  const toggleStartMenu = () => {
    setIsStartMenuOpen(!isStartMenuOpen);
    if(isTrayMenuOpen) setIsTrayMenuOpen(false);
    
    // Dismiss Bubble forever
    if (!hasInteractedWithStart) {
      setHasInteractedWithStart(true);
    }
  };

  // Auto-dismiss Bubble after 10s
  useEffect(() => {
    if (!hasInteractedWithStart) {
      const timer = setTimeout(() => {
        setHasInteractedWithStart(true);
      }, 10000); // 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, [hasInteractedWithStart]);

  const closeStartMenu = () => {
    setIsStartMenuOpen(false);
  };

  const toggleTrayMenu = () => {
    setIsTrayMenuOpen(!isTrayMenuOpen);
    if(isStartMenuOpen) setIsStartMenuOpen(false);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    // Stop updating active indicator if StartMenu is open (prevents weird jumping)
    if (isStartMenuOpen) return;

    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -40% 0px', 
      threshold: [0, 0.2, 0.4, 0.6, 0.8, 1]
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        visibleSections.current[entry.target.id] = entry.intersectionRatio;
      });

      const visibleIds = Object.keys(visibleSections.current);
      let maxRatio = 0;
      let mostVisibleId = activeId;

      visibleIds.forEach((id) => {
        const ratio = visibleSections.current[id];
        if (ratio > maxRatio) {
          maxRatio = ratio;
          mostVisibleId = id;
        }
      });

      if (maxRatio > 0) {
        setActiveId(mostVisibleId);
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    navItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [activeId, isStartMenuOpen, navItems]);

  return (
    <>
      <StartMenu 
        isOpen={isStartMenuOpen} 
        onClose={closeStartMenu} 
        isDarkMode={isDarkMode} 
      />

      {/* Tray Menu Popup (Mobile/Tablet) */}
      <AnimatePresence>
        {isTrayMenuOpen && isCompact && (
          <>
            <div className="tray-backdrop" onClick={() => setIsTrayMenuOpen(false)} />
            <motion.div 
              className="tray-menu-popup"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="tray-menu-item" onClick={toggleTheme}>
                 <span className="tray-menu-label">Theme</span>
                 {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div className="tray-menu-item" onClick={toggleLanguage}>
                 <span className="tray-menu-label">Language</span>
                 <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{language === 'en' ? 'EN' : 'PT'}</span>
              </div>
              <div className="tray-menu-item" onClick={toggleAnimation}>
                 <span className="tray-menu-label">Animation</span>
                 {isAnimationEnabled ? <Pause size={18} /> : <Play size={18} />}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div 
        className="taskbar-container"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{ zIndex: 1000 }}
      >
        
        {/* 1. Centro: Ícones de Navegação */}
        <div className="taskbar-center">
          
          {/* Start Button */}
          <div className="taskbar-icon-wrapper">
             <div className="taskbar-tooltip">{language === 'pt' ? 'Iniciar' : 'Start'}</div>
             <button
                onClick={toggleStartMenu}
                className={`taskbar-btn ${isStartMenuOpen ? 'active' : ''}`}
                aria-label="Start"
             >
                <LayoutGrid size={22} strokeWidth={isStartMenuOpen ? 2.5 : 2} />
             </button>
              
              {/* Interaction Bubble */}
              <AnimatePresence>
                {!hasInteractedWithStart && !isStartMenuOpen && (
                  <motion.div 
                    className="start-bubble"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: 2, duration: 0.5 }}
                  >
                    {language === 'pt' ? 'Converse Comigo!' : 'Chat with me!'}
                  </motion.div>
                )}
              </AnimatePresence>
          </div>

          {/* Divider */}
          <div className="tray-divider"></div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;

            return (
              <div key={item.id} className="taskbar-icon-wrapper">
                <div className="taskbar-tooltip">{item.label}</div>

                <button
                  onClick={() => scrollToSection(item.id)}
                  className={`taskbar-btn ${isActive ? 'active' : ''}`}
                  aria-label={item.label}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  
                  {isActive && (
                    <motion.div 
                      layoutId="taskbar-indicator"
                      className="app-indicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* 2. Direita: System Tray */}
        <div className="taskbar-right">
          
          {isCompact ? (
             /* Mobile/Tablet: Menu Button */
             <button onClick={toggleTrayMenu} className={`taskbar-btn ${isTrayMenuOpen ? 'active' : ''}`}>
                <MoreVertical size={20} />
             </button>
          ) : (
            /* Desktop: All Icons */
            <>
              {/* BOTÃO DE TEMA */}
              <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
                {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              {/* BOTÃO DE ANIMAÇÃO */}
              <button onClick={toggleAnimation} className="theme-toggle-btn" aria-label="Toggle Animation">
                {isAnimationEnabled ? <Pause size={18} /> : <Play size={18} />}
              </button>

              {/* BOTÃO DE IDIOMA */}
              <button onClick={toggleLanguage} className="theme-toggle-btn" aria-label="Toggle Language">
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{language === 'en' ? 'BR' : 'EN'}</span>
              </button>

              <div className="tray-divider"></div>

              <div className="tray-icons">
                <div className="tray-icon-hover"><Wifi size={16} /></div>
                <div className="tray-icon-hover"><Volume2 size={16} /></div>
                <div className="tray-icon-hover"><BatteryMedium size={16} /></div>
              </div>

              <div className="tray-clock">
                <Clock />
              </div>

              <div className="show-desktop-line"></div>
            </>
          )}

        </div>

      </motion.div>
    </>
  );
};

// Componente Relógio Isolado (Evita re-render da Navbar inteira a cada segundo)
const Clock = React.memo(() => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Atualiza apenas este componente
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <>
      <div className="time">{formatTime(time)}</div>
      <div className="date">{formatDate(time)}</div>
    </>
  );
});

export default Navbar;