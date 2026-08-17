import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  MapPin, 
  Heart, 
  Brain, 
  Pocket, 
  Sparkles,
  RefreshCw,
  Award,
  ArrowRight,
  UserCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FichaRolesAnimation({ onNext, onBack, progressTracker }: { onNext?: () => void, onBack?: () => void, progressTracker?: React.ReactNode }) {
  const { t } = useTranslation('welcome');
  const [isCV, setIsCV] = useState(true);

  const toggle = () => {
    setIsCV(!isCV);
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
              {t('tour.controls.backIndex')}
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#8B4513] rounded-xl flex items-center justify-center text-white">
              <UserCircle size={24} />
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-[#3E2723]">Kanarii</h1>
          </div>
        </div>
      </motion.header>

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">
        
        {/* Visual Canvas */}
        <div className="relative aspect-[3/4] bg-white rounded-[32px] border border-[#D2B48C]/20 shadow-2xl overflow-hidden p-8">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#8B4513_1px,transparent_1px)] [background-size:20px_20px]" />
          
          <AnimatePresence mode="wait">
            {isCV ? (
              <CVCard key="cv" />
            ) : (
              <FichaCard key="ficha" offeringsText={t('tour.animations.passport.offerings')} skillsText={t('tour.animations.passport.skills')} needsText={t('tour.animations.passport.needs')} purposeText={t('tour.animations.passport.purpose')} />
            )}
          </AnimatePresence>
        </div>

        {/* Content Area */}
        <div className="space-y-8">
          <motion.div layout className="space-y-6">
            <div className="inline-block px-3 py-1 bg-[#D2B48C]/20 rounded-full text-xs font-semibold uppercase tracking-wider text-[#8B4513]">
              {t('tour.animations.passport.conceptTag')}
            </div>
            
            <h2 className="text-3xl font-serif font-bold text-[#3E2723]">
              {t('tour.animations.passport.title')}
            </h2>
            
            <p className="text-lg text-[#5D4037]/80 leading-relaxed font-serif italic">
              {t('tour.animations.passport.intro')}
            </p>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
              <Sparkles className="text-emerald-500 mt-1 shrink-0" size={20} />
              <p className="text-sm text-emerald-800 italic">
                {t('tour.animations.passport.intro')}
              </p>
            </div>
          </motion.div>

          <footer className="flex flex-wrap gap-4">
            <button
              onClick={toggle}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all shadow-lg active:scale-95 ${
                isCV 
                  ? "bg-[#5A5A40] text-white hover:bg-[#4A4A35]" 
                  : "bg-amber-500 text-white hover:bg-amber-600"
              }`}
            >
              <span>{isCV ? t('tour.animations.passport.title') : t('tour.animations.passport.conceptTag')}</span>
              <RefreshCw size={20} className={isCV ? "" : "rotate-180"} />
            </button>

            {!isCV && onNext && (
              <button
                onClick={onNext}
                className="flex items-center gap-2 bg-[#10B981] text-white px-8 py-4 rounded-2xl font-semibold hover:bg-[#059669] transition-all shadow-lg shadow-[#10B981]/20 active:scale-95"
              >
                <span>{t('tour.controls.nextModule')}</span>
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

function CVCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col gap-6"
    >
      <div className="flex gap-4 items-center">
        <div className="w-16 h-16 bg-gray-200 rounded-lg" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-48 bg-gray-100 rounded" />
        </div>
      </div>
      
      <div className="space-y-8 mt-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-40 bg-gray-200 rounded" />
              <div className="h-2 w-16 bg-gray-100 rounded" />
            </div>
            <div className="h-2 w-full bg-gray-50 rounded" />
            <div className="h-2 w-4/5 bg-gray-50 rounded" />
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100">
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gray-100 rounded" />
          <div className="h-6 w-16 bg-gray-100 rounded" />
          <div className="h-6 w-16 bg-gray-100 rounded" />
        </div>
      </div>
    </motion.div>
  );
}

function FichaCard({ offeringsText, skillsText, needsText, purposeText }: { offeringsText: string, skillsText: string, needsText: string, purposeText: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.6, staggerChildren: 0.1 }}
      className="h-full flex flex-col gap-6"
    >
      {/* Header Bio */}
      <div className="flex gap-4 items-center">
        <motion.div 
          initial={{ rotate: -10 }}
          animate={{ rotate: 0 }}
          className="w-20 h-20 bg-[#D2B48C] rounded-[24px] border-4 border-white shadow-lg flex items-center justify-center text-white"
        >
          <User size={40} />
        </motion.div>
        <div className="space-y-1">
          <h3 className="font-serif font-bold text-xl text-[#3E2723]">Lia Arana</h3>
          <div className="flex items-center gap-1 text-[#8B4513] text-sm font-medium">
            <MapPin size={14} />
            <span>Valle de Arán</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <FichaSection 
          icon={<Heart size={18} />} 
          title={offeringsText} 
          items={["Cocina", "Escucha"]} 
          color="bg-emerald-50 text-emerald-700" 
        />
        <FichaSection 
          icon={<Brain size={18} />} 
          title={skillsText} 
          items={["Maderas", "Teatro"]} 
          color="bg-amber-50 text-amber-700" 
        />
        <FichaSection 
          icon={<Pocket size={18} />} 
          title={needsText} 
          items={["Huerto", "Transporte"]} 
          color="bg-blue-50 text-blue-700" 
        />
        <FichaSection 
          icon={<Award size={18} />} 
          title={purposeText} 
          items={["Cuidar el bosque"]} 
          color="bg-purple-50 text-purple-700" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-auto p-4 bg-[#FAF9F6] rounded-2xl border border-[#D2B48C]/30 italic text-sm text-[#5D4037]/70"
      >
        "Busco una vida lenta conectada con el ritmo de la tierra y los cuidados."
      </motion.div>
    </motion.div>
  );
}

function FichaSection({ icon, title, items, color }: { icon: any, title: string, items: string[], color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`p-3 rounded-2xl ${color} space-y-2 border border-current opacity-20`}
      style={{ borderColor: 'transparent' }}
    >
      <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider">
        {icon}
        {title}
      </div>
      <div className="flex flex-wrap gap-1">
        {items.map(item => (
          <span key={item} className="px-2 py-0.5 bg-white/50 rounded-lg text-xs font-medium">
            {item}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
