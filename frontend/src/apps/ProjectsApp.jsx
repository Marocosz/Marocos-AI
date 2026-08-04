import React from 'react'
import { FileText } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { getProjectsData } from '../data/projects'
import { useWindows } from '../os/WindowManagerContext'
import { projectSlug } from './projectSlug'
import './ProjectsApp.css'

/**
 * A pasta "Projetos": lista os projetos do portfólio como itens de um
 * explorador de arquivos (ícone + nome + categoria). Substitui o antigo
 * carrossel, que só deixava um projeto legível por vez.
 *
 * Única exceção à regra de apps não conhecerem o sistema de janelas: para
 * abrir o detalhe de um projeto como janela filha, precisa de `useWindows`.
 */
const ProjectsApp = () => {
  const { language } = useLanguage()
  const { open } = useWindows()
  const content = getProjectsData(language)

  return (
    <ul className="projects-app-list">
      {content.items.map((project) => (
        <li key={project.id} className="projects-app-row">
          <button
            type="button"
            className="projects-app-item"
            onClick={() => open('project', { slug: projectSlug(project.title) })}
          >
            <span className="projects-app-item-icon">
              <FileText size={20} strokeWidth={1.75} />
            </span>
            <span className="projects-app-item-info">
              <span className="projects-app-item-title">{project.title}</span>
              <span className="projects-app-item-category">{project.category}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default ProjectsApp
