import { motion } from 'motion/react';
import { LucideIcon, ArrowRight, Sparkles } from 'lucide-react';
import { ReactNode } from 'react';

interface ContextualEmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  ctaText: string;
  onAction: () => void;
  iconColor?: string;
  bgColor?: string;
  illustration?: ReactNode;
}

export default function ContextualEmptyState({
  title,
  description,
  icon: Icon,
  ctaText,
  onAction,
  iconColor = "text-[#5A5A40]",
  bgColor = "bg-[#FAF9F6]",
  illustration
}: ContextualEmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`w-full max-w-4xl mx-auto rounded-[48px] p-8 md:p-16 flex flex-col items-center text-center ${bgColor} border border-[#D2B48C]/10 shadow-sm`}
    >
      {/* Animated Illustration or Icon Container */}
      <div className="relative mb-12">
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="relative z-10"
        >
          {illustration ? (
            illustration
          ) : (
            <div className={`w-32 h-32 rounded-[32px] flex items-center justify-center bg-white shadow-xl border border-[#D2B48C]/20 ${iconColor}`}>
              <Icon size={56} strokeWidth={1.5} />
            </div>
          )}
        </motion.div>
        
        {/* Shadow/Glow effect */}
        <div className="absolute inset-0 bg-[#D2B48C]/20 blur-3xl rounded-full -z-10 scale-150 transform translate-y-4" />
      </div>

      {/* Semantic Content */}
      <div className="max-w-2xl">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#3E2723] mb-6 leading-tight">
          {title}
        </h2>
        
        <p className="text-xl text-[#5D4037]/70 leading-relaxed font-serif italic mb-10 mx-auto">
          {description}
        </p>
      </div>

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAction}
        className="group relative flex items-center gap-3 bg-[#5A5A40] text-white px-12 py-6 rounded-[24px] font-bold text-xl hover:bg-[#4A4A35] transition-all shadow-xl shadow-[#5A5A40]/20"
      >
        <Sparkles size={24} className="text-amber-300" />
        {ctaText}
        <ArrowRight className="group-hover:translate-x-2 transition-transform" />
      </motion.button>
      
      <p className="mt-8 text-xs font-bold uppercase tracking-widest text-[#5D4037]/30">
        Comienza algo nuevo en tu comunidad
      </p>
    </motion.div>
  );
}
