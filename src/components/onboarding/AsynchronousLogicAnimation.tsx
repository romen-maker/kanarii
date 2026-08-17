import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  MessageSquare, 
  RotateCcw,
  Sparkles,
  Zap,
  ArrowRight,
  Users, 
  HelpCircle, 
  CheckCircle2, 
  Hourglass,
  BarChart3
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AsynchronousLogicAnimation({ onNext, onBack, progressTracker }: { onNext?: () => void, onBack?: () => void, progressTracker?: React.ReactNode }) {
  const { t } = useTranslation('welcome');
  const [currentStep, setCurrentStep] = useState(0);

  const STEPS = [
    {
      id: 1,
      title: t('tour.animations.asynchronous.openProposal'),
      body: t('tour.animations.asynchronous.openDesc'),
      label: t('tour.animations.asynchronous.openProposal')
    },
    {
      id: 2,
      title: t('tour.animations.asynchronous.minThreshold'),
      body: t('tour.animations.asynchronous.minThresholdDesc'),
      label: t('tour.animations.asynchronous.minThreshold')
    },
    {
      id: 3,
      title: t('tour.animations.asynchronous.chatClarify'),
      body: t('tour.animations.asynchronous.chatClarify'),
      label: t('tour.animations.governance.step3Title')
    },
    {
      id: 4,
      title: t('tour.animations.asynchronous.agreed'),
      body: t('tour.animations.governance.step6Body'),
      label: t('tour.animations.asynchronous.agreed')
    }
  ];

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const restart = () => {
    setCurrentStep(0);
  };

  const step = STEPS[currentStep];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#5D4037] font-sans p-6 md:p-12 flex flex-col items-center justify-center">
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
            <div className="w-10 h-10 bg-[#5A5A40] rounded-xl flex items-center justify-center text-white">
              <BarChart3 size={24} />
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-[#3E2723]">Kanarii</h1>
          </div>
        </div>
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-[#5A5A40]' : 'w-2 bg-[#D2B48C]/30'}`}
            />
          ))}
        </div>
      </motion.header>

      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-16 items-center">
        
        {/* Visual Animation Canvas */}
        <div className="relative aspect-square bg-white rounded-[48px] border border-[#D2B48C]/20 shadow-xl overflow-hidden flex items-center justify-center p-8">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#8B4513_1px,transparent_1px)] [background-size:24px_24px]" />
          
          <AsyncVisualization step={currentStep} openProposalText={t('tour.animations.asynchronous.openProposal')} minThresholdText={t('tour.animations.asynchronous.minThreshold')} agreedText={t('tour.animations.asynchronous.agreed')} />
        </div>

        {/* Text Content Area */}
        <div className="flex flex-col justify-center space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="inline-block px-3 py-1 bg-[#D2B48C]/20 rounded-full text-xs font-semibold uppercase tracking-wider text-[#8B4513]">
                {step.label}
              </div>
              <h2 className="text-4xl font-serif font-bold text-[#3E2723] leading-tight">
                {step.title}
              </h2>
              <p className="text-xl text-[#5D4037]/80 leading-relaxed font-serif italic">
                {step.body}
              </p>
            </motion.div>
          </AnimatePresence>

          <footer className="flex flex-wrap gap-4 pt-4">
            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={nextStep}
                className="group flex items-center gap-2 bg-[#5A5A40] text-[#FAF9F6] px-8 py-4 rounded-2xl font-semibold hover:bg-[#4A4A35] transition-all shadow-lg shadow-[#5A5A40]/20 active:scale-95"
              >
                <span>{t('tour.controls.nextStep')}</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
            ) : (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={restart}
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

function AsyncVisualization({ step, openProposalText, minThresholdText, agreedText }: { step: number, openProposalText: string, minThresholdText: string, agreedText: string }) {
  // Avatars positioning
  const avatars = [
    { id: 1, x: -80, y: -40, label: "Ana" },
    { id: 2, x: 0, y: -60, label: "Carlos" },
    { id: 3, x: 80, y: -40, label: "Elena" },
    { id: 4, x: -40, y: 50, label: "David" },
    { id: 5, x: 40, y: 50, label: "Sofía" },
  ];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      
      {/* Step 1: Hourglass and Notification */}
      <AnimatePresence>
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              animate={{ rotate: [0, 180, 180, 360, 360] }}
              transition={{ repeat: Infinity, duration: 4, times: [0, 0.4, 0.5, 0.9, 1] }}
              className="text-[#8B4513]"
            >
              <Hourglass size={80} strokeWidth={1.5} />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white px-4 py-2 border border-[#D2B48C]/30 rounded-xl shadow-lg flex items-center gap-2"
            >
              <Clock size={16} className="text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#5D4037]">{openProposalText}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Common Elements for Steps 2-4: Avatars and Progress Bar */}
      {step >= 1 && (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          
          {/* Progress Bar (Quorum) */}
          <div className="absolute top-10 w-64 h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200 shadow-inner">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ 
                width: step === 1 ? "60%" : step === 2 ? "40%" : "100%",
                backgroundColor: step === 3 ? "#10B981" : step === 2 ? "#3B82F6" : "#10B981"
              }}
              className="h-full relative"
            >
              {step === 3 && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="absolute inset-0 bg-white/20 animate-pulse" 
                />
              )}
            </motion.div>
            {/* Quorum Marker */}
            <div className={`absolute left-1/2 top-0 h-full w-0.5 z-10 ${step === 3 ? "bg-white/50" : "bg-amber-500/50"}`} />
          </div>
          <div className="absolute top-16 text-[10px] uppercase font-black tracking-tighter text-amber-600/50">{minThresholdText}</div>

          {/* Avatars */}
          <div className="relative w-full h-full">
            {avatars.map((av) => (
              <motion.div
                key={av.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ x: av.x, y: av.y }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#D2B48C] rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden"
              >
                <Users size={24} className="text-white" />
                
                {/* Checkmarks / Status Icons */}
                <AnimatePresence>
                  {/* Step 2 Checks */}
                  {step === 1 && (av.id === 1 || av.id === 2 || av.id === 3) && (
                    <StatusIcon color="bg-emerald-500" icon={<CheckCircle2 size={16} />} />
                  )}

                  {/* Step 3: Doubt scenario */}
                  {step === 2 && (
                    <>
                      {(av.id === 1 || av.id === 2) && (
                        <StatusIcon color="bg-emerald-500" icon={<CheckCircle2 size={16} />} />
                      )}
                      {av.id === 3 && (
                        <motion.div
                          key="doubt"
                          initial={{ scale: 0, y: 10 }}
                          animate={{ scale: 1, y: -40 }}
                          exit={{ scale: 0 }}
                          className="absolute bg-blue-500 text-white rounded-full p-1.5 shadow-lg z-50 border-2 border-white"
                        >
                          <HelpCircle size={20} />
                        </motion.div>
                      )}
                    </>
                  )}

                  {/* Step 4: Silence is consent (All assent) */}
                  {step === 3 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ 
                        scale: 1,
                        y: (av.id === 4 || av.id === 5) ? [0, 2, 0] : 0
                      }}
                      transition={{ 
                        y: { repeat: (av.id === 4 || av.id === 5) ? Infinity : 0, duration: 1.5 } 
                      }}
                    >
                      <StatusIcon color="bg-emerald-500" icon={<CheckCircle2 size={16} />} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Central Proposal Document (Acordada visual) */}
          <AnimatePresence>
            {step === 3 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                className="absolute z-50 w-32 h-40 bg-emerald-50 border-4 border-emerald-500 rounded-2xl shadow-2xl flex flex-col items-center justify-center gap-2"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Sparkles size={48} className="text-emerald-500" />
                </motion.div>
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">{agreedText}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 3: Chat connection */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-10 bg-white border border-blue-100 p-3 rounded-2xl shadow-xl flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <MessageSquare size={16} />
              </div>
              <div className="space-y-1">
                <div className="h-1.5 w-24 bg-blue-50 rounded-full" />
                <div className="h-1.5 w-16 bg-blue-50 rounded-full" />
              </div>
            </motion.div>
          )}

        </div>
      )}

    </div>
  );
}

function StatusIcon({ color, icon }: { color: string, icon: any }) {
  return (
    <motion.div
      initial={{ scale: 0, y: 10 }}
      animate={{ scale: 1, y: -40 }}
      exit={{ scale: 0 }}
      className={`absolute ${color} text-white rounded-full p-1 shadow-lg z-50 border-2 border-white`}
    >
      {icon}
    </motion.div>
  );
}
