import React from 'react';
import { User, MapPin, Heart, Package, Edit, Trash2, Archive, Play } from 'lucide-react';
import { EntityCard, EntityVariant, EntityMetadata } from './ui/EntityCard';
import { Servicio } from '../lib/appService';

interface ServicioCardProps {
  servicio: Servicio;
  nombreAutor?: string;
  isOwner?: boolean;
  onSolicitar?: () => void;
  onEdit?: () => void;
  onToggleStatus?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}

export const ServicioCard: React.FC<ServicioCardProps> = ({
  servicio,
  nombreAutor,
  isOwner,
  onSolicitar,
  onEdit,
  onToggleStatus,
  onDelete,
  onClick
}) => {
  const metadata: EntityMetadata[] = [
    {
      icon: User,
      text: nombreAutor || 'Miembro',
    },
    {
      icon: servicio.type === 'talento' ? Heart : Package,
      text: servicio.category.charAt(0).toUpperCase() + servicio.category.slice(1),
    }
  ];

  if (servicio.location) {
    metadata.push({
      icon: MapPin,
      text: servicio.location,
    });
  }

  const status = !servicio.isActive 
    ? { label: 'Pausado', variant: 'neutral' as EntityVariant, icon: Archive }
    : {
        label: servicio.type === 'talento' ? 'Talento' : 'Recurso',
        variant: servicio.type === 'talento' ? 'success' as EntityVariant : 'info' as EntityVariant,
        icon: servicio.type === 'talento' ? Heart : Package
      };

  return (
    <EntityCard
      id={servicio.id!}
      title={servicio.title}
      subtitle={servicio.description}
      status={status}
      metadata={metadata}
      quickActions={isOwner ? [
        { 
          label: servicio.isActive ? 'Pausar' : 'Reactivar', 
          icon: servicio.isActive ? Archive : Play, 
          onClick: onToggleStatus || (() => {}),
          showLabel: true
        },
        { 
          label: 'Editar', 
          icon: Edit, 
          onClick: onEdit || (() => {}),
          showLabel: true
        },
        { 
          label: 'Eliminar', 
          icon: Trash2, 
          onClick: onDelete || (() => {}), 
          variant: 'danger' 
        }
      ] : []}
      onClick={onClick}
      onActionClick={!isOwner && servicio.isActive ? onSolicitar : undefined}
      actionLabel={!isOwner && servicio.isActive ? "Solicitar" : undefined}
    />
  );
};
