import React, { useState, useEffect } from 'react';
import { Evento } from '../lib/appService';

interface CreateEventoModalProps {
  eventoToEdit?: Evento | null;
  members: any[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialDates?: { start: Date; end: Date };
}

export function CreateEventoModal({ 
  eventoToEdit, 
  members, 
  isSubmitting, 
  onClose, 
  onSubmit,
  initialDates
}: CreateEventoModalProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'reunion' as Evento['tipo'],
    inicio: '',
    fin: '',
    todoElDia: false,
    responsable_uid: '',
    participantes: [] as string[]
  });

  useEffect(() => {
    if (eventoToEdit) {
      const start = eventoToEdit.inicio instanceof Date ? eventoToEdit.inicio : new Date(eventoToEdit.inicio);
      const end = eventoToEdit.fin instanceof Date ? eventoToEdit.fin : new Date(eventoToEdit.fin);
      
      setFormData({
        titulo: eventoToEdit.titulo,
        descripcion: eventoToEdit.descripcion || '',
        tipo: eventoToEdit.tipo,
        inicio: toDatetimeLocal(start),
        fin: toDatetimeLocal(end),
        todoElDia: eventoToEdit.todoElDia || false,
        responsable_uid: eventoToEdit.responsable_uid || '',
        participantes: eventoToEdit.participantes || []
      });
    } else if (initialDates) {
      setFormData(prev => ({
        ...prev,
        inicio: toDatetimeLocal(initialDates.start),
        fin: toDatetimeLocal(initialDates.end)
      }));
    }
  }, [eventoToEdit, initialDates]);

  function toDatetimeLocal(date: Date) {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.inicio || !formData.fin) return;
    
    const data = {
      ...formData,
      inicio: new Date(formData.inicio),
      fin: new Date(formData.fin),
      descripcion: formData.descripcion.trim() || undefined
    };
    
    onSubmit(data);
  };

  const toggleParticipant = (uid: string) => {
    setFormData(prev => ({
      ...prev,
      participantes: prev.participantes.includes(uid)
        ? prev.participantes.filter(id => id !== uid)
        : [...prev.participantes, uid]
    }));
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-[#EAE2D6] flex justify-between items-center bg-[#FDFBF7]">
          <h2 className="text-xl font-serif text-[#4A4E4D]">{eventoToEdit ? 'Editar Evento' : 'Nuevo Evento'}</h2>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Título *</label>
            <input
              required
              type="text"
              value={formData.titulo}
              onChange={e => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] transition-colors"
              placeholder="Ej. Cosecha colectiva"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Tipo de Evento</label>
            <select
              value={formData.tipo}
              onChange={e => setFormData({ ...formData, tipo: e.target.value as Evento['tipo'] })}
              className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] transition-colors bg-white"
              disabled={isSubmitting}
            >
              <option value="reunion">Reunión / Círculo</option>
              <option value="tarea_comunal">Tarea Comunal</option>
              <option value="visita">Visita</option>
              <option value="celebracion">Celebración</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Inicio *</label>
              <input
                required
                type="datetime-local"
                value={formData.inicio}
                onChange={e => setFormData({ ...formData, inicio: e.target.value })}
                className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] transition-colors"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Fin *</label>
              <input
                required
                type="datetime-local"
                value={formData.fin}
                onChange={e => setFormData({ ...formData, fin: e.target.value })}
                className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] transition-colors"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="todoElDia"
              checked={formData.todoElDia}
              onChange={e => setFormData({ ...formData, todoElDia: e.target.checked })}
              className="rounded text-[#CB997E] focus:ring-[#CB997E]"
              disabled={isSubmitting}
            />
            <label htmlFor="todoElDia" className="text-sm text-stone-700">Todo el día</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Responsable</label>
            <select
              value={formData.responsable_uid}
              onChange={e => setFormData({ ...formData, responsable_uid: e.target.value })}
              className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] transition-colors bg-white"
              disabled={isSubmitting}
            >
              <option value="">-- Seleccionar --</option>
              {members.map(m => (
                <option key={m.userId} value={m.userId}>{m.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Participantes</label>
            <div className="flex flex-wrap gap-2 p-2 border border-[#EAE2D6] rounded-xl min-h-[42px] bg-white">
              {members.map(m => (
                <button
                  key={m.userId}
                  type="button"
                  onClick={() => toggleParticipant(m.userId)}
                  disabled={isSubmitting}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    formData.participantes.includes(m.userId)
                      ? 'bg-[#A5A58D] text-white'
                      : 'bg-[#FDFBF7] text-stone-600 hover:bg-[#EAE2D6]'
                  }`}
                >
                  {m.nombre}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Descripción</label>
            <textarea
              rows={3}
              value={formData.descripcion}
              onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] transition-colors resize-none"
              placeholder="Detalles sobre el evento..."
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
              className="bg-[#A5A58D] hover:bg-[#6B705C] text-white px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : (eventoToEdit ? 'Guardar Cambios' : 'Crear Evento')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
