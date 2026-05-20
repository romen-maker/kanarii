import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  ChevronDown, 
  Circle, 
  Share2, 
  RotateCcw,
  LayoutGrid,
  Zap,
  ShieldCheck,
  ArrowRight,
  Layout
} from 'lucide-react';

export default function ComunidadesCirculosAnimation({ onNext, onBack, progressTracker }: { onNext?: () => void, onBack?: () => void, progressTracker?: React.ReactNode }) {
  const [isHierarchy, setIsHierarchy] = useState(true);

  const toggle = () => {
    setIsHierarchy(!isHierarchy);
  };

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
              <Layout size={24} />
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-[#3E2723]">Kanarii</h1>
          </div>
        </div>
      </motion.header>

      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-16 items-center">
        
        {/* Animation Canvas */}
        <div className="relative aspect-square bg-white rounded-[48px] border border-[#D2B48C]/20 shadow-xl overflow-hidden flex items-center justify-center p-8">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#8B4513_1px,transparent_1px)] [background-size:24px_24px]" />
          
          <AnimatePresence mode="wait">
            {isHierarchy ? (
              <PyramidView key="pyramid" />
            ) : (
              <CirclesView key="circles" />
            )}
          </AnimatePresence>
        </div>

        {/* Text Content */}
        <div className="space-y-8">
          <motion.div layout className="space-y-6">
            <div className="inline-block px-3 py-1 bg-[#D2B48C]/20 rounded-full text-xs font-semibold uppercase tracking-wider text-[#8B4513]">
              Concepto: Estructura Dinámica
            </div>
            
            <h2 className="text-4xl font-serif font-bold text-[#3E2723] leading-tight">
              De Pirámides a Círculos
            </h2>
            
            <p className="text-xl text-[#5D4037]/80 leading-relaxed font-serif italic">
              {isHierarchy 
                ? "Las organizaciones tradicionales se basan en jerarquías rígidas donde la información y el poder fluyen solo de arriba hacia abajo."
                : "En Kanarii, nos organizamos en círculos anidados. Cada círculo tiene autonomía y autoridad en su dominio, pero están todos interconectados."
              }
            </p>

            <div className={`p-6 rounded-3xl transition-colors duration-500 flex items-start gap-4 ${isHierarchy ? "bg-gray-50 border border-gray-100" : "bg-emerald-50 border border-emerald-100"}`}>
              <div className={`p-2 rounded-xl ${isHierarchy ? "bg-gray-200 text-gray-500" : "bg-emerald-500 text-white"}`}>
                {isHierarchy ? <LayoutGrid size={24} /> : <ShieldCheck size={24} />}
              </div>
              <div className="space-y-1">
                <h4 className={`font-bold uppercase text-[10px] tracking-widest ${isHierarchy ? "text-gray-400" : "text-emerald-600"}`}>
                  {isHierarchy ? "Autoridad Central" : "Autoridad Distribuida"}
                </h4>
                <p className="text-sm text-[#5D4037]/70 italic">
                  {isHierarchy 
                    ? "Alguien decide por los demás. El resto ejecuta."
                    : "Cada subgrupo cuida una parte del todo con total soberanía y consentimiento."
                  }
                </p>
              </div>
            </div>
          </motion.div>

          <footer className="flex flex-wrap gap-4">
            <button
              onClick={toggle}
              className={`group flex items-center gap-3 px-10 py-5 rounded-2xl font-bold transition-all shadow-xl active:scale-95 ${
                isHierarchy 
                  ? "bg-[#5A5A40] text-white hover:bg-[#4A4A35]" 
                  : "bg-emerald-500 text-white hover:bg-emerald-600"
              }`}
            >
              {isHierarchy ? "Distribuir Poder" : "Ver Estructura Antigua"}
              <RotateCcw size={20} className="group-hover:rotate-45 transition-transform" />
            </button>

            {!isHierarchy && onNext && (
              <button
                onClick={onNext}
                className="flex items-center gap-2 bg-[#10B981] text-white px-8 py-4 rounded-2xl font-semibold hover:bg-[#059669] transition-all shadow-lg shadow-[#10B981]/20 active:scale-95"
              >
                Siguiente módulo
                <ArrowRight size={20} />
              </button>
            )}
          </footer>
          {progressTracker}
        </div>
      </div>
    </div>
  );
}

