'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useUser } from '@/hooks/use-user';
import { useAuth } from '@/hooks/use-auth';

export default function HomePage() {
  const t = useTranslations();
  const { getUserProfile } = useUser();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      getUserProfile();
    }
  }, [user, getUserProfile]);

  return (
    <>
      <h1>{t('homepage.title')}</h1>
      <p>{t('homepage.welcomeMessage')}</p>
      <div className="mt-4">
        <Link href="/student">Go to Students</Link>
      </div>
    </>
  );
}
