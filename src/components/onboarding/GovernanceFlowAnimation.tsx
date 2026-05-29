import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lightbulb, 
  FileText, 
  HelpCircle, 
  AlertTriangle, 
  Ban, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Users
} from 'lucide-react';

interface Step {
  id: number;
  title: string;
  body: string;
  status: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: "1. Todo nace de una tensión (Driver)",
    body: "Alguien identifica una necesidad o problema en la comunidad y propone una solución. La propuesta se publica para que todos la lean.",
    status: "Borrador ➡️ Abierta"
  },
  {
    id: 2,
    title: "2. Dudas y Preocupaciones no bloquean",
    body: "Antes de decidir, puedes marcar Duda ❓ para que el autor te aclare algo. Si ves un riesgo menor, puedes marcar Preocupación ⚠️; el grupo la tendrá en cuenta, pero no frenará el avance de la propuesta.",
    status: "Dudas y Preocupaciones"
  },
  {
    id: 3,
    title: "3. La Objeción es un regalo",
    body: "Si crees que la propuesta causará un daño real al grupo, levantas una Objeción ⛔. ¡Una sola objeción detiene la propuesta! No hay mayorías que aplasten a minorías. El autor modificará la propuesta para integrar tu objeción y crear una versión mejor y más segura.",
    status: "En Objeciones ➡️ Integrando"
  },
  {
    id: 4,
    title: "4. Consentimiento Alcanzado",
    body: "Si se alcanza el tiempo límite, hay quórum de participación y nadie tiene objeciones, la decisión se aprueba. No buscamos la perfección unánime, buscamos algo que sea 'lo suficientemente bueno por ahora y seguro para intentar'.",
    status: "Acordada 🎉"
  }
];

