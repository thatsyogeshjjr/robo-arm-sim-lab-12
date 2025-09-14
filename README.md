# 3DOF Robotic Arm

_explore robotic arms in the comfort of your blankets_

## Purpose

This project provides an interactive browser-based environment to explore the basic structure and troubleshooting processes of a 3DOF robotic arm. The objective is to simulate common scenarios encountered in robotics education, enabling users to practice system-level reasoning without access to physical hardware.

## Milestones

- [x] Basic 3D rendering of robotic arm components (base, links, joints, end effector).
- [x] Labeling and interactive visualization of components.
- [ ] Integration of guided missions with defined fault conditions and corrective actions.
- [ ] Implementation of a telemetry panel displaying sensor-like readouts (torque, current, temperature).
- [ ] Rule-based logic to simulate realistic cause-effect interactions (friction, torque limits, overheating).
- [ ] Exportable artifacts such as PDF logs and performance summaries.

## Tech Stack

- **Frontend:** React, Tailwind CSS
- **3D Rendering:** three.js (WebGL)
- **Physics/Logic:** Rule-based simulation engine (custom JavaScript)
- **Circuit Simulation:** CircuitJS integration or simplified wiring logic
- **Backend:** Firebase or Node.js (authentication, persistence, leaderboards)
- **Export Tools:** jsPDF (PDF generation), Canvas capture utilities

## Future

- Development of additional missions covering diverse robotic faults and scenarios.
- Instructor dashboard for monitoring, grading, and mission authoring.
- Expansion beyond robotic arms to drones, mobile robots, and industrial automation contexts.
- Integration of hardware input devices (e.g., rotary encoders, tactile controllers) for enhanced realism.
- Refinement of physics models for greater accuracy while maintaining browser performance.
