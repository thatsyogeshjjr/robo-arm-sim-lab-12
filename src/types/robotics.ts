export interface ComponentParameters {
  dimensions: {
    length: number;
    width: number;
    height: number;
    radius?: number;
    cornerRadius?: number;
    filletSize?: number;
  };
  weight: number;
  maxVelocity: number;
  maxTorque: number;
  shape: 'box' | 'cylinder' | 'sphere';
  material: {
    youngsModulus: number;
    poissonRatio: number;
    density: number;
  };
}

export interface BaseParameters extends ComponentParameters {
  mountingType: 'fixed' | 'mobile' | 'wheels';
  centerOfGravity: [number, number, number];
  dampingCoefficient: number;
  frictionCoefficient: number;
}

export interface LinkParameters extends ComponentParameters {
  crossSectionGeometry: 'square' | 'round' | 'flat';
  massDistribution: 'uniform' | 'center' | 'end';
  momentOfInertia: number;
  maxBendingStress: number;
}

export interface JointParameters extends ComponentParameters {
  jointType: 'rotational' | 'linear';
  minAngle: number;
  maxAngle: number;
  currentAngle: number;
  resolution: number;
  backlash: number;
  maxAngularVelocity: number;
  staticFriction: number;
  dynamicFriction: number;
  powerTransmission: 'direct' | 'belt' | 'gear' | 'harmonic';
}

export interface MotorParameters extends ComponentParameters {
  inputVoltage: number;
  ratedCurrent: number;
  stallCurrent: number;
  ratedTorque: number;
  stallTorque: number;
  ratedSpeed: number;
  maxSpeed: number;
  efficiency: number;
  gearRatio: number;
  heatDissipation: number;
}

export interface GearboxParameters extends ComponentParameters {
  gearRatio: number;
  torqueMultiplication: number;
  efficiency: number;
  backlash: number;
}

export interface GripperParameters extends ComponentParameters {
  gripperType: 'parallel' | 'suction' | 'welding' | 'basic' | 'precision' | 'heavy';
  maxGrippingForce: number;
  payloadCapacity: number;
  openWidth: number;
  degreesOfFreedom: number;
}

export interface SensorParameters extends ComponentParameters {
  sensorType: 'encoder' | 'current' | 'imu' | 'force_torque';
  resolution: number;
  accuracy: number;
  range: [number, number];
}

export interface BatteryParameters extends ComponentParameters {
  chemistry: 'li_ion' | 'lipo' | 'nimh';
  nominalVoltage: number;
  capacity: number;
  maxContinuousCurrent: number;
  peakCurrent: number;
  internalResistance: number;
  dischargeRate: number;
}

export interface ElectronicsParameters extends ComponentParameters {
  processorSpeed: number;
  pwmResolution: number;
  communicationProtocol: 'can' | 'uart' | 'i2c' | 'spi';
  ioCount: number;
  currentCapacity: number;
  voltageRange: [number, number];
  efficiency: number;
}

export interface LoadParameters extends ComponentParameters {
  mass: number;
  centerOfGravity: [number, number, number];
  momentOfInertia: number;
}

export interface PerformanceMetrics {
  maxPayload: number;
  reach: number;
  repeatability: number;
  maxSpeed: number;
  jointTorqueMargins: number[];
  batteryLife: number;
  powerConsumption: number;
  stabilityMargin: number;
  thermalPerformance: number;
}

export type AllParameters = 
  | ComponentParameters 
  | BaseParameters 
  | LinkParameters 
  | JointParameters 
  | MotorParameters 
  | GearboxParameters 
  | GripperParameters 
  | SensorParameters 
  | BatteryParameters 
  | ElectronicsParameters 
  | LoadParameters;

export interface RobotComponent {
  id: string;
  type: 'base' | 'link' | 'joint' | 'motor' | 'gearbox' | 'gripper' | 'sensor' | 'battery' | 'electronics' | 'load';
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  parameters: AllParameters;
  children: RobotComponent[];
  selected: boolean;
}

export interface SimulationState {
  components: RobotComponent[];
  selectedComponents: string[];
  isPlaying: boolean;
  speed: number;
}