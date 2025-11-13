import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/language-switcher';
import Link from 'next/link';

export default function HomePage() {
  const t = useTranslations();
  return (
    <>
      <h1>{t('homepage.title')}</h1>
      <p>{t('homepage.welcomeMessage')}</p>
      <LanguageSwitcher />
      <div className="mt-4 flex gap-4">
        <Link href="/student">Go to Students</Link>
        <Link href="/datatable">Go to Data Table</Link>
      </div>
    </>
  );
}
