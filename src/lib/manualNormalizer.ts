// src/lib/manualNormalizer.ts

export type SeccionId =
  | 'adn_astral'
  | 'anatomia_poder'
  | 'espejo_tribu'
  | 'sintonia_cnv'
  | 'mantenimiento_crisis';

export interface Seccion {
  id: SeccionId;
  label: string;
  icono: string;
  contenido: string | null; // null = pendiente de generar
}

export const SECCIONES_META: { id: SeccionId; label: string; icono: string }[] = [
  { id: 'adn_astral', label: 'ADN Astral', icono: '✨' },
  { id: 'anatomia_poder', label: 'Anatomía del Poder', icono: '👑' },
  { id: 'espejo_tribu', label: 'Espejo de la Tribu', icono: '👥' },
  { id: 'sintonia_cnv', label: 'Sintonía (CNV)', icono: '💬' },
  { id: 'mantenimiento_crisis', label: 'Mantenimiento y Crisis', icono: '🚨' }
];

export function normalizarSecciones(ficha: {
  resumenManual?: { secciones?: Partial<Record<SeccionId, { narrativa: string }>> } | null;
  manualGenerado?: string | null;
}): Seccion[] {
  const modular = ficha?.resumenManual?.secciones;

  // MODO MODULAR: secciones ya existen en Firestore
  if (modular && Object.keys(modular).length > 0) {
    return SECCIONES_META.map(meta => ({
      ...meta,
      contenido: modular[meta.id]?.narrativa ?? null,
    }));
  }

  // MODO LEGACY: parsear manualGenerado con regex
  if (ficha?.manualGenerado) {
    const reg1 = /(?:^|\n)[\s#\*]*1\.\s+/;
    const reg2 = /(?:^|\n)[\s#\*]*2\.\s+/;
    const reg3 = /(?:^|\n)[\s#\*]*3\.\s+/;
    const reg4 = /(?:^|\n)[\s#\*]*4\.\s+/;
    const reg5 = /(?:^|\n)[\s#\*]*5\.\s+/;

    const m1 = ficha.manualGenerado.match(reg1);
    const m2 = ficha.manualGenerado.match(reg2);
    const m3 = ficha.manualGenerado.match(reg3);
    const m4 = ficha.manualGenerado.match(reg4);
    const m5 = ficha.manualGenerado.match(reg5);

    if (m1 && m2 && m3 && m4 && m5) {
      const idx1 = m1.index! + (m1[0].startsWith('\n') ? 1 : 0);
      const idx2 = m2.index! + (m2[0].startsWith('\n') ? 1 : 0);
      const idx3 = m3.index! + (m3[0].startsWith('\n') ? 1 : 0);
      const idx4 = m4.index! + (m4[0].startsWith('\n') ? 1 : 0);
      const idx5 = m5.index! + (m5[0].startsWith('\n') ? 1 : 0);

      if (idx1 < idx2 && idx2 < idx3 && idx3 < idx4 && idx4 < idx5) {
        const intro = ficha.manualGenerado.substring(0, idx1).trim();
        const sec1 = ficha.manualGenerado.substring(idx1, idx2).trim();
        const sec2 = ficha.manualGenerado.substring(idx2, idx3).trim();
        const sec3 = ficha.manualGenerado.substring(idx3, idx4).trim();
        const sec4 = ficha.manualGenerado.substring(idx4, idx5).trim();
        const sec5 = ficha.manualGenerado.substring(idx5).trim();

        const parsedArray = [
          intro ? `${intro}\n\n${sec1}` : sec1,
          sec2,
          sec3,
          sec4,
          sec5
        ];

        return SECCIONES_META.map((meta, idx) => ({
          ...meta,
          contenido: parsedArray[idx] || null
        }));
      }
    }
  }

  // SIN DATOS: todas las secciones como null (se generarán lazy)
  return SECCIONES_META.map(meta => ({ ...meta, contenido: null }));
}
