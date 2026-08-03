import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'

/**
 * leia-me.txt — o portfólio como case técnico.
 *
 * Primeiro app do NoiseOS de propósito: é só texto, então serve para validar
 * o chrome de janela sem que bug de conteúdo se confunda com bug de sistema.
 * Não sabe que janelas existem.
 */
const ReadmeApp = () => {
  const { language } = useLanguage()

  const content = {
    pt: (
      <>
        <p>
          Além dos projetos listados, <strong>este próprio portfólio</strong> é um case
          técnico que demonstra competências em <strong>UX Design</strong>,{' '}
          <strong>Engenharia de Software</strong> e <strong>IA Generativa</strong>.
        </p>
        <p>
          O sistema opera sobre um backend em <strong>FastAPI</strong> que usa{' '}
          <strong>LangGraph</strong> para orquestrar agentes e uma arquitetura{' '}
          <strong>RAG</strong>, permitindo que o site responda perguntas com base em
          dados reais.
        </p>
        <p>
          Código aberto e documentado no{' '}
          <a href="https://github.com/Marocosz/Marocos-AI" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          .
        </p>
      </>
    ),
    en: (
      <>
        <p>
          Beyond the projects listed, <strong>this portfolio itself</strong> is a
          technical case study demonstrating skills in <strong>UX Design</strong>,{' '}
          <strong>Software Engineering</strong> and <strong>Generative AI</strong>.
        </p>
        <p>
          It runs on a <strong>FastAPI</strong> backend using <strong>LangGraph</strong>{' '}
          to orchestrate agents and a <strong>RAG</strong> architecture, letting the site
          answer questions from real data.
        </p>
        <p>
          Open source and documented on{' '}
          <a href="https://github.com/Marocosz/Marocos-AI" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          .
        </p>
      </>
    ),
  }

  return <div className="app-prose">{content[language] || content.en}</div>
}

export default ReadmeApp
