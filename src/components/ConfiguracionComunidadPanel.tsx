import React, { useState, useEffect } from 'react';
import { useComunidad } from '../contexts/ComunidadContext';
import { useComunidadActions } from '../hooks/useComunidadActions';
import { LocationAutocomplete } from './LocationAutocomplete';
import { useToast } from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  MapPin, 
  Users, 
  Trash2, 
  X, 
  Globe, 
  Lock, 
  Info, 
  ShieldAlert,
  Loader2,
  Check,
  ArrowLeft
} from 'lucide-react';

const TIPOS = [
  { value: 'finca', label: 'Finca', icon: '🌿' },
  { value: 'ecoaldea', label: 'Ecoaldea', icon: '🏡' },
  { value: 'cohousing', label: 'Cohousing', icon: '🏘️' },
  { value: 'urbano', label: 'Espacio Urbano', icon: '🏙️' },
  { value: 'nomada', label: 'Nómada', icon: '🌍' },
  { value: 'otro', label: 'Otro', icon: '📂' },
] as const;

type TipoComunidad = typeof TIPOS[number]['value'];

const TAG_SUGGESTIONS = ['permacultura', 'S3', 'soberanía alimentaria', 'agroecología', 'cohousing', 'decrecimiento', 'educación libre', 'bioconstrucción'];

