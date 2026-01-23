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
        <mesh ref={meshRef}>
            {/* Icosaedro oferece várias faces orgânicas (quartzo/bruto) */}
            {/* Scale ajustado para ser fino (y=1.8) mas nem tanto (x/z=0.8) */}
            <icosahedronGeometry args={[1, 0]} /> 
            <meshPhysicalMaterial 
                color="#6b24b7" // Roxo pálido (lavanda)
                emissive="#090909" // Brilho roxo suave
                emissiveIntensity={0.2}
                roughness={0.15} // Fosco acetinado para parecer orgânico
                metalness={0.1}
                transmission={1.0} // Transparente (Vidro)
                thickness={2.0}
                ior={1.4} 
                clearcoat={1}
                chromaticAberration={0.04}
            />
        </mesh>
    );
};

const CrystalScene = () => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '100%', position: 'relative', zIndex: 10 }}>
      {/* Canvas isolado */}
      <Canvas 
        camera={{ position: [0, 0, 4], fov: 45 }} 
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
            floatIntensity={1.2} 
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
