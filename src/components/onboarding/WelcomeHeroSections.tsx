import { motion } from 'motion/react';
import { Sparkles, FilePlus2, Scroll, Landmark, ArrowRight, Activity, Heart, Users, MapPin, CheckCircle2, Compass } from 'lucide-react';

interface WelcomeHeroSectionsProps {
  userName?: string;
  communityStatus?: string;
  propuestasObjecionesCount?: number;
  propuestasObjecionesPercent?: number;
  propuestasRevisionCount?: number;
  propuestasRevisionPercent?: number;
  tareasActivasCount?: number;
  tareasAsignadasCount?: number;
  tareasAsignadasPercent?: number;
  recentActivities?: Array<{
    id: string;
    time: string;
    user: string;
    action: string;
    target: string;
    circle: string;
  }>;
  featuredMembers?: Array<{
    id: string;
    name: string;
    photoUrl?: string;
    saberes?: string[];
    necesidades?: string[];
  }>;
  featuredNodes?: Array<{
    id: string;
    nombre: string;
    slug: string;
    descripcion: string;
    tipo?: string;
    miembrosCount?: number;
    adminUids?: string[];
  }>;
  onNewProposal?: () => void;
  onViewMinutes?: () => void;
  onGoToBoard?: () => void;
  onExplorePedagogy?: (id: string) => void;
  onGoToProfiles?: () => void;
  onGoToCommunities?: () => void;
  onStartBasicProfile?: () => void;
  hasIncompleteProfile?: boolean;
}

