'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function Home() {
  const init = useAuthStore(s => s.init);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    init();
    setReady(true);
  }, [init]);

  useEffect(() => {
    if (ready) {
      router.push(isAuthenticated ? '/dashboard' : '/login');
    }
  }, [ready, isAuthenticated, router]);

  return null;
}
