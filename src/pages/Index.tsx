import { RobotSimulation } from '@/components/RobotSimulation';

const Index = () => {
  return (
    <div className="w-full h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border panel-shadow relative z-50">
        <div className="fixed top-0 left-0 right-0 bg-card border-b border-border panel-shadow">
          <div className="px-6 py-4">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold tracking-tight">3DOF Robotic Arm Simulator</h1>
                <p className="text-sm text-muted-foreground">Interactive Design & Physics Analysis Platform</p>
              </div>
              <div className="absolute right-6 text-right">
                <div className="text-technical text-sm text-muted-foreground">v2.0.0</div>
                <div className="text-technical text-xs text-muted-foreground">Physics Engine</div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-20"></div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-5rem)] pt-20">
        <RobotSimulation />
      </main>
    </div>
  );
};

export default Index;
