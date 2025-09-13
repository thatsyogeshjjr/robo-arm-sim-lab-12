import { useState } from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AllParameters } from '@/types/robotics';
import { 
  Settings, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Wrench, 
  Box, 
  Circle, 
  Cylinder,
  Shapes,
  ChevronRight,
  Zap,
  Cog,
  Eye,
  Battery,
  Cpu,
  Package,
  Layers
} from 'lucide-react';

interface MechanicalSidebarProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onAddComponent: (type: 'base' | 'link' | 'joint' | 'motor' | 'gearbox' | 'gripper' | 'sensor' | 'battery' | 'electronics' | 'load', position: 'top' | 'bottom') => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function MechanicalSidebar({
  isPlaying,
  onPlayPause,
  onReset,
  onAddComponent,
  isCollapsed,
  onToggleCollapse,
}: MechanicalSidebarProps) {
  const [activeGroup, setActiveGroup] = useState('components');

  const componentTypes = [
    { 
      name: 'Base', 
      type: 'base' as const, 
      icon: Box, 
      description: 'Foundation platform',
      category: 'Foundation'
    },
    { 
      name: 'Link', 
      type: 'link' as const, 
      icon: Layers, 
      description: 'Arm segment',
      category: 'Structure'
    },
    { 
      name: 'Joint', 
      type: 'joint' as const, 
      icon: Cog, 
      description: 'Rotational/Linear',
      category: 'Motion'
    },
    { 
      name: 'Motor', 
      type: 'motor' as const, 
      icon: Zap, 
      description: 'Actuator',
      category: 'Actuation'
    },
    { 
      name: 'Gearbox', 
      type: 'gearbox' as const, 
      icon: Cog, 
      description: 'Transmission',
      category: 'Actuation'
    },
    { 
      name: 'Gripper', 
      type: 'gripper' as const, 
      icon: Wrench, 
      description: 'End-effector',
      category: 'End Effector'
    },
    { 
      name: 'Sensor', 
      type: 'sensor' as const, 
      icon: Eye, 
      description: 'Feedback system',
      category: 'Sensing'
    },
    { 
      name: 'Battery', 
      type: 'battery' as const, 
      icon: Battery, 
      description: 'Power supply',
      category: 'Power'
    },
    { 
      name: 'Electronics', 
      type: 'electronics' as const, 
      icon: Cpu, 
      description: 'Controller/MCU',
      category: 'Control'
    },
    { 
      name: 'Load', 
      type: 'load' as const, 
      icon: Package, 
      description: 'Payload',
      category: 'Payload'
    },
  ];

  const categories = Array.from(new Set(componentTypes.map(c => c.category)));

  const renderComponentLibrary = () => {
    return (
      <div className="space-y-6">
        {categories.map(category => (
          <Card key={category} className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {category}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                {componentTypes
                  .filter(comp => comp.category === category)
                  .map((comp) => {
                    const IconComponent = comp.icon;
                    return (
                      <Button
                        key={comp.type}
                        variant="outline"
                        size="sm"
                        onClick={() => onAddComponent(comp.type, 'top')}
                        className="h-auto p-3 flex justify-start items-center gap-3"
                      >
                        <IconComponent className="w-4 h-4 text-primary" />
                        <div className="text-left flex-1">
                          <div className="font-medium text-sm">{comp.name}</div>
                          <div className="text-xs text-muted-foreground">{comp.description}</div>
                        </div>
                      </Button>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };


  return (
    <Sidebar 
      className={`border-r border-border transition-all duration-300 ${isCollapsed ? 'w-12' : 'w-80'}`}
      side="left"
    >
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold">Components</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
          </Button>
        </div>
      </SidebarHeader>

      {!isCollapsed && (
        <SidebarContent className="p-4 space-y-4">
          {/* Controls */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Simulation Control</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button
                variant={isPlaying ? "secondary" : "default"}
                size="sm"
                onClick={onPlayPause}
                className="flex-1"
              >
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Component Library */}
          {renderComponentLibrary()}
        </SidebarContent>
      )}
    </Sidebar>
  );
}