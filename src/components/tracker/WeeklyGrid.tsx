import { useMemo, useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, getWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HabitCell } from './HabitCell';
import { Habit } from '@/hooks/useLocalHabits';
import { cn } from '@/lib/utils';

interface WeeklyGridProps {
  habits: Habit[];
  isCompleted: (habitId: string, date: string) => boolean;
  toggleLog: (habitId: string, date: string) => void;
}

export function WeeklyGrid({ habits, isCompleted, toggleLog }: WeeklyGridProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const today = new Date();

  const days = useMemo(() => {
    const start = currentWeekStart;
    const end = endOfWeek(currentWeekStart, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentWeekStart]);

  const weekNumber = getWeek(currentWeekStart);
  const dateRange = `${format(days[0], 'MMM d')} - ${format(days[6], 'MMM d, yyyy')}`;

  const goToPrevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const goToNextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const goToThisWeek = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No habits yet</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Go to Settings to add your first habit and start tracking!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-4 mb-8">
        <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="icon" onClick={goToPrevWeek}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="text-center min-w-[200px]">
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground tracking-wide">
              WEEK {weekNumber}
            </h2>
            <p className="text-sm text-muted-foreground">{dateRange}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToThisWeek} className="ml-2">
            This Week
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-x-auto">
        <div className="min-w-max">
          {/* Day Headers */}
          <div className="flex mb-4">
            <div className="min-w-[140px] md:min-w-[180px] shrink-0" />
            {days.map((day) => {
              const isToday = isSameDay(day, today);
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'flex-1 min-w-[60px] text-center py-3 mx-1 rounded-xl transition-colors',
                    isToday && 'bg-primary/10'
                  )}
                >
                  <div className={cn(
                    'text-xs font-medium uppercase tracking-wide',
                    isToday ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {format(day, 'EEE')}
                  </div>
                  <div className={cn(
                    'text-xl font-semibold mt-1',
                    isToday ? 'text-primary' : 'text-foreground'
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Habit Rows */}
          {habits.map((habit) => (
            <div key={habit.id} className="flex items-center mb-3">
              {/* Habit Name */}
              <div className="min-w-[140px] md:min-w-[180px] shrink-0 pr-4">
                <span className="text-sm font-medium text-foreground truncate block">
                  {habit.name}
                </span>
              </div>

              {/* Day Cells */}
              {days.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isToday = isSameDay(day, today);
                const completed = isCompleted(habit.id, dateStr);

                return (
                  <div 
                    key={dateStr} 
                    className={cn(
                      'flex-1 min-w-[60px] flex justify-center py-2 mx-1 rounded-xl transition-colors',
                      isToday && 'bg-primary/5'
                    )}
                  >
                    <HabitCell
                      completed={completed}
                      isToday={isToday}
                      onClick={() => toggleLog(habit.id, dateStr)}
                      size="lg"
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
