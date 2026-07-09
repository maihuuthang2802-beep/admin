// components/layout/AuthGuard.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const init = useAuthStore(s => s.init);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    init();
    setReady(true);
  }, [init]);

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.push('/login');
    }
  }, [ready, isAuthenticated, router]);

  if (!ready) return null;
  if (!isAuthenticated) return null;
  return <>{children}</>;
}
