import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Home, User, FolderGit2, Map, Cpu, MessageSquare, 
  Wifi, Volume2, BatteryMedium, Sun, Moon, Play, Pause // Added Play and Pause
} from 'lucide-react';
import './Navbar.css';

const navItems = [
  { id: 'hero', icon: Home, label: 'Home' },
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'projects', icon: FolderGit2, label: 'Projects' },
  { id: 'journey', icon: Map, label: 'Journey' },
  { id: 'tech', icon: Cpu, label: 'Stack' },
  { id: 'contact', icon: MessageSquare, label: 'Contact' },
];

// Agora recebe props de tema e animação
const Navbar = ({ isDarkMode, toggleTheme, isAnimationEnabled, toggleAnimation }) => {
  const [activeId, setActiveId] = useState('hero');
  const [time, setTime] = useState(new Date());
  const visibleSections = useRef({});

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
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
  }, [activeId]);

  return (
    <motion.div 
      className="taskbar-container"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      
      {/* 1. Centro: Ícones de Navegação */}
      <div className="taskbar-center">
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
        
        {/* BOTÃO DE TEMA */}
        <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
          {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* BOTÃO DE ANIMAÇÃO */}
        <button onClick={toggleAnimation} className="theme-toggle-btn" aria-label="Toggle Animation">
          {isAnimationEnabled ? <Pause size={18} /> : <Play size={18} />}
        </button>

        <div className="tray-divider"></div>

        <div className="tray-icons">
          <div className="tray-icon-hover"><Wifi size={16} /></div>
          <div className="tray-icon-hover"><Volume2 size={16} /></div>
          <div className="tray-icon-hover"><BatteryMedium size={16} /></div>
        </div>

        <div className="tray-clock">
          <div className="time">{formatTime(time)}</div>
          <div className="date">{formatDate(time)}</div>
        </div>

        <div className="show-desktop-line"></div>
      </div>

    </motion.div>
  );
};

export default Navbar;