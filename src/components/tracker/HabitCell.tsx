import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface HabitCellProps {
  completed: boolean;
  isToday: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function HabitCell({ completed, isToday, onClick, size = 'sm' }: HabitCellProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onClick();
    setTimeout(() => setIsAnimating(false), 300);
  };

  const sizeClasses = {
    sm: 'w-7 h-7 min-w-[1.75rem]',
    md: 'w-10 h-10 min-w-[2.5rem]',
    lg: 'w-12 h-12 min-w-[3rem]',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'rounded-md border-2 flex items-center justify-center transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1',
        sizeClasses[size],
        completed
          ? 'bg-success border-success text-success-foreground'
          : 'bg-transparent border-border hover:border-muted-foreground/50 hover:bg-muted/50',
        isToday && !completed && 'border-primary/50 bg-primary/5',
        isAnimating && completed && 'animate-scale-in'
      )}
    >
      {completed && (
        <Check 
          className={cn(
            iconSizes[size],
            isAnimating && 'animate-scale-in'
          )} 
        />
      )}
    </button>
  );
}
