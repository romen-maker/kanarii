# Task-017: Fix: displayName vacío al re-entrar por invitación tras expulsión

## Objetivo
Corregir el bug donde `displayName` queda vacío en `community_members` al unirse o re-entrar a una comunidad mediante invitación o solicitud de acceso, copiando y sincronizando el nombre del perfil (`profile`) o fallback adecuado desde `/users/{uid}`.

## Contexto técnico
- Al remover a un miembro, se elimina su membresía en `community_members`.
- Al re-entrar canjeando un código (`useInvitacion` en `invitaciones.ts`), uniéndose directamente (`unirseComunidadDirecto` en `members.ts`), o aprobando solicitud (`resolverSolicitud` en `solicitudes.ts`), el campo `displayName` en `community_members` se inicializa a veces con valores vacíos si `/users/{uid}` tiene `displayName` vacío.
- Se debe sincronizar el `displayName` de la membresía con `profileData.nombre` o fallback, y actualizar `/users/{uid}` si tiene el nombre vacío pero el perfil sí lo tiene.

## Caja de archivos
Archivos autorizados para modificación:
- `src/lib/services/invitaciones.ts`
- `src/lib/services/members.ts`
- `src/lib/services/solicitudes.ts`

## Criterios de done
- [x] En `invitaciones.ts` (canjear código), inicializar `displayName` en `community_members` usando el nombre del perfil o el `displayName` del usuario, evitando cadenas vacías si hay datos disponibles.
- [x] En `members.ts` (`unirseComunidadDirecto`), inicializar `displayName` en `community_members` usando la misma lógica robusta de resolución de nombre.
- [x] En `solicitudes.ts` (`resolverSolicitud`), inicializar `displayName` en `community_members` usando la misma lógica robusta.
- [x] En los tres flujos, si el `/users/{uid}` existe pero tiene `displayName` vacío o nulo, actualizarlo con el nombre resuelto del perfil/ficha de manera proactiva.
- [x] Compilación sin errores TypeScript y validación de imports.

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-26 16:35:24
- [x] Rama creada: feat/T-017-fix-displayname-vacio
- [x] Lock activo: .agent-session.lock creado
- [x] Sesión cerrada correctamente

