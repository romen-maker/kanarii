# Task-006: Rellenar displayName/email/photoURL al unirse por invitación y corregir redirección directa tras unirse

## Objetivo
Asegurar que al unirse a una comunidad mediante un código de invitación se registre correctamente el documento del miembro en `community_members` con sus datos personales (`displayName`, `email`, `photoURL`), se asigne la comunidad principal si no tiene una y se redirija al usuario directamente a la página de la comunidad.

## Contexto técnico
- `useInvitacion` en `src/lib/appService.ts` procesa el canje del código de invitación. Actualmente solo añade la comunidad a `communityIds` del usuario y no crea el miembro en la colección `community_members`.
- En `src/pages/ComunidadesView.tsx`, al canjear el código correctamente, se redirige a `/` (home) en lugar de `/c/{communityId}`.
- Si el usuario ya es miembro de la comunidad, se lanza un error `YA_ES_MIEMBRO`, el cual debe incluir el `communityId` para poder redirigir al usuario a su comunidad en lugar del home.

## Caja de archivos
Archivos autorizados para modificación:
- `src/lib/appService.ts`
- `src/pages/ComunidadesView.tsx`

## Criterios de done
- [x] `useInvitacion` comprueba si el usuario existe y propaga correctamente el miembro a `community_members` (usando datos de perfil/onboarding si existen, o los datos base del usuario).
- [x] `useInvitacion` establece el campo `communityId` principal en el documento del usuario en `users/{uid}` si no estaba definido.
- [x] `useInvitacion` devuelve una `Promise<string>` con el `communityId` (slug) de la comunidad a la que se ha unido.
- [x] Al lanzar el error `YA_ES_MIEMBRO` en `useInvitacion`, se incluye la propiedad `communityId` en el objeto de error para permitir la redirección.
- [x] En `ComunidadesView.tsx`, tras canjear el código con éxito, el usuario es redirigido directamente a la vista de la comunidad (`/c/{communityId}`).
- [x] En `ComunidadesView.tsx`, si el canje falla con `YA_ES_MIEMBRO`, se redirige al usuario directamente a la vista de la comunidad (`/c/{communityId}`).
- [x] Compilación sin errores TypeScript.

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-24 20:00
- [x] Rama creada: feat/T-006-invitation-improvements
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente

