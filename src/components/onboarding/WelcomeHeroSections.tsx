import { motion } from 'motion/react';
import { Sparkles, FilePlus2, Scroll, Landmark, ArrowRight, Activity, Heart } from 'lucide-react';

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
  onNewProposal?: () => void;
  onViewMinutes?: () => void;
  onGoToBoard?: () => void;
  onExplorePedagogy?: (id: string) => void;
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
  onNewProposal,
  onViewMinutes,
  onGoToBoard,
  onExplorePedagogy,
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
      desc: 'Consenso sociocrático y objeciones sin tensiones.',
      tag: 'Gobernanza',
    },
    {
      id: 'cruce',
      title: 'El Cruce',
      desc: 'Resolución armónica de tensiones y alineación de drivers.',
      tag: 'Resolución',
    },
    {
      id: 'ficha',
      title: 'Pasaporte & Roles',
      desc: 'Fórmate partiendo de tus ofrendas, saberes y necesidades.',
      tag: 'Identidad',
    },
    {
      id: 'estructura',
      title: 'Estructura S3',
      desc: 'Círculos concéntricos y enlaces dobles para transparencia.',
      tag: 'Organización',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12 py-8 px-4 font-sans text-[#5D4037] bg-[#FDFBF7]">
      
      {/* 1. SECTION: Welcome Hero */}
      <motion.section 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center md:text-left space-y-3"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-[#6B705C] rounded-full border border-emerald-100">
          <Sparkles size={14} className="text-emerald-700 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide uppercase">Círculo Activado</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#3E2723] tracking-tight">
          Hola, {userName}
        </h1>
        <p className="text-lg md:text-xl text-[#6B705C] max-w-2xl font-serif italic font-medium">
          {communityStatus}
        </p>
      </motion.section>

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
            Escuela de Estructura Sociocrática
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
