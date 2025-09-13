import { RobotSimulation } from '@/components/RobotSimulation';

const Index = () => {
  return (
    <div className="w-full h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border panel-shadow">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Robotic Arm Simulator</h1>
              <p className="text-sm text-muted-foreground">3DOF Interactive Design & Analysis Platform</p>
            </div>
            <div className="text-right">
              <div className="text-technical text-sm text-muted-foreground">v1.0.0</div>
              <div className="text-technical text-xs text-muted-foreground">Academic Research Tool</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-5rem)]">
        <RobotSimulation />
      </main>
    </div>
  );
};

export default Index;
