# Task-009: Corregir sincronización y visualización del perfil de usuario (`displayName`/`email`/`photoURL`) en el Sidebar y miembros de la comunidad

## Objetivo
Resolver la inconsistencia de datos del perfil de usuario (`displayName`, `photoURL`, `email`) en la barra lateral (Sidebar) y en todas las membresías de comunidad (`community_members/{communityId}_{userId}`) a las que pertenece el usuario, optimizando además las lecturas concurrentes de `listenAppUser`.

## Contexto técnico
- `_writeFichaRaw` lee `displayName` de `/users/{uid}` pero ese documento nunca se actualiza al editar la ficha en el onboarding.
- `listenAppUser` en `AuthContext.tsx` consulta `fichas` y `profiles` en cada snapshot de `/users/{uid}`, generando 2 lecturas innecesarias por cada cambio de dicho documento.
- Cuando el usuario actualiza su perfil, los cambios se deben propagar a `/users/{uid}` y, a través de una función `syncUserProfileFields` (en batch), a todas las membresías en `/community_members` en las que participa el usuario (usando sus `communityIds` registrados).
- El Sidebar debe renderizar el avatar (`photoURL`) y el `displayName` de forma reactiva, priorizando los datos actualizados del `appUser`.

## Caja de archivos
Archivos autorizados para modificación:
- `src/lib/appService.ts`
- `src/contexts/AuthContext.tsx`
- `src/components/Sidebar.tsx`
- `src/pages/Welcome.tsx`
- `scripts/migrate-profile-sync.ts` [NEW]

## Criterios de done
- [x] Al guardar la ficha (`saveFicha`/`_writeFichaRaw`), actualizar `/users/{userId}` con el `displayName` y `photoURL` de la ficha.
- [x] Propagar en batch (hasta 500 operaciones) el `displayName`, `photoURL` y `email` modificados a todos los documentos de membresía del usuario `/community_members/{communityId}_{userId}` correspondientes a sus `communityIds`.
- [x] Optimizar `listenAppUser` en `appService.ts` para que no realice lecturas redundantes y acopladas de `fichas` y `profiles` en cada snapshot de `/users/{uid}`.
- [x] Asegurar que el Sidebar (`Sidebar.tsx`) renderice de forma reactiva el `displayName` y el avatar (`photoURL`) correcto usando `appUser` del contexto de autenticación.
- [x] Asegurar que `src/pages/Welcome.tsx` renderice reactivamente el `displayName` y `photoURL` correcto de `appUser`.
- [x] Crear el script de migración `scripts/migrate-profile-sync.ts` para propagar `displayName`, `photoURL` y `email` de `/users/{uid}` (con `hasFicha: true`) a `/community_members/{communityId}_{userId}`.
- [x] Ejecutar el script contra el emulador/producción y verificar los resultados.
- [x] Confirmar que no hay errores de TypeScript ni advertencias en consola al compilar y ejecutar.
## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-25T15:00:00+01:00
- [x] Rama creada: feat/T-009-user-profile-sync
- [x] Lock activo: sí
- [x] Sesión cerrada correctamente

