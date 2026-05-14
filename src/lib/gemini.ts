import { GoogleGenAI } from "@google/genai";

const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!geminiKey) {
  console.error(
    '⚠️ VITE_GEMINI_API_KEY no está definida en .env.local. ' +
    'Las funciones de IA no funcionarán.'
  );
}

const ai = new GoogleGenAI({ apiKey: geminiKey || '' });

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
async function callGeminiWithFallback(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    if (!response.text) throw new Error('No response text from Gemini 2.5');
    return response.text;
  } catch (err: any) {
    const errStr = JSON.stringify(err);
    const isRetryable = 
      errStr.includes('503') || 
      errStr.includes('429') || 
      err.message?.includes('503') || 
      err.message?.includes('429');

    if (isRetryable) {
      console.log("⚠️ Gemini 2.5 no disponible (saturación/cuota), usando 1.5 como fallback");
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        if (!fallbackResponse.text) throw new Error('No response text from Gemini 1.5');
        return fallbackResponse.text;
      } catch (fallbackErr) {
        console.error("❌ Falló también el fallback de Gemini 1.5:", fallbackErr);
        throw new Error("Servicio de IA no disponible, inténtalo en unos minutos");
      }
    }
    
    // Si no es un error de reintento (503/429), lanzamos el error original
    console.error("❌ Error no recuperable en Gemini 2.5:", err);
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

export async function generarPerfilVisual(datosBrutos: any, datosPersona: any, dimensiones: any, comunidadNombre: string = 'la comunidad'): Promise<any> {
    const prompt = `
   Eres un experto en Astrología Psicológica y Diseño Humano aplicados a comunidades de convivencia.
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
     "justificacion_rol": "string (1 frase basada en Mercurio y Saturno)"
   }
   
   Datos del usuario:
   (Nota: "saberes" se refiere a los saberes, formación y recorrido vital de la persona)
   ${JSON.stringify({datosBrutos, datosPersona, dimensiones}, null, 2)}
   `;

  console.log("🤖 Gemini: Iniciando generación de Perfil Visual...");
  const textResponse = await callGeminiWithFallback(prompt);
  return parsearRespuestaIA(textResponse);
}

export async function generarManual(datosBrutos: any, datosPersona: any, perfilVisual: any, comunidadNombre: string = 'la comunidad'): Promise<string> {
   const d = new Date();
   d.setMonth(d.getMonth() + 6);
   const formattedDate = d.toLocaleDateString();
   
   const isVoluntario = datosPersona?.rol === 'voluntario';
   const voluntarioContext = isVoluntario 
      ? `\nEsta persona viene como voluntaria con estancia temporal. Adapta el tono para dar la bienvenida a alguien que viene a aportar por un período concreto, destacando cómo puede contribuir desde sus habilidades durante su estancia.\n`
      : "";

   const prompt = `Eres un experto en Astrología Psicológica y Diseño Humano aplicados a comunidades de convivencia.${voluntarioContext}
Genera el manual en Markdown con las 5 secciones del Manual de Usuario Humano de ${comunidadNombre}.

   1. ADN Astral e Ikigai Comunitario
   2. Anatomía del Poder (Democracia Profunda) — con los 4 tipos de rango: Social, Psicológico, Contextual, Espiritual
   3. El Espejo de la Tribu (Sombra y Procesos)
   4. Sintonía y Comunicación (CNV)
   5. Guía de Mantenimiento y Crisis — con instrucciones "Si me ves X, haz Y"

   Al final del manual añade exactamente y literalmente: "*Revisión recomendada: ${formattedDate}*"

   Datos del miembro:
   Perfil Visual/Arquetipo/Sombras: ${JSON.stringify(perfilVisual, null, 2)}
   Datos Persona: ${JSON.stringify(datosPersona, null, 2)}
   Datos Brutos (diseño humano y astrología): ${JSON.stringify(datosBrutos, null, 2)}
   `;

  console.log("🤖 Gemini: Iniciando generación de Manual...");
  return await callGeminiWithFallback(prompt);
}

