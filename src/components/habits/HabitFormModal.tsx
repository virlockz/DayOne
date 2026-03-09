import { useState } from 'react';
import { Plus, Sparkles, CheckCircle2, Pencil, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Habit, HabitCategory, HabitSchedule, PRESET_CATEGORIES, CustomCategory } from '@/types/habits';
import { cn } from '@/lib/utils';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const HABIT_COLORS = [
  '#10b981', '#059669', '#84cc16', '#eab308', '#f59e0b',
  '#f97316', '#ef4444', '#ec4899', '#a855f7', '#8b5cf6',
  '#6366f1', '#3b82f6', '#06b6d4',
];

type RepeatOption = 'daily' | 'weekdays' | 'weekends' | 'pick-days' | 'x-per-week';

interface HabitFormModalProps {
  onSubmit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  customCategories: CustomCategory[];
  trigger?: React.ReactNode;
  initialData?: Partial<Habit>;
  mode?: 'create' | 'edit';
}

export function HabitFormModal({
  onSubmit,
  customCategories,
  trigger,
  initialData,
  mode = 'create',
}: HabitFormModalProps) {
  const [open, setOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  // Form state
  const [name, setName] = useState(initialData?.name || '');
  const [color, setColor] = useState(initialData?.color || HABIT_COLORS[0]);
  const [repeatOption, setRepeatOption] = useState<RepeatOption>(() => {
    if (!initialData?.schedule) return 'daily';
    if (initialData.schedule.type === 'daily') return 'daily';
    if (initialData.schedule.type === 'monthly') return 'x-per-week';
    if (initialData.schedule.type === 'weekly') {
      const days = initialData.schedule.targetDays || [];
      if (JSON.stringify(days.sort()) === JSON.stringify([1, 2, 3, 4, 5])) return 'weekdays';
      if (JSON.stringify(days.sort()) === JSON.stringify([0, 6])) return 'weekends';
      return 'pick-days';
    }
    return 'daily';
  });
  const [targetDays, setTargetDays] = useState<number[]>(
    initialData?.schedule?.targetDays || [1, 2, 3, 4, 5]
  );
  const [weeklyTarget, setWeeklyTarget] = useState(
    initialData?.schedule?.targetCount || 3
  );

  // Customize fields
  const [stackingCue, setStackingCue] = useState(initialData?.stackingCue || '');
  const [stackingAction, setStackingAction] = useState(initialData?.stackingAction || '');
  const [twoMinuteAction, setTwoMinuteAction] = useState(initialData?.twoMinuteAction || '');
  const [contextCue, setContextCue] = useState(initialData?.contextCue || '');
  const [category, setCategory] = useState<HabitCategory>(initialData?.category || 'productivity');

  const resetForm = () => {
    setName('');
    setColor(HABIT_COLORS[0]);
    setRepeatOption('daily');
    setTargetDays([1, 2, 3, 4, 5]);
    setWeeklyTarget(3);
    setStackingCue('');
    setStackingAction('');
    setTwoMinuteAction('');
    setContextCue('');
    setCategory('productivity');
    setCustomizeOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let schedule: HabitSchedule;
    switch (repeatOption) {
      case 'daily':
        schedule = { type: 'daily' };
        break;
      case 'weekdays':
        schedule = { type: 'weekly', targetDays: [1, 2, 3, 4, 5] };
        break;
      case 'weekends':
        schedule = { type: 'weekly', targetDays: [0, 6] };
        break;
      case 'pick-days':
        schedule = { type: 'weekly', targetDays };
        break;
      case 'x-per-week':
        schedule = { type: 'monthly', targetCount: weeklyTarget * 4 };
        break;
      default:
        schedule = { type: 'daily' };
    }

    onSubmit({
      name: name.trim(),
      stackingCue: stackingCue.trim() || undefined,
      stackingAction: stackingAction.trim() || undefined,
      twoMinuteAction: twoMinuteAction.trim() || undefined,
      contextCue: contextCue.trim() || undefined,
      category,
      customCategoryName: undefined,
      schedule,
      color,
    });

    resetForm();
    setOpen(false);
  };

  const toggleDay = (day: number) => {
    setTargetDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const repeatOptions: { value: RepeatOption; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekdays', label: 'Weekdays' },
    { value: 'weekends', label: 'Weekends' },
    { value: 'pick-days', label: 'Pick days' },
    { value: 'x-per-week', label: 'X per week' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 text-black">
            <Plus className="w-4 h-4" />
            Add Habit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {mode === 'create' ? 'New Habit' : 'Edit Habit'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Name Input with Icon */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 relative" style={{ backgroundColor: `${color}15` }}>
              <CheckCircle2 className="w-6 h-6" style={{ color }} />
              <Pencil className="w-3 h-3 absolute -bottom-0.5 -right-0.5 text-muted-foreground" />
            </div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Exercise 30min, Read 10 pages..."
              className="flex-1 border-border"
              required
            />
          </div>

          {/* Browse templates link */}
          <button type="button" className="flex items-center gap-1.5 text-sm font-medium" style={{ color: HABIT_COLORS[0] }}>
            <Sparkles className="w-4 h-4" />
            Browse templates
          </button>

          {/* Repeat Section */}
          <div className="space-y-3">
            <span className="text-sm text-muted-foreground font-medium">Repeat</span>
            <div className="flex flex-wrap gap-2">
              {repeatOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRepeatOption(opt.value)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors border',
                    repeatOption === opt.value
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-transparent text-foreground border-border hover:bg-secondary'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Pick days detail */}
            {repeatOption === 'pick-days' && (
              <div className="flex flex-wrap gap-2 pt-1">
                {DAYS_OF_WEEK.map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={cn(
                      'w-10 h-10 rounded-full text-sm font-medium transition-colors',
                      targetDays.includes(index)
                        ? 'text-white'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    )}
                    style={targetDays.includes(index) ? { backgroundColor: color } : undefined}
                  >
                    {day.charAt(0)}
                  </button>
                ))}
              </div>
            )}

            {/* X per week detail */}
            {repeatOption === 'x-per-week' && (
              <div className="flex items-center gap-3 pt-1">
                <Input
                  type="number"
                  min={1}
                  max={7}
                  value={weeklyTarget}
                  onChange={(e) => setWeeklyTarget(parseInt(e.target.value) || 1)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">times per week</span>
              </div>
            )}
          </div>

          {/* Color Picker */}
          <div className="flex flex-wrap gap-2.5">
            {HABIT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  'w-8 h-8 rounded-full transition-all',
                  color === c ? 'ring-2 ring-offset-2 ring-offset-background' : ''
                )}
                style={{ backgroundColor: c, ...(color === c ? { ringColor: c } : {}) }}
              />
            ))}
          </div>

          {/* Customize (Collapsible) */}
          <Collapsible open={customizeOpen} onOpenChange={setCustomizeOpen}>
            <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight className={cn('w-4 h-4 transition-transform', customizeOpen && 'rotate-90')} />
              Customize
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              {/* Category */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Habit Area</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PRESET_CATEGORIES).map(([key, { name: catName, color: catColor }]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCategory(key as HabitCategory)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
                        category === key
                          ? 'border-transparent text-white'
                          : 'border-border text-muted-foreground hover:bg-secondary'
                      )}
                      style={category === key ? { backgroundColor: catColor } : undefined}
                    >
                      {catName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Habit Stacking */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Habit Stacking</Label>
                <Input
                  value={stackingCue}
                  onChange={(e) => setStackingCue(e.target.value)}
                  placeholder="After I..."
                  className="text-sm"
                />
                <Input
                  value={stackingAction}
                  onChange={(e) => setStackingAction(e.target.value)}
                  placeholder="I will..."
                  className="text-sm"
                />
              </div>

              {/* 2-Minute Action */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">2-Minute Entry Action</Label>
                <Input
                  value={twoMinuteAction}
                  onChange={(e) => setTwoMinuteAction(e.target.value)}
                  placeholder="Smallest version to start with..."
                  className="text-sm"
                />
              </div>

              {/* Context Cue */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Context Cue</Label>
                <Input
                  value={contextCue}
                  onChange={(e) => setContextCue(e.target.value)}
                  placeholder="Where and when..."
                  className="text-sm"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Divider + Actions */}
          <div className="border-t border-border pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()} className="px-6">
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
