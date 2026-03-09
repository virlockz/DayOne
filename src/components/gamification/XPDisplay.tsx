import { useXP, TIERS } from '@/hooks/useXP';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Star, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface XPDisplayProps {
  compact?: boolean;
  className?: string;
}

export function XPDisplay({ compact = false, className }: XPDisplayProps) {
  const { stats, isLoading, level, tier, progress, totalXP } = useXP();

  if (isLoading) {
    return (
      <div className={cn("animate-pulse bg-muted rounded-xl h-20", className)} />
    );
  }

  if (compact) {
    return (
      <div 
        className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-xl bg-card border border-border",
          className
        )}
      >
        <div 
          className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm"
          style={{ 
            backgroundColor: tier.color,
            color: 'hsl(var(--background))'
          }}
        >
          {level}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground">{tier.name}</span>
            <Sparkles className="w-3 h-3" style={{ color: tier.color }} />
          </div>
          <Progress 
            value={progress.percentage} 
            className="h-2" 
          />
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground">
            {totalXP.toLocaleString()} XP
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-secondary/30 border border-border p-6",
        className
      )}
    >
      {/* Background decoration */}
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: tier.color }}
      />
      
      <div className="relative z-10">
        {/* Level badge and tier */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div 
              className="flex items-center justify-center w-16 h-16 rounded-2xl font-bold text-2xl shadow-lg"
              style={{ 
                backgroundColor: tier.color,
                color: 'hsl(var(--background))'
              }}
            >
              {level}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                <Trophy className="w-5 h-5" style={{ color: tier.color }} />
              </div>
              <p className="text-sm text-muted-foreground">Level {level} of 100</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-1 text-2xl font-bold text-foreground">
              <Sparkles className="w-5 h-5" style={{ color: tier.color }} />
              {totalXP.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </div>
        </div>

        {/* XP Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress to Level {Math.min(level + 1, 100)}</span>
            <span className="text-foreground font-medium">
              {Math.floor(progress.current).toLocaleString()} / {progress.required.toLocaleString()} XP
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={progress.percentage} 
              className="h-3"
            />
          </div>
        </div>

        {/* Stats summary */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-border">
            <StatItem 
              label="Habits" 
              value={stats.habits_completed} 
              icon={<Star className="w-4 h-4" />}
            />
            <StatItem 
              label="Tasks" 
              value={stats.tasks_completed} 
              icon={<Star className="w-4 h-4" />}
            />
            <StatItem 
              label="Journal" 
              value={stats.journal_entries} 
              icon={<Star className="w-4 h-4" />}
            />
            <StatItem 
              label="Focus" 
              value={`${stats.focus_minutes}m`} 
              icon={<Star className="w-4 h-4" />}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value: number | string; 
  icon: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-lg font-bold text-foreground">
        {value}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// Tier progress display
export function TierProgress({ className }: { className?: string }) {
  const { level, tier } = useXP();
  
  const currentTierIndex = TIERS.findIndex(t => t.name === tier.name);
  const nextTier = TIERS[currentTierIndex + 1];
  
  if (!nextTier) {
    return (
      <div className={cn("text-center p-4", className)}>
        <Trophy className="w-8 h-8 mx-auto mb-2" style={{ color: tier.color }} />
        <p className="text-sm font-medium text-foreground">Maximum Tier Reached!</p>
        <p className="text-xs text-muted-foreground">You are {tier.name}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: tier.color }}
          />
          <span className="font-medium">{tier.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{nextTier.name}</span>
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: nextTier.color }}
          />
        </div>
      </div>
      <Progress 
        value={((level - tier.minLevel) / (nextTier.minLevel - tier.minLevel)) * 100}
        className="h-2"
      />
      <p className="text-xs text-muted-foreground text-center">
        {nextTier.minLevel - level} levels until {nextTier.name}
      </p>
    </div>
  );
}
