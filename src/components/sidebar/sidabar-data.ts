import {
  LayoutDashboard,
  ClipboardList,
  UserCog,
  BookOpen,
  ListOrdered,
  ClipboardCheck,
  User,
} from 'lucide-react';

export const sidebarItems = [
  {
    title: 'homepage.dashboard',
    icon: LayoutDashboard,
    route: '/dashboard',
  },
  {
    title: 'homepage.graduateList',
    icon: User,
    route: '/students',
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
    route: '/users',
  },
  {
    title: 'homepage.progressVerify',
    icon: ClipboardCheck,
    route: '/progress-verify',
  },
];
