'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { LoadingSpinner } from './LoadingSpinner';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { usuario, token, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const publicPaths = ['/login', '/primeiro-acesso'];
    const isPublicPath = publicPaths.includes(pathname);

    // Se não há token, limpa o estado e redireciona para login
    if (!token) {
      logout();
      if (!isPublicPath) {
        router.push('/login');
      }
    } else if (token && isPublicPath) {
      router.push('/');
    }

    setLoading(false);
  }, [token, pathname, router, logout]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
