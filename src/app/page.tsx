import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function HomePage() {
  const t = useTranslations();
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
