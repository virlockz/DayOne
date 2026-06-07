import { useEffect, useState, useMemo } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type TaskStatus = 'todo' | 'in_progress' | 'done';

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
}

const STORAGE_KEY = 'task-board-tasks';

const COLUMNS: { id: TaskStatus; title: string; accent: string }[] = [
  { id: 'todo', title: 'To Do', accent: 'border-t-muted-foreground/40' },
  { id: 'in_progress', title: 'In Progress', accent: 'border-t-primary' },
  { id: 'done', title: 'Done', accent: 'border-t-success' },
];

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStatus, setNewStatus] = useState<TaskStatus>('todo');
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTasks(JSON.parse(raw));
    } catch (e) {
      console.error('Failed to load tasks', e);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, loaded]);

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
    tasks.forEach((t) => map[t.status].push(t));
    return map;
  }, [tasks]);

  const addTask = () => {
    const title = newTitle.trim();
    if (!title) return;
    setTasks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title, status: newStatus, createdAt: new Date().toISOString() },
    ]);
    setNewTitle('');
    setNewStatus('todo');
    setOpen(false);
  };

  const moveTask = (id: string, status: TaskStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleDone = (task: Task) => {
    moveTask(task.id, task.status === 'done' ? 'todo' : 'done');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-semibold text-foreground">
            Task Board
          </h2>
          <p className="text-sm text-muted-foreground">
            Organize your tasks across To Do, In Progress, and Done.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 bg-premium hover:bg-premium/90 text-black shadow-md hover:shadow-lg">
              <Plus className="w-5 h-5 text-black" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Title</label>
                <Input
                  autoFocus
                  placeholder="e.g. Finish project report"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Column</label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as TaskStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLUMNS.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={addTask} className="text-black">Add Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (draggingId) {
                moveTask(draggingId, col.id);
                setDraggingId(null);
              }
            }}
            className={cn(
              'bg-card rounded-2xl border border-border border-t-4 shadow-card p-4 flex flex-col min-h-[200px]',
              col.accent
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                {col.title}
              </h3>
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                {grouped[col.id].length}
              </span>
            </div>

            <div className="space-y-2 flex-1">
              {grouped[col.id].length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No tasks here
                </p>
              ) : (
                grouped[col.id].map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => setDraggingId(task.id)}
                    onDragEnd={() => setDraggingId(null)}
                    className={cn(
                      'group bg-background rounded-xl border border-border p-3 flex items-start gap-3 cursor-grab active:cursor-grabbing transition-all hover:shadow-md',
                      task.status === 'done' && 'opacity-70'
                    )}
                  >
                    <button
                      onClick={() => toggleDone(task)}
                      className={cn(
                        'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                        task.status === 'done'
                          ? 'bg-success border-success text-success-foreground'
                          : 'border-muted-foreground/40 hover:border-primary'
                      )}
                    >
                      {task.status === 'done' && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <p
                      className={cn(
                        'text-sm text-foreground flex-1 break-words',
                        task.status === 'done' && 'line-through'
                      )}
                    >
                      {task.title}
                    </p>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                      aria-label="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Quick move buttons (mobile-friendly) */}
            <div className="mt-3 flex flex-wrap gap-1.5 md:hidden">
              {grouped[col.id].map((task) => (
                <Select
                  key={`mv-${task.id}`}
                  value={task.status}
                  onValueChange={(v) => moveTask(task.id, v as TaskStatus)}
                >
                  <SelectTrigger className="h-7 text-xs w-auto">
                    <SelectValue placeholder="Move" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLUMNS.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {task.title.slice(0, 14)} → {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
