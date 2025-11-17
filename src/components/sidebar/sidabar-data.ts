import { LayoutDashboard, User, Users } from 'lucide-react';

export const sidebarItems = [
  {
    title: 'homepage.dashboard',
    icon: LayoutDashboard,
    route: '/',
  },
  {
    title: 'homepage.graduateList',
    icon: User,
    route: '/graduates',
  },
  {
    title: 'homepage.userManagement',
    icon: Users,
    route: '/users',
  },
];
