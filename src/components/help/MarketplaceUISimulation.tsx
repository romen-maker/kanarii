import { motion } from 'motion/react';
import { MousePointer2, Tag, Handshake, Heart } from 'lucide-react';

export default function MarketplaceUISimulation() {
  return (
    <div className="relative w-full aspect-video bg-[#FAF9F6] rounded-2xl border border-[#D2B48C]/20 overflow-hidden shadow-inner font-sans">
      
      {/* Board Background */}
      <div className="absolute inset-0 p-6 flex flex-col">
        <div className="w-40 h-6 bg-[#D2B48C]/10 rounded-full mb-8" />
        <div className="flex-1 grid grid-cols-3 gap-3 opacity-20">
            {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-[#D2B48C]/10 aspect-square" />
            ))}
        </div>
      </div>

      {/* Animation Sequence Overlay */}
      <div className="absolute inset-0">
        
        {/* Step 1: Initial Button */}
        <div className="absolute top-4 right-6">
            <div className="px-4 py-2 bg-[#5A5A40]/10 rounded-full border border-[#5A5A40]/20 flex items-center gap-2">
                <div className="w-2 h-2 bg-[#5A5A40] rounded-full" />
                <div className="w-16 h-2 bg-[#5A5A40]/30 rounded-full" />
            </div>
        </div>

        {/* Step 2: Options UI */}
        <motion.div
           initial={{ opacity: 0, scale: 0.9, y: 10 }}
           animate={{ 
             opacity: [0, 0, 1, 1, 1, 0, 0],
             scale: [0.9, 0.9, 1, 1, 1, 0.9, 0.9],
           }}
           transition={{ duration: 6, repeat: Infinity, times: [0, 0.2, 0.25, 0.5, 0.7, 0.8, 1] }}
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 bg-white rounded-3xl shadow-2xl p-4 border border-[#D2B48C]/20 z-20"
        >
             <div className="w-20 h-2 bg-[#D2B48C]/20 rounded-full mb-4 mx-auto" />
             <div className="flex gap-3">
                <div className="flex-1 aspect-square bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center gap-2">
                    <Heart size={18} className="text-emerald-500" />
                    <div className="w-8 h-1.5 bg-emerald-200 rounded-full" />
                </div>
                <div className="flex-1 aspect-square bg-amber-50 rounded-2xl border border-amber-100 flex flex-col items-center justify-center gap-2">
                    <Tag size={18} className="text-amber-500" />
                    <div className="w-8 h-1.5 bg-amber-200 rounded-full" />
                </div>
             </div>
        </motion.div>

        {/* Step 3: Flying Card */}
        <motion.div
           initial={{ opacity: 0, scale: 0.5, x: 200, y: 150 }}
           animate={{ 
             opacity: [0, 0, 0, 0, 1, 1, 0],
             scale: [0.5, 0.5, 0.5, 0.5, 1, 1, 0.5],
             x: [200, 200, 200, 200, 40, 40, 40],
             y: [150, 150, 150, 150, 100, 100, 100]
           }}
           transition={{ duration: 6, repeat: Infinity, times: [0, 0.5, 0.55, 0.6, 0.7, 0.85, 1] }}
           className="absolute w-24 h-32 bg-white rounded-2xl border-2 border-emerald-100 shadow-xl z-20 flex flex-col p-3 gap-2"
        >
            <div className="w-full h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <Handshake size={24} />
            </div>
            <div className="space-y-2 mt-2">
                <div className="w-full h-2 bg-emerald-50 rounded-full" />
                <div className="w-3/4 h-2 bg-[#FAF9F6] rounded-full" />
            </div>
        </motion.div>

        {/* The Cursor */}
        <motion.div
          animate={{ 
            x: [280, 280, 280, 160, 160, 280],
            y: [50, 50, 50, 140, 140, 50],
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
