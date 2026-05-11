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

export async function generarPerfilVisual(datosBrutos: any, datosPersona: any, dimensiones: any): Promise<any> {
    const prompt = `
   Eres un experto en Astrología Psicológica y Diseño Humano aplicados a comunidades de convivencia.
   Responde SOLO con JSON válido, sin markdown ni backticks ni texto extra.
   Schema de salida:
   {
     "arquetipo": "string (2-4 palabras evocadoras)",
     "descripcion_arquetipo": "string (1 frase, contexto comunitario)",
     "fortalezas": ["string (3 fortalezas concretas para Arteara)"],
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

export async function generarManual(datosBrutos: any, datosPersona: any, perfilVisual: any): Promise<string> {
   const d = new Date();
   d.setMonth(d.getMonth() + 6);
   const formattedDate = d.toLocaleDateString();
   
   const isVoluntario = datosPersona?.rol === 'voluntario';
   const voluntarioContext = isVoluntario 
      ? "\nEsta persona viene como voluntaria con estancia temporal. Adapta el tono para dar la bienvenida a alguien que viene a aportar por un período concreto, destacando cómo puede contribuir desde sus habilidades durante su estancia.\n"
      : "";

   const prompt = `Eres un experto en Astrología Psicológica y Diseño Humano aplicados a comunidades de convivencia.${voluntarioContext}
Genera el manual en Markdown con las 5 secciones del Manual de Usuario Humano de Arteara.

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

export async function generarAnalisisCruce(perfil1: any, perfil2: any, resultadoDeterminista: any): Promise<string> {
   const prompt = `Eres un experto en Astrología Psicológica, Diseño Humano y Sociocracia aplicados a comunidades intencionales.
Analiza la sinergia y dinámica entre estos dos miembros de la comunidad de Arteara.

Toma en cuenta sus perfiles:
Perfil Persona 1 (${perfil1.datosPersona?.nombre || perfil1.datosOnboarding?.nombre || 'Miembro 1'}): ${JSON.stringify({
  datosBrutos: perfil1.datosBrutos,
  datosPersona: perfil1.datosPersona,
  datosOnboarding: perfil1.datosOnboarding,
  perfilVisual: perfil1.perfilVisual
}, null, 2)}

Perfil Persona 2 (${perfil2.datosPersona?.nombre || perfil2.datosOnboarding?.nombre || 'Miembro 2'}): ${JSON.stringify({
  datosBrutos: perfil2.datosBrutos,
  datosPersona: perfil2.datosPersona,
  datosOnboarding: perfil2.datosOnboarding,
  perfilVisual: perfil2.perfilVisual
}, null, 2)}

Resultados del cruce determinista:
${JSON.stringify(resultadoDeterminista, null, 2)}

ESTRUCTURA Y FORMATO DE TU RESPUESTA OBLIGATORIA:
- Máximo 4-5 líneas por bloque antes de un salto visual
- Las frases CNV siempre como blockquote (> "...")
- Los roles en negrita con " — " separando nombre y descripción
- Usa los nombres reales de los miembros, nunca digas "Persona 1" o "Persona 2"
- No uses lenguaje académico — emplea un tono cálido y directo, como una facilitadora que conoce a ambas personas
- IMPORTANTE: Si el cruce determinista incluye canales electromagnéticos (canalesConexion.electromagneticos), menciona explícitamente 1-2 de ellos en la sección "Lo que pueden construir juntos", ya que son profundamente significativos energéticamente.

SIEMPRE responde exactamente con la siguiente estructura (reemplazando los corchetes con contenido):

---

## 🌱 Lo que pueden construir juntos

[2-3 frases máximo por párrafo, con salto de línea entre párrafos]

---

## ⚡ Dónde puede aparecer fricción

[Máximo 1 párrafo de contexto, luego dos bloques CNV separados:]

**Cuando [Nombre del Miembro 1] [situación, ej: siente presión de decidir rápido]:**
> "[frase CNV en primera persona]"

**Cuando [Nombre del Miembro 2] [situación, ej: quiere ofrecer guía sin invitación]:**
> "[frase CNV en primera persona]"

---

## 🔵 Recomendación Sociocrática

**Rol sugerido para [Nombre del Miembro 1]:** [nombre del rol] — [1 línea explicando qué hace]

**Rol sugerido para [Nombre del Miembro 2]:** [nombre del rol] — [1 línea explicando qué hace]

**Acuerdo de doble enlace:** [1-2 frases concretas]

---
`;

  console.log("🤖 Gemini: Iniciando generación de Análisis de Cruce...");
  return await callGeminiWithFallback(prompt);
}
