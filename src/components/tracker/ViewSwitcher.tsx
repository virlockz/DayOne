import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const views = [
  { label: 'Monthly', path: '/monthly' },
  { label: 'Weekly', path: '/weekly' },
];

export function ViewSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const currentView = views.find(v => v.path === location.pathname) || views[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative z-50">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full',
          'bg-card border border-border shadow-sm',
          'text-sm font-medium text-foreground',
          'hover:bg-muted transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
        )}
      >
        <span>{currentView.label} View</span>
        <ChevronDown 
          className={cn(
            'w-4 h-4 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180'
          )} 
        />
      </button>

      {/* Dropdown Menu */}
      <div
        className={cn(
          'absolute right-0 mt-2 w-44',
          'bg-card border border-border rounded-xl shadow-lg',
          'overflow-hidden',
          'transition-all duration-250 ease-out origin-top',
          isOpen 
            ? 'opacity-100 scale-y-100 translate-y-0' 
            : 'opacity-0 scale-y-0 -translate-y-2 pointer-events-none'
        )}
      >
        <div className="py-1">
          {views.map((view) => {
            const isActive = view.path === location.pathname;
            return (
              <button
                key={view.path}
                onClick={() => handleSelect(view.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5',
                  'text-sm font-medium text-left',
                  'hover:bg-muted transition-colors duration-150',
                  isActive ? 'text-primary' : 'text-foreground'
                )}
              >
                <span className="w-4 flex justify-center">
                  {isActive && <Check className="w-4 h-4" />}
                </span>
                <span>View {view.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
