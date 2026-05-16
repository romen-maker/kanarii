import React from 'react';
import { CheckCircle2, Circle, Clock, Gavel, AlertCircle, RefreshCw } from 'lucide-react';
import { Propuesta } from '../lib/appService';

interface S3TimelineProps {
  propuesta: Propuesta;
}

type S3Step = {
  id: Propuesta['status'];
  label: string;
  description: string;
  icon: any;
};

const S3_STEPS: S3Step[] = [
  { id: 'abierta', label: 'Deliberación', description: 'Ronda de preguntas y consentimiento', icon: Gavel },
  { id: 'en_objeciones', label: 'Objeciones', description: 'Evaluación de argumentos de daño', icon: AlertCircle },
  { id: 'integrando', label: 'Integración', description: 'Búsqueda de solución creativa', icon: RefreshCw },
  { id: 'acordada', label: 'Acuerdo', description: 'Celebración y compromiso', icon: CheckCircle2 }
];

export const S3Timeline: React.FC<S3TimelineProps> = ({ propuesta }) => {
  const currentStepIndex = S3_STEPS.findIndex(s => s.id === propuesta.status);
  const isDiscarded = propuesta.status === 'descartada';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em]">Recorrido Socrático</h4>
        {propuesta.version > 1 && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-full border border-teal-100 uppercase tracking-widest">
            <RefreshCw className="w-3 h-3" /> v{propuesta.version} integrada
          </div>
        )}
      </div>

      <div className="relative">
        {/* Line Connector */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-stone-100 -z-10" />

        <div className="space-y-6">
          {S3_STEPS.map((step, idx) => {
            const isCompleted = currentStepIndex > idx || propuesta.status === 'acordada';
            const isCurrent = propuesta.status === step.id;
            const isFuture = !isCompleted && !isCurrent;

            return (
              <div 
                key={step.id} 
                className={`flex gap-6 transition-all duration-500 ${isFuture ? 'opacity-40 grayscale' : ''}`}
              >
                <div className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all
                  ${isCompleted ? 'bg-teal-50 border-teal-200 text-teal-600' : 
                    isCurrent ? 'bg-white border-[#4A4E4D] text-[#4A4E4D] shadow-lg scale-110' : 
                    'bg-stone-50 border-stone-100 text-stone-300'}
                `}>
                  {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
                </div>

                <div className="pt-1.5 pb-2">
                  <p className={`text-sm font-black uppercase tracking-widest ${isCurrent ? 'text-stone-800' : 'text-stone-400'}`}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed max-w-xs animate-in slide-in-from-left-2">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {isDiscarded && (
            <div className="flex gap-6 items-center bg-stone-100 p-4 rounded-3xl border border-stone-200 ml-2">
              <div className="w-8 h-8 rounded-full bg-stone-300 flex items-center justify-center text-white font-black">!</div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Propuesta Descartada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
