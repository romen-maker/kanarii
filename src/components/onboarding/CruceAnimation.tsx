import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRightLeft, 
  ArrowRight, 
  RotateCcw,
  Sparkles,
  Puzzle,
  Lightbulb,
  Shield,
  Link,
  Handshake,
  Clock,
  Sprout,
  Euro,
  Share2
} from 'lucide-react';

interface CruceStep {
  id: number;
  title: string;
  body: string;
  label: string;
}

const CRUCE_STEPS: CruceStep[] = [
  {
    id: 0,
    title: "1. Pedir y Ofrecer",
    body: "En Kanarii, tu perfil no es un currículum rígido, es un mapa vivo. Todos tenemos Necesidades en las que pedir apoyo, y todos tenemos Ofrendas y Saberes que regalar al grupo.",
    label: "El rompecabezas humano"
  },
  {
    id: 1,
    title: "2. El Cruce de Perfiles",
    body: "Nuestra herramienta \"El Cruce\" busca constantemente sinergias invisibles. Si tú necesitas aprender a cultivar y alguien en tu comunidad ofrece enseñar botánica, el sistema os cruzará para que la magia ocurra.",
    label: "La magia del Match"
  },
  {
    id: 2,
    title: "3. Arquetipos S3",
    body: "No solo cruzamos tareas, cruzamos energías. El sistema reconoce distintos Arquetipos: creadores que impulsan ideas, guardianes que cuidan los detalles o tejedores que unen a las personas.",
    label: "Distintas energías"
  },
  {
    id: 3,
    title: "4. Una nueva economía",
    body: "Al cruzar perfiles, pasamos de la fría lógica del mercado a la lógica del cuidado comunitario. Aquí el valor no lo dicta una moneda, lo dicta el tiempo, la reciprocidad y las conexiones reales.",
    label: "El verdadero valor"
  }
];

