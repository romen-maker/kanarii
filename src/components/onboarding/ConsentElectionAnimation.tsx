import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  ArrowRight, 
  RotateCcw,
  UserCheck,
  MessageCircle,
  ThumbsUp,
  CheckCircle2,
  Sparkles,
  PenTool,
  Lightbulb,
  Heart
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
    title: "1. La necesidad, no la campaña",
    body: "Cuando hay que elegir a alguien para una responsabilidad, no hacemos campañas políticas ni votamos por mayoría. Nos centramos en qué necesita la comunidad para ese rol en este momento.",
    label: "Selección por rol"
  },
  {
    id: 2,
    title: "2. Nominar con argumentos",
    body: "Cada persona nomina a quien cree más capaz (¡incluso a sí misma!) y explica el porqué al grupo. Los argumentos y las razones importan mucho más que sumar mayorías numéricas.",
    label: "Argumentos > Votos"
  },
  {
    id: 3,
    title: "3. Cambiar de opinión",
    body: "Tras escuchar los argumentos de todos, puedes cambiar tu nominación. En lugar de competir por tener la razón, nos dejamos convencer por la sabiduría colectiva del grupo.",
    label: "Sabiduría Colectiva"
  },
  {
    id: 4,
    title: "4. Elegidos por confianza",
    body: "Se propone a la persona más adecuada basándose en los argumentos. Si nadie tiene una objeción real de que esa persona asuma el rol, ¡tenemos un acuerdo! La responsabilidad se delega por confianza.",
    label: "Confianza Delegada"
  }
];

export default function ConsentElectionAnimation({ onNext, onBack, progressTracker }: { onNext?: () => void, onBack?: () => void, progressTracker?: React.ReactNode }) {
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
            <div className="w-10 h-10 bg-[#8B4513] rounded-xl flex items-center justify-center text-white">
              <UserCheck size={24} />
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
        <div className="relative aspect-square bg-white rounded-[40px] border border-[#D2B48C]/20 shadow-xl overflow-hidden flex items-center justify-center p-8">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#8B4513_1px,transparent_1px)] [background-size:24px_24px]" />
          
          <ElectionVisualization step={currentStep} />
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
                className="group flex items-center gap-2 bg-[#5A5A40] text-[#FAF9F6] px-8 py-4 rounded-2xl font-semibold hover:bg-[#4A4A35] transition-all shadow-lg active:scale-95"
              >
                Siguiente paso
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
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

function ElectionVisualization({ step }: { step: number }) {
  const avatars = [
    { id: 1, x: -100, y: -40, nominates: 2 },
    { id: 2, x: 0, y: -100, nominates: 2 },
    { id: 3, x: 100, y: -40, nominates: 2 },
    { id: 4, x: 60, y: 80, nominates: 1 },
    { id: 5, x: -60, y: 80, nominates: 3 },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      
      {/* Central Role Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0.5 }}
        animate={{ 
            scale: step === 3 ? 1.2 : 1,
            backgroundColor: step === 3 ? "#10B981" : "white",
            color: step === 3 ? "white" : "#8B4513"
        }}
        className="z-10 w-24 h-24 rounded-full border-4 border-[#8B4513]/20 shadow-2xl flex items-center justify-center"
      >
        <div className="flex flex-col items-center">
             <PenTool size={32} />
             <span className="text-[8px] uppercase font-bold mt-1">Nuevo Rol</span>
        </div>
      </motion.div>

      {/* Avatars */}
      {avatars.map((av) => (
        <motion.div
          key={av.id}
          initial={{ x: av.x, y: av.y }}
          animate={{ 
            scale: step === 3 && av.id === 2 ? 1.2 : 1,
            x: av.x,
            y: av.y
          }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="relative">
            {/* Nominations Lines / Bubbles */}
            {step === 1 && (
               <motion.div
                 initial={{ opacity: 0, scale: 0 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm text-[8px] font-bold whitespace-nowrap"
               >
                 Nomino a...
               </motion.div>
            )}

            {step === 2 && (
               <motion.div
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: -10 }}
                 className="absolute -top-16 left-1/2 -translate-x-1/2 bg-amber-50 p-2 rounded-2xl border border-amber-200 shadow-lg text-[7px] leading-tight w-24 font-serif italic text-[#5D4037]/80"
               >
                 "Porque tiene experiencia en..."
               </motion.div>
            )}

            {/* Step 3: All signal to ID 2 (The chosen one) */}
            {step >= 2 && av.id !== 2 && (
               <motion.div
                 initial={false}
                 animate={{ 
                    opacity: step === 3 ? 1 : 0,
                    x: step === 3 ? (0 - av.x) * 0.4 : 0,
                    y: step === 3 ? (-100 - av.y) * 0.4 : 0,
                 }}
                 className="absolute z-0"
               >
                 <ArrowRight size={16} className="text-emerald-500 rotate-[-120deg]" />
               </motion.div>
            )}

            {/* Avatar Circle */}
            <div className={`w-14 h-14 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white font-bold transition-colors ${step === 3 && av.id === 2 ? "bg-emerald-600" : "bg-[#D2B48C]"}`}>
              <Users size={20} />
            </div>

            {/* Consent Checkmark at the end */}
            {step === 3 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-1 border-2 border-white text-white shadow-sm"
              >
                <CheckCircle2 size={12} />
              </motion.div>
            )}
          </div>
        </motion.div>
      ))}

      {/* Celebration Sparkles */}
      <AnimatePresence>
        {step === 3 && (
            <>
                <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 2, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute text-yellow-400 z-50 pointer-events-none"
                    style={{ left: '60%', top: '30%' }}
                >
                    <Sparkles size={40} />
                </motion.div>
                <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute text-emerald-400 z-50 pointer-events-none"
                    style={{ left: '40%', top: '70%' }}
                >
                    <Heart size={30} fill="currentColor" />
                </motion.div>
            </>
        )}
      </AnimatePresence>

    </div>
  );
}
