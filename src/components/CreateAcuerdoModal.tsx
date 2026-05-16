import React, { useState } from 'react';
import { Servicio, Acuerdo } from '../lib/appService';
import { Handshake, X, Calendar } from 'lucide-react';

interface CreateAcuerdoModalProps {
  servicio: Servicio;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export function CreateAcuerdoModal({ servicio, isSubmitting, onClose, onSubmit }: CreateAcuerdoModalProps) {
  const [formData, setFormData] = useState({
    terms: '',
    exchangeType: 'tiempo' as Acuerdo['exchangeType'],
    fechaPropuesta: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.terms.trim()) return;
    
    onSubmit({
      ...formData,
      terms: formData.terms.trim(),
      fechaPropuesta: formData.fechaPropuesta ? new Date(formData.fechaPropuesta) : undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="p-6 border-b border-[#EAE2D6] flex justify-between items-center bg-[#FDFBF7]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#EAE2D6] rounded-full">
              <Handshake className="w-5 h-5 text-[#4A4E4D]" />
            </div>
            <div>
              <h2 className="text-lg font-serif text-[#4A4E4D]">Propuesta de Acuerdo</h2>
              <p className="text-xs text-stone-500">Para: {servicio.titulo}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Tipo de Intercambio</label>
            <select
              value={formData.exchangeType}
              onChange={e => setFormData({ ...formData, exchangeType: e.target.value as Acuerdo['exchangeType'] })}
              className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] transition-colors bg-white text-sm"
              disabled={isSubmitting}
            >
              <option value="tiempo">Intercambio de Tiempo (Horas)</option>
              <option value="especie">Intercambio por Especie</option>
              <option value="economico">Aportación Económica</option>
              <option value="regalo">Regalo / Donación</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Términos de la propuesta *</label>
            <textarea
              required
              rows={4}
              value={formData.terms}
              onChange={e => setFormData({ ...formData, terms: e.target.value })}
              className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] transition-colors resize-none"
              placeholder="Ej. Te propongo cambiar 2h de clases de yoga por 1 caja de verduras de mi huerto..."
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-stone-400" />
              Fecha propuesta (opcional)
            </label>
            <input
              type="date"
              value={formData.fechaPropuesta}
              onChange={e => setFormData({ ...formData, fechaPropuesta: e.target.value })}
              className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] transition-colors"
              disabled={isSubmitting}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-500 hover:bg-[#FDFBF7] rounded-xl font-medium transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.terms.trim()}
              className="bg-[#6B705C] hover:bg-[#4A4E4D] text-white px-6 py-2 rounded-xl font-medium transition-all shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Propuesta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
