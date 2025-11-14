import React, { Suspense } from 'react';
import Spline from '@splinetool/react-spline';
import Particles from '../backgrounds/Particles';

export default function JourneySection() {
    return (
        <section className="journey-section">

            <div className="journey-background">
                <Particles
                    // --- VALORES ATUALIZADOS ---
                    particleCount={150}         // Mais partículas
                    particleSpread={7}
                    speed={0.2}                 // Um pouco mais rápidas
                    particleColors={['#FFFFFF']}
                    moveParticlesOnHover={true}
                    particleHoverFactor={0.2}
                    alphaParticles={true}      // <-- MUDADO: Serão quadrados (mais visíveis)
                    particleBaseSize={100}       // <-- MUDADO: Tamanho 5x maior
                    sizeRandomness={1}
                    cameraDistance={15}
                    disableRotation={false}
                />
            </div>

            <div className="journey-container">
                {/* Lado Esquerdo (Texto) */}
                <div className="journey-content-left">
                    <h1 className="journey-title">
                        Minha Jornada
                    </h1>
                    <p className="journey-description">
                        Uma linha do tempo interativa da minha evolução como profissional,
                        desde a universidade até minhas especializações em IA e Automação.
                    </p>
                </div>

                {/* Lado Direito (Cena 3D) */}
                <div className="journey-content-right">
                    <Suspense fallback={<div className="spline-loading">Carregando 3D...</div>}>
                        <Spline
                            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                            className="spline-canvas"
                        />
                    </Suspense>
                </div>
            </div>
        </section>
    );
}