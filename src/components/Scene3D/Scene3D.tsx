import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

function Box(props: any) {
  const mesh = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  const { color } = useStore();

  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : props.color || color} roughness={0.1} metalness={0.5} />
      {active && <Edges color="white" />}
    </mesh>
  )
}

function Sphere(props: any) {
  const mesh = useRef<THREE.Mesh>(null!);
  const { color } = useStore();
  const [hovered, setHover] = useState(false);
  
  return (
    <mesh
      {...props}
      ref={mesh}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <sphereGeometry args={[0.6, 32, 32]} />
      <meshStandardMaterial color={hovered ? 'cyan' : props.color || color} roughness={0.2} metalness={0.8} />
    </mesh>
  )
}

export function Scene3D() {
  const { handMode, gesture, cursor, tool } = useStore();

  return (
    <div className="w-full h-full absolute inset-0 bg-zinc-950">
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
        <color attach="background" args={['#09090b']} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Box position={[-1.2, 0, 0]} color="#f43f5e" />
        <Box position={[1.2, 0, 0]} color="#3b82f6" />
        <Sphere position={[0, 1.5, 0]} color="#10b981" />
        
        <Grid 
          infiniteGrid 
          fadeDistance={30} 
          sectionColor="#27272a" 
          cellColor="#18181b"
          position={[0, -0.5, 0]}
        />
        
        <Environment preset="city" />
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
      </Canvas>
      
      {/* 3D UI Overlay */}
      <div className="absolute top-4 left-4 text-xs font-mono text-zinc-500 pointer-events-none">
        <p>3D AIR MODE</p>
        <p className="text-zinc-600 mt-1">Use Two Hands to rotate and scale</p>
      </div>
    </div>
  );
}
