import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { getJourneyData } from '../data/journey'
import AppHeader from '../ui/AppHeader'
import './HistoryApp.css'

/**
 * Histórico de Versões — a trajetória profissional como changelog de sistema.
 *
 * A versão de seção (Journey.jsx) é um carrossel horizontal arrastável com
 * setas SVG conectando os cards. Dentro de uma janela de 700x520 isso não
 * cabe: aqui os mesmos dados viram uma lista vertical de entradas de log,
 * no espírito do histórico de atualizações do Windows. A metáfora de commit
 * (hash monoespaçado + badge de tipo colorido por categoria) é o que os
 * dados já trazem — só muda o layout que a carrega.
 *
 * Não sabe que janelas existem: recebe `params` (ignorado, vem `null`) e
 * deixa o container da janela cuidar de padding e scroll.
 */
const HistoryApp = () => {
  const { language } = useLanguage()
  const content = getJourneyData(language)

  return (
    <div className="history-app">
      <AppHeader
        eyebrow={content.sectionLabel}
        titulo={content.title}
        subtitulo={content.subtitle}
        escala="md"
      />

      <ul className="history-list">
        {content.items.map((item) => (
          <li key={item.id} className={`history-entry history-entry--${item.type}`}>
            <div className="history-card">
              <div className="history-card-header">
                <span className="history-hash">
                  <span className="history-hash-prefix">commit</span> {item.hash}
                </span>
                <span className="history-badge">[{item.type}]</span>
              </div>

              <div className="history-date">{content.dateLabel} {item.date}</div>

              <h3 className="history-card-title">{item.title}</h3>
              <p className="history-card-org">{content.authorLabel} {item.org}</p>

              <div className="history-divider" />

              <p className="history-description">{item.description}</p>

              <div className="history-tags">
                {item.tags.map((tag, i) => (
                  <span key={i} className="history-tag">{tag}</span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default HistoryApp
