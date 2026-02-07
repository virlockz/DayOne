import { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay, startOfWeek, differenceInCalendarWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HabitCell } from './HabitCell';
import { Habit } from '@/hooks/useLocalHabits';
import { cn } from '@/lib/utils';

interface MonthlyGridProps {
  habits: Habit[];
  isCompleted: (habitId: string, date: string) => boolean;
  toggleLog: (habitId: string, date: string) => void;
}

// Week colors - soft pastels
const weekColors = [
  'hsl(205 85% 93%)',  // Week 1 - Light blue
  'hsl(340 80% 94%)',  // Week 2 - Light pink
  'hsl(140 60% 92%)',  // Week 3 - Light green
  'hsl(45 90% 92%)',   // Week 4 - Light yellow
  'hsl(280 60% 94%)',  // Week 5 - Light purple
  'hsl(195 70% 92%)',  // Week 6 - Light cyan (for overflow)
];

const weekColorsDark = [
  'hsl(205 60% 20%)',  // Week 1 - Dark blue
  'hsl(340 50% 22%)',  // Week 2 - Dark pink
  'hsl(140 40% 18%)',  // Week 3 - Dark green
  'hsl(45 60% 18%)',   // Week 4 - Dark yellow
  'hsl(280 40% 22%)',  // Week 5 - Dark purple
  'hsl(195 50% 20%)',  // Week 6 - Dark cyan
];

interface WeekGroup {
  weekIndex: number;
  days: Date[];
}

export function MonthlyGrid({ habits, isCompleted, toggleLog }: MonthlyGridProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Group days by week (Sunday = 0, so we calculate week boundaries)
  const weeks: WeekGroup[] = useMemo(() => {
    const grouped: WeekGroup[] = [];
    let currentWeekDays: Date[] = [];
    let weekIndex = 0;

    days.forEach((day, index) => {
      const dayOfWeek = getDay(day); // 0 = Sunday

      // Start new week on Sunday (except for the first day of month)
      if (dayOfWeek === 0 && currentWeekDays.length > 0) {
        grouped.push({ weekIndex, days: currentWeekDays });
        currentWeekDays = [day];
        weekIndex++;
      } else {
        currentWeekDays.push(day);
      }

      // Push the last week
      if (index === days.length - 1 && currentWeekDays.length > 0) {
        grouped.push({ weekIndex, days: currentWeekDays });
      }
    });

    return grouped;
  }, [days]);

  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // Check if dark mode
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

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
      {/* Month Header */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground min-w-[220px] text-center tracking-wide">
          {format(currentMonth, 'MMMM yyyy').toUpperCase()}
        </h2>
        <Button variant="ghost" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="w-5 h-5" />
        </Button>
        <Button variant="outline" size="sm" onClick={goToToday} className="ml-2">
          Today
        </Button>
      </div>

      {/* Grid Container - Scrollable */}
      <div className="overflow-x-auto flex-1 pb-4">
        <div className="min-w-max">
          {/* Table */}
          <table className="w-full border-collapse">
            <thead>
              {/* Week Headers Row */}
              <tr>
                <th className="sticky left-0 z-20 bg-background px-3 py-2 text-left min-w-[140px] md:min-w-[180px]">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Daily Habits
                  </span>
                </th>
                {weeks.map((week, i) => (
                  <th
                    key={i}
                    colSpan={week.days.length}
                    className="px-1 py-2 text-center border-x border-border/50"
                    style={{ 
                      backgroundColor: isDark ? weekColorsDark[i % weekColorsDark.length] : weekColors[i % weekColors.length]
                    }}
                  >
                    <span className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">
                      Week {i + 1}
                    </span>
                  </th>
                ))}
              </tr>

              {/* Day Numbers Row */}
              <tr className="border-b border-border">
                <th className="sticky left-0 z-20 bg-background px-3 py-2" />
                {weeks.map((week, weekIdx) => (
                  week.days.map((day) => {
                    const isToday = isSameDay(day, today);
                    return (
                      <th
                        key={day.toISOString()}
                        className="px-1 py-2 text-center min-w-[36px] border-x border-border/30"
                        style={{ 
                          backgroundColor: isDark ? weekColorsDark[weekIdx % weekColorsDark.length] : weekColors[weekIdx % weekColors.length]
                        }}
                      >
                        <span className={cn(
                          'inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium',
                          isToday 
                            ? 'bg-primary text-primary-foreground font-bold' 
                            : 'text-foreground/70'
                        )}>
                          {format(day, 'd')}
                        </span>
                      </th>
                    );
                  })
                ))}
              </tr>
            </thead>

            <tbody>
              {habits.map((habit) => (
                <tr key={habit.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  {/* Habit Name - Sticky */}
                  <td className="sticky left-0 z-10 bg-background px-3 py-2">
                    <span className="text-sm font-medium text-foreground truncate block max-w-[160px]">
                      {habit.name}
                    </span>
                  </td>

                  {/* Day Cells */}
                  {weeks.map((week, weekIdx) => (
                    week.days.map((day) => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const isToday = isSameDay(day, today);
                      const completed = isCompleted(habit.id, dateStr);

                      return (
                        <td
                          key={dateStr}
                          className="px-1 py-1.5 text-center border-x border-border/20"
                          style={{ 
                            backgroundColor: isDark 
                              ? `${weekColorsDark[weekIdx % weekColorsDark.length].replace(')', ' / 0.3)')}` 
                              : `${weekColors[weekIdx % weekColors.length].replace(')', ' / 0.3)')}`
                          }}
                        >
                          <div className="flex justify-center">
                            <HabitCell
                              completed={completed}
                              isToday={isToday}
                              onClick={() => toggleLog(habit.id, dateStr)}
                              size="sm"
                            />
                          </div>
                        </td>
                      );
                    })
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
