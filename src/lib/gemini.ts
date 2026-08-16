import { GoogleGenAI, Type } from "@google/genai";
import { calcularKin, calcularRelacionKines } from './kinMaya';

const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!geminiKey) {
  console.error(
    '⚠️ VITE_GEMINI_API_KEY no está definida en .env.local. ' +
    'Las funciones de IA no funcionarán.'
  );
}

const ai = new GoogleGenAI({ apiKey: geminiKey || '' });

const CRUCE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    arquetipo_relacional: { type: Type.STRING },
    clima_grupal_alerta: { type: Type.STRING },
    mapa_rangos: {
      type: Type.OBJECT,
      properties: {
        quien_tiene_mas_rango: { type: Type.STRING },
        tipo_rango: {
          type: Type.STRING,
          enum: ['contextual', 'social', 'ambos']
        },
        alerta_rango: { type: Type.STRING }
      },
      required: ['quien_tiene_mas_rango', 'tipo_rango', 'alerta_rango']
    },
    canales_enriquecidos: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          nombre: { type: Type.STRING },
          tipo: {
            type: Type.STRING,
            enum: ['electromagnetico', 'compania', 'dominancia', 'compromiso']
          },
          descripcion_comunitaria: { type: Type.STRING },
          nota_rango: { type: Type.STRING, nullable: true }
        },
        required: ['id', 'nombre', 'tipo', 'descripcion_comunitaria']
      }
    },
    cnv: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          persona: { type: Type.STRING },
          situacion: { type: Type.STRING },
          observacion: { type: Type.STRING },
          sentimiento: { type: Type.STRING },
          necesidad: { type: Type.STRING },
          peticion: { type: Type.STRING }
        },
        required: ['persona', 'situacion', 'observacion', 'sentimiento', 'necesidad', 'peticion']
      }
    },
    sombras: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          persona: { type: Type.STRING },
          proceso_primario: { type: Type.STRING },
          sombra_probable: { type: Type.STRING },
          gancho_proyectivo: { type: Type.STRING }
        },
        required: ['persona', 'proceso_primario', 'sombra_probable', 'gancho_proyectivo']
      }
    },
    acuerdo_doble_enlace: {
      type: Type.OBJECT,
      properties: {
        dominio_1: {
          type: Type.OBJECT,
          properties: {
            persona: { type: Type.STRING },
            area: { type: Type.STRING },
            fecha_revision: { type: Type.STRING }
          },
          required: ['persona', 'area', 'fecha_revision']
        },
        dominio_2: {
          type: Type.OBJECT,
          properties: {
            persona: { type: Type.STRING },
            area: { type: Type.STRING },
            fecha_revision: { type: Type.STRING }
          },
          required: ['persona', 'area', 'fecha_revision']
        },
        metodologia: { type: Type.STRING }
      },
      required: ['dominio_1', 'dominio_2', 'metodologia']
    }
  },
  required: [
    'arquetipo_relacional',
    'clima_grupal_alerta',
    'mapa_rangos',
    'canales_enriquecidos',
    'cnv',
    'sombras',
    'acuerdo_doble_enlace'
  ]
};


