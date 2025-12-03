import { NextIntlClientProvider } from 'next-intl';
import React from 'react';
import ReduxProvider from '@/providers/ReduxProvider';
import SWRProvider from '@/providers/SwrProvider';
import { Toaster } from '@/components/ui/sonner';
import MainLayout from '@/components/layout/main-layout';
import './globals.css';
import AuthProvider from '@/providers/AuthProvider';

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <SWRProvider>
            <AuthProvider>
              <NextIntlClientProvider>
                <MainLayout>{children}</MainLayout>
                <Toaster />
              </NextIntlClientProvider>
            </AuthProvider>
          </SWRProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