function PyramidView() {
  const nodes = [
    { id: 'ceo', x: 0, y: -100, label: 'Líder' },
    { id: 'm1', x: -60, y: -20, label: 'M' },
    { id: 'm2', x: 60, y: -20, label: 'M' },
    { id: 's1', x: -100, y: 60, label: 'E' },
    { id: 's2', x: -40, y: 60, label: 'E' },
    { id: 's3', x: 40, y: 60, label: 'E' },
    { id: 's4', x: 100, y: 60, label: 'E' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative w-full h-full"
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <line x1="50%" y1="50% - 100" x2="50% - 60" y2="50% - 20" stroke="#E5E7EB" strokeWidth="2" />
        <line x1="50%" y1="50% - 100" x2="50% + 60" y2="50% - 20" stroke="#E5E7EB" strokeWidth="2" />
        <line x1="50% - 60" y1="50% - 20" x2="50% - 100" y2="50% + 60" stroke="#E5E7EB" strokeWidth="2" />
        <line x1="50% - 60" y1="50% - 20" x2="50% - 40" y2="50% + 60" stroke="#E5E7EB" strokeWidth="2" />
        <line x1="50% + 60" y1="50% - 20" x2="50% + 40" y2="50% + 60" stroke="#E5E7EB" strokeWidth="2" />
        <line x1="50% + 60" y1="50% - 20" x2="50% + 100" y2="50% + 60" stroke="#E5E7EB" strokeWidth="2" />
      </svg>

      {nodes.map(node => (
        <motion.div
          key={node.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center text-[10px] font-bold text-gray-400 shadow-sm"
          style={{ x: node.x, y: node.y }}
        >
          {node.label}
        </motion.div>
      ))}
      
      <motion.div 
        animate={{ y: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 text-gray-300"
      >
        <ChevronDown size={32} />
      </motion.div>
    </motion.div>
  );
}

function CirclesView() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.2 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full h-full flex items-center justify-center"
    >
      {/* General Circle */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute w-72 h-72 border-2 border-emerald-500/30 bg-emerald-500/5 rounded-full flex items-center justify-center"
      >
        <span className="absolute top-4 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">General</span>
        
        {/* Sub-Circles */}
        <div className="relative w-full h-full flex items-center justify-center gap-4">
          <SubCircle label="Cuidados" color="bg-amber-100 border-amber-400 text-amber-700" x={-60} y={-20} />
          <SubCircle label="Técnico" color="bg-blue-100 border-blue-400 text-blue-700" x={60} y={-20} />
          <SubCircle label="Huerto" color="bg-green-100 border-green-400 text-green-700" x={0} y={60} />
        </div>
      </motion.div>

      {/* Connection Lines (Double links) */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full" viewBox="-150 -150 300 300">
          <motion.path
            d="M -15 45 Q 0 0 15 45"
            fill="none"
            stroke="#10B981"
            strokeWidth="2"
            strokeDasharray="4 4"
            animate={{ pathOffset: [0, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          />
        </svg>
      </div>

      <motion.div 
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute z-50 text-emerald-500"
      >
        <Share2 size={32} />
      </motion.div>
    </motion.div>
  );
}

function SubCircle({ label, color, x, y }: { label: string, color: string, x: number, y: number }) {
  return (
    <motion.div
      initial={{ scale: 0, x: 0, y: 0 }}
      animate={{ scale: 1, x, y }}
      className={`absolute w-32 h-32 rounded-full border-2 border-dashed ${color} flex items-center justify-center shadow-inner`}
    >
      <div className="flex flex-col items-center gap-1">
        <Users size={20} />
        <span className="text-[10px] font-bold uppercase">{label}</span>
      </div>
      
      {/* Representatives (Double link concept) */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
        className="absolute inset-0"
      >
         <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-current rounded-full" />
      </motion.div>
    </motion.div>
  );
}