const MANUAL_RESUMEN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    adn_astral: {
      type: Type.OBJECT,
      properties: {
        enfoque_clave: { type: Type.STRING },
        puntos_principales: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ['enfoque_clave', 'puntos_principales']
    },
    anatomia_poder: {
      type: Type.OBJECT,
      properties: {
        enfoque_clave: { type: Type.STRING },
        puntos_principales: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ['enfoque_clave', 'puntos_principales']
    },
    espejo_tribu: {
      type: Type.OBJECT,
      properties: {
        enfoque_clave: { type: Type.STRING },
        puntos_principales: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ['enfoque_clave', 'puntos_principales']
    },
    sintonia_cnv: {
      type: Type.OBJECT,
      properties: {
        enfoque_clave: { type: Type.STRING },
        puntos_principales: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ['enfoque_clave', 'puntos_principales']
    },
    mantenimiento_crisis: {
      type: Type.OBJECT,
      properties: {
        enfoque_clave: { type: Type.STRING },
        puntos_principales: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ['enfoque_clave', 'puntos_principales']
    }
  },
  required: [
    'adn_astral',
    'anatomia_poder',
    'espejo_tribu',
    'sintonia_cnv',
    'mantenimiento_crisis'
  ]
};

export interface SeccionResumen {
  enfoque_clave: string;
  puntos_principales: string[];
}

export interface ResumenManualStructured {
  adn_astral: SeccionResumen;
  anatomia_poder: SeccionResumen;
  espejo_tribu: SeccionResumen;
  sintonia_cnv: SeccionResumen;
  mantenimiento_crisis: SeccionResumen;
}

/**
 * Interfaces para el análisis estructurado de cruce
 */
export interface CanalEnriquecido {
  id: string;
  nombre: string;
  tipo: 'electromagnetico' | 'compania' | 'dominancia' | 'compromiso';
  descripcion_comunitaria: string;
  nota_rango: string | null;
}

export interface FraseCNV {
  persona: string;
  situacion: string;
  observacion: string;
  sentimiento: string;
  necesidad: string;
  peticion: string;
}

export interface SombraRelacional {
  persona: string;
  proceso_primario: string;
  sombra_probable: string;
  gancho_proyectivo: string;
}

export interface AnalisisCruceStructured {
  arquetipo_relacional: string;
  clima_grupal_alerta: string;
  mapa_rangos: {
    quien_tiene_mas_rango: string;
    tipo_rango: 'contextual' | 'social' | 'ambos';
    alerta_rango: string;
  };
  canales_enriquecidos: CanalEnriquecido[];
  cnv: FraseCNV[];
  sombras: SombraRelacional[];
  acuerdo_doble_enlace: {
    dominio_1: { persona: string; area: string; fecha_revision: string };
    dominio_2: { persona: string; area: string; fecha_revision: string };
    metodologia: string;
  };
}

/**
 * Wrapper resiliente para llamadas a Gemini.
 * Maneja el fallback automático de 2.5 a 1.5 en caso de saturación.
 */
async function callGeminiWithFallback(prompt: string, config?: any): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: config
    });

    if (!response.text) throw new Error('No response text from Gemini 2.5');
    return response.text;
  } catch (err: any) {
    console.error("❌ Error inicial al invocar Gemini 2.5:", err); // Log para ver el error original (diagnóstico de schema/404/etc.)
    
    const errStr = JSON.stringify(err);
    const isRetryable = 
      errStr.includes('503') || 
      errStr.includes('429') || 
      err.message?.includes('503') || 
      err.message?.includes('429');

    if (isRetryable) {
      console.log("⚠️ Gemini 2.5 no disponible (saturación/cuota), usando 3.1-flash-lite como fallback");
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: config
        });

        if (!fallbackResponse.text) throw new Error('No response text from Gemini 3.1-flash-lite');
        return fallbackResponse.text;
      } catch (fallbackErr) {
        console.error("❌ Falló también el fallback de Gemini 3.1-flash-lite:", fallbackErr);
        throw new Error("Servicio de IA no disponible, inténtalo en unos minutos");
      }
    }
    
    throw err;
  }
}

// Función auxiliar para parsear el JSON de la respuesta
function parsearRespuestaIA(text: string): any {
  try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      return JSON.parse(text);
  } catch(e) {
      console.error("❌ Error parseando respuesta JSON de IA:", text);
      throw e;
  }
}

