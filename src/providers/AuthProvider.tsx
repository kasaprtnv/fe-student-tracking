'use client';

import { useAuth } from '@/hooks/use-auth';
import { useUser } from '@/hooks/use-user';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, initialized, isAuthenticated, validateToken } = useAuth();
  const { getUserProfile } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const didValidateRef = useRef(false);

  useEffect(() => {
    if (!didValidateRef.current) {
      validateToken();
      didValidateRef.current = true;
    }
  });

  useEffect(() => {
    if (initialized && isAuthenticated && !user) {
      getUserProfile();
    }
  }, [initialized, isAuthenticated, user, getUserProfile]);

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      const skipPaths = ['/login', '/signup'];
      if (!pathname || skipPaths.some((p) => pathname.startsWith(p))) return;
      router.push('/login');
    }
  }, [initialized, isAuthenticated, pathname, router]);

  return <>{children}</>;
}
