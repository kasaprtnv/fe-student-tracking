import { NextIntlClientProvider } from 'next-intl';
import React from 'react';
import ReduxProvider from '@/providers/ReduxProvider';
import SWRProvider from '@/providers/SwrProvider';

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <SWRProvider>
            <NextIntlClientProvider>{children}</NextIntlClientProvider>
          </SWRProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
