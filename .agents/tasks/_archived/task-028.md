# Task-028: Limpiar contexto de comunidad activa al logout (evitar acceso residual multi-comunidad)

## Objetivo
Limpiar el contexto de la comunidad activa y cualquier dato persistente de la misma en el cliente cuando el usuario cierra sesión (logout), previniendo el acceso no autorizado a datos residuales o inconsistencias de estado si un nuevo usuario inicia sesión en la misma pestaña/navegador.

## Contexto técnico
- Al cerrar sesión, el estado de la comunidad activa debe resetearse a su valor por defecto (ej: `null` o vaciarse).
- El storage a limpiar es `sessionStorage` (clave `kanarii_current_community_id`), no `localStorage`.
- Se debe verificar que no haya ninguna otra clave en `localStorage` relacionada con la comunidad antes de asumir que solo es `sessionStorage`.
- Los archivos principales involucrados son `src/contexts/AuthContext.tsx` (que maneja el cierre de sesión de Firebase Auth) y `src/contexts/ComunidadContext.tsx` (que gestiona el estado de la comunidad activa).

## Caja de archivos
Archivos autorizados para modificación:
- `src/contexts/AuthContext.tsx`
- `src/contexts/ComunidadContext.tsx`

## Criterios de done
- [x] Resetear el estado de la comunidad activa en `ComunidadContext.tsx` al desloguearse.
- [x] Limpiar la clave `kanarii_current_community_id` en `sessionStorage` al hacer logout.
- [x] Verificar que no haya ninguna otra clave en `localStorage` relacionada con comunidad, y si la hay, limpiarla.
- [x] Asegurar que el flujo de logout en `AuthContext.tsx` dispare la limpieza de comunidad de forma segura.
- [x] Compilación sin errores TypeScript.

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-28 12:09
- [x] Rama creada: feat/T-028-logout-cleanup
- [x] Lock activo: .agent-session.lock
- [ ] Sesión cerrada correctamente
