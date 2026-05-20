import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  ArrowRight, 
  RotateCcw,
  RefreshCw,
  UserCheck,
  MessageCircle,
  Zap,
  ArrowLeftRight,
  Shield,
  Send
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
    title: "1. Evitando cuellos de botella",
    body: "Para que la comunidad funcione, los grupos de trabajo deben comunicarse. Pero usar a una sola persona como \"jefe\" o enlace único sobrecarga a esa persona y crea cuellos de botella jerárquicos.",
    label: "El problema del enlace único"
  },
  {
    id: 2,
    title: "2. El Coordinador",
    body: "Una persona del grupo es elegida como Coordinador. Su rol principal es traer la visión general, los objetivos y las necesidades de toda la comunidad hacia su grupo de trabajo local.",
    label: "Visión General -> Local"
  },
  {
    id: 3,
    title: "3. El Representante",
    body: "Otra persona diferente es elegida como Representante. Su rol es llevar la voz, los límites y las propuestas de su grupo de vuelta al círculo general de la comunidad.",
    label: "Voz Local -> General"
  },
  {
    id: 4,
    title: "4. El Doble Enlace",
    body: "Igual que la energía no puede fluir en dos direcciones por un solo cable a la vez, usar dos personas crea un flujo de información bidireccional, transparente y sin jerarquías opresivas.",
    label: "Flujo Bidireccional"
  }
];

export default function DoubleLinkAnimation({ onNext, onBack, progressTracker }: { onNext?: () => void, onBack?: () => void, progressTracker?: React.ReactNode }) {
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
              <RefreshCw size={24} />
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
          
          <DoubleLinkVisualization step={currentStep} />
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

function DoubleLinkVisualization({ step }: { step: number }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      
      {/* Circle A (General) */}
      <motion.div 
        animate={{ x: -100 }}
        className="absolute w-32 h-32 rounded-full border-2 border-dashed border-[#5A5A40]/30 bg-[#5A5A40]/5 flex items-center justify-center"
      >
        <span className="text-[10px] uppercase font-black text-[#5A5A40]/40 mt-16 font-mono">Círculo General</span>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1">
            {[1,2,3].map(i => <div key={i} className="w-4 h-4 bg-[#5A5A40]/20 rounded-full" />)}
        </div>
      </motion.div>

      {/* Circle B (Specific) */}
      <motion.div 
        animate={{ x: 100 }}
        className="absolute w-32 h-32 rounded-full border-2 border-dashed border-[#D2B48C]/50 bg-[#D2B48C]/5 flex items-center justify-center"
      >
        <span className="text-[10px] uppercase font-black text-[#D2B48C]/60 mt-16 font-mono text-center">Círculo de Trabajo</span>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1">
            {[1,2].map(i => <div key={i} className="w-4 h-4 bg-[#D2B48C]/40 rounded-full" />)}
        </div>
      </motion.div>

      {/* Avatars and Flow */}
      <div className="absolute inset-0">
        
        {/* Step 0: Single stressed link */}
        {step === 0 && (
          <motion.div
            initial={{ x: -100 }}
            animate={{ 
              x: [-100, 100, -100],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <div className="w-12 h-12 bg-[#5D4037] rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
                <Zap size={20} className="text-amber-400 animate-pulse" />
            </div>
            <motion.div 
               animate={{ opacity: [0, 1, 0], y: -20 }}
               transition={{ duration: 1, repeat: Infinity }}
               className="absolute -top-4 w-full text-center text-xs font-bold text-red-500"
            >
                ¡AGOBIO!
            </motion.div>
          </motion.div>
        )}

        {/* Step 1: Coordinator (Blue Aura) */}
        {(step === 1 || step === 3) && (
          <motion.div
            initial={{ opacity: 0, x: -100, y: -40 }}
            animate={{ 
                opacity: 1, 
                x: step === 3 ? [-100, 100, 80, -100] : 100,
                y: step === 3 ? [-40, -40, -40, -40] : -40
            }}
            transition={{ 
                duration: step === 3 ? 4 : 1, 
                repeat: step === 3 ? Infinity : 0, 
                ease: step === 3 ? "linear" : "easeOut" 
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-md rounded-full shadow-[0_0_20px_blue] scale-150" />
                <div className="w-12 h-12 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
                    <Shield size={20} />
                </div>
            </div>
            <div className="mt-2 text-center text-[9px] font-bold uppercase text-blue-600">Coordinador</div>
          </motion.div>
        )}

        {/* Step 2: Representative (Orange Aura) */}
        {(step === 2 || step === 3) && (
          <motion.div
            initial={{ opacity: 0, x: 100, y: 40 }}
            animate={{ 
                opacity: 1, 
                x: step === 3 ? [100, -100, -80, 100] : -100,
                y: step === 3 ? [40, 40, 40, 40] : 40
            }}
            transition={{ 
                duration: step === 3 ? 4 : 1, 
                repeat: step === 3 ? Infinity : 0, 
                ease: step === 3 ? "linear" : "easeOut" 
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 blur-md rounded-full shadow-[0_0_20px_orange] scale-150" />
                <div className="w-12 h-12 bg-orange-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
                    <Send size={20} />
                </div>
            </div>
            <div className="mt-2 text-center text-[9px] font-bold uppercase text-orange-600">Representante</div>
          </motion.div>
        )}
      </div>

      {/* Path Indicators for Step 3 */}
      {step === 3 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="-200 -200 400 400">
           <motion.path
             d="M -100 -40 L 100 -40"
             fill="none"
             stroke="blue"
             strokeWidth="1"
             strokeDasharray="4 4"
             initial={{ pathLength: 0 }}
             animate={{ pathLength: 1 }}
             className="opacity-20"
           />
           <motion.path
             d="M 100 40 L -100 40"
             fill="none"
             stroke="orange"
             strokeWidth="1"
             strokeDasharray="4 4"
             initial={{ pathLength: 0 }}
             animate={{ pathLength: 1 }}
             className="opacity-20"
           />
        </svg>
      )}

    </div>
  );
}
