import React from 'react'
import { Github } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { getProjectsData } from '../content/projects'
import { getOsData } from '../i18n/os'
import { projectSlug } from './projectSlug'
import './ProjectDetailApp.css'

// Mensagem de fallback caso `os.errors.projectNotFound` ainda não exista em
// i18n/os.js (ver relatório da tarefa: chave de sistema pendente de adição).
// Mantém o app funcional e sem tela branca enquanto a chave não chega.
const FALLBACK_NOT_FOUND = {
  pt: 'Projeto não encontrado.',
  en: 'Project not found.',
}

/**
 * Detalhe de um projeto: recebe `params.slug` (a janela é dinâmica, uma
 * instância por slug — ver registry) e re-deriva a lista de projetos para
 * achar o item correspondente, já que os dados não têm índice por slug.
 */
const ProjectDetailApp = ({ params }) => {
  const { language } = useLanguage()
  const content = getProjectsData(language)
  const os = getOsData(language)
  const project = content.items.find((item) => projectSlug(item.title) === params?.slug)

  if (!project) {
    const notFoundMessage = os.errors?.projectNotFound || FALLBACK_NOT_FOUND[language] || FALLBACK_NOT_FOUND.en
    return (
      <div className="project-detail-app project-detail-empty">
        <p>{notFoundMessage}</p>
      </div>
    )
  }

  return (
    <div className="project-detail-app">
      <div className="project-detail-header">
        <span className="project-detail-category">{project.category}</span>
        <h3 className="project-detail-title">{project.title}</h3>
      </div>

      <div className="project-detail-section">
        <span className="project-detail-label">{content.labels.idea}</span>
        <p className="project-detail-description">{project.description}</p>
      </div>

      <div className="project-detail-section">
        <span className="project-detail-label">{content.labels.techs}</span>
        <ul className="project-detail-techs">
          {project.techs && project.techs.map((tech) => (
            <li key={tech} className="project-detail-tech-item">{tech}</li>
          ))}
        </ul>
      </div>

      <a
        href={project.links.github}
        className="project-detail-github-btn"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Github size={18} />
        {content.labels.github}
      </a>
    </div>
  )
}

export default ProjectDetailApp
