import {NextIntlClientProvider} from 'next-intl';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({children}: Props) {
  return (
    <html lang="en">
      <body>
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
