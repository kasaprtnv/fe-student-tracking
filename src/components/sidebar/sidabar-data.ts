import {
  LayoutDashboard,
  ClipboardList,
  UserCog,
  BookOpen,
  ListOrdered,
  ClipboardCheck,
} from 'lucide-react';

export const sidebarItems = [
  {
    title: 'homepage.dashboard',
    icon: LayoutDashboard,
    route: '/',
  },
  {
    title: 'homepage.studentReport',
    icon: ClipboardList,
    route: '/report',
  },
  {
    title: 'course.title',
    icon: BookOpen,
    route: '/course',
  },
  {
    title: 'milestone.title',
    icon: ListOrdered,
    route: '/milestone',
  },
  {
    title: 'homepage.studentManagement',
    icon: UserCog,
    route: '/student',
  },
  {
    title: 'homepage.progressVerify',
    icon: ClipboardCheck,
    route: '/progress-verify',
  },
];
