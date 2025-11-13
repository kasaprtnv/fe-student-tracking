'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { setLocale } from '@/actions/setLocale';
import { Button } from './ui/button';

export default function LanguageSwitcher() {
  const [, startTransition] = useTransition();
  const router = useRouter();

  function changeLanguage(locale: string) {
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  }

  return (
    <div className="space-x-2">
      <Button onClick={() => changeLanguage('en')}>EN</Button>
      <Button onClick={() => changeLanguage('th')}>TH</Button>
    </div>
  );
}
