import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ParameterSlider } from '@/components/ui/parameter-slider';
import { RobotComponent, ComponentParameters, JointParameters, GripperParameters } from '@/types/robotics';
import { Play, Pause, RotateCcw, Plus } from 'lucide-react';

interface ParameterPanelProps {
  selectedComponent: RobotComponent | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onUpdateComponent: (id: string, parameters: ComponentParameters) => void;
  onAddComponent: (parentId: string, type: 'joint' | 'link' | 'gripper') => void;
}

export function ParameterPanel({
  selectedComponent,
  isPlaying,
  onPlayPause,
  onReset,
  onUpdateComponent,
  onAddComponent,
}: ParameterPanelProps) {
  const [activeTab, setActiveTab] = useState('parameters');

  const updateParameter = (field: string, value: any) => {
    if (!selectedComponent) return;
    
    const updatedParams = {
      ...selectedComponent.parameters,
      [field]: value,
    };
    
    onUpdateComponent(selectedComponent.id, updatedParams);
  };

  const updateDimension = (dimension: 'length' | 'width' | 'height', value: number) => {
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

  const renderParameterControls = () => {
    if (!selectedComponent) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>Select a component to edit its parameters</p>
        </div>
      );
    }

    const { parameters } = selectedComponent;

    return (
      <div className="space-y-6">
        {/* Component Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{selectedComponent.name}</h3>
            <Badge variant="outline" className="text-technical">
              {selectedComponent.type}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">ID: {selectedComponent.id}</p>
        </div>

        <Separator />

        {/* Dimensions */}
        <div className="space-y-4">
          <h4 className="font-medium">Dimensions</h4>
          <ParameterSlider
            label="Length"
            value={parameters.dimensions.length}
            min={0.1}
            max={5}
            step={0.1}
            unit="m"
            onChange={(value) => updateDimension('length', value)}
          />
          <ParameterSlider
            label="Width"
            value={parameters.dimensions.width}
            min={0.1}
            max={2}
            step={0.1}
            unit="m"
            onChange={(value) => updateDimension('width', value)}
          />
          <ParameterSlider
            label="Height"
            value={parameters.dimensions.height}
            min={0.1}
            max={2}
            step={0.1}
            unit="m"
            onChange={(value) => updateDimension('height', value)}
          />
        </div>

        <Separator />

        {/* Physical Properties */}
        <div className="space-y-4">
          <h4 className="font-medium">Physical Properties</h4>
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
        </div>

        {/* Type-specific parameters */}
        {selectedComponent.type === 'joint' && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium">Joint Parameters</h4>
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
                label="Min Angle"
                value={(parameters as JointParameters).minAngle}
                min={-180}
                max={0}
                step={1}
                unit="°"
                onChange={(value) => updateParameter('minAngle', value)}
              />
              <ParameterSlider
                label="Max Angle"
                value={(parameters as JointParameters).maxAngle}
                min={0}
                max={180}
                step={1}
                unit="°"
                onChange={(value) => updateParameter('maxAngle', value)}
              />
            </div>
          </>
        )}

        {selectedComponent.type === 'gripper' && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium">Gripper Parameters</h4>
              <ParameterSlider
                label="Open Width"
                value={(parameters as GripperParameters).openWidth}
                min={0.01}
                max={0.5}
                step={0.01}
                unit="m"
                onChange={(value) => updateParameter('openWidth', value)}
              />
              <ParameterSlider
                label="Gripping Force"
                value={(parameters as GripperParameters).maxGrippingForce}
                min={1}
                max={500}
                step={1}
                unit="N"
                onChange={(value) => updateParameter('maxGrippingForce', value)}
              />
            </div>
          </>
        )}
      </div>
    );
  };

  const renderComponentLibrary = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-4">Add Components</h3>
          {selectedComponent ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Add to: {selectedComponent.name}
              </p>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  className="justify-start h-auto p-3"
                  onClick={() => onAddComponent(selectedComponent.id, 'joint')}
                >
                  <div className="text-left">
                    <div className="font-medium">Joint</div>
                    <div className="text-xs text-muted-foreground">Rotational joint</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto p-3"
                  onClick={() => onAddComponent(selectedComponent.id, 'link')}
                >
                  <div className="text-left">
                    <div className="font-medium">Arm Segment</div>
                    <div className="text-xs text-muted-foreground">Rigid link component</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto p-3"
                  onClick={() => onAddComponent(selectedComponent.id, 'gripper')}
                >
                  <div className="text-left">
                    <div className="font-medium">Gripper</div>
                    <div className="text-xs text-muted-foreground">End effector</div>
                  </div>
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a component to add children to it
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-96 h-full bg-card border-l border-border panel-gradient panel-shadow">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Control Panel</h2>
        </div>
        
        {/* Simulation Controls */}
        <div className="flex gap-2">
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
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 m-4">
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="library">Components</TabsTrigger>
          </TabsList>
          
          <TabsContent value="parameters" className="px-4 pb-4">
            {renderParameterControls()}
          </TabsContent>
          
          <TabsContent value="library" className="px-4 pb-4">
            {renderComponentLibrary()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}