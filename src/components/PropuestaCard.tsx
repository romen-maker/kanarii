import React from 'react';
import { Propuesta, PropuestaRespuesta } from '../lib/appService';
import { EntityCard, EntityVariant, EntityMetadata } from './ui/EntityCard';
import { User, Clock, MessageSquare, AlertCircle, CheckCircle2, XCircle, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PropuestaCardProps {
  propuesta: Propuesta;
  respuestas: PropuestaRespuesta[];
  currentUserId: string;
  totalMiembros: number;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const PropuestaCard: React.FC<PropuestaCardProps> = ({
  propuesta,
  respuestas,
  currentUserId,
  totalMiembros,
  onClick,
  onEdit,
  onDelete
}) => {
  const isAuthor = propuesta.authorId === currentUserId;
  const hasResponded = respuestas.some(r => r.memberId === currentUserId);
  const requiresAttention = propuesta.status === 'abierta' && !hasResponded;

  // Mapeo de estados a variantes de EntityCard
  const getStatusConfig = (): { label: string; variant: EntityVariant; icon: any } => {
    switch (propuesta.status) {
      case 'borrador':
        return { label: 'Borrador', variant: 'neutral', icon: Pencil };
      case 'abierta':
        return { 
          label: requiresAttention ? 'Requiere tu respuesta' : 'Abierta', 
          variant: requiresAttention ? 'info' : 'primary', 
          icon: requiresAttention ? AlertCircle : Clock 
        };
      case 'en_objeciones':
        return { label: 'En Objeciones', variant: 'warning', icon: AlertCircle };
      case 'integrando':
        return { label: 'Integrando', variant: 'info', icon: Pencil };
      case 'acordada':
        return { label: 'Acordada', variant: 'success', icon: CheckCircle2 };
      case 'descartada':
        return { label: 'Descartada', variant: 'neutral', icon: XCircle };
      default:
        return { label: propuesta.status, variant: 'neutral', icon: Clock };
    }
  };

  const statusConfig = getStatusConfig();
  
  const metadata: EntityMetadata[] = [
    { icon: User, text: isAuthor ? 'Tu propuesta' : 'Autor' },
    { 
      icon: MessageSquare, 
      text: `${respuestas.length}/${totalMiembros} respuestas`,
      tooltip: 'Participación de la comunidad'
    },
    { 
      icon: Clock, 
      text: format(propuesta.createdAt.toDate(), "d 'de' MMM", { locale: es }) 
    }
  ];

  if (propuesta.activeObjectionsCount > 0) {
    metadata.push({ 
      icon: AlertCircle, 
      text: `${propuesta.activeObjectionsCount} objeciones`,
      className: 'text-red-500 font-bold'
    });
  }

  const quickActions = isAuthor && propuesta.status === 'borrador' ? [
    { label: 'Editar', icon: Pencil, onClick: onEdit || (() => {}), showLabel: true },
    { label: 'Eliminar', icon: Trash2, onClick: onDelete || (() => {}), variant: 'danger' as const }
  ] : [];

  return (
    <EntityCard
      id={propuesta.id!}
      title={propuesta.title}
      subtitle={propuesta.reason}
      status={statusConfig}
      metadata={metadata}
      quickActions={quickActions}
      onClick={onClick}
      className={propuesta.status === 'descartada' ? 'opacity-60' : ''}
    />
  );
};
