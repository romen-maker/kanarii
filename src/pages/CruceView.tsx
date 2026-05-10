import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Ficha, cruzarMiembros, AnalisisCruce } from '../lib/appService';
import { generarAnalisisCruce } from '../lib/gemini';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { Leaf, Users, Search, ArrowLeft, RefreshCw, Layers } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Markdown from 'react-markdown';

export function CruceView() {
  const { appUser } = useAuth();
  const navigate = useNavigate();
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [perfil1Id, setPerfil1Id] = useState<string>('');
  const [perfil2Id, setPerfil2Id] = useState<string>('');
  
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    determinista: AnalisisCruce;
    gemini: string;
  } | null>(null);

  useEffect(() => {
    if (appUser) {
      fetchFichas();
    }
  }, [appUser]);

  const fetchFichas = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'fichas'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ficha));
      setFichas(data.filter(f => f.datosBrutos || f.estado === 'completo'));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'fichas');
    }
    setLoading(false);
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
      alert("Uno de estos miembros aún no tiene ficha completa (faltan datos astrales o visuales).");
      setAnalyzing(false);
      return;
    }

    try {
      const respDet = cruzarMiembros(f1, f2);
      const geminiTxt = await generarAnalisisCruce(f1, f2, respDet);
      setResult({ determinista: respDet, gemini: geminiTxt });
    } catch (err) {
      console.error(err);
      alert("Error al generar análisis: " + (err as any).message);
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
            <h2 className="text-2xl font-serif text-[#4A4E4D] mb-6 flex justify-between items-center">
              <span>Resultados del Encuentro</span>
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
