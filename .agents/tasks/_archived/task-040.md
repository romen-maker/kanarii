# Task-040: Indicador visual online/offline y cambios pendientes de subir

## Objetivo
Implementar un indicador en el Sidebar que muestre el estado de sincronización de Firestore (conectado, sincronizando, offline) y muestre un contador de escrituras pendientes utilizando un hook personalizado.

## Contexto técnico
- Basado en docs/sprints/sprint-10-research.md.
- Firestore no tiene API pública para obtener el número de escrituras pendientes, por lo que crearemos un hook `useFirestoreSync.ts` con un wrapper `trackWrite` para llevar el conteo en memoria de escrituras locales, combinándolo con `onSnapshotsInSync` y `navigator.onLine`.
- Se omitirá `disableNetwork(db)` automático en redes inestables (fincas rurales) para permitir que el SDK de Firestore auto-gestione la reconexión.
- El componente `SyncIndicator.tsx` usará iconos de `lucide-react` (Wifi, WifiOff, RefreshCw, CheckCircle2) y se renderizará en el Sidebar.

## Caja de archivos
Archivos autorizados para modificación:
- `src/lib/services/syncTracker.ts` [NEW]
- `src/hooks/useFirestoreSync.ts` [NEW]
- `src/components/ui/SyncIndicator.tsx` [NEW]
- `src/components/Sidebar.tsx` [MODIFY]
- `src/components/BottomNav.tsx` [MODIFY]
- `src/lib/services/fichas.ts` [MODIFY]
- `src/hooks/useServicioActions.ts` [MODIFY]
- `docs/sprints/sprint-10.md` [MODIFY]

## Criterios de done
- [x] Implementar tracker global de sincronización en memoria (`src/lib/services/syncTracker.ts`) sin dependencias de React para evitar ciclos.
- [x] Implementar hook `useFirestoreSync` (`src/hooks/useFirestoreSync.ts`) que combine el estado de red (`navigator.onLine`), el tracker de escrituras en memoria, y `onSnapshotsInSync`.
- [x] Implementar el componente visual `SyncIndicator` (`src/components/ui/SyncIndicator.tsx`) que use Lucide y el tema visual del proyecto.
- [x] Integrar `SyncIndicator` en la barra lateral desktop (`src/components/Sidebar.tsx`) debajo del selector de comunidad.
- [x] Integrar `SyncIndicator` en el menú de navegación móvil (`src/components/BottomNav.tsx`) dentro del drawer "Más" debajo del selector de comunidad.
- [x] Envolver escrituras críticas en `src/lib/services/fichas.ts` usando `syncTracker.trackWrite()`.
- [x] Envolver promesas de acción de servicios en `src/hooks/useServicioActions.ts` usando `syncTracker.trackWrite()`.
- [x] Compilación sin errores TypeScript.
- [x] Verificación de funcionamiento visual/funcional de red en el navegador.

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-06-02T17:10:00Z (aprobado con correcciones de tracker y nav móvil)
- [x] Rama creada: feat/T-040-sync-indicator-offline
- [x] Lock activo: feat/T-040-sync-indicator-offline
- [x] Sesión cerrada correctamente
