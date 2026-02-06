import { useState, useEffect, useCallback } from 'react';

export interface Habit {
  id: string;
  name: string;
  createdAt: string;
}

export interface HabitLog {
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
}

const HABITS_KEY = 'habit-tracker-habits';
const LOGS_KEY = 'habit-tracker-logs';

export function useLocalHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedHabits = localStorage.getItem(HABITS_KEY);
    const savedLogs = localStorage.getItem(LOGS_KEY);
    
    if (savedHabits) {
      try {
        setHabits(JSON.parse(savedHabits));
      } catch (e) {
        console.error('Failed to parse habits from localStorage');
      }
    }
    
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (e) {
        console.error('Failed to parse logs from localStorage');
      }
    }
    
    setIsLoaded(true);
  }, []);

  // Save habits to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
    }
  }, [habits, isLoaded]);

  // Save logs to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    }
  }, [logs, isLoaded]);

  const addHabit = useCallback((name: string) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };
    setHabits(prev => [...prev, newHabit]);
    return newHabit;
  }, []);

  const updateHabit = useCallback((id: string, name: string) => {
    setHabits(prev => 
      prev.map(h => h.id === id ? { ...h, name: name.trim() } : h)
    );
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    // Also remove all logs for this habit
    setLogs(prev => prev.filter(l => l.habitId !== id));
  }, []);

  const toggleLog = useCallback((habitId: string, date: string) => {
    setLogs(prev => {
      const existingLog = prev.find(l => l.habitId === habitId && l.date === date);
      
      if (existingLog) {
        if (existingLog.completed) {
          // Remove the log if it was completed (toggle off)
          return prev.filter(l => !(l.habitId === habitId && l.date === date));
        } else {
          // Mark as completed
          return prev.map(l => 
            l.habitId === habitId && l.date === date 
              ? { ...l, completed: true } 
              : l
          );
        }
      } else {
        // Add new completed log
        return [...prev, { habitId, date, completed: true }];
      }
    });
  }, []);

  const isCompleted = useCallback((habitId: string, date: string) => {
    return logs.some(l => l.habitId === habitId && l.date === date && l.completed);
  }, [logs]);

  const getCompletionStats = useCallback((month: Date) => {
    const year = month.getFullYear();
    const monthNum = month.getMonth();
    
    const monthLogs = logs.filter(l => {
      const logDate = new Date(l.date);
      return logDate.getFullYear() === year && logDate.getMonth() === monthNum && l.completed;
    });
    
    return {
      completed: monthLogs.length,
      total: habits.length * new Date(year, monthNum + 1, 0).getDate(),
    };
  }, [logs, habits]);

  return {
    habits,
    logs,
    isLoaded,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleLog,
    isCompleted,
    getCompletionStats,
  };
}
