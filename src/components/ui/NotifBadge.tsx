import React from 'react';

interface NotifBadgeProps {
  unreadCount?: number;
  hasUnread?: boolean;
  className?: string;
}

export default function NotifBadge({
  unreadCount = 0,
  hasUnread = false,
  className = '',
}: NotifBadgeProps) {
  const active = hasUnread || unreadCount > 0;

  if (!active) return null;

  return (
    <span 
      className={`inline-block w-2.5 h-2.5 bg-rose-500 rounded-full shadow-sm shadow-rose-500/20 animate-pulse ${className}`}
      style={{ minWidth: '10px', minHeight: '10px' }}
      title={unreadCount > 0 ? `${unreadCount} notificaciones no leídas` : 'Notificaciones pendientes'}
    />
  );
}
