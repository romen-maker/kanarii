import React from 'react';
import { CommunityMember } from '../hooks/useCommunityMembers';
import { PropuestaRespuesta } from '../lib/appService';
import { Check, AlertCircle, HelpCircle, MessageSquare } from 'lucide-react';

interface ConsentGridProps {
  members: CommunityMember[];
  respuestas: PropuestaRespuesta[];
  currentUserId: string;
}

export const ConsentGrid: React.FC<ConsentGridProps> = ({
  members,
  respuestas,
  currentUserId
}) => {
  const getResponseIcon = (type: PropuestaRespuesta['type']) => {
    switch (type) {
      case 'consentimiento': return { Icon: Check, color: 'bg-emerald-500' };
      case 'objecion': return { Icon: AlertCircle, color: 'bg-rose-500' };
      case 'duda': return { Icon: HelpCircle, color: 'bg-amber-500' };
      case 'preocupacion': return { Icon: MessageSquare, color: 'bg-sky-500' };
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] px-2">Pulso de la Comunidad</h4>
      
      <div className="flex flex-wrap gap-4 p-6 bg-white rounded-[2.5rem] border border-[#EAE2D6] shadow-sm">
        {members.map(member => {
          const respuesta = respuestas.find(r => r.memberId === member.userId);
          const iconConfig = respuesta ? getResponseIcon(respuesta.type) : null;
          const isMe = member.userId === currentUserId;

          return (
            <div 
              key={member.userId} 
              className="relative group"
              title={member.nombre}
            >
              <div className={`
                w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all
                ${isMe ? 'ring-2 ring-[#4A4E4D] ring-offset-2' : ''}
                ${respuesta ? 'bg-stone-50 text-stone-800' : 'bg-stone-100 text-stone-300'}
              `}>
                {member.nombre.charAt(0)}
              </div>

              {/* Position Indicator Badge */}
              <div className={`
                absolute -top-1 -right-1 w-5 h-5 rounded-lg border-2 border-white flex items-center justify-center transition-all shadow-sm
                ${iconConfig ? iconConfig.color : 'bg-stone-300'}
              `}>
                {iconConfig ? (
                  <iconConfig.Icon className="w-3 h-3 text-white" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                )}
              </div>

              {/* Tooltip simple */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <span className="bg-[#4A4E4D] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md whitespace-nowrap">
                  {member.nombre}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
