import { motion, AnimatePresence } from 'motion/react';
import KanariiOnboarding from '../components/onboarding/KanariiOnboarding';
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

export default function KanariiTourPage() {
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
    { id: 'a1', title: 'Toma de Decisiones', icon: Layout, color: 'bg-[#5A5A40]', desc: 'Cómo decidimos sin votar.' },
    { id: 'a8', title: 'Estructura S3', icon: LayoutGrid, color: 'bg-[#10B981]', desc: 'Círculos anidados y autonomía.' },
    { id: 'a6', title: 'Doble Enlace', icon: RefreshCw, color: 'bg-[#6366f1]', desc: 'Flujo de información bidireccional.' },
    { id: 'a7', title: 'Elecciones Consentimiento', icon: UserCheck, color: 'bg-[#f59e0b]', desc: 'Asignación de roles por confianza.' },
    { id: 'a4', title: 'Ritmo Flexible', icon: Timer, color: 'bg-[#D2B48C]', desc: 'Plazos y participación asíncrona.' },
    { id: 'a5', title: 'Tu Compromiso', icon: UserPlus, color: 'bg-[#8B4513]', desc: 'Roles y niveles de implicación.' },
    { id: 'a2', title: 'El Cruce', icon: ArrowRightLeft, color: 'bg-[#5D4037]', desc: 'Cruce de perfiles y necesidades.' },
    { id: 'a3', title: 'La Ficha', icon: UserCircle, color: 'bg-[#3E2723]', desc: 'Tu pasaporte y dones ciudadanos.' },
  ];

  const progressTracker = (
    <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-[#D2B48C]/20 shadow-lg w-fit mt-8 pb-6">
      <span className="text-[10px] uppercase font-black tracking-widest text-[#5D4037]/40 mr-2">Progreso del tour</span>
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
      <button
        onClick={() => navigate(appUser ? '/ficha' : '/')}
        className="fixed top-4 right-4 z-50 flex items-center gap-1.5 
                   text-sm text-[#8A817C] hover:text-[#4A4E4D] 
                   bg-white/80 backdrop-blur-sm border border-[#EAE2D6] 
                   px-3 py-1.5 rounded-full shadow-sm 
                   transition-all hover:shadow-md"
      >
        {appUser ? 'Ir a mi ficha' : 'Volver al inicio'}
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

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
              Bienvenida a Kanarii
            </h1>
            
            <p className="text-xl md:text-2xl text-[#5D4037]/80 leading-relaxed font-serif italic mb-12">
              "Aquí hacemos las cosas de otra manera: sin votaciones que dividen, cuidando los tiempos de todos y respetando tu energía."
            </p>
            
            <button
              onClick={() => setView('menu')}
              className="flex items-center gap-3 bg-[#5A5A40] text-white px-12 py-6 rounded-[24px] font-bold text-xl hover:bg-[#4A4A35] transition-all shadow-xl active:scale-95 group"
            >
              Comenzar recorrido
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
            <h2 className="text-4xl font-serif font-bold text-[#3E2723] mb-4 text-center">¿Qué te gustaría descubrir hoy?</h2>
            <p className="text-[#5D4037]/60 mb-12 text-center max-w-md">Elige un tema específico o déjanos guiarte por todo el proceso.</p>
            
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
                    Explorar <ArrowRight size={12} />
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={startTour}
              className="w-full md:w-auto bg-[#5A5A40] text-white px-12 py-6 rounded-[24px] font-bold text-xl hover:bg-[#4A4A35] transition-all shadow-xl flex items-center justify-center gap-3"
            >
              Hacer el recorrido completo
              <Sparkles size={24} />
            </button>
          </motion.div>
        )}

        {view === 'tour' && (
          <motion.div key="tour" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
            {tourStep === 0 && <KanariiOnboarding onNext={nextTourStep} onBack={backToMenu} progressTracker={progressTracker} />}
            {tourStep === 1 && <ComunidadesCirculosAnimation onNext={nextTourStep} onBack={backToMenu} progressTracker={progressTracker} />}
            {tourStep === 2 && <DoubleLinkAnimation onNext={nextTourStep} onBack={backToMenu} progressTracker={progressTracker} />}
            {tourStep === 3 && <ConsentElectionAnimation onNext={nextTourStep} onBack={backToMenu} progressTracker={progressTracker} />}
            {tourStep === 4 && <AsynchronousLogicAnimation onNext={nextTourStep} onBack={backToMenu} progressTracker={progressTracker} />}
            {tourStep === 5 && <RolesAnimation onNext={nextTourStep} onBack={backToMenu} progressTracker={progressTracker} />}
          </motion.div>
        )}

        {view === 'individual' && (
          <motion.div key="individual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
            {selectedModule === 'a1' && <KanariiOnboarding onNext={() => setView('menu')} onBack={backToMenu} />}
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
              ¡Todo listo! 
            </h2>
            
            <p className="text-xl md:text-2xl text-[#5D4037]/80 leading-relaxed font-serif italic mb-12">
              "Recuerda que no buscamos la perfección, sino decisiones que sean lo suficientemente buenas por ahora y seguras para intentar."
            </p>
            
            <button
              onClick={completeTour}
              className="flex items-center gap-4 bg-[#10B981] text-white px-12 py-6 rounded-[24px] font-bold text-xl hover:bg-[#059669] transition-all shadow-2xl active:scale-95"
            >
              Entrar a mi comunidad
              <Heart size={24} fill="currentColor" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
