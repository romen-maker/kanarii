import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Ficha, PRIVACIDAD_DEFAULT } from './services/_types';
import { calcularKin } from './kinMaya';

export async function sincronizarPasaporte(
  ficha: Ficha,
  uid: string,
  displayName?: string,
  photoURL?: string
): Promise<void> {
  if (!uid) return;

  const privacidad = ficha.privacidad || PRIVACIDAD_DEFAULT;
  const birthDate = ficha.datosPersona?.fechaNacimiento || ficha.datosOnboarding?.fechaNacimiento || '';

  const passportData: any = {
    uid,
    nombre: displayName || ficha.datosPersona?.nombre || ficha.nombre || ficha.datosOnboarding?.nombre || 'Miembro',
    photoURL: photoURL || '',
    communityId: ficha.communityId || null,
    privacidad,
    updatedAt: serverTimestamp(),
  };

  // 1. Arquetipo / Perfil Visual
  if (privacidad.arquetipo && ficha.perfilVisual) {
    passportData.arquetipo = {
      arquetipo: ficha.perfilVisual.arquetipo || '',
      descripcion_arquetipo: ficha.perfilVisual.descripcion_arquetipo || '',
      fortalezas: ficha.perfilVisual.fortalezas || [],
      sombras: ficha.perfilVisual.sombras || [],
      aportaComunidad: ficha.perfilVisual.aportaComunidad || [],
      necesitaComunidad: ficha.perfilVisual.necesitaComunidad || [],
      rol_sociocratico: ficha.perfilVisual.rol_sociocratico || '',
      justificacion_rol: ficha.perfilVisual.justificacion_rol || '',
    };
  }

  // 2. Diseño Humano
  if (privacidad.disenoHumano && ficha.datosBrutos?.diseno_humano) {
    passportData.disenoHumano = {
      tipo: ficha.datosBrutos.diseno_humano.tipo || '',
      autoridad: ficha.datosBrutos.diseno_humano.autoridad || '',
      perfil: ficha.datosBrutos.diseno_humano.perfil || '',
    };
  }

  // 3. Kin Maya
  if (privacidad.kinMaya && birthDate) {
    try {
      const kin = calcularKin(birthDate);
      if (kin) {
        passportData.kinMaya = {
          kin: kin.kin,
          sello: kin.sello,
          nombreTono: kin.nombreTono,
          emoji: kin.emoji,
          descripcionCorta: kin.descripcionCorta,
          rolComunitario: kin.rolComunitario,
        };
      }
    } catch (err) {
      console.error('Error al calcular Kin Maya para el pasaporte:', err);
    }
  }

  // 4. Datos Astrológicos
  if (privacidad.datosAstrologicos && ficha.datosBrutos?.carta_astral_completa) {
    const posiciones = ficha.datosBrutos.carta_astral_completa.posiciones || [];
    const sol = posiciones.find((p: any) => p.planeta === 'Sun' || p.planeta === 'Sol')?.signo_nombre || '';
    const luna = posiciones.find((p: any) => p.planeta === 'Moon' || p.planeta === 'Luna')?.signo_nombre || '';
    const asc = posiciones.find((p: any) => p.planeta === 'Ascendant' || p.planeta === 'Ascendente')?.signo_nombre || '';

    passportData.datosAstrologicos = {
      signoSol: sol,
      signoLuna: luna,
      signoAscendente: asc,
      elementoDominante: ficha.datosBrutos.carta_astral_completa.elemento_dominante || '',
      modalidadDominante: ficha.datosBrutos.carta_astral_completa.modalidad_dominante || '',
    };
  }

  // 5. Manual Completo (Modular o Monolítico)
  if (privacidad.manualCompleto) {
    if (ficha.manualGenerado) {
      passportData.manualCompleto = {
        manualGenerado: ficha.manualGenerado
      };
    } else if (ficha.resumenManual?.secciones) {
      const { normalizarSecciones } = await import('./manualNormalizer');
      const secciones = normalizarSecciones(ficha);
      const manualReconstruido = secciones
        .filter(s => s.contenido)
        .map(s => `## ${s.icono} ${s.label}\n\n${s.contenido}`)
        .join('\n\n');

      passportData.manualCompleto = {
        manualGenerado: manualReconstruido
      };
    }
  }

  // Escribir en Firestore
  const pasaporteRef = doc(db, 'pasaportes', uid);
  await setDoc(pasaporteRef, passportData, { merge: true });
}
