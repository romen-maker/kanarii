# Task-016: Modularizar appService.ts por dominio en src/lib/services/

## Objetivo
Modularizar el archivo gigante `src/lib/appService.ts` (3300+ líneas) en un directorio `src/lib/services/` dividido por dominios y capas, manteniendo la retrocompatibilidad completa re-exportando todo desde `src/lib/appService.ts` (actuando como barrel).

## Contexto técnico
- Basado en la Opción B de `docs/sprints/sprint-04-research.md` (Barrel + Infraestructura Compartida).
- Capas a estructurar:
  - `src/lib/services/_core.ts` [NEW]: Firebase/Firestore, colecciones centralizadas, helpers genéricos (`subscribeToCollection`, `subscribeToDocument`, etc.).
  - `src/lib/services/_types.ts` [NEW]: Interfaces y tipos de datos del modelo.
  - Módulos de dominio específicos [NEW] (en orden): `users.ts`, `comunidades.ts`, `members.ts`, `invitaciones.ts`, `solicitudes.ts`, `fichas.ts`, `propuestas.ts`, `tareas.ts`, `proyectos.ts`, `posts.ts`, `actas.ts`, `eventos.ts`, `servicios.ts`, `acuerdos.ts`.
  - `src/lib/services/index.ts` [NEW]: Exporta todo lo anterior.
  - `src/lib/appService.ts` [MODIFY]: Barrel que hace `export * from './services/index'`.
- **Pausa obligatoria**: Tras crear `_core.ts` y `_types.ts`, pausar y esperar validación/aprobación del usuario antes de continuar con la creación de los dominios específicos.

## Caja de archivos
Archivos autorizados para modificación:
- `src/lib/appService.ts`
- `src/lib/services/_core.ts`
- `src/lib/services/_types.ts`
- `src/lib/services/users.ts`
- `src/lib/services/comunidades.ts`
- `src/lib/services/members.ts`
- `src/lib/services/invitaciones.ts`
- `src/lib/services/solicitudes.ts`
- `src/lib/services/propuestas.ts`
- `src/lib/services/fichas.ts`
- `src/lib/services/tareas.ts`
- `src/lib/services/proyectos.ts`
- `src/lib/services/posts.ts`
- `src/lib/services/actas.ts`
- `src/lib/services/eventos.ts`
- `src/lib/services/servicios.ts`
- `src/lib/services/acuerdos.ts`
- `src/lib/services/index.ts`

## Criterios de done
- [x] Creación de `src/lib/services/_core.ts` con helpers de infraestructura y referencias a colecciones.
- [x] Creación de `src/lib/services/_types.ts` con todos los tipos e interfaces.
- [x] Pausa para validación del usuario tras el paso 3.
- [x] Creación de los módulos de dominio en `src/lib/services/` extrayendo los métodos correspondientes en el orden aprobado:
  - [x] `users.ts`
  - [x] `comunidades.ts`
  - [x] `members.ts`
  - [x] `invitaciones.ts`
  - [x] `solicitudes.ts`
  - [x] `fichas.ts`
  - [x] `propuestas.ts`
  - [x] `tareas.ts`
  - [x] `proyectos.ts`
  - [x] `posts.ts`
  - [x] `actas.ts`
  - [x] `eventos.ts`
  - [x] `servicios.ts`
  - [x] `acuerdos.ts`
- [x] Creación del barrel `src/lib/services/index.ts` unificando todas las exportaciones.
- [x] Modificación de `src/lib/appService.ts` para que re-exporte todo desde `services/index`.
- [x] Compilación sin errores TypeScript (`npm run build` o `npx tsc`).

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-26T16:08:00+01:00
- [x] Rama creada: `feat/T-016-modularizar-appservice`
- [x] Lock activo: `[x]`
- [x] Sesión cerrada correctamente
