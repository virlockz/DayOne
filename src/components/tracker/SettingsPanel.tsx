import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Habit } from '@/hooks/useLocalHabits';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface SettingsPanelProps {
  habits: Habit[];
  addHabit: (name: string) => void;
  updateHabit: (id: string, name: string) => void;
  deleteHabit: (id: string) => void;
}

export function SettingsPanel({ habits, addHabit, updateHabit, deleteHabit }: SettingsPanelProps) {
  const [newHabitName, setNewHabitName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      addHabit(newHabitName);
      setNewHabitName('');
    }
  };

  const startEditing = (habit: Habit) => {
    setEditingId(habit.id);
    setEditingName(habit.name);
  };

  const saveEdit = () => {
    if (editingId && editingName.trim()) {
      updateHabit(editingId, editingName);
      setEditingId(null);
      setEditingName('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-display font-semibold text-foreground mb-6">
        Settings
      </h2>

      {/* Add New Habit */}
      <div className="bg-card rounded-xl p-6 shadow-card mb-6">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
          Add New Habit
        </h3>
        <form onSubmit={handleAddHabit} className="flex gap-3">
          <Input
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="Enter habit name..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newHabitName.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </form>
      </div>

      {/* Existing Habits */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
          Your Habits ({habits.length})
        </h3>

        {habits.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">
            No habits yet. Add one above to get started!
          </p>
        ) : (
          <div className="space-y-2">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg transition-colors',
                  'bg-secondary/50 hover:bg-secondary'
                )}
              >
                {editingId === habit.id ? (
                  <>
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                    />
                    <Button size="icon" variant="ghost" onClick={saveEdit}>
                      <Check className="w-4 h-4 text-success" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={cancelEdit}>
                      <X className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-medium text-foreground">
                      {habit.name}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => startEditing(habit)}
                    >
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Habit</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{habit.name}"? This will also remove all tracking history for this habit.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteHabit(habit.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
