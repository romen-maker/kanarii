import { useEffect, useState } from 'react';
import { collection, query, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Ficha, saveFicha } from '../lib/appService';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { Leaf, Users, Search, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ManualViewer } from '../components/ManualViewer';

function getDatosPersona(ficha: Ficha) {
  return ficha.datosPersona ?? ficha.datosOnboarding ?? {};
}

const SEED_DATA = [
  { nombre: "Tamarit Benchara", rol_arteara: "bioconstrucción", antiguedad_anos: 3, genero: "hombre", estudios: "FP", tension: "Siento que mis aportaciones técnicas no son valoradas igual que las decisiones del núcleo fundador", fechaNacimiento: "15/04/1990", lugar: "Gran Canaria" },
  { nombre: "Yurena Doramas", rol_arteara: "huerta y semillas", antiguedad_anos: 1, genero: "mujer", estudios: "universitarios", tension: "Noto dificultad para decir no sin sentirme culpable por decepcionar al grupo", fechaNacimiento: "22/08/1988", lugar: "Tenerife" },
  { nombre: "Aythami Guayarmina", rol_arteara: "cuidados y espacio común", antiguedad_anos: 2, genero: "no binario", estudios: "bachillerato", tension: "Hay una dinámica de triángulos y conversaciones que no incluyen a quien afectan directamente", fechaNacimiento: "10/11/1995", lugar: "Norte de África" },
  { nombre: "Nakima Tigoraf", rol_arteara: "facilitación y sociocracia", antiguedad_anos: 4, genero: "mujer", estudios: "universitarios", tension: "Estoy en calma, quiero profundizar en los procesos de toma de decisiones colectivas", fechaNacimiento: "03/02/1985", lugar: "Lanzarote" },
  { nombre: "Bentor Achaman", rol_arteara: "música y ritual", antiguedad_anos: 0.5, genero: "hombre", estudios: "secundaria", tension: "Soy recién llegado y aún no entiendo bien cómo funciona la estructura del proyecto", fechaNacimiento: "18/07/2000", lugar: "Fuerteventura" }
];

