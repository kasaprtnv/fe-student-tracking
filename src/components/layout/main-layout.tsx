'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/sidebar/sidebar';

const hiddenRoutes = ['/login'];

type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  const pathname = usePathname();

  if (hiddenRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-white p-6">{children}</main>
    </div>
  );
}
