# T-046 — Integración Kin Maya (Dreamspell)

## Estado
✅ Completada — sprint-11

## Descripción
Implementación del sistema Dreamspell (Calendario Maya/Tzolkin) en Kanarii
para enriquecer el perfil comunitario con el Kin de cada persona.

## Archivos creados / modificados
- `src/lib/kinMaya.ts` — NUEVO. Fórmula Dreamspell completa. 20 sellos con
  emojis, 13 tonos, 4 colores. Campo `rolComunitario` orientado a S3 y
  psicología de grupo. Exports: `calcularKin(fecha?)` y `kinDeHoy()`.
  Cero dependencias externas.
- `src/lib/gemini.ts` — MODIFICADO. El Kin se calcula desde
  `datosPersona.fechaNacimiento` y se inyecta en:
    · `generarPerfilVisual` (arquetipo)
    · `generarManual` (sección 1 renombrada a
      "ADN Astral, Kin Maya e Ikigai Comunitario" con instrucción de
      cruzar Sello+Tono con rol en convivencia)
    · Bloque separado en los datos brutos que recibe Gemini
- `src/pages/FichaView.tsx` — MODIFICADO. Widget en sección "Identidad base"
  (modo lectura) con fondo crema: emoji + descripcionCorta + rolComunitario.
  Solo aparece si `datos.fechaNacimiento` existe. Sin campo nuevo en Firestore.

## Criterios de done (verificados)
- [x] kinMaya.ts exporta calcularKin() y kinDeHoy() sin errores TS
- [x] Widget visible en FichaView cuando fechaNacimiento tiene valor
- [x] Widget oculto cuando fechaNacimiento es null/undefined
- [x] Gemini recibe el Kin como dato estructurado en sus prompts
- [x] Sección 1 del manual renombrada a "ADN Astral, Kin Maya e Ikigai Comunitario"

## Próximas expansiones (backlog, no en este sprint)
- Widget en CalendarioView: badge con kinDeHoy() (~10 líneas)
- Kin en generarAnalisisCruce: cruce de Kines de dos personas
  para detectar complementariedades/tensiones galácticas
- Kin en PasaporteComunitario: mismo widget que FichaView
