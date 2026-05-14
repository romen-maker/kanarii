import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp, orderBy, addDoc, arrayRemove, arrayUnion, onSnapshot, Query } from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './error-handler';

// --- REFERENCIAS DE COLECCIONES ---
export const colFichas = collection(db, 'fichas');
export const colTareas = collection(db, 'tareas');
export const colActas = collection(db, 'actas');
export const colProyectos = collection(db, 'proyectos');
export const colEventos = collection(db, 'eventos');

// --- QUERIES ESTÁNDAR PARA HOOKS ---
export const getFichasQuery = () => query(colFichas);
export const getTareasQuery = () => query(colTareas, orderBy('createdAt', 'desc'));
export const getActasQuery = () => query(colActas, orderBy('fecha', 'desc'));
export const getProyectosQuery = () => query(colProyectos, orderBy('updatedAt', 'desc'));
export const getEventosQuery = (communityId: string) => query(colEventos, where('communityId', '==', communityId), orderBy('inicio', 'asc'));

/**
 * Helper genérico para suscripciones en tiempo real.
 * Centraliza el mapeo de IDs y el manejo de errores de Firestore.
 */
export function subscribeToCollection(q: Query, onData: (data: any[]) => void, errorLabel: string) {
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    onData(data);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, errorLabel);
  });
}

// --- GESTIÓN DE USUARIOS (Para AuthContext) ---
export interface AppUser {
  uid: string;
  email: string;
  role: 'user' | 'admin';
  hasConsented?: boolean;
  hasFicha?: boolean;
  communityId?: string | null;
}

export async function getAppUserDoc(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function syncAppUserDoc(uid: string, data: any) {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    lastLogin: serverTimestamp()
  }, { merge: true });
}

/**
 * Obtiene el perfil completo del usuario, creándolo si no existe.
 * Realiza las comprobaciones de rol y existencia de ficha.
 */
