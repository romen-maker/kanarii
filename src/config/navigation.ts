import { Home, User, CheckSquare, Briefcase, FileText, Settings, Calendar } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: any;
  adminOnly?: boolean;
}

export const navigationConfig: NavItem[] = [
  {
    label: 'Inicio',
    href: '/',
    icon: Home,
  },
  {
    label: 'Mi Ficha',
    href: '/ficha',
    icon: User,
  },
  {
    label: 'Tareas',
    href: '/tareas',
    icon: CheckSquare,
  },
  {
    label: 'Calendario',
    href: '/calendario',
    icon: Calendar,
  },
  {
    label: 'Proyectos',
    href: '/proyectos',
    icon: Briefcase,
  },
  {
    label: 'Actas',
    href: '/actas',
    icon: FileText,
  },
  {
    label: 'Panel Admin',
    href: '/admin',
    icon: Settings,
    adminOnly: true,
  },
];
