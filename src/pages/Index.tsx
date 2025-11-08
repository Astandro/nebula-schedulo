import { CalendarView } from '@/components/CalendarView';
import { Logo } from '@/components/Logo';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Logo size="sm" />
        </div>
      </header>

      {/* Main content - Full height */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8 flex-1 flex flex-col">
        <CalendarView />
      </main>
    </div>
  );
};

export default Index;
