export interface Comunidad {
  id: string; // Slug (ej: 'arteara')
  nombre: string;
  slug: string;
  descripcion: string;
  logoUrl?: string;
  bannerUrl?: string;
  creadoEn: any;
  manifiesto?: string;
  esPublica?: boolean;
  requiereAprobacion?: boolean;
  adminUids?: string[];
  plan?: 'free' | 'pro';
  tags?: string[];
  ubicacion?: {
    municipio: string;
    region: string;
    pais: string;
    lat?: number;
    lng?: number;
  };
  tipo?: 'finca' | 'ecoaldea' | 'cohousing' | 'urbano' | 'nomada' | 'otro';
  capacidad?: number;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'member' | 'user';
  hasConsented?: boolean;
  hasFicha?: boolean;
  communityIds: string[];
  communityId?: string | null; // Compatibilidad: computed del primero
  hasSeenOnboarding?: boolean;
}

export interface Invitacion {
  id?: string;
  communityId: string;
  creadoPor: string;
  tipo: 'permanente' | 'caduca' | 'unico_uso';
  expiraEn?: any;
  usosMaximos?: number;
  usosActuales: number;
  activo: boolean;
  creadoEn: any;
}

export const InvitacionError = {
  INEXISTENTE: 'INVITACION_INEXISTENTE',
  INACTIVA: 'INVITACION_INACTIVA',
  CADUCADA: 'INVITACION_CADUCADA',
  AGOTADA: 'INVITACION_AGOTADA',
} as const;

export type InvitacionErrorType = typeof InvitacionError[keyof typeof InvitacionError];

export interface SolicitudAcceso {
  id?: string;
  communityId: string;
  solicitante_uid: string;
  mensaje: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  creadoEn: any;
  resueltoPor?: string;
  resueltoEn?: any;
  motivoRechazo?: string;
  detalleRechazo?: string;
}

export interface Evento {
  id?: string;
  titulo: string;
  descripcion: string;
  tipo: 'reunion' | 'tarea_comunal' | 'visita' | 'celebracion' | 'otro';
  inicio: any; // Timestamp
  fin: any;    // Timestamp
  todoElDia: boolean;
  responsable_uid: string;
  participantes: string[];
  communityId: string;
  vinculado_a?: { tipo: 'proyecto' | 'acta'; id: string };
  creadoEn: any;
  creadoPor: string;
}

export interface Post {
  id?: string;
  tipo: 'necesidad' | 'oferta';
  titulo: string;
  descripcion: string;
  categoria: 'habilidad' | 'recurso' | 'espacio' | 'apoyo_emocional' | 'otro';
  estado: 'activo' | 'en_proceso' | 'resuelto';
  autor_uid: string;
  communityId: string;
  respuestas_count: number;
  creadoEn: any;
  actualizadoEn: any;
}

export interface Respuesta {
  id?: string;
  texto: string;
  autor_uid: string;
  creadoEn: any;
}

export interface DatosOnboarding {
  nombre: string;
  fechaNacimiento: string;
  hora: string;
  lugar: string;
  genero: string;
  saberes: string;
  rol_comunidad: string;
  antiguedad_anos: number | string;
  tension: string;
  communityId: string;
  hora_aproximada?: boolean;
  latitud?: number;
  longitud?: number;
  timezone?: string;
  rol?: "propietario" | "miembro" | "voluntario";
  fechaLlegada?: string;
  fechaSalida?: string;
  habilidadesVoluntario?: string;
  plataformaOrigen?: string;
}

export interface Ficha {
  id?: string;
  userId: string;
  datosOnboarding: DatosOnboarding;
  manualGenerado?: string;
  manualMarkdown?: string;
  fechaGeneracion?: any;
  versionesAnteriores?: any[];
  isSeedData?: boolean;
  createdAt?: any;
  updatedAt?: any;
  estado?: string;
  datosBrutos?: any;
  datosPersona?: any;
  perfilVisual?: any;
}

export interface CommunityMember {
  id?: string;
  userId: string;
  communityId: string | null;
  nombre: string;
  tipo_hd?: string;
  elemento_dominante?: string;
  autoridad_hd?: string;
  antiguedad_anos?: number;
  rol_comunidad?: string;
  rolComunitario?: string; // Nivel de membresía (propietario, miembro, voluntario)
  rol?: string; // Deprecated: usar rolComunitario
  estado?: string;
  creadoEn?: any;
  updatedAt?: any;
  // Campos de perfil visual (copiados del perfil del usuario para evitar joins)
  photoURL?: string;
  displayName?: string;
  email?: string;
  // Arquetipo de rol comunitario (Sprint 3)
  arquetipo_s3?: 'Enlazador' | 'Guardián' | 'Creador' | 'Facilitador' | 'Tejedor' | 'Representante' | string;
}

