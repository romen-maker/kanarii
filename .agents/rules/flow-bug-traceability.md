---
description: Cuando se resuelve un bug en producción relacionado con
un flujo de usuario, el agente debe actualizar docs/critical-flows.md
con el caso de borde detectado y el estado de cobertura.
---

# Rule: flow-bug-traceability

## Cuándo aplica

Siempre que se cierre una tarea que:
- Corrija un bug detectado en producción (no en local/dev)
- Modifique lógica de permisos en `firestore.rules`
- Modifique campos obligatorios de un documento en Firestore
- Añada o cambie un `onSnapshot` listener o su manejo de errores
- Cambie la lógica de resolución de nombres de usuario

## Protocolo obligatorio (antes del commit de cierre)

1. Abrir `docs/critical-flows.md`
2. Identificar qué flujo cubre el bug resuelto (F-001 a F-00N)
3. Si el flujo existe:
   - Añadir el caso de borde bajo `**Casos de borde conocidos:**`
   - Formato: `- [descripción breve] *(Bug detectado YYYY-MM-DD: [resumen] — resuelto con [fix])*`
   - Actualizar el estado de cobertura si se añadió un test
4. Si el flujo NO existe:
   - Crear una nueva sección siguiendo el patrón del documento
   - Numerarla como F-00N (siguiente número disponible)
5. Incluir `docs/critical-flows.md` en el commit de cierre de la tarea

## Qué NO hacer

- ❌ No crear el test en este momento si no estaba en el plan aprobado
- ❌ No marcar cobertura como ✅ si el test no existe todavía
- ✅ Sí actualizar de ⬜ a 🟡 si el fix actúa como guardia parcial

## Ejemplo

Bug: admin global no puede leer /solicitudes → permission-denied
Flujo afectado: F-003 (Admin global opera en cualquier comunidad)
Acción: añadir caso de borde + actualizar cobertura de ⬜ a 🟡
