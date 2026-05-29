# Research Sprint 09
> Fuente: Perplexity — 2026-05-29
> Tarea principal: Activar persistencia offline de Firestore (IndexedDB) con estrategia segura (T-037)

## Hallazgos clave
- **API correcta (SDK v10+)**: `enableIndexedDbPersistence()` está DEPRECADA. Usar `initializeFirestore(app, { localCache: persistentLocalCache({...}) })`.
- **Manejo Multi-Tab**: Es obligatorio en Kanarii usar `persistentMultipleTabManager()`, si no, la segunda pestaña abierta falla silenciosamente (`failed-precondition`).
- **Navegadores sin soporte**: Safari en privado u otros que no dan acceso a IndexedDB lanzan `unimplemented`. Requiere fallback a `memoryLocalCache` para no romper la app.
- **LocalStorage requerido**: El manager multi-tab necesita LocalStorage para coordinar entre pestañas. Hay que hacer un guard de LocalStorage y fallback si está bloqueado.
- **Orden de inicialización**: `initializeFirestore` debe llamarse ANTES de cualquier `getFirestore()`.
- **Caché sin límite**: Por defecto no hay límite de tamaño; se recomienda configurar `cacheSizeBytes: 50 * 1024 * 1024` (50MB).

## Decisiones tomadas
- **Decisión:** Implementar `initializeFirestore` con `persistentLocalCache` y tab manager múltiple. Fallback en memoria (`memoryLocalCache()`).
- **Por qué:** Asegura que los miembros puedan abrir múltiples pestañas sin colapsar, y que la app siga funcionando en Safari en modo incógnito.
- **Constraint clave:** Dependencia estricta de localStorage para multi-tab y orden de importación (`getFirestore()`).
- **Referencia:** Documentación oficial Firebase JS SDK v10+ y foros de comunidad.

## Descartado
- `enableIndexedDbPersistence()` (deprecada).
- `persistentSingleTabManager` (no soporta múltiples pestañas).

## Riesgo de conflictos offline
Escrituras offline al sincronizar pueden sobreescribir datos más recientes. Mitigación general en Kanarii: usar `serverTimestamp()` en todos los campos `updatedAt` para resolver conflictos en servidor. (Considerar revisar esto luego, pero la inicialización se hace ahora).
