'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function Home() {
  const { isAuthenticated, init } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    init();
    router.push(isAuthenticated ? '/dashboard' : '/login');
  }, [isAuthenticated, init, router]);
  return null;
}