export async function getAppUser(uid: string, email: string): Promise<AppUser> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    let userData: any;

    if (userDoc.exists()) {
      userData = userDoc.data();
      // Verificación de rol administrativo (Hardcoded por seguridad inicial)
      if (email === 'romenusabo3@gmail.com' && userData.role !== 'admin') {
        userData.role = 'admin';
        await updateDoc(userDocRef, { role: 'admin' });
      }
    } else {
      // Crear nuevo usuario
      const role = email === 'romenusabo3@gmail.com' ? 'admin' : 'user';
      userData = {
        email: email,
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        communityId: null
      };
      await setDoc(userDocRef, userData);
    }

    // Verificar si tiene ficha
    const fichasQuery = query(collection(db, 'fichas'), where('userId', '==', uid));
    const fichasSnapshot = await getDocs(fichasQuery);
    const hasFicha = !fichasSnapshot.empty;

    return {
      uid,
      email: userData.email,
      role: userData.role,
      hasConsented: userData.hasConsented || false,
      communityId: userData.communityId || null,
      hasFicha
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}`);
    throw err;
  }
}

/**
 * Actualiza el consentimiento del usuario.
 */
export async function updateAppUserConsent(uid: string): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { 
      hasConsented: true, 
      updatedAt: serverTimestamp() 
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    throw err;
  }
}

// --- GESTIÓN DE EVENTOS (CALENDARIO) ---

export interface Evento {
  id?: string;
  titulo: string;
  descripcion: string;
  tipo: 'reunion' | 'tarea_comunal' | 'visita' | 'celebracion' | 'otro';
  inicio: any; // Timestamp
  fin: any;    // Timestamp
  todoElDia: boolean;
  responsable_uid: string;
  participantes: string[];
  communityId: string;
  vinculado_a?: { tipo: 'proyecto' | 'acta'; id: string };
  creadoEn: any;
  creadoPor: string;
}

export async function createEvento(evento: Partial<Evento>): Promise<string> {
  try {
    const docRef = await addDoc(colEventos, {
      ...evento,
      creadoEn: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'eventos');
    throw err;
  }
}

export async function updateEvento(id: string, cambios: Partial<Evento>): Promise<void> {
  try {
    await updateDoc(doc(db, 'eventos', id), {
      ...cambios,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `eventos/${id}`);
    throw err;
  }
}

export async function deleteEvento(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'eventos', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `eventos/${id}`);
    throw err;
  }
}

export async function getEventos(communityId: string): Promise<Evento[]> {
  try {
    const q = getEventosQuery(communityId);
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Evento));
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'eventos');
    throw err;
  }
}



export interface DatosOnboarding {
  nombre: string;
  fechaNacimiento: string;
  hora: string;
  lugar: string;
  genero: string;
  saberes: string;
  rol_arteara: string;
  antiguedad_anos: number | string;
  tension: string;
  hora_aproximada?: boolean;
  latitud?: number;
  longitud?: number;
  timezone?: string;
  rol?: "propietario" | "miembro" | "voluntario";
  fechaLlegada?: string;
  fechaSalida?: string;
  habilidadesVoluntario?: string;
  plataformaOrigen?: string;
}

export interface Ficha {
  id?: string;
  userId: string;
  datosOnboarding: DatosOnboarding;
  manualGenerado?: string;
  manualMarkdown?: string;
  fechaGeneracion?: any;
  versionesAnteriores?: any[];
  isSeedData?: boolean;
  createdAt?: any;
  updatedAt?: any;
  estado?: string;
  datosBrutos?: any;
  datosPersona?: any;
  perfilVisual?: any;
}

export interface Tarea {
  id?: string;
  titulo: string;
  descripcion?: string;
  asignadaA?: string;
  creadaPor: string;
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'archivada';
  estadoPrevio?: 'pendiente' | 'en_progreso' | 'completada';
  fechaLimite?: any;
  createdAt?: any;
  updatedAt?: any;
  proyectoId?: string;
}

export interface Acta {
  id?: string;
  titulo: string;
  fecha: any;
  facilitador: string;
  participantes: string[];
  contexto: string;
  decisiones: string[];
  tareasDerivadas?: string[];
  proximaReunion?: any;
  creadaPor: string;
  createdAt?: any;
  updatedAt?: any;
  lastEditedBy?: string;
}

export interface Proyecto {
  id?: string;
  titulo: string;
  descripcion: string;
  lider_uid: string; // uid del miembro que lo lidera
  colaboradores_uid: string[];
  solicitudes_uid?: string[]; // Para marcar solicitudes como pendientes
  habilidadesNecesarias: string[]; // tags libres
  estado: "en_marcha" | "buscando_colaboradores" | "completado" | "pausado";
  fechaInicio?: string; // YYYY-MM-DD
  fechaFin?: string;
  creadoEn?: any; // timestamp
  updatedAt?: any;
}

export async function crearProyecto(proyecto: Proyecto): Promise<string> {
  try {
    const cleanData = { ...proyecto };
    delete cleanData.id;
    const docRef = await addDoc(collection(db, 'proyectos'), {
      ...cleanData,
      creadoEn: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'proyectos');
    throw err;
  }
}

export async function actualizarProyecto(id: string, cambios: Partial<Proyecto>): Promise<void> {
  try {
    const docRef = doc(db, 'proyectos', id);
    await updateDoc(docRef, {
      ...cambios,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'proyectos');
    throw err;
  }
}

export async function obtenerProyectos(): Promise<Proyecto[]> {
  try {
    const q = query(collection(db, 'proyectos'), orderBy('creadoEn', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Proyecto));
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'proyectos');
    throw err;
  }
}

export async function solicitarColaboracion(proyectoId: string, uid: string): Promise<void> {
  try {
    const docRef = doc(db, 'proyectos', proyectoId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Proyecto no encontrado');
    const data = snap.data() as Proyecto;
    
    const colaboradores = data.colaboradores_uid || [];
    const solicitudes = data.solicitudes_uid || [];
    
    if (!colaboradores.includes(uid) && !solicitudes.includes(uid)) {
      await updateDoc(docRef, {
        solicitudes_uid: arrayUnion(uid),
        updatedAt: serverTimestamp()
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'proyectos');
    throw err;
  }
}

export async function aprobarColaborador(proyectoId: string, uid: string): Promise<void> {
  try {
    const docRef = doc(db, 'proyectos', proyectoId);
    await updateDoc(docRef, {
      solicitudes_uid: arrayRemove(uid),
      colaboradores_uid: arrayUnion(uid),
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'proyectos');
    throw err;
  }
}

export async function rechazarSolicitud(proyectoId: string, uid: string): Promise<void> {
  try {
    const docRef = doc(db, 'proyectos', proyectoId);
    await updateDoc(docRef, {
      solicitudes_uid: arrayRemove(uid),
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'proyectos');
    throw err;
  }
}

export async function actualizarEstadoProyecto(proyectoId: string, nuevoEstado: Proyecto['estado']): Promise<void> {
  try {
    const docRef = doc(db, 'proyectos', proyectoId);
    await updateDoc(docRef, {
      estado: nuevoEstado,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'proyectos');
    throw err;
  }
}

export async function deleteProyecto(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'proyectos', id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'proyectos');
    throw err;
  }
}

export async function getMemberInfo(uid: string): Promise<any | null> {
  try {
    const docRef = doc(db, 'community_members', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) return { id: snap.id, ...snap.data() };
    
    // Fallback to users collection
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return { 
        id: userSnap.id, 
        nombre: userData.displayName || userData.email || 'Miembro nuevo',
        isFallback: true 
      };
    }
    
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'community_members');
    return null;
  }
}

export async function getUserFicha(userId: string): Promise<Ficha | null> {
  try {
    const q = query(collection(db, 'fichas'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Ficha;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'fichas');
    return null;
  }
}

export async function calcularDatosBrutos(birthData: { fecha: string, hora: string, latitud: number, longitud: number, timezone: string }) {
  const url = (import.meta as any).env.VITE_HD_API_URL || 'https://hd-api.romensuarez.com';
  const apiKey = (import.meta as any).env.VITE_HD_API_KEY;

  const mockFallback = {
    carta_astral_completa: {
      posiciones: [
        { planeta: 'Sol', signo_nombre: 'Aries' },
        { planeta: 'Luna', signo_nombre: 'Tauro' },
        { planeta: 'Saturno', signo_nombre: 'Capricornio' },
        { planeta: 'Venus', signo_nombre: 'Piscis' }
      ],
      modalidad_dominante: 'Cardinal',
      elemento_dominante: 'Fuego'
    },
    diseno_humano: {
      tipo: 'Generador Manifestante',
      autoridad: 'Sacral',
      perfil: '6/2'
    }
  };

  if (!apiKey) {
    console.warn("Falta la API Key de HD, usando datos de prueba (fallback).");
    return mockFallback;
  }

  try {
    const response = await fetch(`${url}/bodygraph`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(birthData),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    console.warn("Error en la API de HD, usando datos de prueba (fallback).", err);
    return mockFallback;
  }
}

export function calcularDimensiones(datosBrutos: any, datosPersona: any): Record<string, number> {
  let escucha = 0;
  let accion = 0;
  let estructura = 0;
  let cuidado = 0;

  if (!datosBrutos) return { escucha: 0, accion: 0, estructura: 0, cuidado: 0 };

  const lunaSigno = datosBrutos.carta_astral_completa?.posiciones?.find((p: any) => p.planeta === 'Moon' || p.planeta === 'Luna')?.signo_nombre || '';
  const solSigno = datosBrutos.carta_astral_completa?.posiciones?.find((p: any) => p.planeta === 'Sun' || p.planeta === 'Sol')?.signo_nombre || '';
  const saturnoSigno = datosBrutos.carta_astral_completa?.posiciones?.find((p: any) => p.planeta === 'Saturn' || p.planeta === 'Saturno')?.signo_nombre || '';
  const venusSigno = datosBrutos.carta_astral_completa?.posiciones?.find((p: any) => p.planeta === 'Venus')?.signo_nombre || '';
  
  const fuego = ['Aries', 'Leo', 'Sagitario', 'Sagittarius'];
  const tierra = ['Tauro', 'Taurus', 'Virgo', 'Capricornio', 'Capricorn'];
  const aire = ['Géminis', 'Gemini', 'Libra', 'Acuario', 'Aquarius']; 
  const agua = ['Cáncer', 'Cancer', 'Escorpio', 'Scorpio', 'Piscis', 'Pisces'];

  const isFuego = (s: string) => fuego.includes(s);
  const isTierra = (s: string) => tierra.includes(s);
  const isAgua = (s: string) => agua.includes(s);

  const tipo = datosBrutos.diseno_humano?.tipo || '';
  const autoridad = datosBrutos.diseno_humano?.autoridad || '';
  const perfil = datosBrutos.diseno_humano?.perfil || '';
  const modalidad = datosBrutos.carta_astral_completa?.modalidad_dominante || '';

  // ESCUCHA (max 100):
  if (isAgua(lunaSigno) || isTierra(lunaSigno)) escucha += 30;
  if (autoridad.toLowerCase().includes('emocional') || autoridad.toLowerCase().includes('esplénica') || autoridad.toLowerCase().includes('esplenica') || autoridad.toLowerCase().includes('splenic')) escucha += 30;
  if (tipo.toLowerCase().includes('proyector') || tipo.toLowerCase().includes('reflector') || tipo.toLowerCase().includes('projector')) escucha += 25;
  if (perfil.includes('2') || perfil.includes('6')) escucha += 15;

  // ACCIÓN (max 100):
  if (isFuego(solSigno)) accion += 30;
  if (tipo.toLowerCase().includes('generador') || tipo.toLowerCase().includes('manifestador') || tipo.toLowerCase().includes('generator') || tipo.toLowerCase().includes('manifestor')) accion += 30;
  if (autoridad.toLowerCase().includes('sacral')) accion += 25;
  if (modalidad.toLowerCase().includes('cardinal')) accion += 15;

  // ESTRUCTURA (max 100):
  if (isTierra(saturnoSigno)) estructura += 30;
  if (perfil.startsWith('1') || perfil.includes('/4')) estructura += 30;
  if (modalidad.toLowerCase().includes('fija') || modalidad.toLowerCase().includes('fixed')) estructura += 25;
  if (datosPersona?.antiguedad_anos && parseFloat(datosPersona.antiguedad_anos) >= 2) estructura += 15;

  // CUIDADO (max 100):
  if (isAgua(lunaSigno)) cuidado += 30;
  if (isAgua(venusSigno) || isTierra(venusSigno)) cuidado += 25;
  if (perfil.includes('2/4') || perfil.includes('6/2') || perfil.includes('4/6')) cuidado += 25; 
  if (datosPersona?.rol_arteara && datosPersona.rol_arteara.toLowerCase().includes('cuidad')) cuidado += 20;

  return { escucha, accion, estructura, cuidado };
}

export async function saveFicha(userId: string, datosOnboarding: DatosOnboarding, existingId?: string, skipGemini: boolean = false) {
  const isUpdate = !!existingId;
  const docRefId = existingId || userId; // enforcing userId as the document id
  try {
    let latitud = datosOnboarding.latitud ? parseFloat(datosOnboarding.latitud.toString()) : 0;
    let longitud = datosOnboarding.longitud ? parseFloat(datosOnboarding.longitud.toString()) : 0;
    let timezone = datosOnboarding.timezone || 'UTC';

    // Trying backward compatibility for existing records
    if (!latitud && !longitud && datosOnboarding.lugar) {
      try {
        const parsed = JSON.parse(datosOnboarding.lugar);
        if (parsed.latitud) latitud = parsed.latitud;
        if (parsed.longitud) longitud = parsed.longitud;
        if (parsed.timezone) timezone = parsed.timezone;
        datosOnboarding.lugar = parsed.lugarNormalizado || parsed.lugar || datosOnboarding.lugar;
      } catch (e) {
        // Not a JSON string, which is fine
      }
    }
    
    // Si no tiene hora exacta, asume 00:00 y hora_aproximada = true
    const horaVal = !datosOnboarding.hora || datosOnboarding.hora.trim() === '00:00' ? '00:00' : datosOnboarding.hora;
    const isHoraAproximada = horaVal === '00:00';

    let rawData = null;
    let oldEstado = null;
    
    if (isUpdate) {
        try {
            const oldDoc = await getDoc(doc(db, 'profiles', docRefId));
            if (oldDoc.exists()) {
                oldEstado = oldDoc.data()?.estado;
            }
        } catch (e) {
            console.warn("Could not read old profile", e);
        }
    }

    let estado = oldEstado || "capa1_completa";
    
    try {
      rawData = await calcularDatosBrutos({
        fecha: datosOnboarding.fechaNacimiento,
        hora: horaVal,
        latitud,
        longitud,
        timezone
      });
    } catch (apiError) {
      console.error("Error al calcular datos HD (API fallback):", apiError);
      if (estado !== "completo") estado = "pendiente_capa1";
    }

    const datosPersona: any = {
      nombre: datosOnboarding.nombre,
      fechaNacimiento: datosOnboarding.fechaNacimiento,
      hora: horaVal,
      genero: datosOnboarding.genero,
      saberes: datosOnboarding.saberes,
      rol_arteara: datosOnboarding.rol_arteara,
      antiguedad_anos: parseFloat(datosOnboarding.antiguedad_anos as string) || 0,
      tension: datosOnboarding.tension,
      lugar: datosOnboarding.lugar,
      latitud,
      longitud,
      timezone,
      rol: datosOnboarding.rol,
      fechaLlegada: datosOnboarding.fechaLlegada,
      fechaSalida: datosOnboarding.fechaSalida,
      habilidadesVoluntario: datosOnboarding.habilidadesVoluntario,
      plataformaOrigen: datosOnboarding.plataformaOrigen,
      ...(isHoraAproximada ? { hora_aproximada: true } : {})
    };

    // Remove undefined values to prevent Firestore errors
    Object.keys(datosPersona).forEach(key => {
      if (datosPersona[key] === undefined) {
        delete datosPersona[key];
      }
    });

    let perfilVisual = (datosOnboarding as any).preview_perfilVisual || null;
    let manualMarkdown = (datosOnboarding as any).preview_manual || null;
    let fallbackToPending = false;
    let dimensiones = (datosOnboarding as any).preview_dimensiones || null;

    if (rawData && !skipGemini) {
      try {
        const { generarPerfilVisual, generarManual } = await import('./gemini');
        dimensiones = calcularDimensiones(rawData, datosPersona);
        perfilVisual = await generarPerfilVisual(rawData, datosPersona, dimensiones);
        perfilVisual.dimensiones = dimensiones;
        
        manualMarkdown = await generarManual(rawData, datosPersona, perfilVisual);
        estado = "completo";
      } catch(apiError) {
        console.error("Error al generar perfil visual o manual", apiError);
        if (estado !== "completo") estado = "pendiente_capa1";
        fallbackToPending = true;
      }
    } else if (rawData && skipGemini) {
        if (!dimensiones) {
             dimensiones = calcularDimensiones(rawData, datosPersona);
        }
        if (perfilVisual && manualMarkdown) {
            estado = "completo";
        }
    }

    const d = new Date();
    d.setMonth(d.getMonth() + 6);

    const safeDatosOnboarding = { ...datosOnboarding };
    Object.keys(safeDatosOnboarding).forEach(key => {
      if ((safeDatosOnboarding as any)[key] === undefined) {
        delete (safeDatosOnboarding as any)[key];
      }
    });

    const fichaFull: any = {
      userId,
      datosBrutos: rawData || null,
      datosPersona,
      // Keeping original for backward compatibility
      datosOnboarding: {
        ...safeDatosOnboarding,
        hora: horaVal,
        hora_aproximada: isHoraAproximada
      },
      estado,
      creadoEn: serverTimestamp(),
      updatedAt: serverTimestamp(),
    } as any;

    if (!isUpdate) {
       fichaFull.createdAt = serverTimestamp();
    }

    if (estado === "completo" && !fallbackToPending) {
        if (perfilVisual !== null) fichaFull.perfilVisual = perfilVisual;
        if (manualMarkdown !== null) {
            fichaFull.manualMarkdown = manualMarkdown;
            fichaFull.manualGenerado = manualMarkdown;
        }
        if (dimensiones !== null) fichaFull.dimensiones = dimensiones;
        fichaFull.versionManual = 1;
        fichaFull.proximaRevision = d;
    }

    function cleanUndefined(obj: any) {
      if (Array.isArray(obj)) {
        obj.forEach(cleanUndefined);
      } else if (obj !== null && typeof obj === 'object') {
        Object.keys(obj).forEach(key => {
          if (obj[key] === undefined) {
            delete obj[key];
          } else {
            cleanUndefined(obj[key]);
          }
        });
      }
    }
    
    cleanUndefined(fichaFull);

    // 1) Guardar en /profiles/{userId}
    try {
        const profileRef = doc(db, 'profiles', userId);
        await setDoc(profileRef, fichaFull, { merge: true });
    } catch (err) {
        handleFirestoreError(err, isUpdate ? OperationType.UPDATE : OperationType.CREATE, 'profiles');
        throw err;
    }

    // 2) Guardar en /community_members/{userId}
    try {
        const memberRef = doc(db, 'community_members', userId);
        await setDoc(memberRef, {
          nombre: datosPersona.nombre,
          tipo_hd: rawData?.diseno_humano?.tipo || '',
          elemento_dominante: rawData?.carta_astral_completa?.elemento_dominante || '',
          autoridad_hd: rawData?.diseno_humano?.autoridad || '',
          antiguedad_anos: datosPersona.antiguedad_anos,
          rol_arteara: datosPersona.rol_arteara,
          estado,
          creadoEn: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
    } catch (err) {
        handleFirestoreError(err, isUpdate ? OperationType.UPDATE : OperationType.CREATE, 'community_members');
        throw err;
    }

    // 3) We also keep the update in `fichas` for backwards compatibility just in case there are missing places that read it:
    try {
        const fichaRef = isUpdate ? doc(db, 'fichas', existingId) : doc(db, 'fichas', userId);
        await setDoc(fichaRef, fichaFull, { merge: true });
    } catch (err) {
        handleFirestoreError(err, isUpdate ? OperationType.UPDATE : OperationType.CREATE, 'fichas');
        throw err;
    }

    return docRefId;
  } catch (err) {
    console.error("Error outside of setDoc sections:", err);
    throw err;
  }
}

export async function saveManual(userId: string, manualGenerado: string, existingId: string) {
  try {
    const docRef = doc(db, 'fichas', existingId);
    const oldDoc = await getDoc(docRef);
    if (oldDoc.exists()) {
      const data = oldDoc.data() as Ficha;
      const prevManual = data.manualGenerado;
      const prevFecha = data.fechaGeneracion;
      
      const versionesAnteriores = data.versionesAnteriores || [];
      if (prevManual) {
        versionesAnteriores.push({
          manualGenerado: prevManual,
          fechaGeneracion: prevFecha || null
        });
      }

      await updateDoc(docRef, {
        manualGenerado: manualGenerado || null,
        fechaGeneracion: serverTimestamp(),
        versionesAnteriores,
        updatedAt: serverTimestamp()
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'fichas');
  }
}

export async function syncPendingOnboarding(userId: string) {
  const fichaData = JSON.parse(localStorage.getItem('kanarii_pendingFicha') || 'null');
  const responsesData = JSON.parse(localStorage.getItem('kanarii_pendingResponses') || '[]');

  let fichaId = null;
  if (fichaData) {
    fichaId = await saveFicha(userId, fichaData, undefined, true);
  }
  
  for (const res of responsesData) {
    try {
      await addDoc(collection(db, 'responses'), {
        userId,
        step: res.step,
        message: res.message,
        sender: res.sender,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'responses');
    }
  }

  localStorage.removeItem('kanarii_pendingFicha');
  localStorage.removeItem('kanarii_pendingResponses');
  
  return fichaId;
}

export async function saveTarea(tareaData: Partial<Tarea>, existingId?: string) {
  const isUpdate = !!existingId;
  const { deleteField } = await import('firebase/firestore');
  const cleanData = Object.fromEntries(
    Object.entries(tareaData).map(([k, v]) => [k, v === undefined && isUpdate ? deleteField() : v]).filter(([_, v]) => v !== undefined)
  );
  try {
    const docRef = isUpdate ? doc(db, 'tareas', existingId) : doc(collection(db, 'tareas'));
    if (isUpdate) {
      await updateDoc(docRef, { ...cleanData, updatedAt: serverTimestamp() });
    } else {
      await setDoc(docRef, {
        ...cleanData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, isUpdate ? OperationType.UPDATE : OperationType.CREATE, 'tareas');
  }
}

export async function updateTareaEstado(id: string, nuevoEstado: Tarea['estado'], estadoActual?: Tarea['estado']) {
  try {
    const docRef = doc(db, 'tareas', id);
    const updateData: any = { estado: nuevoEstado, updatedAt: serverTimestamp() };
    if (nuevoEstado === 'archivada' && estadoActual && estadoActual !== 'archivada') {
      updateData.estadoPrevio = estadoActual;
    }
    await updateDoc(docRef, updateData);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'tareas');
  }
}

export const getTareaNextState = (estado: Tarea['estado']): Tarea['estado'] => {
  if (estado === 'pendiente') return 'en_progreso';
  if (estado === 'en_progreso') return 'completada';
  return 'pendiente';
};

export const getTareaPrevState = (estado: Tarea['estado']): Tarea['estado'] => {
  if (estado === 'completada') return 'en_progreso';
  if (estado === 'en_progreso') return 'pendiente';
  return 'pendiente';
};

export async function obtenerTareas(): Promise<Tarea[]> {
  try {
    const q = query(collection(db, 'tareas'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tarea));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'tareas');
    return [];
  }
}

export async function deleteTarea(id: string) {
  const { deleteDoc } = await import('firebase/firestore');
  try {
    const docRef = doc(db, 'tareas', id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'tareas');
  }
}

export async function saveActa(actaData: Partial<Acta>, existingId?: string) {
  const isUpdate = !!existingId;
  const { deleteField } = await import('firebase/firestore');
  const cleanData = Object.fromEntries(
    Object.entries(actaData).map(([k, v]) => [k, v === undefined && isUpdate ? deleteField() : v]).filter(([_, v]) => v !== undefined)
  );
  try {
    const docRef = isUpdate ? doc(db, 'actas', existingId) : doc(collection(db, 'actas'));
    if (isUpdate) {
      await updateDoc(docRef, { ...cleanData, updatedAt: serverTimestamp() });
    } else {
      await setDoc(docRef, {
        ...cleanData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, isUpdate ? OperationType.UPDATE : OperationType.CREATE, 'actas');
  }
}

export async function deleteActa(id: string) {
  const { deleteDoc } = await import('firebase/firestore');
  try {
    const docRef = doc(db, 'actas', id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'actas');
  }
}

export interface AnalisisCruce {
  puntuacion: number;
  compatibilidades: string[];
  tensiones: string[];
  canalesConexion?: {
    electromagneticos: string[];
    compania: string[];
    dominancia: string[];
    compromiso: string[];
  };
}

const ALL_CHANNELS = [
  [1, 8], [2, 14], [3, 60], [4, 63], [5, 15], [6, 59], [7, 31], [9, 52],
  [10, 20], [10, 34], [10, 57], [11, 56], [12, 22], [13, 33], [16, 48],
  [17, 62], [18, 58], [19, 49], [20, 34], [20, 57], [21, 45], [23, 43],
  [24, 61], [25, 51], [26, 44], [27, 50], [28, 38], [29, 46], [30, 41],
  [32, 54], [34, 57], [35, 36], [37, 40], [39, 55], [42, 53], [47, 64]
];

export function clasificarCanales(perfil1: any, perfil2: any) {
  const result = {
    electromagneticos: [] as string[],
    compania: [] as string[],
    dominancia: [] as string[],
    compromiso: [] as string[]
  };

  const db1 = perfil1?.datosBrutos;
  const db2 = perfil2?.datosBrutos;

  if (!db1 || !db2) return result;

  const getCanales = (db: any) => Array.isArray(db?.diseno_humano?.canales) ? db.diseno_humano.canales : [];
  const getPuertas = (db: any) => {
    const pa = db?.diseno_humano?.puertas_activas;
    if (Array.isArray(pa) && pa.length > 0) return pa.map(g => Math.floor(Number(g)));
    return [];
  };

  const c1 = getCanales(db1);
  const c2 = getCanales(db2);
  const v1 = new Set(getPuertas(db1));
  const v2 = new Set(getPuertas(db2));

  const hasCanal = (canales: any[], cName: string) => canales.some(c => {
    if (typeof c === 'string') return c === cName;
    const normalizedNombre = c.nombre?.split('-').sort((a: string, b: string) => Number(a) - Number(b)).join('-');
    const normalizedPuertas = c.puertas?.slice().sort((a: number, b: number) => a - b).join('-');
    return normalizedNombre === cName || normalizedPuertas === cName;
  });
  
  const nom1 = perfil1.datosPersona?.nombre || perfil1.datosOnboarding?.nombre || 'Persona 1';
  const nom2 = perfil2.datosPersona?.nombre || perfil2.datosOnboarding?.nombre || 'Persona 2';

  for (const [pA, pB] of ALL_CHANNELS) {
    const cName = `${pA}-${pB}`;
    const inC1 = hasCanal(c1, cName);
    const inC2 = hasCanal(c2, cName);

    // 2. COMPAÑÍA
    if (inC1 && inC2) {
      result.compania.push(`Canal ${cName}: energía compartida y estable`);
      continue;
    }

    const hasP1A = v1.has(pA) || v1.has(pA.toString());
    const hasP1B = v1.has(pB) || v1.has(pB.toString());
    const hasP2A = v2.has(pA) || v2.has(pA.toString());
    const hasP2B = v2.has(pB) || v2.has(pB.toString());

    // 1. ELECTROMAGNÉTICOS
    if (!inC1 && !inC2) {
      if ((hasP1A && hasP2B) || (hasP1B && hasP2A)) {
        result.electromagneticos.push(`Canal ${cName}: crean juntos energía que ninguno tiene solo`);
      }
      continue;
    }

    // 3 & 4. DOMINANCIA / COMPROMISO desde P1 a P2
    if (inC1 && !inC2) {
      if (!hasP2A && !hasP2B) {
        result.dominancia.push(`${nom1} imprimirá la energía del canal ${cName} sobre ${nom2}`);
      } else if (hasP2A !== hasP2B) {
        result.compromiso.push(`Canal ${cName}: ${nom1} lidera, ${nom2} adapta`);
      }
    }

    // 3 & 4. DOMINANCIA / COMPROMISO desde P2 a P1
    if (inC2 && !inC1) {
      if (!hasP1A && !hasP1B) {
        result.dominancia.push(`${nom2} imprimirá la energía del canal ${cName} sobre ${nom1}`);
      } else if (hasP1A !== hasP1B) {
        result.compromiso.push(`Canal ${cName}: ${nom2} lidera, ${nom1} adapta`);
      }
    }
  }

  return result;
}

export function cruzarMiembros(perfil1: any, perfil2: any): AnalisisCruce {
  let puntuacion = 50; // base score
  const compatibilidades: string[] = [];
  const tensiones: string[] = [];

  if (!perfil1 || !perfil2) return { puntuacion: 0, compatibilidades, tensiones };

  const hd1 = perfil1.datosBrutos?.tipo_hd ? { tipo: perfil1.datosBrutos.tipo_hd, autoridad: perfil1.datosBrutos.autoridad, perfil: perfil1.datosBrutos.perfil } : null;
  const hd1Full = hd1 || perfil1.datosBrutos?.diseno_humano || (perfil1.tipo_hd ? { tipo: perfil1.tipo_hd, autoridad: perfil1.autoridad_hd } : null);
  const hd2 = perfil2.datosBrutos?.tipo_hd ? { tipo: perfil2.datosBrutos.tipo_hd, autoridad: perfil2.datosBrutos.autoridad, perfil: perfil2.datosBrutos.perfil } : null;
  const hd2Full = hd2 || perfil2.datosBrutos?.diseno_humano || (perfil2.tipo_hd ? { tipo: perfil2.tipo_hd, autoridad: perfil2.autoridad_hd } : null);
  
  const dim1 = perfil1.perfilVisual?.dimensiones || perfil1.dimensiones || perfil1.perfilVisual;
  const dim2 = perfil2.perfilVisual?.dimensiones || perfil2.dimensiones || perfil2.perfilVisual;

  // COMPATIBILIDADES
  if (hd1Full && hd2Full) {
    const tipos = [hd1Full.tipo?.toLowerCase(), hd2Full.tipo?.toLowerCase()];
    const hasProyector = tipos.some((t: string) => t?.includes('proyector') || t?.includes('projector'));
    const hasGenerador = tipos.some((t: string) => t?.includes('generador') || t?.includes('generator'));
    if (hasProyector && hasGenerador) {
      compatibilidades.push("La guía del Proyector encuentra la energía del Generador");
      puntuacion += 25;
    }

    const hasManifestador = tipos.some((t: string) => t?.includes('manifestador') || t?.includes('manifestor'));
    if (hasProyector && hasManifestador) {
      compatibilidades.push("Visión y ejecución — cuando el Manifestador informa");
      puntuacion += 20;
    }

    const hasReflector = tipos.some((t: string) => t?.includes('reflector'));
    if (hasReflector) {
      compatibilidades.push("El Reflector aporta perspectiva de entorno único");
      puntuacion += 15;
    }

    const p1 = hd1Full.perfil?.split('/')[0];
    const p2 = hd2Full.perfil?.split('/')[0];
    if (p1 && p2 && p1 === p2) {
      compatibilidades.push("Ritmo de investigación compartido");
      puntuacion += 15;
    }

    // TENSIONES
    if (tipos[0]?.includes('manifestador') && tipos[1]?.includes('manifestador') && !tipos[0]?.includes('generador') && !tipos[1]?.includes('generador')) {
      tensiones.push("Dos iniciadores — fundamental que ambos informen antes de actuar");
    }

    const auths = [hd1Full.autoridad?.toLowerCase(), hd2Full.autoridad?.toLowerCase()];
    const hasEmocional = auths.some((a: string) => a?.includes('emocional') || a?.includes('emotional'));
    const hasSacral = auths.some((a: string) => a?.includes('sacral'));
    if (hasEmocional && hasSacral) {
      tensiones.push("Tiempos de decisión muy distintos: uno necesita esperar su ola, el otro responde en el momento");
    }

    if (hd1Full.tipo && hd2Full.tipo && hd1Full.tipo === hd2Full.tipo) {
      tensiones.push("Espejo directo — pueden proyectar sus sombras mutuamente");
    }
  }

  // Dimensiones
  if (dim1 && dim2) {
    const escucha1 = dim1.escucha || 0;
    const accion1 = dim1.accion || 0;
    const escucha2 = dim2.escucha || 0;
    const accion2 = dim2.accion || 0;

    if ((escucha1 > 60 && accion2 > 60) || (escucha2 > 60 && accion1 > 60)) {
       compatibilidades.push("Roles que se equilibran: uno escucha, otro activa");
       puntuacion += 20;
    }

    const estructura1 = dim1.estructura || 0;
    const estructura2 = dim2.estructura || 0;
    if (estructura1 < 30 && estructura2 < 30) {
      tensiones.push("Posible dificultad sosteniendo acuerdos a largo plazo");
    }
  }

  puntuacion = Math.min(100, Math.max(0, puntuacion));
  
  const canalesConexion = clasificarCanales(perfil1, perfil2);

  return { puntuacion, compatibilidades, tensiones, canalesConexion };
}

export function getFichaHash(ficha: Ficha): string {
  try {
    const str = "v2" + JSON.stringify(ficha.datosBrutos || {}) + JSON.stringify(ficha.perfilVisual || {});
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).slice(0, 16);
  } catch (err) {
    console.error("Error generating hash:", err);
    return 'hash_error';
  }
}

export async function getCruce(id1: string, id2: string): Promise<any | null> {
  const sortedIds = [id1, id2].sort();
  const cruceId = `${sortedIds[0]}_${sortedIds[1]}`;
  const docRef = doc(db, 'cruces', cruceId);
  const snap = await getDoc(docRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function saveCruce(id1: string, id2: string, data: any): Promise<void> {
  const sortedIds = [id1, id2].sort();
  const cruceId = `${sortedIds[0]}_${sortedIds[1]}`;
  await setDoc(doc(db, 'cruces', cruceId), {
    ...data,
    miembro1_uid: sortedIds[0],
    miembro2_uid: sortedIds[1],
    generadoEn: serverTimestamp()
  });
}
export const SEED_DATA = [
  { nombre: "Tamarit Benchara", rol_arteara: "bioconstrucción", antiguedad_anos: 3, genero: "hombre", saberes: "FP en Carpintería, años de experiencia construyendo domos y trabajando la tierra", tension: "Siento que mis aportaciones técnicas no son valoradas igual que las decisiones del núcleo fundador", fechaNacimiento: "15/04/1990", lugar: "Gran Canaria", rol: "propietario" },
  { nombre: "Yurena Doramas", rol_arteara: "huerta y semillas", antiguedad_anos: 1, genero: "mujer", saberes: "Grado en Ciencias Ambientales, aficionada a la botánica y permacultura", tension: "Noto dificultad para decir no sin sentirme culpable por decepcionar al grupo", fechaNacimiento: "22/08/1988", lugar: "Tenerife", rol: "miembro" },
  { nombre: "Aythami Guayarmina", rol_arteara: "cuidados y espacio común", antiguedad_anos: 2, genero: "no binario", saberes: "Conocimientos autodidactas en mediación de conflictos, cocina comunitaria y terapias holísticas", tension: "Hay una dinámica de triángulos y conversaciones que no incluyen a quien afectan directamente", fechaNacimiento: "10/11/1995", lugar: "Norte de África", rol: "voluntario", fechaSalida: "2026-11-20" },
  { nombre: "Nakima Tigoraf", rol_arteara: "facilitación y sociocracia", antiguedad_anos: 4, genero: "mujer", saberes: "Psicóloga especializada en dinámicas de grupos, certificada en Sociocracia 3.0", tension: "Estoy en calma, quiero profundizar en los procesos de toma de decisiones colectivas", fechaNacimiento: "03/02/1985", lugar: "Lanzarote", rol: "voluntario", fechaSalida: "2024-01-10" },
  { nombre: "Bentor Achaman", rol_arteara: "música y ritual", antiguedad_anos: 0.5, genero: "hombre", saberes: "Músico multiinstrumentista y luthier aficionado, conectado con las tradiciones canarias", tension: "Soy recién llegado y aún no entiendo bien cómo funciona la estructura del proyecto", fechaNacimiento: "18/07/2000", lugar: "Fuerteventura", rol: "miembro" }
];

export async function ensureSeedData(appUserUid: string) {
  try {
    const q = query(collection(db, 'fichas'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ficha));
    
    const realDocs = data.filter(doc => !doc.isSeedData);
    
    if (realDocs.length < 3) {
      const promises = SEED_DATA.map(async (seed, index) => {
        const seedId = `seed-${appUserUid}-${index}`;
        const existing = data.find(d => d.id === seedId);
        
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
        }
      });
      await Promise.all(promises);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'fichas');
  }
}

/**
 * Enriquece una ficha con datos brutos de diseño humano si le faltan.
 * Se ejecuta en background sin bloquear la UI principal.
 */
export async function enrichFichaDatosBrutos(ficha: Ficha): Promise<void> {
  const dp = ficha.datosPersona || ficha.datosOnboarding;
  if (!dp?.fechaNacimiento || !dp?.latitud || !dp?.longitud) {
    console.warn('Cannot enrich ficha: missing birth data in', ficha.userId);
    return;
  }

  try {
    const raw = await calcularDatosBrutos({
      fecha: dp.fechaNacimiento,
      hora: dp.hora || '00:00',
      latitud: parseFloat(dp.latitud.toString()),
      longitud: parseFloat(dp.longitud.toString()),
      timezone: dp.timezone || 'UTC'
    });

    const profileRef = doc(db, 'profiles', ficha.userId);
    await updateDoc(profileRef, { 
      datosBrutos: raw, 
      updatedAt: serverTimestamp() 
    });
    console.log(`✅ Ficha ${ficha.userId} enriquecida con datos de la API.`);
  } catch (err) {
    console.warn('❌ Auto-enrich failed for', ficha.userId, err);
  }
}

export async function getFichaById(userId: string): Promise<Ficha | null> {
  try {
    const snap = await getDoc(doc(db, 'profiles', userId));
    if (snap.exists()) {
      return { userId, ...snap.data() } as Ficha;
    }
    return null;
  } catch (error) {
    console.error('Error fetching ficha by ID:', error);
    return null;
  }
}

export async function getComunidad(communityId: string): Promise<{ nombre: string; descripcion: string; metodologia: string } | null> {
  try {
    const snap = await getDoc(doc(db, 'comunidades', communityId));
    if (snap.exists()) return snap.data() as any;
    return null;
  } catch (error) {
    console.error('Error fetching comunidad:', error);
    return null;
  }
}

export async function ensureComunidadSeed(): Promise<void> {
  const ref = doc(db, 'comunidades', 'arteara');
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      nombre: 'Arteara',
      descripcion: 'Comunidad intencional de convivencia en Gran Canaria',
      metodologia: 'sociocracia'
    });
  }
}
