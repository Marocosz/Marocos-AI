import React from 'react'
import { FileText } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { getProjectsData } from '../content/projects'
import { useWindowActions } from '../os/WindowManagerContext'
import { useIrPara } from '../os/NavegacaoContext'
import { projectSlug } from './projectSlug'
import './ProjectsApp.css'

/**
 * A pasta "Projetos": lista os projetos do portfólio como itens de um
 * explorador de arquivos (ícone + nome + categoria). Substitui o antigo
 * carrossel, que só deixava um projeto legível por vez.
 *
 * COMO ELE ABRE UM PROJETO NÃO É DECISÃO DELE. Numa janela com chrome de
 * explorador, clicar num item troca o conteúdo da própria janela — é entrar
 * numa pasta. Num container sem chrome, e no mobile, abre uma tela/janela nova.
 * Quem sabe qual é o caso é o container, e ele informa por `useIrPara()` (ver
 * os/NavegacaoContext.jsx).
 *
 * O `open` fica como rede: fora de um container — teste, render isolado — o
 * hook devolve null e a lista continua funcionando. Só usa ação, então
 * `useWindowActions` — não re-renderiza quando outra janela se move ou ganha
 * foco.
 */
const ProjectsApp = () => {
  const { language } = useLanguage()
  const { open } = useWindowActions()
  const irPara = useIrPara()
  const content = getProjectsData(language)
  const abrirProjeto = irPara ?? open

  return (
    <ul className="projects-app-list">
      {content.items.map((project) => (
        <li key={project.id} className="projects-app-row">
          <button
            type="button"
            className="projects-app-item"
            onClick={() => abrirProjeto('project', { slug: projectSlug(project.title) })}
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
