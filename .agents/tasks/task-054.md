# T-054 — Notificaciones de solicitudes de conexión pendientes

## Estado
🔵 Pendiente — sprint-12

## Descripción
Completar el flujo de conexiones iniciado en T-052. Actualmente, cuando
el usuario A envía una solicitud de conexión al usuario B, B no tiene
ningún lugar en la UI donde ver que tiene solicitudes pendientes.
Esta tarea cierra ese gap.

## Criterios de done
- [ ] Badge numérico en el menú lateral junto a un ítem "Conexiones" (o integrado en un ítem existente) que muestre las solicitudes pendientes recibidas por el usuario activo
- [ ] Vista o panel /conexiones (o sección en Mi Ficha) que liste las solicitudes recibidas con estado 'pending' donde receiverId === currentUser.uid
- [ ] Botones "Aceptar" y "Rechazar" en cada solicitud que llamen a acceptConnection() y deleteConnection() del servicio existente
- [ ] Al aceptar, el estado cambia a 'connected' en tiempo real (el documento en Firestore ya tiene el ID compuesto correcto)
- [ ] Al rechazar, el documento se elimina
- [ ] Sin usar window.confirm ni alert — usar useToast para feedback

## Archivos probablemente afectados
- src/hooks/usePendingConnections.ts — NUEVO hook que consulta connections donde receiverId === uid y status === 'pending'
- src/lib/services/connections.ts — añadir subscribeToPendingConnections()
- src/pages/ o src/components/ — vista o panel de solicitudes recibidas
- Menú lateral (sidebar) — badge de solicitudes pendientes

## Notas técnicas
- El ID compuesto es [userA, userB].sort().join('_'), determinista y bidireccional. La query para el receptor debe filtrar por receiverId, no por el ID del documento.
- La suscripción en tiempo real ya está implementada como patrón en useMemberConnection.ts — seguir el mismo patrón.
- Reglas de Firestore: verificar que un usuario puede leer connections donde receiverId === su uid.

## Tamaño estimado: M