export interface Tarea {
  id?: string;
  titulo: string;
  descripcion?: string;
  asignadaA?: string;
  creadaPor: string;
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'archivada';
  estadoPrevio?: 'pendiente' | 'en_progreso' | 'completada';
  fechaLimite?: any;
  createdAt?: any;
  updatedAt?: any;
  proyectoId?: string;
  communityId: string;
  prioridad?: 'alta' | 'media' | 'normal' | 'baja' | string;
}

export interface Acta {
  id?: string;
  titulo: string;
  fecha: any;
  facilitador: string;
  participantes: string[];
  contexto: string;
  decisiones: string[];
  tareasDerivadas?: string[];
  proximaReunion?: any;
  creadaPor: string;
  createdAt?: any;
  updatedAt?: any;
  lastEditedBy?: string;
  communityId: string;
}

export interface Proyecto {
  id?: string;
  titulo: string;
  descripcion: string;
  lider_uid: string; // uid del miembro que lo lidera
  colaboradores_uid: string[];
  solicitudes_uid?: string[]; // Para marcar solicitudes como pendientes
  habilidadesNecesarias: string[]; // tags libres
  estado: "en_marcha" | "buscando_colaboradores" | "completado" | "pausado";
  fechaInicio?: string; // YYYY-MM-DD
  fechaFin?: string;
  communityId: string;
  creadoEn?: any; // timestamp
  updatedAt?: any;
}

// --- MARKETPLACE DE SOBERANÍA ---

export interface Servicio {
  id?: string;
  providerId: string;
  title: string;
  description: string;
  type: 'talento' | 'recurso';
  category: string;
  location?: string;
  availability?: string;
  communityId: string;
  isActive: boolean;
  creadoEn: any;
  actualizadoEn: any;
}

export interface Acuerdo {
  id?: string;
  servicioId: string;
  providerId: string;
  solicitanteId: string;
  communityId: string;
  status: 'pendiente' | 'contraoferta' | 'en_curso' | 'completada' | 'cancelada';
  exchangeType?: 'tiempo' | 'especie' | 'economico' | 'regalo';
  terms: string;
  fechaPropuesta?: Date | null;
  linkedEventId?: string | null;
  feedback?: {
    gratitud: string;
    oportunidadMejora: string;
    creadoEn: any;
  };
  historial?: Array<{
    fecha: any;
    autorId: string;
    tipo: 'propuesta' | 'contraoferta' | 'aceptacion' | 'cancelacion';
    terminos: {
      exchangeType?: string;
      terms: string;
      fechaPropuesta?: Date | null;
    };
  }>;
  creadoEn: any;
  actualizadoEn: any;
}

export interface Propuesta {
  id?: string;
  title: string;
  description: string;
  reason: string;
  authorId: string;
  communityId: string;
  status: 'borrador' | 'abierta' | 'en_objeciones' | 'integrando' | 'acordada' | 'descartada';
  responsibleIds: string[];
  activeObjectionsCount: number;
  totalResponsesCount: number;
  deadline?: any;
  reviewDate?: any;
  userPositions?: Record<string, PropuestaRespuesta['type']>;
  version: number;
  integrationNote?: string;
  createdAt: any;
  updatedAt: any;
}

export interface PropuestaRespuesta {
  id?: string;
  memberId: string;
  type: 'consentimiento' | 'preocupacion' | 'duda' | 'objecion';
  content?: string;
  status?: 'pendiente' | 'aclarada' | 'integrada' | 'retirada';
  createdAt: any;
  updatedAt: any;
}

export interface PropuestaHilo {
  id?: string;
  relatedResponseId: string;
  authorId: string;
  content: string;
  createdAt: any;
  relatedMemberId?: string; // userId del emisor de la duda
  hiloType?: 'duda' | 'objecion';
}

export interface FeedbackSalida {
  id?: string;
  userId: string;
  nombreUsuario: string;
  communityId: string;
  motivo: string;
  comentario?: string;
  fecha: any;
}
