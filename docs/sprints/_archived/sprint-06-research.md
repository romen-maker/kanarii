# Research Sprint 06
> Fuente: Perplexity — 27/05/2026
> Tarea principal: T-027 — Directorio de decisiones con filtros por estado y badge "requiere tu atención" en PropuestasView

## Hallazgos clave & Decisiones tomadas

### 1. La query para el badge
- **Decisión:** `listenPropuestasPendientesCount` con query directa + filtro client-side (no desnormalizar en `pendingUserIds[]`).
- **Por qué:** En comunidades de 10-100 personas el número de propuestas abiertas simultáneas es muy pequeño (< 20). Descargarlas todas con `status == 'abierta'` en tiempo real y filtrarlas en cliente por `!userPositions[userId]` es trivial, 100% consistente y libre de bugs de sincronización.
- **Implementación del listener en propuestas.ts:**
  ```typescript
  export function listenPropuestasPendientesCount(
    communityId: string,
    userId: string,
    onCount: (count: number) => void,
    onError?: (err: Error) => void
  ): () => void {
    const q = query(
      colPropuestas,
      where('communityId', '==', communityId),
      where('status', '==', 'abierta'),
      limit(DEFAULT_LIST_LIMIT)
    );
    return subscribeToCollection(q, (propuestas: Propuesta[]) => {
      const pendientes = propuestas.filter(p => !p.userPositions?.[userId]);
      onCount(pendientes.length);
    }, `propuestas-pendientes/${communityId}`, onError);
  }
  ```

### 2. UX: Kanban + filtros + vista lista sin sobrecarga visual
- **Decisión:**
  - **Filtros (chips de estado):** Solo aparecen en vista Lista. El Kanban no muestra filtros de estado ya que las columnas mismas actúan como filtros por estado.
  - **Vista Lista:** Reutiliza los mismos datos en memoria desde el hook `usePropuestas` (sin hacer una nueva query a Firestore).
  - **Preferencias:** Guardar el modo de vista (`kanban` vs `list`) en `localStorage`.
  - **Toolbar:** Contiene el toggle Kanban/Lista + badge interactivo "N requieren atención" (que actúa como filtro rápido).

## Descartado
- **Campo `pendingUserIds[]` desnormalizado:** Descartado por complejidad excesiva de mantenimiento y riesgo de desincronización de datos.
- **Filtros de estado en vista Kanban:** Descartado por redundancia visual con las propias columnas del Kanban.
