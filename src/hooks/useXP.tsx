import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

// XP values for different actions
export const XP_VALUES = {
  HABIT_COMPLETE: 10,
  TASK_COMPLETE: 5,
  JOURNAL_ENTRY: 20,
  FOCUS_PER_MINUTE: 1,
} as const;

// Tier definitions (12 tiers)
export const TIERS = [
  { name: 'Novice', minLevel: 1, color: 'hsl(var(--muted-foreground))' },
  { name: 'Apprentice', minLevel: 5, color: 'hsl(142, 76%, 36%)' },
  { name: 'Initiate', minLevel: 10, color: 'hsl(142, 76%, 46%)' },
  { name: 'Adept', minLevel: 20, color: 'hsl(217, 91%, 60%)' },
  { name: 'Expert', minLevel: 30, color: 'hsl(250, 91%, 60%)' },
  { name: 'Master', minLevel: 40, color: 'hsl(280, 91%, 60%)' },
  { name: 'Champion', minLevel: 50, color: 'hsl(45, 93%, 47%)' },
  { name: 'Hero', minLevel: 60, color: 'hsl(25, 95%, 53%)' },
  { name: 'Legend', minLevel: 70, color: 'hsl(0, 84%, 60%)' },
  { name: 'Mythic', minLevel: 80, color: 'hsl(330, 81%, 60%)' },
  { name: 'Transcendent', minLevel: 90, color: 'hsl(180, 70%, 50%)' },
  { name: 'Eternal', minLevel: 100, color: 'hsl(50, 100%, 50%)' },
] as const;

export interface UserStats {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  tier: string;
  habits_completed: number;
  tasks_completed: number;
  journal_entries: number;
  focus_minutes: number;
  created_at: string;
  updated_at: string;
}

// Calculate level from XP (uses a curve that gets progressively harder)
export function calculateLevelFromXP(xp: number): number {
  // Formula: Level = floor(sqrt(xp / 100)) + 1
  // This means: Level 2 = 100 XP, Level 10 = 8,100 XP, Level 50 = 240,100 XP, Level 100 = 980,100 XP
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  return Math.min(level, 100);
}

// Calculate XP needed for a specific level
export function xpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 100;
}

// Get progress to next level (0-100%)
export function getXPProgress(xp: number): { current: number; required: number; percentage: number } {
  const currentLevel = calculateLevelFromXP(xp);
  const currentLevelXP = xpForLevel(currentLevel);
  const nextLevelXP = xpForLevel(currentLevel + 1);
  
  const current = xp - currentLevelXP;
  const required = nextLevelXP - currentLevelXP;
  const percentage = currentLevel >= 100 ? 100 : (current / required) * 100;
  
  return { current, required, percentage };
}

// Get tier based on level
export function getTierForLevel(level: number): typeof TIERS[number] {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (level >= TIERS[i].minLevel) {
      return TIERS[i];
    }
  }
  return TIERS[0];
}

export function useXP() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user stats
  const statsQuery = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      // If no stats exist, create them
      if (!data) {
        const { data: newStats, error: insertError } = await supabase
          .from('user_stats')
          .insert([{ user_id: user.id }])
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newStats as UserStats;
      }
      
      return data as UserStats;
    },
    enabled: !!user,
  });

  // Add XP mutation
  const addXP = useMutation({
    mutationFn: async ({ 
      xpAmount, 
      actionType 
    }: { 
      xpAmount: number; 
      actionType: 'habit' | 'task' | 'journal' | 'focus';
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const currentStats = statsQuery.data;
      if (!currentStats) throw new Error('Stats not loaded');

      const newTotalXP = currentStats.total_xp + xpAmount;
      const newLevel = calculateLevelFromXP(newTotalXP);
      const newTier = getTierForLevel(newLevel);
      
      const updateData: Partial<UserStats> = {
        total_xp: newTotalXP,
        current_level: newLevel,
        tier: newTier.name,
      };

      // Update action-specific counter
      switch (actionType) {
        case 'habit':
          updateData.habits_completed = currentStats.habits_completed + 1;
          break;
        case 'task':
          updateData.tasks_completed = currentStats.tasks_completed + 1;
          break;
        case 'journal':
          updateData.journal_entries = currentStats.journal_entries + 1;
          break;
        case 'focus':
          updateData.focus_minutes = currentStats.focus_minutes + Math.floor(xpAmount / XP_VALUES.FOCUS_PER_MINUTE);
          break;
      }

      const { data, error } = await supabase
        .from('user_stats')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      // Check for level up
      const leveledUp = newLevel > currentStats.current_level;
      const tierChanged = newTier.name !== currentStats.tier;
      
      return { 
        stats: data as UserStats, 
        leveledUp, 
        tierChanged,
        newLevel,
        newTier: newTier.name,
        xpGained: xpAmount 
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      
      // Show XP toast
      toast({
        title: `+${result.xpGained} XP`,
        description: result.leveledUp 
          ? `🎉 Level Up! You're now Level ${result.newLevel}!`
          : result.tierChanged 
            ? `🏆 New Tier Unlocked: ${result.newTier}!`
            : undefined,
      });
    },
    onError: (error) => {
      console.error('Failed to add XP:', error);
    },
  });

  const stats = statsQuery.data;
  const level = stats ? calculateLevelFromXP(stats.total_xp) : 1;
  const tier = getTierForLevel(level);
  const progress = stats ? getXPProgress(stats.total_xp) : { current: 0, required: 100, percentage: 0 };

  return {
    stats,
    isLoading: statsQuery.isLoading,
    level,
    tier,
    progress,
    totalXP: stats?.total_xp ?? 0,
    addXP,
    // Helper functions for adding specific XP types
    addHabitXP: () => addXP.mutate({ xpAmount: XP_VALUES.HABIT_COMPLETE, actionType: 'habit' }),
    addTaskXP: () => addXP.mutate({ xpAmount: XP_VALUES.TASK_COMPLETE, actionType: 'task' }),
    addJournalXP: () => addXP.mutate({ xpAmount: XP_VALUES.JOURNAL_ENTRY, actionType: 'journal' }),
    addFocusXP: (minutes: number) => addXP.mutate({ xpAmount: minutes * XP_VALUES.FOCUS_PER_MINUTE, actionType: 'focus' }),
  };
}
