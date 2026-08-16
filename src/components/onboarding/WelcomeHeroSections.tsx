import { motion } from 'motion/react';
import { Sparkles, FilePlus2, Scroll, Landmark, ArrowRight, Activity, Heart, Users, MapPin, CheckCircle2, Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  onSelectMember?: (uid: string) => void;
  hasIncompleteProfile?: boolean;
}

export default function WelcomeHeroSections({
  userName = 'Inés',
  communityStatus,
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
  onSelectMember,
  hasIncompleteProfile = false,
}: WelcomeHeroSectionsProps) {
  const { t } = useTranslation('welcome');
  const displayStatus = communityStatus || t('subtitle');

  const quickActions = [
    {
      title: t('quickActions.newProposalTitle'),
      desc: t('quickActions.newProposalDesc'),
      icon: FilePlus2,
      color: 'bg-emerald-50 text-[#6B705C]',
      hoverColor: 'hover:bg-emerald-100/60',
      action: onNewProposal,
    },
    {
      title: t('quickActions.viewMinutesTitle'),
      desc: t('quickActions.viewMinutesDesc'),
      icon: Scroll,
      color: 'bg-amber-50 text-[#A5A58D]',
      hoverColor: 'hover:bg-amber-100/60',
      action: onViewMinutes,
    },
    {
      title: t('quickActions.goToBoardTitle'),
      desc: t('quickActions.goToBoardDesc'),
      icon: Landmark,
      color: 'bg-[#FAF9F6] border border-[#D2B48C]/20 text-[#5D4037]',
      hoverColor: 'hover:bg-[#FAF9F6]/80',
      action: onGoToBoard,
    },
  ];

  const recentActivity = recentActivities && recentActivities.length > 0 ? recentActivities : [];

  const pedagogyCards = [
    {
      id: 'gobernanza',
      title: t('pedagogy.decisionTitle'),
      desc: t('pedagogy.decisionDesc'),
      tag: t('pedagogy.decisionTag'),
    },
    {
      id: 'cruce',
      title: t('pedagogy.cruceTitle'),
      desc: t('pedagogy.cruceDesc'),
      tag: t('pedagogy.cruceTag'),
    },
    {
      id: 'ficha',
      title: t('pedagogy.passportTitle'),
      desc: t('pedagogy.passportDesc'),
      tag: t('pedagogy.passportTag'),
    },
    {
      id: 'estructura',
      title: t('pedagogy.s3Title'),
      desc: t('pedagogy.s3Desc'),
      tag: t('pedagogy.s3Tag'),
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
          <span className="text-xs font-semibold tracking-wide uppercase">{t('hero.liveEcosystem')}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#3E2723] tracking-tight">
          {t('hero.hello', { name: userName })}
        </h1>
        <p className="text-lg md:text-xl text-[#6B705C] max-w-2xl font-serif italic font-medium">
          {displayStatus}
        </p>
      </motion.section>

      {/* BIFURCACIÓN DE REGISTRO / PERFIL: 2 Caminos */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#A5A58D]">
          {t('hero.chooseWay')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Opción A: Perfil básico en 1 minuto */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-emerald-50/60 border border-emerald-200/60 rounded-[28px] p-6 flex flex-col justify-between space-y-4 shadow-sm"
          >
            <div className="space-y-2">
              <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {t('hero.basicProfileTag')}
              </span>
              <h3 className="font-serif font-bold text-lg text-[#3E2723]">
                {t('hero.basicProfileTitle')}
              </h3>
              <p className="text-xs text-[#5D4037]/80 leading-relaxed">
                {t('hero.basicProfileDesc')}
              </p>
            </div>
            <button
              onClick={onStartBasicProfile}
              className="w-full py-3 bg-[#6B705C] hover:bg-[#5A5A40] text-white font-medium text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>{t('hero.basicProfileCta')}</span>
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
                {t('hero.deepExpTag')}
              </span>
              <h3 className="font-serif font-bold text-lg text-[#3E2723]">
                {t('hero.galacticManualTitle')}
              </h3>
              <p className="text-xs text-[#5D4037]/80 leading-relaxed">
                {t('hero.galacticManualDesc')}
              </p>
            </div>
            <button
              onClick={() => onExplorePedagogy?.('ficha')}
              className="w-full py-3 bg-white border border-[#D2B48C]/40 text-[#5D4037] hover:bg-[#FAF9F6] font-medium text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <span>{t('hero.galacticManualCta')}</span>
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
                {t('hero.whoIsHere')}
              </h2>
            </div>
            <button
              onClick={onGoToProfiles}
              className="text-xs font-medium text-[#6B705C] hover:underline flex items-center gap-1"
            >
              {t('hero.viewAll', { count: featuredMembers.length })} <ArrowRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredMembers.slice(0, 3).map((member) => (
              <div
                key={member.id}
                onClick={() => member.id && onSelectMember?.(member.id)}
                className="bg-white p-5 rounded-[24px] border border-[#D2B48C]/15 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between cursor-pointer group"
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    member.id && onSelectMember?.(member.id);
                  }
                }}
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
                    <h4 className="font-serif font-bold text-sm text-[#3E2723] group-hover:text-[#6B705C] transition-colors">{member.name}</h4>
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

                <div className="pt-2 border-t border-[#EAE2D6]/40 flex items-center justify-end text-xs font-semibold text-[#6B705C] group-hover:underline gap-1">
                  <span>{t('hero.viewProfile')}</span>
                  <ArrowRight size={12} />
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
                {t('nodes.title')}
              </h2>
            </div>
            <button
              onClick={onGoToCommunities}
              className="text-xs font-medium text-[#6B705C] hover:underline flex items-center gap-1"
            >
              {t('nodes.exploreAll')} <ArrowRight size={12} />
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
                    {node.adminUids && node.adminUids.length > 0 
                      ? (node.adminUids.length === 1 ? t('nodes.caretakers_one') : t('nodes.caretakers_other', { count: node.adminUids.length }))
                      : t('nodes.activeSpace')}
                  </span>
                  <button
                    onClick={onGoToCommunities}
                    className="text-xs font-bold text-[#6B705C] hover:underline flex items-center gap-1"
                  >
                    {t('nodes.viewNode')} <ArrowRight size={12} />
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
          {t('quickActions.title')}
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
      {recentActivity.length > 0 && (
        <section className="bg-white rounded-[32px] p-8 border border-[#D2B48C]/10 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-[#6B705C]" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#3E2723] tracking-wider">
              {t('activity.title')}
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
                <div className="flex-1 text-sm text-[#5D4037]/80 leading-relaxed">
                  {act.action}
                </div>
                <span className="text-xs font-mono text-[#A5A58D]/70 shrink-0">
                  {act.time}
                </span>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* 4. SECTION: Health Widget */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Propuestas */}
        <div className="bg-white rounded-[32px] p-6 border border-[#D2B48C]/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-[#A5A58D]">{t('health.governanceTag')}</span>
            <Heart size={16} className="text-[#10B981]" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#3E2723]">{t('health.activeProposals')}</h3>
          
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs text-[#5D4037]/60 mb-1">
                <span>{t('health.objectionPeriod', { count: propuestasObjecionesCount })}</span>
                <span>{t('health.participation', { percent: propuestasObjecionesPercent })}</span>
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
                <span>{t('health.deliberationPeriod', { count: propuestasRevisionCount })}</span>
                <span>{t('health.participation', { percent: propuestasRevisionPercent })}</span>
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
            <span className="text-xs font-bold uppercase tracking-widest text-[#A5A58D]">{t('health.impactTag')}</span>
            <Activity size={16} className="text-amber-600" />
          </div>
          <h3 className="font-serif font-bold text-xl text-[#3E2723]">{t('health.circleTasks')}</h3>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-[#5D4037]/70 font-sans">
              <span className="font-medium">{t('health.taskAssignment')}</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                {tareasAsignadasPercent >= 80 ? t('health.optimal') : tareasAsignadasPercent >= 50 ? t('health.medium') : t('health.low')}
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
                ? (tareasAsignadasCount === 1 
                    ? t('health.tasksAssignedDesc_one', { total: tareasActivasCount }) 
                    : t('health.tasksAssignedDesc_other', { count: tareasAsignadasCount, total: tareasActivasCount }))
                : t('health.noActiveTasks')}
            </p>
          </div>
        </div>
      </section>

      {/* 5. SECTION: Explore Kanarii */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#A5A58D]">
            {t('pedagogy.title')}
          </h2>
          <span className="text-xs text-[#6B705C] bg-white border border-[#D2B48C]/20 px-3 py-1 rounded-full font-serif italic">
            {t('pedagogy.tag')}
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
                  {t('pedagogy.openAnimation')}
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
