'use client';

import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/language-switcher';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function HomePage() {
  const t = useTranslations();
  const router = useRouter();
  const { logoutUser } = useAuth();

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
