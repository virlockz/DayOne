import { MonthlyGrid } from '@/components/tracker/MonthlyGrid';
import { useLocalHabits } from '@/hooks/useLocalHabits';

export default function Monthly() {
  const { habits, isCompleted, toggleLog, isLoaded } = useLocalHabits();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 h-full">
      <MonthlyGrid
        habits={habits}
        isCompleted={isCompleted}
        toggleLog={toggleLog}
      />
    </div>
  );
}
