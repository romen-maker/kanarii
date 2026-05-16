import React, { useState } from 'react';
import { Servicio } from '../lib/appService';
import { Heart, Package, X } from 'lucide-react';

interface CreateServicioModalProps {
  servicioToEdit?: Servicio | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export function CreateServicioModal({ servicioToEdit, isSubmitting, onClose, onSubmit }: CreateServicioModalProps) {
  const [formData, setFormData] = useState({
    tipo: servicioToEdit?.type || 'talento',
    titulo: servicioToEdit?.title || '',
    descripcion: servicioToEdit?.description || '',
    categoria: servicioToEdit?.category || 'artesanía',
    ubicacion: servicioToEdit?.location || '',
    disponibilidad: servicioToEdit?.availability || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.tipo) return;
    
    onSubmit({
      ...formData,
      titulo: formData.titulo.trim(),
      descripcion: formData.descripcion.trim(),
      ubicacion: formData.ubicacion.trim(),
      disponibilidad: formData.disponibilidad.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="p-6 border-b border-[#EAE2D6] flex justify-between items-center bg-[#FDFBF7]">
          <h2 className="text-xl font-serif text-[#4A4E4D]">Compartir Talento o Recurso</h2>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex p-1 bg-[#FDFBF7] rounded-xl border border-[#EAE2D6]">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tipo: 'talento' })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                formData.tipo === 'talento' 
                  ? 'bg-[#CB997E] text-white shadow-sm' 
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <Heart className="w-4 h-4" />
              Talento
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tipo: 'recurso' })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                formData.tipo === 'recurso' 
                  ? 'bg-[#A5A58D] text-white shadow-sm' 
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <Package className="w-4 h-4" />
              Recurso
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">¿Qué quieres ofrecer? *</label>
            <input
              required
              type="text"
              value={formData.titulo}
              onChange={e => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] transition-colors"
              placeholder={formData.tipo === 'talento' ? "Ej. Clases de yoga, Taller de barro" : "Ej. Motosierra, Furgoneta para mudanzas"}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Categoría</label>
            <select
              value={formData.categoria}
              onChange={e => setFormData({ ...formData, categoria: e.target.value as Servicio['categoria'] })}
              className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] transition-colors bg-white"
              disabled={isSubmitting}
            >
              <option value="artesanía">Artesanía / Manualidades</option>
              <option value="agricultura">Agricultura / Huerto</option>
              <option value="herramientas">Herramientas / Maquinaria</option>
              <option value="transporte">Transporte / Logística</option>
              <option value="cuidados">Cuidados / Bienestar</option>
              <option value="tecnología">Tecnología / Digital</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Descripción y detalles</label>
            <textarea
              rows={3}
              value={formData.descripcion}
              onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] transition-colors resize-none"
              placeholder="Cuéntanos más sobre lo que ofreces..."
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Ubicación</label>
              <input
                type="text"
                value={formData.ubicacion}
                onChange={e => setFormData({ ...formData, ubicacion: e.target.value })}
                className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] transition-colors text-sm"
                placeholder="Ej. Barrio Norte"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Disponibilidad</label>
              <input
                type="text"
                value={formData.disponibilidad}
                onChange={e => setFormData({ ...formData, disponibilidad: e.target.value })}
                className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] transition-colors text-sm"
                placeholder="Ej. Fines de semana"
                disabled={isSubmitting}
              />
            </div>
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
              disabled={isSubmitting || !formData.titulo.trim()}
              className={`${
                formData.tipo === 'talento' ? 'bg-[#CB997E] hover:bg-[#B58368]' : 'bg-[#A5A58D] hover:bg-[#6B705C]'
              } text-white px-6 py-2 rounded-xl font-medium transition-all shadow-sm disabled:opacity-50`}
            >
              {isSubmitting ? 'Guardando...' : 'Catalogar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
