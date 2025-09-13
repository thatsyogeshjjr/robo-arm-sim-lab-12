import { useState } from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel,
  SidebarHeader,
  useSidebar
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ParameterSlider } from '@/components/ui/parameter-slider';
import { 
  RobotComponent, 
  AllParameters, 
  JointParameters, 
  MotorParameters, 
  GripperParameters, 
  BaseParameters,
  LinkParameters,
  GearboxParameters,
  SensorParameters,
  BatteryParameters,
  ElectronicsParameters,
  LoadParameters
} from '@/types/robotics';
import { 
  Settings, 
  Wrench, 
  Box, 
  Circle, 
  Cylinder,
  Shapes,
  ChevronLeft,
  Zap,
  Cog,
  Eye,
  Battery,
  Cpu,
  Package
} from 'lucide-react';

interface DetailsPanelProps {
  selectedComponents: RobotComponent[];
  onUpdateComponent: (id: string, parameters: AllParameters) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function DetailsPanel({
  selectedComponents,
  onUpdateComponent,
  isCollapsed,
  onToggleCollapse,
}: DetailsPanelProps) {
  const selectedComponent = selectedComponents[0] || null;

  const updateParameter = (field: string, value: any) => {
    if (!selectedComponent) return;
    
    const updatedParams = {
      ...selectedComponent.parameters,
      [field]: value,
    };
    
    onUpdateComponent(selectedComponent.id, updatedParams);
  };

  const updateDimension = (dimension: string, value: number) => {
    if (!selectedComponent) return;
    
    const updatedParams = {
      ...selectedComponent.parameters,
      dimensions: {
        ...selectedComponent.parameters.dimensions,
        [dimension]: value,
      },
    };
    
    onUpdateComponent(selectedComponent.id, updatedParams);
  };

  const updateMaterial = (property: string, value: number) => {
    if (!selectedComponent) return;
    
    const updatedParams = {
      ...selectedComponent.parameters,
      material: {
        ...selectedComponent.parameters.material,
        [property]: value,
      },
    };
    
    onUpdateComponent(selectedComponent.id, updatedParams);
  };

  const updateArray = (field: string, index: number, value: number) => {
    if (!selectedComponent) return;
    
    const currentArray = (selectedComponent.parameters as any)[field] as number[];
    const newArray = [...currentArray];
    newArray[index] = value;
    
    const updatedParams = {
      ...selectedComponent.parameters,
      [field]: newArray,
    };
    
    onUpdateComponent(selectedComponent.id, updatedParams);
  };

  const renderParameterControls = () => {
    if (!selectedComponent) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select a component to view details</p>
        </div>
      );
    }

    const { parameters } = selectedComponent;

