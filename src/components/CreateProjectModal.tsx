import React, { useState } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { Proyecto } from '../lib/appService';

interface CreateProjectModalProps {
  initialEstado?: Proyecto['estado'];
  onClose: () => void;
  onCreate: (proyecto: Omit<Proyecto, 'id' | 'lider_uid' | 'colaboradores_uid' | 'solicitudes_uid'>) => Promise<void>;
}

export function CreateProjectModal({ initialEstado, onClose, onCreate }: CreateProjectModalProps) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState<Proyecto['estado']>(initialEstado || 'buscando_colaboradores');
  const [habilidadesNecesarias, setHabilidadesNecesarias] = useState<string[]>([]);
  const [newHabilidad, setNewHabilidad] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !descripcion || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCreate({
        titulo,
        descripcion,
        estado,
        habilidadesNecesarias
      });
      // El cierre lo gestiona la página después del éxito, o podemos cerrarlo aquí si onCreate es exitoso
    } catch (err) {
      console.error("Error in CreateProjectModal:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddHabilidad = () => {
    if (newHabilidad.trim() && !habilidadesNecesarias.includes(newHabilidad.trim())) {
      setHabilidadesNecesarias([...habilidadesNecesarias, newHabilidad.trim()]);
      setNewHabilidad('');
    }
  };

  const handleRemoveHabilidad = (h: string) => {
    setHabilidadesNecesarias(habilidadesNecesarias.filter(hab => hab !== h));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#4A4E4D] p-8 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6 text-[#D4C3A3]" />
            <h3 className="font-serif text-2xl">Lanzar Iniciativa</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2 ml-1">Título del Proyecto</label>
              <input 
                required
                type="text" 
                className="w-full p-4 rounded-2xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-4 focus:ring-[#EAE2D6]/30 outline-none transition-all"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Huerto Comunitario"
                disabled={isSubmitting}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2 ml-1">Descripción</label>
              <textarea 
                required
                className="w-full p-4 rounded-2xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-4 focus:ring-[#EAE2D6]/30 outline-none min-h-[120px] transition-all"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe el propósito y lo que se espera lograr..."
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2 ml-1">Estado Inicial</label>
              <select 
                className="w-full p-4 rounded-2xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-4 focus:ring-[#EAE2D6]/30 outline-none transition-all"
                value={estado}
                onChange={(e) => setEstado(e.target.value as any)}
                disabled={isSubmitting}
              >
                <option value="buscando_colaboradores">Buscando Ayuda</option>
                <option value="en_marcha">En marcha</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2 ml-1">Habilidades Buscadas</label>
              <div className="relative group">
                <input 
                  type="text" 
                  className="w-full p-4 pr-12 rounded-2xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-4 focus:ring-[#EAE2D6]/30 outline-none transition-all"
                  value={newHabilidad}
                  onChange={(e) => setNewHabilidad(e.target.value)}
                  onKeyDown={(e) => { if(e.key==='Enter'){ e.preventDefault(); handleAddHabilidad(); } }}
                  placeholder="Ej: Fontanería"
                  disabled={isSubmitting}
                />
                <button 
                  type="button" 
                  onClick={handleAddHabilidad} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-stone-800 text-white rounded-xl hover:bg-black transition-all active:scale-90"
                  disabled={isSubmitting}
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {habilidadesNecesarias.map((h, i) => (
                  <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EAE2D6] text-[#4A4E4D] text-[10px] font-bold rounded-xl border border-[#D4C3A3]">
                    {h}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveHabilidad(h)} 
                      className="hover:text-red-500 transition-colors text-lg"
                      disabled={isSubmitting}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full py-5 bg-[#6B705C] text-white font-black uppercase tracking-widest rounded-2xl hover:bg-[#4A4E4D] shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Lanzando...' : 'Lanzar Iniciativa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
