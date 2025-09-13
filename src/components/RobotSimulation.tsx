import { useState, useCallback } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Scene3D } from './simulation/Scene3D';
import { MechanicalSidebar } from './panels/MechanicalSidebar';
import { DetailsPanel } from './panels/DetailsPanel';
import { RobotComponent, SimulationState, AllParameters, BaseParameters, JointParameters, MotorParameters, BatteryParameters, ComponentParameters } from '@/types/robotics';

// Create initial base component with proper structure
const createInitialComponents = (): RobotComponent[] => {
  return [
    {
      id: 'base-platform',
      type: 'base',
      name: 'Base Platform',
      position: [0, -1, 0],
      rotation: [0, 0, 0],
      selected: false,
      parameters: {
        dimensions: { 
          length: 1.2, 
          width: 1.2, 
          height: 0.3, 
          cornerRadius: 0.05,
          filletSize: 0.02 
        },
        weight: 15.0,
        maxVelocity: 0,
        maxTorque: 0,
        shape: 'box',
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
  ];
};

export function RobotSimulation() {
  const [simulationState, setSimulationState] = useState<SimulationState>({
    components: createInitialComponents(),
    selectedComponents: [],
    isPlaying: false,
    speed: 1.0,
  });

  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

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
    setSimulationState({
      components: createInitialComponents(),
      selectedComponents: [],
      isPlaying: false,
      speed: 1.0,
    });
  }, []);

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
          />
        </div>

        {/* Right Sidebar - Details */}
        <DetailsPanel
          selectedComponents={selectedComponents}
          onUpdateComponent={handleUpdateComponent}
          isCollapsed={rightSidebarCollapsed}
          onToggleCollapse={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
        />
      </div>
    </SidebarProvider>
  );
}