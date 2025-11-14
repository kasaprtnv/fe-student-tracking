'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { List } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { sidebarItems } from './sidabar-data';
export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const ToggleIcon = List;

  return (
    <div
      className={cn(
        'flex h-screen flex-col border-r transition-all duration-300',
        open ? 'w-64 bg-white' : 'w-20 bg-gray-50',
      )}
    >
      <div className="p-2">
        <Button
          onClick={() => setOpen(!open)}
          variant="ghost"
          aria-label={open ? 'ปิดเมนู' : 'เปิดเมนู'}
          className={cn(
            'w-full justify-start rounded-xl font-medium transition-colors',
            open ? 'px-4' : 'justify-center px-0',
            'text-red-600 hover:text-red-700',
          )}
        >
          <ToggleIcon className={cn('h-5 w-5', open && 'mr-3')} />
          {open && 'เมนู'}
        </Button>
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
              {open && item.title}
            </Button>
          );
        })}
      </nav>

      <div className="p-3">
        <div
          role="button"
          tabIndex={0}
          className={cn(
            'flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-100',
            open ? 'justify-start' : 'justify-center',
          )}
        >
          <Avatar className={cn('h-10 w-10', open ? '' : 'mx-auto')}>
            <AvatarImage src="/avatar.png" alt="Avatar" />
            <AvatarFallback>สม</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">สมชาย ใจดี</span>
            <span className="text-muted-foreground text-xs">ผู้ดูแลระบบ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