export async function generarAnalisisCruce(
  perfil1: any, 
  perfil2: any, 
  resultadoDeterminista: any, 
  comunidadNombre: string = 'la comunidad'
): Promise<{ structured: AnalisisCruceStructured; narrative: string }> {
   const prompt = `Eres un experto en Astrología Psicológica, Diseño Humano y Sociocracia aplicados a comunidades intencionales.
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

INSTRUCCIONES DE SALIDA:
Debes responder con dos bloques claramente diferenciados.
PRIMERO: Un bloque JSON encerrado en \`\`\`json [JSON] \`\`\`
SEGUNDO: El análisis narrativo en Markdown.

EL JSON DEBE SEGUIR ESTA ESTRUCTURA EXACTA:
{
  "arquetipo_relacional": "Título evocador de 4-6 palabras",
  "clima_grupal_alerta": "1 frase sobre el riesgo principal para el grupo",
  "mapa_rangos": {
    "quien_tiene_mas_rango": "Nombre o 'equilibrado'",
    "tipo_rango": "contextual|social|ambos",
    "alerta_rango": "1 frase operativa sobre cómo gestionar esta asimetría"
  },
  "canales_enriquecidos": [
    {
      "id": "ID del canal (ej: 2-14)",
      "nombre": "Nombre del canal en HD",
      "tipo": "electromagnetico|compania|dominancia|compromiso",
      "descripcion_comunitaria": "Qué activa esto en la convivencia (1 frase)",
      "nota_rango": "Aviso si hay asimetría/dominancia (opcional)"
    }
  ],
  "cnv": [
    {
      "persona": "Nombre",
      "situacion": "Breve descripción",
      "observacion": "Hecho neutro",
      "sentimiento": "Cómo se siente",
      "necesidad": "Qué necesita",
      "peticion": "Petición concreta"
    }
  ],
  "sombras": [
    {
      "persona": "Nombre",
      "proceso_primario": "Lo que cree que hace",
      "sombra_probable": "Lo que proyecta",
      "gancho_proyectivo": "Qué le 'dispara' del otro"
    }
  ],
  "acuerdo_doble_enlace": {
    "dominio_1": { "persona": "Nombre", "area": "Área de responsabilidad", "fecha_revision": "Fecha" },
    "dominio_2": { "persona": "Nombre", "area": "Área de responsabilidad", "fecha_revision": "Fecha" },
    "metodologia": "Cómo se coordinan"
  }
}

EL NARRATIVO MARKDOWN DEBE SEGUIR ESTO:
- Tono de facilitadora experta, cálido y directo.
- Usa los nombres reales.
- Secciones: 🌱 Lo que pueden construir juntos, ⚡ Dónde puede aparecer fricción, 🔵 Recomendación Sociocrática.
- Frases CNV en blockquotes (>).

Recuerda: Los canales electromagnéticos son claves para la sinergia. 
Usa el Rango Contextual basado en 'antiguedad_anos' y 'rol' (propietario vs miembro vs voluntario).
`;

  console.log("🤖 Gemini: Iniciando generación de Análisis de Cruce Estructurado...");
  const textResponse = await callGeminiWithFallback(prompt);
  
  try {
    const jsonMatch = textResponse.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : null;
    const narrative = textResponse.replace(/```json[\s\S]*?```/, "").trim();
    
    let structured: AnalisisCruceStructured;
    if (jsonStr) {
      structured = JSON.parse(jsonStr);
    } else {
      // Fallback si no hay JSON
      throw new Error("No structured JSON found in Gemini response");
    }

    return { structured, narrative };
  } catch (err) {
    console.error("❌ Error parseando respuesta estructurada de Gemini:", err);
    // Fallback desesperado para no romper la app: devolver el texto completo como narrativa
    return { 
      structured: null as any, 
      narrative: textResponse 
    };
  }
}
