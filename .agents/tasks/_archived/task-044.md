# T-044 — Reducir usos de any en interfaces core (datosBrutos, perfilVisual, configuracion) con interfaces tipadas

## Objetivo
Reemplazar el tipo `any` en los campos `datosBrutos`, `perfilVisual` y `configuracion` de la entidad Ficha por tipos e interfaces fuertemente tipadas en TypeScript para evitar errores en tiempo de ejecución y mejorar el autocompletado.

## Contexto técnico
En Kanarii, las fichas contienen información multimodal (datos de diseño humano, astrológicos, o cuestionarios procesados). Actualmente, los campos que almacenan estas estructuras están tipados como `any` o no tienen tipos definidos específicos. Debemos definir interfaces detalladas para:
1. `datosBrutos` (información cruda de la ficha).
2. `perfilVisual` (estructura de estilos visuales generados por la IA o predefinidos).
3. `configuracion` (preferencias de visualización y configuración de la ficha).

## Caja de archivos
Archivos propuestos para modificación (a refinar tras la aprobación):
- `src/lib/services/_types.ts`
- `src/lib/services/fichas.ts`
- `src/pages/FichaView.tsx`

## Criterios de done
- [x] Definidas interfaces específicas para `datosBrutos`, `perfilVisual` y `configuracion` en el archivo de tipos de ficha.
- [x] Tipados los parámetros y retornos en `src/lib/services/fichas.ts` para usar estas nuevas interfaces en lugar de `any`.
- [x] Adaptados los componentes de visualización en `src/pages/FichaView.tsx` para consumir las interfaces tipadas correctamente.
- [x] Compilación sin errores TypeScript (`npx tsc --noEmit`).

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-06-04 13:28
- [x] Rama creada: feat/T-044-tipado-interfaces-core
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
