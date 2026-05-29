import { motion } from 'motion/react';
import { MousePointer2, FileText, ShieldCheck } from 'lucide-react';

export default function ActasUISimulation() {
  return (
    <div className="relative w-full aspect-video bg-[#FAF9F6] rounded-2xl border border-[#D2B48C]/20 overflow-hidden shadow-inner font-sans">
      {/* Search & Header Mockup */}
      <div className="absolute top-0 w-full h-10 flex justify-between items-center bg-white/50 border-b border-[#D2B48C]/10 px-3">
        <div className="w-32 h-4 bg-[#D2B48C]/10 rounded-full" />
        <div className="w-20 h-6 bg-[#D2B48C]/20 rounded-lg flex items-center justify-center">
            <div className="w-12 h-1.5 bg-white/50 rounded-full" />
        </div>
      </div>

      {/* List content */}
      <div className="absolute inset-0 pt-16 px-6 space-y-3">
          <div className="w-full h-16 bg-white rounded-2xl border border-[#D2B48C]/10 flex items-center px-4 gap-4">
               <div className="w-8 h-8 rounded-lg bg-indigo-50" />
               <div className="space-y-2">
                    <div className="w-24 h-2 bg-[#D2B48C]/30 rounded-full" />
                    <div className="w-16 h-1.5 bg-[#D2B48C]/10 rounded-full" />
               </div>
          </div>
          <div className="w-full h-16 bg-white rounded-2xl border border-[#D2B48C]/10 flex items-center px-4 gap-4 opacity-40">
               <div className="w-8 h-8 rounded-lg bg-indigo-50" />
               <div className="space-y-2">
                    <div className="w-20 h-2 bg-[#D2B48C]/30 rounded-full" />
                    <div className="w-12 h-1.5 bg-[#D2B48C]/10 rounded-full" />
               </div>
          </div>
      </div>

      {/* Animation Sequence Overlay */}
      <div className="absolute inset-0">
        
        {/* The Document (Appears after click) */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 30 }}
           animate={{ 
             opacity: [0, 0, 1, 1, 1, 1, 0],
             y: [30, 30, 0, 0, 0, 0, 30],
           }}
           transition={{ duration: 7, repeat: Infinity, times: [0, 0.15, 0.2, 0.5, 0.7, 0.85, 1] }}
           className="absolute inset-4 bg-white rounded-[24px] shadow-2xl p-8 border border-[#D2B48C]/10 z-20 flex flex-col"
        >
             <div className="flex items-center gap-3 mb-6">
                <FileText className="text-indigo-600" size={24} />
                <div className="w-32 h-3 bg-[#D2B48C]/20 rounded-full" />
             </div>
             
             <div className="space-y-3 flex-1">
                <div className="w-full h-2 bg-[#FAF9F6] rounded-full" />
                <div className="w-full h-2 bg-[#FAF9F6] rounded-full" />
                <div className="w-3/4 h-2 bg-[#FAF9F6] rounded-full" />
             </div>

             <div className="mt-auto flex justify-end gap-3 pt-4 border-t border-[#D2B48C]/10">
                <div className="w-16 h-8 bg-[#FAF9F6] rounded-lg" />
                <div className="w-24 h-8 bg-indigo-600 rounded-lg" />
             </div>

             {/* Verification Stamp */}
             <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -20 }}
                animate={{ 
                    scale: [0, 0, 0, 0, 1.2, 1, 1],
                    opacity: [0, 0, 0, 0, 1, 1, 1],
                }}
                transition={{ duration: 7, repeat: Infinity, times: [0, 0.5, 0.55, 0.6, 0.65, 0.7, 1] }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 p-6 rounded-full border-4 border-emerald-500 bg-white/90 text-emerald-500 backdrop-blur-sm z-30"
             >
                <ShieldCheck size={48} strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-widest">Registrada</span>
             </motion.div>
        </motion.div>

        {/* The Cursor */}
        <motion.div
          animate={{ 
            x: [240, 240, 240, 180, 180, 240],
            y: [30, 30, 30, 160, 160, 30],
            scale: [1, 1, 0.8, 0.8, 1, 1]
          }}
          transition={{ duration: 7, repeat: Infinity, times: [0, 0.1, 0.15, 0.55, 0.6, 0.85] }}
          className="absolute z-50 text-[#3E2723] drop-shadow-md pointer-events-none"
        >
          <MousePointer2 size={24} fill="currentColor" />
        </motion.div>

      </div>
    </div>
  );
}
