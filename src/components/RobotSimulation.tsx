import { useState, useCallback, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Scene3D } from './simulation/Scene3D';
import { MechanicalSidebar } from './panels/MechanicalSidebar';
import { EnhancedDetailsPanel } from './panels/EnhancedDetailsPanel';
import { useRobotPhysics } from '@/hooks/useRobotPhysics';
import { RobotComponent, SimulationState, AllParameters, BaseParameters, JointParameters, MotorParameters, BatteryParameters, ComponentParameters } from '@/types/robotics';

// Create standard 3DOF robotic arm configuration
const create3DOFRobotArm = (): RobotComponent[] => {
  return [
    // Base Platform
    {
      id: 'base-3dof',
      type: 'base',
      name: '3DOF Base Platform',
      position: [0, -1, 0],
      rotation: [0, 0, 0],
      selected: false,
      parameters: {
        dimensions: { 
          length: 0.6, 
          width: 0.6, 
          height: 0.3, 
          cornerRadius: 0.05,
          filletSize: 0.02 
        },
        weight: 8.0,
        maxVelocity: 0,
        maxTorque: 0,
        shape: 'cylinder',
        material: {
          youngsModulus: 200e9,
          poissonRatio: 0.3,
          density: 7850,
        },
        mountingType: 'fixed',
        centerOfGravity: [0, 0, 0],
        dampingCoefficient: 0.1,
        frictionCoefficient: 0.8,
      } as BaseParameters,
      children: [],
    },
    // Joint 1 (Base Rotation)
    {
      id: 'joint1-3dof',
      type: 'joint',
      name: 'Base Rotation Joint',
      position: [0, -0.7, 0],
      rotation: [0, 0, 0],
      selected: false,
      parameters: {
        dimensions: { 
          length: 0.16, 
          width: 0.16, 
          height: 0.16, 
          radius: 0.08,
          cornerRadius: 0.02,
          filletSize: 0.01
        },
        weight: 1.2,
        maxVelocity: 3.14, // rad/s
        maxTorque: 15,
        shape: 'sphere',
        material: {
          youngsModulus: 200e9,
          poissonRatio: 0.3,
          density: 7850,
        },
        jointType: 'rotational',
        minAngle: -180,
        maxAngle: 180,
        currentAngle: 0,
        resolution: 4096,
        backlash: 0.05,
        maxAngularVelocity: 180,
        staticFriction: 0.1,
        dynamicFriction: 0.05,
        powerTransmission: 'gear',
      } as JointParameters,
      children: [],
    },
    // Joint 2 (Shoulder)
    {
      id: 'joint2-3dof',
      type: 'joint',
      name: 'Shoulder Joint',
      position: [0.6, -0.7, 0],
      rotation: [0, 0, 0],
      selected: false,
      parameters: {
        dimensions: { 
          length: 0.16, 
          width: 0.16, 
          height: 0.16, 
          radius: 0.08,
          cornerRadius: 0.02,
          filletSize: 0.01
        },
        weight: 1.0,
        maxVelocity: 3.14,
        maxTorque: 15,
        shape: 'sphere',
        material: {
          youngsModulus: 200e9,
          poissonRatio: 0.3,
          density: 7850,
        },
        jointType: 'rotational',
        minAngle: -90,
        maxAngle: 90,
        currentAngle: 0,
        resolution: 4096,
        backlash: 0.05,
        maxAngularVelocity: 180,
        staticFriction: 0.1,
        dynamicFriction: 0.05,
        powerTransmission: 'gear',
      } as JointParameters,
      children: [],
    },
    // Joint 3 (Elbow)
    {
      id: 'joint3-3dof',
      type: 'joint',
      name: 'Elbow Joint',
      position: [1.2, -0.7, 0],
      rotation: [0, 0, 0],
      selected: false,
      parameters: {
        dimensions: { 
          length: 0.16, 
          width: 0.16, 
          height: 0.16, 
          radius: 0.08,
          cornerRadius: 0.02,
          filletSize: 0.01
        },
        weight: 0.8,
        maxVelocity: 4.71,
        maxTorque: 15,
        shape: 'sphere',
        material: {
          youngsModulus: 200e9,
          poissonRatio: 0.3,
          density: 7850,
        },
        jointType: 'rotational',
        minAngle: -135,
        maxAngle: 135,
        currentAngle: 0,
        resolution: 4096,
        backlash: 0.05,
        maxAngularVelocity: 270,
        staticFriction: 0.1,
        dynamicFriction: 0.05,
        powerTransmission: 'gear',
      } as JointParameters,
      children: [],
    },
    // Battery System
    {
      id: 'battery-3dof',
      type: 'battery',
      name: '20V Li-ion Battery Pack',
      position: [-0.3, -0.8, 0.2],
      rotation: [0, 0, 0],
      selected: false,
      parameters: {
        dimensions: { 
          length: 0.2, 
          width: 0.15, 
          height: 0.1, 
          cornerRadius: 0.01,
          filletSize: 0.005
        },
        weight: 1.2,
        maxVelocity: 0,
        maxTorque: 0,
        shape: 'box',
        material: {
          youngsModulus: 70e9,
          poissonRatio: 0.3,
          density: 2700,
        },
        chemistry: 'li_ion',
        nominalVoltage: 20.0,
        capacity: 3000, // mAh
        maxContinuousCurrent: 15,
        peakCurrent: 45,
        internalResistance: 15, // mΩ
        dischargeRate: 5, // 5C rating
      } as BatteryParameters,
      children: [],
    },
  ];
};

