/**
 * Funciones puras para calcular clases CSS de badges en acuerdos.
 * Eliminan la duplicación que existía en AdminPanel (Dashboard + Marketplace).
 */

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'pendiente':
      return 'bg-amber-50 text-amber-600 border border-amber-100';
    case 'contraoferta':
      return 'bg-purple-50 text-purple-600 border border-purple-100';
    case 'en_curso':
      return 'bg-blue-50 text-blue-600 border border-blue-100';
    case 'completada':
      return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    case 'cancelada':
      return 'bg-rose-50 text-rose-600 border border-rose-100';
    default:
      return 'bg-stone-50 text-stone-600 border border-stone-100';
  }
}

export function getExchangeBadgeClass(exchangeType: string): string {
  switch (exchangeType) {
    case 'regalo':
      return 'bg-pink-50 text-pink-600 border border-pink-100';
    case 'tiempo':
      return 'bg-indigo-50 text-indigo-600 border border-indigo-100';
    case 'especie':
      return 'bg-teal-50 text-teal-600 border border-teal-100';
    case 'economico':
      return 'bg-amber-50 text-amber-600 border border-amber-100';
    default:
      return 'bg-stone-100 text-stone-700';
  }
}

export function getExchangeLabel(exchangeType?: string): string {
  if (!exchangeType) return '-';
  const labels: Record<string, string> = {
    tiempo: 'Tiempo',
    especie: 'Especie',
    economico: 'Económico',
    regalo: 'Regalo',
  };
  return labels[exchangeType] || exchangeType;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    contraoferta: 'Contraoferta',
    en_curso: 'En curso',
    completada: 'Completado',
    cancelada: 'Cancelado',
  };
  return labels[status] || status;
}
