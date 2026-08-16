# Task File: T-124 — Soporte multilingüe estructurado y regeneración por idioma para perfiles generados por Gemini

## Estado
- **Estado**: ⬜ Pendiente (Backlog)
- **Prioridad**: Media / Post-Fundraising
- **Archivos principales**:
  - `src/lib/gemini.ts`
  - `src/lib/services/fichas.ts`
  - `src/lib/services/_types.ts`

## Objetivos del Modelo de Datos
Evolucionar `perfilVisual` y `manualMarkdown` en Firestore (`profiles/{userId}`) para almacenar interpretaciones multilingües estructuradas generadas por Gemini con metadatos completos y trazabilidad.

### Campos a incorporar en Firestore
- `perfilVisualByLocale`:
  - `es`: Interpretación en español.
  - `en`: Interpretación en inglés.
- `generatedAt`: Fecha y hora exacta de la llamada a Gemini (`serverTimestamp()`).
- `model`: Identificador del modelo (ej. `gemini-2.5-flash`).
- `promptVersion`: Versión semántica del prompt de Kanarii (ej. `v1.2`).
- `canonicalInputHash` / `datosEntradaRef`: Referencia o hash de los datos canónicos (`fechaNacimiento`, `hora`, `latitud`, `longitud`, `saberes`).
- **Flujo de Regeneración**: Botón explícito bajo demanda en la UI del perfil para regenerar una versión lingüística específica sin perder la existente ni sobrescribir otras versiones.

## Criterios de Aceptación
1. No realizar traducciones ciegas al vuelo durante la carga de rutas públicas (`/p/:uid`).
2. Almacenar o generar limpiamente en Firestore el objeto estructurado por locale (`es`, `en`).
3. Preservar trazabilidad, tono y capacidad de regenerar de manera aislada.
