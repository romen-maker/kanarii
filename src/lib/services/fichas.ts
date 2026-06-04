import { 
  db,
  colProfiles,
  colFichas,
  DEFAULT_LIST_LIMIT,
  subscribeToCollection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  addDoc,
  limit,
  orderBy,
  collection
} from './_core';

import { Ficha, DatosOnboarding, TriadaComunitaria, FichaDatosBrutos, FichaDatosPersona, FichaPerfilVisual, FichaConfiguracion, AstroPosicion, DisenoHumanoCanal } from './_types';
import { handleFirestoreError, OperationType } from '../error-handler';
import { syncTracker } from './syncTracker';

/**
 * Escucha en tiempo real las fichas de los miembros (profiles).
 */
export function listenFichas(
  communityId: string | undefined,
  callback: (fichas: Ficha[]) => void,
  onError?: (err: Error) => void
): () => void {
  let q = query(colProfiles, limit(DEFAULT_LIST_LIMIT));
  if (communityId) {
    q = query(colProfiles, where('communityId', '==', communityId), limit(DEFAULT_LIST_LIMIT));
  }
  return subscribeToCollection(q, callback, 'profiles', onError);
}

export async function getUserFicha(userId: string): Promise<Ficha | null> {
  try {
    const docRef = doc(db, 'profiles', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Ficha;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'profiles');
    return null;
  }
}

