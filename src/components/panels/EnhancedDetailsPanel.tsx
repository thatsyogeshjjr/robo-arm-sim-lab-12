import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel
} from '@/components/ui/alert-dialog';
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
import { MechanicalTooltip } from '@/components/ui/mechanical-tooltip';
import { 
  RobotComponent, 
  AllParameters, 
  JointParameters, 
  MotorParameters, 
  BatteryParameters,
  BaseParameters,
  LinkParameters,
  GripperParameters,
  LoadParameters
} from '@/types/robotics';
import { 
  Settings, 
  Wrench, 
  ChevronLeft,
  Zap,
  Cog,
  Battery,
  Calculator,
  Activity,
  Gauge,
  Box,
  Package
} from 'lucide-react';

interface EnhancedDetailsPanelProps {
  selectedComponents: RobotComponent[];
  onUpdateComponent: (id: string, parameters: AllParameters) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  physicsState?: {
    joints: Array<{ angle: number; velocity: number; torque: number; power: number }>;
    endEffectorPosition: [number, number, number];
    totalPower: number;
    batteryVoltage: number;
    batteryCharge: number;
    payloadCapacity: number;
    reach: number;
    stability: number;
  };
}

export function EnhancedDetailsPanel({
  selectedComponents,
  onUpdateComponent,
  isCollapsed,
  onToggleCollapse,
  physicsState
}: EnhancedDetailsPanelProps) {
  const selectedComponent = selectedComponents[0] || null;
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const updateParameter = (field: string, value: any) => {
    if (!selectedComponent) return;
    const updatedParams = {
      ...selectedComponent.parameters,
      [field]: value,
    };
    // Check for problematic values
    if (selectedComponent.type === 'joint') {
      const maxTorque = (updatedParams as JointParameters).maxTorque || 15;
      const jointIndex = selectedComponent.id.includes('joint1') ? 0 : selectedComponent.id.includes('joint2') ? 1 : 2;
      const jointPhysics = physicsState?.joints[jointIndex];
      if (jointPhysics && jointPhysics.torque > maxTorque) {
        setWarningMessage(`Torque requirement (${jointPhysics.torque.toFixed(2)} Nm) exceeds joint's max torque (${maxTorque} Nm). Reduce payload or adjust configuration.`);
        setShowWarning(true);
      }
    }
    if (selectedComponent.type === 'motor') {
      const ratedTorque = (updatedParams as MotorParameters).ratedTorque || 15;
      const jointIndex = selectedComponent.id.includes('motor1') ? 0 : selectedComponent.id.includes('motor2') ? 1 : 2;
      const jointPhysics = physicsState?.joints[jointIndex];
      if (jointPhysics && jointPhysics.torque > ratedTorque) {
        setWarningMessage(`Required torque (${jointPhysics.torque.toFixed(2)} Nm) exceeds motor's rated torque (${ratedTorque} Nm). Consider upgrading motor or reducing load.`);
        setShowWarning(true);
      }
    }
    if (selectedComponent.type === 'load') {
      const payloadCapacity = physicsState?.payloadCapacity || 5;
      const mass = (updatedParams as LoadParameters).mass || 5;
      if (mass > payloadCapacity) {
        setWarningMessage(`Payload mass (${mass} kg) exceeds current capacity (${payloadCapacity.toFixed(1)} kg). Reduce payload or improve arm configuration.`);
        setShowWarning(true);
      }
    }
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

  const renderCalculatedValues = () => {
    if (!physicsState) return null;

    return (
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Live Physics Calculations
            <MechanicalTooltip
              title="Real-time Physics"
              definition="Live calculations based on current robot configuration, joint angles, and operating conditions."
              impact="These values change as you modify robot parameters and affect performance, power consumption, and safety margins."
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">End Effector Position</Label>
                <MechanicalTooltip
                  title="End Effector Position"
                  definition="The 3D coordinates of the robot's gripper in Cartesian space (X, Y, Z)."
                  impact="Determines workspace coverage and reachability. Critical for path planning and collision avoidance."
                />
              </div>
              <div className="text-sm font-mono">
                X: {physicsState.endEffectorPosition[0].toFixed(3)}m<br/>
                Y: {physicsState.endEffectorPosition[1].toFixed(3)}m<br/>
                Z: {physicsState.endEffectorPosition[2].toFixed(3)}m
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Total Power</Label>
                <MechanicalTooltip
                  title="Total Power Consumption"
                  definition="Sum of electrical power consumed by all motors under current load conditions."
                  impact="Higher power reduces battery life and may require thermal management. Affects operating time and energy efficiency."
                />
              </div>
              <div className="text-sm font-mono">{physicsState.totalPower.toFixed(1)}W</div>
            </div>

            <div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Workspace Reach</Label>
                <MechanicalTooltip
                  title="Workspace Reach"
                  definition="Maximum distance the end effector can reach from the base center."
                  impact="Defines the robot's operational envelope. Larger reach enables more versatile applications but may reduce precision."
                />
              </div>
              <div className="text-sm font-mono">{physicsState.reach.toFixed(3)}m</div>
            </div>

            <div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Payload Capacity</Label>
                <MechanicalTooltip
                  title="Dynamic Payload Capacity"
                  definition="Maximum load the robot can handle at current position while maintaining torque safety margins."
                  impact="Decreases at extended positions. Exceeding capacity causes joint overload, reduced accuracy, and potential damage."
                />
              </div>
              <div className="text-sm font-mono">{physicsState.payloadCapacity.toFixed(1)}kg</div>
            </div>

            <div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">System Stability</Label>
                <MechanicalTooltip
                  title="System Stability"
                  definition="Overall stability index considering joint torques, power consumption, and dynamic balance."
                  impact="Low stability indicates risk of oscillation, overshoot, or instability. Critical for precision tasks."
                />
              </div>
              <div className="text-sm font-mono">{physicsState.stability.toFixed(0)}%</div>
            </div>

            <div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Battery Status</Label>
                <MechanicalTooltip
                  title="Battery State"
                  definition="Current voltage and charge level considering load-dependent voltage drop."
                  impact="Low voltage reduces motor torque capability. Critical threshold is ~16V for 20V battery system."
                />
              </div>
              <div className="text-sm font-mono">
                {physicsState.batteryVoltage.toFixed(1)}V<br/>
                {physicsState.batteryCharge.toFixed(0)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderJointCalculations = () => {
    if (!physicsState || !selectedComponent || selectedComponent.type !== 'joint') return null;

    const jointIndex = selectedComponent.id.includes('joint1') ? 0 : 
                      selectedComponent.id.includes('joint2') ? 1 : 2;
    const joint = physicsState.joints[jointIndex];

    return (
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Joint Dynamics
            <MechanicalTooltip
              title="Joint Dynamics"
              definition="Real-time analysis of joint motion including torque requirements, power consumption, and thermal load."
              impact="Critical for motor sizing, gearbox selection, and thermal management. Exceeding limits causes wear and failure."
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Required Torque</Label>
                <MechanicalTooltip
                  title="Required Torque"
                  definition="Torque needed to overcome gravity, inertia, and payload at current position."
                  impact="Must be less than motor rating. High torque increases power consumption and generates heat."
                />
              </div>
              <div className="text-sm font-mono">{joint.torque.toFixed(2)} Nm</div>
            </div>

            <div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Angular Velocity</Label>
                <MechanicalTooltip
                  title="Angular Velocity"
                  definition="Current rotational speed of the joint during motion."
                  impact="Higher speeds reduce precision but increase throughput. Limited by motor and gearbox capabilities."
                />
              </div>
              <div className="text-sm font-mono">{joint.velocity.toFixed(1)} °/s</div>
            </div>

            <div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Power Draw</Label>
                <MechanicalTooltip
                  title="Motor Power Draw"
                  definition="Electrical power consumed by this joint's motor including efficiency losses."
                  impact="Contributes to total system power. High draw causes voltage drop and thermal stress."
                />
              </div>
              <div className="text-sm font-mono">{joint.power.toFixed(1)} W</div>
            </div>

            <div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Torque Margin</Label>
                <MechanicalTooltip
                  title="Torque Safety Margin"
                  definition="Remaining torque capacity before reaching motor limits (15 Nm rated)."
                  impact="Low margin indicates risk of overload. Should maintain >20% margin for safety and control stability."
                />
              </div>
              <div className="text-sm font-mono">{((15 - joint.torque) / 15 * 100).toFixed(0)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderBatteryDetails = () => {
    if (!selectedComponent || selectedComponent.type !== 'battery') return null;

    const params = selectedComponent.parameters as BatteryParameters;
    
    return (
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Battery className="w-4 h-4" />
            Battery Analysis
            <MechanicalTooltip
              title="Battery System"
              definition="Detailed analysis of the power system including cell chemistry, thermal characteristics, and performance curves."
              impact="Battery performance directly affects robot capability, operating time, and safety margins."
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Cell Chemistry</Label>
                <MechanicalTooltip
                  title="Battery Chemistry"
                  definition="Type of electrochemical cell technology determining performance characteristics."
                  impact="Li-ion provides high energy density but requires thermal management. Chemistry affects charging, discharge rates, and lifespan."
                />
              </div>
              <div className="text-sm font-mono">{params.chemistry.toUpperCase()}</div>
            </div>

            <div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Energy Capacity</Label>
                <MechanicalTooltip
                  title="Energy Capacity"
                  definition="Total energy storage capacity in watt-hours, determines operating time."
                  impact="Higher capacity enables longer operation but increases weight and cost. Balance with performance requirements."
                />
              </div>
              <div className="text-sm font-mono">{(params.nominalVoltage * params.capacity / 1000).toFixed(0)} Wh</div>
            </div>

            <div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Peak Current</Label>
                <MechanicalTooltip
                  title="Peak Current Capability"
                  definition="Maximum current the battery can deliver for short periods during peak loads."
                  impact="Must exceed motor stall current. Insufficient peak current causes voltage sag and torque reduction."
                />
              </div>
              <div className="text-sm font-mono">{params.peakCurrent} A</div>
            </div>

            <div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Internal Resistance</Label>
                <MechanicalTooltip
                  title="Internal Resistance"
                  definition="Electrical resistance within battery cells causing voltage drop under load."
                  impact="Higher resistance reduces available voltage at high currents. Increases heat generation and energy loss."
                />
              </div>
              <div className="text-sm font-mono">{params.internalResistance} mΩ</div>
            </div>

            <div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">C-Rating</Label>
                <MechanicalTooltip
                  title="Discharge Rate (C-Rating)"
                  definition="Maximum safe continuous discharge rate relative to capacity (5C = 5× capacity per hour)."
                  impact="Higher C-rating enables more powerful operations but may reduce battery lifespan and require cooling."
                />
              </div>
              <div className="text-sm font-mono">{params.dischargeRate}C</div>
            </div>

            <div>
              <div className="flex items-center gap-1">
                <Label className="text-xs text-muted-foreground">Cell Count</Label>
                <MechanicalTooltip
                  title="Battery Cell Count"
                  definition="Number of individual cells connected in series to achieve desired voltage."
                  impact="More cells increase voltage but add complexity. Each cell must be monitored for safety and balance."
                />
              </div>
              <div className="text-sm font-mono">{params.cellCount || 5}S</div>
            </div>
          </div>

          {physicsState && (
            <div className="pt-3 border-t">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Estimated Runtime</Label>
                  <div className="text-sm font-mono">
                    {physicsState.totalPower > 0 
                      ? ((params.nominalVoltage * params.capacity / 1000) / physicsState.totalPower).toFixed(1) + 'h'
                      : '∞'
                    }
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Load Current</Label>
                  <div className="text-sm font-mono">
                    {physicsState.totalPower > 0 
                      ? (physicsState.totalPower / physicsState.batteryVoltage).toFixed(1) + 'A'
                      : '0A'
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
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

    const parameters = selectedComponent.parameters;

    return (
      <div className="space-y-4">
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

        {/* Live Calculations */}
        {renderCalculatedValues()}
        
        {/* Joint-specific calculations */}
        {renderJointCalculations()}
        
        {/* Battery-specific details */}
        {renderBatteryDetails()}

        {/* Basic Parameters */}
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
          </CardContent>
        </Card>

        {/* Component-specific parameters */}
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
              <ParameterSlider
                label="Current Angle"
                value={(parameters as JointParameters).currentAngle}
                min={(parameters as JointParameters).minAngle}
                max={(parameters as JointParameters).maxAngle}
                step={1}
                unit="°"
                onChange={(value) => updateParameter('currentAngle', value)}
              />
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <>
      <Sidebar 
        className={`border-l border-border transition-all duration-300 ${isCollapsed ? 'w-12' : 'w-96'}`}
        side="right"
      >
        <SidebarHeader className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <h2 className="text-lg font-semibold">Component Details</h2>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </SidebarHeader>

        <SidebarContent className={isCollapsed ? 'hidden' : ''}>
          <SidebarGroup>
            <SidebarGroupContent className="px-4 py-4">
              {renderParameterControls()}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      {/* Warning Modal */}
      {showWarning && (
        <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Warning: Unsafe Value</AlertDialogTitle>
              <AlertDialogDescription>{warningMessage}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowWarning(false)}>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}