    return (
      <div className="space-y-6">
        {/* Component Info */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{selectedComponent.name}</CardTitle>
              <Badge variant="outline" className="text-technical">
                {selectedComponent.type}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">ID: {selectedComponent.id}</p>
          </CardHeader>
        </Card>

        {/* Base Properties */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shapes className="w-4 h-4" />
              Geometry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Shape</label>
              <Select
                value={parameters.shape}
                onValueChange={(value) => updateParameter('shape', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="box">
                    <div className="flex items-center gap-2">
                      <Box className="w-4 h-4" />
                      Box
                    </div>
                  </SelectItem>
                  <SelectItem value="cylinder">
                    <div className="flex items-center gap-2">
                      <Cylinder className="w-4 h-4" />
                      Cylinder
                    </div>
                  </SelectItem>
                  <SelectItem value="sphere">
                    <div className="flex items-center gap-2">
                      <Circle className="w-4 h-4" />
                      Sphere
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Length (m)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={parameters.dimensions.length}
                  onChange={(e) => updateDimension('length', parseFloat(e.target.value) || 0)}
                  className="mt-1 text-xs"
                />
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">Width (m)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={parameters.dimensions.width}
                  onChange={(e) => updateDimension('width', parseFloat(e.target.value) || 0)}
                  className="mt-1 text-xs"
                />
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">Height (m)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={parameters.dimensions.height}
                  onChange={(e) => updateDimension('height', parseFloat(e.target.value) || 0)}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            {parameters.shape !== 'box' && (
              <div>
                <Label className="text-xs text-muted-foreground">Radius (m)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={parameters.dimensions.radius || parameters.dimensions.width / 2}
                  onChange={(e) => updateDimension('radius', parseFloat(e.target.value) || 0)}
                  className="mt-1 text-xs"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Basic Properties */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Mechanical Properties
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ParameterSlider
              label="Weight"
              value={parameters.weight}
              min={0.1}
              max={50}
              step={0.1}
              unit="kg"
              onChange={(value) => updateParameter('weight', value)}
            />
            <ParameterSlider
              label="Max Velocity"
              value={parameters.maxVelocity}
              min={0.1}
              max={10}
              step={0.1}
              unit="m/s"
              onChange={(value) => updateParameter('maxVelocity', value)}
            />
            <ParameterSlider
              label="Max Torque"
              value={parameters.maxTorque}
              min={1}
              max={1000}
              step={1}
              unit="Nm"
              onChange={(value) => updateParameter('maxTorque', value)}
            />
          </CardContent>
        </Card>

        {/* Type-specific parameters */}
        {selectedComponent.type === 'base' && (
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Box className="w-4 h-4" />
                Base Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mounting Type</label>
                <Select
                  value={(parameters as BaseParameters).mountingType}
                  onValueChange={(value) => updateParameter('mountingType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="mobile">Mobile Platform</SelectItem>
                    <SelectItem value="wheels">Wheels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">COG X</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(parameters as BaseParameters).centerOfGravity[0]}
                    onChange={(e) => updateArray('centerOfGravity', 0, parseFloat(e.target.value) || 0)}
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">COG Y</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(parameters as BaseParameters).centerOfGravity[1]}
                    onChange={(e) => updateArray('centerOfGravity', 1, parseFloat(e.target.value) || 0)}
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">COG Z</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(parameters as BaseParameters).centerOfGravity[2]}
                    onChange={(e) => updateArray('centerOfGravity', 2, parseFloat(e.target.value) || 0)}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              <ParameterSlider
                label="Damping Coefficient"
                value={(parameters as BaseParameters).dampingCoefficient}
                min={0.01}
                max={1}
                step={0.01}
                unit=""
                onChange={(value) => updateParameter('dampingCoefficient', value)}
              />
              <ParameterSlider
                label="Friction Coefficient"
                value={(parameters as BaseParameters).frictionCoefficient}
                min={0.01}
                max={1}
                step={0.01}
                unit=""
                onChange={(value) => updateParameter('frictionCoefficient', value)}
              />
            </CardContent>
          </Card>
        )}

        {selectedComponent.type === 'motor' && (
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Motor Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ParameterSlider
                label="Input Voltage"
                value={(parameters as MotorParameters).inputVoltage}
                min={3}
                max={48}
                step={0.1}
                unit="V"
                onChange={(value) => updateParameter('inputVoltage', value)}
              />
              <ParameterSlider
                label="Rated Current"
                value={(parameters as MotorParameters).ratedCurrent}
                min={0.1}
                max={50}
                step={0.1}
                unit="A"
                onChange={(value) => updateParameter('ratedCurrent', value)}
              />
              <ParameterSlider
                label="Rated Torque"
                value={(parameters as MotorParameters).ratedTorque}
                min={0.1}
                max={100}
                step={0.1}
                unit="Nm"
                onChange={(value) => updateParameter('ratedTorque', value)}
              />
              <ParameterSlider
                label="Rated Speed"
                value={(parameters as MotorParameters).ratedSpeed}
                min={100}
                max={10000}
                step={100}
                unit="RPM"
                onChange={(value) => updateParameter('ratedSpeed', value)}
              />
              <ParameterSlider
                label="Efficiency"
                value={(parameters as MotorParameters).efficiency}
                min={50}
                max={98}
                step={1}
                unit="%"
                onChange={(value) => updateParameter('efficiency', value)}
              />
            </CardContent>
          </Card>
        )}

        {selectedComponent.type === 'joint' && (
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cog className="w-4 h-4" />
                Joint Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Joint Type</label>
                <Select
                  value={(parameters as JointParameters).jointType}
                  onValueChange={(value) => updateParameter('jointType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rotational">Rotational</SelectItem>
                    <SelectItem value="linear">Linear</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Min Angle (°)</Label>
                  <Input
                    type="number"
                    value={(parameters as JointParameters).minAngle}
                    onChange={(e) => updateParameter('minAngle', parseFloat(e.target.value) || 0)}
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Max Angle (°)</Label>
                  <Input
                    type="number"
                    value={(parameters as JointParameters).maxAngle}
                    onChange={(e) => updateParameter('maxAngle', parseFloat(e.target.value) || 0)}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
              
              <ParameterSlider
                label="Current Angle"
                value={(parameters as JointParameters).currentAngle}
                min={(parameters as JointParameters).minAngle}
                max={(parameters as JointParameters).maxAngle}
                step={1}
                unit="°"
                onChange={(value) => updateParameter('currentAngle', value)}
              />
              
              <ParameterSlider
                label="Resolution"
                value={(parameters as JointParameters).resolution}
                min={100}
                max={10000}
                step={100}
                unit="steps/rev"
                onChange={(value) => updateParameter('resolution', value)}
              />
            </CardContent>
          </Card>
        )}

        {/* Add other component type parameter sections as needed */}
      </div>
    );
  };

  return (
    <Sidebar 
      className={`border-l border-border transition-all duration-300 ${isCollapsed ? 'w-12' : 'w-80'}`}
      side="right"
    >
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold">Details</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </SidebarHeader>

      {!isCollapsed && (
        <SidebarContent className="p-4 space-y-4">
          {renderParameterControls()}
        </SidebarContent>
      )}
    </Sidebar>
  );
}