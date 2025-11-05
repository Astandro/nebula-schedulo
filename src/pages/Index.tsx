import { CalendarView } from '@/components/CalendarView';

const Index = () => {
  return (
    <div className="min-h-screen p-4 lg:p-8 bg-gradient-to-br from-primary to-secondary glow-primary">
      <div className="max-w-7xl mx-auto">
        <CalendarView />
      </div>
    </div>
  );
};

export default Index;