export async function generarPerfilVisual(
  datosBrutos: any, 
  datosPersona: any, 
  dimensiones: any, 
  comunidadNombre: string = 'la comunidad',
  locale: 'es' | 'en' = 'es'
): Promise<any> {
    // Calculamos el Kin Maya personal si hay fecha de nacimiento
    const kinMaya = datosPersona?.fechaNacimiento
      ? calcularKin(datosPersona.fechaNacimiento)
      : null;

    const languageInstruction = locale === 'en'
      ? 'CRITICAL: Respond COMPLETELY in English.'
      : 'Responde COMPLETAMENTE en español.';

    const prompt = `
   Eres un experto en Astrología Psicológica, Diseño Humano y Calendario Maya Dreamspell aplicados a comunidades de convivencia.
   ${languageInstruction}
   Responde SOLO con JSON válido, sin markdown ni backticks ni texto extra.
   Schema de salida:
   {
     "arquetipo": "string (2-4 palabras evocadoras)",
     "descripcion_arquetipo": "string (1 frase, contexto comunitario)",
     "fortalezas": ["string (3 fortalezas concretas para ${comunidadNombre})"],
     "sombras": ["string (2 patrones inconscientes basados en la carta)"],
     "aportaComunidad": ["string (2-3 dones concretos para la finca)"],
     "necesitaComunidad": ["string (2-3 necesidades innegociables)"],
     "rol_sociocratico": "Coordinador" | "Secretario" | "Facilitador",
     "justificacion_rol": "string (1 frase basada en Mercurio, Saturno y el Kin Maya si está disponible)"
   }
   
   Datos del usuario:
   (Nota: "saberes" se refiere a los saberes, formación y recorrido vital de la persona)
   ${JSON.stringify({ datosBrutos, datosPersona, dimensiones, kinMaya }, null, 2)}
   `;

  console.log(`🤖 Gemini: Iniciando generación de Perfil Visual en idioma [${locale}]...`);
  const textResponse = await callGeminiWithFallback(prompt);
  const resultado = parsearRespuestaIA(textResponse);
  
  return {
    ...resultado,
    locale,
    model: 'gemini-2.5-flash',
    promptVersion: 'v1.2',
    generatedAt: new Date().toISOString()
  };
}

/**
 * @deprecated — reemplazar por generarResumenManual + generarSeccion en T-060
 */
export async function generarManual_legacy(datosBrutos: any, datosPersona: any, perfilVisual: any, comunidadNombre: string = 'la comunidad'): Promise<string> {
   const d = new Date();
   d.setMonth(d.getMonth() + 6);
   const formattedDate = d.toLocaleDateString();
   
   const isVoluntario = datosPersona?.rol === 'voluntario';
   const voluntarioContext = isVoluntario 
      ? `\nEsta persona viene como voluntaria con estancia temporal. Adapta el tono para dar la bienvenida a alguien que viene a aportar por un período concreto, destacando cómo puede contribuir desde sus habilidades durante su estancia.\n`
      : "";

   // Calculamos el Kin Maya personal si hay fecha de nacimiento
   const kinMaya = datosPersona?.fechaNacimiento
     ? calcularKin(datosPersona.fechaNacimiento)
     : null;

   const kinMayaContext = kinMaya
     ? `\nFirma Galáctica (Kin Maya Dreamspell): ${kinMaya.descripcionLarga}\n`
     : "";

   const prompt = `Eres un experto en Astrología Psicológica, Diseño Humano y Calendario Maya Dreamspell aplicados a comunidades de convivencia.${voluntarioContext}
Genera el manual en Markdown con las 5 secciones del Manual de Usuario Humano de ${comunidadNombre}.

   1. ADN Astral, Kin Maya e Ikigai Comunitario — Cruza la misión de vida solar/HD con el Kin personal.
      ${kinMayaContext}
      Explica cómo el Sello y el Tono del Kin definen el rol natural de esta persona en la convivencia comunitaria.
      Describe qué tipo de energía aporta al grupo según su Kin (ej. si es Viento: comunicación y oxigenación de procesos; si es Tormenta: catalizador de transformaciones necesarias).
   2. Anatomía del Poder (Democracia Profunda) — con los 4 tipos de rango: Social, Psicológico, Contextual, Espiritual
   3. El Espejo de la Tribu (Sombra y Procesos)
   4. Sintonía y Comunicación (CNV)
   5. Guía de Mantenimiento y Crisis — con instrucciones "Si me ves X, haz Y"

   Al final del manual añade exactamente y literalmente: "*Revisión recomendada: ${formattedDate}*"

   Datos del miembro:
   Perfil Visual/Arquetipo/Sombras: ${JSON.stringify(perfilVisual, null, 2)}
   Datos Persona: ${JSON.stringify(datosPersona, null, 2)}
   Firma Galáctica (Kin Maya): ${kinMaya ? JSON.stringify(kinMaya, null, 2) : 'No disponible'}
   Datos Brutos (diseño humano y astrología): ${JSON.stringify(datosBrutos, null, 2)}
   `;

  console.log("🤖 Gemini: Iniciando generación de Manual Legacy...");
  return await callGeminiWithFallback(prompt);
}

