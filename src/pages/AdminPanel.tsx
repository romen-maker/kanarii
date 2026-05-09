import { useEffect, useState } from 'react';
import { collection, query, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Ficha } from '../lib/appService';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { Leaf, Users, Search, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ManualViewer } from '../components/ManualViewer';

const SEED_DATA = [
  { nombre: "Tamarit Benchara", rolProyecto: "bioconstrucción", antiguedad: "3 años", genero: "hombre", nivelEstudios: "FP", estadoTension: "Siento que mis aportaciones técnicas no son valoradas igual que las decisiones del núcleo fundador", fechaNacimiento: "15/04/1990", lugarNacimiento: "Gran Canaria" },
  { nombre: "Yurena Doramas", rolProyecto: "huerta y semillas", antiguedad: "1 año", genero: "mujer", nivelEstudios: "universitarios", estadoTension: "Noto dificultad para decir no sin sentirme culpable por decepcionar al grupo", fechaNacimiento: "22/08/1988", lugarNacimiento: "Tenerife" },
  { nombre: "Aythami Guayarmina", rolProyecto: "cuidados y espacio común", antiguedad: "2 años", genero: "no binario", nivelEstudios: "bachillerato", estadoTension: "Hay una dinámica de triángulos y conversaciones que no incluyen a quien afectan directamente", fechaNacimiento: "10/11/1995", lugarNacimiento: "Norte de África" },
  { nombre: "Nakima Tigoraf", rolProyecto: "facilitación y sociocracia", antiguedad: "4 años", genero: "mujer", nivelEstudios: "universitarios", estadoTension: "Estoy en calma, quiero profundizar en los procesos de toma de decisiones colectivas", fechaNacimiento: "03/02/1985", lugarNacimiento: "Lanzarote" },
  { nombre: "Bentor Achaman", rolProyecto: "música y ritual", antiguedad: "6 meses", genero: "hombre", nivelEstudios: "secundaria", estadoTension: "Soy recién llegado y aún no entiendo bien cómo funciona la estructura del proyecto", fechaNacimiento: "18/07/2000", lugarNacimiento: "Fuerteventura" }
];

export function AdminPanel() {
  const { appUser, logout } = useAuth();
  const navigate = useNavigate();
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFicha, setSelectedFicha] = useState<Ficha | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, 'fichas'));
        const snapshot = await getDocs(q);
        let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ficha));
        
        const realDocs = data.filter(doc => !doc.isSeedData);
        
        if (realDocs.length < 3 && appUser) {
          const promises = SEED_DATA.map(async (seed, index) => {
            const seedId = `seed-${appUser.uid}-${index}`;
            const existing = data.find(d => d.id === seedId);
            if (!existing) {
              const seedFicha = {
                userId: appUser.uid,
                datosOnboarding: {
                  nombre: seed.nombre,
                  fechaNacimiento: seed.fechaNacimiento,
                  horaNacimiento: "12:00",
                  lugarNacimiento: seed.lugarNacimiento,
                  genero: seed.genero,
                  nivelEstudios: seed.nivelEstudios,
                  rolProyecto: seed.rolProyecto,
                  antiguedad: seed.antiguedad,
                  estadoTension: seed.estadoTension
                },
                manualGenerado: `## Identidad Astral\nEste es un documento generado de ejemplo para ${seed.nombre}.\n\n## Diseño Humano\nAquí se incluiría el análisis del diseño humano.\n\n## Solución de Conflictos\nAbordando la tensión: "${seed.estadoTension}".`,
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
    }
    load();
  }, [appUser]);

  const filteredFichas = fichas.filter(f => {
    const datos = f.datosOnboarding;
    if (!datos) return false;
    return (
      datos.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      datos.rolProyecto.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 p-6 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <Leaf className="text-[#6B705C] w-8 h-8" />
            <h1 className="text-3xl font-serif text-[#4A4E4D]">Panel Comunitario</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/ficha')} className="px-4 py-2 bg-[#CB997E] hover:bg-[#B58368] text-white rounded-xl text-sm font-medium transition-colors">
              Ver mi ficha
            </button>
            <button onClick={logout} className="text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors">
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] overflow-hidden">
          <div className="p-6 border-b border-[#EAE2D6] flex justify-between items-center bg-[#F9F7F1]">
            <div className="flex items-center gap-2 text-stone-600 font-medium">
              <Users className="w-5 h-5 text-[#A5A58D]" />
              <span>{fichas.length} Fichas registradas</span>
            </div>
            
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input 
                type="text"
                placeholder="Buscar por nombre o rol..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-[#EAE2D6] rounded-full text-sm focus:outline-none focus:border-[#A5A58D] w-64"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
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
                    const datos = ficha.datosOnboarding;
                    if (!datos) return null;
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
                        <td className="px-6 py-4">{datos.rolProyecto}</td>
                        <td className="px-6 py-4">{datos.antiguedad}</td>
                        <td className="px-6 py-4">{datos.nivelEstudios}</td>
                        <td className="px-6 py-4">
                          <span className="inline-block truncate max-w-[150px] inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EAE2D6] text-[#4A4E4D]" title={datos.estadoTension}>
                            {datos.estadoTension}
                          </span>
                        </td>
                        <td className="px-6 py-4">
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
        </div>
      </div>

      {selectedFicha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
            <div className="p-6 border-b border-[#EAE2D6] flex justify-between items-center bg-[#FDFBF7]">
              <h2 className="text-2xl font-serif text-[#4A4E4D]">Ficha de {selectedFicha.datosOnboarding?.nombre}</h2>
              <button 
                onClick={() => setSelectedFicha(null)}
                className="p-2 hover:bg-[#EAE2D6] rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-stone-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {selectedFicha.manualGenerado ? (
                <ManualViewer content={selectedFicha.manualGenerado} />
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
