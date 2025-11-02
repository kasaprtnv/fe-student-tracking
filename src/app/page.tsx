import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/language-switcher';

export default function HomePage() {
  const t = useTranslations();
  return (
    <>
      <h1>{t('homepage.title')}</h1>
      <LanguageSwitcher />
    </>
  );
}
