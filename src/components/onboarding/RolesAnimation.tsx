import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Coffee, 
  FileText, 
  ChevronRight, 
  RotateCcw,
  Sparkles,
  Lightbulb,
  Heart,
  Zap,
  ArrowRight
} from 'lucide-react';

interface Step {
  id: number;
  title: string;
  body: string;
  label: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: "1. Diferentes ritmos de vida",
    body: "En Kanarii entendemos que no todos podemos dedicarle el mismo tiempo al grupo. Tu nivel de implicación puede variar según tu momento vital, ¡y eso es perfectamente normal!",
    label: "Diversidad de ritmos"
  },
  {
    id: 2,
    title: "2. Miembros Activos",
    body: "Son las personas que han asumido la responsabilidad de empujar los proyectos del día a día. Sus respuestas son las únicas que el sistema exige para saber si hemos alcanzado la participación mínima necesaria para aprobar algo.",
    label: "Compromiso del día a día"
  },
  {
    id: 3,
    title: "3. Apoyo sin presiones",
    body: "Como voluntario u observador, puedes leer, opinar y proponer ideas siempre que quieras. Sin embargo, si una temporada estás muy ocupado y no entras a la app, no pasa nada: tu silencio no frenará el trabajo de los demás.",
    label: "Voluntarios y Observadores"
  },
  {
    id: 4,
    title: "4. Adaptándonos a ti",
    body: "La vida cambia. Si necesitas un descanso, puedes pasar a ser observador un tiempo. Si quieres asumir más responsabilidad, puedes dar un paso al frente. La herramienta se adapta a la comunidad, no la comunidad a la herramienta.",
    label: "Fluir entre roles"
  }
];

export default function RolesAnimation({ onNext, onBack, progressTracker }: { onNext?: () => void, onBack?: () => void, progressTracker?: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const restart = () => {
    setCurrentStep(0);
  };

  const step = STEPS[currentStep];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#5D4037] font-sans p-6 md:p-12 flex flex-col items-center justify-center">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl flex items-center justify-between mb-12"
      >
        <div className="flex flex-col gap-2">
          {onBack && (
            <button 
              onClick={onBack}
              className="text-xs font-bold uppercase tracking-wider text-[#5D4037]/40 hover:text-[#5A5A40] transition-colors flex items-center gap-1"
            >
              ← Volver al índice
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#5A5A40] rounded-xl flex items-center justify-center text-white">
              <UserPlus size={24} />
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-[#3E2723]">Kanarii</h1>
          </div>
        </div>
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-[#5A5A40]' : 'w-2 bg-[#D2B48C]/30'}`}
            />
          ))}
        </div>
      </motion.header>

      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-16 items-center">
        
        {/* Visual Animation Canvas */}
        <div className="relative aspect-square bg-white rounded-[48px] border border-[#D2B48C]/20 shadow-xl overflow-hidden flex items-center justify-center p-8">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#8B4513_1px,transparent_1px)] [background-size:24px_24px]" />
          
          <RolesVisualization step={currentStep} />
        </div>

        {/* Text Content Area */}
        <div className="flex flex-col justify-center space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="inline-block px-3 py-1 bg-[#D2B48C]/20 rounded-full text-xs font-semibold uppercase tracking-wider text-[#8B4513]">
                {step.label}
              </div>
              <h2 className="text-4xl font-serif font-bold text-[#3E2723] leading-tight">
                {step.title}
              </h2>
              <p className="text-xl text-[#5D4037]/80 leading-relaxed font-serif italic">
                {step.body}
              </p>
            </motion.div>
          </AnimatePresence>

          <footer className="mt-12 flex flex-wrap gap-4">
            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={nextStep}
                className="group flex items-center gap-2 bg-[#5A5A40] text-[#FAF9F6] px-8 py-4 rounded-2xl font-semibold hover:bg-[#4A4A35] transition-all shadow-lg shadow-[#5A5A40]/20 active:scale-95"
              >
                Siguiente paso
                <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={restart}
                  className="flex items-center gap-2 bg-[#D2B48C] text-white px-6 py-4 rounded-2xl font-semibold hover:bg-[#C1A37B] transition-all shadow-md active:scale-95"
                >
                  Reiniciar animación
                  <RotateCcw size={18} />
                </button>
                {onNext && (
                  <button
                    onClick={onNext}
                    className="flex items-center gap-2 bg-[#10B981] text-white px-8 py-4 rounded-2xl font-semibold hover:bg-[#059669] transition-all shadow-lg shadow-[#10B981]/20 active:scale-95"
                  >
                    Siguiente módulo
                    <ArrowRight size={20} />
                  </button>
                )}
              </div>
            )}
          </footer>
          {progressTracker}
        </div>
      </div>
    </div>
  );
}

