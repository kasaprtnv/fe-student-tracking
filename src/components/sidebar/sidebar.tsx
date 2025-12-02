'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { setLocale } from '@/actions/setLocale';
import Image from 'next/image';
import LogoBuu from './logobuu.png';
import { ArrowRight, LogOut } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { sidebarItems } from './sidabar-data';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';

// หน้าที่ไม่ต้องการแสดง Sidebar
const hiddenRoutes = ['/login', '/signup'];

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const t = useTranslations();
  const locale = useLocale();
  const { logoutUser } = useAuth();

  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  function changeLanguage(newLocale: string) {
    startTransition(async () => {
      await setLocale(newLocale);
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        'flex h-screen flex-col border-r transition-all duration-300',
        open ? 'w-64 bg-white' : 'w-20 bg-gray-50',
      )}
    >
      <div className="p-3">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setOpen(!open)}
          className={cn(
            'flex cursor-pointer items-center rounded-xl p-3 transition-colors',
            open
              ? 'justify-start gap-3 bg-transparent text-black hover:bg-gray-100'
              : 'justify-center bg-white text-black hover:bg-gray-100',
          )}
        >
          {open ? (
            <div className="h-10 w-full max-w-[220px]">
              <Image
                src={LogoBuu}
                alt="BUU Logo"
                width={220}
                height={40}
                className="object-contain"
              />
            </div>
          ) : (
            <ArrowRight className="h-6 w-6" />
          )}
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2 p-2">
        {sidebarItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.route;

          return (
            <Button
              key={index}
              variant="ghost"
              className={cn(
                'w-full justify-start rounded-xl font-medium transition-colors',
                open ? 'px-4' : 'justify-center px-0',
                isActive
                  ? 'bg-red-500 text-white hover:bg-red-500'
                  : 'hover:bg-red-100 hover:text-red-600',
              )}
              onClick={() => router.push(item.route)}
            >
              <Icon className={cn('h-5 w-5', open && 'mr-3')} />
              {open && t(item.title)}
            </Button>
          );
        })}

        {/* Logout Button */}
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start rounded-xl font-medium text-red-600 transition-colors hover:bg-red-100 hover:text-red-700',
            open ? 'px-4' : 'justify-center px-0',
          )}
          onClick={handleLogout}
        >
          <LogOut className={cn('h-5 w-5', open && 'mr-3')} />
          {open && t('homepage.logout')}
        </Button>
      </nav>

      <div className={cn('flex justify-center pb-3', open ? 'px-3' : '')}>
        {open ? (
          <div
            className={cn(
              'inline-flex rounded-full bg-gray-100 p-1',
              open && 'w-full',
            )}
          >
            <button
              onClick={() => changeLanguage('en')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium transition-colors',
                locale === 'en' ? 'bg-white shadow-sm' : 'hover:bg-white/50',
              )}
            >
              <Image
                src="https://flagcdn.com/w40/gb.png"
                alt="EN"
                width={27}
                height={14}
              />
              EN
            </button>
            <button
              onClick={() => changeLanguage('th')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium transition-colors',
                locale === 'th' ? 'bg-white shadow-sm' : 'hover:bg-white/50',
              )}
            >
              <Image
                src="https://flagcdn.com/w40/th.png"
                alt="TH"
                width={21}
                height={14}
              />
              TH
            </button>
          </div>
        ) : (
          <Image
            src={
              locale === 'th'
                ? 'https://flagcdn.com/w40/th.png'
                : 'https://flagcdn.com/w40/gb.png'
            }
            alt={locale === 'th' ? 'TH' : 'EN'}
            width={locale === 'th' ? 21 : 27}
            height={14}
          />
        )}
      </div>
      <div className="border-t-2 border-gray-200 p-3">
        <div
          role="button"
          tabIndex={0}
          className={cn(
            'flex cursor-pointer items-center rounded-lg p-2 transition-colors hover:bg-gray-100',
            open ? 'justify-start gap-3' : 'justify-center',
          )}
          onClick={() => router.push('/profile')}
        >
          <Avatar className={cn('h-10 w-10', open ? '' : 'mx-auto')}>
            <AvatarImage src="/avatar.png" alt="Avatar" />
            <AvatarFallback>สม</AvatarFallback>
          </Avatar>
          {open && (
            <div className="flex flex-col">
              <span className="text-sm font-medium">สมชาย ใจดี</span>
              <span className="text-muted-foreground text-xs">ผู้ดูแลระบบ</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
