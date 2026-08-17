import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRightLeft, 
  ArrowRight, 
  RotateCcw,
  Clock,
  Sprout,
  Euro,
  Handshake,
  Sparkles,
  Shield,
  Share2,
  Puzzle,
  Lightbulb,
  Link
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CruceAnimation({ onNext, onBack, progressTracker }: { onNext?: () => void, onBack?: () => void, progressTracker?: React.ReactNode }) {
  const { t } = useTranslation('welcome');
  const [stage, setStage] = useState(0); 

  const CRUCE_STEPS = [
    {
      id: 0,
      title: t('tour.animations.crossing.title'),
      body: t('tour.animations.crossing.intro'),
      label: t('tour.modules.a2.title')
    },
    {
      id: 1,
      title: t('tour.modules.a2.title'),
      body: t('tour.animations.crossing.connectProfiles'),
      label: t('tour.animations.crossing.offering')
    },
    {
      id: 2,
      title: t('tour.animations.crossing.title'),
      body: t('tour.animations.crossing.intro'),
      label: t('tour.animations.crossing.need')
    },
    {
      id: 3,
      title: t('tour.animations.crossing.marketLogic'),
      body: t('tour.animations.crossing.intro'),
      label: t('tour.animations.crossing.realTime')
    }
  ];

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
              {t('tour.controls.backIndex')}
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
          
          <CruceVisualization stage={stage} marketLogicText={t('tour.animations.crossing.marketLogic')} realTimeText={t('tour.animations.crossing.realTime')} reciprocityText={t('tour.animations.crossing.reciprocity')} careText={t('tour.animations.crossing.care')} offeringText={t('tour.animations.crossing.offering')} needText={t('tour.animations.crossing.need')} />
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
                <span>{t('tour.controls.nextStep')}</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={reset}
                  className="flex items-center gap-2 bg-[#D2B48C] text-white px-6 py-4 rounded-2xl font-semibold hover:bg-[#C1A37B] transition-all shadow-md active:scale-95"
                >
                  <span>{t('tour.controls.restart')}</span>
                  <RotateCcw size={18} />
                </button>
                {onNext && (
                  <button
                    onClick={onNext}
                    className="flex items-center gap-2 bg-[#10B981] text-white px-8 py-4 rounded-2xl font-semibold hover:bg-[#059669] transition-all shadow-lg shadow-[#10B981]/20 active:scale-95"
                  >
                    <span>{t('tour.controls.nextModule')}</span>
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

function CruceVisualization({ stage, marketLogicText, realTimeText, reciprocityText, careText, offeringText, needText }: { stage: number, marketLogicText: string, realTimeText: string, reciprocityText: string, careText: string, offeringText: string, needText: string }) {
  const arquetypes = [
    { id: 1, label: "Creador", color: "bg-amber-100 border-amber-300 text-amber-700", icon: <Sparkles size={20} /> },
    { id: 2, label: "Guardián", color: "bg-emerald-100 border-emerald-300 text-emerald-700", icon: <Shield size={20} /> },
    { id: 3, label: "Tejedor", color: "bg-blue-100 border-blue-300 text-blue-700", icon: <Share2 size={20} /> },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Stage 0: Offerings & Needs */}
      {stage === 0 && (
        <div className="relative w-full h-full flex items-center justify-center gap-12">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-24 h-24 bg-amber-50 border-2 border-amber-300 rounded-3xl shadow-lg flex items-center justify-center text-amber-700">
              <Puzzle size={40} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">{needText}</span>
          </motion.div>

          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-24 h-24 bg-emerald-50 border-2 border-emerald-300 rounded-3xl shadow-lg flex items-center justify-center text-emerald-700">
              <Lightbulb size={40} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">{offeringText}</span>
          </motion.div>
        </div>
      )}

      {/* Stage 1: The Crossing Match */}
      {stage === 1 && (
        <div className="relative w-full h-full flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="absolute w-64 h-64 border-2 border-dashed border-[#D2B48C]/40 rounded-full"
          />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="z-10 bg-emerald-500 text-white p-6 rounded-full shadow-2xl flex items-center justify-center"
          >
            <Link size={48} />
          </motion.div>
        </div>
      )}

      {/* Stage 2: S3 Archetypes */}
      {stage === 2 && (
        <div className="relative w-full h-full flex items-center justify-center gap-6">
          {arquetypes.map((arq, i) => (
            <motion.div
              key={arq.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className={`p-4 rounded-2xl border-2 ${arq.color} flex flex-col items-center gap-2 shadow-md`}
            >
              {arq.icon}
              <span className="text-[10px] font-bold uppercase">{arq.label}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stage 3: New Economy Transformation */}
      {stage === 3 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 0.5, y: -40 }}
            className="absolute text-red-400 flex flex-col items-center gap-1 opacity-20"
          >
            <Euro size={40} />
            <span className="text-[10px] font-bold line-through">{marketLogicText}</span>
          </motion.div>

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
              <span className="text-[10px] font-bold tracking-widest uppercase">{realTimeText}</span>
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
              <span className="text-[10px] font-bold tracking-widest uppercase">{reciprocityText}</span>
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
              <span className="text-[10px] font-bold tracking-widest uppercase">{careText}</span>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
