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

type RolComunitario = 'propietario' | 'miembro' | 'voluntario';

const SEED_DATA: { 
  nombre: string; 
  rol_arteara: string; 
  antiguedad_anos: number; 
  genero: string; 
  saberes: string; 
  tension: string; 
  fechaNacimiento: string; 
  lugar: string; 
  rol: RolComunitario;
  fechaSalida?: string;
}[] = [
  { nombre: "Tamarit Benchara", rol_arteara: "bioconstrucción", antiguedad_anos: 3, genero: "hombre", saberes: "FP en Carpintería, años de experiencia construyendo domos y trabajando la tierra", tension: "Siento que mis aportaciones técnicas no son valoradas igual que las decisiones del núcleo fundador", fechaNacimiento: "15/04/1990", lugar: "Gran Canaria", rol: "propietario" },
  { nombre: "Yurena Doramas", rol_arteara: "huerta y semillas", antiguedad_anos: 1, genero: "mujer", saberes: "Grado en Ciencias Ambientales, aficionada a la botánica y permacultura", tension: "Noto dificultad para decir no sin sentirme culpable por decepcionar al grupo", fechaNacimiento: "22/08/1988", lugar: "Tenerife", rol: "miembro" },
  { nombre: "Aythami Guayarmina", rol_arteara: "cuidados y espacio común", antiguedad_anos: 2, genero: "no binario", saberes: "Conocimientos autodidactas en mediación de conflictos, cocina comunitaria y terapias holísticas", tension: "Hay una dinámica de triángulos y conversaciones que no incluyen a quien afectan directamente", fechaNacimiento: "10/11/1995", lugar: "Norte de África", rol: "voluntario", fechaSalida: "2026-11-20" },
  { nombre: "Nakima Tigoraf", rol_arteara: "facilitación y sociocracia", antiguedad_anos: 4, genero: "mujer", saberes: "Psicóloga especializada en dinámicas de grupos, certificada en Sociocracia 3.0", tension: "Estoy en calma, quiero profundizar en los procesos de toma de decisiones colectivas", fechaNacimiento: "03/02/1985", lugar: "Lanzarote", rol: "voluntario", fechaSalida: "2024-01-10" },
  { nombre: "Bentor Achaman", rol_arteara: "música y ritual", antiguedad_anos: 0.5, genero: "hombre", saberes: "Músico multiinstrumentista y luthier aficionado, conectado con las tradiciones canarias", tension: "Soy recién llegado y aún no entiendo bien cómo funciona la estructura del proyecto", fechaNacimiento: "18/07/2000", lugar: "Fuerteventura", rol: "miembro" }
];

