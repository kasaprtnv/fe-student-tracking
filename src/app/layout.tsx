import { NextIntlClientProvider } from 'next-intl';
import React from 'react';
import ReduxProvider from '@/providers/ReduxProvider';
import SWRProvider from '@/providers/SwrProvider';
import './globals.css';
import Sidebar from '@/components/sidebar/sidebar';

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
              <div className="flex h-screen">
                <Sidebar />
                <main className="flex-1 overflow-auto p-6">{children}</main>
              </div>
            </NextIntlClientProvider>
          </SWRProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
