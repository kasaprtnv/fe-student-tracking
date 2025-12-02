'use client';

import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/language-switcher';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

export default function HomePage() {
  const t = useTranslations();
  const router = useRouter();
  const { getUserProfile } = useUser();
  const { user, logoutUser } = useAuth();

  useEffect(() => {
    if (!user) {
      getUserProfile();
    }
  }, [user, getUserProfile]);

  const logout = async () => {
    logoutUser();
    router.push('/login');
  };
  return (
    <>
      <h1>{t('homepage.title')}</h1>
      <p>{t('homepage.welcomeMessage')}</p>
      <LanguageSwitcher />
      <div className="mt-4">
        <Link href="/student">Go to Students</Link>
      </div>
      <Button onClick={logout}>Logout</Button>
    </>
  );
}
