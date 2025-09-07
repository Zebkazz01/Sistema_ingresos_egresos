import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  DollarSign,
  Users,
  BarChart3,
  LogOut,
  Menu,
  Bell,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { authClient } from '@/lib/auth-client';
import { useAuth } from '@/hooks/use-auth';

interface MainLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
}

const getNavItems = (userRole?: string): NavItem[] => {
  const baseItems = [
    {
      href: '/dashboard',
      icon: BarChart3,
      label: 'Dashboard',
    },
    {
      href: '/movements',
      icon: DollarSign,
      label: 'Movimientos',
    },
  ];

  // Mostrar opciones de administrador
  if (userRole === 'ADMIN') {
    baseItems.push(
      {
        href: '/users',
        icon: Users,
        label: 'Usuarios',
      },
      {
        href: '/reports',
        icon: BarChart3,
        label: 'Reportes',
      }
    );
  }

  return baseItems;
};

export function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50/50'>
      {/* Sidebar para desktop */}
      <div className='hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col'>
        <div className='flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white'>
          {/* Logo */}
          <div className='flex h-16 flex-shrink-0 items-center border-b border-gray-200 px-4'>
            <div className='flex items-center'>
              <DollarSign className='h-8 w-8 text-primary' />
              <span className='ml-2 text-xl font-bold text-gray-900'>
                Finanzas Logo
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className='flex flex-1 flex-col overflow-y-auto pt-5 pb-4'>
            <nav className='mt-5 flex-1 space-y-1 px-2'>
              {getNavItems(user?.role).map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive
                          ? 'text-primary-foreground'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.label}
                    {item.badge && (
                      <Badge variant='secondary' className='ml-auto'>
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* User section */}
            <div className='flex-shrink-0 border-t border-gray-200 p-4'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <div className='h-8 w-8 rounded-full bg-primary flex items-center justify-center'>
                    <User className='h-5 w-5 text-primary-foreground' />
                  </div>
                </div>
                <div className='ml-3 flex-1'>
                  <p className='text-sm font-medium text-gray-700'>
                    {user?.name || 'Usuario'}
                  </p>
                  <p className='text-xs text-gray-500'>{user?.email || ''}</p>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleSignOut}
                  className='ml-2'
                >
                  <LogOut className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className='relative z-40 lg:hidden'>
          <div className='fixed inset-0 flex'>
            <div
              className='fixed inset-0 bg-gray-600 bg-opacity-75'
              onClick={() => setSidebarOpen(false)}
            />
            <div className='relative flex w-full max-w-xs flex-1 flex-col bg-white'>
              <div className='absolute top-0 right-0 -mr-12 pt-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setSidebarOpen(false)}
                  className='ml-1 flex h-10 w-10 items-center justify-center'
                >
                  <span className='sr-only'>Close sidebar</span>
                  <Menu className='h-6 w-6 text-white' />
                </Button>
              </div>
              {/* Mobile navigation content (same as desktop) */}
            </div>
          </div>
        </div>
      )}

      {/* Content area */}
      <div className='flex flex-1 flex-col lg:pl-72'>
        {/* Top bar */}
        <div className='sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white shadow-sm'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setSidebarOpen(true)}
            className='border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary lg:hidden'
          >
            <span className='sr-only'>Open sidebar</span>
            <Menu className='h-6 w-6' />
          </Button>

          <div className='flex flex-1 justify-between px-4 sm:px-6'>
            <div className='flex flex-1'>
              <div className='flex items-center'>
                <h1 className='text-lg font-semibold text-gray-900'>
                  {getPageTitle(router.pathname)}
                </h1>
              </div>
            </div>
            <div className='ml-4 flex items-center space-x-2'>
              <Button variant='ghost' size='sm'>
                <Bell className='h-5 w-5' />
              </Button>
              <div className='h-6 w-px bg-gray-200' />
              <Button
                variant='ghost'
                size='sm'
                onClick={handleSignOut}
                className='text-gray-500 hover:text-gray-700'
              >
                <LogOut className='h-5 w-5' />
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className='flex-1'>
          <div className='py-8'>
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/movements': 'Ingresos y egresos',
    '/users': 'Usuarios',
    '/reports': 'Reportes',
  };

  return titles[pathname] || 'Sistema Financiero';
}
