import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, serverTimestamp, orderBy, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './error-handler';

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

    const datosPersona = {
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
      ...(isHoraAproximada ? { hora_aproximada: true } : {})
    };

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

    const fichaFull: any = {
      userId,
      datosBrutos: rawData || null,
      datosPersona,
      // Keeping original for backward compatibility
      datosOnboarding: {
        ...datosOnboarding,
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
          fechaGeneracion: prevFecha
        });
      }

      await updateDoc(docRef, {
        manualGenerado,
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
