'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { setLocale } from '@/actions/setLocale';

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
    <div>
      <button onClick={() => changeLanguage('en')}>EN</button>
      <button onClick={() => changeLanguage('th')}>TH</button>
    </div>
  );
}
