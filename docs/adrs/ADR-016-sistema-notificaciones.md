# ADR-016: Sistema Base de Notificaciones

**Nota:** existe una colisión en ADR-013 (dos archivos con ese prefijo). Queda pendiente renombrar uno de ellos en una tarea de deuda técnica.

## Estado
Propuesto y Aprobado

## Contexto
En Kanarii, los usuarios necesitan estar al tanto de las menciones del tablón, nuevas propuestas y asignaciones de tareas. Para evitar la complejidad de consultar múltiples colecciones de forma síncrona o contar documentos bajo demanda en el cliente, necesitamos un sistema de notificaciones centralizado, liviano y con soporte para desnormalización de contadores.

## Decisión
Implementar un sistema de notificaciones con la siguiente estructura y reglas:

1. **Ruta en Firestore**:
   Subcolección dentro de `community_members`:
   `/community_members/{communityId}_{userId}/notificaciones/{notifId}`

2. **Estructura del Documento de Notificación**:
   ```typescript
   interface NotificacionKanarii {
     id: string;
     tipo: 'mencion_tablon' | 'propuesta_nueva' | 'tarea_asignada';
     referenciaId: string; // ID del post, propuesta o tarea
     leida: boolean;
     creadaAt: Timestamp;
     meta?: {
       autorNombre: string;
       excerpt: string; // Primeras palabras del elemento
     };
   }
   ```

3. **Desnormalización del Contador**:
   Para evitar contar documentos no leídos (lo que generaría lecturas adicionales costosas), se introduce el campo `unreadNotifCount: number` en el documento del miembro (`community_members/{communityId}_{userId}`).
   - Este contador se incrementará cuando un trigger (o servicio) agregue una notificación.
   - Al marcar una notificación como leída, se utilizará una transacción de Firestore para restar `-1` de manera segura, impidiendo que el contador caiga por debajo de `0`.

4. **Reglas de Seguridad**:
   Se restringe el acceso a la subcolección `notificaciones` de tal forma que solo el usuario autenticado propietario de la membresía pueda leer o actualizar sus notificaciones.

## Consecuencias
- **Ventajas**:
  - Lecturas optimizadas en el cliente gracias al contador `unreadNotifCount` precalculado.
  - Mayor seguridad y privacidad al encapsular las notificaciones dentro de la colección de membresías del usuario.
  - Escalable a otros tipos de notificaciones a través del campo `tipo`.
- **Desventajas**:
  - Requiere transacciones al marcar como leída para asegurar que el contador desnormalizado sea consistente.
