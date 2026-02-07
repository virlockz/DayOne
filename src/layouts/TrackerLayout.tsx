import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/tracker/AppSidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect } from 'react';

function TrackerContent() {
  const isMobile = useIsMobile();
  const location = useLocation();

  // On mobile, redirect root to weekly view for better UX
  if (isMobile && location.pathname === '/monthly') {
    // Let it render, but show weekly-optimized view
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-hidden">
        <header className="sticky top-0 z-40 flex items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-4 py-3 md:hidden">
          <SidebarTrigger>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SidebarTrigger>
          <span className="font-semibold text-foreground">Habit Tracker</span>
        </header>
        <div className="h-[calc(100vh-57px)] md:h-screen overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function TrackerLayout() {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <TrackerContent />
    </SidebarProvider>
  );
}