export function RobotSimulation() {
  const [simulationState, setSimulationState] = useState<SimulationState & { physics?: any }>({
    components: create3DOFRobotArm(),
    selectedComponents: [],
    isPlaying: false,
    speed: 1.0,
  });

  const { physicsState, updatePhysics, resetPhysics } = useRobotPhysics(simulationState.components);

  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

  // Sync physics state with simulation state
  useEffect(() => {
    setSimulationState(prev => ({
      ...prev,
      physics: physicsState
    }));
  }, [physicsState]);

  // Update physics when playing
  useEffect(() => {
    if (simulationState.isPlaying) {
      const interval = setInterval(() => {
        const time = Date.now() * 0.001;
        updatePhysics([
          Math.sin(time * 0.5) * 30, // Joint 1: ±30°
          Math.sin(time * 0.3) * 45, // Joint 2: ±45°
          Math.sin(time * 0.7) * 60  // Joint 3: ±60°
        ]);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [simulationState.isPlaying, updatePhysics]);

  const findComponentById = useCallback((components: RobotComponent[], id: string): RobotComponent | null => {
    for (const component of components) {
      if (component.id === id) return component;
      const found = findComponentById(component.children, id);
      if (found) return found;
    }
    return null;
  }, []);

  const updateComponentInTree = useCallback((
    components: RobotComponent[],
    id: string,
    updates: Partial<RobotComponent>
  ): RobotComponent[] => {
    return components.map(component => {
      if (component.id === id) {
        return { ...component, ...updates };
      }
      return {
        ...component,
        children: updateComponentInTree(component.children, id, updates),
      };
    });
  }, []);

  const handleSelectComponent = useCallback((id: string, shiftPressed: boolean) => {
    setSimulationState(prev => {
      let newSelectedComponents: string[];
      
      if (shiftPressed) {
        // Multi-select with shift
        if (prev.selectedComponents.includes(id)) {
          newSelectedComponents = prev.selectedComponents.filter(compId => compId !== id);
        } else {
          newSelectedComponents = [...prev.selectedComponents, id];
        }
      } else {
        // Single select without shift
        newSelectedComponents = prev.selectedComponents.includes(id) && prev.selectedComponents.length === 1 ? [] : [id];
      }

      // Update selection state in components
      const updateSelection = (components: RobotComponent[]): RobotComponent[] => {
        return components.map(component => ({
          ...component,
          selected: newSelectedComponents.includes(component.id),
          children: updateSelection(component.children),
        }));
      };

      return {
        ...prev,
        selectedComponents: newSelectedComponents,
        components: updateSelection(prev.components),
      };
    });
  }, []);

  const handleUpdateComponent = useCallback((id: string, parameters: AllParameters) => {
    setSimulationState(prev => ({
      ...prev,
      components: updateComponentInTree(prev.components, id, { parameters }),
    }));
  }, [updateComponentInTree]);

  const handleAddComponent = useCallback((type: 'base' | 'link' | 'joint' | 'motor' | 'gearbox' | 'gripper' | 'sensor' | 'battery' | 'electronics' | 'load', position: 'top' | 'bottom') => {
    const getDefaultParameters = () => {
      const baseParams = {
        dimensions: { 
          length: type === 'link' ? 1.0 : 0.3, 
          width: type === 'link' ? 0.15 : 0.3, 
          height: type === 'link' ? 0.15 : 0.3, 
          radius: ['joint', 'motor', 'sensor'].includes(type) ? 0.15 : 0.075,
          cornerRadius: 0.02,
          filletSize: 0.01
        },
        weight: type === 'base' ? 15.0 : type === 'battery' ? 2.0 : 1.0,
        maxVelocity: 2.0,
        maxTorque: 50,
        shape: ['joint', 'motor', 'sensor'].includes(type) ? 'sphere' : type === 'link' ? 'cylinder' : 'box',
        material: {
          youngsModulus: type === 'joint' ? 200e9 : 70e9,
          poissonRatio: 0.3,
          density: type === 'joint' ? 7850 : 2700,
        },
      };

      switch (type) {
        case 'base':
          return {
            ...baseParams,
            mountingType: 'fixed',
            centerOfGravity: [0, 0, 0],
            dampingCoefficient: 0.1,
            frictionCoefficient: 0.8,
          } as BaseParameters;
        case 'joint':
          return {
            ...baseParams,
            jointType: 'rotational',
            minAngle: -90,
            maxAngle: 90,
            currentAngle: 0,
            resolution: 1000,
            backlash: 0.1,
            maxAngularVelocity: 180,
            staticFriction: 0.1,
            dynamicFriction: 0.05,
            powerTransmission: 'direct',
          } as JointParameters;
        case 'motor':
          return {
            ...baseParams,
            inputVoltage: 12,
            ratedCurrent: 2.0,
            stallCurrent: 10.0,
            ratedTorque: 1.5,
            stallTorque: 5.0,
            ratedSpeed: 3000,
            maxSpeed: 6000,
            efficiency: 85,
            gearRatio: 1,
            heatDissipation: 50,
          } as MotorParameters;
        case 'battery':
          return {
            ...baseParams,
            chemistry: 'li_ion',
            nominalVoltage: 12,
            capacity: 5000,
            maxContinuousCurrent: 20,
            peakCurrent: 60,
            internalResistance: 10,
            dischargeRate: 5,
          } as BatteryParameters;
        default:
          return baseParams as ComponentParameters;
      }
    };

    const newComponent: RobotComponent = {
      id: `${type}-${Date.now()}`,
      type,
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      position: position === 'top' ? [0, 0.5, 0] : [0, -0.5, 0],
      rotation: [0, 0, 0],
      selected: false,
      parameters: getDefaultParameters(),
      children: [],
    };

    setSimulationState(prev => ({
      ...prev,
      components: [...prev.components, newComponent],
    }));
  }, []);

  const handlePlayPause = useCallback(() => {
    setSimulationState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  }, []);

  const handleReset = useCallback(() => {
    resetPhysics();
    setSimulationState({
      components: create3DOFRobotArm(),
      selectedComponents: [],
      isPlaying: false,
      speed: 1.0,
      physics: physicsState
    });
  }, [resetPhysics, physicsState]);

  const selectedComponents = simulationState.selectedComponents
    .map(id => findComponentById(simulationState.components, id))
    .filter(Boolean) as RobotComponent[];

  return (
    <SidebarProvider>
      <div className="flex h-full w-full bg-background">
        {/* Left Sidebar - Components */}
        <MechanicalSidebar
          isPlaying={simulationState.isPlaying}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
          onAddComponent={handleAddComponent}
          isCollapsed={leftSidebarCollapsed}
          onToggleCollapse={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
        />

        {/* 3D Scene */}
        <div className="flex-1">
          <Scene3D
            components={simulationState.components}
            onSelectComponent={handleSelectComponent}
            isPlaying={simulationState.isPlaying}
            jointAngles={[
              simulationState.physics?.joints[0]?.angle || 0,
              simulationState.physics?.joints[1]?.angle || 0,
              simulationState.physics?.joints[2]?.angle || 0
            ]}
            selectedComponents={simulationState.selectedComponents}
          />
        </div>

        {/* Right Sidebar - Details */}
        <EnhancedDetailsPanel
          selectedComponents={selectedComponents}
          onUpdateComponent={handleUpdateComponent}
          isCollapsed={rightSidebarCollapsed}
          onToggleCollapse={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
          physicsState={simulationState.physics}
        />
      </div>
    </SidebarProvider>
  );
}