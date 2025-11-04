'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

interface SWRProviderProps {
  children: ReactNode;
}

export default function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        refreshWhenHidden: false,
        revalidateOnMount: true,
        errorRetryCount: 3,
      }}
    >
      {children}
    </SWRConfig>
  );
}
