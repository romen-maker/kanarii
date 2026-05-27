import React, { useState } from 'react';
import { PropuestaHilo, CommunityMember, createHiloMessage } from '../../lib/appService';
import { Send, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ClarificationThreadProps {
  propuestaId: string;
  relatedResponseId: string; // memberId de la duda
  propuestaAuthorId: string;
  hilos: PropuestaHilo[];
  currentUserId: string;
  members: CommunityMember[];
}

export function ClarificationThread({
  propuestaId,
  relatedResponseId,
  propuestaAuthorId,
  hilos,
  currentUserId,
  members
}: ClarificationThreadProps) {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const canWrite = currentUserId === propuestaAuthorId || currentUserId === relatedResponseId;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await createHiloMessage(propuestaId, {
        relatedResponseId,
        authorId: currentUserId,
        content: newMessage.trim(),
        relatedMemberId: relatedResponseId,
        hiloType: 'duda',
        createdAt: null
      });
      setNewMessage('');
    } catch (err) {
      console.error('Error al enviar aclaración:', err);
    } finally {
      setSending(false);
    }
  };

  const getMemberName = (uid: string) => {
    const m = members.find(member => member.userId === uid);
    return m?.nombre || 'Miembro';
  };

  const getMemberPhoto = (uid: string) => {
    const m = members.find(member => member.userId === uid);
    return m?.photoURL;
  };

  return (
    <div className="mt-3 bg-stone-100/50 border border-stone-200/60 rounded-2xl p-4 ml-6 space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-stone-200/50 pb-2">
        <h5 className="text-[10px] font-black text-stone-500 uppercase tracking-widest">
          Hilo de Aclaración
        </h5>
        <span className="text-[9px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
          Duda
        </span>
      </div>

      {/* Lista de mensajes */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
        {hilos.length === 0 ? (
          <p className="text-xs text-stone-400 italic py-2 text-center">
            No hay aclaraciones en este hilo todavía.
          </p>
        ) : (
          hilos.map((h, idx) => {
            const isMe = h.authorId === currentUserId;
            const photo = getMemberPhoto(h.authorId);
            const dateStr = h.createdAt
              ? format(h.createdAt.toDate ? h.createdAt.toDate() : new Date(h.createdAt), "d MMM, HH:mm", { locale: es })
              : 'Enviando...';

            return (
              <div
                key={h.id || idx}
                className={`flex gap-2.5 items-start ${isMe ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className="shrink-0">
                  {photo ? (
                    <img
                      src={photo}
                      alt={getMemberName(h.authorId)}
                      className="w-6 h-6 rounded-full object-cover border border-stone-200"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-stone-300 flex items-center justify-center text-stone-600">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Globo de mensaje */}
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 shadow-sm ${
                  isMe 
                    ? 'bg-[#4A4E4D] text-white rounded-tr-none' 
                    : 'bg-white text-stone-700 border border-stone-200/60 rounded-tl-none'
                }`}>
                  <div className={`flex items-center gap-2 mb-1 ${isMe ? 'justify-end' : ''}`}>
                    <span className={`text-[9px] font-black uppercase tracking-wider ${
                      isMe ? 'text-[#D4C3A3]' : 'text-stone-500'
                    }`}>
                      {getMemberName(h.authorId)}
                    </span>
                    <span className="text-[8px] text-stone-400 uppercase">
                      {dateStr}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{h.content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Formulario de envío */}
      {canWrite ? (
        <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-stone-200/40">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
            placeholder="Aclara o pregunta sobre esta duda..."
            className="flex-1 px-4 py-2 text-xs bg-white border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-[#4A4E4D]/10 focus:border-[#4A4E4D] transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-[#4A4E4D] text-white rounded-xl hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        <div className="pt-2 border-t border-stone-200/40 text-center">
          <p className="text-[9px] text-stone-400 italic">
            Solo el autor de la propuesta y quien planteó la duda pueden responder en este hilo.
          </p>
        </div>
      )}
    </div>
  );
}
