import React from 'react'
import { Github, Lock } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { getProjectsData } from '../content/projects'
import { getOsData } from '../i18n/os'
import { projectSlug } from './projectSlug'
import './ProjectDetailApp.css'

/**
 * Detalhe de um projeto: recebe `params.slug` (a janela é dinâmica, uma
 * instância por slug — ver registry) e re-deriva a lista de projetos para
 * achar o item correspondente, já que os dados não têm índice por slug.
 *
 * ==================================================
 * QUATRO SEÇÕES, E A ORDEM É UM ARGUMENTO.
 *
 * Antes era uma só — um parágrafo de "IDEIA" e a lista de tecnologias. Com
 * quatorze projetos a documentar, um parágrafo por projeto é ou gigante ou raso;
 * não há terceira opção. Então o texto foi separado em quatro perguntas, e elas
 * aparecem na ordem em que um leitor técnico as faz:
 *
 *   RESUMO          o que é e para quem
 *   O PROBLEMA      por que isto foi difícil — a parte que justifica existir
 *   COMO FUNCIONA   a técnica, com o nome dela
 *   NO CÓDIGO       o que foi contado, não afirmado
 *
 * "NO CÓDIGO" é o rótulo dos `destaques`, e o nome é uma promessa: só entra ali
 * o que foi lido ou contado no repositório ("368 casos de teste em 70
 * arquivos"), nunca adjetivo ("arquitetura robusta"). Ver o cabeçalho de
 * `content/projects.js`, que registra as três vezes em que o README de um
 * projeto discordou do código dele.
 *
 * AS SEÇÕES SÃO OPCIONAIS, uma a uma. Um projeto sem `problema` simplesmente não
 * desenha aquele bloco — assim acrescentar um projeto de escopo menor no futuro
 * não obriga a inventar um problema difícil para preencher a forma.
 */
const ProjectDetailApp = ({ params }) => {
  const { language } = useLanguage()
  const content = getProjectsData(language)
  const os = getOsData(language)
  const project = content.items.find((item) => projectSlug(item.title) === params?.slug)

  if (!project) {
    return (
      <div className="project-detail-app project-detail-empty">
        <p>{os.errors.projectNotFound}</p>
      </div>
    )
  }

  /**
   * O REPOSITÓRIO PÚBLICO É A EXCEÇÃO, NÃO A REGRA — nove dos quatorze projetos
   * são de cliente ou de empresa.
   *
   * Quando não há link, o lugar do botão recebe um SELO, e não um botão
   * desabilitado: botão que aceita o olho e não leva a lugar nenhum lê como
   * defeito. E a ausência do repositório é informação de verdade — diz que
   * aquele trabalho foi para produção de alguém, e não para vitrine.
   */
  const repo = project.links?.github

  return (
    <div className="project-detail-app">
      <div className="project-detail-header">
        <div className="project-detail-meta">
          <span className="project-detail-category">{project.category}</span>
          {/* O contexto vem como CHAVE e o rótulo é traduzido aqui — mesma
              separação de `level` na Stack e de `inicializacao` nos Serviços: o
              dado vira modificador de classe, e traduzir o dado quebraria a cor
              num dos idiomas, em silêncio. */}
          {project.contexto && (
            <span
              className={`project-detail-contexto project-detail-contexto--${project.contexto}`}
            >
              {content.contextos[project.contexto]}
            </span>
          )}
        </div>
        <h3 className="project-detail-title">{project.title}</h3>
      </div>

      <div className="project-detail-section">
        <span className="project-detail-label">{content.labels.idea}</span>
        <p className="project-detail-description">{project.description}</p>
      </div>

      {project.problema && (
        <div className="project-detail-section">
          <span className="project-detail-label">{content.labels.problema}</span>
          <p className="project-detail-description">{project.problema}</p>
        </div>
      )}

      {project.solucao && (
        <div className="project-detail-section">
          <span className="project-detail-label">{content.labels.solucao}</span>
          <p className="project-detail-description">{project.solucao}</p>
        </div>
      )}

      {project.destaques?.length > 0 && (
        <div className="project-detail-section">
          <span className="project-detail-label">{content.labels.destaques}</span>
          {/* LISTA COM FILETE, e não card por item: são de três a cinco fatos
              curtos, e cinco retângulos preenchidos em sequência é o padrão que
              o "Sobre este PC" já pagou para desaprender — preenchimento é ação,
              e um fato não é clicável. */}
          <ul className="project-detail-destaques">
            {project.destaques.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="project-detail-section">
        <span className="project-detail-label">{content.labels.techs}</span>
        <ul className="project-detail-techs">
          {project.techs && project.techs.map((tech) => (
            <li key={tech} className="project-detail-tech-item">{tech}</li>
          ))}
        </ul>
      </div>

      {repo ? (
        <a
          href={repo}
          className="project-detail-github-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github size={18} />
          {content.labels.github}
        </a>
      ) : (
        <p className="project-detail-fechado">
          <Lock size={15} aria-hidden="true" />
          <span className="project-detail-fechado-texto">
            <span className="project-detail-fechado-titulo">{content.labels.fechado}</span>
            <span className="project-detail-fechado-hint">{content.labels.fechadoHint}</span>
          </span>
        </p>
      )}
    </div>
  )
}

export default ProjectDetailApp
