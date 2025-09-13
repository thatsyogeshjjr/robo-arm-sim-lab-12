import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';

interface RobotArm3DOFProps {
  jointAngles: [number, number, number];
  isPlaying: boolean;
  onSelect: (id: string, shiftPressed: boolean) => void;
  selectedComponents: string[];
}

export function RobotArm3DOF({ jointAngles, isPlaying, onSelect, selectedComponents }: RobotArm3DOFProps) {
  const armRef = useRef<Group>(null);
  const joint1Ref = useRef<Group>(null);
  const joint2Ref = useRef<Group>(null);
  const joint3Ref = useRef<Group>(null);
  
  const link1Length = 0.6;
  const link2Length = 0.6;
  const link3Length = 0.6;
  const baseHeight = 0.3;

  useFrame((state, delta) => {
    if (isPlaying && joint1Ref.current && joint2Ref.current && joint3Ref.current) {
      // Smooth joint movement
      const [θ1, θ2, θ3] = jointAngles.map(a => a * Math.PI / 180);
      
      joint1Ref.current.rotation.z = θ1;
      joint2Ref.current.rotation.z = θ2;
      joint3Ref.current.rotation.z = θ3;
    }
  });

  const getComponentColor = (partType: string, componentId: string) => {
    const isSelected = selectedComponents.includes(componentId);
    if (isSelected) return '#fbbf24';
    
    switch (partType) {
      case 'base': return '#4b5563';
      case 'link': return '#6b7280';
      case 'joint': return '#f97316';
      case 'gripper': return '#059669';
      case 'motor': return '#ef4444';
      case 'battery': return '#84cc16';
      default: return '#6b7280';
    }
  };

  const isComponentSelected = (componentId: string) => selectedComponents.includes(componentId);

  return (
    <group ref={armRef} position={[0, -1, 0]}>
      {/* Base */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect('base-3dof', e.shiftKey);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <cylinderGeometry args={[0.3, 0.3, baseHeight, 16]} />
        <meshStandardMaterial 
          color={getComponentColor('base', 'base-3dof')} 
          transparent={isComponentSelected('base-3dof')}
          opacity={isComponentSelected('base-3dof') ? 0.8 : 1}
        />
      </mesh>

      {/* Joint 1 (Base rotation) */}
      <group ref={joint1Ref} position={[0, baseHeight / 2, 0]}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelect('joint1-3dof', e.shiftKey);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'default';
          }}
        >
          <sphereGeometry args={[0.08, 16, 12]} />
          <meshStandardMaterial 
            color={getComponentColor('joint', 'joint1-3dof')} 
            transparent={isComponentSelected('joint1-3dof')}
            opacity={isComponentSelected('joint1-3dof') ? 0.8 : 1}
          />
        </mesh>

        {/* Link 1 */}
        <group position={[link1Length / 2, 0, 0]}>
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              onSelect('link1-3dof', e.shiftKey);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'default';
            }}
          >
            <boxGeometry args={[link1Length, 0.1, 0.1]} />
            <meshStandardMaterial 
              color={getComponentColor('link', 'link1-3dof')} 
              transparent={isComponentSelected('link1-3dof')}
              opacity={isComponentSelected('link1-3dof') ? 0.8 : 1}
            />
          </mesh>

          {/* Joint 2 */}
          <group ref={joint2Ref} position={[link1Length / 2, 0, 0]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelect('joint2-3dof', e.shiftKey);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'default';
              }}
            >
              <sphereGeometry args={[0.08, 16, 12]} />
              <meshStandardMaterial 
                color={getComponentColor('joint', 'joint2-3dof')} 
                transparent={isComponentSelected('joint2-3dof')}
                opacity={isComponentSelected('joint2-3dof') ? 0.8 : 1}
              />
            </mesh>

            {/* Link 2 */}
            <group position={[link2Length / 2, 0, 0]}>
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect('link2-3dof', e.shiftKey);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                  document.body.style.cursor = 'default';
                }}
              >
                <boxGeometry args={[link2Length, 0.08, 0.08]} />
                <meshStandardMaterial 
                  color={getComponentColor('link', 'link2-3dof')} 
                  transparent={isComponentSelected('link2-3dof')}
                  opacity={isComponentSelected('link2-3dof') ? 0.8 : 1}
                />
              </mesh>

              {/* Joint 3 */}
              <group ref={joint3Ref} position={[link2Length / 2, 0, 0]}>
                <mesh
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect('joint3-3dof', e.shiftKey);
                  }}
                  onPointerOver={(e) => {
                    e.stopPropagation();
                    document.body.style.cursor = 'pointer';
                  }}
                  onPointerOut={() => {
                    document.body.style.cursor = 'default';
                  }}
                >
                  <sphereGeometry args={[0.08, 16, 12]} />
                  <meshStandardMaterial 
                    color={getComponentColor('joint', 'joint3-3dof')} 
                    transparent={isComponentSelected('joint3-3dof')}
                    opacity={isComponentSelected('joint3-3dof') ? 0.8 : 1}
                  />
                </mesh>

                {/* Link 3 / End Effector */}
                <group position={[link3Length / 2, 0, 0]}>
                  <mesh
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect('link3-3dof', e.shiftKey);
                    }}
                    onPointerOver={(e) => {
                      e.stopPropagation();
                      document.body.style.cursor = 'pointer';
                    }}
                    onPointerOut={() => {
                      document.body.style.cursor = 'default';
                    }}
                  >
                    <boxGeometry args={[link3Length, 0.06, 0.06]} />
                    <meshStandardMaterial 
                      color={getComponentColor('link', 'link3-3dof')} 
                      transparent={isComponentSelected('link3-3dof')}
                      opacity={isComponentSelected('link3-3dof') ? 0.8 : 1}
                    />
                  </mesh>

                  {/* Gripper */}
                  <group position={[link3Length / 2, 0, 0]}>
                    <mesh
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect('gripper-3dof', e.shiftKey);
                      }}
                      onPointerOver={(e) => {
                        e.stopPropagation();
                        document.body.style.cursor = 'pointer';
                      }}
                      onPointerOut={() => {
                        document.body.style.cursor = 'default';
                      }}
                    >
                      <boxGeometry args={[0.1, 0.05, 0.1]} />
                      <meshStandardMaterial 
                        color={getComponentColor('gripper', 'gripper-3dof')} 
                        transparent={isComponentSelected('gripper-3dof')}
                        opacity={isComponentSelected('gripper-3dof') ? 0.8 : 1}
                      />
                    </mesh>

                    {/* Payload visualization */}
                    <mesh position={[0, -0.1, 0]}>
                      <boxGeometry args={[0.08, 0.08, 0.08]} />
                      <meshStandardMaterial 
                        color="#ec4899" 
                        transparent 
                        opacity={0.7}
                        wireframe
                      />
                    </mesh>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}