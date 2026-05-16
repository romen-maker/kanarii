import { Home, User, CheckSquare, Briefcase, FileText, Settings, Calendar, MessageSquare, Handshake, Scale } from 'lucide-react';

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
    label: 'Tablón',
    href: '/tablon',
    icon: MessageSquare,
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
    label: 'Gobernanza',
    href: '/gobernanza',
    icon: Scale,
  },
  {
    label: 'Marketplace',
    href: '/soberania',
    icon: Handshake,
  },
  {
    label: 'Panel Admin',
    href: '/admin',
    icon: Settings,
    adminOnly: true,
  },
];
