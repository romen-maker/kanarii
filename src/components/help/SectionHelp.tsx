import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, X, Sparkles } from 'lucide-react';

interface SectionHelpProps {
  title: string;
  description: string | ReactNode;
  animationNode?: ReactNode;
}

export default function SectionHelp({ title, description, animationNode }: SectionHelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Help Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggle}
        className="fixed bottom-20 right-6 md:static w-10 h-10 rounded-full bg-white border border-[#D2B48C]/30 shadow-md flex items-center justify-center text-[#5A5A40] hover:bg-[#FAF9F6] transition-colors z-[60]"
        aria-label="Ayuda contextual"
      >
        <Info size={20} strokeWidth={2.5} />
      </motion.button>

      {/* Modal / Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggle}
              className="absolute inset-0 bg-[#3E2723]/40 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-xl bg-[#FAF9F6] rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={toggle}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/50 hover:bg-white text-[#5D4037] transition-colors z-50"
              >
                <X size={20} />
              </button>

              {/* Animation Header (Optional) */}
              {animationNode && (
                <div className="w-full bg-white p-8 flex items-center justify-center border-b border-[#D2B48C]/10">
                  <div className="w-full max-w-[280px]">
                    {animationNode}
                  </div>
                </div>
              )}

              {/* Scrollable Content Area */}
              <div className="p-8 md:p-12 overflow-y-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40]">
                    <Sparkles size={18} />
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-[#3E2723]">
                    {title}
                  </h2>
                </div>

                <div className="text-lg text-[#5D4037]/80 leading-relaxed font-serif italic space-y-4">
                  {typeof description === 'string' ? (
                    <p>{description}</p>
                  ) : (
                    description
                  )}
                </div>

                <div className="mt-10 pt-8 border-t border-[#D2B48C]/20 text-center">
                  <button
                    onClick={toggle}
                    className="bg-[#5A5A40] text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-[#4A4A35] shadow-xl shadow-[#5A5A40]/10 transition-all active:scale-95"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
