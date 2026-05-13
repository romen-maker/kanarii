import { useState } from 'react';
import { Ficha, cruzarMiembros, AnalisisCruce, getCruce, saveCruce } from '../lib/appService';
import { generarAnalisisCruce } from '../lib/gemini';
import { Leaf, Users, Search, ArrowLeft, RefreshCw, Layers, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';
import { useFichas } from '../hooks/useFichas';
import { useToast } from '../hooks/useToast';

export function CruceView() {
  const { appUser } = useAuth();
  const navigate = useNavigate();
  const { fichas, loading } = useFichas();
  const toast = useToast();
  
  const [perfil1Id, setPerfil1Id] = useState<string>('');
  const [perfil2Id, setPerfil2Id] = useState<string>('');
  
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    determinista: AnalisisCruce;
    gemini: string;
    fromCache: boolean;
    generadoEn: Date | null;
  } | null>(null);

  const getHash = (ficha: Ficha) => {
    try {
      return btoa("v2" + JSON.stringify(ficha.datosBrutos) + JSON.stringify(ficha.perfilVisual)).slice(0, 16);
    } catch {
      return 'hash_error';
    }
  };

  const handleAnalisis = async () => {
    if (!perfil1Id || !perfil2Id || perfil1Id === perfil2Id) return;

    setAnalyzing(true);
    setResult(null);

    const f1 = fichas.find(f => f.userId === perfil1Id);
    const f2 = fichas.find(f => f.userId === perfil2Id);

    if (!f1 || !f2) {
      setAnalyzing(false);
      return;
    }

    if (!f1.datosBrutos || !f2.datosBrutos || !f1.perfilVisual || !f2.perfilVisual) {
      toast.error("Uno de estos miembros aún no tiene ficha completa (faltan datos astrales o visuales).");
      setAnalyzing(false);
      return;
    }

    const sortedIds = [perfil1Id, perfil2Id].sort();
    
    // Check cache
    try {
      const cachedCruce = await getCruce(perfil1Id, perfil2Id);
      
      const hash1 = sortedIds[0] === perfil1Id ? getHash(f1) : getHash(f2);
      const hash2 = sortedIds[1] === perfil2Id ? getHash(f2) : getHash(f1);

      if (cachedCruce) {
        if (cachedCruce.perfilHash1 === hash1 && cachedCruce.perfilHash2 === hash2) {
          setResult({
            determinista: cachedCruce.resultado,
            gemini: cachedCruce.analisisGemini,
            fromCache: true,
            generadoEn: cachedCruce.generadoEn?.toDate() || new Date()
          });
          setAnalyzing(false);
          return;
        }
      }

      const respDet = cruzarMiembros(f1, f2);
      const geminiTxt = await generarAnalisisCruce(f1, f2, respDet);
      
      const newCruceData = {
        miembro1_uid: sortedIds[0],
        miembro2_uid: sortedIds[1],
        resultado: respDet,
        analisisGemini: geminiTxt,
        perfilHash1: hash1,
        perfilHash2: hash2
      };

      await saveCruce(perfil1Id, perfil2Id, newCruceData);

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
            Selecciona dos miembros para analizar sus compatibilidades y tensiones, así como recomendaciones para su colaboración.
          </p>

          {loading ? (
            <p className="text-stone-500 italic">Cargando fichas...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Miembro 1</label>
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
                <label className="block text-sm font-medium text-stone-700 mb-2">Miembro 2</label>
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
              className="bg-[#6B705C] hover:bg-[#4A4E4D] text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center min-w-[200px]"
            >
              {analyzing ? (
                <>Tejiendo el análisis de encuentro...</>
              ) : (
                'Analizar Cruce'
              )}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] overflow-hidden p-6">
            <h2 className="text-2xl font-serif text-[#4A4E4D] mb-6 flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span>Resultados del Encuentro</span>
                {result.fromCache && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Análisis guardado {result.generadoEn ? result.generadoEn.toLocaleDateString() : ''}
                  </span>
                )}
              </div>
              <span className="text-xl px-4 py-1 bg-[#F9F7F1] border border-[#EAE2D6] rounded-full text-[#6B705C]">
                Sinergia: {result.determinista.puntuacion}%
              </span>
            </h2>

            {result.determinista.compatibilidades.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">Compatibilidades</h3>
                <div className="flex flex-wrap gap-2">
                  {result.determinista.compatibilidades.map((c, i) => (
                    <span key={i} className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.determinista.tensiones.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">Tensiones Potenciales</h3>
                <div className="flex flex-wrap gap-2">
                  {result.determinista.tensiones.map((t, i) => (
                    <span key={i} className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-sm">
                       {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.determinista.canalesConexion && (
              <div className="mb-8 p-5 bg-[#F9F7F1] rounded-2xl border border-[#EAE2D6]">
                <h3 className="text-sm font-bold text-[#6B705C] uppercase tracking-wider mb-4">Canales de Conexión</h3>
                <div className="flex flex-col gap-3">
                  {result.determinista.canalesConexion.electromagneticos.length > 0 && (
                     <div className="flex flex-wrap gap-2">
                       {result.determinista.canalesConexion.electromagneticos.map((txt, i) => (
                         <span key={i} className="px-3 py-1.5 bg-yellow-50 text-yellow-800 border border-yellow-400 rounded-full text-sm shadow-sm font-medium flex items-center gap-1">
                           ✨ {txt}
                         </span>
                       ))}
                     </div>
                  )}
                  {result.determinista.canalesConexion.compania.length > 0 && (
                     <div className="flex flex-wrap gap-2 mt-1">
                       {result.determinista.canalesConexion.compania.map((txt, i) => (
                         <span key={i} className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm">
                           {txt}
                         </span>
                       ))}
                     </div>
                  )}
                  {(result.determinista.canalesConexion.dominancia.length > 0 || result.determinista.canalesConexion.compromiso.length > 0) && (
                     <div className="flex flex-wrap gap-2 mt-1">
                       {result.determinista.canalesConexion.dominancia.map((txt, i) => (
                         <span key={`d-${i}`} className="px-3 py-1 bg-orange-50 text-orange-800 border border-orange-200 rounded-full text-sm">
                           {txt}
                         </span>
                       ))}
                       {result.determinista.canalesConexion.compromiso.map((txt, i) => (
                         <span key={`c-${i}`} className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-sm">
                           {txt}
                         </span>
                       ))}
                     </div>
                  )}
                  {Object.values(result.determinista.canalesConexion).every(arr => arr.length === 0) && (
                    <p className="text-sm text-stone-500 italic">No se detectaron canales de conexión adicionales en este cruce.</p>
                  )}
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-[#EAE2D6]">
              <h3 className="text-lg font-serif text-[#4A4E4D] mb-4">Análisis Sociocrático (IA)</h3>
              <div className="prose prose-stone max-w-none">
                <Markdown>{result.gemini}</Markdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