export default function WelcomeHeroSections({
  userName = 'Inés',
  communityStatus = 'Tu comunidad tiene 2 propuestas esperando tu voz 🌱',
  propuestasObjecionesCount = 2,
  propuestasObjecionesPercent = 80,
  propuestasRevisionCount = 3,
  propuestasRevisionPercent = 45,
  tareasActivasCount = 10,
  tareasAsignadasCount = 7,
  tareasAsignadasPercent = 70,
  recentActivities = [],
  featuredMembers = [],
  featuredNodes = [],
  onNewProposal,
  onViewMinutes,
  onGoToBoard,
  onExplorePedagogy,
  onGoToProfiles,
  onGoToCommunities,
  onStartBasicProfile,
  hasIncompleteProfile = false,
}: WelcomeHeroSectionsProps) {

  const quickActions = [
    {
      title: 'Nueva Propuesta',
      desc: 'Sugerir iniciativa al círculo',
      icon: FilePlus2,
      color: 'bg-emerald-50 text-[#6B705C]',
      hoverColor: 'hover:bg-emerald-100/60',
      action: onNewProposal,
    },
    {
      title: 'Ver Actas',
      desc: 'Revisar decisiones tomadas',
      icon: Scroll,
      color: 'bg-amber-50 text-[#A5A58D]',
      hoverColor: 'hover:bg-amber-100/60',
      action: onViewMinutes,
    },
    {
      title: 'Ir al Tablón',
      desc: 'Tablón de anuncios y ofrendas',
      icon: Landmark,
      color: 'bg-[#FAF9F6] border border-[#D2B48C]/20 text-[#5D4037]',
      hoverColor: 'hover:bg-[#FAF9F6]/80',
      action: onGoToBoard,
    },
  ];

  const recentActivity = recentActivities && recentActivities.length > 0 ? recentActivities : [
    {
      id: '1',
      time: 'Hace 2 horas',
      user: 'Santiago M.',
      action: 'propuso un driver para el proyecto',
      target: 'Sistema de Riego Pasivo',
      circle: 'Círculo de Ecología',
    },
    {
      id: '2',
      time: 'Ayer',
      user: 'Lucía G.',
      action: 'registró el acta consensuada de',
      target: 'Gestión de Residuos Orgánicos',
      circle: 'Círculo General',
    },
    {
      id: '3',
      time: 'Hace 3 días',
      user: 'Martín P.',
      action: 'creó una tarea pendiente:',
      target: 'Reparación de la barda norte',
      circle: 'Círculo de Infraestructura',
    },
  ];

  const pedagogyCards = [
    {
      id: 'gobernanza',
      title: 'Toma de Decisiones',
      desc: 'Consenso dinámico y objeciones integradas para decidir en común.',
      tag: 'Gobernanza',
    },
    {
      id: 'cruce',
      title: 'El Cruce',
      desc: 'Resolución armónica de tensiones y alineación del propósito comunitario.',
      tag: 'Resolución',
    },
    {
      id: 'ficha',
      title: 'Pasaporte & Roles',
      desc: 'Encuentra tu lugar partiendo de tus ofrendas, saberes y necesidades.',
      tag: 'Identidad',
    },
    {
      id: 'estructura',
      title: 'Estructura S3',
      desc: 'Círculos interconectados y enlaces dobles para un flujo transparente.',
      tag: 'Organización',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 py-8 px-4 font-sans text-[#5D4037] bg-[#FDFBF7]">
      
      {/* 1. SECTION: Welcome Hero & Orientación */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center md:text-left space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-[#6B705C] rounded-full border border-emerald-100">
          <Sparkles size={14} className="text-emerald-700 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide uppercase">Ecosistema Vivo</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#3E2723] tracking-tight">
          Hola, {userName}
        </h1>
        <p className="text-lg md:text-xl text-[#6B705C] max-w-2xl font-serif italic font-medium">
          {communityStatus}
        </p>
      </motion.section>

      {/* BIFURCACIÓN DE REGISTRO / PERFIL: 2 Caminos */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#A5A58D]">
          Elige tu forma de empezar en Kanarii
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Opción A: Perfil básico en 1 minuto */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-emerald-50/60 border border-emerald-200/60 rounded-[28px] p-6 flex flex-col justify-between space-y-4 shadow-sm"
          >
            <div className="space-y-2">
              <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Fricción Cero • 1 minuto
              </span>
              <h3 className="font-serif font-bold text-lg text-[#3E2723]">
                Perfil básico en 1 minuto 🌱
              </h3>
              <p className="text-xs text-[#5D4037]/80 leading-relaxed">
                Rellena solo tu nombre, 1 saber que ofreces y 1 necesidad. Aparecerás de inmediato en el directorio comunitario y podrás explorar los nodos sin demoras.
              </p>
            </div>
            <button
              onClick={onStartBasicProfile}
              className="w-full py-3 bg-[#6B705C] hover:bg-[#5A5A40] text-white font-medium text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Empieza tu perfil básico</span>
              <ArrowRight size={16} />
            </button>
          </motion.div>

          {/* Opción B: Manual Galáctico Completo */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-amber-50/60 border border-amber-200/60 rounded-[28px] p-6 flex flex-col justify-between space-y-4 shadow-sm"
          >
            <div className="space-y-2">
              <span className="inline-block text-[10px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Experiencia Profunda
              </span>
              <h3 className="font-serif font-bold text-lg text-[#3E2723]">
                Manual Galáctico Completo 🔮
              </h3>
              <p className="text-xs text-[#5D4037]/80 leading-relaxed">
                Recorrido guiado que calcula tu Carta Astral, Diseño Humano y sello de Kin Maya a partir de tu fecha y hora de nacimiento para mapear tu energía cósmica.
              </p>
            </div>
            <button
              onClick={() => onExplorePedagogy?.('ficha')}
              className="w-full py-3 bg-white border border-[#D2B48C]/40 text-[#5D4037] hover:bg-[#FAF9F6] font-medium text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <span>Ver Manual Galáctico</span>
              <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* BLOQUE DE ORIENTACIÓN: Miembros destacados (Tríada) */}
      {featuredMembers && featuredMembers.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-[#6B705C]" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#3E2723]">
                Quiénes están en la tribu
              </h2>
            </div>
            <button
              onClick={onGoToProfiles}
              className="text-xs font-medium text-[#6B705C] hover:underline flex items-center gap-1"
            >
              Ver todos ({featuredMembers.length}+) <ArrowRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredMembers.slice(0, 3).map((member) => (
              <div
                key={member.id}
                className="bg-white p-5 rounded-[24px] border border-[#D2B48C]/15 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#EAE2D6]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#6B705C] flex items-center justify-center font-bold font-serif text-sm">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#3E2723]">{member.name}</h4>
                    <span className="text-[10px] text-[#A5A58D] font-mono">Miembro activo</span>
                  </div>
                </div>

                {/* Tríada reducida */}
                <div className="space-y-2 text-xs pt-1 border-t border-[#FAF9F6]">
                  {member.saberes && member.saberes.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#6B705C] block">Ofrece / Saberes:</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {member.saberes.slice(0, 2).map((s, idx) => (
                          <span key={idx} className="bg-emerald-50 text-[#6B705C] px-2 py-0.5 rounded-full text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {member.necesidades && member.necesidades.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#CB997E] block">Necesita:</span>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {member.necesidades.slice(0, 2).map((n, idx) => (
                          <span key={idx} className="bg-amber-50 text-[#CB997E] px-2 py-0.5 rounded-full text-[10px]">
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* BLOQUE DE ORIENTACIÓN: Espacios / Nodos destacados */}
      {featuredNodes && featuredNodes.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-[#6B705C]" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#3E2723]">
                Espacios y Nodos Disponibles
              </h2>
            </div>
            <button
              onClick={onGoToCommunities}
              className="text-xs font-medium text-[#6B705C] hover:underline flex items-center gap-1"
            >
              Explorar todos <ArrowRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredNodes.slice(0, 2).map((node) => (
              <div
                key={node.id}
                className="bg-white p-6 rounded-[28px] border border-[#D2B48C]/15 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase text-[#6B705C] bg-emerald-50 px-2 py-0.5 rounded">
                      {node.tipo || 'Comunidad'}
                    </span>
                    {node.miembrosCount && (
                      <span className="text-xs text-[#A5A58D] font-mono">
                        {node.miembrosCount} miembros
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#3E2723]">{node.nombre}</h3>
                  <p className="text-xs text-[#5D4037]/70 line-clamp-2 mt-1">{node.descripcion}</p>
                </div>

                <div className="pt-3 border-t border-[#FAF9F6] flex justify-between items-center">
                  <span className="text-[11px] text-[#A5A58D]">
                    {node.adminUids && node.adminUids.length > 0 ? `Cuidadores: ${node.adminUids.length}` : 'Espacio activo'}
                  </span>
                  <button
                    onClick={onGoToCommunities}
                    className="text-xs font-bold text-[#6B705C] hover:underline flex items-center gap-1"
                  >
                    Ver Nodo <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. SECTION: Quick Actions */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#A5A58D] mb-4">
          Acciones Recomendadas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((act, index) => {
            const Icon = act.icon;
            return (
              <motion.button
                key={act.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={act.action}
                className={`p-6 rounded-[28px] text-left transition-all relative border border-[#D2B48C]/15 shadow-sm bg-white ${act.hoverColor} group cursor-pointer flex flex-col justify-between h-36`}
              >
                <div className={`w-10 h-10 ${act.color} rounded-2xl flex items-center justify-center mb-2`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[#3E2723] font-serif text-lg group-hover:text-[#5A5A40] transition-colors flex items-center gap-1.5">
                    {act.title}
                    <ArrowRight size={14} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#6B705C]" />
                  </h3>
                  <p className="text-xs text-[#5D4037]/60 mt-0.5">{act.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* 3. SECTION: Recent Activity Feed */}
      <section className="bg-white rounded-[32px] p-8 border border-[#D2B48C]/10 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-[#6B705C]" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#3E2723] tracking-wider">
            Pulso Comunitario Reciente
          </h2>
        </div>

        <div className="space-y-4">
          {recentActivity.map((act, index) => (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="flex items-start gap-4 pb-4 border-b border-[#FAF9F6] last:border-0 last:pb-0 font-sans"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[#A5A58D] mt-2 shrink-0" />
              <div className="flex-1 text-sm text-[#5D4037]/80">
                <span className="font-bold text-[#3E2723]">{act.user}</span>{' '}
                <span className="text-[#5D4037]/60">{act.action}</span>{' '}
                <span className="font-medium text-[#6B705C] bg-emerald-50/50 px-2 py-0.5 rounded-full text-xs">
                  {act.target}
                </span>
                <span className="text-xs text-[#A5A58D] block mt-1 font-serif">
                  en {act.circle}
                </span>
              </div>
              <span className="text-xs font-mono text-[#A5A58D]/70 shrink-0">
                {act.time}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. SECTION: Health Widget */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Propuestas */}
        <div className="bg-white rounded-[32px] p-6 border border-[#D2B48C]/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-[#A5A58D]">Gobernanza</span>
            <Heart size={16} className="text-[#10B981]" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#3E2723]">Propuestas Activas</h3>
          
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs text-[#5D4037]/60 mb-1">
                <span>En periodo de objeción ({propuestasObjecionesCount})</span>
                <span>{propuestasObjecionesPercent}% participación</span>
              </div>
              <div className="h-2 w-full bg-[#FAF9F6] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${propuestasObjecionesPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-emerald-600 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-[#5D4037]/60 mb-1">
                <span>En deliberación ({propuestasRevisionCount})</span>
                <span>{propuestasRevisionPercent}% participación</span>
              </div>
              <div className="h-2 w-full bg-[#FAF9F6] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${propuestasRevisionPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                  className="h-full bg-amber-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Trabajo */}
        <div className="bg-white rounded-[32px] p-6 border border-[#D2B48C]/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-[#A5A58D]">Impacto</span>
            <Activity size={16} className="text-amber-600" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#3E2723]">Tareas de Círculos</h3>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-[#5D4037]/70 font-sans">
              <span className="font-medium">Asignación de tareas</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                {tareasAsignadasPercent >= 80 ? 'Óptima' : tareasAsignadasPercent >= 50 ? 'Media' : 'Baja'}
              </span>
            </div>
            
            <div className="flex gap-1.5 h-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((step) => {
                const stepVal = step * 10;
                const isLit = tareasAsignadasPercent >= stepVal;
                return (
                  <div 
                    key={step} 
                    className={`flex-1 rounded-sm transition-colors duration-500 ${
                      isLit ? 'bg-[#6B705C]' : 'bg-[#FAF9F6] border border-[#D2B48C]/10'
                    }`}
                  />
                );
              })}
            </div>
            <p className="text-[11px] text-[#A5A58D] leading-tight font-sans">
              {tareasActivasCount > 0 
                ? `${tareasAsignadasCount} de ${tareasActivasCount} tareas tienen un facilitador asignado activamente cuidando el flujo.`
                : 'No hay tareas activas en los círculos en este momento.'}
            </p>
          </div>
        </div>
      </section>

      {/* 5. SECTION: Explore Kanarii */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#A5A58D]">
            Explora la Gobernanza Viva
          </h2>
          <span className="text-xs text-[#6B705C] bg-white border border-[#D2B48C]/20 px-3 py-1 rounded-full font-serif italic">
            Animaciones Pedagógicas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
          {pedagogyCards.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              onClick={() => onExplorePedagogy?.(p.id)}
              className="bg-white p-6 rounded-[28px] border border-[#D2B48C]/10 shadow-sm flex flex-col justify-between hover:border-[#6B705C]/35 cursor-pointer transition-all group"
            >
              <div>
                <span className="inline-block text-[10px] font-bold text-[#6B705C] bg-[#FAF9F6] px-2 py-0.5 rounded uppercase tracking-wider mb-3">
                  {p.tag}
                </span>
                <h3 className="font-serif font-bold text-lg text-[#3E2723] group-hover:text-[#6B705C] transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs text-[#5D4037]/60 mt-1 max-w-sm">{p.desc}</p>
              </div>

              <div className="flex justify-end mt-4 pt-3 border-t border-[#FAF9F6]">
                <span className="text-xs font-medium text-[#6B705C] flex items-center gap-1 group-hover:underline">
                  Abrir Animación
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
