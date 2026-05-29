import { motion } from 'motion/react';
import { MousePointer2, Plus, Check } from 'lucide-react';

export default function TareasUISimulation() {
  return (
    <div className="relative w-full aspect-video bg-[#FAF9F6] rounded-2xl border border-[#D2B48C]/20 overflow-hidden shadow-inner font-sans">
      {/* Kanban Header Mockup */}
      <div className="absolute top-0 w-full h-8 bg-white/50 border-b border-[#D2B48C]/10 flex items-center px-3 gap-2">
        <div className="w-12 h-2 bg-[#D2B48C]/20 rounded-full" />
        <div className="w-8 h-2 bg-[#D2B48C]/10 rounded-full" />
      </div>

      {/* Kanban Columns */}
      <div className="absolute inset-0 pt-10 px-4 flex gap-4">
        {/* Column 1: Pendientes */}
        <div className="flex-1 space-y-2">
            <div className="w-10 h-1.5 bg-[#D2B48C]/40 rounded-full mb-3" />
            <div className="w-full h-12 bg-white rounded-xl border border-[#D2B48C]/10 shadow-sm" />
            <div className="w-full h-12 bg-white rounded-xl border border-[#D2B48C]/10 shadow-sm" />
            
            {/* Target Button (+) */}
            <div className="relative">
                <div className="w-full h-8 rounded-xl border-2 border-dashed border-[#D2B48C]/20 flex items-center justify-center text-[#D2B48C]">
                    <Plus size={14} />
                </div>
            </div>
        </div>
        
        {/* Column 2: En Progreso */}
        <div className="flex-1 space-y-2 opacity-50">
            <div className="w-10 h-1.5 bg-[#D2B48C]/40 rounded-full mb-3" />
            <div className="w-full h-16 bg-white rounded-xl border border-[#D2B48C]/10 shadow-sm" />
        </div>
      </div>

      {/* Animation Sequence Overlay */}
      <div className="absolute inset-0">
        
        {/* 1. The Form (Appears after click) */}
        <motion.div
           initial={{ opacity: 0, scale: 0.9, y: 10 }}
           animate={{ 
             opacity: [0, 0, 1, 1, 1, 0, 0],
             scale: [0.9, 0.9, 1, 1, 1, 0.9, 0.9],
           }}
           transition={{ duration: 6, repeat: Infinity, times: [0, 0.2, 0.25, 0.5, 0.7, 0.8, 1] }}
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 bg-white rounded-2xl shadow-2xl p-4 border border-[#D2B48C]/20 z-20"
        >
             <div className="w-full h-2 bg-[#D2B48C]/30 rounded-full mb-3" />
             <div className="w-full h-8 bg-[#FAF9F6] rounded-lg mb-4" />
             <div className="w-full h-6 bg-[#5A5A40] rounded-lg" />
        </motion.div>

        {/* 2. The New Task (Appears after save) */}
        <motion.div
           initial={{ opacity: 0, x: 16, y: 140 }}
           animate={{ 
             opacity: [0, 0, 0, 0, 1, 1, 0],
             y: [140, 140, 140, 140, 104, 104, 104],
           }}
           transition={{ duration: 6, repeat: Infinity, times: [0, 0.5, 0.55, 0.6, 0.7, 0.8, 1] }}
           className="absolute w-[calc(50%-24px)] h-12 bg-white rounded-xl border border-emerald-200 z-10 flex items-center px-3"
        >
            <div className="w-full h-1.5 bg-emerald-100 rounded-full" />
            <motion.div 
               animate={{ scale: [0, 1.2, 1] }} 
               transition={{ delay: 4, duration: 0.5 }}
               className="ml-auto text-emerald-500"
            >
                <Check size={12} strokeWidth={4} />
            </motion.div>
        </motion.div>

        {/* 3. The Cursor */}
        <motion.div
          animate={{ 
            x: [180, 40, 40, 100, 100, 180],
            y: [160, 140, 140, 140, 140, 160],
            scale: [1, 1, 0.8, 0.8, 1, 1]
          }}
          transition={{ duration: 6, repeat: Infinity, times: [0, 0.15, 0.2, 0.5, 0.6, 0.8] }}
          className="absolute z-50 text-[#3E2723] drop-shadow-md pointer-events-none"
        >
          <MousePointer2 size={24} fill="currentColor" />
        </motion.div>

      </div>
    </div>
  );
}