export async function calcularDatosBrutos(birthData: { fecha: string, hora: string, latitud: number, longitud: number, timezone: string }): Promise<FichaDatosBrutos> {
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

export function calcularDimensiones(datosBrutos: FichaDatosBrutos, datosPersona: FichaDatosPersona): Record<string, number> {
  let escucha = 0;
  let accion = 0;
  let estructura = 0;
  let cuidado = 0;

  if (!datosBrutos) return { escucha: 0, accion: 0, estructura: 0, cuidado: 0 };

  const lunaSigno = datosBrutos.carta_astral_completa?.posiciones?.find((p: AstroPosicion) => p.planeta === 'Moon' || p.planeta === 'Luna')?.signo_nombre || '';
  const solSigno = datosBrutos.carta_astral_completa?.posiciones?.find((p: AstroPosicion) => p.planeta === 'Sun' || p.planeta === 'Sol')?.signo_nombre || '';
  const saturnoSigno = datosBrutos.carta_astral_completa?.posiciones?.find((p: AstroPosicion) => p.planeta === 'Saturn' || p.planeta === 'Saturno')?.signo_nombre || '';
  const venusSigno = datosBrutos.carta_astral_completa?.posiciones?.find((p: AstroPosicion) => p.planeta === 'Venus')?.signo_nombre || '';
  
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
  if (datosPersona?.antiguedad_anos && datosPersona.antiguedad_anos >= 2) estructura += 15;

  // CUIDADO (max 100):
  if (isAgua(lunaSigno)) cuidado += 30;
  if (isAgua(venusSigno) || isTierra(venusSigno)) cuidado += 25;
  if (perfil.includes('2/4') || perfil.includes('6/2') || perfil.includes('4/6')) cuidado += 25; 
  if (datosPersona?.rol_comunidad && datosPersona.rol_comunidad.toLowerCase().includes('cuidad')) cuidado += 20;

  return { escucha, accion, estructura, cuidado };
}

export async function saveFicha(userId: string, datosOnboarding: DatosOnboarding, existingId?: string, skipGemini: boolean = false, triada?: TriadaComunitaria) {
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

    const datosPersona: FichaDatosPersona = {
      nombre: datosOnboarding.nombre,
      fechaNacimiento: datosOnboarding.fechaNacimiento,
      hora: horaVal,
      genero: datosOnboarding.genero,
      saberes: datosOnboarding.saberes,
      rol_comunidad: datosOnboarding.rol_comunidad || (datosOnboarding as any).rol_arteara,
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
    const recordPersona = datosPersona as Record<string, any>;
    Object.keys(recordPersona).forEach(key => {
      if (recordPersona[key] === undefined) {
        delete recordPersona[key];
      }
    });

    let perfilVisual: FichaPerfilVisual | null = (datosOnboarding as any).preview_perfilVisual || null;
    let manualMarkdown: string | null = (datosOnboarding as any).preview_manual || null;
    let fallbackToPending = false;
    let dimensiones: Record<string, number> | null = (datosOnboarding as any).preview_dimensiones || null;

    if (rawData && !skipGemini) {
      try {
        const { generarPerfilVisual, generarManual } = await import('../gemini');
        const calculatedDims = calcularDimensiones(rawData, datosPersona);
        dimensiones = calculatedDims;
        perfilVisual = await generarPerfilVisual(rawData, datosPersona, calculatedDims);
        perfilVisual.dimensiones = {
          escucha: calculatedDims.escucha || 0,
          accion: calculatedDims.accion || 0,
          estructura: calculatedDims.estructura || 0,
          cuidado: calculatedDims.cuidado || 0
        };
        
        manualMarkdown = await generarManual(rawData, datosPersona, perfilVisual, undefined);
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
    const recordOnboarding = safeDatosOnboarding as Record<string, any>;
    Object.keys(recordOnboarding).forEach(key => {
      if (recordOnboarding[key] === undefined) {
        delete recordOnboarding[key];
      }
    });

    const fichaFull: Ficha = {
      userId,
      datosBrutos: rawData || undefined,
      datosPersona,
      // Keeping original for backward compatibility
      datosOnboarding: {
        ...safeDatosOnboarding,
        hora: horaVal,
        hora_aproximada: isHoraAproximada
      },
      ...(triada !== undefined && triada !== null ? { triada } : {}),
      estado,
      creadoEn: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (!isUpdate) {
       fichaFull.createdAt = serverTimestamp();
    }

    if (estado === "completo" && !fallbackToPending) {
        if (perfilVisual !== null) fichaFull.perfilVisual = perfilVisual;
        if (manualMarkdown !== null) {
            fichaFull.manualGenerado = manualMarkdown;
            fichaFull.manualMarkdown = manualMarkdown;
        }
        if (dimensiones !== null) {
            fichaFull.dimensiones = {
              escucha: dimensiones.escucha || 0,
              accion: dimensiones.accion || 0,
              estructura: dimensiones.estructura || 0,
              cuidado: dimensiones.cuidado || 0
            };
        }
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

    // 1 & 2) Guardar en /profiles y /community_members
    await _writeFichaRaw(userId, fichaFull, isUpdate);
    
    return userId;
  } catch (err) {
    console.error("Critical error in saveFicha:", err);
    throw err;
  }
}

/**
 * Función interna de escritura directa a Firestore.
 * Evita duplicar lógica entre guardado normal y migración desde pendiente.
 */
export async function _writeFichaRaw(userId: string, fichaFull: Ficha, isUpdate: boolean = true) {
  return syncTracker.trackWrite((async () => {
    // Intentar resolver communityId de forma inteligente si no viene explícito (ej: tras onboarding)
    let commId = fichaFull.communityId || fichaFull.datosOnboarding?.communityId || fichaFull.datosPersona?.communityId || null;
    
    if (!commId) {
      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          commId = userData.communityId || (userData.communityIds && userData.communityIds[0]) || null;
        }
      } catch (err) {
        console.error("Error al recuperar communityId del usuario:", err);
      }
    }

    // Sincronizar el communityId resuelto en la estructura de la ficha para mantener coherencia en profiles y fichas
    if (commId) {
      fichaFull.communityId = commId;
      if (fichaFull.datosOnboarding) fichaFull.datosOnboarding.communityId = commId;
      if (fichaFull.datosPersona) fichaFull.datosPersona.communityId = commId;
    }

    // 1) Guardar en /profiles/{userId}
    try {
      const profileRef = doc(db, 'profiles', userId);
      const finalData = {
        ...fichaFull,
        updatedAt: serverTimestamp(),
        ...(isUpdate ? {} : { createdAt: serverTimestamp() })
      };
      await setDoc(profileRef, finalData, { merge: true });
    } catch (err) {
      handleFirestoreError(err, isUpdate ? OperationType.UPDATE : OperationType.CREATE, 'profiles');
      throw err;
    }

    // 2) Sincronizar en /users/{userId} y propagar en batch a /community_members/{communityId}_{userId}
    const hasProfileData = !!(
      fichaFull.datosPersona?.nombre ||
      fichaFull.datosOnboarding?.nombre ||
      fichaFull.nombre
    );
    const resolvedDisplayName = fichaFull.datosPersona?.nombre || fichaFull.nombre || fichaFull.datosOnboarding?.nombre || '';

    let userEmail = '';
    let userPhotoURL = '';
    let communityIds: string[] = [];

    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const ud = userDocSnap.data();
        userPhotoURL = ud.photoURL || '';
        userEmail = ud.email || '';
        communityIds = ud.communityIds || [];
        if (!communityIds.length && ud.communityId) {
          communityIds = [ud.communityId];
        }
      }
    } catch (err) {
      console.error("Error al recuperar info del usuario en _writeFichaRaw:", err);
    }

    // Buscar todos los community_members de este usuario para asegurar propagación a todas las membresías reales
    try {
      const q = query(collection(db, 'community_members'), where('userId', '==', userId));
      const querySnap = await getDocs(q);
      const queriedCommunityIds = querySnap.docs.map(docSnap => docSnap.data().communityId).filter(Boolean);
      
      for (const cId of queriedCommunityIds) {
        if (!communityIds.includes(cId)) {
          communityIds.push(cId);
        }
      }
    } catch (err) {
      console.error("Error al buscar community_members en _writeFichaRaw:", err);
    }

    // Actualizar el documento del usuario con displayName y el flag hasFicha
    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, {
        ...(hasProfileData && resolvedDisplayName ? { displayName: resolvedDisplayName } : {}),
        hasFicha: true,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Error al actualizar /users/{userId}:", err);
    }

    // Si el commId actual no está en la lista de communityIds, añadirlo
    if (commId && !communityIds.includes(commId)) {
      communityIds.push(commId);
    }

    // Propagar en batch a todos los documentos de membresía del usuario
    if (communityIds.length > 0) {
      try {
        const batch = writeBatch(db);
        const base = (fichaFull.datosPersona || fichaFull.datosOnboarding || {}) as Partial<FichaDatosPersona>;

        for (const cId of communityIds) {
          const memberRef = doc(db, 'community_members', `${cId}_${userId}`);
          batch.set(memberRef, {
            userId,
            communityId: cId,
            ...(hasProfileData && resolvedDisplayName
              ? { nombre: resolvedDisplayName, displayName: resolvedDisplayName }
              : {}),
            tipo_hd: fichaFull.datosBrutos?.diseno_humano?.tipo || '',
            elemento_dominante: fichaFull.datosBrutos?.carta_astral_completa?.elemento_dominante || '',
            autoridad_hd: fichaFull.datosBrutos?.diseno_humano?.autoridad || '',
            antiguedad_anos: base.antiguedad_anos || 0,
            rol_comunidad: base.rol_comunidad || '',
            rolComunitario: base.rol_comunidad || base.rol || 'miembro',
            rol: base.rol || 'miembro',
            estado: fichaFull.estado || 'activo',
            ...(fichaFull.triada !== undefined && fichaFull.triada !== null ? { triada: fichaFull.triada } : {}),
            photoURL: userPhotoURL,
            email: userEmail,
            creadoEn: fichaFull.createdAt || serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true });
        }

        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, 'community_members_batch');
      }
    }

    // 3) Mantener en /fichas para compatibilidad hacia atrás
    try {
      const fichaRef = doc(db, 'fichas', userId);
      await setDoc(fichaRef, fichaFull, { merge: true });
    } catch (err) {
      handleFirestoreError(err, isUpdate ? OperationType.UPDATE : OperationType.CREATE, 'fichas');
    }
  })());
}

