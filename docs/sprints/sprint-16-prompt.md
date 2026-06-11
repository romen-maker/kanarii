# Sprint 16 — Resumen y Prompt Perplexity

## Prompt para Perplexity (copiar y pegar)

```
CONTEXTO: Estoy desarrollando Kanarii, una app de gestión comunitaria soberana con gobernanza sociocrática (S3), marketplace de intercambio y perfiles con análisis de personalidad. Es una PWA.
STACK: React 18 + TypeScript + Firebase (Firestore, Auth) + Vite + Tailwind CSS v4.

SITUACIÓN ACTUAL:
- Marketplace funcional con catálogo de servicios, acuerdos (crear/cerrar/feedback), y vista detalle con historial.
- El modelo Acuerdo tiene campos: solicitanteId, proveedorId, status, historial[], fechaPropuesta, etc.
- No existe campo vistoPorSolicitante ni mecanismo de "leído/no leído".
- Los badges de navegación (Sidebar/BottomNav) usan hooks con listeners onSnapshot.
- Sidebar.tsx (14.5KB) y BottomNav.tsx (11.1KB) tienen listeners que podrían estar duplicados o redundantes.
- Ya existe un hook useAcuerdos.ts y un servicio acuerdos.ts en src/lib/services/.
- Patrón de badges existente: useNotificaciones.ts para menciones en Tablón, usePropuestas.ts para propuestas que requieren atención.

TAREA DE ESTA SEMANA:
1. Implementar sistema "leído/no leído" en acuerdos del Marketplace: cuando el status de un acuerdo cambia, el solicitante debe ver un badge hasta que visite "Mis Acuerdos". Campo vistoPorSolicitante: boolean en Firestore.
2. Badge reactivo en Sidebar/BottomNav que cuente acuerdos no vistos por el solicitante.
3. Auditoría y limpieza de listeners duplicados entre Sidebar.tsx y BottomNav.tsx.

NECESITO INVESTIGAR:
1. ¿Cuál es el patrón más eficiente en Firestore para "marcar como leído" un conjunto de documentos al entrar a una vista? ¿batch write vs writeBatch vs individual updates? ¿Impacto en costes de escritura?
2. ¿Es mejor usar un campo booleano simple (vistoPorSolicitante) o un timestamp (lastSeenBySolicitante) para detectar cambios no leídos? Trade-offs de cada enfoque para el caso de un acuerdo que cambia de status múltiples veces.
3. Best practices para consolidar listeners onSnapshot redundantes entre dos componentes React (Sidebar y BottomNav) que comparten datos similares. ¿Context vs hook compartido vs zustand?
4. ¿Existe algún patrón Firebase recomendado para "unread count" eficiente sin hacer un count() en cada render?

FORMATO DE RESPUESTA ESPERADO:
- Comparativa de enfoques para cada punto (tabla con pros/contras/coste Firebase).
- Ejemplo de código TypeScript para el patrón elegido de "mark as read" con batch.
- Recomendación concreta sobre booleano vs timestamp con justificación.
- Snippet de patrón para consolidar listeners entre componentes hermanos.
```
