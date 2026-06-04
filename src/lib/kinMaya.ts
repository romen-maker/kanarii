/**
 * kinMaya.ts
 * Cálculo del Kin Maya (Calendario Dreamspell / Tzolkin 260)
 * Basado en el sistema de José Argüelles / 13lunas.net
 *
 * La fórmula es determinista: dado cualquier fecha gregoriana,
 * devuelve el Kin personal o el Kin del día actual.
 * No requiere API externa.
 */

// ─── Constantes del Tzolkin ──────────────────────────────────────────────────

export const SELLOS: string[] = [
  'Dragón',              // 0  - Imix      - Rojo
  'Viento',              // 1  - Ik        - Blanco
  'Noche',               // 2  - Akbal     - Azul
  'Semilla',             // 3  - Kan       - Amarillo
  'Serpiente',           // 4  - Chicchan  - Rojo
  'Enlazador de Mundos', // 5  - Cimi      - Blanco
  'Mano',                // 6  - Manik     - Azul
  'Estrella',            // 7  - Lamat     - Amarillo
  'Luna',                // 8  - Muluc     - Rojo
  'Perro',               // 9  - Oc        - Blanco
  'Mono',                // 10 - Chuen     - Azul
  'Humano',              // 11 - Eb        - Amarillo
  'Caminante del Cielo', // 12 - Ben       - Rojo
  'Mago',                // 13 - Ix        - Blanco
  'Águila',              // 14 - Men       - Azul
  'Guerrero',            // 15 - Cib       - Amarillo
  'Tierra',              // 16 - Caban     - Rojo
  'Espejo',              // 17 - Etznab    - Blanco
  'Tormenta',            // 18 - Cauac     - Azul
  'Sol',                 // 19 - Ahau      - Amarillo
];

export const TONOS: string[] = [
  'Magnético',    // 1
  'Lunar',        // 2
  'Eléctrico',    // 3
  'Autoexistente',// 4
  'Armónico',     // 5
  'Rítmico',      // 6
  'Resonante',    // 7
  'Galáctico',    // 8
  'Solar',        // 9
  'Planetario',   // 10
  'Espectral',    // 11
  'Cristal',      // 12
  'Cósmico',      // 13
];

// Colores siguen el patrón cíclico: Rojo, Blanco, Azul, Amarillo (selloIndex % 4)
export const COLORES: string[] = ['Rojo', 'Blanco', 'Azul', 'Amarillo'];

// Emojis representativos por sello (orden idéntico a SELLOS)
export const EMOJIS_SELLO: string[] = [
  '🐉', '💨', '🌙', '🌱', '🐍',
  '💀', '✋', '⭐', '🌊', '🐕',
  '🐒', '👤', '🚶', '🔮', '🦅',
  '⚔️', '🌍', '🪞', '⛈️', '☀️',
];

// Rol comunitario por sello — enfocado en convivencia, S3 y psicología de grupo
export const ROL_COMUNITARIO: Record<string, string> = {
  'Dragón':              'Nutre y sostiene el origen. Cuida el hogar y los recursos compartidos.',
  'Viento':              'Oxigena los procesos. Comunica, conecta y transmite el espíritu del grupo.',
  'Noche':               'Guarda la abundancia interior. Sueña y planifica desde la profundidad.',
  'Semilla':             'Siembra intención. Activa el potencial latente de cada proyecto colectivo.',
  'Serpiente':           'Encarna la fuerza vital. Mueve la energía cuando el grupo se estanca.',
  'Enlazador de Mundos': 'Facilita los cambios y transiciones. Ayuda a soltar lo que ya cumplió su ciclo.',
  'Mano':                'Ejecuta y sana. Convierte visiones colectivas en acciones concretas.',
  'Estrella':            'Aporta belleza y armonía. Inspira la estética y el cuidado del espacio compartido.',
  'Luna':                'Sostiene el flujo emocional del grupo. Purifica y reorienta la energía colectiva.',
  'Perro':               'Teje fidelidad y amor incondicional. Sostiene los vínculos de la comunidad.',
  'Mono':                'Activa el juego y la creatividad. Disuelve la seriedad con humor y arte.',
  'Humano':              'Porta la sabiduría acumulada. Guía desde la experiencia vivida.',
  'Caminante del Cielo': 'Explora nuevos horizontes. Trae perspectivas externas que enriquecen al grupo.',
  'Mago':                'Trabaja con el tiempo y la intención. Alinea propósito con acción sin esfuerzo.',
  'Águila':              'Ve el panorama completo. Aporta visión estratégica y perspectiva de largo plazo.',
  'Guerrero':            'Cuestiona con valentía. Defiende la integridad de los acuerdos comunitarios.',
  'Tierra':              'Navega y sincroniza. Conecta la comunidad con los ciclos de la naturaleza.',
  'Espejo':              'Refleja la verdad sin juicio. Aporta claridad y orden cuando hay confusión.',
  'Tormenta':            'Cataliza la transformación. Mueve con potencia lo que necesita cambiar.',
  'Sol':                 'Ilumina y eleva. Celebra la conciencia compartida y el florecimiento del grupo.',
};