/**
 * @deprecated — reemplazar por generarResumenManual + generarSeccion en T-060
 */
export const generarManual = generarManual_legacy;

export async function generarResumenManual(
  perfilVisual: any,
  comunidadNombre: string = 'la comunidad'
): Promise<ResumenManualStructured> {
  const prompt = `
    Eres un experto en Astrología Psicológica, Diseño Humano y dinámicas comunitarias.
    Genera el resumen de las 5 secciones del Manual de Usuario Humano para la comunidad ${comunidadNombre} basado en el Perfil Visual de la persona.
    
    El Perfil Visual contiene:
    - Arquetipo: ${perfilVisual.arquetipo}
    - Descripción: ${perfilVisual.descripcion_arquetipo}
    - Fortalezas: ${JSON.stringify(perfilVisual.fortalezas)}
    - Sombras: ${JSON.stringify(perfilVisual.sombras)}
    - Aporte a la comunidad: ${JSON.stringify(perfilVisual.aportaComunidad)}
    - Necesidades de la comunidad: ${JSON.stringify(perfilVisual.necesitaComunidad)}
    - Dimensiones (Escucha, Acción, Estructura, Cuidado): ${JSON.stringify(perfilVisual.dimensiones)}

    Genera un JSON estructurado de resúmenes (Capa 1) para las siguientes 5 secciones:
    1. adn_astral: Enfoque clave y puntos principales que cruzan su arquetipo y fortalezas en la vida de la comunidad.
    2. anatomia_poder: Enfoque clave y puntos principales sobre cómo maneja su poder e influencia (rango social, psicológico, contextual, espiritual).
    3. espejo_tribu: Enfoque clave y puntos principales sobre sus patrones de sombra inconscientes y cómo se reflejan en el espejo grupal.
    4. sintonia_cnv: Enfoque clave y puntos principales sobre su estilo de comunicación y cómo aplicar la Comunicación No Violenta (CNV).
    5. mantenimiento_crisis: Enfoque clave y puntos principales sobre cómo actuar si entra en crisis o tensión ("si me ves X, haz Y").

    Responde estrictamente en formato JSON que cumpla con el esquema requerido.
  `;

  const config = {
    responseMimeType: 'application/json',
    responseSchema: MANUAL_RESUMEN_SCHEMA,
  };

  console.log("🤖 Gemini: Iniciando generación de Resumen del Manual (Capa 1)...");
  const textResponse = await callGeminiWithFallback(prompt, config);
  if (!textResponse) throw new Error("La API de Gemini no retornó contenido para el resumen del manual.");
  return JSON.parse(textResponse) as ResumenManualStructured;
}

