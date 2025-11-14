import { LayoutDashboard, User, Users } from 'lucide-react';

export const sidebarItems = [
  {
    title: 'แดชบอร์ด',
    icon: LayoutDashboard,
    route: '/',
  },
  {
    title: 'รายชื่อบัณฑิต',
    icon: User,
    route: '/graduates',
  },
  {
    title: 'จัดการข้อมูลผู้ใช้งาน',
    icon: Users,
    route: '/users',
  },
];
