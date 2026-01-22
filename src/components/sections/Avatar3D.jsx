import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Componente da Boca (Barras de Voz)
const MouthBar = ({ position, index }) => {
  const barRef = useRef();
  useFrame((state) => {
    // Animação de equalizador
    if (barRef.current) {
      const time = state.clock.getElapsedTime();
      barRef.current.scale.y = 0.5 + Math.abs(Math.sin(time * 8 + index * 2)) * 0.8;
    }
  });

  return (
    <mesh ref={barRef} position={position}>
      <boxGeometry args={[0.06, 0.3, 0.02]} />
      <meshBasicMaterial color="#a855f7" />
    </mesh>
  );
};

const RobotHead = () => {
  const headGroup = useRef();
  const scannerRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const { x, y } = state.pointer;

    if (headGroup.current) {
      // Flutuação mais lenta e pesada
      headGroup.current.position.y = Math.sin(time * 1) * 0.1;
      
      // Rotação suave olhando para o mouse
      headGroup.current.rotation.y = THREE.MathUtils.lerp(headGroup.current.rotation.y, x * 0.6, 0.1);
      headGroup.current.rotation.x = THREE.MathUtils.lerp(headGroup.current.rotation.x, -y * 0.4, 0.1);
    }

    // Scanner dos olhos mais rápido
    if (scannerRef.current) {
      scannerRef.current.position.x = Math.sin(time * 5) * 0.55;
    }
  });

  // MATERIAIS AJUSTADOS (Mais claros para pegar luz)
  const materials = useMemo(() => ({
    // Cinza Chumbo (não preto) para ver a forma
    mainArmor: new THREE.MeshStandardMaterial({ 
      color: "#2a2a2a", roughness: 0.3, metalness: 0.8 
    }),
    // Detalhes em cinza mais claro
    lightArmor: new THREE.MeshStandardMaterial({ 
      color: "#4a4a4a", roughness: 0.5, metalness: 0.6 
    }),
    // Vidro do visor
    visorGlass: new THREE.MeshPhysicalMaterial({ 
      color: "#000", roughness: 0.1, metalness: 0.9, transmission: 0, opacity: 0.95
    }),
    // Luzes Neon
    neonRed: new THREE.MeshBasicMaterial({ color: "#ff2a2a" }),
    neonPurple: new THREE.MeshBasicMaterial({ color: "#c084fc" })
  }), []);

  return (
    <group ref={headGroup}>
      {/* --- ESTRUTURA PRINCIPAL (CRÂNIO) --- */}
      <mesh material={materials.mainArmor}>
        <boxGeometry args={[1.4, 1.6, 1.2]} />
      </mesh>

      {/* --- FACEPLATE (PLACA FRONTAL) --- */}
      {/* Adiciona profundidade na frente */}
      <mesh position={[0, -0.2, 0.15]} material={materials.lightArmor}>
        <boxGeometry args={[1.2, 1.4, 1.2]} />
      </mesh>

      {/* --- MOICANO "HEAT SINK" (DISSIPADOR) --- */}
      <group position={[0, 0.85, 0]}>
         {/* Base do Moicano (Canaleta) */}
         <mesh position={[0, 0, 0]} material={materials.lightArmor}>
            <boxGeometry args={[0.4, 0.2, 1.3]} />
         </mesh>
         
         {/* Lâminas Neon (Crista) */}
         {Array.from({ length: 6 }).map((_, i) => (
            <mesh key={i} position={[0, 0.2 + (i%2)*0.05, -0.5 + i*0.2]}>
              {/* Lâminas inclinadas para parecer aerodinâmico */}
              <boxGeometry args={[0.1, 0.4, 0.15]} />
              <meshBasicMaterial color={i === 5 ? "#ff2a2a" : "#a855f7"} /> 
              {/* A última lâmina é vermelha, o resto roxa */}
            </mesh>
         ))}
      </group>

      {/* --- FONES DE OUVIDO (EAR MUFFS) --- */}
      <mesh position={[0.8, 0, 0]} material={materials.lightArmor}>
         <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} rotation={[0, 0, Math.PI/2]} />
      </mesh>
      <mesh position={[-0.8, 0, 0]} material={materials.lightArmor}>
         <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} rotation={[0, 0, Math.PI/2]} />
      </mesh>
      {/* Antena esquerda */}
      <mesh position={[0.8, 0.4, 0]}>
         <boxGeometry args={[0.1, 0.6, 0.1]} />
         <meshStandardMaterial color="#666" />
      </mesh>

      {/* --- VISOR (OLHOS) --- */}
      <group position={[0, 0.1, 0.76]}>
        {/* Moldura do Visor */}
        <mesh position={[0, 0, 0]} material={materials.mainArmor}>
           <boxGeometry args={[1.3, 0.45, 0.1]} />
        </mesh>
        {/* Vidro Preto */}
        <mesh position={[0, 0, 0.02]} material={materials.visorGlass}>
           <planeGeometry args={[1.1, 0.25]} />
        </mesh>
        {/* Scanner Vermelho */}
        <mesh ref={scannerRef} position={[0, 0, 0.03]}>
           <planeGeometry args={[0.15, 0.15]} />
           <primitive object={materials.neonRed} />
        </mesh>
      </group>

      {/* --- BOCA (EQUALIZADOR) --- */}
      <group position={[0, -0.5, 0.76]}>
        {/* Caixa preta de fundo */}
        <mesh position={[0, 0, -0.01]}>
           <planeGeometry args={[0.8, 0.35]} />
           <meshBasicMaterial color="#000" />
        </mesh>
        
        {/* Barras de voz */}
        {[-0.25, -0.12, 0, 0.12, 0.25].map((x, i) => (
           <MouthBar key={i} position={[x, 0, 0]} index={i} />
        ))}
      </group>

    </group>
  );
};

const Avatar3D = () => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '300px', position: 'relative', zIndex: 10 }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }} gl={{ alpha: true, antialias: true }}>
        
        {/* --- LUZ AMBIENTE FORTE (Base) --- */}
        {/* Garante que nada fique 100% preto */}
        <ambientLight intensity={1.5} color="#404040" />

        {/* --- KEY LIGHT (Luz Principal) --- */}
        {/* Ilumina a frente e o lado direito do rosto */}
        <spotLight 
          position={[3, 2, 4]} 
          angle={0.6} 
          penumbra={0.5} 
          intensity={4} 
          color="#ffffff" 
        />

        {/* --- FILL LIGHT (Preenchimento Roxo) --- */}
        {/* Ilumina as sombras do lado esquerdo para não sumirem */}
        <pointLight position={[-3, 0, 2]} intensity={2} color="#a855f7" />

        {/* --- RIM LIGHT (Recorte Superior) --- */}
        {/* Destaca o topo e o moicano contra o fundo */}
        <spotLight position={[0, 5, -2]} intensity={5} color="#ffffff" />

        <RobotHead />
      </Canvas>
    </div>
  );
};

export default Avatar3D;