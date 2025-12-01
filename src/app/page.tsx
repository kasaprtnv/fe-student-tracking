'use client';

import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/language-switcher';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const t = useTranslations();
  const router = useRouter();

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore 401/403 on logout; still navigate away
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Logout failed; redirecting anyway', err);
      }
    } finally {
      router.push('/login');
    }
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
