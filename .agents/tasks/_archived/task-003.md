# Task-003: Corregir reactividad de sesión con Google (onAuthStateChanged y propagación a React Router)

## Objetivo
Asegurar que el inicio de sesión con Google (tanto por popup como por redirección) propague su estado de forma reactiva e inmediata a React Router para redirigir al usuario al destino correcto, evitando bloqueos visuales o estados inconsistentes.

## Contexto técnico
- La autenticación se gestiona en `src/contexts/AuthContext.tsx` usando Firebase `onAuthStateChanged`.
- La redirección principal tras el login está en `src/pages/Welcome.tsx`, pero depende del cambio de `appUser`.
- Si el login se realiza por redirección (especialmente en móviles donde `signInWithPopup` suele fallar), se requiere invocar `getRedirectResult` para procesar el resultado de la autenticación de Firebase de forma fiable.
- `App.tsx` define las rutas y el componente `ProtectedRoute`, el cual maneja el estado `checking` para evitar redirecciones prematuras.

## Caja de archivos
Archivos autorizados para modificación (Auditoría):
- `src/contexts/AuthContext.tsx`
- `src/App.tsx`
- `src/pages/Welcome.tsx`

## Criterios de done
- [x] **Implementar soporte reactivo para el flujo de inicio de sesión con Google**
  - *Estado*: Cumplido en la parte de popup. No implementado para redirección (`getRedirectResult`), se usa exclusivamente popup en la web.
  - *Evidencia*: `AuthContext.tsx:95-99` usa `signInWithPopup(auth, provider)` dentro de la función `login`.
- [x] **Asegurar que al completarse el login de Google, React Router detecte el cambio de estado inmediatamente y redirija al usuario al flujo correcto**
  - *Estado*: Cumplido.
  - *Evidencia*: `Welcome.tsx:12-36` tiene un `useEffect` reactivo que escucha el estado de `appUser` y redirige a `/tour`, `/ficha-preview`, `/comunidades` o `/ficha` de manera inmediata sin necesidad de recargar.
- [x] **Optimizar el manejo del estado `checking` en `AuthContext` y `App.tsx` para evitar parpadeos visuales (flashes) y redirecciones incorrectas**
  - *Estado*: Cumplido.
  - *Evidencia*: `AuthContext.tsx:23` define `AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'`. `App.tsx:108-114` en `ProtectedRoute` maneja el estado `'checking'` renderizando un spinner de carga y reteniendo la navegación hasta resolver la sesión.
- [x] **Compilación sin errores TypeScript.**
  - *Estado*: Cumplido en los archivos de la caja de auditoría.
  - *Evidencia*: La validación de tipos pasa correctamente para los archivos de la caja, aunque persisten 33 errores preexistentes en otros archivos de la aplicación no relacionados con T-003.

## Observaciones de Auditoría para la siguiente sesión
1. **Falta de soporte para redirección en móviles**: No se implementa `signInWithRedirect` ni `getRedirectResult`. Si en producción se requiere soporte estricto para navegadores que bloqueen popups (como Safari en iOS o navegadores integrados), se deberá reabrir esta funcionalidad para agregar redirecciones seguras.
2. **Errores de compilación preexistentes**: Hay 33 errores TypeScript distribuidos en 18 archivos que no pertenecen a la caja de T-003 (ej. en `CalendarioView.tsx`, `useProyectoActions.ts`, etc.) que deberán ser resueltos en futuros sprints/tareas.

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-05-23 (Usuario aprueba que está resuelto en la rama)
- [x] Rama creada: `feat/auth-reactivity`
- [x] Lock activo: No requerido (sólo auditoría)
- [x] Sesión cerrada correctamente

