import React, { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useLanguage } from '../contexts/LanguageContext'
import { getTechData } from '../data/tech'
import { getOsData } from '../data/os'
import { MOVIMENTO } from '../config/system'
import AppHeader from '../ui/AppHeader'
import './DevicesApp.css'

/**
 * Gerenciador de Dispositivos — a stack técnica do portfólio apresentada
 * como o Gerenciador de Dispositivos do Windows.
 *
 * A fonte de dados (getTechData) já é uma árvore de dois níveis — categoria
 * → tecnologias —, então a metáfora de árvore expansível encaixa sem
 * reinventar nada: cada categoria é um nó que expande/recolre, cada
 * tecnologia dentro dela é um "dispositivo instalado" com um status
 * (nível de domínio) alinhado à direita, igual a uma lista de detalhes
 * do Explorer.
 *
 * Reaproveita a linguagem visual de components/sections/TechStack.jsx:
 * o dot colorido com glow (currentColor + box-shadow), o chip de
 * tecnologia (chip vira linha de lista, mas mantém fundo/borda/hover) e o
 * ícone de categoria em wrapper. O grid em bento vira lista vertical
 * porque é isso que uma árvore pede.
 *
 * Não sabe que janelas existem: `params` é recebido só porque o contrato
 * de app pede um prop nesse formato, mas este app não tem parâmetros de
 * rota (não é dynamic no registry).
 */
const DevicesApp = () => {
  const { language } = useLanguage()
  const content = getTechData(language)
  const os = getOsData(language)

  // Primeira categoria começa expandida, as demais fechadas — assim a
  // janela não abre nem vazia (nenhum dispositivo visível) nem gigante
  // (tudo expandido de uma vez em 620x520).
  const [openIds, setOpenIds] = useState(() =>
    content.items[0] ? new Set([content.items[0].id]) : new Set()
  )

  const toggleCategory = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div className="devices-app">
      <AppHeader
        eyebrow={content.sectionLabel}
        titulo={content.title}
        subtitulo={content.subtitle}
        escala="sm"
      />

      <div className="devices-tree">
        {content.items.map((category) => {
          const Icon = category.icon
          const isOpen = openIds.has(category.id)
          const bodyId = `devices-body-${category.id}`

          return (
            <div className="devices-category" key={category.id}>
              {/* Nó de categoria: precisa ser <button> (não <div onClick>)
                  pra expandir/recolher funcionar por teclado, com
                  aria-expanded refletindo o estado real. */}
              <button
                type="button"
                className="devices-category-toggle"
                aria-expanded={isOpen}
                aria-controls={bodyId}
                onClick={() => toggleCategory(category.id)}
              >
                <ChevronRight
                  className={`devices-chevron${isOpen ? ' is-open' : ''}`}
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span className="devices-icon-wrapper" aria-hidden="true">
                  <Icon size={18} strokeWidth={1.5} />
                </span>
                <span className="devices-category-title">{category.title}</span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={bodyId}
                    className="devices-category-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={MOVIMENTO.acordeaoDispositivos}
                  >
                    <p className="devices-category-desc">{category.description}</p>

                    <div className="devices-list-header">
                      <span>{os.devices?.device}</span>
                      <span>{os.devices?.status}</span>
                    </div>

                    <ul className="devices-item-list">
                      {category.items.map((tech) => (
                        <li className="devices-item" key={tech.name}>
                          <span className="devices-item-main">
                            <span
                              className="devices-dot"
                              style={{ backgroundColor: tech.color, color: tech.color }}
                            />
                            <span className="devices-item-text">
                              <span className="devices-item-name">{tech.name}</span>
                              <span className="devices-item-desc">{tech.tooltip}</span>
                            </span>
                          </span>
                          <span className={`devices-item-level level-${tech.level.toLowerCase()}`}>
                            {tech.level}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DevicesApp