/**
 * Persiste temporalmente la ficha en Firestore antes de enviar el Magic Link.
 * Esto permite que el usuario recupere su progreso si abre el link en otro dispositivo.
 */
export async function guardarFichaPendiente(email: string, ficha: Partial<Ficha>): Promise<void> {
  if (!email || !ficha) return;
  
  return syncTracker.trackWrite((async () => {
    try {
      const docRef = doc(db, 'fichas_pendientes', email.toLowerCase().trim());
      await setDoc(docRef, {
        ...ficha,
        email: email.toLowerCase().trim(),
        creadoEn: serverTimestamp(),
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
      });
    } catch (err) {
      console.error("Error al guardar ficha pendiente:", err);
      throw err;
    }
  })());
}

/**
 * Migra una ficha desde /fichas_pendientes a /profiles/{uid} de forma directa.
 * Se usa tras un login exitoso por Magic Link.
 */
export async function migrarFichaPendiente(email: string, uid: string): Promise<boolean> {
  if (!email || !uid) return false;
  
  try {
    const pendingRef = doc(db, 'fichas_pendientes', email.toLowerCase().trim());
    const snap = await getDoc(pendingRef);
    
    if (snap.exists()) {
      const data = snap.data();
      
      if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
        console.log(`🧹 Limpiando ficha pendiente caducada para ${email}`);
        await deleteDoc(pendingRef);
        return false;
      }
      
      const fichaMigrada: Ficha = {
        ...data,
        userId: uid,
        datosOnboarding: data.datosOnboarding || {},
        updatedAt: serverTimestamp()
      } as Ficha;

      if (data.preview_manual) {
        fichaMigrada.manualGenerado = data.preview_manual;
        fichaMigrada.manualMarkdown = data.preview_manual;
      }
      
      if (data.preview_perfilVisual) {
        fichaMigrada.perfilVisual = data.preview_perfilVisual;
      }

      if (data.preview_dimensiones) {
        fichaMigrada.dimensiones = data.preview_dimensiones;
      }

      await _writeFichaRaw(uid, fichaMigrada, false);
      await deleteDoc(pendingRef);
      return true;
    }
  } catch (err) {
    console.error("Error al migrar ficha pendiente:", err);
  }
  
  return false;
}

