import { motion, AnimatePresence } from 'motion/react';
import GovernanceFlowAnimation from '../components/onboarding/GovernanceFlowAnimation';
import AsynchronousLogicAnimation from '../components/onboarding/AsynchronousLogicAnimation';
import RolesAnimation from '../components/onboarding/RolesAnimation';
import CruceAnimation from '../components/onboarding/CruceAnimation';
import FichaRolesAnimation from '../components/onboarding/FichaRolesAnimation';
import ComunidadesCirculosAnimation from '../components/onboarding/ComunidadesCirculosAnimation';
import DoubleLinkAnimation from '../components/onboarding/DoubleLinkAnimation';
import ConsentElectionAnimation from '../components/onboarding/ConsentElectionAnimation';
import { 
  Sparkles, 
  ArrowRight, 
  Heart, 
  Globe, 
  PartyPopper, 
  Layout, 
  Timer, 
  UserPlus, 
  ArrowRightLeft, 
  UserCircle, 
  LayoutGrid, 
  RefreshCw, 
  UserCheck 
} from 'lucide-react';
import { useOnboarding } from '../hooks/useOnboarding';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../components/language/LanguageSelector';

export default function KanariiTourPage() {
  const { t } = useTranslation('welcome');
  const { appUser } = useAuth();
  const navigate = useNavigate();
  
  const { 
    view, 
    setView, 
    tourStep, 
    selectedModule, 
    startTour, 
    nextTourStep, 
    backToMenu, 
    viewModule, 
    completeTour 
  } = useOnboarding(appUser?.uid);

  const modules = [
    { id: 'a1', title: t('tour.modules.a1.title'), icon: Layout, color: 'bg-[#5A5A40]', desc: t('tour.modules.a1.desc') },
    { id: 'a8', title: t('tour.modules.a8.title'), icon: LayoutGrid, color: 'bg-[#10B981]', desc: t('tour.modules.a8.desc') },
    { id: 'a6', title: t('tour.modules.a6.title'), icon: RefreshCw, color: 'bg-[#6366f1]', desc: t('tour.modules.a6.desc') },
    { id: 'a7', title: t('tour.modules.a7.title'), icon: UserCheck, color: 'bg-[#f59e0b]', desc: t('tour.modules.a7.desc') },
    { id: 'a4', title: t('tour.modules.a4.title'), icon: Timer, color: 'bg-[#D2B48C]', desc: t('tour.modules.a4.desc') },
    { id: 'a5', title: t('tour.modules.a5.title'), icon: UserPlus, color: 'bg-[#8B4513]', desc: t('tour.modules.a5.desc') },
    { id: 'a2', title: t('tour.modules.a2.title'), icon: ArrowRightLeft, color: 'bg-[#5D4037]', desc: t('tour.modules.a2.desc') },
    { id: 'a3', title: t('tour.modules.a3.title'), icon: UserCircle, color: 'bg-[#3E2723]', desc: t('tour.modules.a3.desc') },
  ];

  const progressTracker = (
    <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-[#D2B48C]/20 shadow-lg w-fit mt-8 pb-6">
      <span className="text-[10px] uppercase font-black tracking-widest text-[#5D4037]/40 mr-2">{t('tour.progressLabel')}</span>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <div 
          key={i} 
          className={`h-2 rounded-full transition-all duration-700 ${i === tourStep ? 'w-12 bg-[#5A5A40]' : i < tourStep ? 'w-2 bg-[#10B981]' : 'w-2 bg-[#D2B48C]/30'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#5D4037] font-sans selection:bg-[#D2B48C]/30 overflow-x-hidden">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <LanguageSelector />
        <button
          onClick={() => navigate(appUser ? '/ficha' : '/')}
          className="flex items-center gap-1.5 text-sm text-[#8A817C] hover:text-[#4A4E4D] bg-white/80 backdrop-blur-sm border border-[#EAE2D6] px-3 py-1.5 rounded-xl shadow-sm transition-all hover:shadow-md font-medium"
        >
          <span>{appUser ? t('tour.navBackProfile') : t('tour.navBackHome')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {view === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 bg-[#5A5A40] rounded-[32px] flex items-center justify-center text-white mb-10 shadow-2xl"
            >
              <Globe size={48} />
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#3E2723] mb-8 leading-tight">
              {t('tour.intro.title')}
            </h1>
            
            <p className="text-xl md:text-2xl text-[#5D4037]/80 leading-relaxed font-serif italic mb-12">
              {t('tour.intro.quote')}
            </p>
            
            <button
              onClick={() => setView('menu')}
              className="flex items-center gap-3 bg-[#5A5A40] text-white px-12 py-6 rounded-[24px] font-bold text-xl hover:bg-[#4A4A35] transition-all shadow-xl active:scale-95 group"
            >
              <span>{t('tour.intro.start')}</span>
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>
        )}

        {view === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex flex-col items-center justify-center p-8 max-w-6xl mx-auto py-20"
          >
            <h2 className="text-4xl font-serif font-bold text-[#3E2723] mb-4 text-center">{t('tour.menu.title')}</h2>
            <p className="text-[#5D4037]/60 mb-12 text-center max-w-md">{t('tour.menu.subtitle')}</p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full mb-16">
              {modules.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => viewModule(mod.id)}
                  className="group relative bg-white p-6 rounded-[32px] border border-[#D2B48C]/20 shadow-sm hover:shadow-xl transition-all text-left flex flex-col gap-4"
                >
                  <div className={`w-12 h-12 ${mod.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                    <mod.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#3E2723] mb-1">{mod.title}</h3>
                    <p className="text-xs text-[#5D4037]/70 leading-relaxed">{mod.desc}</p>
                  </div>
                  <div className="mt-auto pt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#5A5A40] opacity-0 group-hover:opacity-100 transition-opacity">
                    {t('tour.menu.explore')} <ArrowRight size={12} />
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={startTour}
              className="w-full md:w-auto bg-[#5A5A40] text-white px-12 py-6 rounded-[24px] font-bold text-xl hover:bg-[#4A4A35] transition-all shadow-xl flex items-center justify-center gap-3"
            >
              <span>{t('tour.menu.fullTour')}</span>
              <Sparkles size={24} />
            </button>
          </motion.div>
        )}

        {view === 'tour' && (
          <motion.div key="tour" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
            {tourStep === 0 && <GovernanceFlowAnimation onNext={nextTourStep} onBack={backToMenu} progressTracker={progressTracker} />}
            {tourStep === 1 && <ComunidadesCirculosAnimation onNext={nextTourStep} onBack={backToMenu} progressTracker={progressTracker} />}
            {tourStep === 2 && <DoubleLinkAnimation onNext={nextTourStep} onBack={backToMenu} progressTracker={progressTracker} />}
            {tourStep === 3 && <ConsentElectionAnimation onNext={nextTourStep} onBack={backToMenu} progressTracker={progressTracker} />}
            {tourStep === 4 && <AsynchronousLogicAnimation onNext={nextTourStep} onBack={backToMenu} progressTracker={progressTracker} />}
            {tourStep === 5 && <RolesAnimation onNext={nextTourStep} onBack={backToMenu} progressTracker={progressTracker} />}
          </motion.div>
        )}

        {view === 'individual' && (
          <motion.div key="individual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
            {selectedModule === 'a1' && <GovernanceFlowAnimation onNext={() => setView('menu')} onBack={backToMenu} />}
            {selectedModule === 'a2' && <CruceAnimation onNext={() => setView('menu')} onBack={backToMenu} />}
            {selectedModule === 'a3' && <FichaRolesAnimation onNext={() => setView('menu')} onBack={backToMenu} />}
            {selectedModule === 'a4' && <AsynchronousLogicAnimation onNext={() => setView('menu')} onBack={backToMenu} />}
            {selectedModule === 'a5' && <RolesAnimation onNext={() => setView('menu')} onBack={backToMenu} />}
            {selectedModule === 'a6' && <DoubleLinkAnimation onNext={() => setView('menu')} onBack={backToMenu} />}
            {selectedModule === 'a7' && <ConsentElectionAnimation onNext={() => setView('menu')} onBack={backToMenu} />}
            {selectedModule === 'a8' && <ComunidadesCirculosAnimation onNext={() => setView('menu')} onBack={backToMenu} />}
          </motion.div>
        )}

        {view === 'final' && (
          <motion.div
            key="final"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="text-emerald-500 mb-8"
            >
              <PartyPopper size={100} />
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-[#3E2723] mb-8 leading-tight">
              {t('tour.final.title')}
            </h2>
            
            <p className="text-xl md:text-2xl text-[#5D4037]/80 leading-relaxed font-serif italic mb-12">
              {t('tour.final.quote')}
            </p>
            
            <button
              onClick={completeTour}
              className="flex items-center gap-4 bg-[#10B981] text-white px-12 py-6 rounded-[24px] font-bold text-xl hover:bg-[#059669] transition-all shadow-2xl active:scale-95"
            >
              <span>{t('tour.final.cta')}</span>
              <Heart size={24} fill="currentColor" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
