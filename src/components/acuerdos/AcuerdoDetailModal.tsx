import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Calendar, Handshake, History, ArrowRight, Sparkles } from 'lucide-react';
import { Acuerdo, Servicio } from '../../lib/appService';

interface AcuerdoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  acuerdo: Acuerdo | null;
  servicio: Servicio | null;
  getMemberName: (uid: string) => string;
  onProposeEnmienda: () => void;
}

export const AcuerdoDetailModal: React.FC<AcuerdoDetailModalProps> = ({
  isOpen,
  onClose,
  acuerdo,
  servicio,
  getMemberName,
  onProposeEnmienda
}) => {
  // Convierte marcas de tiempo de Firestore o fechas JS a string formateado
  const formatFecha = (f: any) => {
    if (!f) return '';
    // Si es un Timestamp de Firestore tiene toDate(), si no usamos constructor Date
    const date = f.toDate ? f.toDate() : new Date(f);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFechaPropuesta = (f: any) => {
    if (!f) return '';
    const date = f.toDate ? f.toDate() : new Date(f);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusInfo = (status: Acuerdo['status']) => {
    switch (status) {
      case 'pendiente':
        return {
          label: 'Pendiente',
          bg: 'bg-amber-55 text-amber-800 border-amber-200',
          iconBg: 'bg-amber-100 text-amber-600'
        };
      case 'contraoferta':
        return {
          label: 'Contraoferta',
          bg: 'bg-purple-55 text-purple-800 border-purple-200',
          iconBg: 'bg-purple-100 text-purple-600'
        };
      case 'en_curso':
        return {
          label: 'En Curso',
          bg: 'bg-blue-55 text-blue-800 border-blue-200',
          iconBg: 'bg-blue-100 text-blue-600'
        };
      case 'completada':
        return {
          label: 'Completado',
          bg: 'bg-green-55 text-green-800 border-green-200',
          iconBg: 'bg-green-100 text-green-600'
        };
      case 'cancelada':
        return {
          label: 'Cancelado',
          bg: 'bg-stone-100 text-stone-600 border-stone-200',
          iconBg: 'bg-stone-100 text-stone-500'
        };
      default:
        return {
          label: status,
          bg: 'bg-stone-50 text-stone-600 border-stone-200',
          iconBg: 'bg-stone-100 text-stone-500'
        };
    }
  };

  if (!acuerdo) return null;
  const statusInfo = getStatusInfo(acuerdo.status);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 text-left overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Botón Cerrar */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabecera */}
            <div className="space-y-2 shrink-0">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full border ${statusInfo.bg}`}>
                  {statusInfo.label}
                </span>
                <span className="text-xs text-[#8A817C] uppercase tracking-widest font-bold">
                  Acuerdo de Intercambio
                </span>
              </div>
              <h3 className="text-2xl font-serif text-stone-800 leading-tight pr-8">
                {servicio?.title ?? 'Servicio no disponible'}
              </h3>
            </div>

            {/* Cuerpo con Scroll */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
              {/* Tarjeta de Términos */}
              <div className="bg-[#F9F7F1]/60 border border-[#EAE2D6]/40 rounded-2xl p-5 space-y-4">
                <div>
                  <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">
                    Términos del Acuerdo
                  </h4>
                  <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap font-sans">
                    {acuerdo.terms}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#EAE2D6]/30">
                  <div>
                    <h5 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1">
                      Tipo de Intercambio
                    </h5>
                    <span className="text-xs font-bold text-stone-600 capitalize">
                      {acuerdo.exchangeType || 'No especificado'}
                    </span>
                  </div>
                  {acuerdo.fechaPropuesta && (
                    <div>
                      <h5 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1">
                        Fecha Propuesta
                      </h5>
                      <span className="text-xs font-bold text-stone-600">
                        {formatFechaPropuesta(acuerdo.fechaPropuesta)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Miembros Involucrados */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  Miembros Involucrados
                </h4>
                <div className="flex items-center justify-between bg-stone-50 border border-stone-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                        Proveedor
                      </div>
                      <div className="text-xs font-bold text-stone-700">
                        {getMemberName(acuerdo.providerId)}
                      </div>
                    </div>
                  </div>
                  
                  <ArrowRight className="w-4 h-4 text-stone-300" />

                  <div className="flex items-center gap-2.5 text-right">
                    <div>
                      <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                        Solicitante
                      </div>
                      <div className="text-xs font-bold text-stone-700">
                        {getMemberName(acuerdo.solicitanteId)}
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-600">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Historial (Timeline) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-stone-400" />
                  <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
                    Historial de Cambios
                  </h4>
                </div>

                {acuerdo.historial && acuerdo.historial.length > 0 ? (
                  <div className="relative border-l border-stone-200 pl-5 ml-2.5 space-y-5">
                    {acuerdo.historial.map((entry, idx) => {
                      return (
                        <div key={idx} className="relative">
                          {/* Punto de la línea temporal */}
                          <div className={`absolute -left-[26px] top-1 w-3 h-3 rounded-full ring-4 ring-white ${
                            entry.tipo === 'propuesta' ? 'bg-amber-500' :
                            entry.tipo === 'contraoferta' ? 'bg-purple-500' :
                            entry.tipo === 'aceptacion' ? 'bg-green-500' : 'bg-stone-500'
                          }`} />
                          
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-xs font-bold text-stone-700 capitalize">
                              {entry.tipo === 'propuesta' ? 'Propuesta Inicial' :
                               entry.tipo === 'contraoferta' ? 'Contraoferta' :
                               entry.tipo === 'aceptacion' ? 'Aceptado' : 'Cancelado'}
                            </span>
                            <span className="text-[9px] text-stone-400">
                              {formatFecha(entry.fecha)}
                            </span>
                          </div>
                          
                          <div className="text-[10px] text-stone-500 mt-0.5">
                            Por {getMemberName(entry.autorId)}
                          </div>

                          {entry.terminos && (
                            <div className="mt-2 bg-stone-50/50 p-3 rounded-xl border border-stone-100/80 text-xs text-stone-600">
                              <p className="whitespace-pre-wrap">{entry.terminos.terms}</p>
                              <div className="flex gap-3 mt-1.5 pt-1.5 border-t border-stone-100 text-[10px] text-stone-400">
                                <span>Tipo: <strong className="font-semibold text-stone-500 capitalize">{entry.terminos.exchangeType}</strong></span>
                                {entry.terminos.fechaPropuesta && (
                                  <span>Fecha: <strong className="font-semibold text-stone-500">{formatFechaPropuesta(entry.terminos.fechaPropuesta)}</strong></span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-stone-400 italic bg-stone-50 border border-stone-100 rounded-xl p-3 text-center">
                    No hay historial registrado para este acuerdo.
                  </div>
                )}
              </div>
            </div>

            {/* Acciones del Modal */}
            <div className="space-y-3 pt-4 border-t border-stone-100 shrink-0">
              {acuerdo.status !== 'cancelada' && (
                <button
                  onClick={onProposeEnmienda}
                  className="w-full bg-[#A5A58D] hover:bg-[#6B705C] text-white py-3.5 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-[#F9F7F1]" />
                  Proponer Enmienda
                </button>
              )}
              
              <button
                onClick={onClose}
                className="w-full py-2.5 text-[#8A817C] font-bold hover:bg-[#F9F7F1] rounded-xl transition-colors text-center text-sm"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
