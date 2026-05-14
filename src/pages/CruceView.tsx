import { useState } from 'react';
import { 
  Ficha, 
  cruzarMiembros, 
  AnalisisCruce, 
  getCruce, 
  saveCruce,
  getFichaHash,
  enrichFichaDatosBrutos,
  getFichaById
} from '../lib/appService';
import { generarAnalisisCruce } from '../lib/gemini';
import { Leaf, Search, ArrowLeft, Layers, CheckCircle, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import { useFichas } from '../hooks/useFichas';
import { useToast } from '../hooks/useToast';
import { useEntityActions } from '../hooks/useEntityActions';

export function CruceView() {
  const { appUser } = useAuth();
  const navigate = useNavigate();
  const { fichas, loading } = useFichas();
  const toast = useToast();
  const { perform } = useEntityActions();
  
  const [perfil1Id, setPerfil1Id] = useState<string>('');
  const [perfil2Id, setPerfil2Id] = useState<string>('');
  
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    determinista: AnalisisCruce;
    gemini: string;
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
          fromCache: true,
          generadoEn: cachedCruce.generadoEn?.toDate() || new Date()
        });
        setAnalyzing(false);
        return;
      }

      // 2. Generar si no hay cache o es obsoleto
      const respDet = cruzarMiembros(f1, f2);
      const geminiTxt = await generarAnalisisCruce(f1, f2, respDet);
      
      const newCruceData = {
        resultado: respDet,
        analisisGemini: geminiTxt,
        perfilHash1: hash1,
        perfilHash2: hash2
      };

      // 3. Guardar vía perform para persistencia centralizada
      await perform(saveCruce(perfil1Id, perfil2Id, newCruceData));

      setResult({ 
        determinista: respDet, 
        gemini: geminiTxt,
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
          <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] overflow-hidden p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-serif text-[#4A4E4D] mb-6 flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span>Resultados del Encuentro</span>
                {result.fromCache && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Desde archivo ({result.generadoEn ? result.generadoEn.toLocaleDateString() : ''})
                  </span>
                )}
              </div>
              <span className="text-xl px-4 py-1 bg-[#F9F7F1] border border-[#EAE2D6] rounded-full text-[#6B705C] font-serif">
                Sinergia: {result.determinista.puntuacion}%
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {result.determinista.compatibilidades.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">Compatibilidades</h3>
                  <div className="flex flex-col gap-2">
                    {result.determinista.compatibilidades.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-stone-700">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.determinista.tensiones.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">Tensiones Potenciales</h3>
                  <div className="flex flex-col gap-2">
                    {result.determinista.tensiones.map((t, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-stone-700">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {result.determinista.canalesConexion && (() => {
              const cc = result.determinista.canalesConexion;
              const hayCanales = 
                cc.electromagneticos.length > 0 || 
                cc.compania.length > 0 || 
                cc.dominancia.length > 0 || 
                cc.compromiso.length > 0;
              
              return (
                <div className="mb-8 p-5 bg-[#F9F7F1] rounded-2xl border border-[#EAE2D6]">
                  <h3 className="text-sm font-bold text-[#6B705C] uppercase tracking-wider mb-4">Canales de Conexión Astrológica</h3>
                  {!hayCanales ? (
                    <p className="text-sm text-stone-400 italic">
                      No se han detectado canales de conexión directa entre estos perfiles. 
                      Esto puede ocurrir si las fichas no tienen datos de puertas activas o si simplemente no hay coincidencia técnica.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {cc.electromagneticos.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {cc.electromagneticos.map((txt, i) => (
                            <span key={i} className="px-3 py-1.5 bg-white text-yellow-800 border border-yellow-200 rounded-full text-xs shadow-sm font-medium flex items-center gap-1">
                              ✨ {txt}
                            </span>
                          ))}
                        </div>
                      )}
                      {cc.compania.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {cc.compania.map((txt, i) => (
                            <span key={i} className="px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full text-xs">
                              🤝 {txt}
                            </span>
                          ))}
                        </div>
                      )}
                      {cc.dominancia.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {cc.dominancia.map((txt, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs">
                              🏔️ {txt}
                            </span>
                          ))}
                        </div>
                      )}
                      {cc.compromiso.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {cc.compromiso.map((txt, i) => (
                            <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-xs">
                              ⚖️ {txt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="pt-6 border-t border-[#EAE2D6]">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-5 h-5 text-[#6B705C]" />
                <h3 className="text-lg font-serif text-[#4A4E4D]">Perspectiva Sociocrática</h3>
              </div>
              <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed">
                <Markdown>{result.gemini}</Markdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
