import React from 'react'
import { FileText } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { getProjectsData } from '../content/projects'
import { getOsData } from '../i18n/os'
import { useWindowActions } from '../os/WindowManagerContext'
import { useIrPara } from '../os/NavegacaoContext'
import { projectSlug } from './projectSlug'
import './ProjectsApp.css'

/**
 * A pasta "Projetos", em MODO DETALHES.
 * ==================================================
 * Antes era uma lista de ícone + nome + categoria empilhados. Agora é a visão
 * que o Explorer chama de Detalhes: uma linha por projeto, com as colunas Nome,
 * Data de modificação, Tipo e Tamanho.
 *
 * A MUDANÇA É DE INFORMAÇÃO, NÃO SÓ DE FORMA. A lista antiga mostrava duas
 * coisas por item; esta mostra quatro, e as duas novas respondem perguntas que o
 * visitante realmente faz numa pasta — quando foi mexido, e qual é o maior.
 * É também o que fecha a metáfora: a janela já tinha barra de navegação,
 * breadcrumb e barra de status de explorador, e o miolo ainda era uma lista
 * genérica.
 *
 * O TAMANHO É UMA ESTIMATIVA DE COMPLEXIDADE vestida de bytes — a nota que
 * explica a escala está em `content/projects.js`, junto dos números.
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

const KB = 1024
const MB = KB * 1024

/**
 * Bytes no formato do Explorer: `4,2 MB` em português, `4.2 MB` em inglês.
 *
 * O separador decimal vem do `Intl`, e não de um `replace` à mão, porque é
 * exatamente o tipo de detalhe que denuncia uma interface traduzida pela metade.
 */
const formatarTamanho = (bytes, lang) => {
  if (!bytes) return ''
  const locale = lang === 'pt' ? 'pt-BR' : 'en-US'

  if (bytes >= MB) {
    const valor = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(bytes / MB)
    return `${valor} MB`
  }
  const valor = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(bytes / KB)
  return `${valor} KB`
}

/**
 * A data no formato local, sem hora.
 *
 * O Explorer mostra hora também, e aqui não: hora é precisão que estes dados não
 * têm (ver a nota de `FICHA` em content/projects.js). Inventar `14:32` para
 * completar a citação seria trocar honestidade por semelhança.
 *
 * `new Date('2026-02-14')` é interpretado como UTC e, num fuso a oeste,
 * retrocede um dia na exibição. Os componentes vão soltos para o construtor
 * local justamente para evitar isso.
 */
const formatarData = (iso, lang) => {
  if (!iso) return ''
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat(lang === 'pt' ? 'pt-BR' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(ano, mes - 1, dia))
}

const ProjectsApp = () => {
  const { language } = useLanguage()
  const { open } = useWindowActions()
  const irPara = useIrPara()
  const content = getProjectsData(language)
  const t = getOsData(language).projects
  const abrirProjeto = irPara ?? open

  return (
    <div className="projects-app">
      {/* `role="row"` num cabeçalho de grade: a lista continua sendo uma lista
          para leitor de tela, e não uma tabela de dados que ninguém vai
          navegar célula a célula. */}
      <div className="projects-app-head" role="row">
        <span className="projects-col projects-col--nome">{t.colName}</span>
        <span className="projects-col projects-col--data">{t.colDate}</span>
        <span className="projects-col projects-col--tipo">{t.colType}</span>
        <span className="projects-col projects-col--tamanho">{t.colSize}</span>
      </div>

      <ul className="projects-app-list">
        {content.items.map((project) => (
          <li key={project.id} className="projects-app-row">
            <button
              type="button"
              className="projects-app-item"
              onClick={() => abrirProjeto('project', { slug: projectSlug(project.title) })}
            >
              <span className="projects-col projects-col--nome">
                <FileText size={18} strokeWidth={1.75} className="projects-app-item-icon" />
                <span className="projects-app-item-title">{project.title}</span>
              </span>
              <span className="projects-col projects-col--data">
                {formatarData(project.data, language)}
              </span>
              <span className="projects-col projects-col--tipo">{project.category}</span>
              <span className="projects-col projects-col--tamanho">
                {formatarTamanho(project.bytes, language)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ProjectsApp
