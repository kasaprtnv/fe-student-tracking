'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { setLocale } from '@/actions/setLocale';
import Image from 'next/image';
import { ArrowRight, LogOut } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { sidebarItems } from './sidabar-data';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const [, startTransition] = useTransition();
  const hiddenRoutes = [`${BASE_PATH}/login`];

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
                src={`${BASE_PATH}/logobuu.png`}
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
          className={cn(
            'flex items-center rounded-lg p-2',
            open ? 'justify-between' : 'flex-col gap-2',
          )}
        >
          <div
            role="button"
            tabIndex={0}
            className={cn(
              'flex cursor-pointer items-center rounded-lg transition-colors hover:bg-gray-100',
              open ? 'gap-3 pr-2' : 'justify-center p-1',
            )}
            onClick={() => router.push(`/profile/${user?.id}`)}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src="/avatar.png" alt="Avatar" />
              <AvatarFallback>{`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`}</AvatarFallback>
            </Avatar>
            {open && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">{`${user?.firstName} ${user?.lastName}`}</span>
                {user?.role && (
                  <span className="text-xs text-gray-500">
                    {t(`role.${user.role}`)}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
            title={t('homepage.logout')}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
