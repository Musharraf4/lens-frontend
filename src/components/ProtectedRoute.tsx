'use client';
import { useAuth } from '@/store/AuthContext';
import { usePathname } from 'next/navigation';
import { RootLayoutContent } from './RootLayoutContent';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated && !['/login', '/register'].includes(pathname)) {
    return null;
  }

  // Skip RootLayoutContent for verification pages
  if (pathname.startsWith('/verify-email')) {
    return <div className="min-h-screen bg-neutral-25">{children}</div>;
  }
  if (pathname.startsWith('/onboarding')) {
    return <div className="min-h-screen bg-neutral-25">{children}</div>;
  }

  return <RootLayoutContent>{children}</RootLayoutContent>;
}