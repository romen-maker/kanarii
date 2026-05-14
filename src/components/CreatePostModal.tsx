import React, { useState } from 'react';
import { Post } from '../lib/appService';

interface CreatePostModalProps {
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export function CreatePostModal({ isSubmitting, onClose, onSubmit }: CreatePostModalProps) {
  const [formData, setFormData] = useState({
    tipo: 'necesidad' as Post['tipo'],
    titulo: '',
    descripcion: '',
    categoria: 'habilidad' as Post['categoria'],
    estado: 'activo' as Post['estado']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.tipo) return;
    
    onSubmit({
      ...formData,
      titulo: formData.titulo.trim(),
      descripcion: formData.descripcion.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="p-6 border-b border-[#EAE2D6] flex justify-between items-center bg-[#FDFBF7]">
          <h2 className="text-xl font-serif text-[#4A4E4D]">Nueva Publicación</h2>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex p-1 bg-[#FDFBF7] rounded-xl border border-[#EAE2D6]">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tipo: 'necesidad' })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                formData.tipo === 'necesidad' 
                  ? 'bg-[#CB997E] text-white shadow-sm' 
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Necesidad
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, tipo: 'oferta' })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                formData.tipo === 'oferta' 
                  ? 'bg-[#A5A58D] text-white shadow-sm' 
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Oferta
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Título *</label>
            <input
              required
              type="text"
              value={formData.titulo}
              onChange={e => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] transition-colors"
              placeholder={formData.tipo === 'necesidad' ? "Ej. Necesito transporte a la ciudad" : "Ej. Ofrezco herramientas de carpintería"}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Categoría</label>
            <select
              value={formData.categoria}
              onChange={e => setFormData({ ...formData, categoria: e.target.value as Post['categoria'] })}
              className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] transition-colors bg-white"
              disabled={isSubmitting}
            >
              <option value="habilidad">Habilidad / Conocimiento</option>
              <option value="recurso">Recurso / Objeto</option>
              <option value="espacio">Espacio</option>
              <option value="apoyo_emocional">Apoyo Emocional</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Descripción</label>
            <textarea
              rows={4}
              value={formData.descripcion}
              onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] transition-colors resize-none"
              placeholder="Explica los detalles..."
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
              disabled={isSubmitting || !formData.titulo.trim()}
              className={`${
                formData.tipo === 'necesidad' ? 'bg-[#CB997E] hover:bg-[#B58368]' : 'bg-[#A5A58D] hover:bg-[#6B705C]'
              } text-white px-6 py-2 rounded-xl font-medium transition-all shadow-sm disabled:opacity-50`}
            >
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