export function AdminPanel() {
  const { appUser, logout } = useAuth();
  const navigate = useNavigate();
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'todos' | RolComunitario>('todos');
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

      // Add missing datosBrutos/canales to existing seeds
      const seedsMissingData = data.filter(doc => doc.isSeedData && (!doc.datosBrutos || !doc.datosBrutos.puertas_activas));
      if (seedsMissingData.length > 0) {
        const { updateDoc, serverTimestamp } = await import('firebase/firestore');
        const tiposHD = ["Generador", "Proyector", "Manifestador", "Reflector", "Generador Manifestante"];
        const autoridades = ["Sacral", "Emocional", "Explénica", "Lunar"];
        
        // Mock data for doors and channels to generate some connections
        const mockPuertas = [
          [1, 8, 2, 14, 3, 20], // Has 1-8, plus door 20
          [8, 2, 14, 60, 4, 63, 10], // Has 2-14, plus door 10
          [14, 60, 15, 6, 59, 3, 20], // Has 3-60, 6-59, plus door 20
          [4, 5, 15, 7, 31, 63, 10], // Has 5-15, 4-63, plus door 10
          [63, 6, 31, 9, 52, 7, 20]  // Has 9-52, plus door 20
        ];
        const mockCanales = [
          [{nombre: "1-8", puertas: [1,8]}],
          [{nombre: "2-14", puertas: [2,14]}],
          [{nombre: "3-60", puertas: [3,60]}, {nombre: "6-59", puertas: [6,59]}],
          [{nombre: "5-15", puertas: [5,15]}, {nombre: "4-63", puertas: [4,63]}],
          [{nombre: "9-52", puertas: [9,52]}]
        ];

        for (let index = 0; index < seedsMissingData.length; index++) {
          const oldDoc = seedsMissingData[index];
          const newDatos = {
            estado: 'completo',
            updatedAt: serverTimestamp(),
            datosBrutos: {
              ...(oldDoc.datosBrutos || {}),
              tipo_hd: tiposHD[index % tiposHD.length],
              autoridad: autoridades[index % autoridades.length],
              perfil: `${(index % 6) + 1}/${((index + 2) % 6) + 1}`,
              puertas_activas: mockPuertas[index % mockPuertas.length],
              canales: mockCanales[index % mockCanales.length]
            },
            perfilVisual: oldDoc.perfilVisual || {
              dimensiones: {
                escucha: 30 + (index * 15) % 70,
                accion: 40 + (index * 20) % 60,
                estructura: 20 + (index * 25) % 80,
                cuidado: 50 + (index * 10) % 50
              }
            }
          };
          try {
            await updateDoc(doc(db, 'fichas', oldDoc.id), newDatos);
            Object.assign(oldDoc, newDatos);
          } catch(e) { console.error(e) }
        }
      }
      
      const realDocs = data.filter(doc => !doc.isSeedData);
      
      if (realDocs.length < 3 && appUser) {
        const promises = SEED_DATA.map(async (seed, index) => {
          const seedId = `seed-${appUser.uid}-${index}`;
          const existing = data.find(d => d.id === seedId);
          if (existing) {
             const datosP = getDatosPersona(existing);
             if (!datosP.rol) {
                 try {
                    const { updateDoc, serverTimestamp } = await import('firebase/firestore');
                    
                    const updates: any = {};
                    if (existing.datosPersona) {
                      updates["datosPersona.rol"] = seed.rol;
                      if (seed.fechaSalida) updates["datosPersona.fechaSalida"] = seed.fechaSalida;
                    }
                    if (existing.datosOnboarding) {
                      updates["datosOnboarding.rol"] = seed.rol;
                      if (seed.fechaSalida) updates["datosOnboarding.fechaSalida"] = seed.fechaSalida;
                    }
                    updates["updatedAt"] = serverTimestamp();
                    
                    await updateDoc(doc(db, 'fichas', seedId), updates);
                    if (existing.datosPersona) {
                      existing.datosPersona.rol = seed.rol;
                      existing.datosPersona.fechaSalida = seed.fechaSalida;
                    }
                    if (existing.datosOnboarding) {
                      existing.datosOnboarding.rol = seed.rol;
                      existing.datosOnboarding.fechaSalida = seed.fechaSalida;
                    }
                 } catch(e) { console.error(e) }
             }
          }

          if (!existing) {
            const tiposHD = ["Generador", "Proyector", "Manifestador", "Reflector", "Generador Manifestante"];
            const autoridades = ["Sacral", "Emocional", "Explénica", "Lunar"];
            const seedFicha = {
              userId: seedId,
              estado: 'completo',
              datosOnboarding: {
                nombre: seed.nombre,
                fechaNacimiento: seed.fechaNacimiento,
                hora: "12:00",
                lugar: seed.lugar,
                genero: seed.genero,
                saberes: seed.saberes,
                rol_arteara: seed.rol_arteara,
                antiguedad_anos: seed.antiguedad_anos,
                tension: seed.tension,
                rol: seed.rol,
                fechaSalida: seed.fechaSalida
              },
              datosPersona: {
                nombre: seed.nombre,
                fechaNacimiento: seed.fechaNacimiento,
                hora: "12:00",
                lugar: seed.lugar,
                genero: seed.genero,
                saberes: seed.saberes,
                rol_arteara: seed.rol_arteara,
                antiguedad_anos: seed.antiguedad_anos,
                tension: seed.tension,
                rol: seed.rol,
                fechaSalida: seed.fechaSalida
              },
              datosBrutos: {
                tipo_hd: tiposHD[index % tiposHD.length],
                autoridad: autoridades[index % autoridades.length],
                perfil: `${(index % 6) + 1}/${((index + 2) % 6) + 1}`
              },
              perfilVisual: {
                dimensiones: {
                  escucha: 30 + (index * 15) % 70,
                  accion: 40 + (index * 20) % 60,
                  estructura: 20 + (index * 25) % 80,
                  cuidado: 50 + (index * 10) % 50
                }
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

    if (roleFilter !== 'todos' && datos.rol !== roleFilter) return false;

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
            <button onClick={() => navigate('/cruce')} className="px-4 py-2 bg-white border border-[#CB997E] hover:bg-[#F9F7F1] text-[#CB997E] rounded-xl text-sm font-medium transition-colors">
              Cruce de Perfiles
            </button>
            <button onClick={() => navigate('/ficha')} className="px-4 py-2 bg-[#CB997E] hover:bg-[#B58368] text-white rounded-xl text-sm font-medium transition-colors">
              Ver mi ficha
            </button>
            <button onClick={logout} className="text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors">
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] overflow-hidden">
          {/* Mobile view top action */}
          <div className="md:hidden p-4 border-b border-[#EAE2D6] flex justify-between gap-3">
             <button onClick={() => navigate('/cruce')} className="flex-1 py-2 bg-white border border-[#CB997E] hover:bg-[#F9F7F1] text-[#CB997E] rounded-xl text-sm font-medium transition-colors">
              Cruce de Perfiles
            </button>
             <button onClick={() => navigate('/ficha')} className="flex-1 py-2 bg-[#CB997E] hover:bg-[#B58368] text-white rounded-xl text-sm font-medium transition-colors">
              Mi ficha
            </button>
          </div>
          <div className="p-6 border-b border-[#EAE2D6] flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center bg-[#F9F7F1]">
            <div className="flex items-center gap-2 text-stone-600 font-medium">
              <Users className="w-5 h-5 text-[#A5A58D]" />
              <span>{fichas.length} Fichas registradas</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <select 
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value as any)}
                className="px-3 py-2 bg-white border border-[#EAE2D6] rounded-full text-sm focus:outline-none focus:border-[#A5A58D]"
              >
                <option value="todos">Todos los roles</option>
                <option value="propietario">Propietario/a</option>
                <option value="miembro">Miembro</option>
                <option value="voluntario">Voluntario/a</option>
              </select>
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
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-2">
                              {datos.nombre}
                              {ficha.isSeedData && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#EAE2D6] text-[#6B705C] align-middle">Demo</span>}
                              {datos?.rol && (
                                <div>
                                  {datos.rol === 'propietario' && <span className="inline-block px-2 py-0.5 bg-green-800 text-white rounded text-[10px] font-medium">Propietario/a</span>}
                                  {datos.rol === 'miembro' && <span className="inline-block px-2 py-0.5 bg-green-600 text-white rounded text-[10px] font-medium">Miembro</span>}
                                  {datos.rol === 'voluntario' && (
                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                                      datos.fechaSalida && new Date(datos.fechaSalida) < new Date() 
                                        ? 'bg-teal-50 text-teal-700 border border-teal-200 opacity-80'
                                        : 'bg-teal-600 text-white'
                                    }`}>
                                      Voluntario/a {datos.fechaSalida ? (
                                        new Date(datos.fechaSalida) < new Date()
                                          ? '· ya partió'
                                          : `· hasta ${new Date(datos.fechaSalida).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                      ) : ''}
                                    </span>
                                  )}
                                </div>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{datos.rol_arteara}</td>
                        <td className="px-6 py-4">{datos.antiguedad_anos}</td>
                        <td className="px-6 py-4">{datos.saberes}</td>
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
                      <h3 className="font-serif text-lg text-stone-700 leading-tight flex items-center gap-2 flex-wrap">
                        {datos.nombre}
                        {ficha.isSeedData && <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#EAE2D6] text-[#6B705C] align-middle">Demo</span>}
                        {datos?.rol && (
                          <div>
                            {datos.rol === 'propietario' && <span className="inline-block px-2 py-0.5 bg-green-800 text-white rounded text-[10px] font-medium align-middle">Propietario/a</span>}
                            {datos.rol === 'miembro' && <span className="inline-block px-2 py-0.5 bg-green-600 text-white rounded text-[10px] font-medium align-middle">Miembro</span>}
                            {datos.rol === 'voluntario' && (
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium align-middle ${
                                datos.fechaSalida && new Date(datos.fechaSalida) < new Date() 
                                  ? 'bg-teal-50 text-teal-700 border border-teal-200 opacity-80'
                                  : 'bg-teal-600 text-white'
                              }`}>
                                Voluntario/a {datos.fechaSalida ? (
                                  new Date(datos.fechaSalida) < new Date()
                                    ? '· ya partió'
                                    : `· hasta ${new Date(datos.fechaSalida).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                ) : ''}
                              </span>
                            )}
                          </div>
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

              {selectedFicha.manualMarkdown ? (
                <ManualViewer content={selectedFicha.manualMarkdown} />
              ) : selectedFicha.manualGenerado ? (
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
