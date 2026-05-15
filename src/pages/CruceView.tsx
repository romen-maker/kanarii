import { useState } from 'react';
import { 
  Ficha, 
  cruzarMiembros, 
  AnalisisCruce, 
  getCruce, 
  saveCruce,
  getFichaHash,
  enrichFichaDatosBrutos,
  getFichaById,
  getComunidad
} from '../lib/appService';
import { generarAnalisisCruce, AnalisisCruceStructured } from '../lib/gemini';
import { 
  Leaf, 
  Search, 
  ArrowLeft, 
  Layers, 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  Users, 
  Eye, 
  MessageSquare, 
  ShieldAlert,
  Repeat
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import { useFichas } from '../hooks/useFichas';
import { useToast } from '../hooks/useToast';
import { useComunidad } from '../contexts/ComunidadContext';
import { useEntityActions } from '../hooks/useEntityActions';

export function CruceView() {
  const { appUser } = useAuth();
  const navigate = useNavigate();
  const { fichas, loading } = useFichas();
  const toast = useToast();
  const { perform } = useEntityActions();
  
  const { currentCommunityId } = useComunidad();
  const sinComunidad = !appUser?.communityIds?.length;
  
  const [perfil1Id, setPerfil1Id] = useState<string>('');
  const [perfil2Id, setPerfil2Id] = useState<string>('');
  
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    determinista: AnalisisCruce;
    gemini: string;
    structured: AnalisisCruceStructured | null;
    fromCache: boolean;
    generadoEn: Date | null;
  } | null>(null);

  const needsEnrich = (f: Ficha) => {
    const dh = f.datosBrutos?.diseno_humano;
    const puertas = dh?.puertas_activas;
    return !puertas || (Array.isArray(puertas) && puertas.length === 0);
  };

  const handleAnalisis = async () => {
    if (!perfil1Id || !perfil2Id || perfil1Id === perfil2Id) return;

    setAnalyzing(true);
    setResult(null);

    let f1 = fichas.find(f => f.userId === perfil1Id);
    let f2 = fichas.find(f => f.userId === perfil2Id);

    if (!f1 || !f2) {
      toast.error("No se encontraron los perfiles seleccionados.");
      setAnalyzing(false);
      return;
    }

    if (!f1.datosBrutos || !f2.datosBrutos || !f1.perfilVisual || !f2.perfilVisual) {
      toast.error("Uno de estos miembros aún no tiene ficha completa (faltan datos astrales o visuales).");
      setAnalyzing(false);
      return;
    }

    if (needsEnrich(f1) || needsEnrich(f2)) {
      toast.info('Obteniendo datos astrológicos actualizados...');
      const promises = [];
      if (needsEnrich(f1)) promises.push(enrichFichaDatosBrutos(f1));
      if (needsEnrich(f2)) promises.push(enrichFichaDatosBrutos(f2));
      await Promise.all(promises);
      
      const newF1 = await getFichaById(perfil1Id);
      const newF2 = await getFichaById(perfil2Id);
      if (newF1) f1 = newF1;
      if (newF2) f2 = newF2;
    }

    const sortedIds = [perfil1Id, perfil2Id].sort();
    
    try {
      // 1. Verificar Cache
      const cachedCruce = await getCruce(perfil1Id, perfil2Id);
      
      const hash1 = sortedIds[0] === perfil1Id ? getFichaHash(f1) : getFichaHash(f2);
      const hash2 = sortedIds[1] === perfil2Id ? getFichaHash(f2) : getFichaHash(f1);

      if (cachedCruce && cachedCruce.perfilHash1 === hash1 && cachedCruce.perfilHash2 === hash2) {
        setResult({
          determinista: cachedCruce.resultado,
          gemini: cachedCruce.analisisGemini,
          structured: cachedCruce.analisisStructured || null,
          fromCache: true,
          generadoEn: cachedCruce.generadoEn?.toDate() || new Date()
        });
        setAnalyzing(false);
        return;
      }

      // 2. Generar si no hay cache o es obsoleto
      const respDet = cruzarMiembros(f1, f2);
      // Obtenemos el nombre de la comunidad desde el contexto (podríamos añadir comunidadNombre al contexto si fuera necesario, o leerlo de la comunidad activa)
      const comunidadActual = await getComunidad(currentCommunityId || 'arteara');
      const geminiResult = await generarAnalisisCruce(f1, f2, respDet, comunidadActual?.nombre || 'la comunidad');
      
      const newCruceData = {
        resultado: respDet,
        analisisGemini: geminiResult.narrative,
        analisisStructured: geminiResult.structured,
        perfilHash1: hash1,
        perfilHash2: hash2
      };

      // 3. Guardar vía perform para persistencia centralizada
      await perform(saveCruce(perfil1Id, perfil2Id, newCruceData));

      setResult({ 
        determinista: respDet, 
        gemini: geminiResult.narrative,
        structured: geminiResult.structured,
        fromCache: false,
        generadoEn: new Date()
      });
    } catch (err: any) {
      console.error(err);
      toast.error("Error al generar análisis: " + err.message);
    }
    setAnalyzing(false);
  };

  const getNombre = (ficha: Ficha) => ficha.datosPersona?.nombre || ficha.datosOnboarding?.nombre || 'Desconocido';

  if (sinComunidad) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-stone-800 p-6 flex flex-col items-center justify-center pb-20 md:pb-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-[#EAE2D6] p-8 text-center">
          <div className="w-16 h-16 bg-[#F9F7F1] rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-[#A5A58D]" />
          </div>
          <h2 className="text-2xl font-serif text-[#4A4E4D] mb-4">Acceso Reservado</h2>
          <p className="text-stone-600 mb-8">
            El Cruce de Perfiles es una herramienta para miembros de comunidades. Únete a una tribu para empezar a explorar compatibilidades.
          </p>
          <button 
            onClick={() => navigate('/comunidades')}
            className="w-full bg-[#6B705C] hover:bg-[#4A4E4D] text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-sm"
          >
            Explorar Comunidades
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 p-6 flex flex-col items-center pb-20 md:pb-6">
      <div className="w-full max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/admin')} className="p-2 border border-[#EAE2D6] rounded-full text-stone-500 hover:bg-[#EAE2D6]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Layers className="text-[#6B705C] w-8 h-8" />
            <h1 className="text-3xl font-serif text-[#4A4E4D]">Cruce de Perfiles</h1>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] overflow-hidden p-6 mb-8">
          <p className="text-stone-600 mb-6">
            Selecciona dos miembros para analizar sus compatibilidades y tensiones bajo la lente sociocrática y de diseño humano.
          </p>

          {loading ? (
            <div className="flex items-center gap-3 text-stone-400 py-4 animate-pulse">
              <Search className="w-5 h-5" />
              <span>Cargando biblioteca de fichas...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Miembro A</label>
                <select 
                  className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]"
                  value={perfil1Id} 
                  onChange={e => setPerfil1Id(e.target.value)}
                >
                  <option value="">Selecciona un miembro...</option>
                  {fichas.filter(f => f.userId !== perfil2Id).map(f => (
                    <option key={f.userId} value={f.userId}>{getNombre(f)}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Miembro B</label>
                <select 
                  className="w-full bg-[#F9F7F1] border border-[#EAE2D6] rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#A5A58D]"
                  value={perfil2Id} 
                  onChange={e => setPerfil2Id(e.target.value)}
                >
                  <option value="">Selecciona un miembro...</option>
                  {fichas.filter(f => f.userId !== perfil1Id).map(f => (
                    <option key={f.userId} value={f.userId}>{getNombre(f)}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <button 
              onClick={handleAnalisis}
              disabled={analyzing || !perfil1Id || !perfil2Id || loading}
              className="bg-[#6B705C] hover:bg-[#4A4E4D] text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center min-w-[200px] shadow-sm"
            >
              {analyzing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Tejiendo el análisis...
                </div>
              ) : (
                'Analizar Cruce'
              )}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] overflow-hidden p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Header / Arquetipo */}
            <div className="mb-10 border-b border-[#F9F7F1] pb-8">
              <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                <div>
                  {result.structured ? (
                    <>
                      <h2 className="text-3xl font-serif text-[#4A4E4D] mb-2">
                        {result.structured.arquetipo_relacional}
                      </h2>
                      <p className="text-[#6B705C] font-medium flex items-center gap-2 italic">
                        <AlertCircle className="w-4 h-4" />
                        {result.structured.clima_grupal_alerta}
                      </p>
                    </>
                  ) : (
                    <h2 className="text-3xl font-serif text-[#4A4E4D]">Resultados del Encuentro</h2>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-2xl px-6 py-2 bg-[#F9F7F1] border border-[#EAE2D6] rounded-full text-[#6B705C] font-serif shadow-inner">
                    Sinergia: {result.determinista.puntuacion}%
                  </span>
                  {result.fromCache && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-[10px] uppercase font-bold tracking-wider">
                      <CheckCircle className="w-3 h-3" />
                      Archivo ({result.generadoEn?.toLocaleDateString()})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Mapa de Rangos (NUEVO) */}
            {result.structured && (
              <div className="mb-10 bg-[#FDFBF7] border border-[#EAE2D6] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-[#6B705C]" />
                  <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Mapa de Rangos Contextuales</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-xl border border-[#F0EBE0]">
                    <div className="text-[10px] text-stone-400 font-bold uppercase mb-1">Poder de Influencia</div>
                    <div className="text-lg font-serif text-[#4A4E4D]">{result.structured.mapa_rangos.quien_tiene_mas_rango}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-[#F0EBE0]">
                    <div className="text-[10px] text-stone-400 font-bold uppercase mb-1">Tipo de Asimetría</div>
                    <div className="text-lg font-serif text-[#4A4E4D] capitalize">{result.structured.mapa_rangos.tipo_rango}</div>
                  </div>
                  <div className="md:col-span-1 bg-[#F9F7F1] p-4 rounded-xl border border-[#EAE2D6] flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-sm text-stone-600 leading-tight italic">
                      {result.structured.mapa_rangos.alerta_rango}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Canales Enriquecidos (NUEVO/ACTUALIZADO) */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-[#6B705C]" />
                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Canales de Conexión</h3>
              </div>
              
              {result.structured ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.structured.canales_enriquecidos.map((canal, i) => (
                    <div key={i} className="bg-white border border-[#EAE2D6] p-4 rounded-2xl hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-serif text-[#4A4E4D] font-bold">{canal.nombre} ({canal.id})</div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                          canal.tipo === 'electromagnetico' ? 'bg-yellow-100 text-yellow-700' :
                          canal.tipo === 'dominancia' ? 'bg-blue-100 text-blue-700' :
                          canal.tipo === 'compania' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {canal.tipo}
                        </span>
                      </div>
                      <p className="text-sm text-stone-600 mb-2">{canal.descripcion_comunitaria}</p>
                      {canal.nota_rango && (
                        <div className="text-[11px] text-amber-600 font-medium flex items-center gap-1 bg-amber-50 p-2 rounded-lg">
                          <AlertCircle className="w-3 h-3" />
                          {canal.nota_rango}
                        </div>
                      )}
                    </div>
                  ))}
                  {result.structured.canales_enriquecidos.length === 0 && (
                    <p className="text-sm text-stone-400 italic md:col-span-2">Sin canales definidos entre estos perfiles.</p>
                  )}
                </div>
              ) : (
                /* Fallback determinista antiguo */
                <div className="bg-[#F9F7F1] p-6 rounded-2xl border border-[#EAE2D6]">
                  {!(result.determinista.canalesConexion && (
                    result.determinista.canalesConexion.electromagneticos.length > 0 || 
                    result.determinista.canalesConexion.compania.length > 0 || 
                    result.determinista.canalesConexion.dominancia.length > 0 || 
                    result.determinista.canalesConexion.compromiso.length > 0
                  )) ? (
                    <p className="text-sm text-stone-400 italic">No se detectaron canales técnicos.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {result.determinista.canalesConexion.electromagneticos.map((txt, i) => (
                        <span key={i} className="px-3 py-1.5 bg-white text-yellow-800 border border-yellow-200 rounded-full text-xs font-medium">✨ {txt}</span>
                      ))}
                      {/* ... otros canales simplificados ... */}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Comunicación No Violenta (NUEVO) */}
            {result.structured && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-[#6B705C]" />
                  <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Puentes de Comunicación (CNV)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.structured.cnv.map((item, i) => (
                    <div key={i} className="bg-white border border-[#EAE2D6] rounded-2xl overflow-hidden shadow-sm">
                      <div className="bg-[#F9F7F1] px-4 py-2 border-b border-[#EAE2D6] flex justify-between items-center">
                        <span className="font-serif font-bold text-[#4A4E4D]">{item.persona}</span>
                        <span className="text-[10px] text-stone-500 uppercase tracking-tight italic">{item.situacion}</span>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex gap-2">
                          <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded h-fit">Hecho</span>
                          <p className="text-xs text-stone-600">{item.observacion}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded h-fit">Siento</span>
                          <p className="text-xs text-stone-600">{item.sentimiento}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[10px] bg-green-50 text-green-500 px-1.5 py-0.5 rounded h-fit">Necesito</span>
                          <p className="text-xs text-stone-600">{item.necesidad}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-dashed border-stone-200">
                          <div className="text-[10px] font-bold text-[#6B705C] uppercase mb-1">Petición Concreta</div>
                          <p className="text-sm italic font-serif text-[#4A4E4D]">"{item.peticion}"</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sombras y Espejos (NUEVO) */}
            {result.structured && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-[#6B705C]" />
                  <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Espejos y Sombras Probables</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.structured.sombras.map((s, i) => (
                    <div key={i} className="bg-[#4A4E4D] text-[#F9F7F1] p-5 rounded-2xl shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ShieldAlert className="w-12 h-12" />
                      </div>
                      <div className="font-serif text-lg mb-4 border-b border-white/10 pb-2">{s.persona}</div>
                      <div className="space-y-4">
                        <div>
                          <div className="text-[9px] uppercase tracking-widest text-white/50 mb-1">Lo que conscientemente cree</div>
                          <div className="text-sm">{s.proceso_primario}</div>
                        </div>
                        <div>
                          <div className="text-[9px] uppercase tracking-widest text-white/50 mb-1">Sombra proyectada en el otro</div>
                          <div className="text-sm font-medium text-amber-200">{s.sombra_probable}</div>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                          <div className="text-[9px] uppercase tracking-widest text-white/50 mb-1">Gancho Proyectivo</div>
                          <div className="text-sm italic">"Me dispara cuando el otro..." {s.gancho_proyectivo}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Doble Enlace (NUEVO) */}
            {result.structured && (
              <div className="mb-10 bg-[#6B705C] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute -right-8 -bottom-8 opacity-10">
                  <Repeat className="w-32 h-32" />
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <Repeat className="w-5 h-5" />
                  <h3 className="text-sm font-bold uppercase tracking-widest">Protocolo de Doble Enlace Sociocrático</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                  <div className="space-y-2">
                    <div className="text-[10px] text-white/60 font-bold uppercase">Enlace 1: {result.structured.acuerdo_doble_enlace.dominio_1.persona}</div>
                    <div className="text-xl font-serif">{result.structured.acuerdo_doble_enlace.dominio_1.area}</div>
                    <div className="text-[10px] bg-white/20 w-fit px-2 py-0.5 rounded">Revisión: {result.structured.acuerdo_doble_enlace.dominio_1.fecha_revision}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[10px] text-white/60 font-bold uppercase">Enlace 2: {result.structured.acuerdo_doble_enlace.dominio_2.persona}</div>
                    <div className="text-xl font-serif">{result.structured.acuerdo_doble_enlace.dominio_2.area}</div>
                    <div className="text-[10px] bg-white/20 w-fit px-2 py-0.5 rounded">Revisión: {result.structured.acuerdo_doble_enlace.dominio_2.fecha_revision}</div>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/20 text-sm italic text-white/80">
                  Metodología: {result.structured.acuerdo_doble_enlace.metodologia}
                </div>
              </div>
            )}

            {/* Narrativo Original */}
            <div className="pt-10 border-t border-[#EAE2D6]">
              <div className="flex items-center gap-2 mb-6">
                <Leaf className="w-6 h-6 text-[#6B705C]" />
                <h3 className="text-2xl font-serif text-[#4A4E4D]">Análisis Profundo de Facilitación</h3>
              </div>
              <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed prose-headings:font-serif prose-headings:text-[#4A4E4D] prose-blockquote:border-l-[#A5A58D] prose-blockquote:bg-[#F9F7F1] prose-blockquote:py-2 prose-blockquote:rounded-r-xl">
                <Markdown>{result.gemini}</Markdown>
              </div>
            </div>

            {/* Debug (opcional, visible solo en desarrollo) */}
            {/* <pre className="text-[10px] mt-10 p-4 bg-stone-100 rounded overflow-auto">{JSON.stringify(result.structured, null, 2)}</pre> */}
          </div>
        )}
      </div>
    </div>
  );
}
