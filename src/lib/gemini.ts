import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
   ${JSON.stringify({datosBrutos, datosPersona, dimensiones}, null, 2)}
   `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  if (!response.text) throw new Error('No response from Gemini');

  try {
      const match = response.text.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
      return JSON.parse(response.text);
  } catch(e) {
      console.error("Error parsing AI response", response.text);
      throw e;
  }
}

export async function generarManual(datosBrutos: any, datosPersona: any, perfilVisual: any): Promise<string> {
   const d = new Date();
   d.setMonth(d.getMonth() + 6);
   const formattedDate = d.toLocaleDateString();
   
   const prompt = `Eres un experto en Astrología Psicológica y Diseño Humano aplicados a comunidades de convivencia.
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

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  if (!response.text) {
    throw new Error('No response from Gemini');
  }

  return response.text;
}
