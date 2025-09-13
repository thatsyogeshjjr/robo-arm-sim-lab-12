import { useState, useCallback, useEffect } from 'react';
import { RobotComponent } from '@/types/robotics';

interface JointState {
  angle: number;
  velocity: number;
  torque: number;
  power: number;
}

interface PhysicsState {
  joints: JointState[];
  endEffectorPosition: [number, number, number];
  totalPower: number;
  batteryVoltage: number;
  batteryCharge: number;
  payloadCapacity: number;
  reach: number;
  stability: number;
}

interface RobotConfig {
  link1Length: number;
  link2Length: number;
  link3Length: number;
  baseHeight: number;
  batteryVoltage: number;
  batteryCapacity: number;
  motorTorque: number;
  payloadMass: number;
}

export function useRobotPhysics(components: RobotComponent[]) {
  const [physicsState, setPhysicsState] = useState<PhysicsState>({
    joints: [
      { angle: 0, velocity: 0, torque: 0, power: 0 },
      { angle: 0, velocity: 0, torque: 0, power: 0 },
      { angle: 0, velocity: 0, torque: 0, power: 0 }
    ],
    endEffectorPosition: [0, 0, 0],
    totalPower: 0,
    batteryVoltage: 20.0,
    batteryCharge: 100,
    payloadCapacity: 5.0,
    reach: 1.8,
    stability: 85
  });

  const [config] = useState<RobotConfig>({
    link1Length: 0.6,
    link2Length: 0.6,  
    link3Length: 0.6,
    baseHeight: 0.3,
    batteryVoltage: 20.0,
    batteryCapacity: 3000, // mAh
    motorTorque: 15.0, // Nm per motor
    payloadMass: 5.0 // kg
  });

  const calculateForwardKinematics = useCallback((angles: [number, number, number]) => {
    const [θ1, θ2, θ3] = angles.map(a => a * Math.PI / 180); // Convert to radians
    
    // 3DOF forward kinematics
    const x = config.link1Length * Math.cos(θ1) + 
              config.link2Length * Math.cos(θ1 + θ2) + 
              config.link3Length * Math.cos(θ1 + θ2 + θ3);
    
    const y = config.baseHeight + 
              config.link1Length * Math.sin(θ1) + 
              config.link2Length * Math.sin(θ1 + θ2) + 
              config.link3Length * Math.sin(θ1 + θ2 + θ3);
    
    const z = 0; // Planar arm for simplicity
    
    return [x, y, z] as [number, number, number];
  }, [config]);

  const calculateTorqueRequirements = useCallback((angles: [number, number, number]) => {
    const g = 9.81; // gravity
    const [θ1, θ2, θ3] = angles.map(a => a * Math.PI / 180);
    
    // Simplified torque calculation considering gravity and payload
    const link1Mass = 2.0; // kg
    const link2Mass = 1.5; // kg  
    const link3Mass = 1.0; // kg
    
    // Torque requirements for each joint (simplified)
    const τ1 = (link1Mass * config.link1Length / 2 + 
                 link2Mass * config.link1Length + 
                 link3Mass * config.link1Length + 
                 config.payloadMass * config.link1Length) * g * Math.cos(θ1);
    
    const τ2 = (link2Mass * config.link2Length / 2 + 
                 link3Mass * config.link2Length + 
                 config.payloadMass * config.link2Length) * g * Math.cos(θ1 + θ2);
    
    const τ3 = (link3Mass * config.link3Length / 2 + 
                 config.payloadMass * config.link3Length) * g * Math.cos(θ1 + θ2 + θ3);
    
    return [Math.abs(τ1), Math.abs(τ2), Math.abs(τ3)];
  }, [config]);

  const calculatePowerConsumption = useCallback((torques: number[], velocities: number[]) => {
    // Power = Torque × Angular Velocity / Efficiency
    const efficiency = 0.85; // 85% motor efficiency
    return torques.map((torque, i) => 
      Math.abs(torque * velocities[i] * Math.PI / 180) / efficiency
    );
  }, []);

  const updatePhysics = useCallback((targetAngles: [number, number, number]) => {
    const torques = calculateTorqueRequirements(targetAngles);
    const endEffector = calculateForwardKinematics(targetAngles);
    
    // Simulate joint velocities (simplified)
    const velocities = [2.0, 2.0, 2.0]; // deg/s
    const powers = calculatePowerConsumption(torques, velocities);
    const totalPower = powers.reduce((sum, p) => sum + p, 0);
    
    // Battery discharge calculation
    const current = totalPower / config.batteryVoltage; // A
    const dischargeRate = current / (config.batteryCapacity / 1000); // per hour
    
    setPhysicsState(prev => ({
      joints: targetAngles.map((angle, i) => ({
        angle,
        velocity: velocities[i],
        torque: torques[i],
        power: powers[i]
      })),
      endEffectorPosition: endEffector,
      totalPower,
      batteryVoltage: Math.max(16.0, config.batteryVoltage - (dischargeRate * 0.1)),
      batteryCharge: Math.max(0, prev.batteryCharge - (dischargeRate * 0.01)),
      payloadCapacity: Math.min(...torques.map(t => config.motorTorque / t)) * config.payloadMass,
      reach: Math.sqrt(endEffector[0] ** 2 + endEffector[1] ** 2),
      stability: Math.max(0, 100 - (totalPower / 100) * 10)
    }));
  }, [calculateForwardKinematics, calculateTorqueRequirements, calculatePowerConsumption, config]);

  const resetPhysics = useCallback(() => {
    setPhysicsState({
      joints: [
        { angle: 0, velocity: 0, torque: 0, power: 0 },
        { angle: 0, velocity: 0, torque: 0, power: 0 },
        { angle: 0, velocity: 0, torque: 0, power: 0 }
      ],
      endEffectorPosition: [config.link1Length + config.link2Length + config.link3Length, config.baseHeight, 0],
      totalPower: 0,
      batteryVoltage: config.batteryVoltage,
      batteryCharge: 100,
      payloadCapacity: config.payloadMass,
      reach: config.link1Length + config.link2Length + config.link3Length,
      stability: 100
    });
  }, [config]);

  return {
    physicsState,
    config,
    updatePhysics,
    resetPhysics,
    calculateForwardKinematics
  };
}