export async function generarSeccion(
  seccionId: 'adn_astral' | 'anatomia_poder' | 'espejo_tribu' | 'sintonia_cnv' | 'mantenimiento_crisis',
  perfilVisual: any,
  resumenManual: ResumenManualStructured,
  comunidadNombre: string = 'la comunidad'
): Promise<string> {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  const formattedDate = d.toLocaleDateString();

  const seccionInfo = resumenManual[seccionId];
  if (!seccionInfo) throw new Error(`Sección no válida: ${seccionId}`);

  const promptsPorSeccion = {
    adn_astral: `Genera la sección "ADN Astral, Kin Maya e Ikigai Comunitario" del Manual de Usuario Humano para la comunidad ${comunidadNombre}.
      Enfoque de la sección: ${seccionInfo.enfoque_clave}
      Puntos guía: ${seccionInfo.puntos_principales.join(', ')}`,
      
    anatomia_poder: `Genera la sección "Anatomía del Poder (Democracia Profunda)" del Manual de Usuario Humano para la comunidad ${comunidadNombre}, abordando el rango Social, Psicológico, Contextual y Espiritual.
      Enfoque de la sección: ${seccionInfo.enfoque_clave}
      Puntos guía: ${seccionInfo.puntos_principales.join(', ')}`,
      
    espejo_tribu: `Genera la sección "El Espejo de la Tribu (Sombra y Procesos)" del Manual de Usuario Humano para la comunidad ${comunidadNombre}, enfocando los patrones de sombra y proyecciones.
      Enfoque de la sección: ${seccionInfo.enfoque_clave}
      Puntos guía: ${seccionInfo.puntos_principales.join(', ')}`,
      
    sintonia_cnv: `Genera la sección "Sintonía y Comunicación (CNV)" del Manual de Usuario Humano para la comunidad ${comunidadNombre}, aportando recomendaciones de comunicación no violenta.
      Enfoque de la sección: ${seccionInfo.enfoque_clave}
      Puntos guía: ${seccionInfo.puntos_principales.join(', ')}`,
      
    mantenimiento_crisis: `Genera la sección "Guía de Mantenimiento y Crisis" del Manual de Usuario Humano para la comunidad ${comunidadNombre}, ofreciendo instrucciones del estilo "Si me ves X, haz Y".
      Enfoque de la sección: ${seccionInfo.enfoque_clave}
      Puntos guía: ${seccionInfo.puntos_principales.join(', ')}
      Al final de esta sección (y solo de esta), añade exactamente y literalmente: "*Revisión recomendada: ${formattedDate}*"`
  };

  const promptNarrativa = `
    Eres un facilitador experto en procesos comunitarios, sociocracia y psicología grupal.
    A partir de la siguiente información, genera una narrativa rica en Markdown libre para esta sección específica.
    
    Perfil Visual del miembro:
    - Arquetipo: ${perfilVisual.arquetipo}
    - Descripción: ${perfilVisual.descripcion_arquetipo}
    - Fortalezas: ${JSON.stringify(perfilVisual.fortalezas)}
    - Sombras: ${JSON.stringify(perfilVisual.sombras)}
    
    Sección a generar: ${seccionId}
    Instrucciones específicas:
    ${promptsPorSeccion[seccionId]}
    
    Reglas:
    - Escribe en segunda persona, tono cálido y directo, como una facilitadora experta.
    - Usa Markdown rico con emojis relevantes en los títulos de subsecciones.
    - Estructura con ## para subtítulos, **negrita** para conceptos clave, y blockquotes (>) para ejemplos de comunicación o citas directas.
    - No inventes información fuera del perfil visual ni de los puntos guía del resumen.
    - Genera solo el contenido de la sección sin títulos principales extra que repitan el nombre de la sección.
  `;

  console.log(`🤖 Gemini: Iniciando generación de la sección narrativa lazy: ${seccionId}...`);
  return await callGeminiWithFallback(promptNarrativa);
}

async function generarCruceInsights(prompt: string): Promise<AnalisisCruceStructured> {
  const config = {
    responseMimeType: 'application/json',
    responseSchema: CRUCE_SCHEMA,
  };

  const textResponse = await callGeminiWithFallback(prompt, config);
  if (!textResponse) throw new Error("La API de Gemini no retornó contenido de texto.");
  return JSON.parse(textResponse) as AnalisisCruceStructured;
}

