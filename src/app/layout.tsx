import { NextIntlClientProvider } from 'next-intl';
import React from 'react';
import ReduxProvider from '@/providers/ReduxProvider';
import SWRProvider from '@/providers/SwrProvider';
import { Toaster } from '@/components/ui/sonner';
import MainLayout from '@/components/layout/main-layout';
import './globals.css';

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <SWRProvider>
            <NextIntlClientProvider>
              <MainLayout>{children}</MainLayout>
              <Toaster />
            </NextIntlClientProvider>
          </SWRProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
