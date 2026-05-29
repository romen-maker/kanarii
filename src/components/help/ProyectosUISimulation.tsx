import { motion } from 'motion/react';
import { MousePointer2, FolderOpen, Send, Lightbulb } from 'lucide-react';

export default function ProyectosUISimulation() {
  return (
    <div className="relative w-full aspect-video bg-[#FAF9F6] rounded-2xl border border-[#D2B48C]/20 overflow-hidden shadow-inner font-sans">
      {/* Background board */}
      <div className="absolute inset-0 p-6">
        <div className="w-48 h-6 bg-[#D2B48C]/10 rounded-full mb-8" />
        <div className="grid grid-cols-2 gap-4">
             <div className="h-24 bg-white rounded-3xl border border-[#D2B48C]/10 flex flex-col p-4 opacity-40">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl mb-2" />
                <div className="w-full h-2 bg-[#D2B48C]/20 rounded-full" />
             </div>
        </div>
      </div>

      {/* Animation Sequence Layer */}
      <div className="absolute inset-0">
        
        {/* The Modal / Form */}
        <motion.div
           initial={{ opacity: 0, scale: 0.9, y: 20 }}
           animate={{ 
             opacity: [0, 0, 1, 1, 1, 0, 0],
             scale: [0.9, 0.9, 1, 1, 1, 0.9, 0.9],
           }}
           transition={{ duration: 6, repeat: Infinity, times: [0, 0.2, 0.25, 0.5, 0.7, 0.8, 1] }}
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 bg-white rounded-3xl shadow-2xl p-4 border border-[#D2B48C]/20 z-20"
        >
             <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={16} className="text-amber-500" />
                <div className="w-16 h-2 bg-[#D2B48C]/20 rounded-full" />
             </div>
             <div className="w-full h-12 bg-[#FAF9F6] rounded-xl mb-3 border border-[#D2B48C]/5 p-2">
                 <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: ["0%", "0%", "80%", "80%", "0%"] }}
                    transition={{ duration: 6, repeat: Infinity, times: [0, 0.3, 0.45, 0.6, 0.7] }}
                    className="h-1.5 bg-[#D2B48C]/40 rounded-full"
                 />
             </div>
             <div className="w-full h-8 bg-emerald-600 rounded-xl flex items-center justify-center">
                 <Send size={14} className="text-white" />
             </div>
        </motion.div>

        {/* The Created Project Folder */}
        <motion.div
           initial={{ opacity: 0, scale: 0, x: 100, y: 100 }}
           animate={{ 
             opacity: [0, 0, 0, 0, 1, 1, 0],
             scale: [0, 0, 0, 0, 1, 1, 0],
             x: [100, 100, 100, 100, 160, 160, 160],
             y: [100, 100, 100, 100, 110, 110, 110]
           }}
           transition={{ duration: 6, repeat: Infinity, times: [0, 0.6, 0.65, 0.7, 0.75, 0.85, 1] }}
           className="absolute w-32 h-24 bg-white rounded-3xl border-2 border-emerald-100 shadow-xl z-10 flex flex-col items-center justify-center gap-2"
        >
            <FolderOpen size={32} className="text-emerald-600" />
            <div className="w-16 h-2 bg-emerald-50 rounded-full" />
        </motion.div>

        {/* The Cursor */}
        <motion.div
          animate={{ 
            x: [240, 60, 60, 160, 160, 240],
            y: [50, 60, 60, 140, 140, 50],
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
