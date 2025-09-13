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
          selectedComponents={selectedComponents}
        />

        {/* Additional Components */}
        {components.map((component) => {
          // Skip components that are part of the 3DOF arm visual (they're rendered by RobotArm3DOF)
          if (['base-3dof', 'joint1-3dof', 'joint2-3dof', 'joint3-3dof', 'link1-3dof', 'link2-3dof', 'link3-3dof', 'gripper-3dof'].includes(component.id)) {
            return null;
          }
          
          const isSelected = selectedComponents.includes(component.id);
          
          return (
            <group key={component.id} position={component.position} rotation={component.rotation}>
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectComponent(component.id, e.shiftKey);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                  document.body.style.cursor = 'default';
                }}
              >
                {component.parameters.shape === 'sphere' && (
                  <sphereGeometry args={[component.parameters.dimensions.radius || 0.1, 16, 12]} />
                )}
                {component.parameters.shape === 'cylinder' && (
                  <cylinderGeometry args={[
                    component.parameters.dimensions.radius || component.parameters.dimensions.width / 2,
                    component.parameters.dimensions.radius || component.parameters.dimensions.width / 2,
                    component.parameters.dimensions.height,
                    16
                  ]} />
                )}
                {component.parameters.shape === 'box' && (
                  <boxGeometry args={[
                    component.parameters.dimensions.length,
                    component.parameters.dimensions.width,
                    component.parameters.dimensions.height
                  ]} />
                )}
                <meshStandardMaterial 
                  color={isSelected ? '#fbbf24' : 
                    component.type === 'battery' ? '#84cc16' : 
                    component.type === 'motor' ? '#ef4444' :
                    component.type === 'load' ? '#ec4899' : '#6b7280'}
                  transparent={isSelected}
                  opacity={isSelected ? 0.8 : 1}
                />
              </mesh>
            </group>
          );
        })}

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