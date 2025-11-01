import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { setRequestLocale } from 'next-intl/server';

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export default async function LocaleLayout({ children, params }: Props) {
  const resolvedParams = await params;
  const { locale } = resolvedParams;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // ถ้าต้องการ static rendering: ให้เรียก setRequestLocale
  setRequestLocale(locale);

  // โหลด messages (ถ้าจำเป็น) — request.ts จะใช้ header ถ้าคุณไม่เรียก setRequestLocale
  const messages = (await import(`@/locales/${locale}.json`)).default;

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
