import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { RobotComponent as RobotComponentType } from '@/types/robotics';

interface RobotComponentProps {
  component: RobotComponentType;
  onSelect: (id: string, shiftPressed: boolean) => void;
  isPlaying: boolean;
}

export function RobotComponent({ component, onSelect, isPlaying }: RobotComponentProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (isPlaying && meshRef.current && component.type === 'joint') {
      // Simple rotation animation for joints
      meshRef.current.rotation.z += delta * 0.5;
    }
  });

  const getComponentColor = () => {
    if (component.selected) return '#fbbf24';
    
    switch (component.type) {
      case 'base': return '#4b5563';
      case 'link': return '#6b7280';
      case 'joint': return '#f97316';
      case 'motor': return '#ef4444';
      case 'gearbox': return '#8b5cf6';
      case 'gripper': return '#059669';
      case 'sensor': return '#06b6d4';
      case 'battery': return '#84cc16';
      case 'electronics': return '#f59e0b';
      case 'load': return '#ec4899';
      default: return '#6b7280';
    }
  };

  const getComponentMaterial = () => {
    const color = getComponentColor();
    const isMotor = component.type === 'motor';
    const isLink = component.type === 'link';
    
    if (isMotor || isLink) {
      return (
        <meshStandardMaterial 
          color={color} 
          transparent={component.selected}
          opacity={component.selected ? 0.8 : 0.9}
          wireframe={isMotor || isLink}
        />
      );
    }
    
    return (
      <meshStandardMaterial 
        color={color} 
        transparent={component.selected}
        opacity={component.selected ? 0.8 : 1}
      />
    );
  };

  const getComponentGeometry = () => {
    const { dimensions, shape } = component.parameters;
    
    switch (shape) {
      case 'sphere':
        return (
          <sphereGeometry args={[dimensions.radius || dimensions.width / 2, 16, 12]} />
        );
      case 'cylinder':
        return (
          <cylinderGeometry 
            args={[
              dimensions.radius || dimensions.width / 2, 
              dimensions.radius || dimensions.width / 2, 
              dimensions.height, 
              16
            ]} 
          />
        );
      case 'box':
      default:
        return (
          <boxGeometry args={[dimensions.length, dimensions.width, dimensions.height]} />
        );
    }
  };

  return (
    <group position={component.position} rotation={component.rotation}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(component.id, e.shiftKey);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        {getComponentGeometry()}
        {getComponentMaterial()}
      </mesh>
      
      {/* Render children recursively */}
      {component.children.map((child) => (
        <RobotComponent
          key={child.id}
          component={child}
          onSelect={onSelect}
          isPlaying={isPlaying}
        />
      ))}
    </group>
  );
}