export default function CruceAnimation({ onNext, onBack, progressTracker }: { onNext?: () => void, onBack?: () => void, progressTracker?: React.ReactNode }) {
  const [stage, setStage] = useState(0); 
  
  const next = () => {
    if (stage < CRUCE_STEPS.length - 1) {
      setStage(prev => prev + 1);
    } else if (onNext) {
      onNext();
    } else {
      setStage(0);
    }
  };

  const reset = () => setStage(0);

  const currentStep = CRUCE_STEPS[stage];

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
            <div className="w-10 h-10 bg-[#D2B48C] rounded-xl flex items-center justify-center text-white">
              <ArrowRightLeft size={24} />
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-[#3E2723]">KanariiLab</h1>
          </div>
        </div>
        <div className="flex gap-1">
          {CRUCE_STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-500 ${i === stage ? 'w-8 bg-[#D2B48C]' : 'w-2 bg-[#D2B48C]/30'}`}
            />
          ))}
        </div>
      </motion.header>

      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-16 items-center">
        
        {/* Visual Canvas */}
        <div className="relative aspect-square bg-white rounded-[40px] border border-[#D2B48C]/20 shadow-xl overflow-hidden flex items-center justify-center p-8">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#8B4513_1px,transparent_1px)] [background-size:24px_24px]" />
          
          <CruceVisualization stage={stage} />
        </div>

        {/* Text Content */}
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="inline-block px-3 py-1 bg-[#D2B48C]/20 rounded-full text-xs font-semibold uppercase tracking-wider text-[#8B4513]">
                {currentStep.label}
              </div>
              
              <h2 className="text-4xl font-serif font-bold text-[#3E2723] leading-tight">
                {currentStep.title}
              </h2>
              <p className="text-xl text-[#5D4037]/80 leading-relaxed font-serif italic">
                {currentStep.body}
              </p>
            </motion.div>
          </AnimatePresence>

          <footer className="mt-12 flex flex-wrap gap-4">
            {stage < CRUCE_STEPS.length - 1 ? (
              <button
                onClick={next}
                className="group flex items-center gap-2 bg-[#5A5A40] text-white px-8 py-4 rounded-2xl font-semibold hover:bg-[#4A4A35] transition-all shadow-lg active:scale-95"
              >
                Siguiente paso
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={reset}
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

function CruceVisualization({ stage }: { stage: number }) {
  // Arquetypes icons data
  const arTypes = [
    { icon: Share2, label: "Tejedor", color: "bg-blue-500", x: -60, y: -60 },
    { icon: Lightbulb, label: "Creador", color: "bg-amber-500", x: 60, y: -60 },
    { icon: Shield, label: "Guardián", color: "bg-emerald-500", x: 60, y: 60 },
    { icon: Link, label: "Enlazador", color: "bg-purple-500", x: -60, y: 60 },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      
      {/* Background elements */}
      <AnimatePresence>
        {stage === 1 && (
           <motion.div
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 0.1, scale: 1.2 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 flex items-center justify-center"
           >
             <div className="w-64 h-64 border-4 border-emerald-500 rounded-full animate-pulse" />
           </motion.div>
        )}
      </AnimatePresence>

      {/* Avatars Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        
        {/* Avatar A: Need */}
        <motion.div
          animate={{
            x: stage === 1 ? -60 : stage >= 2 ? -40 : -100,
            y: stage >= 2 ? -20 : 0,
            scale: stage === 1 ? 1.2 : 1,
          }}
          className="absolute z-20"
        >
          <div className="relative">
            <div className="w-20 h-20 bg-[#D2B48C] rounded-full border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
               <motion.div
                 animate={{ rotate: stage === 1 ? [0, 10, -10, 0] : 0 }}
                 transition={{ repeat: Infinity, duration: 1 }}
               >
                 <ArrowRightLeft className="text-white opacity-40" size={40} />
               </motion.div>
            </div>
            
            {/* Need Label & Piece */}
            <AnimatePresence>
              {stage === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 10 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
                >
                  <div className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">NECESIDAD</div>
                  <Puzzle size={24} className="text-red-400" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Connecting Piece in Stage 1 */}
            {stage === 1 && (
               <motion.div 
                 initial={{ x: 0 }}
                 animate={{ x: 60 }}
                 className="absolute top-1/2 -right-4 -translate-y-1/2 z-30"
               >
                 <Puzzle size={30} className="text-emerald-500 drop-shadow-lg" />
               </motion.div>
            )}
          </div>
        </motion.div>

        {/* Avatar B: Offer */}
        <motion.div
          animate={{
            x: stage === 1 ? 60 : stage >= 2 ? 40 : 100,
            y: stage >= 2 ? 20 : 0,
            scale: stage === 1 ? 1.2 : 1,
          }}
          className="absolute z-20"
        >
          <div className="relative">
            <div className="w-20 h-20 bg-[#5A5A40] rounded-full border-4 border-white shadow-xl flex items-center justify-center overflow-hidden text-white font-bold italic">
               K
            </div>

            {/* Offer Label & Piece */}
            <AnimatePresence>
              {stage === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 10 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
                >
                  <div className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">OFRENDA</div>
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}>
                    <Puzzle size={24} className="text-emerald-400" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

             {/* Connecting Piece in Stage 1 */}
             {stage === 1 && (
               <motion.div 
                 initial={{ x: 0 }}
                 animate={{ x: -60 }}
                 className="absolute top-1/2 -left-4 -translate-y-1/2 z-30"
               >
                 <div className="relative">
                    <Puzzle size={30} className="text-emerald-500 fill-emerald-500 drop-shadow-lg" />
                    <Sparkles className="absolute -top-2 -right-2 text-yellow-400" size={16} />
                 </div>
               </motion.div>
            )}
          </div>
        </motion.div>

        {/* Stage 1 Match Connection Line */}
        {stage >= 1 && stage < 3 && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: stage === 1 ? 120 : 80, opacity: 1 }}
              className="absolute h-0.5 bg-emerald-500/40 z-10"
            />
        )}

        {/* Stage 2: Arquetypes */}
        {stage === 2 && (
          <div className="absolute inset-0 flex items-center justify-center">
            {arTypes.map((ar, i) => (
              <motion.div
                key={ar.label}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{ opacity: 1, scale: 1, x: ar.x, y: ar.y }}
                transition={{ delay: i * 0.1 }}
                className="absolute flex flex-col items-center gap-1"
              >
                <div className={`w-10 h-10 ${ar.color} text-white rounded-xl shadow-lg flex items-center justify-center`}>
                  <ar.icon size={18} />
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-[#5D4037]/60">{ar.label}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stage 3: New Economy Transformation */}
        {stage === 3 && (
           <div className="absolute inset-0 flex items-center justify-center">
             {/* Money Fading */}
             <motion.div
               initial={{ opacity: 1, scale: 1 }}
               animate={{ opacity: 0, scale: 0.5, y: -40 }}
               className="absolute text-red-400 flex flex-col items-center gap-1 opacity-20"
             >
               <Euro size={40} />
               <span className="text-[10px] font-bold line-through">LÓGICA MERCADO</span>
             </motion.div>

             {/* New Economy Appearing */}
             <div className="flex gap-12 mt-10">
               <motion.div
                 initial={{ opacity: 0, y: 40 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.3 }}
                 className="flex flex-col items-center gap-2"
               >
                 <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-emerald-500 border border-emerald-100 italic font-serif">
                   <Clock size={32} />
                 </div>
                 <span className="text-[10px] font-bold tracking-widest uppercase">Tiempo Real</span>
               </motion.div>

               <motion.div
                 initial={{ opacity: 0, y: 40 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.5 }}
                 className="flex flex-col items-center gap-2"
               >
                 <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-amber-600 border border-amber-100">
                   <Handshake size={32} />
                 </div>
                 <span className="text-[10px] font-bold tracking-widest uppercase">Reciprocidad</span>
               </motion.div>

               <motion.div
                 initial={{ opacity: 0, y: 40 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.7 }}
                 className="flex flex-col items-center gap-2"
               >
                 <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                   <Sprout size={32} />
                 </div>
                 <span className="text-[10px] font-bold tracking-widest uppercase">Cuidado</span>
               </motion.div>
             </div>
           </div>
        )}

      </div>
    </div>
  );
}

