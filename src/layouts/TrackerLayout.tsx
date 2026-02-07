import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ViewSwitcher } from '@/components/tracker/ViewSwitcher';

export default function TrackerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSettingsPage = location.pathname === '/settings';

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          {/* Left side - Settings */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className={isSettingsPage ? 'text-primary' : 'text-muted-foreground'}
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* Right side - View Switcher */}
          {!isSettingsPage && <ViewSwitcher />}
        </div>
      </header>

      {/* Main Content */}
      <main className="h-[calc(100vh-57px)] overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