export function AdminPanel() {
  const { appUser, logout } = useAuth();
  const navigate = useNavigate();
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFicha, setSelectedFicha] = useState<Ficha | null>(null);

  const fetchFichas = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'fichas'));
      const snapshot = await getDocs(q);
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ficha));
      
      // One-time cleanup for old seed data
      const oldSeedsToFix = data.filter(doc => doc.isSeedData && !doc.userId.startsWith('seed_'));
      if (oldSeedsToFix.length > 0) {
        const { updateDoc, serverTimestamp } = await import('firebase/firestore');
        for (const oldDoc of oldSeedsToFix) {
          try {
            await updateDoc(doc(db, 'fichas', oldDoc.id), { userId: `seed_${oldDoc.id.replace('seed-', '')}`, updatedAt: serverTimestamp() });
            oldDoc.userId = `seed_${oldDoc.id.replace('seed-', '')}`;
          } catch(e) { console.error(e) }
        }
      }
      
      const realDocs = data.filter(doc => !doc.isSeedData);
      
      if (realDocs.length < 3 && appUser) {
        const promises = SEED_DATA.map(async (seed, index) => {
          const seedId = `seed-${appUser.uid}-${index}`;
          const existing = data.find(d => d.id === seedId);
          if (!existing) {
            const seedFicha = {
              userId: seedId,
              datosOnboarding: {
                nombre: seed.nombre,
                fechaNacimiento: seed.fechaNacimiento,
                hora: "12:00",
                lugar: seed.lugar,
                genero: seed.genero,
                estudios: seed.estudios,
                rol_arteara: seed.rol_arteara,
                antiguedad_anos: seed.antiguedad_anos,
                tension: seed.tension
              },
              manualGenerado: `## Identidad Astral\nEste es un documento generado de ejemplo para ${seed.nombre}.\n\n## Diseño Humano\nAquí se incluiría el análisis del diseño humano.\n\n## Solución de Conflictos\nAbordando la tensión: "${seed.tension}".`,
              isSeedData: true,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            await setDoc(doc(db, 'fichas', seedId), seedFicha);
            return { id: seedId, ...seedFicha, createdAt: new Date(), updatedAt: new Date() } as Ficha;
          }
          return null;
        });
        
        const newSeeds = (await Promise.all(promises)).filter(Boolean) as Ficha[];
        if (newSeeds.length > 0) {
          data = [...data, ...newSeeds];
        }
      }
      
      setFichas(data);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'fichas');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (appUser) {
      fetchFichas();
    }
  }, [appUser]);

  const handleRetryCapa1 = async (ficha: Ficha) => {
    if (!ficha.id) return;
    setLoading(true);
    try {
      await saveFicha(ficha.userId, ficha.datosOnboarding, ficha.id);
      await fetchFichas();
    } catch (err) {
      console.error(err);
      alert("Error al intentar de nuevo");
      setLoading(false);
    }
  };

  const filteredFichas = fichas.filter(f => {
    const datos = getDatosPersona(f);
    if (!datos || !datos.nombre) return false;
    return (
      (datos.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (datos.rol_arteara?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 p-6 flex flex-col items-center pb-20 md:pb-6">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <Leaf className="text-[#6B705C] w-8 h-8" />
            <h1 className="text-3xl font-serif text-[#4A4E4D]">Panel Comunitario</h1>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => navigate('/ficha')} className="px-4 py-2 bg-[#CB997E] hover:bg-[#B58368] text-white rounded-xl text-sm font-medium transition-colors">
              Ver mi ficha
            </button>
            <button onClick={logout} className="text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors">
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] overflow-hidden">
          <div className="p-6 border-b border-[#EAE2D6] flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center bg-[#F9F7F1]">
            <div className="flex items-center gap-2 text-stone-600 font-medium">
              <Users className="w-5 h-5 text-[#A5A58D]" />
              <span>{fichas.length} Fichas registradas</span>
            </div>
            
            <div className="relative w-full sm:w-auto">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input 
                type="text"
                placeholder="Buscar por nombre o rol..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-[#EAE2D6] rounded-full text-sm focus:outline-none focus:border-[#A5A58D] w-full sm:w-64"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-white border-b border-[#EAE2D6] text-stone-400 font-medium tracking-wider uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Antigüedad</th>
                  <th className="px-6 py-4">Estudios</th>
                  <th className="px-6 py-4">Tensión</th>
                  <th className="px-6 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2D6]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400">Cargando fichas...</td>
                  </tr>
                ) : filteredFichas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-400">No se encontraron fichas.</td>
                  </tr>
                ) : (
                  filteredFichas.map(ficha => {
                    const datos = getDatosPersona(ficha);
                    if (!datos || !datos.nombre) return null;
                    return (
                      <tr key={ficha.id} className="hover:bg-[#F9F7F1] transition-colors">
                        <td className="px-6 py-4 font-medium text-stone-700">
                          {datos.nombre}
                          {ficha.isSeedData && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#EAE2D6] text-[#6B705C]">
                              Demo
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">{datos.rol_arteara}</td>
                        <td className="px-6 py-4">{datos.antiguedad_anos}</td>
                        <td className="px-6 py-4">{datos.estudios}</td>
                        <td className="px-6 py-4">
                          <span className="inline-block truncate max-w-[150px] items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EAE2D6] text-[#4A4E4D]" title={datos.tension}>
                            {datos.tension}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex items-center gap-3">
                          {ficha.estado === 'pendiente_capa1' && (
                            <button
                              onClick={() => handleRetryCapa1(ficha)}
                              title="Reintentar obtención de datos"
                              className="text-stone-400 hover:text-[#CB997E] transition-colors"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => setSelectedFicha(ficha)}
                            className="text-sm font-medium text-[#CB997E] hover:text-[#B58368]"
                          >
                            Ver ficha
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile view */}
          <div className="md:hidden p-4 space-y-3">
            {loading ? (
              <div className="text-center text-stone-400 py-8">Cargando fichas...</div>
            ) : filteredFichas.length === 0 ? (
              <div className="text-center text-stone-400 py-8">No se encontraron fichas.</div>
            ) : (
              filteredFichas.map(ficha => {
                const datos = getDatosPersona(ficha);
                if (!datos || !datos.nombre) return null;
                return (
                  <div key={ficha.id} className="bg-white rounded-2xl border border-[#EAE2D6] p-4 flex flex-col gap-2 relative">
                    <div className="pr-20">
                      <h3 className="font-serif text-lg text-stone-700 leading-tight">
                        {datos.nombre}
                        {ficha.isSeedData && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#EAE2D6] text-[#6B705C] align-middle">
                            Demo
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-stone-500 mt-1">
                        {datos.rol_arteara} · {datos.antiguedad_anos}
                      </p>
                      <p className="text-xs text-stone-400 italic mt-2 line-clamp-2">
                        {datos.tension}
                      </p>
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-3">
                      {ficha.estado === 'pendiente_capa1' && (
                        <button
                          onClick={() => handleRetryCapa1(ficha)}
                          title="Reintentar obtención de datos"
                          className="text-stone-400 hover:text-[#CB997E] transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedFicha(ficha)}
                        className="text-sm font-medium text-[#CB997E] hover:text-[#B58368]"
                      >
                        Ver ficha
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {selectedFicha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
            <div className="p-6 border-b border-[#EAE2D6] flex justify-between items-center bg-[#FDFBF7]">
              <h2 className="text-2xl font-serif text-[#4A4E4D]">Ficha de {getDatosPersona(selectedFicha).nombre}</h2>
              <button 
                onClick={() => setSelectedFicha(null)}
                className="p-2 hover:bg-[#EAE2D6] rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-stone-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {selectedFicha.perfilVisual && (
                <div className="mb-8 p-6 bg-[#F9F7F1] rounded-2xl border border-[#EAE2D6]">
                  <div className="mb-6">
                    <h3 className="text-3xl font-serif text-[#4A4E4D] mb-2">{selectedFicha.perfilVisual.arquetipo}</h3>
                    <p className="text-stone-600 text-lg">{selectedFicha.perfilVisual.descripcion_arquetipo}</p>
                  </div>
                  
                  {selectedFicha.perfilVisual.dimensiones && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <div className="flex justify-between text-sm mb-1 text-stone-600"><span>Escucha</span><span className="font-medium">{selectedFicha.perfilVisual.dimensiones.escucha}%</span></div>
                        <div className="w-full bg-[#EAE2D6] rounded-full h-2">
                          <div className="bg-[#CB997E] h-2 rounded-full" style={{ width: `${Math.min(100, selectedFicha.perfilVisual.dimensiones.escucha)}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1 text-stone-600"><span>Acción</span><span className="font-medium">{selectedFicha.perfilVisual.dimensiones.accion}%</span></div>
                        <div className="w-full bg-[#EAE2D6] rounded-full h-2">
                          <div className="bg-[#CB997E] h-2 rounded-full" style={{ width: `${Math.min(100, selectedFicha.perfilVisual.dimensiones.accion)}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1 text-stone-600"><span>Estructura</span><span className="font-medium">{selectedFicha.perfilVisual.dimensiones.estructura}%</span></div>
                        <div className="w-full bg-[#EAE2D6] rounded-full h-2">
                          <div className="bg-[#CB997E] h-2 rounded-full" style={{ width: `${Math.min(100, selectedFicha.perfilVisual.dimensiones.estructura)}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1 text-stone-600"><span>Cuidado</span><span className="font-medium">{selectedFicha.perfilVisual.dimensiones.cuidado}%</span></div>
                        <div className="w-full bg-[#EAE2D6] rounded-full h-2">
                          <div className="bg-[#CB997E] h-2 rounded-full" style={{ width: `${Math.min(100, selectedFicha.perfilVisual.dimensiones.cuidado)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-stone-700 mb-2">Fortalezas</h4>
                      <ul className="list-disc list-inside text-sm text-stone-600 space-y-1">
                        {(selectedFicha.perfilVisual.fortalezas || []).map((f: string, i: number) => (
                          <li key={'f-'+i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-stone-700 mb-2">Sombras</h4>
                      <ul className="list-disc list-inside text-sm text-stone-600 space-y-1">
                        {(selectedFicha.perfilVisual.sombras || []).map((s: string, i: number) => (
                          <li key={'s-'+i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {getManualContent() ? (
                <ManualViewer content={getManualContent()!} />
              ) : (
                <p className="text-stone-500 italic">Esta ficha no tiene un manual generado.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
