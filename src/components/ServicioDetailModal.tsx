import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, MapPin, Heart, Package, Calendar, Archive, Play, Edit, Trash2 } from 'lucide-react';
import { Servicio } from '../lib/appService';

interface ServicioDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  servicio: Servicio | null;
  nombreAutor?: string;
  isOwner: boolean;
  onSolicitar?: () => void;
  onEdit?: () => void;
  onToggleStatus?: () => void;
  onDelete?: () => void;
}

export const ServicioDetailModal: React.FC<ServicioDetailModalProps> = ({
  isOpen,
  onClose,
  servicio,
  nombreAutor,
  isOwner,
  onSolicitar,
  onEdit,
  onToggleStatus,
  onDelete
}) => {
  return (
    <AnimatePresence>
      {isOpen && servicio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-stone-900/50"
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 text-left overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges / Header Category */}
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              !servicio.isActive 
                ? 'bg-stone-100 text-stone-600 border-stone-200'
                : servicio.type === 'talento' 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {!servicio.isActive 
                ? 'Pausado' 
                : servicio.type === 'talento' 
                  ? 'Talento' 
                  : 'Recurso'}
            </span>
            <span className="text-xs text-[#8A817C] uppercase tracking-widest font-bold">
              {servicio.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-serif text-stone-800 leading-tight pr-8">
            {servicio.title}
          </h3>

          {/* Description */}
          <div className="text-sm text-[#4A4E4D] leading-relaxed whitespace-pre-wrap font-sans">
            {servicio.description}
          </div>

          {/* Metadata Card (Location, Author, Availability) */}
          {(servicio.location || servicio.availability || nombreAutor) && (
            <div className="bg-[#F9F7F1]/50 border border-[#EAE2D6]/40 rounded-2xl p-4 space-y-3">
              {nombreAutor && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EAE2D6] flex items-center justify-center text-[#6B705C] flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1">
                      Ofrecido por
                    </div>
                    <div className="text-sm font-semibold text-stone-700 leading-none">
                      {nombreAutor}
                    </div>
                  </div>
                </div>
              )}
              
              {servicio.location && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1">
                      Ubicación
                    </div>
                    <div className="text-sm text-stone-700 leading-none">
                      {servicio.location}
                    </div>
                  </div>
                </div>
              )}

              {servicio.availability && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 flex-shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1">
                      Disponibilidad / Horario
                    </div>
                    <div className="text-sm text-stone-700 leading-none">
                      {servicio.availability}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Group */}
          <div className="space-y-3 pt-2">
            {isOwner ? (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={onToggleStatus}
                    className="flex-1 bg-[#A5A58D] hover:bg-[#6B705C] text-white py-3 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {servicio.isActive ? <Archive className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {servicio.isActive ? 'Pausar' : 'Reactivar'}
                  </button>
                  
                  <button
                    onClick={onEdit}
                    className="flex-1 border border-[#A5A58D] text-[#A5A58D] hover:bg-[#F9F7F1] py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                </div>
                
                <button
                  onClick={onDelete}
                  className="w-full border border-red-200 text-red-500 hover:bg-red-50 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar servicio
                </button>
              </div>
            ) : (
              servicio.isActive ? (
                <button
                  onClick={onSolicitar}
                  className="w-full bg-[#A5A58D] hover:bg-[#6B705C] text-white py-3.5 rounded-2xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  Proponer Acuerdo / Solicitar
                </button>
              ) : (
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center text-sm text-[#8A817C] italic">
                  Este servicio está temporalmente pausado y no admite nuevas solicitudes de acuerdo.
                </div>
              )
            )}
            
            <button
              onClick={onClose}
              className="w-full py-2 text-[#8A817C] font-bold hover:bg-[#F9F7F1] rounded-xl transition-colors text-center text-sm"
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
