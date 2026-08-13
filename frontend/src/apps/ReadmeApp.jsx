import React from 'react'
import { Github } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { getOsData } from '../i18n/os'
import './ReadmeApp.css'

const REPO = 'https://github.com/Marocosz/Marocos-AI'

/**
 * leia-me.txt — o portfólio como case técnico.
 *
 * ESTE APP CARREGA A MELHOR PROVA DO SITE SOZINHO. marocos.dev ficou de fora da
 * janela de Projetos por decisão do dono do projeto, então é aqui ou em lugar
 * nenhum que o visitante descobre que o sistema em que ele está clicando é o
 * trabalho. Uma das quatro portas do guia ("E este site aqui?") aponta para cá.
 *
 * O TEXTO SAIU DO JSX. Ele morava chumbado neste arquivo, em dois blocos de
 * markup por idioma — o único app do projeto que fazia isso, contra a convenção
 * de que texto de interface vive em `i18n/` e dado de portfólio em `content/`.
 * Trocar uma palavra exigia mexer no componente.
 *
 * Não sabe que janelas existem.
 */
const ReadmeApp = () => {
  const { language } = useLanguage()
  const t = getOsData(language).readme

  return (
    <div className="readme-app">
      <p className="readme-lead">{t.lead}</p>

      {/* OS DOIS `replace` DE `%d` SAÍRAM DAQUI, e a razão é de conteúdo: a seção
          que os usava — "E %d testes olham para tudo isso" — foi removida junto com
          a do shader, por decisão do dono do projeto ("isso não é algo
          importante"). Com ela saíram `SISTEMA.testes` e `SISTEMA.cenas`, e este
          componente voltou a ser o que devia ser: um mapeador de seções.

          Fica registrado o que aquele código protegia, porque a lição não morre com
          o texto: aquelas duas frases envelheceram erradas duas vezes, e foi por
          isso que os números passaram a ser derivados. Se algum dia voltar um número
          a este app, ele volta derivado. */}
      {t.sections.map((secao) => (
        <section className="readme-section" key={secao.title}>
          <h3 className="readme-section-title">{secao.title}</h3>
          <p className="readme-section-body">{secao.body}</p>
        </section>
      ))}

      <a className="readme-repo" href={REPO} target="_blank" rel="noopener noreferrer">
        <Github size={16} aria-hidden="true" />
        {t.repoLabel}
      </a>
    </div>
  )
}

export default ReadmeApp
