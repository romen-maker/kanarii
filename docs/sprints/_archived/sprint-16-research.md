# Research Sprint 16
> Fuente: Perplexity + Decisiones de diseño de la sesión — 11/06/2026
> Tareas relacionadas: T-069, T-070, T-071

## Decisiones técnicas y de diseño para Acuerdos No Leídos

### 1. Campo `solicitanteLastSeenAt: Timestamp | null` en lugar de booleanos
Se descarta `vistoPorSolicitante: boolean` porque no maneja bien cambios de estado sucesivos. Con un timestamp comparamos `acuerdo.updatedAt > acuerdo.solicitanteLastSeenAt` para detectar si hay actualizaciones sin leer posteriores a la última visita.
* `null` significa que el acuerdo nunca ha sido visto por el solicitante.

### 2. Provider Contextual Único: `AcuerdosProvider`
Para evitar listeners onSnapshot redundantes en Sidebar y BottomNav (T-071), implementamos `AcuerdosContext` y `AcuerdosProvider` en `src/contexts/AcuerdosContext.tsx`.
* Consumidores como Sidebar, BottomNav y la propia vista usan hooks simples (`useAcuerdosBadge`, `useAcuerdosCtx`) que consumen del contexto común, reduciendo a 1 el número de listeners concurrentes.

### 3. Marcación de Vistos en Batch desde Caché
Para ahorrar lecturas Firestore, la vista `MisAcuerdosView` invoca `marcarAcuerdosVistosDesdeCache(acuerdos, uid)` pasando la lista que el context ya tiene en memoria. Actualiza únicamente los documentos modificados usando `writeBatch`.

### 4. Firestore Rules
El solicitante debe poder modificar únicamente su campo `solicitanteLastSeenAt` al marcar el acuerdo como leído.
Regla a implementar en `firestore.rules`:
```
allow update: if request.auth.uid == resource.data.solicitanteId
  && request.resource.data.diff(resource.data).affectedKeys()
     .hasOnly(['solicitanteLastSeenAt']);
```