function RolesVisualization({ step }: { step: number }) {
  // Define 6 avatars. Positions will change based on step.
  // Step 0: Diverse avatars in a loose circle.
  // Step 1: 1, 2, 3 step into center with aura.
  // Step 2: 1, 2, 3 at center, others observing.
  // Step 3: Transition aura from 1 to 4.

  const avatarData = [
    { id: 1, initialX: -100, initialY: -80, icon: <Zap size={20} /> },   // Active candidate
    { id: 2, initialX: 0, initialY: -110, icon: <FileText size={20} /> }, // Active candidate
    { id: 3, initialX: 100, initialY: -80, icon: <Lightbulb size={20} /> }, // Active candidate
    { id: 4, initialX: -110, initialY: 60, icon: <Coffee size={20} /> },  // Volunteer -> Active
    { id: 5, initialX: 110, initialY: 60, icon: <Users size={20} /> },   // Volunteer
    { id: 6, initialX: 0, initialY: 100, icon: <Heart size={20} /> },    // Volunteer
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      
      {/* Central Area Background */}
      <AnimatePresence>
        {step >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute w-48 h-48 border-2 border-dashed border-[#D2B48C]/30 rounded-full"
          />
        )}
      </AnimatePresence>

      {/* Avatars */}
      {avatarData.map((av) => {
        const isActive = (step === 1 || step === 2) && (av.id === 1 || av.id === 2 || av.id === 3);
        const willBeActiveAfterTransition = step === 3 && (av.id === 2 || av.id === 3 || av.id === 4);
        const isCurrentlyActive = isActive || (step === 3 && (av.id === 1 || av.id === 2 || av.id === 3 || av.id === 4));
        
        let targetX = av.initialX;
        let targetY = av.initialY;

        // Positioning logic
        if (step === 1 || step === 2) {
          if (av.id === 1) { targetX = -40; targetY = -40; }
          if (av.id === 2) { targetX = 40; targetY = -40; }
          if (av.id === 3) { targetX = 0; targetY = 40; }
        }

        if (step === 3) {
           if (av.id === 1) { targetX = -120; targetY = -80; } // Id 1 steps back
           if (av.id === 4) { targetX = -40; targetY = -40; }  // Id 4 steps forward
           if (av.id === 2) { targetX = 40; targetY = -40; }
           if (av.id === 3) { targetX = 0; targetY = 40; }
        }

        const showAura = isActive || (step === 3 && (av.id === 2 || av.id === 3 || av.id === 4));
        const wasAura = step === 3 && av.id === 1;

        return (
          <motion.div
            key={av.id}
            initial={false}
            animate={{
              x: targetX,
              y: targetY,
              scale: isCurrentlyActive ? 1.1 : 1,
            }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            {/* Aura Effect */}
            <AnimatePresence>
              {showAura && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1.2 }}
                  exit={{ opacity: 0, scale: 1.4 }}
                  className="absolute inset-0 bg-[#5A5A40]/10 rounded-full ring-4 ring-[#5A5A40]/20 blur-sm"
                />
              )}
            </AnimatePresence>

            {/* Avatar Circle */}
            <motion.div 
              animate={{
                backgroundColor: showAura ? "#5A5A40" : "#D2B48C",
              }}
              className="relative w-16 h-16 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white z-10"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  {av.icon}
                </motion.div>
              </AnimatePresence>

              {/* Status Icons for Active members */}
              {showAura && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-white shadow-sm"
                >
                  <Sparkles size={10} />
                </motion.div>
              )}
            </motion.div>

            {/* Step 2 Reaction Overlay for Volunteer 5 */}
            <AnimatePresence>
              {step === 2 && av.id === 5 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: -45 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-1/2 -translate-x-1/2 bg-amber-100 text-amber-600 rounded-full p-2 border border-amber-200 shadow-md flex items-center justify-center"
                >
                  <Lightbulb size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Quorum Progress (Step 2) */}
      <AnimatePresence>
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-10 w-64 h-3 bg-gray-100 rounded-full border border-gray-200 shadow-inner overflow-hidden"
          >
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              className="h-full bg-emerald-500" 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transition Magic (Step 3: Handover) */}
      <AnimatePresence>
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 pointer-events-none"
          >
             <svg className="w-full h-full" viewBox="-200 -200 400 400">
                <motion.path
                  d="M -120 -80 Q -80 -60 -40 -40"
                  fill="none"
                  stroke="#5A5A40"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8 }}
                />
             </svg>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
