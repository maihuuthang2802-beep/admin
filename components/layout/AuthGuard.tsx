// components/layout/AuthGuard.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, init } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    init();
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, init, router]);

  if (!isAuthenticated) return null;
  return <>{children}</>;
}
