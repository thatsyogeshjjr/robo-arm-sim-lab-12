import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import { RobotArm3DOF } from './RobotArm3DOF';
import { RobotComponent as RobotComponentType } from '@/types/robotics';

interface Scene3DProps {
  components: RobotComponentType[];
  onSelectComponent: (id: string, shiftPressed: boolean) => void;
  isPlaying: boolean;
  jointAngles?: [number, number, number];
  selectedComponents: string[];
}

export function Scene3D({ components, onSelectComponent, isPlaying, jointAngles = [0, 0, 0], selectedComponents }: Scene3DProps) {
  return (
    <div className="w-full h-full bg-background border-r border-border">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 60 }}
        shadows
        style={{ background: 'var(--gradient-mesh)' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.3} />

        {/* Environment */}
        <Environment preset="city" background={false} />
        
        {/* Grid */}
        <Grid
          args={[20, 20]}
          position={[0, -2, 0]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#6b7280"
          sectionSize={2.5}
          sectionThickness={1}
          sectionColor="#4b5563"
          fadeDistance={25}
          fadeStrength={1}
        />

        {/* Component placement guidelines */}
        <group position={[0, -1.5, 0]}>
          {/* Base area indicator */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2, 0.05, 2]} />
            <meshStandardMaterial 
              color="#374151" 
              transparent 
              opacity={0.3}
              wireframe
            />
          </mesh>
          
          {/* Battery compartment indicators */}
          <mesh position={[-0.5, 0.5, 0.3]}>
            <boxGeometry args={[0.4, 0.3, 0.6]} />
            <meshStandardMaterial 
              color="#84cc16" 
              transparent 
              opacity={0.2}
              wireframe
            />
          </mesh>
          
          <mesh position={[0.5, 0.5, 0.3]}>
            <boxGeometry args={[0.4, 0.3, 0.6]} />
            <meshStandardMaterial 
              color="#84cc16" 
              transparent 
              opacity={0.2}
              wireframe
            />
          </mesh>
          
          {/* Arm link mounting point */}
          <mesh position={[0, 0.8, -0.4]}>
            <cylinderGeometry args={[0.1, 0.1, 0.6]} />
            <meshStandardMaterial 
              color="#6b7280" 
              transparent 
              opacity={0.2}
              wireframe
            />
          </mesh>
        </group>

        {/* 3DOF Robotic Arm */}
        <RobotArm3DOF
          jointAngles={jointAngles}
          isPlaying={isPlaying}
          onSelect={onSelectComponent}
          selected={selectedComponents.length > 0}
        />

        {/* Trajectory Visualization */}
        {isPlaying && (
          <group>
            {/* End effector path trace */}
            <mesh position={[
              0.6 * Math.cos(jointAngles[0] * Math.PI / 180) + 
              0.6 * Math.cos((jointAngles[0] + jointAngles[1]) * Math.PI / 180) + 
              0.6 * Math.cos((jointAngles[0] + jointAngles[1] + jointAngles[2]) * Math.PI / 180),
              -1 + 0.3 + 
              0.6 * Math.sin(jointAngles[0] * Math.PI / 180) + 
              0.6 * Math.sin((jointAngles[0] + jointAngles[1]) * Math.PI / 180) + 
              0.6 * Math.sin((jointAngles[0] + jointAngles[1] + jointAngles[2]) * Math.PI / 180),
              0
            ]}>
              <sphereGeometry args={[0.02, 8, 6]} />
              <meshStandardMaterial color="#00ff00" transparent opacity={0.6} />
            </mesh>
          </group>
        )}

        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={20}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}