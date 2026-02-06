import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Box, 
  Archive, 
  Calculator,
  Package, 
  Printer,
  Tag,
  Settings,
  LogOut,
  User
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './ui/Button';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Дашборд', href: '/', icon: LayoutDashboard },
  { name: 'Модели', href: '/models', icon: Box },
  { name: 'Архив', href: '/archive', icon: Archive },
  { name: 'Калькулятор WB', href: '/calculator', icon: Calculator },
  { name: 'Категории', href: '/categories', icon: Tag },
  { name: 'Упаковка', href: '/packaging', icon: Package },
  { name: 'Принтеры', href: '/printers', icon: Printer },
  { name: 'Настройки', href: '/settings', icon: Settings },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <h1 className="text-xl font-bold">CRM 3D-печать</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t p-4 space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Администратор</span>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              v1.0.0 • Made with ❤️
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
