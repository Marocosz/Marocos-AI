import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment, Lightformer, Sparkles } from '@react-three/drei'

/**
 * CRISTAL — a marca 3D do sistema, reutilizável.
 * --------------------------------------------------
 * Mesma geometria, mesmo material e mesma luz do cristal que está em produção.
 * O que muda é só o invólucro.
 *
 * A versão de produção era um <div> de 700x700 posicionado em `absolute` com
 * top/left/transform chumbados, que transbordava o container de propósito e
 * obrigava cada consumidor a inventar um recorte. Aqui o componente é um bloco
 * comum do tamanho que você pedir: quem posiciona é quem usa.
 *
 * POR QUE QUADRADO: o visível na horizontal é proporcional à largura da caixa,
 * então numa caixa estreita e alta o cristal encostaria nas bordas laterais.
 * Canvas quadrado dá o mesmo enquadramento em qualquer tamanho. O cálculo da
 * distância da câmera está em DISTANCIA_CAMERA, abaixo.
 *
 *   <Crystal size={220} />            estático, sem loop de render
 *   <Crystal size={320} animated />   girando e flutuando, como em produção
 *   <Crystal size={140} sparkles={false} />
 */

// Pose de repouso: leve giro no Y e inclinação no X para as facetas pegarem a
// luz. Sem isto o cristal estático fica de frente e chapado.
const POSE_PARADA = [0.14, 0.6, 0.05]

/**
 * Distância da câmera, escolhida por conta e não por tentativa.
 *
 * A malha tem meia-altura 1.8 (escala y) e meia-largura 0.7. Com fov 45, o
 * visível no plano do objeto é tan(22.5°) x z. Em z=7 dava ±2.90, e o cristal
 * ocupava apenas 62% da altura e 24% da largura da caixa — muito canvas vazio,
 * e é por isso que ele lia como pequeno mesmo com `size` grande.
 *
 * Em z=5.6 o visível cai para ±2.32: o cristal passa a ocupar 78% da altura, e
 * os Sparkles (que se espalham até 1.5) ficam em 65% — ainda dentro do quadro,
 * sem encostar na borda.
 */
const DISTANCIA_CAMERA = 5.6

const CrystalMesh = ({ animated, spin }) => {
  const meshRef = useRef()

  useFrame((state) => {
    if (!animated || !meshRef.current) return
    // Rotação orgânica e contínua — os mesmos coeficientes da produção,
    // multiplicados por `spin`. Em spin=1 o comportamento é idêntico ao de lá.
    const t = state.clock.getElapsedTime() * spin
    meshRef.current.rotation.y = t * 0.2
    meshRef.current.rotation.x = Math.cos(t * 0.3) * 0.1
    meshRef.current.rotation.z = Math.sin(t * 0.2) * 0.05
  })

  return (
    <mesh ref={meshRef} rotation={animated ? undefined : POSE_PARADA} scale={[0.7, 1.8, 0.7]}>
      {/* Icosaedro dá as faces irregulares de quartzo bruto. Fino em x/z,
          alongado em y. */}
      <icosahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial
        color="#6b24b7"
        emissive="#090909"
        emissiveIntensity={0.2}
        roughness={0.15}
        metalness={0.1}
        transmission={1.0}
        thickness={2.0}
        ior={1.5}
        clearcoat={1}
        /* A produção também passava chromaticAberration={0.06} aqui. Essa prop
           é do MeshTransmissionMaterial do drei, não do meshPhysicalMaterial do
           three — ela vinha sendo ignorada silenciosamente. Removida por ser
           inerte; para ter aberração de verdade seria preciso trocar o
           material, o que mudaria o visual. */
      />
    </mesh>
  )
}

const Crystal = ({
  size = 260,
  animated = false,
  /**
   * Multiplicador da rotação. Em 1 o giro é o da produção: 0.2 rad/s, ou seja
   * 48 graus em quatro segundos — organico para um objeto em repouso numa
   * pagina, mas perto de imperceptivel numa tela de boot, onde o movimento
   * PRECISA comunicar que o sistema esta trabalhando.
   */
  spin = 1,
  sparkles = true,
  className = '',
}) => {
  return (
    <div
      className={`crystal-3d ${className}`.trim()}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, DISTANCIA_CAMERA], fov: 45 }}
        /* Parado, renderiza um frame e dorme: 0% de GPU em repouso. */
        frameloop={animated ? 'always' : 'demand'}
        /* Clampa o pixel ratio: evita renderizar 3x ou 4x pixels em telas
           Retina, o que é puro desperdício num objeto translúcido e difuso. */
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
      >
        {/* AMBIENTE PROCEDURAL, montado na GPU.
         *
         * A produção usa <Environment preset="city" />, que baixa um .hdr de
         * raw.githubusercontent.com no instante em que o componente monta:
         * medi ~3,3s de travamento, e é uma dependência de rede externa em
         * runtime — offline, ou com o GitHub bloqueado, o cristal não
         * renderiza.
         *
         * Estes Lightformers dão ao material `transmission` o que ele precisa
         * (algo para refletir e refratar) sem buscar nada. O reflexo não é
         * pixel a pixel o mesmo do HDR de cidade, mas a leitura é a mesma:
         * uma fonte ampla e clara em cima, e dois realces coloridos nas
         * laterais. */}
        <Environment resolution={128}>
          <Lightformer intensity={2.4} position={[0, 4, -9]} scale={[12, 12, 1]} color="#ffffff" />
          <Lightformer intensity={1.6} position={[-6, 1, 2]} scale={[10, 3, 1]} color="#a855f7" />
          <Lightformer intensity={1.1} position={[6, -2, 2]} scale={[10, 3, 1]} color="#4c1d95" />
        </Environment>

        <ambientLight intensity={0.6} />
        <spotLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-5, -5, 5]} intensity={1} color="#a855f7" />

        {/* O <Float> fica SEMPRE na arvore, mesmo parado.
         *
         * Antes ele so era montado quando `animated`, e alternar a prop
         * mudava a estrutura do JSX: o mesh desmontava e remontava, obrigando
         * o three a recompilar o material de transmissao. Isso aparecia como
         * um frame de meio segundo exatamente quando a tela de bloqueio
         * comecava a subir — o pior momento possivel.
         *
         * Com frameloop="demand" o useFrame do Float simplesmente nao roda,
         * entao manter o componente montado custa nada e a arvore fica
         * estavel entre os dois estados. */}
        <Float
          speed={animated ? 2 : 0}
          rotationIntensity={0}
          floatIntensity={animated ? 1 : 0}
        >
          <CrystalMesh animated={animated} spin={spin} />
        </Float>

        {sparkles && (
          <Sparkles
            count={40}
            scale={3}
            size={3}
            /* Parado, speed=0: com frameloop="demand" um valor maior só
               congelaria no primeiro instante da animação, sem ganho. */
            speed={animated ? 0.5 : 0}
            opacity={0.6}
            color="#d8b4fe"
          />
        )}
      </Canvas>
    </div>
  )
}

export default Crystal
