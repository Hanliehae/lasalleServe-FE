import { useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth-context.jsx';
import { SidebarNav } from './components/layout/sidebar-nav.jsx';
import { LoginPage } from './components/pages/login-page';
import { RegisterPage } from './components/pages/register-page';
import { DashboardPage } from './components/pages/dashboard-page';
import { AssetsPage } from './components/pages/assets-page';
import { LoansPage } from './components/pages/loans-page';
import { ReportsPage } from './components/pages/reports-page';
import { HistoryPage } from './components/pages/history-page';
import { ExportPage } from './components/pages/export-page';
import { DamageHistoryPage } from './components/pages/damage-history-page';
import { Toaster } from './components/ui/sonner';
import { Menu, X } from 'lucide-react';
import { Button } from './components/ui/button';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [authView, setAuthView] = useState('login');
  const [currentPath, setCurrentPath] = useState('/');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    if (authView === 'register') {
      return <RegisterPage onNavigateToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onNavigateToRegister={() => setAuthView('register')} />;
  }

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <DashboardPage />;
      case '/assets':
        return <AssetsPage />;
      case '/loans':
        return <LoansPage />;
      case '/reports':
        return <ReportsPage />;
      case '/damage-history':
        return <DamageHistoryPage />;
      case '/history':
        return <HistoryPage />;
      case '/export':
        return <ExportPage />;
      case '/settings':
        return (
          <div className="space-y-6">
            <div>
              <h1>Pengaturan</h1>
              <p className="text-muted-foreground mt-2">
                Kelola pengaturan akun dan preferensi Anda
              </p>
            </div>
            <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
              Halaman pengaturan sedang dalam pengembangan
            </div>
          </div>
        );
      default:
        return <DashboardPage />;
    }
  };

  const handleNavigate = (path) => {
    setCurrentPath(path);
    setIsMobileSidebarOpen(false); // Close mobile sidebar on navigation
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <SidebarNav currentPath={currentPath} onNavigate={handleNavigate} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative h-full">
          <SidebarNav currentPath={currentPath} onNavigate={handleNavigate} />
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <X className="size-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="sticky top-0 z-30 flex items-center gap-4 border-b bg-background p-4 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <h2 className="truncate">BUF UKDLSM</h2>
        </div>

        <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
          {renderPage()}
        </div>
      </main>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

