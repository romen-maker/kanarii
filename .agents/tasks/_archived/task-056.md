# Tarea T-056: Integrar Kin Maya de dos personas en generarAnalisisCruce

## Información General
- **ID:** T-056
- **Sprint:** Sprint 13
- **Estado:** ✅ Completado
- **Dificultad:** M

## Contexto Técnico
Se requiere inyectar datos del Kin Maya de dos personas en el prompt de `generarAnalisisCruce` para enriquecer el análisis de Gemini con complementariedades y tensiones de la cosmología Maya/Dreamspell.
Se ha provisto una lógica de cálculo de relaciones entre Kines en `sprint-13-research.md`.

## Caja de archivos
- `src/lib/kinMaya.ts`
- `src/lib/gemini.ts`

## Criterios de Aceptación (Definition of Done)
- [x] Implementar y exportar `RELACIONES_SELLOS`, `SIGNIFICADO_RELACIONES` y `calcularRelacionKines` en `src/lib/kinMaya.ts`.
- [x] Importar `calcularRelacionKines` en `src/lib/gemini.ts`.
- [x] Obtener Kines y relación en `generarAnalisisCruce` inyectando el texto `CRUCE GALÁCTICO` en el prompt.
- [x] Verificar que compila correctamente.
- [x] Sesión cerrada correctamente.
