import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Loader2, AlertCircle, CheckCircle2, Sparkles, X, Leaf, MapPin, Users, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import { useComunidad } from '../contexts/ComunidadContext';
import { getComunidad } from '../lib/appService';
import { useComunidadActions } from '../hooks/useComunidadActions';
import { useToast } from '../components/Toaster';
import { LocationAutocomplete } from '../components/LocationAutocomplete';

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

function toSlug(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

interface FormData {
  nombre: string; slug: string; descripcion: string; manifiesto: string;
  municipio: string; region: string; pais: string;
  lat?: number; lng?: number;
  tipo: TipoComunidad; capacidad: string;
  esPublica: boolean; requiereAprobacion: boolean;
  tags: string[];
}

const initial: FormData = {
  nombre: '', slug: '', descripcion: '', manifiesto: '',
  municipio: '', region: '', pais: '',
  lat: undefined, lng: undefined,
  tipo: 'otro', capacidad: '',
  esPublica: true, requiereAprobacion: true,
  tags: [],
};

// --- Toggle premium ---
function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc: string }) {
  return (
    <label className="flex items-start gap-4 cursor-pointer group p-4 rounded-2xl border border-[#EAE2D6] hover:border-[#CB997E]/40 transition-all bg-white">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`mt-0.5 relative w-12 h-7 rounded-full shrink-0 transition-colors duration-300 ${checked ? 'bg-[#6B705C]' : 'bg-stone-300'}`}>
        <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${checked ? 'translate-x-5' : ''}`} />
      </button>
      <div><p className="font-semibold text-stone-800">{label}</p><p className="text-sm text-stone-500 mt-0.5">{desc}</p></div>
    </label>
  );
}

// --- Chip de tag ---
function TagChip({ tag, onRemove }: { tag: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#EAE2D6] text-[#4A4E4D] px-3 py-1.5 rounded-full text-sm font-medium">
      {tag}
      {onRemove && <button type="button" onClick={onRemove} className="hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>}
    </span>
  );
}

export function RegistroComunidadView() {
  const { appUser } = useAuth();
  const { setCommunityId } = useComunidad();
  const navigate = useNavigate();
  const toast = useToast();
  const { registrarNuevaComunidad, isExecuting } = useComunidadActions();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initial);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [slugManual, setSlugManual] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');

  const set = useCallback((patch: Partial<FormData>) => setForm(prev => ({ ...prev, ...patch })), []);

  // Auto-slug desde nombre
  useEffect(() => {
    if (!slugManual && form.nombre) set({ slug: toSlug(form.nombre) });
  }, [form.nombre, slugManual, set]);

  // Debounce slug check
  useEffect(() => {
    if (!form.slug || form.slug.length < 3) { setSlugStatus('idle'); return; }
    setSlugStatus('checking');
    const t = setTimeout(async () => {
      const exists = await getComunidad(form.slug);
      setSlugStatus(exists ? 'taken' : 'available');
    }, 500);
    return () => clearTimeout(t);
  }, [form.slug]);

  const canNext = (): boolean => {
    if (step === 0) return !!form.nombre.trim() && !!form.slug && slugStatus === 'available' && !!form.descripcion.trim();
    if (step === 1) return !!form.municipio.trim() && !!form.region.trim() && !!form.pais.trim();
    return true;
  };

  const handleCreate = async () => {
    if (!appUser) return;
    setError('');
    try {
      await registrarNuevaComunidad({
        nombre: form.nombre, slug: form.slug, descripcion: form.descripcion,
        manifiesto: form.manifiesto || undefined,
        esPublica: form.esPublica,
        requiereAprobacion: form.esPublica ? form.requiereAprobacion : true,
        tags: form.tags.length ? form.tags : undefined,
        ubicacion: { 
          municipio: form.municipio, 
          region: form.region, 
          pais: form.pais,
          lat: form.lat,
          lng: form.lng
        },
        tipo: form.tipo, capacidad: form.capacidad ? parseInt(form.capacidad) : undefined,
        adminUids: [appUser.uid],
      }, {
        successMessage: '🎉 ¡Tu comunidad ha sido creada!',
        onSuccess: () => {
          setCommunityId(form.slug);
          navigate(`/admin?tab=comunidad&nueva=true&slug=${form.slug}&nombre=${encodeURIComponent(form.nombre)}`);
        },
        onError: (err: any) => {
          if (err?.message?.includes('SLUG_ALREADY_EXISTS')) { setStep(0); setError('Ese identificador ya está en uso. Elige otro.'); }
          else setError('Ocurrió un error al crear la comunidad. Inténtalo de nuevo.');
        },
      });
    } catch { /* handled by onError */ }
  };

  const addTag = (t: string) => {
    const tag = t.trim().toLowerCase();
    if (tag && !form.tags.includes(tag) && form.tags.length < 10) set({ tags: [...form.tags, tag] });
    setTagInput('');
  };

  const stepTitles = ['Identidad', 'Lugar', 'Cultura y acceso', 'Confirmación'];
  const tipoInfo = TIPOS.find(t => t.value === form.tipo);

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/comunidades')} className="p-2 rounded-xl hover:bg-[#EAE2D6] transition-colors"><ArrowLeft className="w-5 h-5 text-stone-600" /></button>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-[#4A4E4D]">Crear nueva comunidad</h1>
            <p className="text-sm text-stone-500 mt-0.5">Paso {step + 1} de 4 — {stepTitles[step]}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {stepTitles.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-[#6B705C]' : 'bg-[#EAE2D6]'}`} />
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" /><p className="text-sm">{error}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}
            className="bg-white border border-[#EAE2D6] rounded-3xl p-6 md:p-8 shadow-sm">

            {/* PASO 1: Identidad */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2"><Leaf className="w-6 h-6 text-[#6B705C]" /><h2 className="text-xl font-serif text-[#4A4E4D]">Identidad de tu comunidad</h2></div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Nombre <span className="text-red-400">*</span></label>
                  <input value={form.nombre} onChange={e => set({ nombre: e.target.value })} placeholder="Ej: Arteara, La Finca del Sol..."
                    className="w-full rounded-xl border-[#EAE2D6] bg-[#F9F7F1] focus:border-[#CB997E] focus:ring-[#CB997E] p-3" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Identificador (slug) <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <input value={form.slug} onChange={e => { setSlugManual(true); set({ slug: toSlug(e.target.value) }); }}
                      placeholder="mi-comunidad" className="w-full rounded-xl border-[#EAE2D6] bg-[#F9F7F1] focus:border-[#CB997E] focus:ring-[#CB997E] p-3 pr-10 font-mono text-sm" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {slugStatus === 'checking' && <Loader2 className="w-5 h-5 text-stone-400 animate-spin" />}
                      {slugStatus === 'available' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      {slugStatus === 'taken' && <AlertCircle className="w-5 h-5 text-red-500" />}
                    </div>
                  </div>
                  <p className={`text-xs mt-1.5 ${slugStatus === 'taken' ? 'text-red-500 font-medium' : 'text-stone-400'}`}>
                    {slugStatus === 'taken' ? 'Este identificador ya está en uso' : slugStatus === 'available' ? '✓ Disponible' : `kanarii.app/c/${form.slug || '...'}`}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Descripción corta <span className="text-red-400">*</span></label>
                  <textarea value={form.descripcion} onChange={e => { if (e.target.value.length <= 160) set({ descripcion: e.target.value }); }} rows={2}
                    placeholder="¿De qué va tu comunidad? (máx. 160 caracteres)" className="w-full rounded-xl border-[#EAE2D6] bg-[#F9F7F1] focus:border-[#CB997E] focus:ring-[#CB997E] p-3 resize-none" />
                  <p className={`text-xs text-right ${form.descripcion.length > 140 ? 'text-amber-500' : 'text-stone-400'}`}>{form.descripcion.length}/160</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Manifiesto <span className="text-stone-400 font-normal">(opcional, Markdown)</span></label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <textarea value={form.manifiesto} onChange={e => set({ manifiesto: e.target.value })} rows={6}
                      placeholder="# Nuestro manifiesto&#10;&#10;Escribe aquí los valores..." className="w-full rounded-xl border-[#EAE2D6] bg-[#F9F7F1] focus:border-[#CB997E] focus:ring-[#CB997E] p-3 resize-none font-mono text-sm" />
                    {form.manifiesto && (
                      <div className="rounded-xl border border-[#EAE2D6] bg-[#F9F7F1] p-4 overflow-y-auto max-h-[200px] prose prose-sm prose-stone">
                        <ReactMarkdown>{form.manifiesto}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PASO 2: Lugar */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2"><MapPin className="w-6 h-6 text-[#6B705C]" /><h2 className="text-xl font-serif text-[#4A4E4D]">¿Dónde estáis?</h2></div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-stone-700">Buscar ubicación</label>
                  <LocationAutocomplete
                    onSelect={(data) => {
                      const addr = data.address || {};
                      const municipio = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || addr.hamlet || addr.locality || addr.county || data.ciudad.split(',')[0] || '';
                      const region = addr.state || addr.province || addr.island || addr.region || '';
                      const pais = addr.country || '';
                      set({
                        municipio,
                        region,
                        pais,
                        lat: data.latitud,
                        lng: data.longitud
                      });
                    }}
                  />
                  <p className="text-xs text-stone-400">Busca la ubicación para autocompletar las coordenadas reales de la comunidad.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Municipio <span className="text-red-400">*</span></label>
                    <input value={form.municipio} onChange={e => set({ municipio: e.target.value })} placeholder="San Bartolomé" className="w-full rounded-xl border-[#EAE2D6] bg-[#F9F7F1] focus:border-[#CB997E] focus:ring-[#CB997E] p-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">Región / Isla <span className="text-red-400">*</span></label>
                    <input value={form.region} onChange={e => set({ region: e.target.value })} placeholder="Gran Canaria" className="w-full rounded-xl border-[#EAE2D6] bg-[#F9F7F1] focus:border-[#CB997E] focus:ring-[#CB997E] p-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-1.5">País <span className="text-red-400">*</span></label>
                    <input value={form.pais} onChange={e => set({ pais: e.target.value })} placeholder="España" className="w-full rounded-xl border-[#EAE2D6] bg-[#F9F7F1] focus:border-[#CB997E] focus:ring-[#CB997E] p-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-3">Tipo de espacio</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {TIPOS.map(t => (
                      <button key={t.value} type="button" onClick={() => set({ tipo: t.value })}
                        className={`p-4 rounded-2xl border-2 text-center transition-all hover:scale-[1.02] ${form.tipo === t.value ? 'border-[#6B705C] bg-[#6B705C]/5 shadow-md' : 'border-[#EAE2D6] hover:border-[#CB997E]/40 bg-white'}`}>
                        <span className="text-2xl block mb-1">{t.icon}</span>
                        <span className="text-sm font-semibold text-stone-700">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5">Capacidad estimada <span className="text-stone-400 font-normal">(personas, opcional)</span></label>
                  <input type="number" min="1" value={form.capacidad} onChange={e => set({ capacidad: e.target.value })} placeholder="Ej: 15"
                    className="w-full max-w-[200px] rounded-xl border-[#EAE2D6] bg-[#F9F7F1] focus:border-[#CB997E] focus:ring-[#CB997E] p-3" />
                </div>
              </div>
            )}

            {/* PASO 3: Cultura y acceso */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2"><Users className="w-6 h-6 text-[#6B705C]" /><h2 className="text-xl font-serif text-[#4A4E4D]">Cultura y acceso</h2></div>

                <Toggle checked={form.esPublica} onChange={v => set({ esPublica: v })}
                  label="Comunidad pública" desc="Visible en el directorio. Cualquier persona puede verla y solicitar acceso." />

                {form.esPublica && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <Toggle checked={form.requiereAprobacion} onChange={v => set({ requiereAprobacion: v })}
                      label="Requiere aprobación" desc="Un admin debe aprobar cada solicitud de acceso. Si desactivas esto, cualquier persona puede unirse libremente." />
                  </motion.div>
                )}

                {!form.esPublica && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-700">
                    <p className="font-medium">🔒 Comunidad privada</p>
                    <p className="mt-1">Solo accesible por invitación. La aprobación es obligatoria.</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Etiquetas</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.tags.map(tag => <TagChip key={tag} tag={tag} onRemove={() => set({ tags: form.tags.filter(t => t !== tag) })} />)}
                  </div>
                  <div className="flex gap-2">
                    <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); } }}
                      placeholder="Escribe y pulsa Enter..." className="flex-1 rounded-xl border-[#EAE2D6] bg-[#F9F7F1] focus:border-[#CB997E] focus:ring-[#CB997E] p-3 text-sm" />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {TAG_SUGGESTIONS.filter(s => !form.tags.includes(s)).map(s => (
                      <button key={s} type="button" onClick={() => addTag(s)}
                        className="text-xs px-3 py-1.5 rounded-full border border-dashed border-[#A5A58D] text-[#6B705C] hover:bg-[#EAE2D6] transition-colors">+ {s}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PASO 4: Confirmación — mini preview de ficha pública */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2"><Eye className="w-6 h-6 text-[#6B705C]" /><h2 className="text-xl font-serif text-[#4A4E4D]">Confirma los datos</h2></div>

                {/* Preview card */}
                <div className="border-2 border-[#EAE2D6] rounded-3xl overflow-hidden bg-[#F9F7F1]">
                  {/* Cabecera */}
                  <div className="bg-gradient-to-br from-[#6B705C] to-[#4A4E4D] p-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl">{tipoInfo?.icon || '📂'}</div>
                      <div>
                        <h3 className="text-xl font-serif font-bold">{form.nombre || 'Sin nombre'}</h3>
                        <p className="text-white/70 text-sm font-mono">/{form.slug}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <p className="text-stone-600">{form.descripcion}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-stone-500"><MapPin className="w-4 h-4" /><span>{form.municipio}, {form.region}, {form.pais}</span></div>
                      <div className="flex items-center gap-2 text-stone-500"><span className="text-lg">{tipoInfo?.icon}</span><span>{tipoInfo?.label}</span></div>
                      {form.capacidad && <div className="flex items-center gap-2 text-stone-500"><Users className="w-4 h-4" /><span>~{form.capacidad} personas</span></div>}
                      <div className="flex items-center gap-2 text-stone-500">
                        {form.esPublica ? <span className="text-xs font-bold uppercase tracking-wider bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100">Pública</span>
                          : <span className="text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">Privada</span>}
                        {form.esPublica && !form.requiereAprobacion && <span className="text-xs text-stone-400">Entrada libre</span>}
                        {(form.requiereAprobacion || !form.esPublica) && <span className="text-xs text-stone-400">Aprobación requerida</span>}
                      </div>
                    </div>

                    {form.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-[#EAE2D6]">
                        {form.tags.map(tag => <TagChip key={tag} tag={tag} />)}
                      </div>
                    )}

                    {form.manifiesto && (
                      <details className="pt-2 border-t border-[#EAE2D6]">
                        <summary className="text-sm font-semibold text-stone-600 cursor-pointer hover:text-[#6B705C]">Ver manifiesto</summary>
                        <div className="mt-3 prose prose-sm prose-stone max-h-40 overflow-y-auto"><ReactMarkdown>{form.manifiesto}</ReactMarkdown></div>
                      </details>
                    )}
                  </div>
                </div>

                <button onClick={handleCreate} disabled={isExecuting}
                  className="w-full bg-[#6B705C] hover:bg-[#4A4E4D] text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-3">
                  {isExecuting ? <><Loader2 className="w-5 h-5 animate-spin" />Creando comunidad...</> : <><Sparkles className="w-5 h-5" />Crear comunidad</>}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav botones */}
        {step < 3 && (
          <div className="flex justify-between mt-6">
            <button onClick={() => { setError(''); setStep(s => s - 1); }} disabled={step === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-stone-600 hover:bg-[#EAE2D6] transition-colors disabled:opacity-30 font-medium">
              <ArrowLeft className="w-4 h-4" />Anterior
            </button>
            <button onClick={() => { setError(''); setStep(s => s + 1); }} disabled={!canNext()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#CB997E] hover:bg-[#B58368] text-white font-bold transition-all shadow-md disabled:opacity-40">
              Siguiente<ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex justify-start mt-6">
            <button onClick={() => { setError(''); setStep(2); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-stone-600 hover:bg-[#EAE2D6] transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" />Volver a editar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
