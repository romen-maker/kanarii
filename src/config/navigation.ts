import { Home, User, CheckSquare, Briefcase, FileText, Settings, Calendar, MessageSquare, Handshake, Scale } from 'lucide-react';

export interface NavItem {
  label: string;
  labelKey?: string;
  href: string;
  icon: any;
  adminOnly?: boolean;
}

export const navigationConfig: NavItem[] = [
  {
    label: 'Inicio',
    labelKey: 'nav.orientation',
    href: '/',
    icon: Home,
  },
  {
    label: 'Tareas',
    labelKey: 'nav.tasks',
    href: '/tareas',
    icon: CheckSquare,
  },
  {
    label: 'Calendario',
    labelKey: 'nav.calendar',
    href: '/calendario',
    icon: Calendar,
  },
  {
    label: 'Tablón',
    labelKey: 'nav.board',
    href: '/tablon',
    icon: MessageSquare,
  },
  {
    label: 'Proyectos',
    labelKey: 'nav.projects',
    href: '/proyectos',
    icon: Briefcase,
  },
  {
    label: 'Actas',
    labelKey: 'nav.minutes',
    href: '/actas',
    icon: FileText,
  },
  {
    label: 'Gobernanza',
    labelKey: 'nav.governance',
    href: '/gobernanza',
    icon: Scale,
  },
  {
    label: 'Marketplace',
    labelKey: 'nav.marketplace',
    href: '/soberania',
    icon: Handshake,
  },
  {
    label: 'Panel Admin',
    labelKey: 'nav.admin',
    href: '/admin',
    icon: Settings,
    adminOnly: true,
  },
];
