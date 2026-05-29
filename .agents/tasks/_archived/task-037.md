# Task-037: Activar persistencia offline de Firestore (IndexedDB) con estrategia segura

## Objetivo
Configurar la persistencia offline de Firestore en Kanarii usando la API correcta del SDK v10+ (`initializeFirestore` con `persistentLocalCache`), soportando de forma segura pestañas múltiples y haciendo fallback grácil (memory cache) en navegadores que bloqueen IndexedDB o LocalStorage.

## Contexto técnico
- Stack: Firebase JS SDK v10+.
- Los componentes UI ya interactúan a través de `appService.ts`.
- La instanciación de Firestore ocurre en `src/lib/firebase.ts`. Es crítico que `initializeFirestore` se llame antes que cualquier `getFirestore()`.
- Hay un riesgo operativo de escrituras offline conflictivas que será mitigado parcialmente asegurando el uso de `serverTimestamp()` para las actualizaciones, aunque el alcance de esta tarea es estrictamente la inicialización.
- La investigación de Perplexity sobre inicialización robusta, fallbacks y multi-tab cache ya está guardada en `docs/sprints/sprint-09-research.md`.

## Caja de archivos
Archivos autorizados para modificación:
- `src/lib/firebase.ts`
- `src/lib/appService.ts` (si hubiese llamadas a `getFirestore` aisladas)

## Criterios de done
- [x] Refactorizar `src/lib/firebase.ts` para usar `initializeFirestore` con `persistentMultipleTabManager`.
- [x] Implementar un guard para comprobar el acceso a `localStorage` antes de inicializar la persistencia.
- [x] Implementar un bloque `try/catch` que haga fallback a `memoryLocalCache()` si el navegador bloquea IndexedDB.
- [x] Compilación sin errores TypeScript.

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-29
- [x] Rama creada: feat/T-037-persistencia-offline
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