export default function GovernanceFlowAnimation({ onNext, onBack, progressTracker }: { onNext?: () => void, onBack?: () => void, progressTracker?: React.ReactNode }) {
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
    <div className="min-h-screen bg-[#FAF9F6] text-[#5D4037] font-sans p-6 md:p-12 flex flex-col items-center">
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
              <Users size={24} />
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-[#3E2723]">Kanarii</h1>
          </div>
        </div>
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 w-8 rounded-full transition-colors duration-500 ${i <= currentStep ? 'bg-[#5A5A40]' : 'bg-[#D2B48C]/30'}`}
            />
          ))}
        </div>
      </motion.header>

      <main className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">
        {/* Animation Area */}
        <div className="relative aspect-square bg-white rounded-[40px] border border-[#D2B48C]/20 shadow-xl shadow-[#5D4037]/5 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#8B4513_1px,transparent_1px)] [background-size:20px_20px]" />
          
          <Visualization step={currentStep} />
        </div>

        {/* Content Area */}
        <div className="flex flex-col justify-center">
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
                {step.status}
              </div>
              <h2 className="text-3xl font-serif font-bold text-[#3E2723] leading-tight">
                {step.title}
              </h2>
              <p className="text-lg text-[#5D4037]/80 leading-relaxed font-normal italic">
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
      </main>

      {/* Philosophy Tagline */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        className="mt-16 text-sm italic font-serif text-[#5D4037]"
      >
        "Lo suficientemente bueno por ahora, lo suficientemente seguro para intentarlo."
      </motion.p>
    </div>
  );
}

function Visualization({ step }: { step: number }) {
  // Define positions for 6 avatars in a circle
  const avatars = Array.from({ length: 6 }).map((_, i) => {
    const angle = (i * 360) / 6;
    const radius = 120;
    
    // In Step 2 (Objection), move author (0) and objector (3) towards the document/center
    let x = radius * Math.cos((angle * Math.PI) / 180);
    let y = radius * Math.sin((angle * Math.PI) / 180);
    
    if (step === 2) {
      if (i === 0) { x = 60; y = -20; } // Author moves in
      if (i === 3) { x = -60; y = 20; } // Objector moves in
    }

    return { x, y, id: i };
  });

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Central Guide Circle */}
      <div className="absolute w-60 h-60 border border-dashed border-[#D2B48C]/50 rounded-full" />

      {/* Avatars */}
      {avatars.map((pos) => (
        <motion.div
          key={pos.id}
          className="absolute w-14 h-14 bg-[#D2B48C] rounded-full border-4 border-white shadow-md z-10 flex items-center justify-center overflow-hidden"
          initial={false}
          animate={{
            scale: step >= 0 ? 1 : 0.8,
            backgroundColor: pos.id === 0 ? "#8B4513" : "#D2B48C", // Proposer is darker
          }}
          style={{ x: pos.x, y: pos.y }}
        >
          {pos.id === 0 && <span className="text-white text-[10px] font-bold">Autor</span>}
          
          {/* Reactions */}
          <AnimatePresence>
            {step === 1 && pos.id === 2 && (
              <motion.div
                initial={{ scale: 0, y: -20 }}
                animate={{ scale: 1, y: -45 }}
                exit={{ scale: 0 }}
                className="absolute text-blue-500 bg-white rounded-full p-1 shadow-sm border border-blue-100"
              >
                <HelpCircle size={20} />
              </motion.div>
            )}
            {step === 1 && pos.id === 4 && (
              <motion.div
                initial={{ scale: 0, y: -20 }}
                animate={{ scale: 1, y: -45 }}
                exit={{ scale: 0 }}
                className="absolute text-[#F59E0B] bg-white rounded-full p-1 shadow-sm border border-amber-100"
              >
                <AlertTriangle size={20} />
              </motion.div>
            )}
            {step === 2 && pos.id === 3 && (
              <motion.div
                initial={{ scale: 0, y: -20 }}
                animate={{ scale: 1, y: -45 }}
                exit={{ scale: 0 }}
                className="absolute text-[#EF4444] bg-white rounded-full p-1 shadow-sm border border-red-100"
              >
                <Ban size={20} />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div
                initial={{ scale: 0, y: -20 }}
                animate={{ scale: 1, y: -45 }}
                className="absolute text-[#10B981] bg-white rounded-full p-1 shadow-sm border border-emerald-100"
              >
                <CheckCircle2 size={20} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}

      {/* The Proposal Document */}
      <AnimatePresence>
        <motion.div
          key={step === 2 ? "v2" : "v1"} // Force re-render/animation for step 2 to 3
          className={`absolute w-16 h-20 rounded-lg shadow-2xl z-20 flex flex-col items-center justify-center border-2 transition-colors duration-500 ${
            step === 2 ? "bg-red-50 border-[#EF4444]/30" : 
            step === 3 ? "bg-emerald-50 border-[#10B981]/30" : 
            "bg-white border-[#D2B48C]/30"
          }`}
          initial={step === 0 ? { x: -120, y: -20, opacity: 0 } : false}
          animate={{
            x: step === 0 ? 0 : 0,
            y: 0,
            opacity: 1,
            rotate: step === 2 ? [0, -2, 2, -2, 0] : 0,
            scale: step === 3 ? 1.1 : 1,
          }}
          transition={{
            rotate: step === 2 ? { repeat: Infinity, duration: 0.5 } : { duration: 0.3 },
            x: { type: "spring", stiffness: 100 },
            opacity: { duration: 0.5 }
          }}
        >
          <FileText className={step === 2 ? "text-[#EF4444]" : step === 3 ? "text-[#10B981]" : "text-[#5A5A40]"} size={28} />
          <span className="text-[10px] font-bold mt-1 uppercase text-[#5A5A40]">
            {step >= 2 ? "v2" : "v1"}
          </span>
          
          {step === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -top-4 -right-4 text-[#F59E0B]"
            >
              <Lightbulb size={24} fill="currentColor" />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.5, 1], rotate: [0, 15, -15, 0] }}
              className="absolute -top-6 -right-6 text-[#10B981]"
            >
              <Sparkles size={32} />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Connectors for Integration step */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          {/* Visual link between author (0) and objector (3) */}
          <svg className="w-full h-full" viewBox="-200 -200 400 400">
            <motion.line
              x1="60"
              y1="-20"
              x2="-60"
              y2="20"
              stroke="#EF4444"
              strokeWidth="2"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              className="opacity-40"
            />
          </svg>
        </motion.div>
      )}
    </div>
  );
}