export async function saveManual(userId: string, manualGenerado: string, existingId: string) {
  return syncTracker.trackWrite((async () => {
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

        try {
          const profileRef = doc(db, 'profiles', userId);
          await setDoc(profileRef, {
            manualGenerado: manualGenerado || null,
            manualMarkdown: manualGenerado || null,
            fechaGeneracion: serverTimestamp(),
            updatedAt: serverTimestamp(),
            versionesAnteriores
          }, { merge: true });
        } catch (e) {
          console.warn('saveManual: no se pudo actualizar /profiles', e);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'fichas');
      throw err;
    }
  })());
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

export function clasificarCanales(perfil1: Ficha, perfil2: Ficha) {
  const result = {
    electromagneticos: [] as string[],
    compania: [] as string[],
    dominancia: [] as string[],
    compromiso: [] as string[]
  };

  const db1 = perfil1?.datosBrutos;
  const db2 = perfil2?.datosBrutos;

  if (!db1 || !db2) return result;

  const getCanales = (db: FichaDatosBrutos | null | undefined): DisenoHumanoCanal[] => 
    Array.isArray(db?.diseno_humano?.canales) ? db.diseno_humano.canales : [];
    
  const getPuertas = (db: FichaDatosBrutos | null | undefined): number[] => {
    const pa = db?.diseno_humano?.puertas_activas;
    if (Array.isArray(pa) && pa.length > 0) return pa.map(g => Math.floor(Number(g)));
    return [];
  };

  const c1 = getCanales(db1);
  const c2 = getCanales(db2);
  const v1 = new Set(getPuertas(db1));
  const v2 = new Set(getPuertas(db2));

  const hasCanal = (canales: DisenoHumanoCanal[], cName: string) => canales.some(c => {
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

    const pANum = Number(pA);
    const pBNum = Number(pB);
    const hasP1A = v1.has(pANum) || v1.has(pA as any);
    const hasP1B = v1.has(pBNum) || v1.has(pB as any);
    const hasP2A = v2.has(pANum) || v2.has(pA as any);
    const hasP2B = v2.has(pBNum) || v2.has(pB as any);

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

export function cruzarMiembros(perfil1: Ficha, perfil2: Ficha): AnalisisCruce {
  let puntuacion = 50; // base score
  const compatibilidades: string[] = [];
  const tensiones: string[] = [];

  if (!perfil1 || !perfil2) return { puntuacion: 0, compatibilidades, tensiones };

  const db1 = perfil1.datosBrutos;
  const db2 = perfil2.datosBrutos;
  const p1Any = perfil1 as any;
  const p2Any = perfil2 as any;

  const hd1 = db1?.diseno_humano ? { tipo: db1.diseno_humano.tipo, autoridad: db1.diseno_humano.autoridad, perfil: db1.diseno_humano.perfil } : null;
  const hd1Full = hd1 || db1?.diseno_humano || (p1Any.tipo_hd ? { tipo: p1Any.tipo_hd, autoridad: p1Any.autoridad_hd, perfil: p1Any.perfil_hd } : null);
  const hd2 = db2?.diseno_humano ? { tipo: db2.diseno_humano.tipo, autoridad: db2.diseno_humano.autoridad, perfil: db2.diseno_humano.perfil } : null;
  const hd2Full = hd2 || db2?.diseno_humano || (p2Any.tipo_hd ? { tipo: p2Any.tipo_hd, autoridad: p2Any.autoridad_hd, perfil: p2Any.perfil_hd } : null);
  
  const getDimensiones = (ficha: Ficha) => {
    if (ficha.perfilVisual?.dimensiones) return ficha.perfilVisual.dimensiones;
    if (ficha.dimensiones) return ficha.dimensiones;
    const pv = ficha.perfilVisual as any;
    if (pv && typeof pv === 'object' && 'escucha' in pv) {
      return pv as { escucha?: number; accion?: number; estructura?: number; cuidado?: number };
    }
    return null;
  };

  const dim1 = getDimensiones(perfil1);
  const dim2 = getDimensiones(perfil2);

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
  { nombre: "Tamarit Benchara", rol_comunidad: "bioconstrucción", antiguedad_anos: 3, genero: "hombre", saberes: "FP en Carpintería, años de experiencia construyendo domos y trabajando la tierra", tension: "Siento que mis aportaciones técnicas no son valoradas igual que las decisiones del núcleo fundador", fechaNacimiento: "15/04/1990", lugar: "Gran Canaria", rol: "propietario" },
  { nombre: "Yurena Doramas", rol_comunidad: "huerta y semillas", antiguedad_anos: 1, genero: "mujer", saberes: "Grado en Ciencias Ambientales, aficionada a la botánica y permacultura", tension: "Noto dificultad para decir no sin sentirme culpable por decepcionar al grupo", fechaNacimiento: "22/08/1988", lugar: "Tenerife", rol: "miembro" },
  { nombre: "Aythami Guayarmina", rol_comunidad: "cuidados y espacio común", antiguedad_anos: 2, genero: "no binario", saberes: "Conocimientos autodidactas en mediación de conflictos, cocina comunitaria y terapias holísticas", tension: "Hay una dinámica de triángulos y conversaciones que no incluyen a quien afectan directamente", fechaNacimiento: "10/11/1995", lugar: "Norte de África", rol: "voluntario", fechaSalida: "2026-11-20" },
  { nombre: "Nakima Tigoraf", rol_comunidad: "facilitación y sociocracia", antiguedad_anos: 4, genero: "mujer", saberes: "Psicóloga especializada en dinámicas de grupos, certificada en Sociocracia 3.0", tension: "Estoy en calma, quiero profundizar en los procesos de toma de decisiones colectivas", fechaNacimiento: "03/02/1985", lugar: "Lanzarote", rol: "voluntario", fechaSalida: "2024-01-10" },
  { nombre: "Bentor Achaman", rol_comunidad: "música y ritual", antiguedad_anos: 0.5, genero: "hombre", saberes: "Músico multiinstrumentista y luthier aficionado, conectado con las tradiciones canarias", tension: "Soy recién llegado y aún no entiendo bien cómo funciona la estructura del proyecto", fechaNacimiento: "18/07/2000", lugar: "Fuerteventura", rol: "miembro" }
];

export async function ensureSeedData(appUserUid: string) {
  try {
    const q = query(collection(db, 'profiles'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    
    const realDocs = data.filter((doc: any) => !doc.isSeedData && !doc.id.startsWith('seed-'));
    
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
              rol_comunidad: seed.rol_comunidad,
              antiguedad_anos: seed.antiguedad_anos,
              tension: seed.tension,
              rol: seed.rol as "voluntario" | "miembro" | "propietario",
              fechaSalida: seed.fechaSalida,
              communityId: 'arteara'
            },
            datosPersona: {
              nombre: seed.nombre,
              fechaNacimiento: seed.fechaNacimiento,
              hora: "12:00",
              lugar: seed.lugar,
              genero: seed.genero,
              saberes: seed.saberes,
              rol_comunidad: seed.rol_comunidad,
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
            communityId: 'arteara', // TODO: usar communityId dinámico
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          await _writeFichaRaw(seedId, seedFicha, false);
        }
      });
      await Promise.all(promises);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'profiles');
  }
}

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
  return getUserFicha(userId);
}