async function generarCruceNarrativa(
  promptBase: string,
  structured: AnalisisCruceStructured
): Promise<string> {
  const narrativaPrompt = `
    ${promptBase}

    Dado este análisis estructurado de cruce previo:
    ${JSON.stringify(structured, null, 2)}
        
    Genera el análisis narrativo en Markdown con tono de facilitadora experta en procesos comunitarios.
    Secciones requeridas: 
    🌱 Lo que pueden construir juntos
    ⚡ Dónde puede aparecer fricción
    🔵 Recomendación Sociocrática
    
    Reglas: Usa los nombres reales de las personas. En la sección de comunicación, envuelve los ejemplos de CNV estrictamente en blockquotes (>).
  `;

  return await callGeminiWithFallback(narrativaPrompt);
}

export async function generarAnalisisCruce(
  perfil1: any, 
  perfil2: any, 
  resultadoDeterminista: any, 
  comunidadNombre: string = 'la comunidad'
): Promise<{ structured: AnalisisCruceStructured; narrative: string }> {
  const kin1 = perfil1.datosPersona?.fechaNacimiento
    ? calcularKin(perfil1.datosPersona.fechaNacimiento)
    : null;
  const kin2 = perfil2.datosPersona?.fechaNacimiento
    ? calcularKin(perfil2.datosPersona.fechaNacimiento)
    : null;

  const relacionKines = (kin1 && kin2)
    ? calcularRelacionKines(kin1, kin2)
    : null;

  const kinMayaContext = (kin1 && kin2) ? `

CRUCE GALÁCTICO (Calendario Dreamspell):
Persona 1 — ${perfil1.datosPersona?.nombre}: ${kin1.descripcionLarga}
Persona 2 — ${perfil2.datosPersona?.nombre}: ${kin2.descripcionLarga}

Relación entre sus Kines: ${relacionKines?.tipo} — ${relacionKines?.descripcion}

Instrucciones para el análisis galáctico:
- Si la relación es "analogo": indica que su colaboración fluye de forma natural, sin esfuerzo consciente.
- Si es "antipoda": señala la tensión creativa y cómo transformarla en motor de crecimiento colectivo.
- Si es "oculto": explica qué porta cada uno que el otro necesita desarrollar (relación de crecimiento).
- Si es "mismaTreceOndas": destaca la sintonía de propósito y misión compartida.
- Si es "tonosComplementarios" (suman 14): explicar el equilibrio entre sus estilos de acción.
- En todos los casos: conecta el Rol Comunitario de cada sello con su función en la ecoaldea.
` : '';

  const promptBaseSinKin = `Eres un experto en Astrología Psicológica, Diseño Humano y Sociocracia aplicados a comunidades intencionales.
Analiza la dinámica entre estos dos miembros de la comunidad ${comunidadNombre}.

Toma en cuenta sus perfiles:
Persona 1 (${perfil1.datosPersona?.nombre || 'Miembro 1'}): ${JSON.stringify({
    datosBrutos: perfil1.datosBrutos,
    datosPersona: perfil1.datosPersona,
    perfilVisual: perfil1.perfilVisual
  }, null, 2)}

Persona 2 (${perfil2.datosPersona?.nombre || 'Miembro 2'}): ${JSON.stringify({
    datosBrutos: perfil2.datosBrutos,
    datosPersona: perfil2.datosPersona,
    perfilVisual: perfil2.perfilVisual
  }, null, 2)}

Cruce determinista:
${JSON.stringify(resultadoDeterminista, null, 2)}
`;

  // Inyectamos kinMayaContext SOLO en Capa 1
  const promptCapa1 = `${promptBaseSinKin}\n${kinMayaContext}`;

  console.log("🤖 Gemini: Iniciando generación de Análisis de Cruce Estructurado (Capa 1)...");
  const structured = await generarCruceInsights(promptCapa1);

  console.log("🤖 Gemini: Iniciando generación de Análisis de Cruce Narrativo (Capa 2)...");
  const narrative = await generarCruceNarrativa(promptBaseSinKin, structured);

  return { structured, narrative };
}
