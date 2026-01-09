import {
  LayoutDashboard,
  Settings,
  ClipboardCheck,
  Files,
  User,
} from 'lucide-react';
import { UserRole } from '@/types/user';

export interface SidebarChild {
  title: string;
  route: string;
  roles?: UserRole[];
}

export interface SidebarItem {
  title: string;
  icon: typeof LayoutDashboard;
  route?: string;
  roles?: UserRole[];
  children?: SidebarChild[];
}

export const sidebarItems: SidebarItem[] = [
  {
    title: 'homepage.dashboard',
    icon: LayoutDashboard,
    route: '/dashboard',
    roles: ['admin', 'teacher'],
  },
  {
    title: 'student-page.title',
    icon: User,
    route: '/students',
    roles: ['admin', 'teacher'],
  },
  {
    title: 'homepage.progressVerify',
    icon: ClipboardCheck,
    route: '/verifycertificate',
    roles: ['admin', 'teacher'],
  },
  {
    title: 'homepage.mergeFiles',
    icon: Files,
    route: '/merge-files',
    roles: ['admin'],
  },
  {
    title: 'homepage.settings',
    icon: Settings,
    roles: ['admin'],
    children: [
      {
        title: 'course.title',
        route: '/course',
      },
      {
        title: 'milestone.title',
        route: '/milestone',
      },
      {
        title: 'homepage.userManagement',
        route: '/user',
      },
    ],
  },
];
