import {
  LayoutDashboard,
  ClipboardList,
  Settings,
  ClipboardCheck,
  Files,
} from 'lucide-react';

export const sidebarItems = [
  {
    title: 'homepage.dashboard',
    icon: LayoutDashboard,
    route: '/dashboard',
  },
  {
    title: 'homepage.progressVerify',
    icon: ClipboardCheck,
    route: '/verifycertificate',
  },
  {
    title: 'homepage.mergeFiles',
    icon: Files,
    route: '/merge-files',
  },
  {
    title: 'homepage.settings',
    icon: Settings,
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
        route: '/users',
      },
    ],
  },
];
