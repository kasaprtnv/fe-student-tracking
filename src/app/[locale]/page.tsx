'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function HomePage() {
  const t = useTranslations();
  const { locale } = useParams();

  // กำหนด locale ที่รองรับ
  const locales = ['en', 'th'];

  return (
    <>
      <h1>{t('homepage.title')}</h1>
      <div>
        {locales
          .filter(l => l !== locale)
          .map(l => (
            <Link key={l} href={`/${l}`}>
              <button>{l.toUpperCase()}</button>
            </Link>
          ))}
      </div>
    </>
  );
}