// ─── Tipo de retorno ──────────────────────────────────────────────────────────

export interface KinData {
  kin: number;              // 1–260
  tono: number;             // 1–13
  nombreTono: string;
  sello: string;
  color: string;
  emoji: string;
  rolComunitario: string;
  descripcionCorta: string; // "Kin 144 · Tormenta Eléctrica Azul"
  descripcionLarga: string; // Bloque listo para inyectar en el prompt de Gemini
}

// ─── Función principal ────────────────────────────────────────────────────────

/**
 * Punto de inicio del ciclo Dreamspell: 26 de julio de 1987
 * (Convergencia Armónica, según José Argüelles)
 */
const INICIO_DREAMSPELL_UTC = Date.UTC(1987, 6, 3);  // 3 jul 1987 — Kin 1

/**
 * Calcula el Kin Maya para cualquier fecha.
 * @param fecha  string 'YYYY-MM-DD', objeto Date, o null/undefined para usar hoy
 */
export function calcularKin(fecha?: string | Date | null): KinData {
  let fechaUTC: number;

  if (!fecha) {
    const hoy = new Date();
    fechaUTC = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  } else if (typeof fecha === 'string') {
    // Parseamos en UTC explícito para evitar desfases de zona horaria
    const [year, month, day] = fecha.split('-').map(Number);
    fechaUTC = Date.UTC(year, month - 1, day);
  } else {
    fechaUTC = Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  }

  const diffDias = Math.floor((fechaUTC - INICIO_DREAMSPELL_UTC) / (1000 * 60 * 60 * 24));

  // El módulo puede dar negativo en JS si diffDias < 0 — lo normalizamos siempre
  const kinIndex = ((diffDias % 260) + 260) % 260;
  const kinNum = kinIndex + 1; // Kin va de 1 a 260

  const tonoIndex = kinIndex % 13;
  const selloIndex = kinIndex % 20;
  const colorIndex = selloIndex % 4;

  const sello = SELLOS[selloIndex];
  const tono = tonoIndex + 1;
  const color = COLORES[colorIndex];
  const nombreTono = TONOS[tonoIndex];
  const emoji = EMOJIS_SELLO[selloIndex];
  const rolComunitario = ROL_COMUNITARIO[sello];

  return {
    kin: kinNum,
    tono,
    nombreTono,
    sello,
    color,
    emoji,
    rolComunitario,
    descripcionCorta: `Kin ${kinNum} · ${nombreTono} ${sello} ${color}`,
    descripcionLarga: `Kin Maya (Calendario Dreamspell / Tzolkin 260):
- Número de Kin: ${kinNum}
- Sello Solar: ${sello} ${emoji} — Color: ${color}
- Tono Galáctico: ${tono} (${nombreTono})
- Rol natural en comunidad: ${rolComunitario}`,
  };
}

/**
 * Devuelve el Kin del día actual.
 * Usar en el widget del CalendarioView.
 */
export function kinDeHoy(): KinData {
  return calcularKin(new Date());
}
