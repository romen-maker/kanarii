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
  tonoIndex: number;        // 0–12
  selloIndex: number;       // 0–19
  colorIndex: number;       // 0–3
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
 * Punto de inicio del ciclo Dreamspell: 23 de junio de 1987
 * (Para que el 26 de julio de 1987 sea Kin 34, según José Argüelles)
 */
const INICIO_DREAMSPELL_UTC = Date.UTC(1987, 5, 23);  // 23 jun 1987 — Kin 1

/**
 * Cuenta cuántos 29 de febrero caen en el rango [desdeUTC, hastaUTC] inclusive.
 * Ambos parámetros son timestamps en UTC con desdeUTC <= hastaUTC.
 */
function contarBisiestos(desdeUTC: number, hastaUTC: number): number {
  const fechaDesde = new Date(desdeUTC);
  const fechaHasta = new Date(hastaUTC);
  
  const anoDesde = fechaDesde.getUTCFullYear();
  const anoHasta = fechaHasta.getUTCFullYear();
  
  let contador = 0;
  for (let y = anoDesde; y <= anoHasta; y++) {
    const esBisiesto = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
    if (esBisiesto) {
      const feb29 = Date.UTC(y, 1, 29); // 1 = Febrero
      if (feb29 >= desdeUTC && feb29 <= hastaUTC) {
        contador++;
      }
    }
  }
  return contador;
}

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
  
  let diasEfectivos = diffDias;
  if (fechaUTC >= INICIO_DREAMSPELL_UTC) {
    const bisiestos = contarBisiestos(INICIO_DREAMSPELL_UTC, fechaUTC);
    diasEfectivos = diffDias - bisiestos;
  } else {
    const bisiestos = contarBisiestos(fechaUTC, INICIO_DREAMSPELL_UTC);
    diasEfectivos = diffDias + bisiestos;
  }

  // El módulo puede dar negativo en JS si diasEfectivos < 0 — lo normalizamos siempre
  const kinIndex = ((diasEfectivos % 260) + 260) % 260;
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
    tonoIndex,
    selloIndex,
    colorIndex,
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

// Relaciones entre sellos (sistema Dreamspell: cada sello tiene 4 guardianes)
// Índice = posición del sello en el array SELLOS (0-19)
// Análogo: sello + 5 (mod 20) | Antipoda: sello + 10 (mod 20)
// Oculto: 19 - sello | Guía: depende del tono (ver tabla)
export const RELACIONES_SELLOS: Record<number, {
  analogo: number;
  antipoda: number;
  oculto: number;
}> = {
  0: { analogo: 5, antipoda: 10, oculto: 19 },   // Dragón
  1: { analogo: 6, antipoda: 11, oculto: 18 },   // Viento
  2: { analogo: 7, antipoda: 12, oculto: 17 },   // Noche
  3: { analogo: 8, antipoda: 13, oculto: 16 },   // Semilla
  4: { analogo: 9, antipoda: 14, oculto: 15 },   // Serpiente
  5: { analogo: 10, antipoda: 15, oculto: 14 },  // Enlazador
  6: { analogo: 11, antipoda: 16, oculto: 13 },  // Mano
  7: { analogo: 12, antipoda: 17, oculto: 12 },  // Estrella
  8: { analogo: 13, antipoda: 18, oculto: 11 },  // Luna
  9: { analogo: 14, antipoda: 19, oculto: 10 },  // Perro
  10: { analogo: 15, antipoda: 0, oculto: 9 },   // Mono
  11: { analogo: 16, antipoda: 1, oculto: 8 },   // Humano
  12: { analogo: 17, antipoda: 2, oculto: 7 },   // Caminante
  13: { analogo: 18, antipoda: 3, oculto: 6 },   // Mago
  14: { analogo: 19, antipoda: 4, oculto: 5 },   // Águila
  15: { analogo: 0, antipoda: 5, oculto: 4 },    // Guerrero
  16: { analogo: 1, antipoda: 6, oculto: 3 },    // Tierra
  17: { analogo: 2, antipoda: 7, oculto: 2 },    // Espejo
  18: { analogo: 3, antipoda: 8, oculto: 1 },    // Tormenta
  19: { analogo: 4, antipoda: 9, oculto: 0 },    // Sol
};

// Descripción de qué significa cada relación en convivencia comunitaria
export const SIGNIFICADO_RELACIONES: Record<string, string> = {
  mismoSello: 'Espejo directo: comparten el mismo arquetipo. Alta resonancia pero riesgo de puntos ciegos compartidos.',
  mismoColor: 'Misma familia cromática: comparten propósito y dirección energética. Fluyen en paralelo.',
  analogo: 'Aliado natural: sus energías se complementan y potencian mutuamente sin fricción.',
  antipoda: 'Polo opuesto: energías que se desafían. Tensión creativa con alto potencial transformador.',
  oculto: 'Poder oculto: uno porta lo que el otro necesita desarrollar. Relación de crecimiento profundo.',
  mismaTreceOndas: 'Comparten onda encantada: viajan con el mismo propósito de los 13 días. Alta sintonía de misión.',
  tonosComplementarios: 'Tonos complementarios (suman 14): equilibrio entre acción y receptividad.',
  tonosDesafiantes: 'Tonos en tensión (diferencia impar alta): estilos de acción distintos que requieren conciencia.',
};

import i18n from '../i18n';

// Función exportable que calcula la relación entre dos KinData
export function calcularRelacionKines(kin1: KinData, kin2: KinData): {
  tipo: string;
  descripcion: string;
  selloA: string;
  selloB: string;
} {
  const s1 = SELLOS.indexOf(kin1.sello);
  const s2 = SELLOS.indexOf(kin2.sello);
  const relaciones1 = RELACIONES_SELLOS[s1];

  let tipo = 'tonosDesafiantes';
  if (s1 === s2) tipo = 'mismoSello';
  else if (kin1.color === kin2.color) tipo = 'mismoColor';
  else if (relaciones1 && relaciones1.analogo === s2) tipo = 'analogo';
  else if (relaciones1 && relaciones1.antipoda === s2) tipo = 'antipoda';
  else if (relaciones1 && relaciones1.oculto === s2) tipo = 'oculto';
  else {
    const ondaA = Math.ceil(kin1.kin / 13);
    const ondaB = Math.ceil(kin2.kin / 13);
    if (ondaA === ondaB) tipo = 'mismaTreceOndas';
    else {
      const sumaTonos = kin1.tono + kin2.tono;
      if (sumaTonos === 14) tipo = 'tonosComplementarios';
    }
  }

  const descripcion = i18n.t(`astrology:relations.${tipo}`, { defaultValue: SIGNIFICADO_RELACIONES[tipo] });

  return {
    tipo,
    descripcion,
    selloA: kin1.sello,
    selloB: kin2.sello
  };
}
