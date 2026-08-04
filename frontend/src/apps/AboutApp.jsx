import React, { Suspense, lazy, useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { getProfileData } from '../data/content'
import { getOsData } from '../data/os'
import { useDeviceMode } from '../os/useDeviceMode'
import DecryptedText from '../components/effects/DecryptedText'
import './AboutApp.css'

// three + @react-three/fiber + @react-three/drei são pesados demais pra
// entrar no bundle principal só por causa de um diálogo "Sobre". Carrega
// sob demanda e só em desktop (ver useDeviceMode mais abaixo).
const CrystalScene = lazy(() => import('../components/sections/CrystalScene'))

/**
 * "Sobre este PC" — o winver do NoiseOS: identidade + especificações.
 *
 * A piada é ler bio/skills como se fossem specs de hardware. Conteúdo vem
 * inteiro de getProfileData (mesma fonte do Profile.jsx da página clássica);
 * aqui só muda a moldura. Não sabe que janelas existem — sem título, sem
 * botão de fechar, sem posição.
 */
const AboutApp = () => {
  const { language } = useLanguage()
  const deviceMode = useDeviceMode()
  const profile = getProfileData(language)
  const os = getOsData(language)

  /**
   * PERFORMANCE: o cristal só monta depois que a janela pintou.
   *
   * Criar o contexto WebGL e montar o ambiente do material custa centenas de
   * milissegundos, e fazer isso no mesmo frame da abertura travava a janela
   * inteira. Adiando, a janela aparece na hora e o cristal preenche em seguida.
   *
   * É a mesma solução que o Profile.jsx da página clássica já usava, com o
   * comentário "Delay 3D Scene load to prevent startup freeze" — só que aqui o
   * gatilho é a abertura da janela, não a carga da página.
   */
  const [montarCristal, setMontarCristal] = useState(false)

  useEffect(() => {
    if (deviceMode !== 'desktop') return
    const id = setTimeout(() => setMontarCristal(true), 450)
    return () => clearTimeout(id)
  }, [deviceMode])

  // Igual ao Profile.jsx: tripliquei a lista pra garantir que o marquee de
  // 50% de translação nunca mostre buraco, mesmo se o container for mais
  // largo que uma cópia só da lista de skills.
  const scrollingSkills = [
    ...profile.skills_highlight,
    ...profile.skills_highlight,
    ...profile.skills_highlight,
  ]

  return (
    <div className="about-app">
      {/* --- IDENTIDADE: cristal (logo do sistema) + destaque --- */}
      <div className="about-identity">
        {deviceMode === 'desktop' && montarCristal && (
          <div className="about-crystal" role="img" aria-label={os.about.crystalAlt}>
            <Suspense fallback={<div className="about-crystal-fallback" aria-hidden="true" />}>
              <CrystalScene />
            </Suspense>
          </div>
        )}

        <div className="about-identity-text">
          <p className="about-kicker">{profile.title}</p>
          <p className="about-highlight">
            <DecryptedText
              text={profile.bio_highlight}
              speed={40}
              animateOn="view"
              revealDirection="start"
              useOriginalCharsOnly
            />
          </p>
        </div>
      </div>

      <p className="about-bio">{profile.bio_full}</p>

      {/* --- ESPECIFICAÇÕES: stats lidas como hardware --- */}
      <section className="about-section">
        <h3 className="about-section-title">{os.about.specsLabel}</h3>
        <div className="about-specs">
          {profile.stats.map((stat, index) => (
            <div className="about-spec-card" key={index}>
              <span className="about-spec-number">{stat.number}</span>
              <span className="about-spec-label">{stat.label}</span>
              <span className="about-spec-sublabel">{stat.sublabel}</span>
            </div>
          ))}
        </div>
      </section>

      {/* --- RECURSOS INSTALADOS: skills como marquee infinito --- */}
      <section className="about-section">
        <h3 className="about-section-title">{os.about.featuresLabel}</h3>
        <div className="about-features-wrapper">
          <div className="about-features-track">
            {scrollingSkills.map((skill, index) => (
              <span className="about-feature-chip" key={index}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutApp
