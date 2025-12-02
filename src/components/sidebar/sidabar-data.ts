import { LayoutDashboard, User, Users } from 'lucide-react';

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
    title: 'homepage.userManagement',
    icon: Users,
    route: '/users',
  },
];
