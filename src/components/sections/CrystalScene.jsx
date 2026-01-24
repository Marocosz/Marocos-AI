import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, Sparkles } from '@react-three/drei';

const CrystalMesh = () => {
    const meshRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (meshRef.current) {
            // Rotação orgânica e contínua
            meshRef.current.rotation.y = t * 0.2;
            meshRef.current.rotation.x = Math.cos(t * 0.3) * 0.1;
            meshRef.current.rotation.z = Math.sin(t * 0.2) * 0.05;
        }
    });

    return (
        <mesh ref={meshRef} scale={[0.7, 1.8, 0.7]}>
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
        // PERFORMANCE FIX: Clampa o pixel ratio entre 1 e 1.5. 
        // Evita renderizar 3x ou 4x pixels em telas Retina/Mobile high-end (economia de bateria/GPU).
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        <Environment preset="city" />

        <ambientLight intensity={0.6} />
        <spotLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-5, -5, 5]} intensity={1} color="#a855f7" />

        {/* Grupo Flutuante (Sobe e Desce) */}
        <Float 
            speed={2} 
            rotationIntensity={0} 
            floatIntensity={1} 
        >
            <CrystalMesh />
        </Float>

        {/* Brilhos (Pontos) flutuando EM VOLTA do objeto */}
        <Sparkles 
            count={40}
            scale={3}
            size={3}
            speed={0.5}
            opacity={0.6}
            color="#d8b4fe"
        />

      </Canvas>
    </div>
  );
};

export default CrystalScene;
