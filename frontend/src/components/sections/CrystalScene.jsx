import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer, Sparkles } from '@react-three/drei';

/**
 * ESTÁTICO POR DECISÃO DE PERFORMANCE.
 *
 * Antes o cristal girava via useFrame e flutuava via <Float>, o que mantinha
 * um loop de render de WebGL vivo permanentemente — somado ao shader do
 * wallpaper, era GPU demais e a interface engasgava. Agora a cena renderiza
 * uma vez (`frameloop="demand"`) numa pose fixa e escolhida.
 *
 * Para voltar a animar: reintroduzir useFrame/<Float> e trocar o frameloop
 * para "always".
 */
const CrystalMesh = () => {
    return (
        // Pose fixa: leve giro no Y e inclinação no X para as facetas pegarem
        // a luz, em vez de ficar de frente e chapado.
        <mesh rotation={[0.14, 0.6, 0.05]} scale={[0.7, 1.8, 0.7]}>
            {/* Icosaedro oferece várias faces orgânicas (quartzo/bruto) */}
            {/* Scale ajustado para ser fino (y=1.8) mas nem tanto (x/z=0.8) */}
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
                chromaticAberration={0.06}
            />
        </mesh>
    );
};

const CrystalScene = () => {
  return (
    <div style={{ 
      width: '700px', 
      height: '700px', 
      position: 'absolute', 
      top: '40%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)', 
      zIndex: 10,
      pointerEvents: 'none' // Permite clicar ao redor/atrás
    }}>
      {/* Canvas isolado */}
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        // PERFORMANCE: renderiza sob demanda em vez de manter loop vivo.
        // Com a cena estática, um único frame basta — o loop contínuo estava
        // disputando GPU com o shader do wallpaper.
        frameloop="demand"
        // Clampa o pixel ratio entre 1 e 1.5, evitando renderizar 3x ou 4x
        // pixels em telas Retina (economia de bateria/GPU).
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false, // Desliga stencil buffer pra economizar memória
          depth: true
        }}
      >
        {/* Ambiente PROCEDURAL, montado na GPU.
         *
         * Antes era <Environment preset="city" />, que baixava um .hdr de
         * raw.githubusercontent.com no instante em que a janela abria: um
         * travão de ~3s medido, e uma dependência de rede externa em runtime —
         * offline ou com o GitHub bloqueado, o cristal não renderizava.
         *
         * Estes Lightformers dão o mesmo trabalho ao material `transmission`
         * (algo para refletir e refratar) sem buscar nada. */}
        <Environment resolution={128}>
          <Lightformer
            intensity={2.4}
            position={[0, 4, -9]}
            scale={[12, 12, 1]}
            color="#ffffff"
          />
          <Lightformer
            intensity={1.6}
            position={[-6, 1, 2]}
            scale={[10, 3, 1]}
            color="#a855f7"
          />
          <Lightformer
            intensity={1.1}
            position={[6, -2, 2]}
            scale={[10, 3, 1]}
            color="#4c1d95"
          />
        </Environment>

        <ambientLight intensity={0.6} />
        <spotLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-5, -5, 5]} intensity={1} color="#a855f7" />

        <CrystalMesh />

        {/* Brilhos em volta do objeto. speed=0 porque a cena é estática: com
            frameloop="demand" um valor maior só renderizaria o primeiro
            instante da animação e pararia, sem ganho visual. */}
        <Sparkles
            count={28}
            scale={3}
            size={3}
            speed={0}
            opacity={0.6}
            color="#d8b4fe"
        />

      </Canvas>
    </div>
  );
};

export default CrystalScene;
