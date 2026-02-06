import { SettingsPanel } from '@/components/tracker/SettingsPanel';
import { useLocalHabits } from '@/hooks/useLocalHabits';

export default function SettingsPage() {
  const { habits, addHabit, updateHabit, deleteHabit, isLoaded } = useLocalHabits();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <SettingsPanel
        habits={habits}
        addHabit={addHabit}
        updateHabit={updateHabit}
        deleteHabit={deleteHabit}
      />
    </div>
  );
}
