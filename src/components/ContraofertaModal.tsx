import React, { useState } from 'react';
import { Acuerdo } from '../lib/appService';
import { Handshake, X, Calendar } from 'lucide-react';

interface ContraofertaModalProps {
  acuerdo: Acuerdo;
  currentUserId: string;
  onClose: () => void;
  onSubmit: (data: { terms: string; exchangeType: Acuerdo['exchangeType']; fechaPropuesta: Date | null }) => Promise<void>;
  isSubmitting?: boolean;
}

export function ContraofertaModal({ acuerdo, currentUserId, onClose, onSubmit, isSubmitting }: ContraofertaModalProps) {
  const getInitialDateStr = () => {
    if (!acuerdo.fechaPropuesta) return '';
    let d: Date;
    if (acuerdo.fechaPropuesta instanceof Date) {
      d = acuerdo.fechaPropuesta;
    } else if (typeof (acuerdo.fechaPropuesta as any).toDate === 'function') {
      d = (acuerdo.fechaPropuesta as any).toDate();
    } else {
      d = new Date(acuerdo.fechaPropuesta);
    }
    
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    terms: acuerdo.terms || '',
    exchangeType: (acuerdo.exchangeType || 'tiempo') as Acuerdo['exchangeType'],
    fechaPropuesta: getInitialDateStr()
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.terms.trim()) return;
    
    await onSubmit({
      terms: formData.terms.trim(),
      exchangeType: formData.exchangeType,
      fechaPropuesta: formData.fechaPropuesta ? new Date(formData.fechaPropuesta) : null
    });
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="p-6 border-b border-[#EAE2D6] flex justify-between items-center bg-[#FDFBF7]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-full text-purple-600">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif text-[#4A4E4D]">Enviar Contraoferta</h2>
              <p className="text-xs text-stone-500">Propón nuevos términos para el acuerdo</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors"
            disabled={isSubmitting}
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
            <label className="block text-sm font-medium text-stone-700 mb-1">Términos de tu contraoferta *</label>
            <textarea
              required
              rows={4}
              value={formData.terms}
              onChange={e => setFormData({ ...formData, terms: e.target.value })}
              className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] transition-colors resize-none text-sm"
              placeholder="Describe detalladamente los nuevos términos del intercambio..."
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-stone-400" />
              Nueva fecha propuesta (opcional)
            </label>
            <input
              type="date"
              value={formData.fechaPropuesta}
              onChange={e => setFormData({ ...formData, fechaPropuesta: e.target.value })}
              className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] transition-colors text-sm"
              disabled={isSubmitting}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-500 hover:bg-[#FDFBF7] rounded-xl font-medium transition-colors text-sm"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.terms.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-all shadow-sm disabled:opacity-50 text-sm"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Contraoferta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