// --- Toggle local component ---
function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc: string }) {
  return (
    <label className="flex items-start gap-4 cursor-pointer group p-4 rounded-2xl border border-[#EAE2D6] hover:border-[#CB997E]/40 transition-all bg-white shadow-sm">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`mt-0.5 relative w-12 h-7 rounded-full shrink-0 transition-colors duration-300 ${checked ? 'bg-[#6B705C]' : 'bg-stone-300'}`}>
        <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${checked ? 'translate-x-5' : ''}`} />
      </button>
      <div>
        <p className="font-semibold text-stone-800">{label}</p>
        <p className="text-sm text-stone-500 mt-0.5">{desc}</p>
      </div>
    </label>
  );
}

// --- TagChip local component ---
function TagChip({ tag, onRemove }: { tag: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#EAE2D6] text-[#4A4E4D] px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
      {tag}
      {onRemove && (
        <button type="button" onClick={onRemove} className="text-[#6B705C] hover:text-stone-900 transition-colors focus:outline-none">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </span>
  );
}

export function ConfiguracionComunidadPanel({ onUpdated, onCancel }: { onUpdated?: () => void; onCancel?: () => void } = {}) {
  const { comunidad, setCommunityId } = useComunidad();
  const { actualizarComunidad, eliminarComunidad, isExecuting } = useComunidadActions();
  const toast = useToast();
  const navigate = useNavigate();

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [manifiesto, setManifiesto] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');

  // Ubicación
  const [municipio, setMunicipio] = useState('');
  const [region, setRegion] = useState('');
  const [pais, setPais] = useState('');
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);

  // Cultura y Acceso
  const [esPublica, setEsPublica] = useState(true);
  const [requiereAprobacion, setRequiereAprobacion] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [tipo, setTipo] = useState<TipoComunidad>('otro');
  const [capacidad, setCapacidad] = useState('');
  
  // Tag input helper
  const [tagInput, setTagInput] = useState('');

  // Peligro / Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmSlugInput, setConfirmSlugInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Rellenar cuando la comunidad cambie
  useEffect(() => {
    if (comunidad) {
      setNombre(comunidad.nombre || '');
      setDescripcion(comunidad.descripcion || '');
      setManifiesto(comunidad.manifiesto || '');
      setLogoUrl(comunidad.logoUrl || '');
      setBannerUrl(comunidad.bannerUrl || '');
      setMunicipio(comunidad.ubicacion?.municipio || '');
      setRegion(comunidad.ubicacion?.region || '');
      setPais(comunidad.ubicacion?.pais || '');
      setLat(comunidad.ubicacion?.lat);
      setLng(comunidad.ubicacion?.lng);
      setEsPublica(comunidad.esPublica !== false); // Default to true
      setRequiereAprobacion(comunidad.requiereAprobacion !== false); // Default to true
      setTags(comunidad.tags || []);
      setTipo(comunidad.tipo || 'otro');
      setCapacidad(comunidad.capacidad ? String(comunidad.capacidad) : '');
    }
  }, [comunidad]);

  if (!comunidad) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-500">
        <Info className="w-12 h-12 mb-4 text-[#6B705C]" />
        <p className="text-lg font-serif">Cargando datos de la comunidad...</p>
      </div>
    );
  }

  const addTag = (text: string) => {
    const clean = text.trim().toLowerCase();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      toast.error('El nombre de la comunidad es obligatorio.');
      return;
    }

    if (!municipio.trim() || !region.trim() || !pais.trim()) {
      toast.error('La ubicación (municipio, región/isla y país) es obligatoria.');
      return;
    }

    const data = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      manifiesto: manifiesto.trim(),
      logoUrl: logoUrl.trim(),
      bannerUrl: bannerUrl.trim(),
      ubicacion: {
        municipio: municipio.trim(),
        region: region.trim(),
        pais: pais.trim(),
        lat,
        lng
      },
      esPublica,
      requiereAprobacion: esPublica ? requiereAprobacion : true, // Privada requiere aprobación obligatoria
      tags,
      tipo,
      capacidad: capacidad ? parseInt(capacidad, 10) : undefined
    };

    try {
      await actualizarComunidad(comunidad.slug, data);
      onUpdated?.();
    } catch (err) {
      console.error('Error al guardar configuración:', err);
    }
  };

  const handleDeleteCommunity = async () => {
    if (confirmSlugInput !== comunidad.slug) {
      toast.error('El slug no coincide. Introduce el slug exacto.');
      return;
    }

    setIsDeleting(true);
    try {
      await eliminarComunidad(comunidad.slug);
      try {
        sessionStorage.removeItem('kanarii_current_community_id');
      } catch (e) {
        console.warn('Fallo al limpiar sessionStorage', e);
      }
      setCommunityId('');
      setShowDeleteModal(false);
      navigate('/');
    } catch (err) {
      console.error('Error al eliminar comunidad:', err);
      toast.error('No se ha podido eliminar la comunidad.');
    } finally {
      setIsDeleting(false);
    }
  };

  const tipoInfo = TIPOS.find(t => t.value === tipo);

  return (
    <div className="space-y-10 max-w-4xl mx-auto py-6 pb-20">
      <div className="flex items-center justify-between border-b border-[#EAE2D6] pb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#4A4E4D] flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#6B705C]" /> Configuración de la Comunidad
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Modifica la identidad, ubicación, visibilidad y accesos de /{comunidad.slug}.
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 px-4 py-2 border border-[#EAE2D6] rounded-xl hover:bg-stone-50 text-stone-600 font-semibold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* SECCIÓN 1: Identidad */}
        <section className="bg-white rounded-3xl p-6 border border-[#EAE2D6] shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
            <div className="w-10 h-10 bg-[#EAE2D6]/40 rounded-xl flex items-center justify-center text-[#6B705C] font-semibold text-lg">
              1
            </div>
            <div>
              <h3 className="text-lg font-serif font-semibold text-[#4A4E4D]">Identidad</h3>
              <p className="text-xs text-stone-400">Cómo se presenta la comunidad ante el público y los miembros.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-stone-700">Nombre de la comunidad <span className="text-red-400">*</span></label>
              <input 
                type="text" 
                value={nombre} 
                onChange={e => setNombre(e.target.value)} 
                placeholder="Ej: Ecoaldea Granja Verde" 
                className="w-full rounded-xl border-[#EAE2D6] bg-[#F9F7F1] focus:border-[#CB997E] focus:ring-[#CB997E] p-3 text-stone-800"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-stone-700">URL del Logo / Avatar <span className="text-stone-400 font-normal">(opcional)</span></label>
              <input 
                type="url" 
                value={logoUrl} 
                onChange={e => setLogoUrl(e.target.value)} 
                placeholder="https://ejemplo.com/logo.png" 
                className="w-full rounded-xl border-[#EAE2D6] bg-[#F9F7F1] focus:border-[#CB997E] focus:ring-[#CB997E] p-3 text-stone-800"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-stone-700">URL de la Portada / Banner <span className="text-stone-400 font-normal">(opcional)</span></label>
              <input 
                type="url" 
                value={bannerUrl} 
                onChange={e => setBannerUrl(e.target.value)} 
                placeholder="https://ejemplo.com/portada.jpg" 
                className="w-full rounded-xl border-[#EAE2D6] bg-[#F9F7F1] focus:border-[#CB997E] focus:ring-[#CB997E] p-3 text-stone-800"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-stone-700">Descripción breve</label>
            <textarea 
              value={descripcion} 
              onChange={e => setDescripcion(e.target.value)} 
              placeholder="Una breve explicación de qué es esta comunidad..." 
              rows={3}
              className="w-full rounded-xl border-[#EAE2D6] bg-[#F9F7F1] focus:border-[#CB997E] focus:ring-[#CB997E] p-3 text-stone-800"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-stone-700">Manifiesto / Principios <span className="text-stone-400 font-normal">(Markdown soportado)</span></label>
            <textarea 
              value={manifiesto} 
              onChange={e => setManifiesto(e.target.value)} 
              placeholder="Describe los principios, acuerdos fundamentales o visión de la comunidad..." 
              rows={6}
              className="w-full rounded-xl border-[#EAE2D6] bg-[#F9F7F1] focus:border-[#CB997E] focus:ring-[#CB997E] p-3 text-stone-800 font-mono text-sm"
            />
          </div>
        </section>

        {/* SECCIÓN 2: Ubicación */}
        <section className="bg-white rounded-3xl p-6 border border-[#EAE2D6] shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
            <div className="w-10 h-10 bg-[#EAE2D6]/40 rounded-xl flex items-center justify-center text-[#6B705C] font-semibold text-lg">
              2
            </div>
            <div>
              <h3 className="text-lg font-serif font-semibold text-[#4A4E4D]">Ubicación</h3>
              <p className="text-xs text-stone-400">Dónde se encuentra geográficamente vuestro espacio.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-stone-700">Buscar ubicación en el mapa</label>
            <LocationAutocomplete
              onSelect={(data) => {
                const addr = data.address || {};
                const mun = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || addr.hamlet || addr.locality || addr.county || data.ciudad.split(',')[0] || '';
                const reg = addr.state || addr.province || addr.island || addr.region || '';
                const p = addr.country || '';
                
                setMunicipio(mun);
                setRegion(reg);
                setPais(p);
                setLat(data.latitud);
                setLng(data.longitud);
              }}
            />
            <p className="text-xs text-stone-400">Escribe para geocodificar y actualizar las coordenadas de forma automática.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Municipio <span className="text-red-400">*</span></label>
              <input 
                value={municipio} 
                onChange={e => setMunicipio(e.target.value)} 
                placeholder="San Bartolomé" 
                className="w-full rounded-xl border-[#EAE2D6] bg-[#F9F7F1] focus:border-[#CB997E] focus:ring-[#CB997E] p-3 text-stone-800" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Región / Isla <span className="text-red-400">*</span></label>
              <input 
                value={region} 
                onChange={e => setRegion(e.target.value)} 
                placeholder="Gran Canaria" 
                className="w-full rounded-xl border-[#EAE2D6] bg-[#F9F7F1] focus:border-[#CB997E] focus:ring-[#CB997E] p-3 text-stone-800" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">País <span className="text-red-400">*</span></label>
              <input 
                value={pais} 
                onChange={e => setPais(e.target.value)} 
                placeholder="España" 
                className="w-full rounded-xl border-[#EAE2D6] bg-[#F9F7F1] focus:border-[#CB997E] focus:ring-[#CB997E] p-3 text-stone-800" 
                required
              />
            </div>
          </div>

          {(lat !== undefined && lng !== undefined) && (
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-500 font-mono flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#6B705C]" />
              Coordenadas guardadas: Lat {lat.toFixed(6)}, Lng {lng.toFixed(6)}
            </div>
          )}
        </section>

        {/* SECCIÓN 3: Cultura y Acceso */}
        <section className="bg-white rounded-3xl p-6 border border-[#EAE2D6] shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
            <div className="w-10 h-10 bg-[#EAE2D6]/40 rounded-xl flex items-center justify-center text-[#6B705C] font-semibold text-lg">
              3
            </div>
            <div>
              <h3 className="text-lg font-serif font-semibold text-[#4A4E4D]">Cultura y Acceso</h3>
              <p className="text-xs text-stone-400">Define cómo se entra y las características fundamentales de la comunidad.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Toggle 
              checked={esPublica} 
              onChange={v => setEsPublica(v)}
              label="Comunidad pública" 
              desc="Visible en el directorio público de comunidades de Kanarii." 
            />

            {esPublica ? (
              <Toggle 
                checked={requiereAprobacion} 
                onChange={v => setRequiereAprobacion(v)}
                label="Requiere aprobación" 
                desc="Los administradores deben revisar y aprobar cada solicitud de acceso." 
              />
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-700 flex items-start gap-2.5">
                <Lock className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Comunidad privada</p>
                  <p className="text-xs mt-0.5">Invisible en el directorio. La entrada de miembros requiere obligatoriamente aprobación de un admin.</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-stone-700">Tipo de espacio</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TIPOS.map(t => (
                <button 
                  key={t.value} 
                  type="button" 
                  onClick={() => setTipo(t.value)}
                  className={`p-4 rounded-2xl border-2 text-center transition-all hover:scale-[1.02] ${tipo === t.value ? 'border-[#6B705C] bg-[#6B705C]/5 shadow-sm font-bold text-stone-850' : 'border-[#EAE2D6] hover:border-[#CB997E]/40 bg-white text-stone-600'}`}
                >
                  <span className="text-2xl block mb-1">{t.icon}</span>
                  <span className="text-sm font-semibold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-stone-700">Capacidad estimada <span className="text-stone-400 font-normal">(personas, opcional)</span></label>
              <input 
                type="number" 
                min="1" 
                value={capacidad} 
                onChange={e => setCapacidad(e.target.value)} 
                placeholder="Ej: 15"
                className="w-full rounded-xl border-[#EAE2D6] bg-[#F9F7F1] focus:border-[#CB997E] focus:ring-[#CB997E] p-3 text-stone-800" 
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-stone-700">Etiquetas / Tags</label>
            <div className="flex flex-wrap gap-2 min-h-[38px] p-2 bg-[#F9F7F1] border border-[#EAE2D6] rounded-xl">
              {tags.length === 0 ? (
                <span className="text-stone-400 text-sm italic px-2">No hay etiquetas seleccionadas.</span>
              ) : (
                tags.map(tag => (
                  <TagChip 
                    key={tag} 
                    tag={tag} 
                    onRemove={() => setTags(tags.filter(t => t !== tag))} 
                  />
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input 
                value={tagInput} 
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { 
                  if (e.key === 'Enter' || e.key === ',') { 
                    e.preventDefault(); 
                    addTag(tagInput); 
                  } 
                }}
                placeholder="Escribe una etiqueta y pulsa Enter..." 
                className="flex-1 rounded-xl border-[#EAE2D6] bg-[#F9F7F1] focus:border-[#CB997E] focus:ring-[#CB997E] p-3 text-sm text-stone-800" 
              />
            </div>

            <div className="space-y-1.5">
              <span className="block text-xs font-semibold text-stone-450">Sugerencias:</span>
              <div className="flex flex-wrap gap-1.5">
                {TAG_SUGGESTIONS.filter(s => !tags.includes(s)).map(s => (
                  <button 
                    key={s} 
                    type="button" 
                    onClick={() => addTag(s)}
                    className="text-xs px-2.5 py-1 rounded-full border border-dashed border-[#A5A58D] text-[#6B705C] hover:bg-[#EAE2D6] transition-colors"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Guardar cambios */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#EAE2D6]">
          <button 
            type="submit" 
            disabled={isExecuting}
            className="px-6 py-3 bg-[#6B705C] text-white rounded-2xl font-semibold shadow hover:bg-[#5A5E4E] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isExecuting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            Guardar cambios
          </button>
        </div>
      </form>

      {/* ZONA DE PELIGRO */}
      <section className="bg-red-50/50 rounded-3xl p-6 border border-red-200 shadow-sm space-y-4 mt-12">
        <h3 className="text-lg font-serif font-bold text-red-800 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" /> Zona de Peligro
        </h3>
        <p className="text-sm text-red-700">
          Las siguientes acciones son irreversibles. Ten cuidado al ejecutarlas.
        </p>

        <div className="border-t border-red-200/50 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-semibold text-red-900 text-sm">Eliminar esta comunidad</p>
            <p className="text-xs text-red-700/80 mt-0.5">Se eliminará permanentemente el perfil de esta comunidad. Todos los miembros perderán el acceso y sus membresías serán desvinculadas, pero sus perfiles personales no se borrarán.</p>
          </div>
          <button 
            type="button" 
            onClick={() => setShowDeleteModal(true)}
            className="px-5 py-2.5 bg-red-600 text-white rounded-2xl font-semibold hover:bg-red-750 transition-all flex items-center justify-center gap-2 self-start sm:self-center"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar Comunidad
          </button>
        </div>
      </section>

      {/* MODAL DE CONFIRMACIÓN DESTRUCITVA */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 border border-[#EAE2D6] space-y-6">
            
            <div className="flex items-center gap-3 text-red-650">
              <div className="p-2 bg-red-50 rounded-xl">
                <ShieldAlert className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-serif font-bold text-red-900">¿Estás absolutamente seguro?</h3>
            </div>

            <div className="space-y-3 text-sm text-stone-600">
              <p>
                Esta acción es <strong>irreversible</strong>. Al eliminar la comunidad <strong>{comunidad.nombre}</strong> (<code>{comunidad.slug}</code>), se borrará toda la información relacionada:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>El perfil e identidad de la comunidad.</li>
                <li>Todas las vinculaciones de miembros.</li>
                <li>Tareas, proyectos, acuerdos y ofertas del marketplace de este espacio.</li>
              </ul>
              <p className="pt-2">
                Para confirmar la eliminación, introduce el <strong>slug</strong> de la comunidad (<strong><code>{comunidad.slug}</code></strong>):
              </p>
            </div>

            <input 
              type="text" 
              value={confirmSlugInput} 
              onChange={e => setConfirmSlugInput(e.target.value)} 
              placeholder={comunidad.slug}
              className="w-full rounded-xl border-[#EAE2D6] bg-[#F9F7F1] focus:border-red-500 focus:ring-red-500 p-3 text-stone-800 font-mono"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button 
                type="button" 
                disabled={isDeleting}
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmSlugInput('');
                }}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                type="button" 
                disabled={isDeleting || confirmSlugInput !== comunidad.slug}
                onClick={handleDeleteCommunity}
                className="px-5 py-2 bg-red-600 hover:bg-red-750 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirmar eliminación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
