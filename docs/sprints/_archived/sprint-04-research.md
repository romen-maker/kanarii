# Research y Plan de Migración para el Sprint 04

## Diagnóstico del problema real
`appService.ts` mezcla cuatro tipos de cosas en un solo archivo:
1. Tipos/interfaces
2. Referencias de colecciones
3. Helpers de infraestructura (`handleFirestoreError`, `subscribeToCollection`)
4. Lógica de dominio

Antes de modularizar, hay que separar esas capas conceptualmente para evitar dependencias circulares.

## Opción Elegida: Opción B (Barrel + Infraestructura Compartida)
- Crear `services/_core.ts` para Firebase/Firestore, colecciones centralizadas y helpers genéricos.
- Crear `services/_types.ts` para tipos/interfaces.
- Los módulos de dominio importan de `_core.ts` y `_types.ts`.
- `appService.ts` queda como barrel re-exportador (`export * from './services/index'`).

## Estructura de directorios objetivo
```
src/lib/
├── firebase.ts              ← sin cambios
├── error-handler.ts         ← sin cambios
├── appService.ts            ← barrel
└── services/
    ├── _core.ts             ← db, colecciones, subscribeToCollection, subscribeToDocument
    ├── _types.ts            ← todos los interfaces
    ├── users.ts             
    ├── comunidades.ts       
    ├── members.ts           
    ├── invitaciones.ts      
    ├── solicitudes.ts       
    ├── propuestas.ts        
    ├── fichas.ts            
    ├── tareas.ts            
    ├── proyectos.ts         
    ├── posts.ts             
    ├── actas.ts             
    ├── eventos.ts           
    └── index.ts             
```

## Plan para T-013 (Abstracción de Hooks)
Los hooks que importan Firebase directamente (`usePropuestaDetail.ts`, `useProyectos.ts`, `useFichas.ts`, `useTareas.ts`) deben usar la capa de servicio en lugar de Firebase Firestore directamente.
Para `usePropuestaDetail.ts`, implementar `listenPropuesta` y `subscribeToDocument` en `appService` (o `services/_core.ts` si ya está listo) para que no dependa de Firestore directamente, y añadir la validación de `communityId`.
